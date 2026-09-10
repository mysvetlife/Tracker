/* report.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Weekly report ================= */
function pctTxt(a,b){ return b?Math.round(a/b*100)+"%":"0%"; }
function spStreakAt(sp,end){ let d=end; if(!spCounted(spDay(sp,d))) d=dateAddDays(d,-1); let n=0; while(spCounted(spDay(sp,d))){ n++; d=dateAddDays(d,-1);} return n; }
function tsInWeek(path,mon){ const t=(data._m||{})[path]||0; if(!t)return false; const s=new Date(mon+"T00:00:00").getTime(), e=new Date(dateAddDays(mon,7)+"T00:00:00").getTime(); return t>=s&&t<e; }
function cWeekSteps(c,mon){ let n=0; COURSE.forEach((l,li)=>l.s.forEach((_,si)=>{ const k=ckey(li,si); if(c.done[k]&&tsInWeek("co:"+k,mon))n++; })); return n; }
function yaWeek(e,mon){ let n=0; for(let i=0;i<YA_PROGRAM.length;i++){ const k=yaKey(i); if(e.yandex.done[k]&&tsInWeek("ya:"+k,mon))n++; } return n; }
function gvWeek(g,mon){ let n=0; GRAVITY.forEach((b,bi)=>b.ep.forEach((_,ei)=>{ const k=gvKey(bi,ei); if(g.done[k]&&tsInWeek("gv:"+k,mon))n++; })); return n; }
function vkWeek(v,mon){ let n=0; VK_PROGRAM.forEach((b,bi)=>b.v.forEach((_,vi)=>{ const k=vkKey(bi,vi); if(v.done[k]&&tsInWeek("vk:"+k,mon))n++; })); return n; }
function crWeekItems(c,mon){ let n=0; CR_STAGES.forEach(st=>st.items.forEach(it=>{ const k=it[0]; if(c.stages[st.key]&&c.stages[st.key][k]&&tsInWeek("st:"+st.key+"."+k,mon))n++; })); return n; }
/* ---- метрики недели: структура {k,label,val,extra,w} + сравнение с прошлой неделей ---- */
function autoMin(sec,mon){
  const cb=cbWeekMin(sec,mon);                           // минуты привычек-блоков, у любого раздела
  if(sec.kind==="sport") return spWeekMin(sec.sport,mon)+cb;
  if(sec.kind==="english") return engWeekMin(sec.english,mon)+cb;
  if(sec.kind==="career") return careerWeekMin(sec.career,mon)+cb;
  if(sec.kind==="course") return tlogWeek(sec.course,"co",mon)+(sec.course.timeLog||[]).filter(t=>mondayOf(t.d)===mon).reduce((a,t)=>a+(t.m||0),0)+cb;
  return cb; }
function autoHours(sec,mon){ return Math.round(autoMin(sec,mon)/6)/10; }
function revRead(sec,mon){ const w=isoWeek(mon), sk=secKey(sec); const d=data.week||{}; return ((d.review||{})[w]||{})[sk]||{}; }
function repHours(sec,mon){ const man=String(revRead(sec,mon).hours||"").trim();
  if(man!==""){ const n=parseFloat(man.replace(",",".")); return isNaN(n)?0:n; }
  return autoHours(sec,mon); }
/* Время в отчёте — часами и минутами: «21 ч 15 мин», а не «21.25 ч».
   Считаем в минутах: autoHours округляет до 0,1 часа и съедает минуты. */
function hTxt(h){ return fmtMin(Math.round(h*60)); }
function repMin(sec,mon){ const man=String(revRead(sec,mon).hours||"").trim();
  if(man!==""){ const n=parseFloat(man.replace(",",".")); return isNaN(n)?0:Math.round(n*60); }
  return autoMin(sec,mon); }
function metTime(sec,mon,o){ const m=repMin(sec,mon); if(m>0) o.push({k:'time',label:'Время',val:fmtMin(m),w:1}); return o; }
function num1(v){ if(v==null) return "—"; return String(Math.round(v*10)/10).replace(".",","); }
function metSport(sec,mon){ const sp=sec.sport; if(!sp.config||!sp.config.startDate) return [{k:'no',label:'Цикл',val:'не настроен'}];
  let counted=0,full=0,steps=0,gd=0,sdays=0; for(let i=0;i<7;i++){ const dd=spDay(sp,dateAddDays(mon,i)); if(spCounted(dd))counted++; if(spFull(dd))full++;
    const st=dd.stepsCount||0; steps+=st; if(st)sdays++; if(st>=spStepGoal(sp))gd++; }
  const o=[]; metTime(sec,mon,o);
  /* Разбивка времени по целям — сразу после общей цифры. */
  const tp=spTimeParts(sp,mon);
  if(tp.length) o.push({k:'tmix',label:'Время по целям',val:tp.map(p=>p.label+' '+fmtMin(p.min)).join(' · ')});
  o.push({k:'days',label:'Дни зачтены',val:counted+'/7',extra:'полных '+full,w:1});
  /* Сон, боль и физиотерапия — главные метрики Фазы A, поэтому идут выше веса.
     За недели до старта цикла, где этих отметок ещё не было, строки не печатаем:
     «0 из 7» там означало бы не пропуск, а отсутствие самого поля. */
  const c2=(mon>=sp.config.startDate);
  const has=f=>{ for(let i=0;i<7;i++){ const v=spDay(sp,dateAddDays(mon,i))[f]; if(v!=null&&v!=="") return true; } return false; };
  const sl=spAvgField(sp,mon,'sleepH'), wkn=spAvgField(sp,mon,'wakeN');
  if(sl!=null) o.push({k:'sleep',label:'Сон',val:'в среднем '+num1(sl)+' ч',extra:'ночей 7 ч и больше — '+spSleepGood(sp,mon)+' из 7'+(wkn!=null?' · пробуждений '+num1(wkn):''),w:1});
  if(c2||has('bed')) o.push({k:'bed',label:'Отбой вовремя',val:spCountField(sp,mon,'bed')+' из 7',w:1});
  if(c2||has('cola')) o.push({k:'cola',label:'Кофеин до 14:00',val:spCountField(sp,mon,'cola')+' из 7',w:1});
  const pr=spAvgField(sp,mon,'painR'), pl=spAvgField(sp,mon,'painL'), ps=spAvgField(sp,mon,'painS');
  /* Среднее, а не максимум: один день с 5/10 после долгой прогулки не должен
     выглядеть как ухудшение всей недели. */
  if(pr!=null||pl!=null||ps!=null) o.push({k:'pain',label:'Боль в среднем',val:'бедро П '+num1(pr)+' / Л '+num1(pl)+' · плечо '+num1(ps),w:1});
  const fw=phWeek(sp,mon);
  if(c2||fw||phDone(sp)) o.push({k:'fz',label:'Физиотерапия',val:fw+' '+plural(fw,'сеанс','сеанса','сеансов')+' за неделю',extra:'всего '+phDone(sp)+' из '+PHYSIO_TOTAL,w:1});
  if(c2||has('reha')) o.push({k:'reha',label:'Домашний блок',val:spCountField(sp,mon,'reha')+' из 7',w:1});
  o.push({k:'steps',label:'Шаги',val:'в среднем '+Math.round(sdays?steps/sdays:0).toLocaleString('ru-RU')+' при цели '+spStepGoal(sp).toLocaleString('ru-RU'),extra:gd+'/7 дней ≥ цели',w:1});
  o.push({k:'wo',label:'Тренировки',val:sp.workouts.filter(x=>mondayOf(x)===mon).length+' из 3',w:1});
  const cr=spWeekCorridor(sp,mon);
  o.push({k:'kb',label:'КБЖУ в коридоре',val:cr.core+' '+plural(cr.core,'день','дня','дней')+' из 7',extra:'по всем четырём — '+cr.all,w:1});
  const cur=spWeekAvg(sp,mon);
  if(cur!=null){ const dc=spDelta(sp,'weight','kg',sp.config.startDate), da=spDelta(sp,'weight','kg',null);
    o.push({k:'wt',label:'Вес',val:'в среднем за неделю '+num1(cur)+' кг',extra:(dc!=null?'с начала цикла '+dTxt(dc,'кг')+', ':'')+'всего '+dTxt(da,'кг'),w:1}); }
  const end=(dateAddDays(mon,6)<=todayStr())?dateAddDays(mon,6):todayStr(); const st=spStreakAt(sp,end);
  o.push({k:'st',label:'Стрик',val:st+' '+plural(st,'день','дня','дней'),w:1});
  const meas=[]; [['грудь',sp.chest],['талия',sp.waist],['живот',sp.belly],['бёдра',sp.hips]].forEach(m=>{ const l=spLast(m[1]); if(l&&mondayOf(l.date)===mon) meas.push(m[0]+' '+l.cm); });
  if(meas.length) o.push({k:'meas',label:'Замеры (см)',val:meas.join(', ')});
  return o; }
function metCareer(sec,mon){ const c=sec.career; if(!c.config||!c.config.startDate) return [{k:'no',label:'Цикл',val:'не настроен'}];
  const o=[]; metTime(sec,mon,o);
  /* Разбивка времени по блокам, по убыванию минут — отвечает на вопрос «куда ушло время». */
  const tp=careerTimeParts(c,mon);
  if(tp.length) o.push({k:'tmix',label:'Время по блокам',val:tp.map(p=>p.label+' '+fmtMin(p.min)).join(' · ')});
  RT_PROJECTS.forEach(p=>{ if(cardIsPaused(sec,rtCardKey(p))) return; const w=rtWeekItems(c,p,mon);
    o.push({k:'rt_'+p.key,label:p.title.split(' · ')[0],val:w+' '+plural(w,'шаг','шага','шагов'),extra:'всего '+rtDone(c,p)+'/'+rtTotal(p)+', сейчас — '+rtCurBlock(c,p).t,w:1}); });
  o.push({k:'ap',label:'Отклики',val:dtWeekCount(c,'apply',mon)+'/7 дней',extra:'стрик '+dtStreak(c,'apply')+(dtWeekMin(c,'apply',mon)?' · '+fmtMin(dtWeekMin(c,'apply',mon)):''),w:1});
  o.push({k:'li',label:'Пост в LinkedIn',val:liWeekIn(c,mon)?'есть':'нет',extra:'серия '+liStreak(c)+' '+plural(liStreak(c),'неделя','недели','недель')+(liWeekMin(c,mon)?' · '+fmtMin(liWeekMin(c,mon)):''),w:1});
  if(!cardIsPaused(sec,'stages')) o.push({k:'tree',label:'Семейное древо',val:crWeekItems(c,mon)+' '+plural(crWeekItems(c,mon),'шаг','шага','шагов'),extra:'всего '+crAllDone(c)+'/'+crAllTotal()+', сейчас — '+crCurBlock(c).t,w:1});
  const eA=engData(); if(eA) o.push({k:'ax',label:'Курс a11y',val:axWeek(eA.a11y,mon)+' '+plural(axWeek(eA.a11y,mon),'урок','урока','уроков'),extra:'всего '+axAllDone(eA.a11y)+'/'+axTotal(),w:1});
  o.push({k:'vk',label:'Курс VK',val:vkWeek(c.vkcourse,mon)+' видео',extra:'всего '+vkAllDone(c.vkcourse)+'/'+vkTotal(),w:1});
  o.push({k:'mt',label:'Курс МТС',val:mtsWeek(c.mts,mon)+' видео',extra:'всего '+mtsAllDone(c.mts)+'/'+mtsTotal(),w:1});
  return o; }
function metEnglish(sec,mon){ const e=sec.english;
  const o=[]; metTime(sec,mon,o);
  /* Разбивка по блокам, по убыванию минут — отвечает на вопрос «куда уходит время». */
  const tp=engTimeParts(e,mon);
  if(tp.length) o.push({k:'tmix',label:'Время по блокам',val:tp.map(p=>p.label+' '+fmtMin(p.min)).join(' · ')});
  /* Ведущие метрики целей — первыми: минуты говорения, курс W3Cx. */
  const spMin=engSpeakMin(e,mon);
  o.push({k:'spk',label:'Говорение',val:spMin?fmtMin(spMin):'пока пусто',extra:'шэдоуинг '+dtWeekCount(e,'shadow',mon)+'/7'+(lsWk(e,mon).done?' · занятие есть':''),w:1});
  o.push({k:'ax',label:'Курс W3Cx',val:axWeek(e.a11y,mon)+' '+plural(axWeek(e.a11y,mon),'урок','урока','уроков'),extra:'всего '+axAllDone(e.a11y)+'/'+axTotal(),w:1});
  o.push({k:'sc',label:'Практика Инглекс',val:dtWeekCount(e,'scene',mon)+'/7 дней',extra:'стрик '+dtStreak(e,'scene'),w:1});
  o.push({k:'gv',label:'Gravity Falls',val:gvWeek(e.gravity,mon)+' '+plural(gvWeek(e.gravity,mon),'серия','серии','серий'),extra:'всего '+gvAllDone(e.gravity)+'/'+gvTotal(),w:1});
  o.push({k:'ak',label:'Карточки Анки',val:dtWeekCount(e,'anki',mon)+'/7 дней',extra:'стрик '+dtStreak(e,'anki')+' · очередь '+aqDone(e)+'/'+ANKI_QUEUE.length,w:1});
  o.push({k:'wd',label:'Голосовая практика с Gemini',val:dtWeekCount(e,'wdaily',mon)+'/7 дней',extra:'стрик '+dtStreak(e,'wdaily'),w:1});
  o.push({k:'hp',label:'Гарри Поттер, переписывание',val:dtWeekCount(e,'hp',mon)+'/7 дней',extra:'стрик '+dtStreak(e,'hp'),w:1});
  o.push({k:'tw',label:'Английский за 20 уроков',val:twWeek(e,mon)+' '+plural(twWeek(e,mon),'урок','урока','уроков'),extra:'всего '+twDone(e)+'/'+twTotal(),w:1});
  /* Блоки на паузе в отчёт не попадают: они не заброшены, они отложены. */
  if(!engPaused(e,'ya')) o.push({k:'ya',label:'Яндекс.Практикум',val:yaWeek(e,mon)+' '+plural(yaWeek(e,mon),'урок','урока','уроков'),extra:'всего '+yaDone(e)+'/'+yaTotal(),w:1});
  if(!engPaused(e,'th')) o.push({k:'th',label:'Теория (грамматика)',val:thWeek(e,mon)+' '+plural(thWeek(e,mon),'тема','темы','тем'),extra:'всего '+thDone(e)+'/'+thTotal(),w:1});
  return o; }
function metCourse(sec,mon){ const c=sec.course; const o=[]; metTime(sec,mon,o);
  o.push({k:'steps',label:'Пройдено подтем',val:cWeekSteps(c,mon)+' '+plural(cWeekSteps(c,mon),'подтема','подтемы','подтем'),extra:'всего '+cDoneSteps(c)+'/'+cTotalSteps()+', '+pctTxt(cDoneSteps(c),cTotalSteps()),w:1});
  return o; }
/* Метрики блоков конструктора — добавляются к любому разделу, где блоки есть */
function metBlocks(sec,mon){ const o=[];
  (sec.blocks||[]).forEach(b=>{ if(cardIsPaused(sec,cbCardKey(b))) return;   // на паузе — не заброшено, а отложено
    if(b.type==="habit"){ const e=cbDtWrap(b); o.push({k:'cb_'+b.id,label:b.name,val:dtWeekCount(e,b.id,mon)+'/7 дней',extra:'стрик '+dtStreak(e,b.id),w:1}); }
    if(b.type==="dcounter"){ const s=cbcWeekSum(b,mon); o.push({k:'cb_'+b.id,label:b.name,val:s+(b.goal?'/'+b.goal:'')+' '+b.unit,w:1}); }
    if(b.type==="checklist"){ const t=b.items.length; if(!t) return; const d=b.items.filter(it=>b.done[it.id]).length;
      const w=b.items.filter(it=>b.done[it.id]&&tsInWeek("cb:"+b.id+"."+it.id,mon)).length;
      o.push({k:'cb_'+b.id,label:b.name,val:w+' за неделю',extra:'всего '+d+'/'+t,w:1}); }
    if(b.type==="program"){ let t=0,d=0,w=0; (b.groups||[]).forEach(g=>g.lessons.forEach(l=>{ t++; if(b.done[l.id]){ d++; if(tsInWeek("cb:"+b.id+"."+l.id,mon)) w++; } })); if(!t) return;
      o.push({k:'cb_'+b.id,label:b.name,val:w+' '+plural(w,'урок','урока','уроков'),extra:'всего '+d+'/'+t,w:1}); } });
  return o; }
function metCustom(sec,mon){ const o=[]; metTime(sec,mon,o); return o.concat(metBlocks(sec,mon)); }
function metGeneric(sec,mon){ const o=[]; metTime(sec,mon,o);
  const ch=sec.items.filter(i=>i.type==="check"); if(ch.length) o.push({k:'ch',label:'Готово',val:ch.filter(i=>i.done).length+'/'+ch.length,w:1});
  sec.items.filter(i=>i.type==="counter").forEach((i,ix)=>o.push({k:'c'+ix,label:i.name,val:i.value+(i.goal?'/'+i.goal:''),w:1}));
  sec.items.filter(i=>i.type==="time"&&i.minutes).forEach((i,ix)=>o.push({k:'t'+ix,label:i.name,val:fmtMin(i.minutes),w:1}));
  return o; }
/* Что не показывать в отчёте, когда блок на паузе. Ключ карточки → ключи метрик. */
const PAUSE_MET={ ya:['ya'], th:['th'], tw:['tw'], a11y:['ax'], gv:['gv'], aq:[],
  dt_anki:['ak'], dt_wdaily:['wd'], dt_hp:['hp'], dt_scene:['sc'], dt_shadow:['spk'], ls:['spk'], nat:['spk'],
  dt_apply:['ap'], li:['li'], stages:['tree'], vk:['vk'], mts:['mt'],
  physio:['fz'], strength:['wo'], steps:['steps'], kbju:['kb'], weight:['wt'], meas:['meas'],
  day:['days','sleep','bed','cola','pain','reha'], time:['time','tmix'], cal:[], arch:[], prog:[], program:['steps'], energy:[] };
function metricsOf(sec,mon){ return metricsRaw(sec,mon).filter(m=>{
    const p=uiPaused(sec); for(const k in p){ if(p[k]&&(PAUSE_MET[k]||[]).indexOf(m.k)>=0) return false; } return true; }); }
function metricsRaw(sec,mon){
  if(sec.kind==="sport") return metSport(sec,mon).concat(metBlocks(sec,mon));
  if(sec.kind==="career") return metCareer(sec,mon).concat(metBlocks(sec,mon));
  if(sec.kind==="english") return metEnglish(sec,mon).concat(metBlocks(sec,mon));
  if(sec.kind==="course") return metCourse(sec,mon).concat(metBlocks(sec,mon));
  if(sec.kind==="custom") return metCustom(sec,mon);
  if(sec.kind==="generic") return metGeneric(sec,mon);
  return []; }
function metFmt(m,prev,pMon){ const p=(m.w&&prev)?prev.find(x=>x.k===m.k):null;
  return "• "+m.label+": "+m.val+(m.extra?" · "+m.extra:"")+(p?" (было "+ruDate(pMon)+": "+p.val+")":""); }
function metricsAuto(sec,mon){ const pMon=dateAddDays(mon,-7), prev=metricsOf(sec,pMon); return metricsOf(sec,mon).map(m=>metFmt(m,prev,pMon)); }
function metricsText(sec,mon){ const man=String(revRead(sec,mon).metrics||""); return man.trim()!==""?man:metricsAuto(sec,mon).join("\n"); }
function metricsLines(sec,mon){ return metricsText(sec,mon).split("\n").filter(l=>l.trim()!==""); }
function reportSport(sec,mon){ return ["🏋 "+sec.name].concat(metricsLines(sec,mon)).concat([""]); }
function reportCareer(sec,mon){ return ["💼 "+sec.name].concat(metricsLines(sec,mon)).concat([""]); }
function reportEnglish(sec,mon){ return ["🇬🇧 "+sec.name].concat(metricsLines(sec,mon)).concat([""]); }
function reportCourse(sec,mon){ return ["📘 "+sec.name].concat(metricsLines(sec,mon)).concat([""]); }
function reportGeneric(sec,mon){ return ["🎯 "+sec.name].concat(metricsLines(sec,mon||mondayOf(todayStr()))).concat([""]); }
function reportCustom(sec,mon){ return ["✨ "+sec.name].concat(metricsLines(sec,mon||mondayOf(todayStr()))).concat([""]); }
function buildWeeklyReport(mon){ const sun=dateAddDays(mon,6);
  let L=["ОТЧЁТ ЗА НЕДЕЛЮ · "+ruDate(mon)+" – "+ruDate(sun),""];
  data.sections.forEach(sec=>{
    if(sec.kind==="sport") L=L.concat(reportSport(sec,mon));
    else if(sec.kind==="career") L=L.concat(reportCareer(sec,mon));
    else if(sec.kind==="english") L=L.concat(reportEnglish(sec,mon));
    else if(sec.kind==="course") L=L.concat(reportCourse(sec,mon));
    else if(sec.kind==="custom") L=L.concat(reportCustom(sec,mon));
    else if(sec.kind==="generic") L=L.concat(reportGeneric(sec,mon));
  });
  L.push("— сформировано "+ruDate(todayStr()));
  return L.join("\n"); }
function openReport(){ window.reportMon=mondayOf(todayStr()); renderReportModal(); showModal(); }
function renderReportModal(){ const cur=mondayOf(todayStr()), atCur=reportMon>=cur, txt=buildWeeklyReport(reportMon);
  document.getElementById("modal").innerHTML=`<h3>Отчёт за неделю</h3><p class="mhint">Срез по всем целям. Листай недели стрелками.</p>
  <div class="weeknav" style="margin-bottom:12px"><button aria-label="Раньше" onclick="reportShift(-1)">‹</button><span>${ruDate(reportMon)} – ${ruDate(dateAddDays(reportMon,6))}${reportMon===cur?' · текущая':''}</span><button aria-label="Позже" onclick="reportShift(1)" ${atCur?'disabled style="opacity:.35"':''}>›</button></div>
  <textarea id="reportText" style="width:100%; min-height:340px; background:rgba(0,0,0,.25); border:1px solid var(--line-2); color:var(--text); border-radius:12px; padding:14px; font-family:inherit; font-size:13px; line-height:1.55; white-space:pre-wrap; resize:vertical">${esc(txt)}</textarea>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Закрыть</button><button class="btn" onclick="copyReport()">Скопировать</button><button class="btn primary" onclick="downloadReport()">Скачать .txt</button></div>`; }
function reportShift(n){ const cur=mondayOf(todayStr()); window.reportMon=dateAddDays(reportMon,n*7); if(reportMon>cur) window.reportMon=cur; renderReportModal(); }
function copyReport(){ const t=document.getElementById("reportText"); if(!t)return; t.select(); try{ navigator.clipboard.writeText(t.value); }catch(e){ try{document.execCommand("copy");}catch(e2){} } toast("Скопировано"); }
function downloadReport(){ const t=document.getElementById("reportText"); if(!t)return; const blob=new Blob([t.value],{type:"text/plain;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="otchet-nedeli-"+(reportMon||todayStr())+".txt"; a.click(); URL.revokeObjectURL(url); toast("Файл сохранён"); }

/* ================= Неделя: план + отчёт ================= */
function ensureWeekData(){ data.week=data.week||{}; data.week.plan=data.week.plan||{}; data.week.review=data.week.review||{}; data.week.general=data.week.general||{};
  /* полная форма записи недели: иначе слияние допишет plan:"" и холостой прогон
     каждый раз будет выглядеть изменением */
  Object.keys(data.week.general).forEach(w=>{ const g=data.week.general[w]||{};
    if(g.note===undefined)g.note=""; if(g.task===undefined)g.task=""; if(g.plan===undefined)g.plan=""; data.week.general[w]=g; }); }
function secKey(sec){ return sec.kind==="custom"?("c:"+sec.id):(sec.kind==="generic"?("g:"+sec.name):sec.kind); }
function wPlan(w,sk){ ensureWeekData(); data.week.plan[w]=data.week.plan[w]||{}; data.week.plan[w][sk]=data.week.plan[w][sk]||[]; return data.week.plan[w][sk]; }
function wReview(w,sk){ ensureWeekData(); data.week.review[w]=data.week.review[w]||{}; const r=data.week.review[w][sk]=data.week.review[w][sk]||{done:"",score:"",blockers:"",metrics:"",hours:""};
  if(r.metrics===undefined) r.metrics=""; if(r.hours===undefined) r.hours=""; return r; }
function wGeneral(w){ ensureWeekData(); const g=data.week.general[w]=data.week.general[w]||{note:"",task:"",plan:""}; if(g.plan===undefined) g.plan=""; return g; }
/* ---- Планировщик задач по дням ---- */
function ensurePlan(){ data.plan=data.plan||{tasks:[],deleted:[]}; data.plan.tasks=data.plan.tasks||[]; data.plan.deleted=data.plan.deleted||[]; return data.plan; }
function planForDate(ds){ return ensurePlan().tasks.filter(t=>t.date===ds).sort((a,b)=>(a.when||"я").localeCompare(b.when||"я")); }
function planWeekDays(mon){ const d=[]; for(let i=0;i<7;i++)d.push(dateAddDays(mon,i)); return d; }
function planForWeek(mon){ const d=planWeekDays(mon); return ensurePlan().tasks.filter(t=>d.indexOf(t.date)>=0); }
function planWeekDone(mon){ return planForWeek(mon).filter(t=>taskDone(t)); }
function schedSections(){ return data.sections.filter(s=>["course","english","career"].indexOf(s.kind)>=0); }
function schedItems(sec){ const o=[];
  if(sec.kind==="english"){ YA_PROGRAM.forEach((l,i)=>o.push({reft:"ya",key:yaKey(i),label:"Практикум: "+l[1]})); YA_THEORY.forEach((t,i)=>o.push({reft:"th",key:thKey(i),label:"Теория: "+t})); TW_LESSONS.forEach((d,i)=>o.push({reft:"tw",key:twKey(i),label:"20 уроков · Урок "+(i+1)+" ("+d+")"})); A11Y_COURSE.forEach((b,bi)=>b.v.forEach((v,vi)=>o.push({reft:"ax",key:axKey(bi,vi),label:"A11y: "+v}))); GRAVITY.forEach((s,si)=>s.ep.forEach((e,ei)=>o.push({reft:"gv",key:gvKey(si,ei),label:"Gravity Falls S"+(si+1)+"·E"+(ei+1)+" — "+e}))); }
  else if(sec.kind==="career"){ const btitle={}; TREE_BLOCKS.forEach(b=>b.items.forEach(it=>btitle[it[0]]=b.t));
    RT_PROJECTS.forEach(p=>p.blocks.forEach(b=>b.items.forEach(it=>o.push({reft:"st",key:p.key+"."+it[0],label:p.short+" · "+b.t+": "+it[1]}))));
    CR_STAGES.forEach(st=>st.items.forEach(it=>o.push({reft:"st",key:st.key+"."+it[0],label:"Древо · "+(btitle[it[0]]||st.title)+": "+it[1]}))); A11Y_COURSE.forEach((b,bi)=>b.v.forEach((v,vi)=>o.push({reft:"ax",key:axKey(bi,vi),label:"A11y: "+v}))); VK_PROGRAM.forEach((b,bi)=>b.v.forEach((v,vi)=>o.push({reft:"vk",key:vkKey(bi,vi),label:"VK · "+b.t+": "+v}))); MTS_PROGRAM.forEach((b,bi)=>b.v.forEach((x,vi)=>o.push({reft:"mt",key:mtsKey(bi,vi),label:"МТС · "+b.t+": "+x[0]}))); }
  return o; }
/* связка задачи плана с конкретным пунктом курса — единый источник «выполнено» */
function refState(t){ if(!t.reft||!t.ref) return null; const sec=data.sections.find(s=>s.id===t.secId); if(!sec) return null;
  if(t.reft==="co"&&sec.course){ const c=sec.course; return {done:!!c.done[t.ref], set:v=>{ if(v)c.done[t.ref]=1; else delete c.done[t.ref]; mstamp("co:"+t.ref); }}; }
  if(t.reft==="ya"&&sec.english){ const y=sec.english.yandex; return {done:!!y.done[t.ref], set:v=>{ if(v)y.done[t.ref]=1; else delete y.done[t.ref]; mstamp("ya:"+t.ref); }}; }
  if(t.reft==="gv"&&sec.english){ const g=sec.english.gravity; return {done:!!g.done[t.ref], set:v=>{ if(v)g.done[t.ref]=1; else delete g.done[t.ref]; mstamp("gv:"+t.ref); }}; }
  if(t.reft==="th"&&sec.english){ const th=sec.english.theory; return {done:!!th.done[t.ref], set:v=>{ if(v)th.done[t.ref]=1; else delete th.done[t.ref]; mstamp("th:"+t.ref); }}; }
  if(t.reft==="ax"&&sec.english){ const ax=sec.english.a11y; return {done:!!ax.done[t.ref], set:v=>{ if(v)ax.done[t.ref]=1; else delete ax.done[t.ref]; mstamp("ax:"+t.ref); }}; }
  if(t.reft==="tw"&&sec.english){ const tw=sec.english.twenty; return {done:!!tw.done[t.ref], set:v=>{ if(v)tw.done[t.ref]=1; else delete tw.done[t.ref]; mstamp("tw:"+t.ref); }}; }
  if(t.reft==="vk"&&sec.career){ const v2=sec.career.vkcourse; return {done:!!v2.done[t.ref], set:v=>{ if(v)v2.done[t.ref]=1; else delete v2.done[t.ref]; mstamp("vk:"+t.ref); }}; }
  if(t.reft==="mt"&&sec.career&&sec.career.mts){ const v3=sec.career.mts; return {done:!!v3.done[t.ref], set:v=>{ if(v)v3.done[t.ref]=1; else delete v3.done[t.ref]; mstamp("mt:"+t.ref); }}; }
  if(t.reft==="st"&&sec.career){ const parts=t.ref.split("."), sk=parts[0], ik=parts[1]; const c=sec.career; c.stages[sk]=c.stages[sk]||{}; return {done:!!c.stages[sk][ik], set:v=>{ c.stages[sk][ik]=v; mstamp("st:"+sk+"."+ik); }}; }
  return null; }
function taskDone(t){ const r=refState(t); return r? r.done : !!t.done; }

function openPlan(){ if(!planMon) window.planMon=mondayOf(todayStr()); renderPlanModal(); showModal(); }
function planShift(n){ window.planMon=dateAddDays(planMon,n*7); renderPlanModal(); }
function planPick(ds){ window.planMon=mondayOf(ds); renderPlanModal(); }
function planToggle(id){ const t=ensurePlan().tasks.find(x=>x.id===id); if(t){ const r=refState(t); if(r) r.set(!r.done); else { t.done=!t.done; mstamp("pt:"+id); } } save(); renderPlanModal(); }
function planDel(id){ if(!confirm("Удалить задачу?"))return; const p=ensurePlan(); p.tasks=p.tasks.filter(x=>x.id!==id); if(p.deleted.indexOf(id)<0)p.deleted.push(id); mstamp("pt:"+id); save(); renderPlanModal(); }
function renderPlanModal(){
  const dow=["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
  const days=planWeekDays(planMon);
  let body=`<div class="daycols">`;
  days.forEach((ds,i)=>{
    const tasks=planForDate(ds);
    body+=`<div class="daycol ${ds===todayStr()?'is-today':''}"><div class="daycol-h"><b>${dow[i]}</b><span>${ruDate(ds)}${ds===todayStr()?' · сегодня':''}</span></div>`;
    body+= tasks.length? tasks.map(t=>{ const sec=data.sections.find(s=>s.id===t.secId); const col=sec?sec.color:"var(--muted)"; const dn=taskDone(t); const linked=!!refState(t);
      return `<div class="ptask"><button class="pcheck ${dn?'on':''}" style="--accent:${col}" onclick="planToggle('${t.id}')">${svg('check')}</button><div class="ptask-b" onclick="openPlanTask('${t.id}')"><div class="ptask-t ${dn?'done':''}">${esc(t.title)}</div><div class="ptask-m">${sec?`<span class="tdot" style="background:${col}"></span>${esc(sec.name)}`:'свободная'}${linked?' · ↔ курс':''}${t.when?` · ${esc(t.when)}`:''}</div></div><button class="xdel" aria-label="Удалить" onclick="planDel('${t.id}')">${svg('trash')}</button></div>`; }).join("")
      : `<p class="dc-empty">—</p>`;
    body+=`<button class="dc-add" onclick="openPlanTask('','${ds}')">${svg('plus')} задача</button></div>`;
  });
  body+=`</div>`;
  const doneCnt=planWeekDone(planMon).length, total=planForWeek(planMon).length; const pct=total?Math.round(doneCnt/total*100):0;
  document.getElementById("modal").innerHTML=`<div class="planhead"><h3>План недели</h3><div class="weeknav sm"><button aria-label="Раньше" onclick="planShift(-1)">‹</button><span>${ruDate(planMon)} — ${ruDate(dateAddDays(planMon,6))}</span><button aria-label="Позже" onclick="planShift(1)">›</button></div></div>
  <p class="mhint">Съедай слона по кусочку: запланируй конкретные шаги (можно отдельные подтемы урока) на конкретный день и время. Галочка синхронизирована с курсом. Выполнено ${doneCnt}/${total}${total?` · ${pct}%`:''}.</p>
  ${miniCal(planMon,"planPick",ds=>planForDate(ds).length>0)}
  ${body}
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Закрыть</button><button class="btn" onclick="openWeekPlan()">${svg('textline')} Текст плана</button><button class="btn primary" onclick="openPlanTask('','${todayStr()}')">${svg('plus')} Новая задача</button></div>`;
}
function openPlanTask(id,date,presetSec){
  const p=ensurePlan(); let t={date:date||todayStr(),when:"",title:"",secId:presetSec||"",ref:""};
  if(id){ t=p.tasks.find(x=>x.id===id)||t; }
  const secs=schedSections();
  document.getElementById("modal").innerHTML=`<h3>${id?'Изменить задачу':'Новая задача'}</h3>
   <label for="ptDate">День</label><input type="date" id="ptDate" value="${t.date}">
   <label for="ptSec">Из раздела (по желанию)</label>
   <select id="ptSec" onchange="ptSecChange()"><option value="">— своя задача —</option>${secs.map(s=>`<option value="${s.id}" ${t.secId===s.id?'selected':''}>${esc(s.name)}</option>`).join("")}</select>
   <div id="ptItemWrap" style="${t.secId?'':'display:none'}"><label for="ptItem">Конкретный пункт / подтема</label><select id="ptItem" onchange="ptItemChange()"><option value="">— выбрать из списка —</option></select><div class="pt-hint">Отметишь тут выполнено — отметится и в курсе, и наоборот.</div></div>
   <label for="ptTitle">Что сделать</label><input type="text" id="ptTitle" value="${esc(t.title)}" placeholder="напр. Урок 11 · Углублённое изучение SMART">
   <label for="ptWhen">Когда (время дня)</label><input type="text" id="ptWhen" value="${esc(t.when)}" placeholder="напр. после обеда · 19:00">
   <div class="modal-actions"><button class="btn" onclick="renderPlanModal()">Назад</button><button class="btn primary" onclick="savePlanTask('${id||''}')">Сохранить</button></div>`;
  if(t.secId) fillPtItems(t.secId, (t.reft&&t.ref)?(t.reft+"|"+t.ref):"");
}
function ptSecChange(){ const sid=document.getElementById("ptSec").value; document.getElementById("ptItemWrap").style.display=sid?"":"none"; if(sid) fillPtItems(sid,""); }
function fillPtItems(sid,curVal){ const sec=findSec(sid); const sel=document.getElementById("ptItem"); if(!sel||!sec)return;
  let html=`<option value="">— выбрать из списка —</option>`;
  if(sec.kind==="course"){ COURSE.forEach((l,li)=>{ html+=`<optgroup label="${esc(l.t)}">`; l.s.forEach((st,si)=>{ const v="co|"+ckey(li,si); html+=`<option value="${v}" ${v===curVal?'selected':''}>${esc(st[1])}</option>`; }); html+=`</optgroup>`; }); }
  else { schedItems(sec).forEach(it=>{ const v=it.reft+"|"+it.key; html+=`<option value="${v}" ${v===curVal?'selected':''}>${esc(it.label)}</option>`; }); }
  sel.innerHTML=html;
}
function ptItemChange(){ const sel=document.getElementById("ptItem"); if(!sel||!sel.value)return; const opt=sel.options[sel.selectedIndex]; let txt=opt.textContent; if(opt.parentNode&&opt.parentNode.tagName==="OPTGROUP"){ txt=opt.parentNode.label.replace(/\s+$/,"")+" · "+txt; } const ti=document.getElementById("ptTitle"); if(!ti.value.trim()||ti.dataset.auto==="1"){ ti.value=txt; ti.dataset.auto="1"; } }
function savePlanTask(id){ const date=document.getElementById("ptDate").value; if(!date){ alert("Выбери день"); return; } const title=document.getElementById("ptTitle").value.trim(); if(!title){ alert("Впиши, что сделать"); return; } const secId=document.getElementById("ptSec").value; const itemSel=document.getElementById("ptItem"); const val=(secId&&itemSel)?itemSel.value:""; let reft="",ref=""; if(val){ const pp=val.split("|"); reft=pp[0]; ref=pp.slice(1).join("|"); } const when=document.getElementById("ptWhen").value.trim();
  const p=ensurePlan();
  if(id){ const t=p.tasks.find(x=>x.id===id); if(t){ t.date=date; t.title=title; t.secId=secId; t.reft=reft; t.ref=ref; t.when=when; mstamp("pt:"+id); } }
  else { const nid=uid(); p.tasks.push({id:nid,date,title,secId,reft,ref,when,done:false}); mstamp("pt:"+nid); }
  save(); window.planMon=mondayOf(date); renderPlanModal(); }
function planTaskForSec(sid){ if(!planMon) window.planMon=mondayOf(todayStr()); showModal(); openPlanTask("",todayStr(),sid); }

/* ---- мини-календарь ---- */
function miniCal(anchorMon,pickFn,markFn){
  const parts=anchorMon.split("-"); const y=+parts[0], m=+parts[1];
  const first=new Date(y,m-1,1); const startDow=(first.getDay()+6)%7; const daysIn=new Date(y,m,0).getDate();
  const monthName=first.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
  let h=`<div class="mcal"><div class="mcal-h">${monthName}</div><div class="mcal-grid">`;
  ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].forEach(d=>h+=`<div class="mcal-dow">${d}</div>`);
  for(let i=0;i<startDow;i++)h+=`<div></div>`;
  for(let d=1;d<=daysIn;d++){ const ds=y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0"); const inWeek=mondayOf(ds)===anchorMon; const marked=markFn?markFn(ds):false; const today=ds===todayStr();
    h+=`<button class="mcal-d ${inWeek?'inweek':''} ${today?'today':''}" onclick="${pickFn}('${ds}')">${d}${marked?'<i></i>':''}</button>`; }
  h+=`</div></div>`; return h;
}

/* ---- Отчёт (модалка с календарём) ---- */
function reviewWeekMon(){ return reportMon||mondayOf(todayStr()); }
function openReport2(){ if(!reportMon) window.reportMon=mondayOf(todayStr()); renderReport2(); showModal(); }
function report2Shift(n){ window.reportMon=dateAddDays(reportMon,n*7); renderReport2(); }
function report2Pick(ds){ window.reportMon=mondayOf(ds); renderReport2(); }
function weekHasReport(w){ const d=data.week||{}; return !!((d.review&&d.review[w])||(d.general&&d.general[w])); }
function renderReport2(){
  const mon=reportMon, w=isoWeek(mon); const done=planWeekDone(mon);
  let blocks="";
  data.sections.forEach(sec=>{ const sk=secKey(sec), rev=wReview(w,sk); const dts=done.filter(t=>t.secId===sec.id);
    const secAll=planForWeek(mon).filter(t=>t.secId===sec.id); const secPct=secAll.length?Math.round(dts.length/secAll.length*100):null;
    const auto=autoHours(sec,mon), edited=String(rev.metrics||"").trim()!=="";
    blocks+=`<div class="rep-sec"><div class="rep-sec-h"><span class="tdot" style="background:${sec.color}"></span><b>${esc(sec.name)}</b>${secPct!=null?`<span class="rep-pct ${secPct>=80?'good':secPct>=40?'mid':'low'}">план ${dts.length}/${secAll.length} · ${secPct}%</span>`:''}</div>
      <label for="rh_${sk}">Время за неделю, ч</label>
      <input type="text" inputmode="decimal" id="rh_${sk}" value="${esc(rev.hours||'')}" placeholder="${auto>0?'по отметкам: '+auto:'напр. 9.75'}" oninput="weekReviewSet('${sk}','hours',this.value)" onchange="weekReviewSetR('${sk}','hours',this.value)" style="width:140px">
      <div class="pt-hint">${auto>0?'Трекер насчитал '+fmtMin(autoMin(sec,mon))+' по отметкам — впиши своё, если считаешь иначе.':'Впиши, сколько времени ушло на эту цель.'}</div>
      ${sec.kind==="sport"?`<label for="rc_${sk}">Готовка ПП за неделю, минут</label>
      <input type="number" min="0" step="5" id="rc_${sk}" value="${spCookMin(sec.sport,mon)||''}" placeholder="например 240" onchange="repSetCook(this.value)" style="width:140px">
      <div class="pt-hint">Единственное, что трекер не может посчитать по отметкам. Добавится к общему времени недели: ${spTimeParts(sec.sport,mon).map(p=>p.label+' '+fmtMin(p.min)).join(' · ')||'пока пусто'}.</div>`:''}
      <label>Метрики <span style="color:var(--muted-2); font-weight:400">— можно править прямо здесь</span></label>
      <textarea class="note-area" style="min-height:130px" oninput="weekReviewSet('${sk}','metrics',this.value)" placeholder="Метрики за неделю">${esc(metricsText(sec,mon))}</textarea>
      <div class="pt-hint">${edited?'Метрики отредактированы вручную и больше не пересчитываются. <button class="link" onclick="repResetMetrics(\''+sk+'\')">Пересчитать заново</button>':'Считаются автоматически, в скобках — значение прошлой недели.'}</div>
      ${dts.length?`<div class="rep-done"><b>Сделано по плану:</b>${dts.map(t=>`<div>• ${esc(t.title)}${t.when?` <i>· ${esc(t.when)}</i>`:''}</div>`).join("")}</div>`:''}
      <label>Что сделано</label><textarea class="note-area" oninput="weekReviewSet('${sk}','done',this.value)" placeholder="Общее впечатление от недели по этой цели">${esc(rev.done||'')}</textarea>
      <label>Оценка недели (1–10)</label><input type="number" min="1" max="10" value="${esc(rev.score||'')}" oninput="weekReviewSet('${sk}','score',this.value)" style="width:110px">
      <label>Что помешало</label><textarea class="note-area" oninput="weekReviewSet('${sk}','blockers',this.value)" placeholder="Что мешало / что учесть">${esc(rev.blockers||'')}</textarea>
    </div>`; });
  const g=wGeneral(w);
  const allW=planForWeek(mon).length, allD=done.length, allPct=allW?Math.round(allD/allW*100):null;
  document.getElementById("modal").innerHTML=`<div class="planhead"><h3>Отчёт за неделю</h3><div class="weeknav sm"><button aria-label="Раньше" onclick="report2Shift(-1)">‹</button><span>${ruDate(mon)} — ${ruDate(dateAddDays(mon,6))}</span><button aria-label="Позже" onclick="report2Shift(1)">›</button></div></div>
  <p class="mhint">Метрики и сделанные задачи плана подтянуты автоматически. Заполни поля — всё сохраняется сразу. Календарь — вернуться к любой неделе.</p>
  ${allPct!=null?`<div class="rep-total">Выполнено плана за неделю: <b>${allD}/${allW} · ${allPct}%</b><div class="rep-bar"><span style="width:${allPct}%"></span></div></div>`:''}
  ${miniCal(mon,"report2Pick",ds=>weekHasReport(isoWeek(mondayOf(ds))))}
  ${blocks}
  <div class="rep-sec"><div class="rep-sec-h"><b>Общий комментарий</b></div>
   <label>Что ещё хочется отметить</label><textarea class="note-area" oninput="weekGeneralSet('note',this.value)">${esc(g.note||'')}</textarea>
   <label>Отчёт по заданию недели</label><textarea class="note-area" oninput="weekGeneralSet('task',this.value)">${esc(g.task||'')}</textarea></div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Закрыть</button><button class="btn primary" onclick="openWeekReport()">${svg('check')} Собрать текст отчёта</button></div>`;
}
function weekReviewSet(sk,f,v){ const w=isoWeek(reviewWeekMon()); wReview(w,sk)[f]=v; mstamp("wr:"+w+":"+sk+":"+f); save(); }
function weekReviewSetR(sk,f,v){ weekReviewSet(sk,f,v); renderReport2(); }
function repResetMetrics(sk){ weekReviewSet(sk,'metrics',''); renderReport2(); toast("Метрики пересчитаны"); }
/* Готовка ПП правится и в карточке «Время на цель», и прямо в отчёте — данные одни. */
function repSetCook(v){ const sec=data.sections.find(s=>s.kind==="sport"); if(!sec) return;
  const sp=sec.sport, w=isoWeek(reviewWeekMon()); sp.cook=sp.cook||{};
  const n=Math.max(0,parseInt(v)||0); if(n) sp.cook[w]=n; else delete sp.cook[w];
  mstamp("ck:"+w); save(); renderReport2(); }
function weekGeneralSet(f,v){ const w=isoWeek(reviewWeekMon()); wGeneral(w)[f]=v; mstamp("wg:"+w+":"+f); save(); }
function buildFullReport(mon){ const w=isoWeek(mon); const done=planWeekDone(mon); const nextMon=dateAddDays(mon,7); const nextDays=planWeekDays(nextMon); const nextT=ensurePlan().tasks.filter(t=>nextDays.indexOf(t.date)>=0);
  let L=["ОТЧЁТ ЗА НЕДЕЛЮ · "+ruDate(mon)+" – "+ruDate(dateAddDays(mon,6)),""];
  data.sections.forEach(sec=>{ const sk=secKey(sec), rev=wReview(w,sk), mets=metricsLines(sec,mon); const dts=done.filter(t=>t.secId===sec.id); const nts=nextT.filter(t=>t.secId===sec.id);
    const secAll=planForWeek(mon).filter(t=>t.secId===sec.id); const secPct=secAll.length?Math.round(dts.length/secAll.length*100):null;
    L.push("🎯 "+sec.name); if(sec.sub) L.push("Категория: "+sec.sub);
    L.push("");
    if(mets.length){ L.push("Метрики:"); mets.forEach(m=>L.push(m)); L.push(""); }
    if(secPct!=null){ L.push("Выполнено плана: "+dts.length+"/"+secAll.length+" ("+secPct+"%)"); L.push(""); }
    if(rev.done||dts.length){ L.push("Что сделано:"); if(rev.done) L.push(rev.done); dts.forEach(t=>L.push("  • "+t.title+(t.when?" — "+t.when:""))); L.push(""); }
    if(rev.score){ L.push("Оценка: "+rev.score+"/10"); L.push(""); }
    if(rev.blockers){ L.push("Что помешало:"); L.push(rev.blockers); L.push(""); }
    if(nts.length){ L.push("План на следующую неделю:"); nts.forEach(t=>L.push("  • "+t.title+(t.when?" — "+t.when:"")+" ("+ruDate(t.date)+")")); L.push(""); }
  });
  const g=wGeneral(w); if(g.note||g.task){ L.push("Общий комментарий:"); if(g.note)L.push(g.note); if(g.task)L.push("Задание недели: "+g.task); L.push(""); }
  L.push("— сформировано "+ruDate(todayStr())); return L.join("\n"); }
function openWeekReport(){ const mon=reviewWeekMon(); const txt=buildFullReport(mon); document.getElementById("modal").innerHTML=`<h3>Текст отчёта</h3><p class="mhint">Готовый текст в формате отчёта. Отредактируй при желании, скопируй или скачай.</p>
  <textarea id="reportText" style="width:100%; min-height:360px; background:rgba(0,0,0,.25); border:1px solid var(--line-2); color:var(--text); border-radius:12px; padding:14px; font-family:inherit; font-size:13px; line-height:1.55; white-space:pre-wrap; resize:vertical">${esc(txt)}</textarea>
  <div class="modal-actions"><button class="btn" onclick="renderReport2()">Назад</button><button class="btn" onclick="copyReport()">Скопировать</button><button class="btn primary" onclick="downloadReport()">Скачать .txt</button></div>`; showModal(); }
/* ---- merge for week data ---- */
function mergePlanArr(a,b,aM,bM){ a=a||[]; b=b||[]; const byId={}; a.forEach(x=>byId[x.id]=Object.assign({},x)); b.forEach(x=>{ if(byId[x.id]){ const p="wp:"+x.id, ta=aM[p]||0, tb=bM[p]||0; const cur=byId[x.id]; cur.done=(ta||tb)?((tb>ta)?x.done:cur.done):(cur.done||x.done); if(!cur.text&&x.text)cur.text=x.text; if(!cur.when&&x.when)cur.when=x.when; } else byId[x.id]=Object.assign({},x); }); return Object.keys(byId).map(k=>byId[k]); }
function lwwField(av,bv,p,aM,bM){ const ta=aM[p]||0, tb=bM[p]||0; if(ta||tb) return (tb>ta)?bv:av; return (av&&String(av).length)?av:bv; }
function mergeWeek(a,b,aM,bM){ a=a?JSON.parse(JSON.stringify(a)):{plan:{},review:{},general:{}}; b=b||{}; a.plan=a.plan||{}; a.review=a.review||{}; a.general=a.general||{};
  const bp=b.plan||{}; Object.keys(bp).forEach(w=>{ a.plan[w]=a.plan[w]||{}; Object.keys(bp[w]).forEach(sk=>{ a.plan[w][sk]=mergePlanArr(a.plan[w][sk],bp[w][sk],aM,bM); }); });
  const br=b.review||{}; Object.keys(br).forEach(w=>{ a.review[w]=a.review[w]||{}; Object.keys(br[w]).forEach(sk=>{ const A=a.review[w][sk]||{},B=br[w][sk]||{}; const o={}; ['done','score','blockers','metrics','hours'].forEach(f=>{ o[f]=lwwField(A[f],B[f],"wr:"+w+":"+sk+":"+f,aM,bM)||""; }); a.review[w][sk]=o; }); });
  Object.keys(a.review).forEach(w=>{ Object.keys(a.review[w]).forEach(sk=>{ const r=a.review[w][sk]||{}; if(r.metrics===undefined)r.metrics=""; if(r.hours===undefined)r.hours=""; }); });
  const bg=b.general||{}; Object.keys(bg).forEach(w=>{ const A=a.general[w]||{},B=bg[w]||{}; const o={}; ['note','task','plan'].forEach(f=>{ o[f]=lwwField(A[f],B[f],"wg:"+w+":"+f,aM,bM)||""; }); a.general[w]=o; });
  Object.keys(a.general).forEach(w=>{ const g=a.general[w]||{}; ['note','task','plan'].forEach(f=>{ if(g[f]===undefined) g[f]=""; }); a.general[w]=g; });
  return a; }
function mergePlan(a,b,aM,bM){ a=a?JSON.parse(JSON.stringify(a)):{tasks:[],deleted:[]}; b=b||{}; a.tasks=a.tasks||[]; a.deleted=a.deleted||[];
  const del={}; a.deleted.forEach(id=>del[id]=1); (b.deleted||[]).forEach(id=>del[id]=1);
  const byId={}; a.tasks.forEach(t=>byId[t.id]={t:t}); (b.tasks||[]).forEach(t=>{ const p="pt:"+t.id; if(byId[t.id]){ const ta=aM[p]||0, tb=bM[p]||0; if(tb>ta) byId[t.id]={t:t}; } else byId[t.id]={t:t}; });
  const tasks=Object.keys(byId).map(k=>byId[k].t).filter(t=>!del[t.id]);
  return {tasks:tasks, deleted:Object.keys(del)}; }

/* ================= План на неделю (текст) =================
   Формат повторяет отчёт: цель → категория → строки плана. Постоянные строки
   лежат в data.planTpl и правятся один раз, меняющиеся трекер дописывает сам
   из текущего состояния курсов. Готовый текст правится и сохраняется на неделю. */
const PLAN_GOALS={
  career:{ goal:"Получить работу по новой профессии", cat:"карьера и проекты" },
  course:{ goal:"Пройти курс Понедельник", cat:"обучение и саморазвитие" },
  sport:{ goal:"Улучшение состояния тела", cat:"здоровье и тело" },
  english:{ goal:"Повышение уровня владения английским языком", cat:"обучение и саморазвитие" }
};
const PLAN_TPL_DEF={
  career:"Отклики — каждый день понемногу\nПост в LinkedIn — 1 раз в неделю",
  course:"Пройти 5 подтем — понедельник–пятница (после обеда)",
  sport:"Отбой в целевое время — каждый день\nСон 7,5 часов — каждый день\nКофеин не позже 14:00 — каждый день\nСиловые — 3 раза в неделю\nДомашний блок резинок — 3–4 раза в неделю\nФото еды и КБЖУ — каждый день\nБодрость 1–10 — каждый день",
  english:"Шэдоуинг — каждый день, 5–10 минут\nГолосовая практика с Gemini — каждый день\nКарточки Анки — каждый день\nГарри Поттер — каждый день\nGravity Falls — с мужем за завтраком\nПрактика Инглекс — 3–4 раза в неделю"
};
const PLAN_ORDER=["career","course","sport","english"];
function ensurePlanTpl(){ data.planTpl=data.planTpl||{}; return data.planTpl; }
function planTplFor(sk){ const t=ensurePlanTpl(); return (sk in t)?t[sk]:(PLAN_TPL_DEF[sk]||""); }
function planTplSet(sk,v){ ensurePlanTpl()[sk]=v; mstamp("pl:"+sk); save(); }
/* Понедельник предстоящей недели: в субботу и воскресенье планируем следующую. */
function planNextMon(){ const t=todayStr(), dw=new Date(t+"T00:00:00").getDay(); const cur=mondayOf(t);
  return (dw===0||dw===6)?dateAddDays(cur,7):cur; }
function spCycleWeekAt(sp,mon){ if(!sp.config.startDate) return 0;
  const d=Math.floor((new Date(mon+"T00:00:00")-new Date(mondayOf(sp.config.startDate)+"T00:00:00"))/86400000);
  return Math.floor(d/7)+1; }
/* Меняющиеся строки: что именно следующее по каждому курсу. */
function planAutoLines(sec,mon){
  const out=[];
  if(sec.kind==="career"){ const c=sec.career;
    RT_PROJECTS.forEach(p=>{ if(cardIsPaused(sec,rtCardKey(p))) return; const nx=rtNextStep(c,p);
      if(nx) out.push(p.short+" — "+nx+" (этап: "+rtCurBlock(c,p).t+")"); });
    if(!cardIsPaused(sec,'stages')){ const nx=crNextStep(c); if(nx) out.push("Семейное древо — "+nx+" (этап: "+crCurBlock(c).t+")"); }
    if(mtsAllDone(c.mts)<mtsTotal()) out.push("Курс МТС — "+mtsAllDone(c.mts)+"/"+mtsTotal()+" видео пройдено");
  }
  if(sec.kind==="course"){ const c=sec.course;
    for(let li=0;li<COURSE.length;li++){ const dn=cLessonDone(c,li), tot=COURSE[li].s.length;
      if(dn<tot){ out.push("Следующий урок — "+COURSE[li].t+" ("+dn+"/"+tot+" подтем)"); break; } }
  }
  if(sec.kind==="sport"){ const sp=sec.sport, wk=spCycleWeekAt(sp,mon);
    const w=PHASE_A_WEEKS[wk-1];
    if(w){ out.push("Фокус недели "+wk+" — "+w.focus);
      out.push("Шаги — цель "+w.steps.toLocaleString('ru-RU')+" в день");
      out.push("Физиотерапия — "+w.physio+" "+plural(w.physio,'сеанс','сеанса','сеансов')+" (пройдено "+phDone(sp)+" из "+PHYSIO_TOTAL+")");
      if(wk%2===0) out.push("Замеры: талия, живот, бёдра, грудь");
    }
    out.push("КБЖУ в коридоре: "+rngTxt(spRange(sp,'kcal'))+" ккал · белок "+rngTxt(spRange(sp,'protein'))+" г");
  }
  if(sec.kind==="english"){ const e=sec.english;
    /* Служебные блоки курса (приветствие, заключение) в план не подсказываем. */
    const left=axLeaves().filter(x=>x.bi>=1&&x.bi<=5&&!axLeafDone(e.a11y,x)).slice(0,4);
    if(left.length) out.push("Курс W3Cx — дальше: "+left.map(x=>x.t).join(", "));
    for(let i=0;i<TW_LESSONS.length;i++){ if(!e.twenty.done[twKey(i)]){ out.push("«20 уроков» — следующий урок №"+(i+1)); break; } }
    if(!lsWk(e,mon).done) out.push("Занятие с преподавателем — запланировать на неделю");
  }
  return out;
}
function buildWeekPlan(mon){
  const sun=dateAddDays(mon,6);
  let L=["ПЛАН","Неделя "+isoWeek(mon).split("-W")[1]+" ("+ruDate(mon)+" — "+ruDate(sun)+")",""];
  PLAN_ORDER.forEach(kind=>{ const sec=data.sections.find(x=>x.kind===kind); if(!sec) return;
    const g=PLAN_GOALS[kind]||{goal:sec.name,cat:""};
    L.push("🎯 "+g.goal);
    if(g.cat) L.push("Категория: "+g.cat);
    L.push("");
    L.push("План:");
    const fixed=String(planTplFor(secKey(sec))||"").split("\n").map(x=>x.trim()).filter(Boolean);
    const auto=planAutoLines(sec,mon);
    const all=fixed.concat(auto);
    if(all.length) all.forEach(x=>L.push("• "+x)); else L.push("• —");
    L.push("");
  });
  L.push("— собрано "+ruDate(todayStr()));
  return L.join("\n");
}
function wplanText(mon){ const g=wGeneral(isoWeek(mon)); const man=String(g.plan||"").trim(); return man!==""?g.plan:buildWeekPlan(mon); }
function openWeekPlan(){ if(!wplanMon) window.wplanMon=planNextMon(); renderWeekPlan(); showModal(); }
function wplanShift(n){ window.wplanMon=dateAddDays(wplanMon||planNextMon(),n*7); renderWeekPlan(); }
function wplanSet(v){ const w=isoWeek(wplanMon); wGeneral(w).plan=v; mstamp("wg:"+w+":plan"); save(); }
function wplanReset(){ const w=isoWeek(wplanMon); wGeneral(w).plan=""; mstamp("wg:"+w+":plan"); save(); renderWeekPlan(); toast("План пересобран"); }
function renderWeekPlan(){ const mon=wplanMon, edited=String(wGeneral(isoWeek(mon)).plan||"").trim()!=="";
  document.getElementById("modal").innerHTML=`<div class="planhead"><h3>Текст плана на неделю</h3><div class="weeknav sm"><button aria-label="Раньше" onclick="wplanShift(-1)">‹</button><span>${ruDate(mon)} — ${ruDate(dateAddDays(mon,6))}</span><button aria-label="Позже" onclick="wplanShift(1)">›</button></div></div>
  <p class="mhint">Постоянные строки берутся из шаблона, меняющиеся трекер дописывает сам. Правь текст как хочешь — правки сохраняются на эту неделю.</p>
  <textarea class="note-area" id="reportText" style="min-height:340px; font-family:ui-monospace,monospace; font-size:12.5px" oninput="wplanSet(this.value)">${esc(wplanText(mon))}</textarea>
  <div class="pt-hint">${edited?'Текст отредактирован вручную и больше не пересобирается автоматически.':'Собран автоматически из шаблона и текущего состояния курсов.'}</div>
  <div class="modal-actions"><button class="btn" onclick="openPlanTpl()">${svg('pencil')} Постоянные строки</button><button class="btn" onclick="wplanReset()">Пересобрать</button><button class="btn" onclick="copyReport()">Скопировать</button><button class="btn primary" onclick="downloadReport()">Скачать .txt</button></div>`; }
function openPlanTpl(){
  const rows=PLAN_ORDER.map(kind=>{ const sec=data.sections.find(x=>x.kind===kind); if(!sec) return "";
    const sk=secKey(sec), g=PLAN_GOALS[kind]||{};
    return `<label for="tpl_${sk}">${esc(g.goal||sec.name)}</label>
      <textarea class="note-area" id="tpl_${sk}" style="min-height:96px" placeholder="по строке на пункт" oninput="planTplSet('${sk}',this.value)">${esc(planTplFor(sk))}</textarea>`; }).join("");
  document.getElementById("modal").innerHTML=`<h3>Постоянные строки плана</h3>
  <p class="mhint">То, что повторяется каждую неделю. По строке на пункт, без «•». Меняющееся — следующий урок, фокус недели, сеансы физиотерапии — трекер допишет сам.</p>
  ${rows}
  <div class="modal-actions"><button class="btn primary" onclick="renderWeekPlan()">Готово</button></div>`; }

/* ---- имена наружу ---- */
Object.assign(window, {
  pctTxt, spStreakAt, tsInWeek, cWeekSteps, yaWeek, gvWeek,
  vkWeek, crWeekItems, autoMin, autoHours, revRead, repHours,
  hTxt, repMin, metTime, num1, metSport, metCareer,
  metEnglish, metCourse, metBlocks, metCustom, metGeneric, metricsOf,
  metricsRaw, metFmt, metricsAuto, metricsText, metricsLines, reportSport,
  reportCareer, reportEnglish, reportCourse, reportGeneric, reportCustom, buildWeeklyReport,
  openReport, renderReportModal, reportShift, copyReport, downloadReport, ensureWeekData,
  secKey, wPlan, wReview, wGeneral, ensurePlan, planForDate,
  planWeekDays, planForWeek, planWeekDone, schedSections, schedItems, refState,
  taskDone, openPlan, planShift, planPick, planToggle, planDel,
  renderPlanModal, openPlanTask, ptSecChange, fillPtItems, ptItemChange, savePlanTask,
  planTaskForSec, miniCal, reviewWeekMon, openReport2, report2Shift, report2Pick,
  weekHasReport, renderReport2, weekReviewSet, weekReviewSetR, repResetMetrics, repSetCook,
  weekGeneralSet, buildFullReport, openWeekReport, mergePlanArr, lwwField, mergeWeek,
  mergePlan, ensurePlanTpl, planTplFor, planTplSet, planNextMon, spCycleWeekAt,
  planAutoLines, buildWeekPlan, wplanText, openWeekPlan, wplanShift, wplanSet,
  wplanReset, renderWeekPlan, openPlanTpl, PAUSE_MET, PLAN_GOALS, PLAN_TPL_DEF,
  PLAN_ORDER,
});
