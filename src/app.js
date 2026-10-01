import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { BusinessInput, normalizeContent, sanitizeStoredContent } from './schema.js';
import { renderSite, renderTokens } from './render/index.js';
import { TEMPLATES, DEFAULT_TEMPLATE, CATEGORIES, publicTemplates } from './templates/index.js';
import { publicFonts, resolveFontFile, fontFaceCss, FONTS } from './fonts.js';
import { ART_STYLES, renderArt } from './art.js';
import { ICONS } from './render/icons.js';
import { LAYOUT_OPTIONS, STYLE_OPTIONS, SECTION_LABELS, SECTION_TYPES } from './render/variants.js';
import { cleanDesign, cleanContact, cleanMedia, normalizeSite, resolveDesign } from './model.js';
import { sampleSite } from './samples.js';
import { AiError } from './ai.js';
import { createStore } from './store.js';
import { createRateLimiter } from './ratelimit.js';
import { inlineImages } from './export.js';
import { sniffImage, saveImage, readImage, FILE_RE, MIME, MAX_UPLOAD_BYTES, MAX_FILES_PER_SITE, MAX_GALLERY, SLOTS, deleteImage } from './uploads.js';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Сгенерированные сайты: свои стили/скрипты, шрифты и картинки с нашего домена — больше ничего.
const SITE_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "font-src 'self' data:",
  "script-src 'unsafe-inline'",
  "img-src 'self' data:",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join('; ');

const APP_CSP = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "frame-src 'self'",
  "base-uri 'none'",
  "frame-ancestors 'self'",
].join('; ');

const GenerateBody = z.object({
  templateId: z.string(),
  business: BusinessInput,
  design: z.any().optional(),
});
const ReviseBody = z.object({ instruction: z.string().trim().min(3, 'Опишите, что изменить').max(600) });

const publicSite = (site) => {
  const s = normalizeSite(site);
  return {
    id: s.id,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    content: s.content,
    design: s.design,
    contact: s.contact,
    media: s.media,
    input: s.input,
    tokens: resolveDesign(s).tokens,
    demo: !!s.demo,
    revisions: s.revisions ?? 0,
  };
};

const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

function openSse(res) {
  res.status(200).set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // не даём nginx буферизовать поток
  });
  res.flushHeaders();
  res.write(':ok\n\n');
  const heartbeat = setInterval(() => res.write(':hb\n\n'), 15000);
  res.on('close', () => clearInterval(heartbeat));
  return {
    send(event, data) {
      if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    },
    end() {
      clearInterval(heartbeat);
      if (!res.writableEnded) res.end();
    },
  };
}

/** Применяет черновик правок (из тела запроса) к записи сайта, ничего не сохраняя. */
function withDraft(site, body) {
  const next = { ...site };
  if (body.design !== undefined) next.design = cleanDesign(body.design);
  if (body.content !== undefined) next.content = sanitizeStoredContent(body.content, site.content.brand.name);
  if (body.contact !== undefined) next.contact = cleanContact(body.contact);
  if (body.media !== undefined) next.media = cleanMedia(body.media, new Set((site.uploads ?? []).map((u) => u.url)));
  return next;
}

/** После правки ИИ возвращаем то, чего ИИ не видит: скрытые блоки, свой вариант вёрстки, галерею. */
function mergeRevised(oldContent, newContent) {
  const prev = new Map(oldContent.sections.map((s) => [s.type, s]));
  const sections = newContent.sections.map((s) => {
    const o = prev.get(s.type);
    return o ? { ...s, ...(o.hidden ? { hidden: true } : {}), ...(o.layout ? { layout: o.layout } : {}) } : s;
  });
  const gallery = prev.get('gallery');
  if (gallery) {
    const at = sections.findIndex((s) => s.type === 'cta');
    sections.splice(at === -1 ? sections.length : at, 0, gallery);
  }
  return { ...newContent, sections };
}

/**
 * @param {object} deps
 * @param {object} deps.config
 * @param {{mode:string, generate:Function, revise:Function}} deps.generator
 */
export function createApp({ config, generator }) {
  const app = express();
  const store = createStore(config.dataDir);
  const limiter = createRateLimiter({ limit: config.rateLimitPerHour });
  const uploadLimiter = createRateLimiter({ limit: 120 });

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' });
    next();
  });
  app.use(express.json({ limit: '512kb' }));

  const getSite = (req, res) => {
    const site = store.get(req.params.id);
    if (!site) {
      res.status(404).json({ error: 'Сайт не найден' });
      return null;
    }
    return site;
  };

  // ── Настройки для фронтенда ──
  app.get('/api/config', (req, res) => {
    res.json({
      mode: generator.mode,
      defaultTemplate: DEFAULT_TEMPLATE,
      templates: publicTemplates(),
      categories: CATEGORIES,
      fonts: publicFonts(),
      layouts: LAYOUT_OPTIONS,
      styleOptions: STYLE_OPTIONS,
      art: Object.entries(ART_STYLES).map(([id, a]) => ({ id, label: a.label })),
      icons: ICONS,
      sectionTypes: SECTION_TYPES,
      sectionLabels: SECTION_LABELS,
      limits: { upload: MAX_UPLOAD_BYTES, gallery: MAX_GALLERY },
    });
  });

  // Превью стилей графики для редактора (SVG использует переменные CSS страницы)
  app.get('/api/art/:style', (req, res) => {
    if (!ART_STYLES[req.params.style]) return res.status(404).end();
    const seed = String(req.query.seed ?? 'x').slice(0, 40);
    const initial = String(req.query.initial ?? 'A').slice(0, 1);
    res.set({ 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
    res.send(renderArt(req.params.style, seed, { initial }));
  });

  app.get('/healthz', (req, res) => res.json({ ok: true, mode: generator.mode }));

  // ── Шрифты (свои, без Google) ──
  app.get('/fonts/css', (req, res) => {
    const ids = String(req.query.ids ?? '').split(',').filter((id) => FONTS[id]).slice(0, 40);
    res.set({ 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
    res.send(fontFaceCss(ids));
  });

  app.get('/fonts/:font/:file', (req, res) => {
    const full = resolveFontFile(req.params.font, req.params.file);
    if (!full) return res.status(404).end();
    res.set({
      'Content-Type': 'font/woff2',
      'Access-Control-Allow-Origin': '*', // iframe с песочницей запрашивает шрифты как «чужой» origin
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.sendFile(full);
  });

  // ── Создание сайта ──
  app.post('/api/generate', async (req, res) => {
    const parsed = GenerateBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
    const { templateId, business } = parsed.data;
    if (!TEMPLATES[templateId]) return res.status(400).json({ error: 'Неизвестный дизайн' });

    const gate = limiter.take(req.ip);
    if (!gate.ok) return tooMany(res, gate);

    await streamJob(req, res, {
      refund: () => limiter.refund(req.ip),
      work: async ({ onProgress, signal }) => {
        const content = await generator.generate({ input: business, templateId, onProgress, signal });
        const site = store.create({
          input: business,
          content,
          design: cleanDesign({ ...(parsed.data.design ?? {}), template: templateId }),
          contact: cleanContact({ phone: business.phone, email: business.email, address: business.address, hours: business.hours }),
          media: cleanMedia({}, new Set()),
          demo: generator.mode === 'demo',
        });
        return publicSite(site);
      },
    });
  });

  // ── Правки по запросу клиента («сделай строже», «добавь тарифы» …) ──
  app.post('/api/sites/:id/revise', async (req, res) => {
    const site = getSite(req, res);
    if (!site) return;
    const parsed = ReviseBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
    if ((site.revisions ?? 0) >= config.maxRevisionsPerSite) {
      return res.status(429).json({ error: 'Достигнут лимит правок для этого сайта. Создайте новый сайт.' });
    }
    const gate = limiter.take(req.ip);
    if (!gate.ok) return tooMany(res, gate);

    await streamJob(req, res, {
      refund: () => limiter.refund(req.ip),
      work: async ({ onProgress, signal }) => {
        const norm = normalizeSite(site);
        const content = await generator.revise({
          input: site.input,
          templateId: norm.design.template,
          content: norm.content,
          instruction: parsed.data.instruction,
          onProgress,
          signal,
        });
        site.content = mergeRevised(norm.content, content);
        site.revisions = (site.revisions ?? 0) + 1;
        store.save(site);
        return publicSite(site);
      },
    });
  });

  // ── Чтение / редактирование ──
  app.get('/api/sites/:id', (req, res) => {
    const site = getSite(req, res);
    if (site) res.json(publicSite(site));
  });

  app.patch('/api/sites/:id', (req, res) => {
    const site = getSite(req, res);
    if (!site) return;
    let next;
    try {
      next = withDraft(site, req.body ?? {});
    } catch (err) {
      return res.status(400).json({ error: err instanceof z.ZodError ? 'Некорректное содержимое сайта' : 'Некорректные данные' });
    }
    Object.assign(site, { design: next.design, content: next.content, contact: next.contact, media: next.media });
    store.save(site);
    res.json(publicSite(site));
  });

  // Мгновенное обновление предпросмотра: переменные CSS и атрибуты для черновика (без сохранения).
  app.post('/api/sites/:id/tokens', (req, res) => {
    const site = getSite(req, res);
    if (!site) return;
    try {
      res.json(renderTokens(withDraft(site, req.body ?? {})));
    } catch {
      res.status(400).json({ error: 'Некорректные данные' });
    }
  });

  // ── Загрузка картинок ──
  app.post(
    '/api/sites/:id/media/:slot',
    express.raw({ type: () => true, limit: MAX_UPLOAD_BYTES }),
    (req, res) => {
      const site = getSite(req, res);
      if (!site) return;
      const slot = req.params.slot;
      if (!SLOTS.includes(slot)) return res.status(400).json({ error: 'Неизвестный тип изображения' });
      if (!uploadLimiter.take(req.ip).ok) return res.status(429).json({ error: 'Слишком много загрузок. Подождите немного.' });

      const ext = sniffImage(req.body);
      if (!ext) return res.status(415).json({ error: 'Поддерживаются JPG, PNG, WebP и GIF' });

      const norm = normalizeSite(site);
      site.uploads ??= [];
      if (slot === 'gallery' && norm.media.gallery.length >= MAX_GALLERY) {
        return res.status(400).json({ error: `В галерее не больше ${MAX_GALLERY} фото` });
      }
      // Место закончилось — выкидываем самые старые файлы, на которые никто не ссылается
      if (site.uploads.length >= MAX_FILES_PER_SITE) {
        const used = new Set([norm.media.logo, norm.media.hero, norm.media.about, ...norm.media.gallery]);
        const stale = site.uploads.find((u) => !used.has(u.url));
        if (!stale) return res.status(400).json({ error: 'Слишком много загруженных файлов' });
        deleteImage(store, site.id, stale.file);
        site.uploads = site.uploads.filter((u) => u !== stale);
      }

      const saved = saveImage(store, site.id, req.body, ext);
      site.uploads.push({ file: saved.file, url: saved.url, size: saved.size });
      const media = { ...norm.media };
      if (slot === 'gallery') media.gallery = [...media.gallery, saved.url];
      else media[slot] = saved.url;
      site.media = cleanMedia(media, new Set(site.uploads.map((u) => u.url)));

      // Загрузили фото в галерею — показываем и блок «Галерея»
      if (slot === 'gallery') {
        const content = normalizeSite(site).content;
        if (!content.sections.some((s) => s.type === 'gallery')) {
          const at = content.sections.findIndex((s) => s.type === 'cta');
          const block = { type: 'gallery', navLabel: 'Галерея', title: 'Галерея', subtitle: '', text: '', buttonLabel: '', items: [] };
          content.sections.splice(at === -1 ? content.sections.length : at, 0, block);
          site.content = content;
        }
      }
      store.save(site);
      res.json({ url: saved.url, site: publicSite(site) });
    },
  );

  app.get('/u/:id/:file', (req, res) => {
    const { id, file } = req.params;
    if (!store.isValidId(id) || !FILE_RE.test(file)) return res.status(404).end();
    const buf = readImage(store, id, file);
    if (!buf) return res.status(404).end();
    res.set({
      'Content-Type': MIME[file.split('.').pop()],
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.send(buf);
  });

  // ── Готовые сайты ──
  const sendHtml = (res, html, { cache = 'no-cache', download } = {}) => {
    res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': SITE_CSP, 'Cache-Control': cache });
    if (download) res.set('Content-Disposition', `attachment; filename="${download}"; filename*=UTF-8''${encodeURIComponent(download)}`);
    res.send(html);
  };

  app.get('/s/:id', (req, res) => {
    const site = store.get(req.params.id);
    if (!site) return res.status(404).type('text/plain').send('Сайт не найден');
    sendHtml(res, renderSite(site, { preview: req.query.preview === '1' }));
  });

  app.get('/s/:id/download', (req, res) => {
    const site = store.get(req.params.id);
    if (!site) return res.status(404).type('text/plain').send('Сайт не найден');
    const name = `${slugify(site.content.brand.name) || 'site'}.html`;
    sendHtml(res, inlineImages(renderSite(site, { inline: true }), store), { download: name });
  });

  // Живые превью шаблонов для галереи (на примере подходящего бизнеса).
  app.get('/demo/:templateId', (req, res) => {
    const tpl = TEMPLATES[req.params.templateId];
    if (!tpl) return res.status(404).type('text/plain').send('Дизайн не найден');
    const palette = String(req.query.palette ?? 'auto');
    const site = sampleSite(tpl.sample, { design: { template: tpl.id, palette } });
    sendHtml(res, renderSite(site), { cache: 'public, max-age=300' });
  });

  // ── Статика интерфейса ──
  app.use(
    express.static(PUBLIC_DIR, {
      setHeaders(res, file) {
        if (file.endsWith('.html')) res.set('Content-Security-Policy', APP_CSP);
      },
    }),
  );

  // ── Ошибки ──
  app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Некорректный JSON' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Слишком большой запрос' });
    console.error('[server]', err);
    if (res.headersSent) return res.end();
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  });

  return app;
}

function firstIssue(error) {
  return error.issues[0]?.message ?? 'Некорректные данные';
}

function tooMany(res, gate) {
  res.set('Retry-After', String(gate.retryAfterSec));
  const minutes = Math.max(1, Math.ceil(gate.retryAfterSec / 60));
  return res.status(429).json({
    error: `Слишком много запросов. Попробуйте снова примерно через ${minutes} мин.`,
  });
}

/** Запускает долгую работу и стримит прогресс клиенту через Server-Sent Events. */
async function streamJob(req, res, { work, refund }) {
  const sse = openSse(res);
  const controller = new AbortController();
  // Клиент закрыл вкладку — не тратим деньги на генерацию, которую никто не увидит.
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });

  try {
    const site = await work({
      onProgress: (p) => sse.send('progress', p),
      signal: controller.signal,
    });
    sse.send('done', { site });
  } catch (err) {
    refund();
    if (err instanceof AiError) {
      sse.send('error', { message: err.message, code: err.code });
    } else {
      console.error('[job]', err);
      sse.send('error', { message: 'Не удалось собрать сайт. Попробуйте ещё раз.', code: 'internal' });
    }
  } finally {
    sse.end();
  }
}
