// Стили вариантов блоков. В итоговую страницу попадают только те, что реально использованы.

export const variantCss = {
  // ═══════════ ПЕРВЫЙ ЭКРАН ═══════════
  'hero:common': `
.hero{position:relative;padding:clamp(48px,8vw,112px) 0 clamp(44px,6vw,88px)}
.hero h1{margin:1.2rem 0 0}
.hero .lead{font-size:1.2em;color:var(--muted);max-width:33em;margin-top:1.5rem;line-height:1.55}
.hl-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,3vw,40px);margin-top:clamp(36px,5vw,64px);padding-top:1.5rem;border-top:1px solid var(--border)}
.hl strong{display:block;font-family:var(--font-head);font-weight:var(--h-weight);font-size:1.02rem;letter-spacing:var(--h-track);text-transform:var(--h-case);line-height:1.25}
.hl .t{display:block;color:var(--muted);font-size:.88em;margin-top:.35rem;line-height:1.45}
.hl .ic{margin-bottom:.8rem}
@media(max-width:700px){.hl-row{grid-template-columns:1fr}}
`,
  'hero:split': `
.hero-split .hero-copy{min-width:0}
.hero-split .hero-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);gap:clamp(32px,6vw,96px);align-items:center}
.hero-split .media{aspect-ratio:4/5}
@media(max-width:900px){.hero-split .hero-grid{grid-template-columns:1fr}.hero-split .media{aspect-ratio:4/3;order:-1}}
`,
  'hero:center': `
.hero-center{text-align:center}
.hero-center h1{max-width:15em;margin-inline:auto}
.hero-center .lead{margin-inline:auto}
.hero-center .actions{justify-content:center}
.hero-center .band-media{margin-top:clamp(40px,6vw,80px);aspect-ratio:21/9}
.hero-center .hl-row{text-align:left}
@media(max-width:700px){.hero-center .band-media{aspect-ratio:4/3}}
`,
  'hero:editorial': `
.hero-ed .hero-meta{display:flex;justify-content:space-between;gap:.6rem 2rem;flex-wrap:wrap;border-top:1.5px solid var(--text);border-bottom:1px solid var(--border);padding:.85rem 0;font-family:var(--font-kicker);font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.hero-ed .hero-meta b{color:var(--text);font-weight:600}
.hero-ed h1{margin:clamp(28px,5vw,72px) 0 0;font-size:calc(var(--h1) * 1.22 * var(--h-scale));max-width:13.5em;line-height:calc(var(--h-leading) - .02)}
.hero-ed .hero-foot{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2rem clamp(24px,6vw,96px);align-items:end;margin-top:clamp(28px,4vw,56px)}
.hero-ed .hero-foot .lead{margin:0}
.hero-ed .hero-foot .actions{margin:0;justify-content:flex-end}
.hero-ed .band-media{margin-top:clamp(40px,6vw,80px);aspect-ratio:21/8}
.hero-ed .hl-row{border-top:0;padding-top:0}
.hero-ed .hl{border-top:1.5px solid var(--text);padding-top:1rem}
@media(max-width:800px){.hero-ed .hero-foot{grid-template-columns:1fr}.hero-ed .hero-foot .actions{justify-content:flex-start}.hero-ed .band-media{aspect-ratio:4/3}}
`,
  'hero:poster': `
.hero-poster{background:var(--accent);color:var(--on-accent);padding:clamp(36px,5vw,72px) 0 clamp(60px,8vw,110px);overflow:hidden;isolation:isolate}
.hero-poster h1{font-size:calc(var(--h1) * 1.32 * var(--h-scale));line-height:1.04;text-transform:uppercase;max-width:9.5em;position:relative;z-index:2;margin-top:1.4rem}
.hero-poster .eyebrow{color:inherit;background:var(--text);color:var(--bg);padding:.45em .9em;letter-spacing:.12em}
.hero-poster em{color:inherit;-webkit-text-stroke:0;background:var(--text);color:var(--accent);padding:0 .12em}
.hero-poster .lead{color:inherit;opacity:.92;font-weight:500;max-width:28em;position:relative;z-index:2}
.hero-poster .actions{position:relative;z-index:2}
.hero-poster .btn-primary{background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
.hero-poster .btn-ghost{color:inherit;border-color:currentColor}
.poster-art{position:absolute;right:max(-4%,-60px);top:50%;width:min(44vw,600px);aspect-ratio:1;transform:translateY(-50%) rotate(7deg);z-index:1;border:3px solid var(--text);box-shadow:10px 10px 0 var(--text);border-radius:calc(var(--radius) * .6);overflow:hidden;background:var(--bg)}
.sticker{position:absolute;z-index:3;right:min(40vw,520px);bottom:12%;width:7.6rem;height:7.6rem;border-radius:50%;background:var(--accent-2);color:var(--on-accent2);border:3px solid var(--text);display:grid;place-items:center;text-align:center;font-family:var(--font-head);font-weight:var(--h-weight);text-transform:uppercase;font-size:.82rem;line-height:1.1;padding:.8rem;transform:rotate(-14deg);box-shadow:4px 4px 0 var(--text)}
.hero-poster .hl-row{border-top:3px solid currentColor;position:relative;z-index:2;width:min(100%,54%)}
@media(max-width:900px){.hero-poster .hl-row{width:100%}}
.hero-poster .hl .t{color:inherit;opacity:.85}
@media(max-width:900px){.poster-art{position:relative;right:auto;top:auto;transform:rotate(3deg);width:86%;margin:2.4rem auto 0}.sticker{right:6%;bottom:auto;top:10%}}
`,
  'hero:fullbleed': `
.hero-full{min-height:min(94vh,900px);display:flex;align-items:flex-end;isolation:isolate;padding:0;overflow:hidden}
.hero-full .hero-bg{position:absolute;inset:0;z-index:-1}
.hero-full .hero-bg .art{position:absolute;right:0;top:0;width:min(74%,1100px);height:100%}
.hero-full .hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-full .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--bg) 18%,color-mix(in srgb,var(--bg) 55%,transparent) 48%,transparent 78%),linear-gradient(0deg,color-mix(in srgb,var(--bg) 70%,transparent),transparent 36%)}
.hero-full.has-img{color:#fff}
.hero-full.has-img .hero-bg::after{background:linear-gradient(0deg,rgba(0,0,0,.74),rgba(0,0,0,.2) 60%,rgba(0,0,0,.38))}
.hero-full.has-img .lead,.hero-full.has-img .eyebrow{color:rgba(255,255,255,.88)}
.hero-full.has-img .btn-ghost{color:#fff;border-color:rgba(255,255,255,.5)}
.hero-full .container{padding:clamp(120px,16vw,200px) 0 clamp(44px,6vw,88px)}
.hero-full h1{max-width:11em}
.hero-full .hl-row{border-top-color:color-mix(in srgb,currentColor 28%,transparent)}
@media(max-width:800px){.hero-full .hero-bg .art{width:100%;opacity:.5}}
`,
  'hero:stack': `
.hero-stack{text-align:center;padding-bottom:0}
.hero-stack .pill{display:inline-flex;align-items:center;gap:.7em;padding:.45em 1.1em;border:1px solid var(--border);border-radius:999px;font-size:.82rem;font-weight:500;background:var(--surface);color:var(--muted)}
.hero-stack .pill::before{content:"";width:.5em;height:.5em;border-radius:50%;background:var(--accent)}
.hero-stack h1{max-width:14.5em;margin:1.5rem auto 0}
.hero-stack .lead{margin-inline:auto}
.hero-stack .actions{justify-content:center}
.hero-board{margin-top:clamp(44px,6vw,80px);border:1px solid var(--border);border-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0;background:var(--surface);overflow:hidden;box-shadow:0 -24px 80px -40px color-mix(in srgb,var(--accent) 60%,transparent);text-align:left}
.board-top{display:flex;align-items:center;gap:7px;padding:13px 18px;border-bottom:1px solid var(--border);background:var(--surface-2)}
.board-top i{width:10px;height:10px;border-radius:50%;background:var(--border)}
.board-top span{margin-left:12px;font-family:var(--font-kicker);font-size:.74rem;color:var(--muted);letter-spacing:.04em}
.board-body{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:clamp(20px,4vw,52px);min-height:340px;align-content:end;overflow:hidden}
.board-body .art{position:absolute;inset:0;z-index:0}
.board-body .hl{position:relative;z-index:1;background:color-mix(in srgb,var(--surface) 92%,transparent);border:1px solid var(--border);border-radius:var(--radius);padding:1.2rem 1.3rem;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
@media(max-width:800px){.board-body{grid-template-columns:1fr;min-height:0}}
`,

  // ═══════════ УСЛУГИ ═══════════
  'features:cards': `
.f-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:clamp(14px,2vw,24px)}
.f-grid[data-n="4"]{grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}
.f-grid .card h3{margin:1.2rem 0 .6rem}
.f-grid .card p{color:var(--muted);font-size:.96em}
.f-grid .card{transition:transform .25s,border-color .25s}
.f-grid .card:hover{transform:translateY(-4px);border-color:var(--text)}
@media(min-width:1000px){.f-grid[data-n="4"]{grid-template-columns:repeat(4,1fr)}}
`,
  'features:rows': `
.f-rows{border-top:1.5px solid var(--text)}
.f-rows li{display:grid;grid-template-columns:minmax(56px,.14fr) minmax(0,1fr) minmax(0,1.15fr) 2rem;gap:clamp(12px,3vw,48px);align-items:baseline;padding:clamp(20px,2.6vw,34px) 0;border-bottom:1px solid var(--border);transition:padding .3s,background .3s;position:relative}
.f-rows .n{font-family:var(--font-kicker);font-size:.8rem;font-weight:600;letter-spacing:.12em;color:var(--accent-fg)}
.f-rows h3{font-size:calc(var(--h3) * 1.35 * var(--h-scale))}
.f-rows p{color:var(--muted);max-width:34em}
.f-rows .go{justify-self:end;width:1.4rem;height:1.4rem;color:var(--muted);transition:transform .3s,color .3s}
.f-rows li:hover{padding-left:clamp(8px,1.6vw,22px)}
.f-rows li:hover .go{transform:translate(4px,-4px);color:var(--accent-fg)}
.f-rows li:hover h3{color:var(--accent-fg)}
@media(max-width:800px){.f-rows li{grid-template-columns:2.4rem 1fr;gap:.4rem 1rem}.f-rows p{grid-column:2}.f-rows .go{display:none}}
`,
  'features:bento': `
.f-bento{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:minmax(190px,auto);gap:clamp(12px,1.6vw,20px)}
.f-bento .tile{border-radius:var(--radius-lg);padding:clamp(22px,2.6vw,34px);display:flex;flex-direction:column;justify-content:space-between;gap:1.6rem;background:var(--surface);border:1px solid var(--border);position:relative;overflow:hidden;transition:transform .3s}
.f-bento .tile:hover{transform:translateY(-4px)}
.f-bento .tile h3{margin-bottom:.5rem}
.f-bento .tile p{font-size:.94em;opacity:.8;max-width:30em}
.f-bento .tile:nth-child(1){grid-column:span 3;grid-row:span 2;background:var(--accent);color:var(--on-accent);border-color:transparent}
.f-bento .tile:nth-child(1) h3{font-size:calc(var(--h3) * 1.7 * var(--h-scale))}
.f-bento .tile:nth-child(1) .ic-svg,.f-bento .tile:nth-child(1) .ic-num{color:inherit}
.f-bento .tile:nth-child(2){grid-column:span 3}
.f-bento .tile:nth-child(3){grid-column:span 3;background:var(--band);color:var(--on-band);border-color:transparent}
.f-bento .tile:nth-child(3) .ic-svg,.f-bento .tile:nth-child(3) .ic-num{color:var(--band-em)}
.f-bento .tile:nth-child(4){grid-column:span 2;background:var(--surface-2)}
.f-bento .tile:nth-child(5){grid-column:span 2;background:var(--accent-2);color:var(--on-accent2);border-color:transparent}
.f-bento .tile:nth-child(5) .ic-svg,.f-bento .tile:nth-child(5) .ic-num{color:inherit}
.f-bento .tile:nth-child(6){grid-column:span 2}
.f-bento[data-n="3"] .tile:nth-child(1){grid-row:span 2}
.f-bento[data-n="3"] .tile:nth-child(2),.f-bento[data-n="3"] .tile:nth-child(3){grid-column:span 3}
.f-bento[data-n="4"] .tile:nth-child(4){grid-column:span 6;flex-direction:row;align-items:center}
.f-bento[data-n="5"] .tile:nth-child(4){grid-column:span 3}
.f-bento[data-n="5"] .tile:nth-child(5){grid-column:span 6}
@media(max-width:860px){.f-bento{grid-template-columns:1fr 1fr}.f-bento .tile{grid-column:span 2!important;grid-row:auto!important}.f-bento .tile:nth-child(n+4):not(:last-child){grid-column:span 1!important}}
@media(max-width:560px){.f-bento{grid-template-columns:1fr}.f-bento .tile{grid-column:auto!important}}
`,
  'features:columns': `
.f-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:clamp(24px,3vw,48px)}
.f-cols[data-n="5"],.f-cols[data-n="6"]{grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr))}
.f-cols .col{border-top:1.5px solid var(--text);padding-top:1.2rem}
.f-cols .n{font-family:var(--font-kicker);font-size:.78rem;font-weight:600;letter-spacing:.12em;color:var(--accent-fg);display:block;margin-bottom:2.4rem}
.f-cols h3{margin-bottom:.7rem}
.f-cols p{color:var(--muted);font-size:.96em}
`,
  'features:tiles': `
.f-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2vw,26px)}
.f-tiles .tile{position:relative;min-height:clamp(200px,24vw,300px);padding:clamp(22px,3vw,40px);border:3px solid var(--text);border-radius:var(--radius);display:flex;flex-direction:column;justify-content:flex-end;gap:.7rem;box-shadow:6px 6px 0 var(--text);transition:transform .15s,box-shadow .15s}
.f-tiles .tile:hover{transform:translate(-3px,-3px);box-shadow:10px 10px 0 var(--text)}
.f-tiles .tile h3{font-size:calc(var(--h3) * 1.6 * var(--h-scale));text-transform:uppercase}
.f-tiles .tile p{font-size:.95em;max-width:28em;font-weight:500}
.f-tiles .tile .n{position:absolute;left:clamp(22px,3vw,40px);top:clamp(18px,2.4vw,30px);font-family:var(--font-head);font-weight:var(--h-weight);font-size:1.1rem}
.f-tiles .go{position:absolute;right:clamp(18px,2.4vw,28px);top:clamp(18px,2.4vw,28px);width:2rem;height:2rem}
.f-tiles .c0{background:var(--accent);color:var(--on-accent)}
.f-tiles .c1{background:var(--surface)}
.f-tiles .c2{background:var(--accent-2);color:var(--on-accent2)}
.f-tiles .c3{background:var(--band);color:var(--on-band)}
@media(max-width:700px){.f-tiles{grid-template-columns:1fr}}
`,

  // ═══════════ О НАС ═══════════
  'about:common': `
.facts{display:grid;gap:0;border-top:1.5px solid var(--text)}
.facts li{display:flex;gap:1rem;align-items:flex-start;padding:1.15rem 0;border-bottom:1px solid var(--border)}
.facts h3{font-size:1.08rem}
.facts p{color:var(--muted);font-size:.92em;margin-top:.2rem}
`,
  'about:split': `
.ab-split{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(28px,6vw,96px);align-items:start}
.ab-text p{color:var(--muted);font-size:1.06em}
.ab-text p+p{margin-top:1.1em}
.ab-text p:first-child{color:var(--text);font-size:1.28em;line-height:1.5;font-family:var(--font-lead)}
@media(max-width:860px){.ab-split{grid-template-columns:1fr}}
`,
  'about:statement': `
.ab-state .big{font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);font-size:calc(clamp(1.7rem,3.8vw,3.2rem) * var(--h-scale));line-height:1.18;text-transform:var(--h-case);max-width:24em;text-wrap:balance}
.ab-state .ab-cols{columns:2;column-gap:clamp(28px,6vw,96px);margin-top:clamp(28px,4vw,56px);color:var(--muted);max-width:60rem}
.ab-state .ab-cols p{break-inside:avoid;margin-bottom:1em}
.ab-state .tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:clamp(24px,3vw,40px)}
.ab-state .tags li{padding:.5em 1.1em;border:1px solid var(--text);border-radius:var(--btn-radius);font-size:.9em;font-weight:500}
@media(max-width:760px){.ab-state .ab-cols{columns:1}}
`,
  'about:media': `
.ab-media{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(28px,6vw,96px);align-items:center}
.ab-media .media{aspect-ratio:4/5}
.ab-media .ab-text p{color:var(--muted)}
.ab-media .ab-text p:first-child{color:var(--text);font-size:1.22em;line-height:1.5}
.ab-media .ab-text p+p{margin-top:1.1em}
.ab-media .facts{margin-top:2rem}
@media(max-width:860px){.ab-media{grid-template-columns:1fr}.ab-media .media{aspect-ratio:4/3}}
`,

  // ═══════════ ПРОЦЕСС ═══════════
  'process:numbers': `
.p-num{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:clamp(24px,3vw,48px)}
.p-num li{border-top:1.5px solid var(--text);padding-top:1.3rem}
.p-num .big{display:block;font-family:var(--font-head);font-weight:var(--h-weight);font-size:clamp(3.4rem,7vw,6rem);line-height:.9;letter-spacing:-.04em;color:transparent;-webkit-text-stroke:1.5px var(--accent-fg);margin-bottom:1.8rem;font-variant-numeric:tabular-nums}
.p-num h3{margin-bottom:.6rem}
.p-num p{color:var(--muted);font-size:.96em}
`,
  'process:timeline': `
.p-line{position:relative;max-width:62rem}
.p-line::before{content:"";position:absolute;left:1.15rem;top:.4rem;bottom:.4rem;width:1.5px;background:var(--border)}
.p-line li{position:relative;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:.4rem clamp(24px,5vw,72px);padding:0 0 clamp(26px,3.4vw,44px) 4rem}
.p-line li:last-child{padding-bottom:0}
.p-line .dot{position:absolute;left:0;top:0;width:2.3rem;height:2.3rem;border-radius:50%;background:var(--bg);border:1.5px solid var(--accent);color:var(--accent-fg);display:grid;place-items:center;font-family:var(--font-kicker);font-size:.8rem;font-weight:700}
.p-line li:hover .dot{background:var(--accent);color:var(--on-accent)}
.p-line h3{font-size:calc(var(--h3) * 1.2 * var(--h-scale))}
.p-line p{color:var(--muted)}
@media(max-width:700px){.p-line li{grid-template-columns:1fr}}
`,
  'process:cards': `
.p-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:clamp(14px,2vw,24px)}
.p-cards .step-n{display:grid;place-items:center;width:2.8rem;height:2.8rem;border-radius:50%;background:var(--accent);color:var(--on-accent);font-weight:700;margin-bottom:1.3rem;font-family:var(--font-head)}
.p-cards h3{margin-bottom:.5rem}
.p-cards p{color:var(--muted);font-size:.96em}
`,

  // ═══════════ ЦЕНЫ ═══════════
  'pricing:cards': `
.pr-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));gap:clamp(14px,2vw,24px);align-items:stretch}
.plan{display:flex;flex-direction:column}
.plan .price{font-variant-numeric:lining-nums;font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);font-size:clamp(1.8rem,3vw,2.5rem);color:var(--accent-fg);margin:.9rem 0 1.2rem;line-height:1.05}
.plan ul{display:grid;gap:.7rem;color:var(--muted);font-size:.95em;margin-bottom:1.8rem}
.plan li{display:flex;gap:.7rem;align-items:flex-start}
.plan li .ico{flex:none;margin-top:.22em;width:1.1em;height:1.1em;color:var(--accent-fg)}
.plan .btn{margin-top:auto;align-self:flex-start}
`,
  'pricing:menu': `
.pr-menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(26px,3vw,40px) clamp(36px,7vw,110px);counter-reset:m}
.pr-menu li .m-head{display:flex;align-items:baseline;gap:.8rem}
.pr-menu h3{flex:none;max-width:70%}
.m-dots{flex:1;border-bottom:2px dotted color-mix(in srgb,var(--text) 38%,transparent);transform:translateY(-.3em);min-width:1.5rem}
.m-price{font-variant-numeric:lining-nums tabular-nums;font-family:var(--font-head);font-weight:var(--h-weight);color:var(--accent-fg);letter-spacing:var(--h-track);white-space:nowrap;font-size:1.15rem}
.m-text{color:var(--muted);font-size:.92em;margin-top:.3rem}
@media(max-width:800px){.pr-menu{grid-template-columns:1fr}}
`,
  'pricing:table': `
.pr-table{border-top:1.5px solid var(--text)}
.pr-table .r{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr) auto auto;gap:clamp(12px,3vw,40px);align-items:center;padding:clamp(18px,2.4vw,28px) 0;border-bottom:1px solid var(--border)}
.pr-table p{color:var(--muted);font-size:.94em}
.pr-table .price{font-variant-numeric:lining-nums tabular-nums;font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);font-size:clamp(1.3rem,2.4vw,1.9rem);white-space:nowrap}
.pr-table .btn{padding:.7em 1.1em}
@media(max-width:800px){.pr-table .r{grid-template-columns:1fr auto;gap:.5rem 1rem}.pr-table p{grid-column:1/-1;order:3}.pr-table .btn{display:none}}
`,

  // ═══════════ ВОПРОСЫ ═══════════
  'faq:accordion': `
.faq-acc{max-width:56rem;border-top:1.5px solid var(--text)}
.faq-acc details{border-bottom:1px solid var(--border)}
.faq-acc summary{cursor:pointer;list-style:none;padding:1.35rem 0;display:flex;justify-content:space-between;gap:1.5rem;align-items:center;font-family:var(--font-head);font-weight:var(--h-weight);text-transform:var(--h-case);font-size:calc(var(--h3) * var(--h-scale));line-height:1.25}
.faq-acc summary::-webkit-details-marker{display:none}
.faq-acc summary::after{content:"";flex:none;width:1.1rem;height:1.1rem;background:linear-gradient(var(--accent-fg),var(--accent-fg)) center/100% 1.5px no-repeat,linear-gradient(var(--accent-fg),var(--accent-fg)) center/1.5px 100% no-repeat;transition:transform .3s}
.faq-acc details[open] summary::after{transform:rotate(45deg)}
.faq-acc summary:hover{color:var(--accent-fg)}
.faq-acc details p{padding:0 3rem 1.5rem 0;color:var(--muted);max-width:44rem}
`,
  'faq:split': `
.faq-split{border-top:1.5px solid var(--text)}
.faq-split details{border-bottom:1px solid var(--border)}
.faq-split summary{cursor:pointer;list-style:none;padding:1.3rem 0;display:flex;justify-content:space-between;gap:1.5rem;align-items:center;font-family:var(--font-head);font-weight:var(--h-weight);text-transform:var(--h-case);font-size:calc(var(--h3) * var(--h-scale));line-height:1.25}
.faq-split summary::-webkit-details-marker{display:none}
.faq-split summary::after{content:"+";font-family:var(--font-body);font-weight:300;font-size:1.7rem;line-height:1;color:var(--accent-fg);transition:transform .3s;flex:none}
.faq-split details[open] summary::after{transform:rotate(45deg)}
.faq-split details p{padding:0 2.5rem 1.4rem 0;color:var(--muted)}
`,
  'faq:grid': `
.faq-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2vw,24px)}
.faq-grid .qa h3{margin-bottom:.7rem}
.faq-grid .qa p{color:var(--muted);font-size:.96em}
@media(max-width:760px){.faq-grid{grid-template-columns:1fr}}
`,

  // ═══════════ ПРИЗЫВ ═══════════
  'cta:band': `
.sec-cta{padding:clamp(20px,3vw,44px) 0}
.cta-band{display:flex;flex-wrap:wrap;gap:1.6rem 3rem;align-items:center;justify-content:space-between;background:var(--band);color:var(--on-band);border-radius:var(--radius-lg);padding:clamp(32px,6vw,76px);position:relative;overflow:hidden}
.cta-band h2{max-width:16em}
.cta-band p{margin-top:1rem;opacity:.82;max-width:34em}
.cta-band .btn-primary{background:var(--band-btn)!important;color:var(--band-btn-fg)!important;border-color:var(--band-btn)!important}
.cta-band em{color:var(--band-em)}
.cta-band em{text-decoration:underline;text-decoration-thickness:.06em;text-underline-offset:.12em;text-decoration-color:color-mix(in srgb,var(--band-em) 40%,transparent)}
`,
  'cta:big': `
.sec-cta .cta-big{padding:clamp(20px,4vw,56px) 0;border-top:1.5px solid var(--text)}
.cta-big h2{font-size:calc(clamp(2.4rem,8vw,7.4rem) * var(--h-scale));line-height:.98;max-width:12em}
.cta-big p{margin-top:1.4rem;color:var(--muted);max-width:34em}
.cta-link{display:inline-flex;align-items:center;gap:.6em;margin-top:clamp(24px,4vw,48px);font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);text-transform:var(--h-case);font-size:clamp(1.3rem,2.6vw,2rem);border-bottom:2px solid var(--accent);padding-bottom:.2em;transition:gap .25s,color .25s}
.cta-link:hover{gap:1em;color:var(--accent-fg)}
.cta-link svg{width:1.1em;height:1.1em}
`,
  'cta:poster': `
.sec-cta{padding:clamp(20px,3vw,44px) 0}
.cta-poster{background:var(--accent-2);color:var(--on-accent2);border:3px solid var(--text);box-shadow:10px 10px 0 var(--text);border-radius:var(--radius);padding:clamp(32px,6vw,80px);text-align:center}
.cta-poster h2{font-size:calc(clamp(2.4rem,7.4vw,6.4rem) * var(--h-scale));line-height:1.08;text-transform:uppercase;max-width:11em;margin-inline:auto}
.cta-poster em{background:var(--text);color:var(--accent-2);padding:0 .12em}
.cta-poster p{margin:1.2rem auto 0;max-width:30em;font-weight:500}
.cta-poster .btn{margin-top:2rem;background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
`,

  // ═══════════ МАНИФЕСТ ═══════════
  'manifesto:statement': `
.mf{max-width:62rem}
.mf p{font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);text-transform:var(--h-case);font-size:calc(clamp(1.9rem,5vw,4.2rem) * var(--h-scale));line-height:1.1;text-wrap:balance}
.mf .kicker{margin-bottom:1.6rem}
html[data-head=center] .mf{margin-inline:auto;text-align:center}
`,

  // ═══════════ ГАЛЕРЕЯ ═══════════
  'gallery:grid': `
.g-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:clamp(10px,1.4vw,18px)}
.g-grid figure{aspect-ratio:1;overflow:hidden;border-radius:var(--radius);background:var(--surface-2)}
.g-grid img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
.g-grid figure:hover img{transform:scale(1.05)}
`,
  'gallery:strip': `
.g-strip{display:flex;gap:clamp(10px,1.4vw,18px);overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:1rem;margin-inline:calc(var(--gutter) * -1);padding-inline:var(--gutter);scrollbar-width:thin}
.g-strip figure{flex:none;width:min(78vw,420px);aspect-ratio:4/5;overflow:hidden;border-radius:var(--radius);scroll-snap-align:start}
.g-strip img{width:100%;height:100%;object-fit:cover}
`,
  'gallery:mosaic': `
.g-mosaic{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:clamp(120px,16vw,220px);gap:clamp(10px,1.4vw,18px)}
.g-mosaic figure{overflow:hidden;border-radius:var(--radius)}
.g-mosaic figure:nth-child(5n+1){grid-column:span 2;grid-row:span 2}
.g-mosaic figure:nth-child(5n+4){grid-column:span 2}
.g-mosaic img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
.g-mosaic figure:hover img{transform:scale(1.05)}
@media(max-width:700px){.g-mosaic{grid-template-columns:repeat(2,1fr)}}
`,

  // ═══════════ КОНТАКТЫ ═══════════
  'contact:common': `
.sec-contact{padding:var(--sec-pad) 0}
.ct-list{display:grid;gap:0;margin-top:clamp(26px,4vw,44px);border-top:1px solid var(--border)}
.ct-list li>*{display:grid;grid-template-columns:minmax(90px,.4fr) 1fr;gap:1rem;align-items:baseline;padding:1.1rem 0;border-bottom:1px solid var(--border)}
.ct-list small{font-family:var(--font-kicker);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.ct-list b{font-weight:500;font-size:1.12em;word-break:break-word}
.ct-list a:hover b{color:var(--accent-fg)}
.socials{display:flex;flex-wrap:wrap;gap:10px;margin-top:1.6rem}
.socials a{padding:.5em 1.05em;border:1px solid var(--border);border-radius:var(--btn-radius);font-size:.86em;font-weight:500;transition:border-color .2s,background .2s,color .2s}
.socials a:hover{border-color:var(--text);background:var(--text);color:var(--bg)}
.ct-form{display:grid;gap:16px}
.ct-form label{display:grid;gap:8px;font-size:.78rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ct-form input,.ct-form textarea{font:inherit;font-size:1rem;letter-spacing:0;text-transform:none;font-weight:400;color:var(--text);background:transparent;border:0;border-bottom:1.5px solid var(--border);border-radius:0;padding:.8rem 0;width:100%;outline:none;transition:border-color .2s}
.ct-form textarea{min-height:130px;resize:vertical}
.ct-form input:focus,.ct-form textarea:focus{border-bottom-color:var(--accent)}
.ct-form .btn{justify-self:start;margin-top:.6rem}
`,
  'contact:split': `
.ct-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(32px,7vw,120px);align-items:start}
.ct-split h2{margin-top:.3rem}
.ct-sub{color:var(--muted);margin-top:1.1rem;font-size:1.08em;max-width:30em}
.ct-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:clamp(24px,3.4vw,44px)}
@media(max-width:860px){.ct-split{grid-template-columns:1fr}}
`,
  'contact:big': `
.ct-big h2{font-size:calc(clamp(2.4rem,8vw,7rem) * var(--h-scale));line-height:.98;max-width:12em}
.ct-mega{display:inline-block;margin-top:clamp(24px,4vw,48px);font-family:var(--font-head);font-weight:var(--h-weight);letter-spacing:var(--h-track);text-transform:none;font-size:clamp(1.5rem,5vw,4.2rem);line-height:1.05;border-bottom:3px solid var(--accent);padding-bottom:.08em;word-break:break-word;transition:color .2s}
.ct-mega:hover{color:var(--accent-fg)}
.ct-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;margin-top:clamp(36px,5vw,72px);padding-top:1.4rem;border-top:1.5px solid var(--text)}
.ct-cols small{display:block;font-family:var(--font-kicker);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem}
.ct-cols b{font-weight:500;font-size:1.1em}
.ct-big .ct-form{margin-top:clamp(36px,5vw,72px);max-width:42rem}
`,
};
