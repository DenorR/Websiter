import { icon } from './icons.js';
import { renderArt } from '../art.js';

// ───────────── Утилиты ─────────────

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Экранирует текст и превращает *слово* в <em> (акцентное слово в заголовке). */
export const rich = (value) => esc(value).replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

/** Для атрибутов и мест, где разметка недопустима — убираем звёздочки. */
export const plain = (value) => String(value ?? '').replace(/\*([^*\n]+)\*/g, '$1');

const nn = (i) => String(i + 1).padStart(2, '0');
const paragraphs = (text) =>
  String(text ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const lines = (text) =>
  String(text ?? '').split('\n').map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

const SVG_ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
export const ARR = `<svg class="arr" ${SVG_ATTR}><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const ARR_UR = `<svg class="go" ${SVG_ATTR}><path d="M7 17 17 7M8 7h9v9"/></svg>`;

const telHref = (phone) => 'tel:' + String(phone).replace(/[^\d+]/g, '');

// ───────────── Соцсети ─────────────

export const SOCIALS = [
  ['telegram', 'Telegram', (v) => `https://t.me/${v}`, /^[A-Za-z0-9_]{3,40}$/],
  ['whatsapp', 'WhatsApp', (v) => `https://wa.me/${v}`, /^\d{7,15}$/],
  ['instagram', 'Instagram', (v) => `https://instagram.com/${v}`, /^[A-Za-z0-9_.]{2,40}$/],
  ['vk', 'VK', (v) => `https://vk.com/${v}`, /^[A-Za-z0-9_.]{2,40}$/],
];

export function socialLinks(contact) {
  return SOCIALS.filter(([key, , , re]) => contact[key] && re.test(contact[key])).map(([key, label, url]) => ({
    key, label, href: url(contact[key]),
  }));
}

export function ctaHref(contact) {
  const social = socialLinks(contact);
  const find = (k) => social.find((s) => s.key === k)?.href;
  switch (contact.primary) {
    case 'phone': return contact.phone ? telHref(contact.phone) : '#contact';
    case 'telegram': return find('telegram') ?? '#contact';
    case 'whatsapp': return find('whatsapp') ?? '#contact';
    default: return '#contact';
  }
}

// ───────────── Блоки ─────────────

const sectionId = (s) => `s-${s.type}`;

function iconBlock(it, i) {
  return `<span class="ic"><span class="ic-svg">${icon(it.icon, 28)}</span><span class="ic-num">${nn(i)}</span></span>`;
}

function mediaFig(r, slot, cls = '') {
  const url = r.media[slot];
  let inner = '';
  if (url) inner = `<img src="${esc(url)}" alt="" loading="${slot === 'hero' ? 'eager' : 'lazy'}" decoding="async">`;
  else if (r.art !== 'none') inner = renderArt(r.art, `${r.seed}:${slot}`, { initial: r.initial });
  return inner ? `<figure class="media ${cls}">${inner}</figure>` : '';
}

// ── Навигация ──

function navLinks(r) {
  return r.navItems.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
}

function brand(r) {
  const { logo, logoMode } = r.media;
  const name = esc(plain(r.c.brand.name));
  const img = logo ? `<img src="${esc(logo)}" alt="">` : '';
  const text = !logo || logoMode !== 'logo' ? `<span>${name}</span>` : '';
  return `<a class="brand${r.res.flags.brandDot ? ' brand-dot' : ''}" href="#top" aria-label="${name}">${img}${text}</a>`;
}

export function renderNav(r) {
  const cta = `<a class="btn btn-primary nav-cta" href="${esc(r.ctaHref)}">${esc(plain(r.c.hero.primaryCta))}</a>`;
  const burger = `<button class="burger" type="button" aria-label="${esc(r.c.labels.menu)}" aria-expanded="false"><span>${esc(r.c.labels.menu)}</span><i></i></button>`;
  const v = r.res.layouts.nav;
  if (v === 'center') {
    const half = Math.ceil(r.navItems.length / 2);
    const left = r.navItems.slice(0, half).map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
    const right = r.navItems.slice(half).map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
    return `<header class="nav nav-center"><div class="container nav-in"><nav class="links l">${left}</nav>${brand(r)}<div class="nav-r"><nav class="links">${right}</nav>${cta}</div>${burger}</div></header>`;
  }
  return `<header class="nav nav-${v}"><div class="container nav-in">${brand(r)}<nav class="links">${navLinks(r)}</nav>${cta}${burger}</div></header>`;
}

export function renderMenu(r) {
  const items = [...r.navItems, { href: '#contact', label: r.c.contact.navLabel }];
  const foot = [r.contact.phone, r.contact.email, r.contact.address].filter(Boolean).map((v) => `<span>${esc(v)}</span>`).join('');
  return `<div class="menu" id="menu"><div class="container"><ol class="menu-links">${items
    .map((n, i) => `<li><a href="${esc(n.href)}"><span>${nn(i)}</span>${esc(n.label)}</a></li>`)
    .join('')}</ol><div class="menu-foot">${foot}</div></div></div>`;
}

// ── Первый экран ──

function heroActions(r) {
  const h = r.c.hero;
  const second = h.secondaryCta ? `<a class="btn btn-ghost" href="#${esc(r.firstSectionId)}">${esc(plain(h.secondaryCta))}</a>` : '';
  return `<div class="actions"><a class="btn btn-primary" href="${esc(r.ctaHref)}">${esc(plain(h.primaryCta))}${ARR}</a>${second}</div>`;
}

function hlRow(r) {
  const list = r.c.hero.highlights;
  if (!list.length) return '';
  return `<div class="hl-row">${list
    .map((h, i) => `<div class="hl rv" style="--i:${i}">${iconBlock(h, i)}<strong>${esc(plain(h.title))}</strong>${h.text ? `<span class="t">${esc(h.text)}</span>` : ''}</div>`)
    .join('')}</div>`;
}

function heroCopy(r, { withActions = true } = {}) {
  const h = r.c.hero;
  return `${h.eyebrow ? `<span class="eyebrow">${esc(h.eyebrow)}</span>` : ''}<h1>${rich(h.headline)}</h1><p class="lead">${esc(h.subheadline)}</p>${withActions ? heroActions(r) : ''}`;
}

export function renderHero(r) {
  const v = r.res.layouts.hero;
  const h = r.c.hero;
  const hasImg = !!r.media.hero;
  switch (v) {
    case 'center': {
      const m = mediaFig(r, 'hero', 'band-media');
      return `<section class="hero hero-center" id="top" data-sec="hero"><div class="container">${heroCopy(r)}${m}${hlRow(r)}</div></section>`;
    }
    case 'editorial': {
      const m = mediaFig(r, 'hero', 'band-media');
      return `<section class="hero hero-ed" id="top" data-sec="hero"><div class="container">
<div class="hero-meta"><span>${esc(h.eyebrow || r.c.brand.tagline)}</span><b>${esc(plain(r.c.brand.name))}</b><span>${esc(r.year)}</span></div>
<h1>${rich(h.headline)}</h1>
<div class="hero-foot"><p class="lead">${esc(h.subheadline)}</p>${heroActions(r)}</div>
${m}${hlRow(r)}</div></section>`;
    }
    case 'poster': {
      const m = mediaFig(r, 'hero', 'poster-art');
      return `<section class="hero hero-poster" id="top" data-sec="hero"><div class="container">${heroCopy(r)}${hlRow(r)}</div>${m}${h.eyebrow ? `<div class="sticker">${esc(h.eyebrow)}</div>` : ''}</section>`;
    }
    case 'fullbleed': {
      const m = r.media.hero
        ? `<img src="${esc(r.media.hero)}" alt="">`
        : r.art !== 'none' ? renderArt(r.art, `${r.seed}:hero`, { initial: r.initial }) : '';
      return `<section class="hero hero-full${hasImg ? ' has-img' : ''}" id="top" data-sec="hero"><div class="hero-bg">${m}</div><div class="container">${heroCopy(r)}${hlRow(r)}</div></section>`;
    }
    case 'stack': {
      const art = r.art !== 'none' && !hasImg ? renderArt(r.art, `${r.seed}:hero`, { initial: r.initial }) : hasImg ? `<img class="art" src="${esc(r.media.hero)}" alt="">` : '';
      const tiles = h.highlights
        .map((x, i) => `<div class="hl rv" style="--i:${i}">${iconBlock(x, i)}<strong>${esc(plain(x.title))}</strong>${x.text ? `<span class="t">${esc(x.text)}</span>` : ''}</div>`)
        .join('');
      return `<section class="hero hero-stack" id="top" data-sec="hero"><div class="container">${h.eyebrow ? `<span class="pill">${esc(h.eyebrow)}</span>` : ''}<h1>${rich(h.headline)}</h1><p class="lead">${esc(h.subheadline)}</p>${heroActions(r)}
<div class="hero-board"><div class="board-top"><i></i><i></i><i></i><span>${esc(plain(r.c.brand.name).toLowerCase().replace(/\s+/g, '-'))}.app</span></div><div class="board-body">${art}${tiles}</div></div></div></section>`;
    }
    default: {
      const m = mediaFig(r, 'hero');
      return `<section class="hero hero-split" id="top" data-sec="hero"><div class="container"><div class="hero-grid"><div class="hero-copy">${heroCopy(r)}</div>${m}</div>${hlRow(r)}</div></section>`;
    }
  }
}

export function renderTicker(r) {
  const words = (r.c.hero.keywords?.length ? r.c.hero.keywords : r.c.sections.find((s) => s.type === 'features')?.items.map((i) => i.title) ?? [])
    .map(plain).filter(Boolean).slice(0, 8);
  if (!words.length) return '';
  const run = words.map((w) => `<span>${esc(w)}</span>`).join('');
  return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${run}${run}${run}${run}</div></div>`;
}

// ── Секции ──

function sectionHead(r, s, n) {
  return `<header class="sh"><span class="kicker rv"><i>${nn(n)}</i><b>${esc(plain(s.navLabel || s.title))}</b></span><h2 class="rv">${rich(s.title)}</h2>${s.subtitle ? `<p class="sub rv">${esc(s.subtitle)}</p>` : ''}</header>`;
}

function features(r, s, lay) {
  const items = s.items;
  const n = items.length;
  switch (lay) {
    case 'rows':
      return `<ol class="f-rows">${items.map((it, i) => `<li class="rv" style="--i:${i}"><span class="n">${nn(i)}</span><h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p>${ARR_UR}</li>`).join('')}</ol>`;
    case 'bento':
      return `<div class="f-bento" data-n="${n}">${items.map((it, i) => `<article class="tile rv" style="--i:${i}">${iconBlock(it, i)}<div><h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></div></article>`).join('')}</div>`;
    case 'columns':
      return `<div class="f-cols" data-n="${n}">${items.map((it, i) => `<article class="col rv" style="--i:${i}"><span class="n">${nn(i)}</span><h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></article>`).join('')}</div>`;
    case 'tiles':
      return `<div class="f-tiles">${items.map((it, i) => `<article class="tile c${i % 4} rv" style="--i:${i}"><span class="n">${nn(i)}</span>${ARR_UR}<h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></article>`).join('')}</div>`;
    default:
      return `<div class="f-grid" data-n="${n}">${items.map((it, i) => `<article class="card cardlike rv" style="--i:${i}">${iconBlock(it, i)}<h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></article>`).join('')}</div>`;
  }
}

function facts(r, s) {
  if (!s.items.length) return '';
  return `<ul class="facts">${s.items
    .map((it, i) => `<li class="rv" style="--i:${i}">${iconBlock(it, i)}<div><h3>${esc(plain(it.title))}</h3>${it.text ? `<p>${esc(it.text)}</p>` : ''}</div></li>`)
    .join('')}</ul>`;
}

function about(r, s, lay) {
  const paras = paragraphs(s.text);
  const p = (list) => list.map((t) => `<p>${rich(t)}</p>`).join('');
  if (lay === 'statement') {
    const [first, ...rest] = paras;
    return `<div class="ab-state"><p class="big rv">${rich(first ?? '')}</p>${rest.length ? `<div class="ab-cols rv">${p(rest)}</div>` : ''}${s.items.length ? `<ul class="tags rv">${s.items.map((it) => `<li>${esc(plain(it.title))}</li>`).join('')}</ul>` : ''}</div>`;
  }
  if (lay === 'media') {
    const m = mediaFig(r, 'about');
    if (m) return `<div class="ab-media">${m}<div class="ab-text rv">${p(paras)}${facts(r, s)}</div></div>`;
  }
  return `<div class="ab-split"><div class="ab-text rv">${p(paras)}</div>${facts(r, s)}</div>`;
}

function process(r, s, lay) {
  const items = s.items;
  switch (lay) {
    case 'timeline':
      return `<ol class="p-line">${items.map((it, i) => `<li class="rv" style="--i:${i}"><span class="dot">${i + 1}</span><h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></li>`).join('')}</ol>`;
    case 'cards':
      return `<ol class="p-cards">${items.map((it, i) => `<li class="cardlike rv" style="--i:${i}"><span class="step-n">${i + 1}</span><h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></li>`).join('')}</ol>`;
    default:
      return `<ol class="p-num">${items.map((it, i) => `<li class="rv" style="--i:${i}"><span class="big">${nn(i)}</span><h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></li>`).join('')}</ol>`;
  }
}

function pricing(r, s, lay) {
  const label = esc(plain(r.c.hero.primaryCta));
  switch (lay) {
    case 'menu':
      return `<ul class="pr-menu">${s.items.map((it, i) => `<li class="rv" style="--i:${i}"><div class="m-head"><h3>${esc(plain(it.title))}</h3><span class="m-dots"></span>${it.meta ? `<span class="m-price">${esc(it.meta)}</span>` : ''}</div><p class="m-text">${esc(lines(it.text).join(' · '))}</p></li>`).join('')}</ul>`;
    case 'table':
      return `<div class="pr-table">${s.items.map((it, i) => `<div class="r rv" style="--i:${i}"><h3>${esc(plain(it.title))}</h3><p>${esc(lines(it.text).join(' · '))}</p><span class="price">${esc(it.meta)}</span><a class="btn btn-ghost" href="#contact">${label}</a></div>`).join('')}</div>`;
    default:
      return `<div class="pr-cards">${s.items.map((it, i) => `<article class="plan cardlike rv" style="--i:${i}"><h3>${esc(plain(it.title))}</h3>${it.meta ? `<div class="price">${esc(it.meta)}</div>` : ''}<ul>${lines(it.text).map((l) => `<li>${icon('check', 18)}<span>${esc(l)}</span></li>`).join('')}</ul><a class="btn btn-primary" href="#contact">${label}</a></article>`).join('')}</div>`;
  }
}

function faq(r, s, lay) {
  if (lay === 'grid') {
    return `<div class="faq-grid">${s.items.map((it, i) => `<div class="qa cardlike rv" style="--i:${i}"><h3>${esc(plain(it.title))}</h3><p>${esc(it.text)}</p></div>`).join('')}</div>`;
  }
  const cls = lay === 'split' ? 'faq-split' : 'faq-acc';
  return `<div class="${cls}">${s.items.map((it, i) => `<details class="rv" style="--i:${i}"><summary>${esc(plain(it.title))}</summary><p>${esc(it.text)}</p></details>`).join('')}</div>`;
}

function cta(r, s, lay) {
  const label = esc(plain(s.buttonLabel || r.c.hero.primaryCta));
  const text = s.text || s.subtitle;
  if (lay === 'big') {
    return `<div class="cta-big rv"><h2>${rich(s.title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}<a class="cta-link" href="${esc(r.ctaHref)}">${label}${ARR}</a></div>`;
  }
  if (lay === 'poster') {
    return `<div class="cta-poster rv"><h2>${rich(s.title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}<a class="btn btn-primary" href="${esc(r.ctaHref)}">${label}${ARR}</a></div>`;
  }
  return `<div class="cta-band rv"><div><h2>${rich(s.title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div><a class="btn btn-primary" href="${esc(r.ctaHref)}">${label}${ARR}</a></div>`;
}

function manifesto(r, s) {
  return `<div class="mf"><span class="kicker rv"><i>—</i><b>${esc(plain(s.navLabel || s.title))}</b></span><p class="rv">${rich(s.text || s.title)}</p></div>`;
}

function gallery(r, s, lay) {
  const pics = (r.media.gallery ?? []).map((u, i) => `<figure class="rv" style="--i:${i % 6}"><img src="${esc(u)}" alt="" loading="lazy" decoding="async"></figure>`).join('');
  if (!pics) return '';
  const cls = lay === 'strip' ? 'g-strip' : lay === 'mosaic' ? 'g-mosaic' : 'g-grid';
  return `<div class="${cls}">${pics}</div>`;
}

export function renderSection(r, s, idx, num) {
  const lay = s.layout && r.isLayout(s.type, s.layout) ? s.layout : r.res.layouts[s.type];
  const noHead = s.type === 'cta' || s.type === 'manifesto';
  const side = s.type === 'faq' && lay === 'split';
  let body = '';
  switch (s.type) {
    case 'features': body = features(r, s, lay); break;
    case 'about': body = about(r, s, lay); break;
    case 'process': body = process(r, s, lay); break;
    case 'pricing': body = pricing(r, s, lay); break;
    case 'faq': body = faq(r, s, lay); break;
    case 'cta': body = cta(r, s, lay); break;
    case 'manifesto': body = manifesto(r, s); break;
    case 'gallery': body = gallery(r, s, lay); break;
    default: body = '';
  }
  if (!body) return '';
  const alt = r.res.flags.alt && r.altSet.has(idx) ? ' alt' : '';
  const head = noHead ? '' : sectionHead(r, s, num);
  return `<section class="sec sec-${s.type} lay-${lay}${alt}" id="${sectionId(s)}" data-sec="${s.type}"><div class="container${side ? ' has-side' : ''}">${head}${body}</div></section>`;
}

// ── Контакты ──

export function renderContact(r) {
  const { c, contact } = r;
  const labels = c.labels;
  const rows = [];
  if (contact.phone) rows.push(`<li><a href="${esc(telHref(contact.phone))}"><small>${esc(labels.phone)}</small><b>${esc(contact.phone)}</b></a></li>`);
  if (contact.email) rows.push(`<li><a href="mailto:${esc(contact.email)}"><small>${esc(labels.email)}</small><b>${esc(contact.email)}</b></a></li>`);
  if (contact.address) rows.push(`<li><div><small>${esc(labels.address)}</small><b>${esc(contact.address)}</b></div></li>`);
  if (contact.hours) rows.push(`<li><div><small>${esc(labels.hours)}</small><b>${esc(contact.hours)}</b></div></li>`);
  const social = socialLinks(contact);
  const socials = social.length ? `<div class="socials">${social.map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</div>` : '';

  const form = contact.email
    ? `<form class="ct-form rv" data-mailto="${esc(contact.email)}" data-subject="${esc(plain(c.brand.name))}">
<label>${esc(labels.formName)}<input name="name" required maxlength="80" autocomplete="name"></label>
<label>${esc(labels.formMessage)}<textarea name="message" required maxlength="1500"></textarea></label>
<button class="btn btn-primary" type="submit">${esc(plain(c.contact.buttonLabel))}${ARR}</button></form>`
    : contact.phone
      ? `<div class="rv"><a class="btn btn-primary" href="${esc(telHref(contact.phone))}">${esc(plain(c.contact.buttonLabel))}${ARR}</a></div>`
      : '';

  const lay = r.res.layouts.contact;
  if (lay === 'big') {
    const mega = contact.email
      ? `<a class="ct-mega rv" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`
      : contact.phone ? `<a class="ct-mega rv" href="${esc(telHref(contact.phone))}">${esc(contact.phone)}</a>` : '';
    const cols = [
      contact.email && contact.phone ? `<div><small>${esc(labels.phone)}</small><b><a href="${esc(telHref(contact.phone))}">${esc(contact.phone)}</a></b></div>` : '',
      contact.address ? `<div><small>${esc(labels.address)}</small><b>${esc(contact.address)}</b></div>` : '',
      contact.hours ? `<div><small>${esc(labels.hours)}</small><b>${esc(contact.hours)}</b></div>` : '',
    ].filter(Boolean).join('');
    return `<section class="sec sec-contact lay-big" id="contact" data-sec="contact"><div class="container ct-big">
<span class="kicker rv"><i>${nn(r.sectionCount)}</i><b>${esc(plain(c.contact.navLabel))}</b></span>
<h2 class="rv" style="margin-top:1.15rem">${rich(c.contact.title)}</h2>
${c.contact.subtitle ? `<p class="ct-sub rv">${esc(c.contact.subtitle)}</p>` : ''}
${mega}${cols ? `<div class="ct-cols rv">${cols}</div>` : ''}${socials}${contact.email ? form : ''}</div></section>`;
  }
  return `<section class="sec sec-contact lay-split" id="contact" data-sec="contact"><div class="container ct-split">
<div><span class="kicker rv"><i>${nn(r.sectionCount)}</i><b>${esc(plain(c.contact.navLabel))}</b></span>
<h2 class="rv" style="margin-top:1.15rem">${rich(c.contact.title)}</h2>
${c.contact.subtitle ? `<p class="ct-sub rv">${esc(c.contact.subtitle)}</p>` : ''}
${rows.length ? `<ul class="ct-list rv">${rows.join('')}</ul>` : ''}${socials}</div>
${form ? `<div class="ct-box rv">${form}</div>` : ''}</div></section>`;
}

// ── Подвал ──

export function renderFooter(r) {
  const name = esc(plain(r.c.brand.name));
  const social = socialLinks(r.contact).map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('');
  const nav = r.navItems.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
  const copy = `<span>© ${esc(r.year)} ${name}. ${esc(r.c.labels.rights)}</span>`;
  const v = r.res.layouts.footer;
  if (v === 'big') {
    return `<footer class="ft ft-big"><div class="container"><div class="ft-in"><div class="ft-links">${nav}</div><div class="ft-links">${social}</div>${copy}</div><div class="ft-mega" aria-hidden="true">${name}</div></div></footer>`;
  }
  if (v === 'center') {
    return `<footer class="ft ft-center"><div class="container ft-in"><strong>${name}</strong><div class="ft-links">${nav}${social}</div>${copy}</div></footer>`;
  }
  return `<footer class="ft"><div class="container ft-in"><strong>${name}</strong><div class="ft-links">${social}</div>${copy}</div></footer>`;
}
