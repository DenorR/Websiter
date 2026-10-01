// Базовый слой стилей: всё, что общее для всех шаблонов. Внешний вид управляется
// CSS-переменными (:root) и data-атрибутами на <html> — поэтому цвета, шрифты, радиусы
// и прочие настройки можно менять на лету, не перерисовывая разметку.

export const baseCss = `
*,*::before,*::after{box-sizing:border-box}
*{margin:0}
:root{--gutter:20px;--nav-h:72px}
@media(min-width:760px){:root{--gutter:36px}}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;scroll-padding-top:calc(var(--nav-h) + 16px)}
body{font-variant-numeric:lining-nums;font-family:var(--font-body);font-size:var(--fs);line-height:1.62;color:var(--text);background:var(--bg);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden;position:relative}
img,svg{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
ul,ol{padding:0;list-style:none}
h1,h2,h3,h4{font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);line-height:var(--h-leading);text-transform:var(--h-case);text-wrap:balance}
h1,h2{word-spacing:max(0em,calc(var(--h-track) * -.7));overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}
h1{font-size:calc(var(--h1) * var(--h-scale))}
h2{font-size:calc(var(--h2) * var(--h-scale))}
h3,.hl strong,.faq-acc summary,.faq-split summary,.menu-links a,.brand{letter-spacing:calc(var(--h-track) * .35)}
h3{font-size:calc(var(--h3) * var(--h-scale));line-height:1.22}
p{text-wrap:pretty}
em{font-family:var(--font-accent);font-style:var(--em-style);font-weight:var(--em-weight);color:var(--em-color);text-transform:none;letter-spacing:var(--em-track)}
.container{width:min(var(--container),100% - var(--gutter) * 2);margin-inline:auto}
.muted{color:var(--muted)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.art,.media img{width:100%;height:100%;object-fit:cover}
.media{position:relative;overflow:hidden;background:var(--surface-2);border-radius:var(--radius-lg)}
html[data-media=arch] .media{border-radius:999px 999px var(--radius) var(--radius)}
html[data-media=round] .media{border-radius:50%;aspect-ratio:1!important}
html[data-media=oval] .media{border-radius:50%}
html[data-media=rect] .media{border-radius:var(--radius-lg)}

/* ── Зерно ── */
html[data-grain=on] body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:300;opacity:.09;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.4 -.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* ── Кнопки ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.65em;padding:.95em 1.55em;font-weight:600;font-size:.94em;line-height:1.1;border:1.5px solid transparent;border-radius:var(--btn-radius);cursor:pointer;white-space:nowrap;transition:transform .2s,background .2s,color .2s,border-color .2s,box-shadow .2s;letter-spacing:var(--btn-track);text-transform:var(--btn-case)}
.btn .arr{width:1.05em;height:1.05em;transition:transform .25s}
.btn:hover .arr{transform:translateX(.25em)}
html[data-btn=solid] .btn-primary{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
html[data-btn=solid] .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 24px -10px var(--accent)}
html[data-btn=outline] .btn-primary{background:transparent;color:var(--text);border-color:var(--text)}
html[data-btn=outline] .btn-primary:hover{background:var(--text);color:var(--bg)}
html[data-btn=underline] .btn-primary{padding:.35em 0;border:0;border-bottom:2px solid var(--accent);border-radius:0;background:none;color:var(--text)}
html[data-btn=underline] .btn-primary:hover{border-bottom-color:var(--text)}
.btn-ghost{background:transparent;color:var(--text);border-color:var(--border)}
.btn-ghost:hover{border-color:var(--text)}
html[data-btn=underline] .btn-ghost{border:0;padding:.35em 0;color:var(--muted)}
html[data-btn=underline] .btn-ghost:hover{color:var(--text)}
.actions{display:flex;flex-wrap:wrap;gap:14px 18px;align-items:center;margin-top:2.2rem}

/* ── Подписи, значки ── */
.kicker,.eyebrow{display:inline-flex;align-items:center;gap:.7em;font-family:var(--font-kicker);font-size:.76rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.kicker i{font-style:normal;color:var(--accent-fg)}
.kicker i::after{content:"";display:inline-block;width:2.4em;height:1px;background:currentColor;vertical-align:middle;margin-left:.8em;opacity:.55}
.eyebrow{color:var(--accent-fg)}
html[data-kicker=off] .sh .kicker{display:none}

.ic{display:inline-flex;align-items:center;justify-content:center;flex:none;align-self:flex-start}
.ic-svg,.ic-num{display:none}
.ic-svg .ico{width:1.7rem;height:1.7rem}
html[data-icons=line] .ic-svg,html[data-icons=badge] .ic-svg{display:block}
html[data-icons=numeral] .ic-num{display:block}
html[data-icons=none] .ic{display:none}
.ic-svg{color:var(--accent-fg)}
.ic-num{font-family:var(--font-kicker);font-size:.8rem;font-weight:600;letter-spacing:.12em;color:var(--accent-fg)}
html[data-icons=badge] .ic{width:3.1rem;height:3.1rem;border-radius:var(--radius);background:var(--accent);color:var(--on-accent)}
html[data-icons=badge] .ic-svg{color:var(--on-accent)}

/* ── Карточки ── */
.cardlike{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:clamp(22px,2.6vw,34px)}
html[data-cards=flat] .cardlike{background:transparent;border-color:transparent;padding-inline:0}
html[data-cards=fill] .cardlike{background:var(--surface-2);border-color:transparent}
html[data-cards=shadow] .cardlike{border-color:transparent;box-shadow:0 1px 2px rgba(0,0,0,.05),0 18px 40px -20px rgba(0,0,0,.28)}
html[data-cards=hard] .cardlike{border:2px solid var(--text);box-shadow:6px 6px 0 var(--text);border-radius:calc(var(--radius) * .6)}

/* ── Секции ── */
.sec{padding:var(--sec-pad) 0;position:relative}
.sec.alt{background:var(--surface-2)}
.sh{margin-bottom:clamp(32px,5vw,64px);max-width:60rem}
.sh .kicker{margin-bottom:1.15rem}
.sh .sub{margin-top:1.1rem;color:var(--muted);font-size:1.1em;max-width:42rem}
html[data-head=center] .sh{text-align:center;margin-inline:auto}
html[data-head=center] .sh .sub{margin-inline:auto}
html[data-head=split] .sh{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem clamp(24px,5vw,80px);max-width:none;align-items:end}
html[data-head=split] .sh .kicker{grid-column:1/-1;margin:0}
html[data-head=split] .sh .sub{margin:0}
html[data-head=index] .sh{max-width:none;border-top:1.5px solid var(--text);padding-top:1.1rem;display:grid;grid-template-columns:minmax(120px,.2fr) 1fr;gap:.2rem clamp(20px,4vw,64px)}
html[data-head=index] .sh .kicker{grid-row:1/3;margin:0;align-self:start;padding-top:.5rem}
html[data-head=index] .sh h2{grid-column:2}
html[data-head=index] .sh .sub{grid-column:2}
@media(max-width:760px){
  html[data-head=split] .sh,html[data-head=index] .sh{grid-template-columns:1fr}
  html[data-head=index] .sh .kicker{grid-row:auto;padding:0;margin-bottom:.8rem}
  html[data-head=index] .sh h2,html[data-head=index] .sh .sub{grid-column:1}
}
.sec.lay-split>.container.has-side{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(28px,6vw,96px);align-items:start}
.sec.lay-split>.container.has-side>.sh{position:sticky;top:calc(var(--nav-h) + 24px);margin-bottom:0;display:block;border-top:0;padding-top:0}
.sec.lay-split>.container.has-side>.sh .kicker{padding:0;margin-bottom:1.15rem}
@media(max-width:900px){.sec.lay-split>.container.has-side{display:block}.sec.lay-split>.container.has-side>.sh{position:static;margin-bottom:clamp(28px,5vw,48px)}}

/* ── Появление при прокрутке ── */
html.js[data-motion=soft] .rv,html.js[data-motion=rich] .rv{opacity:0;transform:translateY(20px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i,0) * 70ms)}
html.js[data-motion=rich] .rv{transform:translateY(46px) scale(.985)}
html.js .rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){html.js .rv{opacity:1!important;transform:none!important;transition:none!important}html{scroll-behavior:auto}}

/* ── Бегущая строка ── */
.ticker{overflow:hidden;background:var(--band);color:var(--on-band);font-family:var(--font-head);font-weight:var(--h-weight);text-transform:var(--h-case);letter-spacing:var(--h-track);font-size:clamp(1.05rem,2vw,1.55rem);white-space:nowrap;border-block:1px solid var(--border)}
.ticker-track{display:inline-flex;animation:tick 46s linear infinite;padding:.85em 0;will-change:transform}
.ticker span{display:inline-flex;align-items:center;gap:1.3em;padding-right:1.3em}
.ticker span::after{content:"";width:.42em;height:.42em;background:var(--band-em);transform:rotate(45deg)}
@keyframes tick{to{transform:translateX(-50%)}}
html[data-ticker=off] .ticker{display:none}
@media(prefers-reduced-motion:reduce){.ticker-track{animation:none}}

/* ── Навигация ── */
.nav{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--bg) 95%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.nav-in{display:flex;align-items:center;gap:clamp(18px,3vw,40px);height:var(--nav-h)}
.brand{display:inline-flex;align-items:center;gap:.7em;font-family:var(--font-head);font-weight:var(--h-weight);font-size:1.22rem;letter-spacing:var(--h-track);text-transform:var(--h-case);line-height:1;white-space:nowrap}
.brand img{height:34px;width:auto;max-width:150px;object-fit:contain}
.brand-dot{gap:0}.brand-dot::after{content:"";width:.3em;height:.3em;border-radius:50%;background:var(--accent);margin-left:.14em;align-self:flex-end;margin-bottom:.06em}
.links{display:flex;gap:clamp(16px,2.4vw,34px);margin-left:auto;font-size:.9em;font-weight:500}
.links a{color:var(--muted);position:relative;padding:.3em 0;transition:color .2s;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .3s,color .2s}
.links a:hover{color:var(--text);background-size:100% 1px}
.nav-cta{padding:.7em 1.2em;font-size:.88em}
.burger{display:none;margin-left:auto;align-items:center;gap:.6em;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:var(--btn-radius);padding:.55em 1em;font-weight:600;font-size:.85rem;cursor:pointer}
.burger i{display:block;width:16px;height:1.5px;background:currentColor;position:relative}
.burger i::before,.burger i::after{content:"";position:absolute;left:0;width:100%;height:1.5px;background:currentColor;transition:transform .25s}
.burger i::before{top:-5px}.burger i::after{top:5px}
html.menu-open .burger i{background:transparent}
html.menu-open .burger i::before{transform:translateY(5px) rotate(45deg)}
html.menu-open .burger i::after{transform:translateY(-5px) rotate(-45deg)}

.nav-center .nav-in{display:grid;grid-template-columns:1fr auto 1fr;gap:24px}
.nav-center .links.l{margin:0}
.nav-center .nav-r{display:flex;justify-content:flex-end;align-items:center;gap:clamp(16px,2.4vw,34px)}
.nav-center .brand{justify-self:center;font-size:1.5rem}
.nav-pill{background:transparent;border:0;-webkit-backdrop-filter:none;backdrop-filter:none;padding-top:14px;pointer-events:none}
.nav-pill .nav-in{pointer-events:auto;height:58px;width:min(var(--container),100% - var(--gutter) * 2);margin-inline:auto;padding:0 8px 0 24px;background:color-mix(in srgb,var(--surface) 88%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:999px;box-shadow:0 10px 30px -14px rgba(0,0,0,.25)}
.nav-pill .nav-cta{border-radius:999px}
.nav-pill+main .hero{margin-top:calc(-1 * (var(--nav-h)))}
.nav-menu .links{display:none}
.nav-menu .nav-cta{margin-left:auto}
.nav-menu .burger{display:inline-flex;margin-left:12px}

/* ── Полноэкранное меню ── */
.menu{position:fixed;inset:0;z-index:90;background:var(--bg);padding:calc(var(--nav-h) + 24px) 0 32px;overflow:auto;opacity:0;visibility:hidden;transform:translateY(-12px);transition:opacity .3s,transform .3s,visibility .3s}
html.menu-open .menu{opacity:1;visibility:visible;transform:none}
html.menu-open body{overflow:hidden}
.menu-links{counter-reset:m}
.menu-links a{display:flex;align-items:baseline;gap:1rem;padding:.55rem 0;font-family:var(--font-head);font-weight:var(--h-weight);font-size:clamp(1.9rem,6vw,3.6rem);letter-spacing:var(--h-track);text-transform:var(--h-case);border-bottom:1px solid var(--border);line-height:1.15}
.menu-links a span{font-family:var(--font-kicker);font-size:.8rem;letter-spacing:.12em;color:var(--accent-fg);font-weight:600;min-width:2.5em}
.menu-links a:hover{color:var(--accent-fg)}
.menu-foot{margin-top:2rem;display:flex;flex-wrap:wrap;gap:1rem 2.4rem;color:var(--muted);font-size:.95em}
@media(max-width:900px){
  .nav .links,.nav .nav-cta,.nav-center .nav-r,.nav-center .links.l{display:none}
  .burger{display:inline-flex}
  .nav-center .nav-in{display:flex}
  .nav-center .brand{justify-self:auto;font-size:1.22rem}
  .nav-pill .nav-in{padding-left:18px}
}

/* ── Подвал ── */
.ft{border-top:1px solid var(--border);padding:clamp(36px,5vw,56px) 0;font-size:.92em;color:var(--muted)}
.ft strong{color:var(--text);font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);text-transform:var(--h-case);font-size:1.15rem}
.ft-in{display:flex;flex-wrap:wrap;gap:12px 32px;justify-content:space-between;align-items:center}
.ft-links{display:flex;flex-wrap:wrap;gap:8px 22px}
.ft-links a:hover{color:var(--text)}
.ft-center .ft-in{flex-direction:column;text-align:center;gap:18px}
.ft-big{padding-bottom:0;overflow:hidden}
.ft-mega{font-family:var(--font-head);font-weight:var(--h-weight);text-transform:var(--h-case);letter-spacing:-.04em;font-size:clamp(3.2rem,15.5vw,15rem);line-height:.82;color:var(--text);margin-top:clamp(28px,5vw,64px);white-space:nowrap;overflow:hidden;text-overflow:clip;opacity:.96;padding-bottom:.08em}
`;
