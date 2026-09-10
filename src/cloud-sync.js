/* cloud-sync.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Cloud sync (Supabase) ================= */
const SYNC_KEY="tracker_sync_cfg", DIRTY_KEY="tracker_sync_dirty";
/* Флаг «есть неотправленное» живёт в localStorage и переживает закрытие вкладки,
   потерю сети и убитый браузером фон. Пока он стоит — трекер добивается отправки. */
function isDirty(){ try{ return localStorage.getItem(DIRTY_KEY)==="1"; }catch(e){ return false; } }
function markDirty(){ try{ localStorage.setItem(DIRTY_KEY,"1"); }catch(e){} }
function clearDirty(){ try{ localStorage.removeItem(DIRTY_KEY); }catch(e){} }
function dataScore(d){ if(!d||!d.sections) return 0; let n=0;
  d.sections.forEach(s=>{
    if(s.course){ n+=Object.keys(s.course.done||{}).length+(s.course.timeLog||[]).length+(s.course.moods||[]).length; }
    if(s.sport){ const sp=s.sport; n+=Object.keys(sp.days||{}).length+(sp.weight||[]).length+(sp.workouts||[]).length+(sp.chest||[]).length+(sp.waist||[]).length+(sp.belly||[]).length+(sp.hips||[]).length; }
    if(s.career){ const c=s.career; n+=(c.sessions||[]).length+(c.features||[]).length+(c.timeLog||[]).length+Object.keys((c.vkcourse&&c.vkcourse.done)||{}).length+Object.keys((c.mts&&c.mts.done)||{}).length+Object.keys((c.apply&&c.apply.days)||{}).length+Object.keys((c.li&&c.li.weeks)||{}).length; if(c.stages) Object.keys(c.stages).forEach(k=>Object.keys(c.stages[k]||{}).forEach(kk=>{ if(c.stages[k][kk]) n++; })); }
    if(s.english){ const e=s.english; n+=Object.keys((e.yandex&&e.yandex.done)||{}).length+Math.max(0,Object.keys((e.gravity&&e.gravity.done)||{}).length-3)+(e.speaking||[]).filter(x=>x.done).length
      +Object.keys((e.twenty&&e.twenty.done)||{}).length+Object.keys((e.wdaily&&e.wdaily.days)||{}).length+Object.keys((e.hp&&e.hp.days)||{}).length+Object.keys((e.anki&&e.anki.days)||{}).length; }
    if(s.items){ s.items.forEach(it=>{ if(it.done||it.value||it.minutes) n++; }); }
  }); return n; }
function loadSync(){ try{ const r=localStorage.getItem(SYNC_KEY); window.syncCfg=r?JSON.parse(r):null; }catch(e){ window.syncCfg=null; } return syncCfg; }
function syncConfigured(){ return !!(syncCfg&&syncCfg.url&&syncCfg.key&&syncCfg.code); }
function setSyncStatus(txt,color){ const el=document.getElementById("syncBtn"); if(el){ const s=el.querySelector(".slabel"); if(s) s.textContent=txt; if(color!==undefined) el.style.color=color; } }
/* Кнопка честно показывает, всё ли уже улетело в облако — чтобы было видно,
   можно ли закрывать телефон. */
function updateSyncBtn(){
  if(!syncConfigured()){ setSyncStatus("Синхронизация",""); return; }
  if(pushBusy) return;                                  // «Отправляю…» не перебиваем
  if(navigator.onLine===false){ setSyncStatus("Нет сети · отправлю позже","var(--a-amber)"); return; }
  if(isDirty()){ setSyncStatus("Есть неотправленное","var(--a-amber)"); return; }
  setSyncStatus("Всё сохранено","var(--success)");
}
function syncHdr(){ return {"apikey":syncCfg.key,"Authorization":"Bearer "+syncCfg.key,"Content-Type":"application/json"}; }
/* ---- умное слияние (никогда не теряет отметки) ---- */
function mergeArr(a,b,keyFn){ a=a||[]; b=b||[]; const seen={},out=[]; a.concat(b).forEach(x=>{ const k=keyFn(x); if(!seen[k]){ seen[k]=1; out.push(x); } }); return out; }
function mergeWriting(a,b,aM,bM){ a=a?JSON.parse(JSON.stringify(a)):{}; b=b||{}; Object.keys(b).forEach(w=>{ const A=a[w]||{done:false,note:""}, B=b[w]||{done:false,note:""}; const p="ew:"+w, ta=aM[p]||0, tb=bM[p]||0; a[w]=(tb>ta)?B:((ta>tb)?A:{done:!!(A.done||B.done), note:A.note||B.note}); }); return a; }
/* ---- слияние ежедневных трекеров {дата:{done,note}} ---- */
/* Галочка и комментарий дня сливаются РАЗДЕЛЬНО: у комментария своя метка pfx+ds+"~n".
   Иначе галочка, поставленная на телефоне позже, затирала комментарий с ноутбука. */
function mDailyT(a,b,pfx,aM,bM){ a=a||{}; b=b||{}; const o={},ks={};
  Object.keys(a).forEach(k=>ks[k]=1); Object.keys(b).forEach(k=>ks[k]=1);
  Object.keys(ks).forEach(ds=>{ const A=a[ds]||{}, B=b[ds]||{}; const p=pfx+ds, ta=aM[p]||0, tb=bM[p]||0;
    const done=(ta||tb)?((tb>ta)?!!B.done:!!A.done):!!(A.done||B.done);
    const pn=p+"~n", hasN=((pn in aM)||(pn in bM));
    const na=hasN?(aM[pn]||0):ta, nb=hasN?(bM[pn]||0):tb;   // старые данные без ~n — как раньше, по метке дня
    let note; if(na||nb) note=(nb>na)?(B.note||""):(A.note||""); else note=A.note||B.note||"";
    note=String(note||"");
    /* Минуты едут на метке дня, как и done: отдельная метка была бы расхождением
       с этой же функцией и источником багов при синхронизации. */
    const min=(ta||tb)?((tb>ta)?(B.min||0):(A.min||0)):Math.max(A.min||0,B.min||0);
    if(done||note.trim()||min){ const r={done:done, note:note}; if(min) r.min=min; o[ds]=r; } });
  return o; }
function mmT(a,b,pfx,aM,bM){ a=a||{}; b=b||{}; const out={},keys={}; Object.keys(a).forEach(k=>keys[k]=1); Object.keys(b).forEach(k=>keys[k]=1);
  Object.keys(keys).forEach(k=>{ const p=pfx+k, ta=aM[p]||0, tb=bM[p]||0; const va=!!a[k], vb=!!b[k]; let present; if(!ta&&!tb) present=va||vb; else present=(ta>=tb)?va:vb; if(present) out[k]=a[k]||b[k]||1; }); return out; }
/* как mmT, но сохраняет явные false (для чек-поинтов: {cp1:false,...} не должно схлопываться в {}) */
function mFlagsT(a,b,pfx,aM,bM){ a=a||{}; b=b||{}; const out={},keys={}; Object.keys(a).forEach(k=>keys[k]=1); Object.keys(b).forEach(k=>keys[k]=1);
  Object.keys(keys).forEach(k=>{ const p=pfx+k, ta=aM[p]||0, tb=bM[p]||0; const va=!!a[k], vb=!!b[k]; out[k]=(!ta&&!tb)?(va||vb):((ta>=tb)?va:vb); }); return out; }
/* тренировки: массив дат. Метка wo:<дата> — чтобы удаление не воскресало с другого устройства */
function mWorkoutsT(a,b,aM,bM){ const A={},B={}; (a||[]).forEach(x=>A[x]=1); (b||[]).forEach(x=>B[x]=1);
  return Object.keys(mmT(A,B,"wo:",aM,bM)).sort(); }
/* заметки недели: последняя правка побеждает по метке wn:<неделя> */
function mNotesT(a,b,aM,bM){ a=a||{}; b=b||{}; const o={},ks={}; Object.keys(a).forEach(k=>ks[k]=1); Object.keys(b).forEach(k=>ks[k]=1);
  Object.keys(ks).forEach(w=>{ const v=lwwField(a[w],b[w],"wn:"+w,aM,bM); if(v&&String(v).trim()) o[w]=v; }); return o; }
/* порядок блоков: массив целиком, побеждает более свежая метка or:<раздел> */
function lwwArr(av,bv,p,aM,bM){ const ta=aM[p]||0, tb=bM[p]||0;
  if(ta||tb) return ((tb>ta)?bv:av)||av||bv||[];
  return (av&&av.length)?av:(bv||av||[]); }
/* шаблон постоянных строк плана: по строке на раздел, метка pl:<раздел> */
function mTplT(a,b,aM,bM){ a=a||{}; b=b||{}; const o={},ks={}; Object.keys(a).forEach(k=>ks[k]=1); Object.keys(b).forEach(k=>ks[k]=1);
  Object.keys(ks).forEach(k=>{ const v=lwwField(a[k],b[k],"pl:"+k,aM,bM); if(v!==undefined&&v!==null) o[k]=v; }); return o; }
/* числовые карты (минуты) — последняя правка побеждает по метке pfx+ключ.
   mmT здесь не годится: она отдаёт a[k]||b[k] и теряет более свежее число. */
function mNumT(a,b,pfx,aM,bM){ a=a||{}; b=b||{}; const o={},ks={}; Object.keys(a).forEach(k=>ks[k]=1); Object.keys(b).forEach(k=>ks[k]=1);
  Object.keys(ks).forEach(k=>{ const v=lwwField(a[k],b[k],pfx+k,aM,bM); if(v) o[k]=v; }); return o; }
/* поля, о которых эта сборка ещё не знает (старая версия на другом устройстве), переносим как есть */
function mKeepUnknown(a,b){ if(!a||!b) return; Object.keys(b).forEach(k=>{ if(!(k in a)) { try{ a[k]=JSON.parse(JSON.stringify(b[k])); }catch(e){} } }); }
/* Поля дня перечислены явно: новое поле обязано попасть в этот список, иначе
   оно не переживёт синхронизацию телефон ↔ ноутбук — и всплывёт это не сразу. */
const DAY_FIELDS=['steps','warmup','photos','report','stepsCount','kcal','protein','fat','carbs','energy','sleepH','wakeN','bed','cola','reha','painR','painL','painS'];
/* Для боли и пробуждений 0 — записанное значение «не болит» / «не просыпалась»,
   а не пустота. Такие поля нельзя отбрасывать как falsy. */
const DAY_KEEP0={wakeN:1,painR:1,painL:1,painS:1};
function mDayT(a,b,pfx,aM,bM){ a=a||{}; b=b||{}; const o={}; DAY_FIELDS.forEach(f=>{ const p=pfx+f, ta=aM[p]||0, tb=bM[p]||0; let v;
  if(ta||tb){ v=(ta>=tb)?a[f]:b[f]; }
  else { const av=a[f],bv=b[f];
    if(typeof av==='boolean'||typeof bv==='boolean') v=(av||bv)?true:false;
    else if(DAY_KEEP0[f]) v=(av!=null?av:bv);
    else v=Math.max(av||0,bv||0); }
  if(v||(DAY_KEEP0[f]&&v===0)) o[f]=v; }); return o; }
function mDaysT(a,b,aM,bM){ a=a||{}; b=b||{}; const o={},ks={}; Object.keys(a).forEach(k=>ks[k]=1); Object.keys(b).forEach(k=>ks[k]=1); Object.keys(ks).forEach(d=>o[d]=mDayT(a[d],b[d],"sd:"+d+".",aM,bM)); return o; }
function mStagesT(a,b,aM,bM){ a=a||{}; b=b||{}; const o={},sts={}; Object.keys(a).forEach(k=>sts[k]=1); Object.keys(b).forEach(k=>sts[k]=1); Object.keys(sts).forEach(st=>{ o[st]={}; const ks={}; Object.keys(a[st]||{}).forEach(k=>ks[k]=1); Object.keys(b[st]||{}).forEach(k=>ks[k]=1); Object.keys(ks).forEach(k=>{ const p="st:"+st+"."+k, ta=aM[p]||0, tb=bM[p]||0; const va=!!(a[st]||{})[k], vb=!!(b[st]||{})[k]; let present; if(!ta&&!tb) present=va||vb; else present=(ta>=tb)?va:vb; o[st][k]=!!present; }); }); return o; }
function mSpeakT(a,b,aM,bM){ a=a||[]; b=b||[]; const o=[]; for(let i=0;i<4;i++){ const p="es:"+i, ta=aM[p]||0, tb=bM[p]||0; let x; if(ta||tb) x=(ta>=tb)?(a[i]||{}):(b[i]||{}); else { const xa=a[i]||{},xb=b[i]||{}; x={done:!!(xa.done||xb.done),date:xa.date||xb.date||null,note:xa.note||xb.note||"",min:xa.min||xb.min||0}; } o.push({done:!!x.done,date:x.date||null,note:x.note||"",min:x.min||0}); } return o; }
function mergeSection(m,b,aM,bM){
  if(b.kind==="course"&&b.course){ const c=m.course; c.done=mmT(c.done,b.course.done,"co:",aM,bM); c.timeLog=mergeArr(c.timeLog,b.course.timeLog,t=>t.d+"|"+t.m+"|"+(t.note||"")); c.moods=mergeArr(c.moods,b.course.moods,x=>x.ts); c.tlog=mNumT(c.tlog,b.course.tlog,"tl:",aM,bM); c.cardOrder=lwwArr(c.cardOrder,b.course.cardOrder,"or:course",aM,bM); c.paused=mmT(c.paused,b.course.paused||{},"pa:",aM,bM); c.exp=Object.assign({},b.course.exp,c.exp); mKeepUnknown(c,b.course); }
  else if(b.kind==="sport"&&b.sport){ const a=m.sport,bb=b.sport; a.days=mDaysT(a.days,bb.days,aM,bM); a.workouts=mWorkoutsT(a.workouts,bb.workouts,aM,bM); a.weight=mergeArr(a.weight,bb.weight,x=>x.date+"|"+x.kg); ['chest','waist','belly','hips'].forEach(k=>{ a[k]=mergeArr(a[k],bb[k],x=>x.date+"|"+x.cm); }); a.energy=mergeArr(a.energy,bb.energy,x=>x.week); a.weekNotes=mNotesT(a.weekNotes,bb.weekNotes,aM,bM); a.cook=mNumT(a.cook,bb.cook,"ck:",aM,bM); a.cardOrder=lwwArr(a.cardOrder,bb.cardOrder,"or:sport",aM,bM); a.paused=mmT(a.paused,bb.paused||{},"pa:",aM,bM); a.archives=mergeArr(a.archives,bb.archives,x=>x.id||((x.start||"")+"|"+(x.end||"")));
    a.physio=a.physio||{done:{},dates:{}}; const bph=bb.physio||{}; a.physio.done=mmT(a.physio.done,bph.done,"fz:",aM,bM); a.physio.dates=Object.assign({},bph.dates||{},a.physio.dates||{});
    if((!a.config||!a.config.startDate)&&bb.config&&bb.config.startDate){ a.config=Object.assign({},a.config,bb.config); } mKeepUnknown(a,bb); delete a.lifts; }
  else if(b.kind==="career"&&b.career){ const a=m.career,bb=b.career; a.sessions=mergeArr(a.sessions,bb.sessions,x=>x); a.features=mergeArr(a.features,bb.features,x=>(x.date||"")+"|"+(x.feature||"")); a.timeLog=mergeArr(a.timeLog,bb.timeLog,t=>t.d+"|"+t.m+"|"+(t.note||"")); a.later=mergeArr(a.later,bb.later,x=>x); a.vkcourse=a.vkcourse||{done:{}}; a.vkcourse.done=mmT(a.vkcourse.done,(bb.vkcourse||{}).done,"vk:",aM,bM); a.mts=a.mts||{done:{},exp:{}}; a.mts.done=mmT(a.mts.done,(bb.mts||{}).done,"mt:",aM,bM); a.apply=a.apply||{days:{}}; a.apply.days=mDailyT(a.apply.days,(bb.apply||{}).days,"ap:",aM,bM); a.li=a.li||{weeks:{}}; a.li.weeks=mDailyT(a.li.weeks,(bb.li||{}).weeks,"li:",aM,bM); a.stages=mStagesT(a.stages,bb.stages,aM,bM); a.checkpoints=mFlagsT(a.checkpoints,bb.checkpoints,"st:cp.",aM,bM); a.tlog=mNumT(a.tlog,bb.tlog,"tl:",aM,bM); a.cardOrder=lwwArr(a.cardOrder,bb.cardOrder,"or:career",aM,bM); a.paused=mmT(a.paused,bb.paused||{},"pa:",aM,bM); if((!a.config||!a.config.startDate)&&bb.config&&bb.config.startDate){ a.config=Object.assign({},a.config,bb.config); } mKeepUnknown(a,bb); }
  else if(b.kind==="english"&&b.english){ const a=m.english,bb=b.english; a.yandex=a.yandex||{done:{}}; a.yandex.done=mmT(a.yandex.done,(bb.yandex||{}).done,"ya:",aM,bM); a.gravity=a.gravity||{done:{}}; a.gravity.done=mmT(a.gravity.done,(bb.gravity||{}).done,"gv:",aM,bM); a.speaking=mSpeakT(a.speaking,bb.speaking,aM,bM); a.theory=a.theory||{done:{}}; a.theory.done=mmT(a.theory.done,(bb.theory||{}).done,"th:",aM,bM); a.a11y=a.a11y||{done:{},exp:{}}; a.a11y.done=mmT(a.a11y.done,(bb.a11y||{}).done,"ax:",aM,bM); a.a11y.min=mNumT(a.a11y.min,(bb.a11y||{}).min,"ax:",aM,bM); a.writing=mergeWriting(a.writing,bb.writing,aM,bM);
    a.twenty=a.twenty||{done:{}}; a.twenty.done=mmT(a.twenty.done,(bb.twenty||{}).done,"tw:",aM,bM);
    a.wdaily=a.wdaily||{days:{}}; a.wdaily.days=mDailyT(a.wdaily.days,(bb.wdaily||{}).days,"wd:",aM,bM);
    a.hp=a.hp||{days:{}}; a.hp.days=mDailyT(a.hp.days,(bb.hp||{}).days,"hp:",aM,bM);
    a.anki=a.anki||{days:{}}; a.anki.days=mDailyT(a.anki.days,(bb.anki||{}).days,"ak:",aM,bM);
    a.shadow=a.shadow||{days:{}}; a.shadow.days=mDailyT(a.shadow.days,(bb.shadow||{}).days,"sh:",aM,bM);
    a.scene=a.scene||{days:{}}; a.scene.days=mDailyT(a.scene.days,(bb.scene||{}).days,"sc:",aM,bM);
    a.lessons=a.lessons||{weeks:{}}; a.lessons.weeks=mDailyT(a.lessons.weeks,(bb.lessons||{}).weeks,"ls:",aM,bM);
    a.ankiQueue=a.ankiQueue||{done:{}}; a.ankiQueue.done=mmT(a.ankiQueue.done,(bb.ankiQueue||{}).done,"aq:",aM,bM);
    a.paused=mmT(a.paused,(bb.paused)||{},"pa:",aM,bM);
    a.tlog=mNumT(a.tlog,bb.tlog,"tl:",aM,bM); a.cardOrder=lwwArr(a.cardOrder,bb.cardOrder,"or:english",aM,bM);
    if((!a.config||!a.config.startDate)&&bb.config&&bb.config.startDate){ a.config=Object.assign({},a.config,bb.config); } mKeepUnknown(a,bb); }
  else if(b.kind==="custom"){ ensureCustom(m); ensureCustom(b);
    m.paused=mmT(m.paused,b.paused||{},"pa:",aM,bM);
    m.cardOrder=lwwArr(m.cardOrder,b.cardOrder,"or:"+b.id,aM,bM);
    m.cardExp=Object.assign({},b.cardExp||{},m.cardExp||{});
    /* имя, цвет, иконка, подпись раздела — последняя правка по метке cs:<id> */
    const sp="cs:"+b.id; if((bM[sp]||0)>(aM[sp]||0)){ m.name=b.name; m.sub=b.sub; m.color=b.color; m.icon=b.icon; }
    mKeepUnknown(m,b); }
  else if(b.kind==="generic"&&b.items&&m.items){ b.items.forEach(bi=>{ const mi=m.items.find(x=>x.id===bi.id||x.name===bi.name); if(mi){ if(bi.done)mi.done=true; if(bi.value)mi.value=Math.max(mi.value||0,bi.value||0); if(bi.minutes)mi.minutes=Math.max(mi.minutes||0,bi.minutes||0); } else m.items.push(JSON.parse(JSON.stringify(bi))); }); }
  mergeBlocksT(m,b,aM,bM);   // блоки конструктора сливаются у раздела ЛЮБОГО типа
}
/* Слияние блоков конструктора: тумбстоны объединяются, отметки — по меткам cb:,
   структура блока (название, настройки, состав пунктов) — со стороны с более
   свежей меткой cb:<id>~cfg; пункты, добавленные на отставшей стороне, доливаются по id */
function mergeBlocksT(m,b,aM,bM){ ensureBlocks(m); ensureBlocks(b);
  b.blocksDeleted.forEach(id=>{ if(m.blocksDeleted.indexOf(id)<0) m.blocksDeleted.push(id); });
  b.blocks.forEach(bb=>{ if(m.blocksDeleted.indexOf(bb.id)>=0) return;
    const mb=m.blocks.find(x=>x.id===bb.id);
    if(!mb){ m.blocks.push(JSON.parse(JSON.stringify(bb))); return; }
    const pfx="cb:"+bb.id+".", cp="cb:"+bb.id+"~cfg", ta=aM[cp]||0, tb=bM[cp]||0;
    const fresher=(tb>ta)?bb:mb, stale=(tb>ta)?mb:bb;
    mb.name=fresher.name;
    (bb.del||[]).forEach(id=>{ if(mb.del.indexOf(id)<0) mb.del.push(id); });
    if(mb.type==="habit"){ mb.ph=fresher.ph; mb.days=mDailyT(mb.days,bb.days,pfx,aM,bM); }
    else if(mb.type==="dcounter"){ mb.unit=fresher.unit; mb.goal=fresher.goal; mb.days=mNumT(mb.days,bb.days,pfx,aM,bM); }
    else if(mb.type==="checklist"){
      const items=JSON.parse(JSON.stringify(fresher.items||[]));
      (stale.items||[]).forEach(it=>{ if(!items.find(x=>x.id===it.id)) items.push(JSON.parse(JSON.stringify(it))); });
      mb.items=items.filter(it=>mb.del.indexOf(it.id)<0);
      mb.done=mmT(mb.done,bb.done,pfx,aM,bM); }
    else if(mb.type==="program"){
      const groups=JSON.parse(JSON.stringify(fresher.groups||[]));
      (stale.groups||[]).forEach(g=>{ const mg=groups.find(x=>x.id===g.id);
        if(!mg){ groups.push(JSON.parse(JSON.stringify(g))); return; }
        g.lessons.forEach(l=>{ if(!mg.lessons.find(x=>x.id===l.id)) mg.lessons.push(JSON.parse(JSON.stringify(l))); }); });
      groups.forEach(g=>{ g.lessons=g.lessons.filter(l=>mb.del.indexOf(l.id)<0); });
      mb.groups=groups.filter(g=>mb.del.indexOf(g.id)<0);
      mb.done=mmT(mb.done,bb.done,pfx,aM,bM); mb.exp=Object.assign({},bb.exp,mb.exp); }
    mKeepUnknown(mb,bb); });
  m.blocks=m.blocks.filter(x=>m.blocksDeleted.indexOf(x.id)<0);
}
function mergeData(A,B){ if(!A) return B; if(!B) return A; const M=JSON.parse(JSON.stringify(A)); const aM=A._m||{}, bM=B._m||{};
  /* тумбстоны удалённых разделов: объединение, потом фильтр — удаление не воскресает */
  M.secDeleted=M.secDeleted||[]; (B.secDeleted||[]).forEach(id=>{ if(M.secDeleted.indexOf(id)<0) M.secDeleted.push(id); });
  (B.sections||[]).forEach(bs=>{ if(M.secDeleted.indexOf(bs.id)>=0) return;
    let ms; if(bs.kind==="custom") ms=M.sections.find(s=>s.kind==="custom"&&s.id===bs.id);
    else if(bs.kind==="generic") ms=M.sections.find(s=>s.kind==="generic"&&s.name===bs.name); else ms=M.sections.find(s=>s.kind===bs.kind);
    if(!ms){ M.sections.push(JSON.parse(JSON.stringify(bs))); } else { mergeSection(ms,bs,aM,bM); } });
  M.sections=M.sections.filter(s=>M.secDeleted.indexOf(s.id)<0);
  M.week=mergeWeek(M.week||A.week, B.week, aM, bM);
  M.plan=mergePlan(M.plan||A.plan, B.plan, aM, bM);
  if(A.planTpl||(B&&B.planTpl)) M.planTpl=mTplT(A.planTpl, B.planTpl, aM, bM);
  M._m=M._m||{}; Object.keys(bM).forEach(p=>{ if((bM[p]||0)>(M._m[p]||0)) M._m[p]=bM[p]; });
  return M; }
/* канонический вид: ключи отсортированы, updatedAt убран. Порядок ключей после слияния
   меняется, а данные — нет; без сортировки сравнение вечно считало, что «что-то изменилось». */
function canonV(v){ if(v===null||typeof v!=="object") return v; if(Array.isArray(v)) return v.map(canonV);
  const o={}; Object.keys(v).sort().forEach(k=>{ if(k==="updatedAt") return; o[k]=canonV(v[k]); }); return o; }
function noTs(d){ try{ return JSON.stringify(canonV(d)); }catch(e){ return ""; } }
/* пока Света печатает в поле — не перерисовываем страницу, иначе введённое пропадает.
   Данные при этом применяем сразу, а перерисовку откладываем до выхода из поля. */
function isTyping(){ const el=document.activeElement; if(!el) return false; const t=(el.tagName||"").toUpperCase();
  return t==="INPUT"||t==="TEXTAREA"||el.isContentEditable===true; }
function syncRender(){ window.pendingRender=false; window.syncApplying=true;
  try{ render(); if(activeCourse()) afterCourseRender(); } finally{ window.syncApplying=false; } }
function flushPendingRender(){ if(pendingRender&&!isTyping()) syncRender(); }
document.addEventListener("focusout",function(){ setTimeout(flushPendingRender,0); });
const POLL_MS=3000;
function syncInit(){ loadSync(); updateSyncBtn();
  if(!syncConfigured()) return;
  const go=function(){ cloudPull(true);
    if(!syncTimer) window.syncTimer=setInterval(function(){ if(document.visibilityState!=="hidden"){ retryPush(); cloudPoll(); } },POLL_MS); };
  // с прошлого раза осталось неотправленное — сначала отдаём его, потом уже читаем облако
  if(isDirty()) cloudPush(true).then(go,go); else go(); }
/* Дешёвая проверка раз в 3 сек: спрашиваем только updated_at (~100 байт).
   Весь файл тянем, только когда другое устройство действительно что-то записало. */
function cloudPoll(){ if(!syncConfigured()||syncBusy||pollBusy||pushBusy) return; window.pollBusy=true;
  fetch(syncCfg.url+"/rest/v1/trackers?code=eq."+encodeURIComponent(syncCfg.code)+"&select=updated_at",{headers:syncHdr()})
  .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
  .then(rows=>{ window.pollBusy=false; const at=(rows&&rows.length)?rows[0].updated_at:null;
    if(at!==lastSeenAt) cloudPull(true); else flushPendingRender(); })
  .catch(function(){ window.pollBusy=false; });
}
function cloudPull(silent){ if(!syncConfigured()||syncBusy) return; window.syncBusy=true; setSyncStatus("Синхр…");
  fetch(syncCfg.url+"/rest/v1/trackers?code=eq."+encodeURIComponent(syncCfg.code)+"&select=data,updated_at",{headers:syncHdr()})
  .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
  .then(rows=>{ window.lastSeenAt=(rows&&rows.length)?rows[0].updated_at:null;
    const cloud=(rows&&rows.length&&rows[0].data)?rows[0].data:null;
    const merged=mergeData(data,cloud); const ls=noTs(data), ms=noTs(merged), csr=cloud?noTs(cloud):null;
    if(ms!==ls){
      window.syncApplying=true;
      try{ window.data=migrate(merged); if(!data.active) data.active="overview"; try{localStorage.setItem(STORE_KEY,JSON.stringify(data));}catch(e){} }
      finally{ window.syncApplying=false; }
      if(isTyping()) window.pendingRender=true; else syncRender();
      if(!silent) toast("Данные объединены"); }
    else flushPendingRender();
    if(csr===null || ms!==csr) pushSoon();   // в облаке нет того, что есть у нас
    updateSyncBtn(); window.syncBusy=false; })
  .catch(e=>{ window.syncBusy=false; setSyncStatus("Нет связи · повторю","var(--a-amber)"); if(!silent) alert("Не удалось синхронизировать: "+e.message); });
}
/* Отметка уходит в облако сразу, а не через паузу: чем короче окно между нажатием
   и отправкой, тем меньше шансов, что телефон успеют закрыть до конца запроса.
   При наборе текста, наоборот, ждём паузу — иначе на каждый символ уйдёт весь файл. */
function pushSoon(){ if(!syncConfigured()) return;
  markDirty(); updateSyncBtn();
  if(pushBusy||pushTimer){ window.pushAgain=true; return; }
  cloudPush(true); }
function schedulePush(){ if(!syncConfigured()||syncApplying) return;
  markDirty(); updateSyncBtn();
  if(pushBusy||pushTimer){ window.pushAgain=true; return; }
  if(isTyping()){ window.pushTimer=setTimeout(function(){ window.pushTimer=null; cloudPush(true); },1200); return; }
  cloudPush(true); }
/* Добиваем всё, что не улетело: при возврате на вкладку, при появлении сети,
   на каждом такте опроса и при запуске. */
function retryPush(){ if(syncConfigured()&&isDirty()&&!pushBusy&&!pushTimer) cloudPush(true); }
document.addEventListener("visibilitychange",function(){ if(!syncConfigured())return;
  if(document.visibilityState==="visible"){ retryPush(); cloudPull(true); }
  else { clearTimeout(pushTimer); window.pushTimer=null; if(isDirty()) cloudPush(true); } });
window.addEventListener("focus",function(){ if(syncConfigured()){ retryPush(); cloudPoll(); } });
window.addEventListener("online",function(){ if(syncConfigured()){ updateSyncBtn(); retryPush(); cloudPoll(); } });
window.addEventListener("offline",function(){ updateSyncBtn(); });
window.addEventListener("pagehide",function(){ if(syncConfigured()&&isDirty()){ clearTimeout(pushTimer); window.pushTimer=null; cloudPush(true); } });
window.addEventListener("beforeunload",function(){ if(syncConfigured()&&isDirty()){ clearTimeout(pushTimer); window.pushTimer=null; cloudPush(true); } });
function cloudPush(silent){ if(!syncConfigured()) return Promise.resolve();
  if(navigator.onLine===false){ markDirty(); updateSyncBtn(); return Promise.resolve(); }   // отправим, когда сеть вернётся
  const stamp=new Date().toISOString(); // UTC только здесь: колонка updated_at
  const revAtPush=dataRev;
  window.pushBusy=true; window.pushAgain=false; setSyncStatus("Отправляю…","var(--a-amber)");
  const body=JSON.stringify([{code:syncCfg.code, data:data, updated_at:stamp}]);
  return fetch(syncCfg.url+"/rest/v1/trackers",{method:"POST",headers:Object.assign(syncHdr(),{"Prefer":"resolution=merge-duplicates"}),body:body})
  .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); window.pushBusy=false; window.lastSeenAt=stamp;
    if(dataRev===revAtPush && !pushAgain) clearDirty();                  // за время отправки ничего не поменялось
    else { window.pushAgain=false; if(!pushTimer) window.pushTimer=setTimeout(function(){ window.pushTimer=null; cloudPush(true); },800); }
    updateSyncBtn(); })
  .catch(e=>{ window.pushBusy=false; markDirty();
    setSyncStatus("Не отправлено · повторю","var(--a-amber)");
    if(!pushTimer) window.pushTimer=setTimeout(function(){ window.pushTimer=null; cloudPush(true); },5000);  // повтор с паузой
    if(!silent) alert("Не удалось сохранить в облако: "+e.message); });
}
function openSyncModal(){ const c=syncCfg||{}; document.getElementById("modal").innerHTML=`
  <h3>Облачная синхронизация</h3><p class="mhint">Данные будут одни и те же на всех устройствах. Введи одинаковый «Код синхронизации» на телефоне и компьютере.</p>
  <label for="syUrl">Supabase Project URL</label><input type="text" id="syUrl" value="${esc(c.url||'')}" placeholder="https://xxxx.supabase.co">
  <label for="syKey">anon public key</label><input type="text" id="syKey" value="${esc(c.key||'')}" placeholder="eyJhbGciOi...">
  <label for="syCode">Код синхронизации (секретное слово)</label><input type="text" id="syCode" value="${esc(c.code||'')}" placeholder="напр. sveta-progress-2026">
  <p class="mhint" style="margin-top:14px">Как получить URL и ключ — см. инструкцию, которую я дал в чате (Supabase → Project Settings → API).</p>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button>${syncConfigured()?'<button class="btn" onclick="syncDisable()">Отключить</button>':''}<button class="btn primary" onclick="saveSyncCfg()">Подключить</button></div>`;
  showModal(); }
function saveSyncCfg(){ const url=document.getElementById("syUrl").value.trim().replace(/\/+$/,''); const key=document.getElementById("syKey").value.trim(); const code=document.getElementById("syCode").value.trim();
  if(!url||!key||!code){ alert("Заполни все три поля"); return; }
  window.syncCfg={url,key,code}; try{localStorage.setItem(SYNC_KEY,JSON.stringify(syncCfg));}catch(e){} closeModal(); updateSyncBtn(); cloudPull(false); toast("Синхронизация подключена"); }
function syncDisable(){ window.syncCfg=null; try{localStorage.removeItem(SYNC_KEY);}catch(e){} closeModal(); updateSyncBtn(); }

/* ---- имена наружу ---- */
Object.assign(window, {
  isDirty, markDirty, clearDirty, dataScore, loadSync, syncConfigured,
  setSyncStatus, updateSyncBtn, syncHdr, mergeArr, mergeWriting, mDailyT,
  mmT, mFlagsT, mWorkoutsT, mNotesT, lwwArr, mTplT,
  mNumT, mKeepUnknown, mDayT, mDaysT, mStagesT, mSpeakT,
  mergeSection, mergeBlocksT, mergeData, canonV, noTs, isTyping,
  syncRender, flushPendingRender, syncInit, cloudPoll, cloudPull, pushSoon,
  schedulePush, retryPush, cloudPush, openSyncModal, saveSyncCfg, syncDisable,
  SYNC_KEY, DIRTY_KEY, DAY_FIELDS, DAY_KEEP0, POLL_MS,
});
