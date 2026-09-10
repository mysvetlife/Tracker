/* helpers.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Shared helpers ================= */
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function plural(n,a,b,c){ n=Math.abs(n)%100; const n1=n%10; if(n>10&&n<20)return c; if(n1>1&&n1<5)return b; if(n1===1)return a; return c; }
function fmtMin(m){ if(!m) return "0 мин"; if(m<60) return m+" мин"; const h=Math.floor(m/60),mm=m%60; return mm?`${h} ч ${mm} мин`:`${h} ч`; }
function fmtDate(s){ return new Date(s+"T00:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short"}); }
function ymd(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function todayStr(){ return ymd(new Date()); }
function softColor(c){ return `color-mix(in srgb, ${c} 16%, transparent)`; }
function ring(pct,size,stroke,color,showText){
  const r=(size-stroke)/2, c=2*Math.PI*r, off=c*(1-pct), cx=size/2;
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="${stroke}"/>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${cx} ${cx})" style="transition:stroke-dashoffset .6s var(--ease)"/>
    ${showText?`<text x="${cx}" y="${cx+size*0.075}" text-anchor="middle" fill="var(--text)" font-family="Sora,sans-serif" font-size="${size*0.24}" font-weight="700">${Math.round(pct*100)}%</text>`:''}
  </svg>`;
}

/* ================= Course helpers ================= */
function ckey(li,si){ return "l"+li+"s"+si; }
function cIsDone(c,li,si){ return !!c.done[ckey(li,si)]; }
function cLessonDone(c,li){ return COURSE[li].s.reduce((a,_,si)=>a+(cIsDone(c,li,si)?1:0),0); }
function cTotalSteps(){ return COURSE.reduce((a,l)=>a+l.s.length,0); }
function cDoneSteps(c){ return COURSE.reduce((a,l,li)=>a+cLessonDone(c,li),0); }
function cMinutes(c){ return c.timeLog.reduce((a,t)=>a+(t.m||0),0); }
function cTodayMinutes(c){ const d=todayStr(); return c.timeLog.filter(t=>t.d===d).reduce((a,t)=>a+(t.m||0),0); }
function cLastBookmark(c){ for(let i=c.timeLog.length-1;i>=0;i--){ if(c.timeLog[i].note) return c.timeLog[i].note; } return ""; }

/* ================= Unified section metrics ================= */
function itemProgress(it){
  if(it.type==="check") return it.done?1:0;
  if(it.type==="counter") return it.goal>0?Math.min(it.value/it.goal,1):(it.value>0?1:0);
  if(it.type==="time") return it.goal>0?Math.min(it.minutes/it.goal,1):0;
  return 0;
}
function sectionProgress(sec){
  if(sec.kind==="course"){ const t=cTotalSteps(); return t?cDoneSteps(sec.course)/t:0; }
  if(sec.kind==="sport"){ return spWeekCompliance(sec.sport); }
  /* Блоки на паузе исключены — так же, как в английском: приостановленное не должно
     годами тянуть процент раздела вниз. Древо Света поставила на паузу сама. */
  if(sec.kind==="career"){ const c=sec.career, eE=engData(); let d=0,t=0;
    if(!cardIsPaused(sec,'stages')){ d+=crAllDone(c); t+=crAllTotal(); }
    RT_PROJECTS.forEach(p=>{ if(!cardIsPaused(sec,rtCardKey(p))){ d+=rtDone(c,p); t+=rtTotal(p); } });
    if(!cardIsPaused(sec,'a11y')){ d+=(eE?axAllDone(eE.a11y):0); t+=axTotal(); }
    if(!cardIsPaused(sec,'vk')){ d+=vkAllDone(c.vkcourse); t+=vkTotal(); }
    if(!cardIsPaused(sec,'mts')){ d+=mtsAllDone(c.mts); t+=mtsTotal(); }
    return t?d/t:0; }
  /* Блоки на паузе исключены: иначе Практикум с его 52/232 вечно тянул бы
     общий процент вниз, показывая застой там, где его нет. */
  if(sec.kind==="english"){ const e=sec.english; let d=axAllDone(e.a11y)+twDone(e), t=axTotal()+twTotal();
    if(!engPaused(e,'ya')){ d+=yaDone(e); t+=yaTotal(); }
    if(!engPaused(e,'th')){ d+=thDone(e); t+=thTotal(); }
    return t?d/t:0; }
  /* Конструктор: процент — только по конечным блокам (чек-листы и курсы).
     Привычки и счётчики бесконечны и в процент не входят — как ежедневные трекеры. */
  if(sec.kind==="custom"){ let d=0,t=0; (sec.blocks||[]).forEach(b=>{ if(cardIsPaused(sec,cbCardKey(b))) return;
      if(b.type==="checklist"){ t+=b.items.length; d+=b.items.filter(it=>b.done[it.id]).length; }
      if(b.type==="program"){ (b.groups||[]).forEach(g=>{ t+=g.lessons.length; d+=g.lessons.filter(l=>b.done[l.id]).length; }); } });
    return t?d/t:null; }
  const m=sec.items.filter(it=>!(it.type==="time"&&it.goal<=0));
  if(m.length===0) return sec.items.some(it=>it.minutes>0)?null:0;
  return m.reduce((a,it)=>a+itemProgress(it),0)/m.length;
}
function sectionTime(sec){
  const cb=cbWeekMin(sec,mondayOf(todayStr()));          // минуты привычек-блоков, у любого раздела
  if(sec.kind==="course") return cMinutes(sec.course)+cb;
  if(sec.kind==="sport") return cb;
  if(sec.kind==="career") return careerWeekMin(sec.career,mondayOf(todayStr()))+cb;
  if(sec.kind==="english") return engWeekMin(sec.english,mondayOf(todayStr()))+cb;
  if(sec.kind==="custom") return cb;
  return sec.items.filter(it=>it.type==="time").reduce((a,it)=>a+(it.minutes||0),0);
}
function itemsMeta(sec){
  if(sec.kind==="course"){ return cDoneSteps(sec.course)+"/"+cTotalSteps()+" этапов"; }
  if(sec.kind==="sport"){ const sp=sec.sport; if(!sp.config.startDate) return "Настрой цикл"; return "Неделя "+spCycleWeek(sp)+"/"+spWeeks(sp)+" · стрик "+spCurrentStreak(sp); }
  if(sec.kind==="career"){ const c=sec.career; if(!c.config.startDate) return "Настрой цикл"; const cur=mondayOf(todayStr());
    const m=careerWeekMin(c,cur), eE=engData();
    const cd=vkAllDone(c.vkcourse)+mtsAllDone(c.mts)+(eE?axAllDone(eE.a11y):0), ct=vkTotal()+mtsTotal()+axTotal();
    return (m?fmtMin(m)+" за неделю":"за неделю пока пусто")+" · план "+rtAllDone(c)+"/"+rtAllTotal()+" · курсы "+cd+"/"+ct+" · отклики "+dtWeekCount(c,'apply',cur)+"/7"; }
  if(sec.kind==="english"){ const e=sec.english, cur=mondayOf(todayStr());
    const m=engWeekMin(e,cur), sp=engSpeakMin(e,cur);
    return (m?fmtMin(m)+" за неделю":"за неделю пока пусто")+(sp?" · говорения "+fmtMin(sp):"")+" · шэдоуинг "+dtWeekCount(e,'shadow',cur)+"/7"; }
  if(sec.kind==="custom"){ const n=(sec.blocks||[]).length; if(!n) return "Собери из блоков";
    let d=0,t=0; sec.blocks.forEach(b=>{ if(b.type==="checklist"){ t+=b.items.length; d+=b.items.filter(it=>b.done[it.id]).length; }
      if(b.type==="program"){ (b.groups||[]).forEach(g=>{ t+=g.lessons.length; d+=g.lessons.filter(l=>b.done[l.id]).length; }); } });
    return n+" "+plural(n,'блок','блока','блоков')+(t?" · "+d+"/"+t+" готово":""); }
  const ch=sec.items.filter(i=>i.type==="check");
  if(ch.length) return ch.filter(c=>c.done).length+"/"+ch.length+" готово";
  const c=sec.items.find(i=>i.type==="counter");
  if(c) return c.value+(c.goal?" / "+c.goal:"");
  return sec.items.length+" "+plural(sec.items.length,'пункт','пункта','пунктов');
}

/* ---- имена наружу ---- */
Object.assign(window, {
  esc, plural, fmtMin, fmtDate, ymd, todayStr,
  softColor, ring, ckey, cIsDone, cLessonDone, cTotalSteps,
  cDoneSteps, cMinutes, cTodayMinutes, cLastBookmark, itemProgress, sectionProgress,
  sectionTime, itemsMeta,
});
