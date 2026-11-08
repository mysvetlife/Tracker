/* ic.js
   Единый набор тонких линейных значков вместо эмодзи и символов-значков.
   Значок ставится так: <i class="ic ic-имя"></i> (или IC("имя") из кода). Рисуется маской, поэтому берёт цвет текста вокруг
   и масштабируется размером шрифта. Стиль один: контур 1.7, скруглённые концы, сетка 24x24. */
const IC_SET={
  home:'<path d="m3 10.5 9-7.5 9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>',
  calendar:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>',
  calcheck:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/><path d="m9 15.5 2 2 4-4"/>',
  pencil:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"/>',
  menu:'<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.2"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 15.5 4-4.5 3.2 3L19 7.5"/>',
  sparkles:'<path d="M11 3.5 12.9 9 18.5 11l-5.6 2L11 18.5 9.1 13 3.5 11 9.1 9z"/><path d="M19 3v4M17 5h4"/><path d="M18 16v4M16 18h4"/>',
  pentool:'<path d="m12 19 7-7 3 3-7 7z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18z"/><path d="m2 2 7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
  brain:'<path d="M12 5a3 3 0 1 0-6 .1 4 4 0 0 0-2.5 5.7 4 4 0 0 0 .6 6.6A4 4 0 1 0 12 18z"/><path d="M12 5a3 3 0 1 1 6 .1 4 4 0 0 1 2.5 5.7 4 4 0 0 1-.6 6.6A4 4 0 1 1 12 18z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>',
  dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  book:'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h6"/><path d="M8 13h8M8 17h5"/>',
  wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  play:'<path d="M7 4.5v15l12.5-7.5z"/>',
  lines:'<path d="M4 6.5h16M4 12h16M4 17.5h10"/>',
  help:'<circle cx="12" cy="12" r="9.5"/><path d="M9.1 9.2a3 3 0 0 1 5.8 1c0 2-2.9 2.8-2.9 2.8"/><path d="M12 17h.01"/>',
  dot:'<circle cx="12" cy="12" r="2.4"/>',
  heading:'<path d="M6 4v16M18 4v16M6 12h12"/>',
  textt:'<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  list:'<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="17.5" r=".8"/>',
  checklist:'<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  quote:'<path d="M3 21c3 0 7-1 7-8V5c0-1.2-.8-2-2-2H4c-1.2 0-2 .8-2 2v6c0 1.2.8 2 2 2h4"/><path d="M15 21c3 0 7-1 7-8V5c0-1.2-.8-2-2-2h-3c-1.2 0-2 .8-2 2v6c0 1.2.8 2 2 2h4"/>',
  code:'<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'
};
const IC_STYLE=(function(){
  let css='.ic{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;flex:none;background-color:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat}'
        +'.ic:not(:only-child){margin-right:.3em}';
  Object.keys(IC_SET).forEach(k=>{
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+IC_SET[k]+'</svg>';
    css+='.ic-'+k+'{--m:url("data:image/svg+xml,'+encodeURIComponent(svg).replace(/"/g,'%22')+'")}'; });
  return css; })();
(function(){ const st=document.createElement("style"); st.id="icStyle"; st.textContent=IC_STYLE; document.head.appendChild(st); })();
function IC(n){ return '<i class="ic ic-'+n+'"></i>'; }
Object.assign(window,{ IC, IC_SET });
