/* actions.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Actions: generic ================= */
function go(id){ data.active=id; render(); if(activeCourse()) afterCourseRender(); }
function findSec(id){ return data.sections.find(s=>s.id===id); }
function findItem(sid,iid){ const s=findSec(sid); return s&&s.items?s.items.find(i=>i.id===iid):null; }
function toggleCheck(sid,iid){ const it=findItem(sid,iid); it.done=!it.done; mstamp("gi:"+sid+"."+iid); render(); }
function bump(sid,iid,d){ const it=findItem(sid,iid); it.value=Math.max(0,(it.value||0)+d); render(); }
function addMin(sid,iid,d){ const it=findItem(sid,iid); it.minutes=Math.max(0,(it.minutes||0)+d); render(); }
function addItem(sid,type){ const s=findSec(sid);
  const b={id:uid(),type,name:type==="check"?"Новый пункт":type==="counter"?"Новый счётчик":"Новое время"};
  if(type==="check") b.done=false; if(type==="counter"){ b.value=0; b.goal=0; } if(type==="time"){ b.minutes=0; b.goal=0; b.note=""; }
  s.items.push(b); render(); toast("Добавлено"); }
function deleteItem(sid,iid){ if(!confirm("Удалить этот пункт?"))return; const s=findSec(sid); s.items=s.items.filter(i=>i.id!==iid); render(); }
function renameItem(sid,iid){ const it=findItem(sid,iid); const v=prompt("Название пункта:",it.name); if(v!==null&&v.trim()){ it.name=v.trim(); render(); } }
function setGoal(sid,iid){ const it=findItem(sid,iid); const v=prompt("Цель (число раз):",it.goal||0); if(v!==null){ const n=parseInt(v,10); it.goal=isNaN(n)?0:Math.max(0,n); render(); } }
function setGoalTime(sid,iid){ const it=findItem(sid,iid); const v=prompt("Цель в минутах (0 = без цели):",it.goal||0); if(v!==null){ const n=parseInt(v,10); it.goal=isNaN(n)?0:Math.max(0,n); render(); } }
function deleteSection(id){ if(!confirm("Удалить весь раздел?"))return;
  data.secDeleted=data.secDeleted||[]; if(data.secDeleted.indexOf(id)<0) data.secDeleted.push(id);  // тумбстон: чтобы не воскрес при синхронизации
  evLog("block_state",{block:id, kind:"section", state:"deleted", name:(findSec(id)||{}).name});
  data.sections=data.sections.filter(s=>s.id!==id); data.active="overview"; render(); }

/* ================= Actions: course ================= */
function toggleStep(li,si){ const sec=activeCourse(); if(!sec)return; const c=sec.course, k=ckey(li,si);
  if(c.done[k]) delete c.done[k]; else c.done[k]=1; mstamp("co:"+k); save(); refreshCourseDash(); renderCourseLessons(); }
function toggleLesson(li){ const sec=activeCourse(); if(!sec)return; sec.course.exp[li]=!sec.course.exp[li]; save(); renderCourseLessons(); }
function markLesson(li,val){ const sec=activeCourse(); if(!sec)return; const c=sec.course;
  COURSE[li].s.forEach((_,si)=>{ const k=ckey(li,si); if(val) c.done[k]=1; else delete c.done[k]; mstamp("co:"+k); }); save(); refreshCourseDash(); renderCourseLessons(); }
function setCFilter(f){ window.courseFilter=f; const a=document.getElementById("fAll"),b=document.getElementById("fLeft");
  if(a)a.classList.toggle("on",f==="all"); if(b)b.classList.toggle("on",f==="left"); renderCourseLessons(); }
function toggleAllLessons(){ const sec=activeCourse(); if(!sec)return; window.courseAllOpen=!courseAllOpen;
  COURSE.forEach((_,li)=>sec.course.exp[li]=courseAllOpen); save(); renderCourseLessons(); }
function refreshCourseDash(){
  const sec=activeCourse(); if(!sec)return; const c=sec.course;
  const v=document.getElementById("view"); if(!v)return;
  // update only the dashboard numbers + ring without full re-render (keeps scroll/inputs)
  const done=cDoneSteps(c), total=cTotalSteps(), pct=total?done/total:0;
  const lessonsDone=COURSE.filter((l,li)=>cLessonDone(c,li)===l.s.length).length;
  const dring=v.querySelector(".dring"); if(dring) dring.innerHTML=ring(pct,132,12,'var(--a-violet)',true);
  const stats=v.querySelectorAll(".stat .n");
  if(stats.length>=3){ stats[0].textContent=done+"/"+total; stats[1].textContent=lessonsDone+"/"+COURSE.length;
    stats[2].textContent=cWeekSteps(c,mondayOf(todayStr())); }
}

/* ---- имена наружу ---- */
Object.assign(window, {
  go, findSec, findItem, toggleCheck, bump, addMin,
  addItem, deleteItem, renameItem, setGoal, setGoalTime, deleteSection,
  toggleStep, toggleLesson, markLesson, setCFilter, toggleAllLessons, refreshCourseDash,
});
