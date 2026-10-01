import { normalizeSite, resolveDesign, tokensCss } from '../model.js';
import { baseCss } from './css-base.js';
import { variantCss } from './css-variants.js';
import { isLayout } from './variants.js';
import { onColor } from '../color.js';
import {
  esc, plain, ctaHref, renderNav, renderMenu, renderHero, renderTicker, renderSection, renderContact, renderFooter,
} from './parts.js';

export { esc };

const NAV_SKIP = new Set(['cta', 'manifesto']);

// Скрипт страницы: меню, плавные якоря, появление блоков, форма (mailto).
const PAGE_JS = `
(function(){
  var d=document,h=d.documentElement;h.classList.add('js');
  var burger=d.querySelector('.burger');
  function menu(on){h.classList.toggle('menu-open',on);if(burger)burger.setAttribute('aria-expanded',on)}
  if(burger)burger.addEventListener('click',function(){menu(!h.classList.contains('menu-open'))});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
    var id=a.getAttribute('href').slice(1);var el=id?d.getElementById(id):d.body;if(!el)return;
    e.preventDefault();menu(false);el.scrollIntoView({behavior:'smooth',block:'start'});
  });
  var items=[].slice.call(d.querySelectorAll('.rv'));
  function show(){items.forEach(function(el){el.classList.add('in')})}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -4% 0px'});
    items.forEach(function(el){io.observe(el)});setTimeout(show,3500);
  }else show();
  [].forEach.call(d.querySelectorAll('form[data-mailto]'),function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();var fd=new FormData(f);
      var body=(fd.get('message')||'')+'\\n\\n— '+(fd.get('name')||'');
      location.href='mailto:'+f.dataset.mailto+'?subject='+encodeURIComponent(f.dataset.subject||'')+'&body='+encodeURIComponent(body);
    });
  });
})();
`;

// Скрипт только для предпросмотра внутри редактора: обновление стилей без перезагрузки,
// запоминание прокрутки и «клик по блоку = открыть его настройки».
const PREVIEW_JS = `
(function(){
  var d=document,h=d.documentElement,last=0;
  addEventListener('scroll',function(){var n=Date.now();if(n-last>120){last=n;parent.postMessage({ws:'scroll',y:scrollY},'*')}},{passive:true});
  addEventListener('message',function(e){
    var m=e.data;if(!m||!m.ws)return;
    if(m.ws==='scrollTo'){h.style.scrollBehavior='auto';scrollTo(0,m.y);h.style.scrollBehavior=''}
    if(m.ws==='tokens'){
      var s=d.getElementById('ws-tokens');if(s)s.textContent=m.css;
      Object.keys(m.attrs||{}).forEach(function(k){h.setAttribute(k,m.attrs[k])});
    }
    if(m.ws==='focus'){var el=d.querySelector('[data-sec="'+m.sec+'"]');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
  });
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a');
    if(a&&!/^#/.test(a.getAttribute('href')||''))e.preventDefault();
    var s=e.target.closest&&e.target.closest('[data-sec]');
    if(s)parent.postMessage({ws:'select',sec:s.getAttribute('data-sec')},'*');
  },true);
  d.addEventListener('submit',function(e){e.preventDefault()},true);
  function showAll(){[].forEach.call(d.querySelectorAll('.rv'),function(e){e.classList.add('in')})}showAll();setTimeout(showAll,200);
  var st=d.createElement('style');st.textContent='[data-sec]{cursor:pointer;outline:2px solid transparent;outline-offset:-2px;transition:outline-color .15s}[data-sec]:hover{outline-color:rgba(80,120,255,.55)}';d.head.appendChild(st);
  parent.postMessage({ws:'ready'},'*');
})();
`;

function visibleSections(content) {
  return content.sections.filter((s) => {
    if (s.hidden) return false;
    if (s.type === 'cta' || s.type === 'manifesto') return true;
    if (s.type === 'gallery') return true;
    if (s.type === 'about') return !!(s.text || s.items.length);
    return s.items.length > 0;
  });
}

function faviconHref(site, res) {
  if (site.media.logo) return site.media.logo;
  const name = plain(site.content.brand.name).trim();
  const initial = ([...name][0] ?? '•').toUpperCase();
  const bg = res.tokens.accent;
  const rx = Math.min(14, parseInt(res.vars['--radius'], 10) || 0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${rx}" fill="${bg}"/><text x="16" y="23" font-size="20" font-weight="700" text-anchor="middle" font-family="system-ui,sans-serif" fill="${onColor(bg)}">${esc(initial)}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * @param {object} siteIn  запись сайта (content, design, media, contact)
 * @param {object} [opts]
 * @param {boolean} [opts.preview]   добавить скрипт редактора
 * @param {boolean} [opts.inline]    встроить шрифты в base64 (для скачивания)
 */
export function renderSite(siteIn, { preview = false, inline = false } = {}) {
  const site = normalizeSite(siteIn);
  const res = resolveDesign(site);
  const c = site.content;
  const brandName = plain(c.brand.name).trim();

  const sections = visibleSections(c);
  const counted = sections.filter((s) => !NAV_SKIP.has(s.type));
  const navSections = counted.filter((s) => s.type !== 'gallery').slice(0, 4);
  const navItems = [
    ...navSections.map((s) => ({ href: `#s-${s.type}`, label: plain(s.navLabel || s.title) })),
    { href: '#contact', label: plain(c.contact.navLabel) },
  ];

  // Чередующиеся фоны: считаем от конца, чтобы блок перед контактами был «залит»
  const altSet = new Set();
  counted.forEach((s, k) => {
    if ((counted.length - k) % 2 === 1) altSet.add(sections.indexOf(s));
  });

  const r = {
    c, site, res,
    contact: site.contact,
    media: site.media,
    art: res.art,
    seed: site.id || brandName,
    initial: [...brandName][0] ?? 'A',
    year: new Date().getFullYear(),
    navItems,
    altSet,
    sectionCount: counted.length,
    firstSectionId: counted[0] ? `s-${counted[0].type}` : 'contact',
    ctaHref: ctaHref(site.contact),
    isLayout,
  };

  let n = 0;
  const body = sections
    .map((s, i) => {
      const num = NAV_SKIP.has(s.type) ? 0 : n++;
      return renderSection(r, s, i, num);
    })
    .join('\n');

  // CSS: база + стили использованных вариантов + «изюминки» шаблона
  const used = new Set(['hero:common', 'contact:common', `hero:${res.layouts.hero}`, `contact:${res.layouts.contact}`]);
  for (const s of sections) {
    const lay = s.layout && isLayout(s.type, s.layout) ? s.layout : res.layouts[s.type];
    used.add(`${s.type}:${lay}`);
    if (s.type === 'about') used.add('about:common');
  }
  const css = baseCss + [...used].map((k) => variantCss[k] ?? '').join('') + (res.tpl.css ?? '');

  const attrs = Object.entries(res.attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
  const desc = esc(c.seo.description);
  const title = esc(plain(c.seo.title || brandName));

  return `<!doctype html>
<html lang="${esc(c.brand.language)}" ${attrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${esc(res.tokens.bg)}">
<link rel="icon" href="${esc(faviconHref(site, res))}">
<style id="ws-tokens">${tokensCss(res, { fontMode: inline ? 'inline' : 'link' })}</style>
<style id="ws-css">${css}</style>
</head>
<body>
${renderNav(r)}
${renderMenu(r)}
<main>
${renderHero(r)}
${renderTicker(r)}
${body}
${renderContact(r)}
</main>
${renderFooter(r)}
<script>${PAGE_JS}${preview ? PREVIEW_JS : ''}</script>
</body>
</html>`;
}

/** Только токены (CSS-переменные + атрибуты <html>) — для мгновенного обновления предпросмотра. */
export function renderTokens(siteIn) {
  const site = normalizeSite(siteIn);
  const res = resolveDesign(site);
  return { css: tokensCss(res), attrs: res.attrs, tokens: res.tokens };
}
