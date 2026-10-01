import { h, $, debounce, throttle, toast, icon, seg } from './ui.js';
import { TABS } from './tabs/index.js';

// Какие изменения оформления не требуют перерисовки страницы (меняются только переменные CSS / атрибуты)
const STYLE_ONLY = new Set([
  'palette', 'colors', 'fonts', 'textSize', 'headingSize', 'headingCase', 'headingWeight', 'buttonStyle', 'buttonShape',
  'cards', 'density', 'width', 'icons', 'head', 'kicker', 'mediaShape', 'grain', 'motion', 'ticker', 'radius',
]);
const PARTS = ['design', 'content', 'contact', 'media'];
const HISTORY_LIMIT = 80;

async function api(url, options) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Ошибка запроса');
  return json;
}

// ═══════════════ Состояние редактора ═══════════════

export class Editor {
  constructor(config, site) {
    this.config = config;
    this.site = site;
    this.ui = { tab: 'ai', open: new Set(['hero']) };
    this.listeners = {};
    this.dirty = new Set();
    this.needReload = false;
    this.history = [this.snapshot()];
    this.pos = 0;
    this.lastCoalesce = { key: null, at: 0 };
    this.tokensSeq = 0;
    this.saving = false;
    this.tabOffs = [];
    this.flush = debounce(() => this.save(), 450);
    this.sendTokens = throttle(() => this.pushTokens(), 70);
  }

  get design() { return this.site.design; }
  get content() { return this.site.content; }
  get contact() { return this.site.contact; }
  get media() { return this.site.media; }
  get template() { return this.config.templates.find((t) => t.id === this.site.design.template); }

  on(event, fn) { (this.listeners[event] ??= []).push(fn); return () => { this.listeners[event] = this.listeners[event].filter((f) => f !== fn); }; }
  emit(event, data) { (this.listeners[event] ?? []).forEach((fn) => fn(data)); }
  onTab(event, fn) { this.tabOffs.push(this.on(event, fn)); }
  clearTab() { this.tabOffs.forEach((off) => off()); this.tabOffs = []; }

  snapshot() {
    return Object.fromEntries(PARTS.map((p) => [p, JSON.stringify(this.site[p])]));
  }

  /**
   * Применяет правку. mutate(site) меняет объект на месте.
   * coalesce — ключ: частые правки одного поля (набор текста, ползунок) склеиваются в один шаг истории.
   */
  commit(mutate, { coalesce = null, external = false } = {}) {
    const before = this.history[this.pos];
    mutate(this.site);
    const after = this.snapshot();
    const changed = PARTS.filter((p) => before[p] !== after[p]);
    if (!changed.length) return;

    // история
    const now = Date.now();
    const merge = coalesce && this.lastCoalesce.key === coalesce && now - this.lastCoalesce.at < 1200 && this.pos === this.history.length - 1;
    if (merge) this.history[this.pos] = after;
    else {
      this.history = this.history.slice(0, this.pos + 1);
      this.history.push(after);
      if (this.history.length > HISTORY_LIMIT) this.history.shift();
      this.pos = this.history.length - 1;
    }
    this.lastCoalesce = { key: coalesce, at: now };

    changed.forEach((p) => this.dirty.add(p));
    const structural = changed.some((p) => p !== 'design') || this.designStructural(JSON.parse(before.design), JSON.parse(after.design));
    if (structural) this.needReload = true;
    else this.sendTokens();
    this.flush();
    this.emit('change', { changed, structural });
    this.emit('history');
    if (external) this.emit('sync');
  }

  designStructural(a, b) {
    if (a.template !== b.template || a.art !== b.art) return true;
    return JSON.stringify(a.layouts) !== JSON.stringify(b.layouts);
  }

  restore(snap) {
    for (const p of PARTS) this.site[p] = JSON.parse(snap[p]);
    PARTS.forEach((p) => this.dirty.add(p));
    this.needReload = true;
    this.flush();
    this.emit('history');
    this.emit('sync');
  }

  undo() { if (this.pos > 0) { this.pos -= 1; this.lastCoalesce = { key: null, at: 0 }; this.restore(this.history[this.pos]); } }
  redo() { if (this.pos < this.history.length - 1) { this.pos += 1; this.lastCoalesce = { key: null, at: 0 }; this.restore(this.history[this.pos]); } }
  get canUndo() { return this.pos > 0; }
  get canRedo() { return this.pos < this.history.length - 1; }

  async pushTokens() {
    const seq = ++this.tokensSeq;
    try {
      const res = await api(`/api/sites/${this.site.id}/tokens`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design: this.site.design }),
      });
      if (seq !== this.tokensSeq) return; // пришёл устаревший ответ
      this.site.tokens = res.tokens;
      this.emit('tokens', res);
    } catch { /* следующий вызов исправит */ }
  }

  async save() {
    if (this.saving) { this.flush(); return; }
    if (!this.dirty.size) return;
    this.saving = true;
    this.emit('status', 'saving');
    const parts = [...this.dirty];
    this.dirty.clear();
    const reload = this.needReload;
    this.needReload = false;
    try {
      const body = Object.fromEntries(parts.map((p) => [p, this.site[p]]));
      const saved = await api(`/api/sites/${this.site.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      this.site.tokens = saved.tokens;
      this.site.updatedAt = saved.updatedAt;
      // сервер мог поправить данные (обрезать, отбросить лишнее) — принимаем его версию, если локально нет новых правок
      if (!this.dirty.size) {
        for (const p of parts) this.site[p] = saved[p];
        this.history[this.pos] = this.snapshot();
      }
      this.emit('status', this.dirty.size ? 'saving' : 'saved');
      if (reload && !this.dirty.size) this.emit('reload');
      else if (reload) this.needReload = true;
    } catch (err) {
      parts.forEach((p) => this.dirty.add(p));
      this.needReload ||= reload;
      this.emit('status', 'error');
      toast(`Не удалось сохранить: ${err.message}`);
    } finally {
      this.saving = false;
      if (this.dirty.size) this.flush();
    }
  }

  /** Результат правки ИИ и прочие «внешние» обновления контента. */
  adopt(site) {
    this.commit((s) => { s.content = site.content; }, { external: true });
    this.site.revisions = site.revisions;
  }

  // Загрузка картинки. slot: logo | hero | about | gallery
  async upload(slot, file) {
    const blob = await shrinkImage(file, slot);
    const res = await fetch(`/api/sites/${this.site.id}/media/${slot}`, { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Не удалось загрузить');
    // сервер уже сохранил медиа (и при необходимости секцию «Галерея»)
    this.commit((s) => { s.media = json.site.media; s.content = json.site.content; }, { external: true });
    this.dirty.delete('media'); this.dirty.delete('content');
    this.site.uploadedUrl = json.url;
    this.emit('reload');
    return json.url;
  }
}

/** Уменьшаем фото в браузере: быстрее грузится и меньше весит скачанный сайт. */
async function shrinkImage(file, slot) {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error('Поддерживаются JPG, PNG, WebP и GIF');
  if (file.type === 'image/gif') return file;
  const max = slot === 'logo' ? 700 : 1800;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const k = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (k === 1 && file.size < 900 * 1024) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const keepAlpha = slot === 'logo' || file.type === 'image/png';
  const type = keepAlpha ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((r) => canvas.toBlob(r, type, 0.86));
  return blob && blob.size < file.size ? blob : file;
}

// ═══════════════ Предпросмотр ═══════════════

const DEVICES = { desktop: 1280, tablet: 820, mobile: 390 };

class Preview {
  constructor(editor) {
    this.ed = editor;
    this.device = window.innerWidth < 1000 ? 'mobile' : 'desktop';
    this.ver = 0;
    this.scrollY = 0;
    this.active = 0;
    this.pending = null;
    this.frames = [0, 1].map(() => h('iframe', {
      class: 'pv-frame', title: 'Предпросмотр сайта', sandbox: 'allow-scripts allow-popups allow-popups-to-escape-sandbox',
    }));
    this.stage = h('div', { class: 'pv-stage' }, ...this.frames);
    this.busy = h('div', { class: 'pv-busy', hidden: true }, h('span', { class: 'spin' }));
    this.root = h('div', { class: 'pv' }, this.stage, this.busy);
    this.onMessage = (e) => this.handleMessage(e);
    window.addEventListener('message', this.onMessage);
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(this.root);
    this.frames[0].classList.add('on');
    this.frames[0].src = this.url();
  }

  url() { return `/s/${this.ed.site.id}?preview=1&v=${++this.ver}`; }

  destroy() { window.removeEventListener('message', this.onMessage); this.ro.disconnect(); }

  setDevice(device) { this.device = device; this.layout(); }

  layout() {
    const w = this.root.clientWidth;
    const hgt = this.root.clientHeight;
    if (!w || !hgt) return;
    const lw = DEVICES[this.device];
    const pad = this.device === 'desktop' ? 0 : 28;
    const scale = Math.min(1, (w - pad * 2) / lw);
    const heightPx = (hgt - pad * 2) / scale;
    this.stage.dataset.device = this.device;
    for (const f of this.frames) {
      f.style.width = `${lw}px`;
      f.style.height = `${heightPx}px`;
      f.style.transform = `scale(${scale})`;
      f.style.left = `${Math.max(0, (w - lw * scale) / 2)}px`;
      f.style.top = `${pad}px`;
    }
  }

  get current() { return this.frames[this.active]; }

  /** Загружаем новую версию во «внутренний» iframe и подменяем без мерцания. */
  reload() {
    const next = this.frames[1 - this.active];
    const token = ++this.ver;
    this.pending = token;
    next.src = `/s/${this.ed.site.id}?preview=1&v=${token}`;
    const swap = () => {
      if (this.pending !== token) return;
      this.pending = null;
      next.contentWindow?.postMessage({ ws: 'scrollTo', y: this.scrollY }, '*');
      next.classList.add('on');
      this.current.classList.remove('on');
      this.active = 1 - this.active;
      this.busy.hidden = true;
    };
    this.swapNow = swap;
    this.fallback = setTimeout(swap, 3500);
    this.busy.hidden = false;
  }

  sendTokens(css, attrs) {
    this.current.contentWindow?.postMessage({ ws: 'tokens', css, attrs }, '*');
  }

  focus(sec) {
    this.current.contentWindow?.postMessage({ ws: 'focus', sec }, '*');
  }

  handleMessage(e) {
    const idx = this.frames.findIndex((f) => f.contentWindow === e.source);
    if (idx === -1) return;
    const m = e.data;
    if (!m || typeof m !== 'object') return;
    if (m.ws === 'ready' && idx !== this.active && this.pending) { clearTimeout(this.fallback); this.swapNow?.(); }
    if (m.ws === 'scroll' && idx === this.active) this.scrollY = m.y;
    if (m.ws === 'select' && idx === this.active) this.ed.emit('select', String(m.sec));
  }
}

// ═══════════════ Окно редактора ═══════════════

export function mountEditor(root, config, site, { onExit }) {
  const ed = new Editor(config, site);
  const preview = new Preview(ed);

  const status = h('span', { class: 'ed-status' }, 'Сохранено');
  ed.on('status', (s) => { status.textContent = s === 'saving' ? 'Сохраняю…' : s === 'error' ? 'Ошибка сохранения' : 'Сохранено'; status.dataset.s = s; });

  const undoBtn = h('button', { class: 'ib', title: 'Отменить (Ctrl+Z)', onClick: () => ed.undo() }, icon('undo'));
  const redoBtn = h('button', { class: 'ib', title: 'Повторить (Ctrl+Shift+Z)', onClick: () => ed.redo() }, icon('redo'));
  const syncHistory = () => { undoBtn.disabled = !ed.canUndo; redoBtn.disabled = !ed.canRedo; };
  ed.on('history', syncHistory);
  syncHistory();

  const devices = seg(
    [['desktop', icon('desktop'), 'Компьютер'], ['tablet', icon('tablet'), 'Планшет'], ['mobile', icon('mobile'), 'Телефон']],
    preview.device, (d) => preview.setDevice(d), { cls: 'devices' },
  );

  const url = () => `${location.origin}/s/${ed.site.id}`;
  const top = h('header', { class: 'ed-top' },
    h('button', { class: 'ed-back', onClick: () => onExit(), title: 'К началу' }, icon('back'), h('span', null, 'Websiter')),
    h('div', { class: 'ed-title' }, h('b', null, ''), status),
    h('div', { class: 'ed-tools' }, undoBtn, redoBtn),
    devices,
    h('div', { class: 'ed-actions' },
      h('a', { class: 'btn btn-line btn-sm', href: `/s/${site.id}`, target: '_blank', rel: 'noopener' }, icon('external', 16), 'Открыть'),
      h('a', { class: 'btn btn-line btn-sm', href: `/s/${site.id}/download`, download: '' }, icon('download', 16), 'Скачать'),
      h('button', { class: 'btn btn-ink btn-sm', onClick: async () => {
        try { await navigator.clipboard.writeText(url()); toast('Ссылка скопирована'); } catch { window.prompt('Скопируйте ссылку:', url()); }
      } }, icon('link', 16), 'Ссылка'),
    ),
  );
  const setTitle = () => { $('b', top).textContent = ed.content.brand.name.replace(/\*/g, ''); };
  setTitle();
  ed.on('change', setTitle);

  // вкладки
  const panel = h('aside', { class: 'ed-panel' });
  const rail = h('nav', { class: 'ed-rail', role: 'tablist' });
  const open = (id) => {
    ed.ui.tab = id;
    [...rail.children].forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'));
    renderPanel();
  };
  const renderPanel = () => {
    ed.clearTab();
    const tab = TABS.find((t) => t.id === ed.ui.tab) ?? TABS[0];
    const body = h('div', { class: 'ed-panel-in' }, h('h3', { class: 'ed-ph' }, tab.title ?? tab.label), tab.render(ed));
    panel.replaceChildren(body);
  };
  for (const t of TABS) {
    rail.append(h('button', { class: 'rail-b', role: 'tab', dataset: { tab: t.id }, 'aria-selected': t.id === ed.ui.tab ? 'true' : 'false', onClick: () => open(t.id) }, icon(t.icon, 20), h('span', null, t.label)));
  }

  ed.on('sync', renderPanel);
  ed.on('reload', () => preview.reload());
  ed.on('tokens', ({ css, attrs }) => preview.sendTokens(css, attrs));
  ed.on('select', (sec) => {
    ed.ui.tab = 'texts';
    ed.ui.open = new Set([sec]);
    open('texts');
    requestAnimationFrame(() => panel.querySelector(`[data-acc="${sec}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  });
  ed.preview = preview;

  const keys = (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && document.activeElement.type !== 'range' && document.activeElement.type !== 'checkbox') return;
    e.preventDefault();
    if (e.shiftKey) ed.redo(); else ed.undo();
  };
  document.addEventListener('keydown', keys);

  root.replaceChildren(h('div', { class: 'ed' }, top, h('div', { class: 'ed-body' }, rail, panel, h('section', { class: 'ed-preview' }, preview.root))));
  renderPanel();
  preview.layout();

  return {
    editor: ed,
    destroy() {
      ed.flush.flush();
      preview.destroy();
      document.removeEventListener('keydown', keys);
    },
  };
}
