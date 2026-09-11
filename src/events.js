/* events.js
   Журнал событий (шаг R0.4). Записывает не ЧТО отмечено, а КАК трекером
   пользуются: заходы, отметки с двумя датами, создание и смену состояния блоков.

   Железные правила:
   - журнал никогда не ломает трекер: любая ошибка внутри глотается;
   - основные данные (progress_tracker_v4) и их синхронизацию журнал не трогает.
     У него свой ключ в localStorage и свои строки в той же таблице Supabase -
     по одной строке на месяц, код "<код синхронизации>#ev:2026-09". В основной
     файл журнал не кладётся намеренно: основной файл уходит в облако целиком
     при каждой галочке, и через полгода он вырос бы раз в десять;
   - наружу ничего, кроме своей Supabase;
   - события старше EV_KEEP_DAYS удаляются и с устройства, и из облака.

   Журнал пишет сырые факты. Что считать одним заходом, что - отметкой задним
   числом, решает скрипт tools/baseline-v1.js, а не приложение. */

const EV_KEY="tracker_events_v1", EV_DIRTY_KEY="tracker_events_dirty", EV_DEV_KEY="tracker_device", EV_GC_KEY="tracker_events_gc";
const EV_KEEP_DAYS=183;             // полгода
const EV_IDLE_MS=5*60*1000;         // 5 минут без касаний при открытом экране - заход закончился
const EV_SAME_MS=60*1000;           // повтор того же ключа в пределах минуты - та же отметка
const EV_MOBILE=!!(window.matchMedia&&window.matchMedia("(pointer:coarse)").matches);
let evList=null, evRev=0, evSaveT=null, evFlushT=null, evInVisit=false, evLastInput=Date.now(), evFlushBusy=false, evFlushAgain=false;

/* ---- хранение на устройстве ---- */
function evAll(){ if(evList) return evList;
  try{ const r=JSON.parse(localStorage.getItem(EV_KEY)||"[]"); evList=Array.isArray(r)?r:[]; }catch(e){ evList=[]; }
  const cut=Date.now()-EV_KEEP_DAYS*864e5; evList=evList.filter(x=>x&&x.at>=cut);
  return evList; }
function evSaveNow(){ clearTimeout(evSaveT); evSaveT=null; if(!evList) return;
  try{ localStorage.setItem(EV_KEY,JSON.stringify(evList)); }
  catch(e){ /* память переполнена: отрезаем самую старую десятую часть журнала и пробуем ещё раз */
    try{ evList.sort((a,b)=>a.at-b.at); evList=evList.slice(Math.ceil(evList.length/10)); localStorage.setItem(EV_KEY,JSON.stringify(evList)); }catch(e2){} } }
function evSaveSoon(){ if(!evSaveT) evSaveT=setTimeout(evSaveNow,1000); }
function evDev(){ try{ let d=localStorage.getItem(EV_DEV_KEY);
  if(!d){ d=(EV_MOBILE?"mob-":"desk-")+uid(); localStorage.setItem(EV_DEV_KEY,d); } return d; }catch(e){ return EV_MOBILE?"mob":"desk"; } }
function evMonth(ms){ return ymd(new Date(ms)).slice(0,7); }
function evLocal(ms){ const d=new Date(ms); return ymd(d)+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0"); }

/* ---- запись ---- */
function evLog(type,extra,at){ try{ const list=evAll(), t=at||Date.now();
  const e=Object.assign({id:uid()+t.toString(36), type:type, at:t, local:evLocal(t), dev:evDev()},extra||{});
  list.push(e); evRev++; evDirty(evMonth(t)); evSaveSoon(); return e; }catch(err){ return null; } }
/* Где стояла: вкладка, и открыто ли поверх неё окно (план, настройки) */
function evScreen(){ try{ if(!window.data) return null; const a=data.active, s=(data.sections||[]).find(x=>x.id===a);
  let v=s?s.kind:a; const ov=document.getElementById("overlay"); if(ov&&ov.classList.contains("on")) v+="+окно"; return v; }catch(e){ return null; } }
/* За какой день отметка: дата из ключа, иначе неделя, иначе у отметки нет дня (урок, серия) */
function evFor(key){ const d=String(key).match(/(\d{4}-\d{2}-\d{2})/); if(d) return d[1];
  const w=String(key).match(/(\d{4}-W\d{2})/); return w?w[1]:null; }
/* Отметка. Зовётся из mstamp - через неё проходит любая галочка, число и заметка. */
function evMark(key){ try{ if(!key||String(key).indexOf("pa:")===0) return;   // пауза пишется своим событием block_state
  const now=Date.now(), list=evAll();
  /* заметка печатается по букве, и каждая буква ставит метку - повторы ключа в пределах минуты схлопываем */
  for(let i=list.length-1;i>=0&&i>=list.length-40;i--){ const x=list[i];
    if(x.type==="mark"&&x.key===key&&now-(x.last||x.at)<EV_SAME_MS){ x.n=(x.n||1)+1; x.last=now; evRev++; evDirty(evMonth(x.at)); evSaveSoon(); return; } }
  evLastInput=now; if(!evInVisit) evOpen("active");
  evLog("mark",{key:String(key), for:evFor(key), src:"app", screen:evScreen()},now); }catch(e){} }

/* ---- заходы ---- */
function evOpen(how){ if(evInVisit) return; evInVisit=true; evLastInput=Date.now();
  evLog("open",{how:how, screen:evScreen()}); evFlushSoon(); }
function evEnd(why,at){ if(!evInVisit) return; evInVisit=false;
  evLog("end",{why:why},at); evSaveNow(); evFlush(); }
function evTouch(){ evLastInput=Date.now(); if(!evInVisit&&document.visibilityState==="visible") evOpen("active"); }
function evInit(){ try{ evAll();
  document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="visible") evOpen("return"); else evEnd("hide"); });
  window.addEventListener("pagehide",function(){ evEnd("close"); evSaveNow(); });
  /* На компьютере вкладка может быть «видимой» весь день под другими окнами - там ещё и фокус окна */
  if(!EV_MOBILE){ window.addEventListener("blur",function(){ evEnd("blur"); });
    window.addEventListener("focus",function(){ if(document.visibilityState==="visible") evOpen("focus"); }); }
  ["pointerdown","keydown","wheel","touchstart"].forEach(t=>document.addEventListener(t,evTouch,{capture:true,passive:true}));
  setInterval(function(){ if(evInVisit&&Date.now()-evLastInput>EV_IDLE_MS) evEnd("idle",evLastInput); },30000);
  window.addEventListener("online",evFlushSoon);
  if(document.visibilityState==="visible") evOpen("launch"); }catch(e){} }

/* ---- синхронизация с Supabase ---- */
function evDirtyList(){ try{ const r=JSON.parse(localStorage.getItem(EV_DIRTY_KEY)||"[]"); return Array.isArray(r)?r:[]; }catch(e){ return []; } }
function evDirty(m){ const d=evDirtyList(); if(d.indexOf(m)<0){ d.push(m); try{ localStorage.setItem(EV_DIRTY_KEY,JSON.stringify(d)); }catch(e){} } }
function evUndirty(m){ try{ localStorage.setItem(EV_DIRTY_KEY,JSON.stringify(evDirtyList().filter(x=>x!==m))); }catch(e){} }
const evStamp=x=>x.last||x.at;
/* События другого устройства - к себе. Возвращает, сколько добавилось. */
function evMerge(arr){ if(!Array.isArray(arr)) return 0; const list=evAll(), byId={}, cut=Date.now()-EV_KEEP_DAYS*864e5; let n=0;
  list.forEach(x=>{ byId[x.id]=x; });
  arr.forEach(x=>{ if(!x||!x.id||!(x.at>=cut)) return; const mine=byId[x.id];
    if(!mine){ list.push(x); byId[x.id]=x; evDirty(evMonth(x.at)); n++; }
    else if(evStamp(x)>evStamp(mine)){ mine.n=x.n; mine.last=x.last; n++; } });
  if(n){ evRev++; evSaveNow(); } return n; }
function evSyncMonth(m){ const code=syncCfg.code+"#ev:"+m, rev0=evRev;
  return fetch(syncCfg.url+"/rest/v1/trackers?code=eq."+encodeURIComponent(code)+"&select=data",{headers:syncHdr()})
  .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
  .then(rows=>{ const cloud=(rows&&rows[0]&&rows[0].data&&Array.isArray(rows[0].data.events))?rows[0].data.events:[];
    evMerge(cloud);
    const had={}; cloud.forEach(x=>{ if(x&&x.id) had[x.id]=evStamp(x); });
    const mine=evAll().filter(x=>evMonth(x.at)===m);
    if(!mine.some(x=>!(x.id in had)||evStamp(x)>had[x.id])){ if(evRev===rev0) evUndirty(m); return; }
    const body=JSON.stringify([{code:code, data:{events:mine}, updated_at:new Date().toISOString()}]);
    return fetch(syncCfg.url+"/rest/v1/trackers",{method:"POST",headers:Object.assign(syncHdr(),{"Prefer":"resolution=merge-duplicates"}),body:body})
      .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); if(evRev===rev0) evUndirty(m); else evFlushAgain=true; }); }); }
/* Облачные строки старше полугода. Удаляются только строки с «#ev:» в коде,
   перечисленные поимённо, - основная строка с данными трекера под фильтр попасть не может. */
function evGc(){ const code=syncCfg.code; if(/["\\]/.test(code)) return;
  const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-7); const upTo=evMonth(d.getTime());
  let done=""; try{ done=localStorage.getItem(EV_GC_KEY)||""; }catch(e){} if(done===upTo) return;
  const codes=[]; for(let i=0;i<24;i++){ codes.push('"'+code+"#ev:"+evMonth(d.getTime())+'"'); d.setMonth(d.getMonth()-1); }
  return fetch(syncCfg.url+"/rest/v1/trackers?code=in.("+encodeURIComponent(codes.join(","))+")",{method:"DELETE",headers:syncHdr()})
  .then(r=>{ if(r.ok){ try{ localStorage.setItem(EV_GC_KEY,upTo); }catch(e){} } }); }
function evFlush(){ try{ if(typeof syncConfigured!=="function"||!syncConfigured()||navigator.onLine===false) return Promise.resolve();
  if(evFlushBusy){ evFlushAgain=true; return Promise.resolve(); }
  evFlushBusy=true; evSaveNow(); clearTimeout(evFlushT); evFlushT=null;
  const months=evDirtyList(), now=new Date(), cur=evMonth(now.getTime());
  if(months.indexOf(cur)<0) months.push(cur);
  /* в первую неделю месяца подтягиваем и прошлый: события другого устройства за его конец */
  if(now.getDate()<=7){ const p=new Date(now.getFullYear(),now.getMonth()-1,1), pm=evMonth(p.getTime()); if(months.indexOf(pm)<0) months.push(pm); }
  let chain=Promise.resolve();
  months.forEach(m=>{ chain=chain.then(()=>evSyncMonth(m)); });
  return chain.then(evGc).catch(function(){}).then(function(){ evFlushBusy=false;
    if(evFlushAgain){ evFlushAgain=false; evFlushSoon(); } }); }catch(e){ evFlushBusy=false; return Promise.resolve(); } }
function evFlushSoon(){ if(!evFlushT) evFlushT=setTimeout(function(){ evFlushT=null; evFlush(); },2500); }

/* ---- имена наружу ---- */
Object.assign(window, {
  evAll, evSaveNow, evLog, evMark, evMerge, evFlush, evInit,
  EV_KEY, EV_KEEP_DAYS,
});
