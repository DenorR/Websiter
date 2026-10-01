import { icon } from './icons.js';
import { THEMES, DEFAULT_THEME, BASE_CSS, fontLink, rootVars, onColor } from './themes.js';
import { validHex } from '../schema.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const paragraphs = (text) =>
  String(text ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

const lines = (text) =>
  String(text ?? '')
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

const telHref = (phone) => 'tel:' + String(phone).replace(/[^\d+]/g, '');
const sectionId = (s) => `s-${s.type}`;

const iconWrap = (name, size = 24) => `<span class="ico-wrap">${icon(name, size)}</span>`;

// ───────────── Секции ─────────────

function renderFeatures(s) {
  return `<div class="cards" data-n="${s.items.length}">${s.items
    .map(
      (it) => `<article class="card reveal">${iconWrap(it.icon)}<h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`,
    )
    .join('')}</div>`;
}

function renderAbout(s) {
  const facts = s.items.length
    ? `<div class="facts">${s.items
        .map(
          (it) =>
            `<div class="fact reveal">${iconWrap(it.icon, 20)}<div><h3>${esc(it.title)}</h3>${
              it.text ? `<p>${esc(it.text)}</p>` : ''
            }</div></div>`,
        )
        .join('')}</div>`
    : '';
  return `<div class="about"><div class="about-text reveal">${paragraphs(s.text)}</div>${facts}</div>`;
}

function renderProcess(s) {
  return `<div class="steps" data-n="${s.items.length}">${s.items
    .map(
      (it, i) =>
        `<div class="step reveal"><div class="step-n">${i + 1}</div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>`,
    )
    .join('')}</div>`;
}

function renderPricing(s, ctaLabel) {
  return `<div class="plans">${s.items
    .map(
      (it) => `<article class="plan reveal"><h3>${esc(it.title)}</h3>${
        it.meta ? `<div class="price">${esc(it.meta)}</div>` : ''
      }<ul>${lines(it.text)
        .map((l) => `<li>${icon('check', 18)}<span>${esc(l)}</span></li>`)
        .join('')}</ul><a class="btn btn-primary" href="#contact">${esc(ctaLabel)}</a></article>`,
    )
    .join('')}</div>`;
}

function renderFaq(s) {
  return `<div class="faq">${s.items
    .map((it) => `<details class="reveal"><summary>${esc(it.title)}</summary><p>${esc(it.text)}</p></details>`)
    .join('')}</div>`;
}

function renderCta(s, fallbackLabel) {
  return `<div class="cta-band reveal"><div><h2>${esc(s.title)}</h2>${
    s.text || s.subtitle ? `<p>${esc(s.text || s.subtitle)}</p>` : ''
  }</div><a class="btn btn-primary" href="#contact">${esc(s.buttonLabel || fallbackLabel)}</a></div>`;
}

function renderSection(s, index, ctx) {
  // Чередуем фон так, чтобы блок контактов (всегда без фона) шёл после «светлой» секции.
  const alt = (ctx.total - index) % 2 === 1 && s.type !== 'cta' ? ' alt' : '';
  const head =
    s.type === 'cta'
      ? ''
      : `<div class="section-head reveal"><h2>${esc(s.title)}</h2>${s.subtitle ? `<p>${esc(s.subtitle)}</p>` : ''}</div>`;
  let body = '';
  switch (s.type) {
    case 'features': body = renderFeatures(s); break;
    case 'about': body = renderAbout(s); break;
    case 'process': body = renderProcess(s); break;
    case 'pricing': body = renderPricing(s, ctx.primaryCta); break;
    case 'faq': body = renderFaq(s); break;
    case 'cta': body = renderCta(s, ctx.primaryCta); break;
  }
  return `<section class="section s-${s.type}${alt}" id="${sectionId(s)}"><div class="container">${head}${body}</div></section>`;
}

// ───────────── Контакты ─────────────

function renderContact(content, contact) {
  const { labels } = content;
  const rows = [];
  if (contact.phone)
    rows.push(
      `<a href="${esc(telHref(contact.phone))}">${iconWrap('phone', 20)}<span><small>${esc(labels.phone)}</small><b>${esc(contact.phone)}</b></span></a>`,
    );
  if (contact.email)
    rows.push(
      `<a href="mailto:${esc(contact.email)}">${iconWrap('mail', 20)}<span><small>${esc(labels.email)}</small><b>${esc(contact.email)}</b></span></a>`,
    );
  if (contact.address)
    rows.push(
      `<div>${iconWrap('pin', 20)}<span><small>${esc(labels.address)}</small><b>${esc(contact.address)}</b></span></div>`,
    );
  if (contact.hours)
    rows.push(
      `<div>${iconWrap('clock', 20)}<span><small>${esc(labels.hours)}</small><b>${esc(contact.hours)}</b></span></div>`,
    );

  // У статичного сайта нет сервера для форм — поэтому форма открывает почтовый клиент (mailto).
  const form = contact.email
    ? `<form class="contact-form reveal" data-mailto="${esc(contact.email)}" data-subject="${esc(content.brand.name)}">
        <label>${esc(labels.formName)}<input name="name" required maxlength="80" autocomplete="name"></label>
        <label>${esc(labels.formMessage)}<textarea name="message" required maxlength="1500"></textarea></label>
        <button class="btn btn-primary" type="submit">${esc(content.contact.buttonLabel)}</button>
      </form>`
    : contact.phone
      ? `<div class="reveal"><a class="btn btn-primary" href="${esc(telHref(contact.phone))}">${icon('phone', 20)} ${esc(content.contact.buttonLabel)}</a></div>`
      : '';

  return `<section class="section" id="contact"><div class="container">
    <div class="contact-grid${form ? '' : ' single'}">
      <div class="reveal">
        <h2>${esc(content.contact.title)}</h2>
        ${content.contact.subtitle ? `<p class="muted" style="margin-top:14px;font-size:1.06rem">${esc(content.contact.subtitle)}</p>` : ''}
        ${rows.length ? `<div class="contact-list">${rows.join('')}</div>` : ''}
      </div>
      ${form}
    </div></div></section>`;
}

// ───────────── Клиентский скрипт страницы ─────────────

const PAGE_JS = `
document.documentElement.classList.add('js');
(function(){
  var nav=document.querySelector('.nav');
  var burger=document.querySelector('.burger');
  if(burger)burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href').slice(1);var el=id?document.getElementById(id):document.body;
      if(!el)return;e.preventDefault();nav.classList.remove('open');
      el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
  var items=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    items.forEach(function(el){io.observe(el)});
    setTimeout(function(){items.forEach(function(el){el.classList.add('in')})},2500);
  }else{items.forEach(function(el){el.classList.add('in')})}
  document.querySelectorAll('form[data-mailto]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(f);
      var body=(d.get('message')||'')+'\\n\\n— '+(d.get('name')||'');
      window.location.href='mailto:'+f.dataset.mailto+'?subject='+encodeURIComponent(f.dataset.subject||'')+'&body='+encodeURIComponent(body);
    });
  });
})();
`;

// ───────────── Страница целиком ─────────────

/**
 * @param {object} site
 * @param {object} site.content  нормализованный контент (см. schema.js)
 * @param {object} [site.contact] контакты клиента: phone, email, address, hours
 * @param {string} [site.themeId]
 * @param {string} [site.accent]  переопределение основного цвета
 */
export function renderSite({ content, contact = {}, themeId = DEFAULT_THEME, accent } = {}) {
  const theme = THEMES[themeId] ?? THEMES[DEFAULT_THEME];
  const brand = content.brand;
  // Если клиент сам выбрал цвет, второй цвет градиента выводим из него (rootVars сдвигает оттенок),
  // иначе пара «цвет от клиента + цвет от ИИ» выглядела бы случайной.
  const accentOverride = validHex(accent, '');
  const accentColor = accentOverride || brand.accent;
  const accent2Color = accentOverride ? '' : brand.accent2;
  const primaryCta = content.hero.primaryCta;
  const sections = content.sections;
  const navItems = sections.filter((s) => s.type !== 'cta').slice(0, 4);
  const firstId = navItems[0] ? sectionId(navItems[0]) : 'contact';
  const year = new Date().getFullYear();
  const initial = [...(brand.name.trim() || '•')][0].toUpperCase();

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${accentColor}"/><text x="16" y="22.5" font-size="19" font-weight="700" text-anchor="middle" font-family="system-ui,sans-serif" fill="${onColor(accentColor)}">${esc(initial)}</text></svg>`;
  const favicon = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;

  const nav = `<header class="nav"><div class="container nav-inner">
    <a class="brand" href="#top"><span class="brand-mark">${esc(initial)}</span><span>${esc(brand.name)}</span></a>
    <nav class="links" aria-label="${esc(content.labels.menu)}">${navItems
      .map((s) => `<a href="#${sectionId(s)}">${esc(s.navLabel)}</a>`)
      .join('')}<a href="#contact">${esc(content.contact.navLabel)}</a></nav>
    <a class="btn btn-primary nav-cta" href="#contact">${esc(primaryCta)}</a>
    <button class="burger" type="button" aria-label="${esc(content.labels.menu)}" aria-expanded="false">${icon('menu', 22)}</button>
  </div></header>`;

  const hero = `<section class="hero" id="top" data-layout="${theme.layout}"><div class="container hero-inner">
    <div class="hero-copy">
      ${content.hero.eyebrow ? `<span class="eyebrow">${esc(content.hero.eyebrow)}</span>` : ''}
      <h1>${esc(content.hero.headline)}</h1>
      <p class="lead">${esc(content.hero.subheadline)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#contact">${esc(primaryCta)}</a>
        ${content.hero.secondaryCta ? `<a class="btn btn-ghost" href="#${firstId}">${esc(content.hero.secondaryCta)}</a>` : ''}
      </div>
    </div>
    ${
      content.hero.highlights.length
        ? `<div class="hero-visual">${content.hero.highlights
            .map(
              (h) =>
                `<div class="hl">${iconWrap(h.icon, 22)}<div><strong>${esc(h.title)}</strong>${
                  h.text ? `<span class="t">${esc(h.text)}</span>` : ''
                }</div></div>`,
            )
            .join('')}</div>`
        : ''
    }
  </div></section>`;

  const body = sections.map((s, i) => renderSection(s, i, { primaryCta, total: sections.length })).join('\n');

  const css = `${rootVars(theme, accentColor, accent2Color)}${BASE_CSS}${theme.css}`;

  return `<!doctype html>
<html lang="${esc(brand.language)}" data-theme="${esc(theme.id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(content.seo.title || brand.name)}</title>
<meta name="description" content="${esc(content.seo.description)}">
<meta name="theme-color" content="${esc(accentColor)}">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(fontLink(theme))}">
<style>${css}</style>
</head>
<body>
${nav}
<main>
${hero}
${body}
${renderContact(content, contact)}
</main>
<footer class="footer"><div class="container footer-inner">
  <strong>${esc(brand.name)}</strong>
  <span class="muted">© ${year} ${esc(brand.name)}. ${esc(content.labels.rights)}</span>
</div></footer>
<script>${PAGE_JS}</script>
</body>
</html>`;
}
