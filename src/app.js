import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { BusinessInput } from './schema.js';
import { renderSite } from './render/index.js';
import { THEMES, DEFAULT_THEME, publicThemes } from './render/themes.js';
import { AiError } from './ai.js';
import { createStore } from './store.js';
import { createRateLimiter } from './ratelimit.js';
import { mockGenerate, DEMO_INPUT } from './mock.js';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// CSP для сгенерированных сайтов: свои стили/скрипты и шрифты Google, больше ничего.
const SITE_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "script-src 'unsafe-inline'",
  "img-src data:",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join('; ');

const APP_CSP = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "frame-src 'self'",
  "base-uri 'none'",
  "frame-ancestors 'self'",
].join('; ');

const GenerateBody = z.object({
  themeId: z.string(),
  business: BusinessInput,
});
const ReviseBody = z.object({ instruction: z.string().trim().min(3, 'Опишите, что изменить').max(600) });
const PatchBody = z.object({
  themeId: z.string().optional(),
  accent: z.union([z.literal(''), z.string().regex(/^#[0-9a-fA-F]{6}$/)]).optional(),
});

const publicSite = (site) => ({
  id: site.id,
  createdAt: site.createdAt,
  themeId: site.themeId,
  accent: site.accent ?? '',
  content: site.content,
  input: site.input,
  demo: !!site.demo,
  revisions: site.revisions ?? 0,
});

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

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

/**
 * @param {object} deps
 * @param {object} deps.config
 * @param {{mode:string, generate:Function, revise:Function}} deps.generator
 */
export function createApp({ config, generator }) {
  const app = express();
  const store = createStore(config.dataDir);
  const limiter = createRateLimiter({ limit: config.rateLimitPerHour });

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' });
    next();
  });
  app.use(express.json({ limit: '32kb' }));

  // ── Настройки для фронтенда ──
  app.get('/api/config', (req, res) => {
    res.json({ mode: generator.mode, themes: publicThemes(), defaultTheme: DEFAULT_THEME });
  });

  app.get('/healthz', (req, res) => res.json({ ok: true, mode: generator.mode }));

  // ── Создание сайта ──
  app.post('/api/generate', async (req, res) => {
    const parsed = GenerateBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
    const { themeId, business } = parsed.data;
    if (!THEMES[themeId]) return res.status(400).json({ error: 'Неизвестный дизайн' });

    const gate = limiter.take(req.ip);
    if (!gate.ok) return tooMany(res, gate);

    await streamJob(req, res, {
      refund: () => limiter.refund(req.ip),
      work: async ({ onProgress, signal }) => {
        const content = await generator.generate({ input: business, themeId, onProgress, signal });
        const site = store.create({
          input: business,
          themeId,
          content,
          accent: '',
          demo: generator.mode === 'demo',
        });
        return publicSite(site);
      },
    });
  });

  // ── Правки по запросу клиента («сделай строже», «добавь тарифы» …) ──
  app.post('/api/sites/:id/revise', async (req, res) => {
    const site = store.get(req.params.id);
    if (!site) return res.status(404).json({ error: 'Сайт не найден' });
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
        const content = await generator.revise({
          input: site.input,
          themeId: site.themeId,
          content: site.content,
          instruction: parsed.data.instruction,
          onProgress,
          signal,
        });
        site.content = content;
        site.revisions = (site.revisions ?? 0) + 1;
        store.save(site);
        return publicSite(site);
      },
    });
  });

  // ── Чтение / смена дизайна ──
  app.get('/api/sites/:id', (req, res) => {
    const site = store.get(req.params.id);
    if (!site) return res.status(404).json({ error: 'Сайт не найден' });
    res.json(publicSite(site));
  });

  app.patch('/api/sites/:id', (req, res) => {
    const site = store.get(req.params.id);
    if (!site) return res.status(404).json({ error: 'Сайт не найден' });
    const parsed = PatchBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Некорректные данные' });
    const { themeId, accent } = parsed.data;
    if (themeId !== undefined) {
      if (!THEMES[themeId]) return res.status(400).json({ error: 'Неизвестный дизайн' });
      site.themeId = themeId;
    }
    if (accent !== undefined) site.accent = accent.toLowerCase();
    store.save(site);
    res.json(publicSite(site));
  });

  // ── Готовые сайты ──
  const sendSite = (res, site, { download = false } = {}) => {
    const html = renderSite({
      content: site.content,
      contact: pickContact(site.input),
      themeId: site.themeId,
      accent: site.accent,
    });
    res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': SITE_CSP, 'Cache-Control': 'no-cache' });
    if (download) {
      const name = `${slugify(site.content.brand.name) || 'site'}.html`;
      res.set('Content-Disposition', `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`);
    }
    res.send(html);
  };

  app.get('/s/:id', (req, res) => {
    const site = store.get(req.params.id);
    if (!site) return res.status(404).type('text/plain').send('Сайт не найден');
    sendSite(res, site);
  });

  app.get('/s/:id/download', (req, res) => {
    const site = store.get(req.params.id);
    if (!site) return res.status(404).type('text/plain').send('Сайт не найден');
    sendSite(res, site, { download: true });
  });

  // Живые превью дизайнов для шага выбора (на примере кофейни).
  const demoContent = mockGenerate(DEMO_INPUT);
  app.get('/demo/:themeId', (req, res) => {
    const theme = THEMES[req.params.themeId];
    if (!theme) return res.status(404).type('text/plain').send('Дизайн не найден');
    res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': SITE_CSP, 'Cache-Control': 'public, max-age=300' });
    res.send(renderSite({ content: demoContent, contact: pickContact(DEMO_INPUT), themeId: theme.id, accent: theme.defaultAccent }));
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

function pickContact(input) {
  return { phone: input.phone, email: input.email, address: input.address, hours: input.hours };
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
