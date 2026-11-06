/* sort.js
   Перестановка зажатием, как в Notion: направления в левой панели и карточки направлений на главной.
   Образец - initSort в mockups/app.js. Мышь: потянуть на 6 пикселей. Палец: подержать пальцем, потом тянуть
   (иначе не отличить от прокрутки). Порядок хранится в data.secOrder (список id), метка синхронизации or:sections:
   более свежая перестановка с любого устройства побеждает целиком (lwwArr в cloud-sync.js). */

/* расставляет разделы по data.secOrder; кого в списке нет (новое направление) - в конец, в прежнем порядке */
function secApplyOrder(d){ const ord=d.secOrder; if(!ord||!ord.length) return d;
  const rank=s=>{ const i=ord.indexOf(s.id); return i<0?1e6:i; };
  d.sections=d.sections.map((s,i)=>[rank(s),i,s]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(x=>x[2]); return d; }
function secSaveOrder(ids){ const have=data.sections.map(s=>s.id);
  data.secOrder=ids.filter(id=>have.indexOf(id)>=0).concat(have.filter(id=>ids.indexOf(id)<0));
  secApplyOrder(data); mstamp("or:sections"); save(); }

(function initSort(){
  let st=null, suppress=false;
  const SKIP="input,select,textarea,button,.cam,.ck,.pop";
  const HOLD_MS=380;
  document.addEventListener("pointerdown",e=>{
    if(e.button!==0||st) return;
    if(e.target.closest(SKIP)) return;
    const item=e.target.closest("[data-sid]");
    if(!item||!item.parentElement||!item.parentElement.dataset.sort) return;
    st={item:item,cont:item.parentElement,group:item.parentElement.dataset.sort,x0:e.clientX,y0:e.clientY,on:false,touch:e.pointerType!=="mouse",timer:0};
    if(st.touch){ const s=st; s.timer=setTimeout(()=>{ if(st===s&&!s.on){ start(); move({clientX:s.x0,clientY:s.y0}); } },HOLD_MS); }
  });
  document.addEventListener("pointermove",e=>{
    if(!st) return;
    if(!st.on){ const far=Math.hypot(e.clientX-st.x0,e.clientY-st.y0);
      if(st.touch){ if(far>9){ clearTimeout(st.timer); st=null; } return; }   // палец поехал раньше срока - это прокрутка
      if(far<6) return; start(); }
    move(e); });
  /* пока тянем пальцем, страница не должна прокручиваться */
  document.addEventListener("touchmove",e=>{ if(st&&st.on) e.preventDefault(); },{passive:false});
  function start(){
    const r=st.item.getBoundingClientRect(), g=st.item.cloneNode(true);
    g.classList.add("dragghost"); g.removeAttribute("data-sid");
    g.style.width=r.width+"px"; g.style.height=r.height+"px"; g.style.left=r.left+"px"; g.style.top=r.top+"px";
    document.getElementById("app").appendChild(g); st.ghost=g;     // стили .mk: призрак должен лежать внутри #app
    st.item.classList.add("dragsrc"); document.body.classList.add("dragging");
    document.querySelectorAll('[data-sort="'+st.group+'"]').forEach(c=>c.classList.add("droparea"));
    st.on=true; const s=getSelection(); if(s) s.removeAllRanges(); }
  function move(e){
    st.ghost.style.transform="translate("+(e.clientX-st.x0)+"px,"+(e.clientY-st.y0)+"px) rotate(1.6deg) scale(1.03)";
    const H=window.innerHeight||600; if(e.clientY<70) window.scrollBy(0,-14); else if(e.clientY>H-70) window.scrollBy(0,14);
    const conts=[].slice.call(document.querySelectorAll('[data-sort="'+st.group+'"]'));
    let target=null;
    for(const c of conts){ const r=c.getBoundingClientRect();
      if(e.clientX>=r.left-12&&e.clientX<=r.right+12&&e.clientY>=r.top-12&&e.clientY<=r.bottom+12){ target=c; break; } }
    if(!target) return;
    conts.forEach(c=>c.classList.toggle("droptarget",c===target));
    const kids=[].slice.call(target.children).filter(k=>k.dataset.sid&&k!==st.item);
    let ref=null, append=false;
    if(!kids.length) append=true;
    else{ let best=null, bd=1e9;
      for(const k of kids){ const r=k.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
        const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
        const dd=inside?-1:Math.hypot(e.clientX-cx,e.clientY-cy); if(dd<bd){ bd=dd; best=k; } }
      const r=best.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      const grid=target.classList.contains("dirs");
      const before=grid?(Math.abs(e.clientY-cy)<r.height/2?e.clientX<cx:e.clientY<cy):e.clientY<cy;
      ref=before?best:best.nextElementSibling;
      if(ref===st.item) ref=st.item.nextElementSibling; }
    if(!append&&st.item.parentElement===target&&st.item.nextElementSibling===ref) return;
    if(append&&st.item.parentElement===target) return;
    const sibs=[].slice.call(document.querySelectorAll('[data-sort="'+st.group+'"] > [data-sid]')).filter(k=>k!==st.item);
    const before0=new Map(sibs.map(k=>[k,k.getBoundingClientRect()]));
    if(append) target.appendChild(st.item); else target.insertBefore(st.item,ref);
    sibs.forEach(k=>{ const r0=before0.get(k), r1=k.getBoundingClientRect(), dx=r0.left-r1.left, dy=r0.top-r1.top;
      if(dx||dy){ k.style.transition="none"; k.style.transform="translate("+dx+"px,"+dy+"px)";
        requestAnimationFrame(()=>{ k.style.transition="transform .18s ease"; k.style.transform=""; setTimeout(()=>{ k.style.transition=""; },220); }); } }); }
  function end(cancel){
    if(!st) return; const s=st; st=null; clearTimeout(s.timer); if(!s.on) return;
    s.ghost.remove(); s.item.classList.remove("dragsrc"); document.body.classList.remove("dragging");
    document.querySelectorAll(".droparea,.droptarget").forEach(c=>c.classList.remove("droparea","droptarget"));
    suppress=true; setTimeout(()=>{ suppress=false; },60);       // отпускание над карточкой не должно открывать её
    if(cancel){ render(); return; }
    const ids=[].slice.call(s.item.parentElement.children).filter(k=>k.dataset.sid).map(k=>k.dataset.sid);
    if(s.group==="sport"){ const sp=spData(); if(sp){ sp.cardOrder=ids; mstamp("or:sport"); save(); } }   // порядок карточек «Спорта»: метка or:sport (lwwArr в cloud-sync.js)
    else secSaveOrder(ids);
    render(); }
  document.addEventListener("pointerup",()=>end(false));
  document.addEventListener("pointercancel",()=>end(true));
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&st&&st.on) end(true); });
  document.addEventListener("click",e=>{ if(suppress){ e.preventDefault(); e.stopPropagation(); } },true);
  /* родная перетаскивалка браузера (картинки, ссылки) мешает - гасим её на переставляемых элементах */
  document.addEventListener("dragstart",e=>{ if(e.target.closest&&e.target.closest("[data-sort]>[data-sid]")) e.preventDefault(); });
})();

Object.assign(window,{ secApplyOrder, secSaveOrder });
