/* project.js
   Вид раздела kind:"project": План, Канбан и страница задачи (Теория, Практика,
   Заметки, Вопросы, Ссылки). Данные и метки синхронизации описаны в project-model.js.
   Правки идут через mstamp(метка) и save(); перерисовка нужна только при смене состава. */

window.pjTab="plan"; window.pjTask=null; window.pjBTab="theory"; window.pjPath=[]; window.pjFocus=null; window.pjQuery=""; window.pjFilter="all";
const PJ_ST={n:"Не начато",i:"Идёт",d:"Готово",o:"Необязательно"}, PJ_ORDER=["n","i","d","o"];
const PJ_TYPE={"":"•",v:"▶",a:"≡",r:"✎",q:"?"}, PJ_TYPE_NEXT={"":"v",v:"a",a:"r",r:"q",q:""};
const PJ_TYPE_NAME={"":"без типа",v:"видео",a:"текст",r:"практика",q:"тест"};
const PJ_BTABS=[["theory","Теория"],["practice","Практика"],["notes","Заметки"],["questions","Вопросы"],["links","Ссылки"]];
const PJ_BLK=[["p","Текст","¶"],["h","Заголовок","H"],["ul","Список","•"],["todo","Чек-лист","☑"],["quote","Цитата","❝"],["code","Код","</>"],["page","Страница","📄"]];

function pjSec(id){ return data.sections.find(s=>s.id===id&&s.kind==="project"); }
function pjSub(p,id){ for(const t of pjTasks(p)){ const s=t.subs.find(x=>x.id===id); if(s) return {sub:s,task:t}; } return null; }
function pjOpenState(p,id,def){ const v=p.exp[id]; return v===undefined?def:!!v; }
function pjEd(k,secId,id,text,ph,cls){ return `<span class="pj-ed ${cls||''}" contenteditable="plaintext-only" data-k="${k}" data-s="${secId}" data-id="${id}" data-ph="${esc(ph)}">${esc(text)}</span>`; }
function pjDate(s){ return s?fmtDate(s):""; }
function pjDone(t){ return t.status==="d"; }
function pjTouchTask(t){ mstamp("pj:"+t.id); }

/* ---------- состояние задачи ---------- */
function pjSetStatus(secId,taskId,st){ const sec=pjSec(secId); if(!sec) return; const f=pjFind(sec.project,taskId); if(!f) return; const t=f.task;
  if(t.status===st) return; t.status=st; t.doneOn=st==="d"?todayStr():"";
  if(st==="d") t.subs.forEach(s=>{ if(!s.done){ s.done=true; mstamp("ps:"+s.id); } });   // «Готово» отмечает и все подзадачи
  pjTouchTask(t); render(); }
function pjCycle(secId,taskId){ const sec=pjSec(secId); const f=sec&&pjFind(sec.project,taskId); if(!f) return;
  pjSetStatus(secId,taskId,PJ_ORDER[(PJ_ORDER.indexOf(f.task.status)+1)%PJ_ORDER.length]); }
function pjCheckTask(secId,taskId){ const sec=pjSec(secId); const f=sec&&pjFind(sec.project,taskId); if(!f) return;
  pjSetStatus(secId,taskId,f.task.status==="d"?"i":"d"); }
/* галочка подзадачи; вся задача становится «Готово», когда отмечены все подзадачи, и «Идёт», если одну сняли */
function pjSetSubDone(s,t,v){ if(s.done===v) return; s.done=v; mstamp("ps:"+s.id);
  if(t.subs.every(x=>x.done)&&t.status!=="d"&&t.status!=="o"){ t.status="d"; t.doneOn=todayStr(); pjTouchTask(t); }
  else if(!v&&t.status==="d"){ t.status="i"; t.doneOn=""; pjTouchTask(t); }
  else if(v&&t.status==="n"){ t.status="i"; pjTouchTask(t); } }
function pjToggleSub(secId,subId){ const sec=pjSec(secId); const f=sec&&pjSub(sec.project,subId); if(!f) return;
  pjSetSubDone(f.sub,f.task,!f.sub.done); render(); }
function pjCycleType(secId,subId){ const sec=pjSec(secId); const f=sec&&pjSub(sec.project,subId); if(!f) return;
  f.sub.type=PJ_TYPE_NEXT[f.sub.type||""]||""; mstamp("pj:"+f.sub.id); render(); }
function pjField(secId,taskId,field,val){ const sec=pjSec(secId); const f=sec&&pjFind(sec.project,taskId); if(!f) return; const t=f.task;
  if(field==="hours") val=Math.max(0,parseFloat(String(val).replace(",","."))||0);
  if(field==="note"||field==="prac") val=!!val;
  t[field]=val; pjTouchTask(t); save(); if(field==="note"||field==="prac") render(); }
function pjFold(secId,key,def){ const sec=pjSec(secId); if(!sec) return; const p=sec.project;
  p.exp[key]=pjOpenState(p,key,def)?0:1; render(); }

/* ---------- создание и удаление ---------- */
function pjAddStage(secId){ const sec=pjSec(secId); if(!sec) return; const st={id:uid(),name:"Этап "+(sec.project.stages.length+1),tasks:[]};
  sec.project.stages.push(st); mstamp("pj:"+st.id); window.pjFocus=st.id; render(); }
function pjAddTask(secId,stageId){ const sec=pjSec(secId); if(!sec) return; const p=sec.project;
  let st=p.stages.find(x=>x.id===stageId); if(!st){ st={id:uid(),name:"Этап 1",tasks:[]}; p.stages.push(st); mstamp("pj:"+st.id); }
  const t=ensureTask({id:uid(),name:"",status:"n"}); st.tasks.push(t); pjTouchTask(t); p.exp[st.id]=1; window.pjFocus=t.id; render(); }
function pjAddSub(secId,taskId){ const sec=pjSec(secId); const f=sec&&pjFind(sec.project,taskId); if(!f) return; const t=f.task;
  const s={id:uid(),name:"",done:false,type:""}; t.subs.push(s); mstamp("pj:"+s.id);
  if(t.status==="d"){ t.status="i"; t.doneOn=""; pjTouchTask(t); }
  sec.project.exp[t.id]=1; window.pjFocus=s.id; render(); }
function pjDel(secId,kind,id){ const sec=pjSec(secId); if(!sec) return; const p=sec.project;
  if(kind==="stage"){ const st=p.stages.find(x=>x.id===id); if(!st) return;
    if(st.tasks.length&&!confirm("Удалить этап «"+st.name+"» вместе с задачами ("+st.tasks.length+")?")) return;
    st.tasks.forEach(t=>p.del.push(t.id)); p.del.push(id); p.stages=p.stages.filter(x=>x.id!==id); }
  else if(kind==="task"){ const f=pjFind(p,id); if(!f) return;
    if((f.task.subs.length||pjBlockCount(f.task))&&!confirm("Удалить задачу «"+(f.task.name||"без названия")+"» со всем содержимым?")) return;
    p.del.push(id); f.stage.tasks=f.stage.tasks.filter(x=>x.id!==id); if(window.pjTask===id) window.pjTask=null; }
  else if(kind==="sub"){ const f=pjSub(p,id); if(!f) return; p.del.push(id); f.task.subs=f.task.subs.filter(x=>x.id!==id); }
  render(); }
function pjBlockCount(t){ return PJ_BLOCK_KEYS.reduce((a,k)=>a+pjBlkCount(t.blocks[k]),0); }

/* ---------- переименование на месте ---------- */
function pjRename(el,live){ if(!el.isConnected) return; const sec=pjSec(el.dataset.s); if(!sec) return; const p=sec.project, id=el.dataset.id, k=el.dataset.k;
  const v=el.innerText.replace(/\s*\n\s*/g," ").trim(); if(!live) el.textContent=v;      // при наборе текст не трогаем, чтобы не сбить курсор
  if(k==="proj"){ if(!v){ if(!live) el.textContent=sec.name; return; } if(sec.name===v) return; sec.name=v; mstamp("cs:"+sec.id); save(); renderTabs(); return; }
  if(k==="goal"){ if(sec.goal===v) return; sec.goal=v; mstamp("cs:"+sec.id); save(); return; }
  if(k==="stage"){ const st=p.stages.find(x=>x.id===id); if(st&&st.name!==v){ st.name=v; mstamp("pj:"+id); save(); } return; }
  if(k==="task"){ const f=pjFind(p,id); if(f&&f.task.name!==v){ f.task.name=v; pjTouchTask(f.task); save(); } return; }
  if(k==="sub"){ const f=pjSub(p,id); if(f&&f.sub.name!==v){ f.sub.name=v; mstamp("pj:"+id); save(); } } }

/* ---------- открытие страницы задачи ---------- */
function pjGo(secId,tab){ data.active=secId; window.pjTab=tab||window.pjTab; window.pjTask=null; window.pjPath=[]; render(); }
function pjOpenTask(secId,taskId){ data.active=secId; window.pjTask=taskId; window.pjBTab="theory"; window.pjPath=[]; render(); window.scrollTo(0,0); }
function pjBTabSet(k){ window.pjBTab=k; window.pjPath=[]; render(); }
/* вложенная страница: pjPath - id блоков-страниц от списка вкладки до открытой; n - сколько оставить (0 - сама вкладка) */
function pjPathGo(n){ window.pjPath=window.pjPath.slice(0,n); render(); window.scrollTo(0,0); }
function pjResolve(t,key,path){ let list=t.blocks[key]||(t.blocks[key]=[]); const chain=[];
  for(const id of (path||[])){ const b=list.find(x=>x.id===id&&x.type==="page"); if(!b) break; b.kids=b.kids||[]; chain.push(b); list=b.kids; }
  return {list:list,chain:chain}; }

/* ---------- отрисовка (вид как в макете mockups/app.html: плитки, «Сейчас», цифры, вкладки) ---------- */
const PJ_TABS=[["plan","План"],["kan","Канбан"],["gantt","Гант"],["notes","Конспекты"],["prac","Практика"],["time","Время"],["goals","Цели"]];
const PJ_GOAL_KIND={global:"Глобальная",month:"Месяц",year:"Год"};
function pjDiff(a,b){ return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/864e5); }
function pjTaskMin(p,id){ return p.time.filter(x=>x.task===id).reduce((a,x)=>a+(+x.min||0),0); }
function pjStats(p){ const ts=pjTasks(p), cnt=ts.filter(t=>t.status!=="o"), today=todayStr();
  const next=ts.filter(t=>t.status!=="d"&&t.status!=="o"&&t.end).sort((a,b)=>a.end<b.end?-1:1)[0]||null;
  return {doneT:cnt.filter(t=>t.status==="d").length, totalT:cnt.length, going:ts.filter(t=>t.status==="i"), next:next, days:next?pjDiff(today,next.end):null,
    wk:pjWeekMin(p,mondayOf(today)), all:p.time.reduce((a,x)=>a+(+x.min||0),0), plan:Math.round(ts.reduce((a,t)=>a+(+t.hours||0),0)*10)/10,
    stagesDone:p.stages.filter(st=>st.tasks.length&&st.tasks.every(t=>t.status==="d"||t.status==="o")).length}; }
function projectHTML(sec){ const p=sec.project;
  if(window.pjTask){ const f=pjFind(p,window.pjTask); if(f) return pjTaskHTML(sec,f.task,f.stage); window.pjTask=null; }
  const st=pjStats(p), pr=pjProgress(p), tab=window.pjTab, today=todayStr();
  const tiles=[[`${st.doneT}<small>/${st.totalT}</small>`,"задач сделано"],[st.going.length,"задач идёт"],[st.days==null?"—":st.days+"<small> дн.</small>","до ближайшего срока"],[fmtMin(st.wk),"за неделю"]];
  const tilesH=`<div class="tiles">${tiles.map((t,i)=>`<div class="tile t${i+1}"><div class="n${String(t[0]).replace(/<[^>]*>/g,"").length>6?" sm":""}">${t[0]}</div><div class="l">${t[1]}</div></div>`).join("")}</div>`;
  const nowT=st.going.slice().sort((a,b)=>(a.end||"9")<(b.end||"9")?-1:1)[0];
  const nowC=nowT?`<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap"><div><a class="t serif" onclick="pjOpenTask('${sec.id}','${nowT.id}')" style="cursor:pointer">${esc(nowT.name||"Без названия")}</a>
      <div class="meta">${nowT.end?"до "+fmtDate(nowT.end):"без срока"}${st.next&&st.next!==nowT?" · дальше: "+esc(st.next.name):""}</div></div>
      <div style="width:240px;text-align:right;font-size:12px" class="muted">Времени записано: ${fmtMin(pjTaskMin(p,nowT.id))}${nowT.hours?" из "+nowT.hours+" ч":""}<div class="bar" style="background:#f0dcc8"><i style="width:${nowT.hours?Math.min(100,Math.round(pjTaskMin(p,nowT.id)/60/nowT.hours*100)):0}%"></i></div></div></div>`
    :`<div class="muted">Сейчас нет задачи со статусом «Идёт». Нажми на статус задачи в плане, и она появится здесь.</div>`;
  const g0=p.goals[0];
  const facts=`<div class="card" style="padding:10px 6px"><div class="facts"><div><b>${Math.round(pr.pct*100)}%</b><span>прогресс</span></div><div><b>${fmtMin(st.all)}</b><span>записано всего</span></div><div><b>${st.plan} ч</b><span>по плану</span></div>
    <div><b>${st.stagesDone} из ${p.stages.length}</b><span>этапов пройдено</span></div><div><b>${st.next?fmtDate(st.next.end):"—"}</b><span>ближайший срок</span></div><div><b>${g0&&g0.date?fmtDate(g0.date)+" "+g0.date.slice(0,4):"—"}</b><span>срок цели</span></div></div></div>`;
  const cnt={notes:pjTasks(p).filter(t=>t.note).length,prac:pjTasks(p).filter(t=>t.prac).length};
  const tabsH=`<div class="tabs">${PJ_TABS.map(([k,n])=>`<a class="tab ${tab===k?"on":""}" onclick="pjGo('${sec.id}','${k}')">${n}${cnt[k]!=null?` <span class="c">${cnt[k]}</span>`:""}</a>`).join("")}</div>`;
  const body=tab==="kan"?pjKanbanHTML(sec):tab==="gantt"?pjGanttHTML(sec):(tab==="notes"||tab==="prac")?pjFlagList(sec,tab):tab==="time"?pjTimeHTML(sec):tab==="goals"?pjGoalsHTML(sec):pjPlanHTML(sec);
  return tilesH+`<div class="card now"><div class="cap">Сейчас</div>${nowC}</div>`+facts+`<div class="card">${tabsH}<div class="tabbody">${body}</div></div>`;
}
function pjSubHTML(sec,s){ return `<div class="bl"><span class="ck ${s.done?"d":""}" onclick="pjToggleSub('${sec.id}','${s.id}')" role="checkbox" aria-checked="${s.done}"></span>
  <span class="muted" style="cursor:pointer;width:16px;text-align:center" onclick="pjCycleType('${sec.id}','${s.id}')" title="Тип: ${PJ_TYPE_NAME[s.type||""]} (нажми, чтобы сменить)">${PJ_TYPE[s.type||""]}</span>
  ${pjEd("sub",sec.id,s.id,s.name,"Подзадача",s.done?"strike":"")}<span class="del" onclick="pjDel('${sec.id}','sub','${s.id}')" title="Удалить">×</span></div>`; }
const PJ_STCLS={n:"st-n",i:"st-i",d:"st-d",o:"st-o"};
function pjStBadge(sec,t){ return `<span class="tag ${PJ_STCLS[t.status]}" style="cursor:pointer" onclick="pjCycle('${sec.id}','${t.id}')" title="Нажми, чтобы сменить статус">${PJ_ST[t.status]}</span>`; }
function pjPlanHTML(sec){ const p=sec.project;
  if(!p.stages.length) return `<div class="empty"><div class="serif" style="font-size:24px">Плана пока нет</div><p class="muted">${esc(sec.goal||"")}</p><p>Начни с первого этапа, потом добавь в него задачи.</p><a class="btn" onclick="pjAddStage('${sec.id}')">＋ Первый этап</a></div>`;
  const bar=`<div class="tbar"><a class="tab ${pjFilter==="all"?"on":""}" onclick="pjSetFilter('${sec.id}','all')">Все</a><a class="tab ${pjFilter==="left"?"on":""}" onclick="pjSetFilter('${sec.id}','left')">Незавершённые</a>
    <input class="di search" data-s="${sec.id}" placeholder="Поиск по задачам и подзадачам…" value="${esc(pjQuery)}" oninput="pjSearch(this)"><a class="tab" onclick="pjFoldAll('${sec.id}')">Свернуть / развернуть</a></div>`;
  return bar+`<div id="pjPlanBody">${pjPlanBody(sec)}</div><div class="addrow" onclick="pjAddStage('${sec.id}')" style="margin-top:12px">＋ Этап</div>`; }
function pjPlanBody(sec){ const p=sec.project, q=pjQuery.trim().toLowerCase(), narrow=!!q||pjFilter==="left", has=s=>String(s||"").toLowerCase().includes(q);
  const cg='<colgroup><col style="width:70px"><col><col style="width:116px"><col style="width:136px"><col style="width:84px"><col style="width:28px"></colgroup>';
  const html=p.stages.map(st=>{ const dn=st.tasks.filter(t=>t.status==="d").length, open=narrow?true:pjOpenState(p,st.id,true);
    const items=st.tasks.map(t=>{ let subs=t.subs, force=false;
      if(q){ const own=has(t.name), ms=t.subs.filter(x=>has(x.name)); if(!own&&!ms.length) return null; if(!own){ subs=ms; force=true; } }
      if(pjFilter==="left"){ if(t.status==="d"||t.status==="o") return null; subs=subs.filter(x=>!x.done); }
      return {t,subs,force}; }).filter(Boolean);
    if(narrow&&!items.length) return "";
    const rows=items.map(({t,subs,force})=>{ const sopen=force||pjOpenState(p,t.id,false), sd=t.subs.filter(s=>s.done).length;
      let r=`<tr><td><span class="ck ${pjDone(t)?"d":""}" onclick="pjCheckTask('${sec.id}','${t.id}')" role="checkbox" aria-checked="${pjDone(t)}"></span></td>
        <td>${t.subs.length?`<span class="pj-chev ${sopen?"open":""}" onclick="pjFold('${sec.id}','${t.id}',false)" style="cursor:pointer">›</span> `:""}${pjEd("task",sec.id,t.id,t.name,"Название задачи",pjDone(t)?"strike":"")}
          <a class="open" onclick="pjOpenTask('${sec.id}','${t.id}')" title="Открыть страницу задачи" style="cursor:pointer">↗</a>${t.subs.length?` <span class="muted" style="font-size:11.5px">${sd}/${t.subs.length}</span>`:""}${t.note?' <span class="muted" style="font-size:11px" title="Есть конспект">📝</span>':""}${t.prac?' <span class="muted" style="font-size:11px" title="Практика сделана">🛠</span>':""}</td>
        <td>${pjStBadge(sec,t)}</td><td><input type="date" class="di" value="${esc(t.end)}" onchange="pjField('${sec.id}','${t.id}','end',this.value)"></td>
        <td><input type="number" class="di num" min="0" step="0.5" value="${t.hours||""}" placeholder="0" onchange="pjField('${sec.id}','${t.id}','hours',this.value)" style="width:60px"></td>
        <td class="x"><span class="del" onclick="pjDel('${sec.id}','task','${t.id}')" title="Удалить задачу">×</span></td></tr>`;
      if(sopen) r+=subs.map(s=>`<tr class="subrow"><td></td><td colspan="4"><div style="padding-left:22px">${pjSubHTML(sec,s)}</div></td><td></td></tr>`).join("")+`<tr class="subrow"><td></td><td colspan="5"><div class="addrow" style="padding-left:30px" onclick="pjAddSub('${sec.id}','${t.id}')">＋ подзадача</div></td></tr>`;
      return r; }).join("");
    return `<div class="stage"><span><span class="pj-chev ${open?"open":""}" onclick="pjFold('${sec.id}','${st.id}',true)" style="cursor:pointer">›</span> ${pjEd("stage",sec.id,st.id,st.name,"Название этапа")}</span><span class="muted" style="font-weight:400">${dn} из ${st.tasks.length} <span class="del" onclick="pjDel('${sec.id}','stage','${st.id}')" title="Удалить этап">×</span></span></div>`
      +(open?`<table style="table-layout:fixed">${cg}<tr><th>Сделано</th><th>Задача</th><th>Статус</th><th>Срок</th><th>Часы план</th><th></th></tr>${rows}</table>`+(narrow?"":`<div class="addrow" onclick="pjAddTask('${sec.id}','${st.id}')">＋ Задача в этот этап</div>`):""); }).join("");
  return html||`<div class="empty"><p class="muted">Ничего не найдено.</p></div>`; }
function pjSetFilter(secId,f){ window.pjFilter=f; render(); }
function pjSearch(el){ window.pjQuery=el.value; const sec=pjSec(el.dataset.s), box=document.getElementById("pjPlanBody"); if(sec&&box) box.innerHTML=pjPlanBody(sec); }
function pjFoldAll(secId){ const sec=pjSec(secId); if(!sec) return; const p=sec.project, ts=pjTasks(p).filter(t=>t.subs.length);
  const anyOpen=ts.some(t=>pjOpenState(p,t.id,false)); ts.forEach(t=>{ p.exp[t.id]=anyOpen?0:1; }); render(); }

/* ---------- канбан ---------- */
function pjKanbanHTML(sec){ const p=sec.project, all=[]; p.stages.forEach(st=>st.tasks.forEach(t=>all.push({t,st})));
  if(!all.length) return `<div class="empty"><p class="muted">Задач пока нет. Добавь их на вкладке «План».</p></div>`;
  const cols=PJ_ORDER.map(k=>{ const items=all.filter(x=>x.t.status===k).sort((a,b)=>(a.t.end||"9")<(b.t.end||"9")?-1:1), open=pjOpenState(p,"col:"+k,true);
    const cards=open?items.map(({t,st})=>{ const kopen=pjOpenState(p,"k:"+t.id,false), sd=t.subs.filter(s=>s.done).length;
      return `<div class="kcard" draggable="true" data-s="${sec.id}" data-id="${t.id}"><div style="display:flex;justify-content:space-between;gap:6px"><a onclick="pjOpenTask('${sec.id}','${t.id}')">${esc(t.name||"Без названия")}</a>${t.subs.length?`<span class="pj-chev ${kopen?"open":""}" onclick="pjFold('${sec.id}','k:${t.id}',false)" style="cursor:pointer">›</span>`:""}</div>
        <small>${esc(st.name)} · ${t.end?"до "+fmtDate(t.end):"без срока"}${t.hours?" · "+t.hours+" ч":""}${t.subs.length?" · "+sd+"/"+t.subs.length:""}</small>
        ${kopen?`<div style="margin-top:6px">${t.subs.map(s=>`<div class="bl" style="padding:2px 0"><span class="ck ${s.done?"d":""}" onclick="pjToggleSub('${sec.id}','${s.id}')"></span><span class="${s.done?"strike":""}" style="font-size:12.5px">${esc(s.name||"Подзадача")}</span></div>`).join("")}</div>`:""}</div>`; }).join("")||'<div class="muted" style="font-size:12px;padding:6px">пусто</div>':"";
    return `<div class="kcol" data-s="${sec.id}" data-st="${k}"><div class="kh" onclick="pjFold('${sec.id}','col:${k}',true)" style="cursor:pointer"><b><span class="pj-chev ${open?"open":""}">›</span> ${PJ_ST[k]}</b><span class="muted">${items.length}</span></div>${cards}</div>`; }).join("");
  return `<div class="kan">${cols}</div><div class="muted" style="font-size:12px;margin-top:10px">Перетащи карточку в другую колонку, и статус задачи изменится. Стрелка сворачивает колонку или карточку.</div>`; }

/* ---------- гант ---------- */
function pjGanttHTML(sec){ const p=sec.project, ts=pjTasks(p).filter(t=>t.end);
  if(!ts.length) return `<div class="empty"><p class="muted">Нет задач со сроком. Добавь срок в плане, и задача появится на шкале.</p></div>`;
  const today=todayStr(), starts=ts.map(t=>t.start||dateAddDays(t.end,-3)).concat(today), ax=mondayOf(starts.sort()[0]), endMax=ts.map(t=>t.end).sort().pop();
  const weeks=Math.min(14,Math.max(8,Math.ceil((pjDiff(ax,endMax)+1)/7))), total=weeks*7;
  const col={n:"background:#ece4dc;border:1px solid #d3c3b3",i:"background:var(--yellow);border:1px solid #e0c97f",d:"background:var(--sage);border:1px solid #adc19a",o:"background:var(--lilac);border:1px solid #cdbfd6"};
  const heads=Array.from({length:weeks},(_,i)=>`<span>${fmtDate(dateAddDays(ax,i*7))}</span>`).join("");
  const rows=ts.map(t=>{ const a=t.start||dateAddDays(t.end,-3), l=pjDiff(ax,a)/total*100, w=(pjDiff(a,t.end)+1)/total*100;
    return `<div class="gntrow"><div class="gntl"><a onclick="pjOpenTask('${sec.id}','${t.id}')" style="cursor:pointer">${esc(t.name||"Без названия")}</a></div><div class="gntt"><div class="gb" style="left:${l}%;width:${w}%;${col[t.status]}" title="${esc(t.name)}: ${fmtDate(a)} — ${fmtDate(t.end)}"></div></div></div>`; }).join("");
  const tl=pjDiff(ax,today)/total*100;
  return `<div class="gnt" style="--n:${weeks}"><div class="gntrow gnthead"><div class="gntl"></div><div class="gntt"><div class="gntweeks">${heads}</div></div></div>
    <div class="gntbody">${rows}<div class="gntgrid"><div class="gnttoday" style="left:${tl}%"><i>сегодня</i></div></div></div></div>
    <div class="muted" style="font-size:12px;margin-top:10px">Жёлтое идёт, серое не начато, зелёное готово. Срок меняется в плане или на странице задачи.</div>`; }

/* ---------- конспекты и практика: задачи с галочкой ---------- */
function pjFlagList(sec,tab){ const f=tab==="notes"?"note":"prac", p=sec.project;
  const items=p.stages.flatMap(st=>st.tasks.filter(t=>t[f]).map(t=>({t,st})));
  const hint=`<p class="muted" style="margin-bottom:8px">${f==="note"?"Задачи с галочкой «Конспект есть».":"Задачи с галочкой «Практика сделана»."} Галочки ставятся на странице задачи.</p>`;
  if(!items.length) return hint+`<div class="empty"><p class="muted">Пока ни одной. Открой задачу и поставь галочку.</p></div>`;
  return hint+`<table>${items.map(({t,st})=>`<tr><td><a class="serif" style="font-size:18px;cursor:pointer" onclick="pjOpenTask('${sec.id}','${t.id}')">${esc(t.name||"Без названия")}</a><div class="muted" style="font-size:12px">${esc(st.name)}</div></td><td>${pjStBadge(sec,t)}</td><td class="muted">${t.end?"до "+fmtDate(t.end):""}</td></tr>`).join("")}</table>`; }

/* ---------- время ---------- */
function pjTimeHTML(sec){ const p=sec.project, opts=pjTasks(p);
  const rows=p.time.slice().sort((a,b)=>a.date<b.date?1:-1).map(x=>`<tr><td><input type="date" class="di" value="${esc(x.date)}" onchange="pjTimeField('${sec.id}','${x.id}','date',this.value)"></td>
    <td><input class="di" style="width:100%" value="${esc(x.what)}" placeholder="Что делала" onchange="pjTimeField('${sec.id}','${x.id}','what',this.value)"></td>
    <td><select class="di" onchange="pjTimeField('${sec.id}','${x.id}','task',this.value)"><option value="">—</option>${opts.map(t=>`<option value="${t.id}" ${t.id===x.task?"selected":""}>${esc(t.name||"Без названия")}</option>`).join("")}</select></td>
    <td><input type="number" class="di num" min="0" value="${x.min||""}" placeholder="0" style="width:64px" onchange="pjTimeField('${sec.id}','${x.id}','min',this.value)"></td>
    <td><input class="di" style="width:100%" value="${esc(x.src)}" placeholder="Источник" onchange="pjTimeField('${sec.id}','${x.id}','src',this.value)"></td>
    <td class="x"><span class="del" onclick="pjDelTime('${sec.id}','${x.id}')" title="Удалить">×</span></td></tr>`).join("");
  const sum=p.time.reduce((a,x)=>a+(+x.min||0),0);
  return `<table style="table-layout:fixed"><colgroup><col style="width:130px"><col><col style="width:190px"><col style="width:80px"><col style="width:130px"><col style="width:28px"></colgroup><tr><th>Дата</th><th>Что делала</th><th>Задача</th><th>Минут</th><th>Источник</th><th></th></tr>${rows}</table>
  <div class="addrow" onclick="pjAddTime('${sec.id}')">＋ Запись времени</div><div class="muted" style="font-size:12px;margin-top:8px">Всего записано: ${fmtMin(sum)}</div>`; }
function pjAddTime(secId){ const sec=pjSec(secId); if(!sec) return; const x={id:uid(),task:"",date:todayStr(),min:0,what:"",src:""};
  sec.project.time.push(x); mstamp("pt:"+x.id); render(); }
function pjTimeField(secId,id,f,v){ const sec=pjSec(secId); const x=sec&&sec.project.time.find(y=>y.id===id); if(!x) return;
  x[f]=f==="min"?Math.max(0,parseInt(v,10)||0):v; mstamp("pt:"+id); save(); if(f==="min"||f==="date") render(); }
function pjDelTime(secId,id){ const sec=pjSec(secId); if(!sec) return; sec.project.del.push(id); sec.project.time=sec.project.time.filter(x=>x.id!==id); render(); }

/* ---------- цели ---------- */
function pjGoalsHTML(sec){ const p=sec.project;
  return p.goals.map(g=>`<div class="goal"><b><span>${PJ_GOAL_KIND[g.kind]||"Цель"}: <input class="di" style="width:60%;font-weight:600;color:var(--text)" value="${esc(g.title)}" placeholder="Название цели" onchange="pjGoalField('${sec.id}','${g.id}','title',this.value)"></span><span>${g.pct}%</span></b>
    <div class="bar" style="margin:6px 0"><i style="width:${g.pct}%"></i></div>
    <div style="display:flex;gap:12px;align-items:center"><input type="range" min="0" max="100" value="${g.pct}" class="rg" style="flex:1" onchange="pjGoalField('${sec.id}','${g.id}','pct',this.value)"> <span class="muted" style="font-size:12px">срок</span>
      <input type="date" class="di" value="${esc(g.date)}" onchange="pjGoalField('${sec.id}','${g.id}','date',this.value)"><span class="del" onclick="pjDelGoal('${sec.id}','${g.id}')" title="Удалить цель">×</span></div></div>`).join("")
    +`<div class="addrow" onclick="pjAddGoal('${sec.id}','month')">＋ Цель месяца</div><div class="addrow" onclick="pjAddGoal('${sec.id}','year')">＋ Цель года</div><div class="muted" style="font-size:12px;margin-top:8px">Процент ставится вручную ползунком.</div>`; }
function pjAddGoal(secId,kind){ const sec=pjSec(secId); if(!sec) return; const g={id:uid(),kind:kind,title:"",date:"",pct:0}; sec.project.goals.push(g); mstamp("pg:"+g.id); render(); }
function pjGoalField(secId,id,f,v){ const sec=pjSec(secId); const g=sec&&sec.project.goals.find(x=>x.id===id); if(!g) return; g[f]=f==="pct"?Math.max(0,Math.min(100,parseInt(v,10)||0)):v; mstamp("pg:"+id); save(); if(f==="pct") render(); }
function pjDelGoal(secId,id){ const sec=pjSec(secId); if(!sec) return; sec.project.del.push(id); sec.project.goals=sec.project.goals.filter(x=>x.id!==id); render(); }

/* ---------- страница задачи ---------- */
function pjTaskHTML(sec,t,st){ const key=window.pjBTab, p=sec.project, R=pjResolve(t,key,window.pjPath), list=R.list; window.pjPath=R.chain.map(b=>b.id);
  if(R.chain.length) return pjPageHTML(sec,t,key,R);
  const tabs=PJ_BTABS.map(([k,n])=>{ const c=pjBlkCount(t.blocks[k]); return `<a class="tab ${key===k?'on':''}" onclick="pjBTabSet('${k}')">${n}${c?` <span class="c">${c}</span>`:''}</a>`; }).join("");
  return `<div class="card sheet">
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:6px">${pjStBadge(sec,t)}
      <span class="muted">с</span><input type="date" class="di" value="${esc(t.start)}" onchange="pjField('${sec.id}','${t.id}','start',this.value)">
      <span class="muted">до</span><input type="date" class="di" value="${esc(t.end)}" onchange="pjField('${sec.id}','${t.id}','end',this.value)">
      <span class="muted">план</span><input type="number" class="di num" min="0" step="0.5" value="${t.hours||''}" placeholder="0" style="width:60px" onchange="pjField('${sec.id}','${t.id}','hours',this.value)"><span class="muted">ч · записано ${fmtMin(pjTaskMin(p,t.id))}</span>
      <span style="margin-left:auto"><span class="ck ${t.note?'d':''}" onclick="pjField('${sec.id}','${t.id}','note',${!t.note})"></span> Конспект есть &nbsp; <span class="ck ${t.prac?'d':''}" onclick="pjField('${sec.id}','${t.id}','prac',${!t.prac})"></span> Практика сделана</span></div>
    <div class="sec"><h3>Подзадачи</h3>${t.subs.map(s=>pjSubHTML(sec,s)).join("")}<div class="addrow" onclick="pjAddSub('${sec.id}','${t.id}')">＋ подзадача</div></div>
    <div class="sec"><div class="tabs" style="margin-bottom:8px">${tabs}</div>
      <div class="pj-blocks" id="pjBlocks" data-s="${sec.id}" data-t="${t.id}" data-k="${key}" data-p="">${pjBlocksInner(list,key)}</div></div>
    <div class="muted" style="font-size:12px;margin-top:10px">Enter - новая строка, «/» в пустой строке - выбор типа блока. Кнопка «＋ Страница» создаёт страницу: назови её и нажми «Открыть ›», внутри пишешь дальше.</div></div>`; }
/* открытая вложенная страница: цепочка «задача › вкладка › страница», название, её блоки */
function pjPageHTML(sec,t,key,R){ const cur=R.chain[R.chain.length-1], tabName=(PJ_BTABS.find(x=>x[0]===key)||["",""])[1], path=R.chain.map(b=>b.id).join(","), n=R.chain.length;
  const nm=b=>esc(b.text||"Без названия");
  const crumbs=[`<a onclick="pjPathGo(0)">${esc(t.name||"Задача")}</a>`,`<a onclick="pjPathGo(0)">${tabName}</a>`]
    .concat(R.chain.map((b,i)=>i<n-1?`<a onclick="pjPathGo(${i+1})">${nm(b)}</a>`:`<span>${nm(b)}</span>`)).join("<i>›</i>");
  const td=pjTodoCount(cur.kids), at=`data-s="${sec.id}" data-t="${t.id}" data-k="${key}" data-p="${path}"`;
  return `<div class="card sheet"><div class="pj-crumbs"><a class="pj-back" onclick="pjPathGo(${n-1})">‹ Назад</a>${crumbs}</div>
    <div class="pj-ptitle" contenteditable="plaintext-only" data-ph="Название страницы" ${at}>${esc(cur.text)}</div>
    ${td.t?`<div class="muted" style="margin:-4px 0 10px">Сделано ${td.d} из ${td.t}</div>`:""}
    <div class="pj-blocks" id="pjBlocks" ${at}>${pjBlocksInner(cur.kids,key)}</div>
    <div class="muted" style="font-size:12px;margin-top:10px">«＋ Страница» создаёт ещё одну страницу внутри этой.</div></div>`; }
function pjBlocksInner(list,key){
  if(!list.length) return `<div class="pj-ghost" onclick="pjAddBlock(null)">Нажми и начни писать</div>`+`<div class="pj-addrow"><span class="pj-add" onclick="pjAddBlock(null)">＋ Блок</span><span class="pj-add" onclick="pjAddBlock(null,'page')">📄 ＋ Страница</span></div>`;
  return list.map(b=>{ const ph={h:"Заголовок",ul:"Пункт списка",todo:"Задача",quote:"Цитата",code:"Код",page:"Страница без названия"}[b.type]||"Пиши текст или нажми «/»";
    const ck=`<span class="pj-ck ${b.done?'on':''}" data-ck="${b.id}"></span>`;
    const mark=b.type==="ul"?'<span class="pj-dot">•</span>':(b.type==="todo"||b.type==="page"?ck:'');
    const strike=(b.type==="todo"||b.type==="page")&&b.done?'strike':'';
    let tail=""; const u=b.type==="page"?null:String(b.text||"").match(/https?:\/\/[^\s)]+/);
    if(u) tail=`<a class="pj-lnk" href="${esc(u[0])}" target="_blank" rel="noopener" title="Открыть ссылку">↗</a>`;
    if(b.type==="page"){ const c=pjTodoCount(b.kids);
      return `<div class="pj-b t-page" data-b="${b.id}">${mark}<span class="pj-pico" data-open="${b.id}" title="Открыть страницу">📄</span><div class="pj-bt ${strike}" contenteditable="plaintext-only" data-ph="${ph}">${esc(b.text)}</div>${c.t?`<span class="muted pj-pc">${c.d}/${c.t}</span>`:""}<a class="pj-po" data-open="${b.id}">Открыть ›</a><span class="del" data-delb="${b.id}" title="Удалить страницу">×</span></div>`; }
    return `<div class="pj-b t-${b.type}" data-b="${b.id}">${mark}<div class="pj-bt ${strike}" contenteditable="plaintext-only" data-ph="${ph}">${esc(b.text)}</div>${tail}</div>`; }).join("")+`<div class="pj-addrow"><span class="pj-add" onclick="pjAddBlock(null)">＋ Блок</span><span class="pj-add" onclick="pjAddBlock(null,'page')">📄 ＋ Страница</span></div>`; }

/* ---------- редактор блоков ---------- */
/* env: список блоков, в котором правим (вкладка или открытая вложенная страница); метка синхронизации одна на вкладку */
function pjBlkEnv(el){ const box=el.closest("#pjBlocks,.pj-ptitle"); if(!box) return null; const sec=pjSec(box.dataset.s); const f=sec&&pjFind(sec.project,box.dataset.t); if(!f) return null;
  const key=box.dataset.k, R=pjResolve(f.task,key,(box.dataset.p||"").split(",").filter(Boolean)); return {sec,task:f.task,key,list:R.list,chain:R.chain,box}; }
function pjBlkStamp(env){ mstamp("pb:"+env.task.id+"."+env.key); save(); }
function pjBlocksRefresh(env,focusId,atEnd){ env.box.innerHTML=pjBlocksInner(env.list,env.key);
  if(focusId){ const el=env.box.querySelector(`[data-b="${focusId}"] .pj-bt`); if(el){ el.focus(); if(atEnd!==false){ const r=document.createRange(); r.selectNodeContents(el); r.collapse(false); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } } } }
function pjAddBlock(afterId,type){ const box=document.getElementById("pjBlocks"); if(!box) return; const env=pjBlkEnv(box.firstElementChild||box); if(!env) return;
  const b={id:uid(),type:type||"p",text:""}; if(b.type==="todo"||b.type==="page") b.done=false; if(b.type==="page") b.kids=[];
  const i=afterId?env.list.findIndex(x=>x.id===afterId):env.list.length-1; env.list.splice(i+1,0,b); pjBlkStamp(env); pjBlocksRefresh(env,b.id); }
document.addEventListener("input",e=>{ const el=e.target; if(el.classList&&el.classList.contains("pj-ed")){ pjRename(el,true); return; }
  if(el.classList&&el.classList.contains("pj-ptitle")){ const env=pjBlkEnv(el), cur=env&&env.chain[env.chain.length-1]; if(!cur) return; cur.text=el.innerText.replace(/\s*\n\s*/g," ").trim(); pjBlkStamp(env); return; }
  if(!el.classList||!el.classList.contains("pj-bt")) return; const env=pjBlkEnv(el); if(!env) return;
  const b=env.list.find(x=>x.id===el.parentNode.dataset.b); if(!b) return; b.text=el.innerText.replace(/\n$/,""); pjBlkStamp(env); });
document.addEventListener("keydown",e=>{ const el=e.target; if(!el.classList) return;
  if(el.classList.contains("pj-ed")&&(e.key==="Enter"||e.key==="Escape")){ e.preventDefault(); el.blur(); return; }
  if(el.classList.contains("pj-ptitle")&&e.key==="Enter"){ e.preventDefault(); const first=document.querySelector("#pjBlocks .pj-bt"); if(first) first.focus(); else pjAddBlock(null); return; }
  if(!el.classList.contains("pj-bt")) return; const env=pjBlkEnv(el); if(!env) return; const id=el.parentNode.dataset.b, i=env.list.findIndex(x=>x.id===id), b=env.list[i]; if(!b) return;
  if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); pjMenuClose();
    if(!el.innerText.trim()&&(b.type==="ul"||b.type==="todo")){ b.type="p"; delete b.done; pjBlkStamp(env); pjBlocksRefresh(env,b.id); return; }
    const nb={id:uid(),type:(b.type==="ul"||b.type==="todo")?b.type:"p",text:""}; if(nb.type==="todo") nb.done=false;
    env.list.splice(i+1,0,nb); pjBlkStamp(env); pjBlocksRefresh(env,nb.id); return; }
  if(e.key==="Backspace"&&!el.innerText.length){ e.preventDefault(); pjMenuClose();
    if(b.type==="page"&&pjBlkCount(b.kids)) return;       // страница с записями от Backspace не пропадает: удаляется крестиком
    if(b.type!=="p"){ b.type="p"; delete b.done; delete b.kids; pjBlkStamp(env); pjBlocksRefresh(env,b.id); return; }
    env.list.splice(i,1); pjBlkStamp(env); pjBlocksRefresh(env,i>0?env.list[i-1].id:null); return; }
  if(e.key==="/"&&!el.innerText.trim()){ e.preventDefault(); pjMenuOpen(el,b.id); return; }
  if(e.key==="Escape") pjMenuClose(); });
document.addEventListener("click",e=>{
  const op=e.target.closest&&e.target.closest("[data-open]"); if(op){ const env=pjBlkEnv(op); if(!env) return; window.pjPath=env.chain.map(b=>b.id).concat(op.dataset.open); render(); window.scrollTo(0,0); return; }
  const db=e.target.closest&&e.target.closest("[data-delb]"); if(db){ const env=pjBlkEnv(db); if(!env) return; const i=env.list.findIndex(x=>x.id===db.dataset.delb), b=env.list[i]; if(!b) return;
    if(pjBlkCount(b.kids)&&!confirm("Удалить страницу «"+(b.text||"без названия")+"» со всем, что внутри?")) return;
    env.list.splice(i,1); pjBlkStamp(env); pjBlocksRefresh(env,null); return; }
  const ck=e.target.closest&&e.target.closest("[data-ck]"); if(ck){ const env=pjBlkEnv(ck); if(!env) return; const b=env.list.find(x=>x.id===ck.dataset.ck); if(!b) return;
    b.done=!b.done; pjBlkStamp(env); if(env.chain.length) render(); else pjBlocksRefresh(env,null); return; }
  const mi=e.target.closest&&e.target.closest(".pj-menu [data-t]"); if(mi){ const m=document.querySelector(".pj-menu"), env=pjBlkEnv(document.querySelector(`#pjBlocks [data-b="${m.dataset.b}"] .pj-bt`)||document.getElementById("pjBlocks")); if(!env) return;
    const b=env.list.find(x=>x.id===m.dataset.b), t=mi.dataset.t;
    if(b){ if(b.type==="page"&&t!=="page"&&pjBlkCount(b.kids)&&!confirm("Внутри страницы есть записи, они пропадут. Сменить тип?")){ pjMenuClose(); return; }
      if(t==="page"){ b.type="page"; b.kids=b.kids||[]; if(b.done===undefined) b.done=false; }
      else { b.type=t; delete b.kids; if(t==="todo"){ if(b.done===undefined) b.done=false; } else delete b.done; }
      pjBlkStamp(env); pjBlocksRefresh(env,b.id); } pjMenuClose(); return; }
  if(!(e.target.closest&&e.target.closest(".pj-menu"))) pjMenuClose(); });
document.addEventListener("focusout",e=>{ const el=e.target; if(el.classList&&el.classList.contains("pj-ed")) pjRename(el); });
function pjMenuOpen(el,bid){ pjMenuClose(); const m=document.createElement("div"); m.className="pj-menu"; m.dataset.b=bid;
  m.innerHTML=PJ_BLK.map(([t,n,g])=>`<div data-t="${t}"><b>${g}</b> ${n}</div>`).join(""); el.parentNode.appendChild(m); }
function pjMenuClose(){ document.querySelectorAll(".pj-menu").forEach(m=>m.remove()); }

/* ---------- перетаскивание карточек канбана между колонками ---------- */
document.addEventListener("dragstart",e=>{ const c=e.target.closest&&e.target.closest(".kcard[data-s]"); if(!c) return; e.dataTransfer.setData("text/plain",c.dataset.s+"|"+c.dataset.id); e.dataTransfer.effectAllowed="move"; });
document.addEventListener("dragover",e=>{ const c=e.target.closest&&e.target.closest(".kcol[data-s]"); if(c){ e.preventDefault(); c.classList.add("over"); } });
document.addEventListener("dragleave",e=>{ const c=e.target.closest&&e.target.closest(".kcol[data-s]"); if(c&&!c.contains(e.relatedTarget)) c.classList.remove("over"); });
document.addEventListener("drop",e=>{ const c=e.target.closest&&e.target.closest(".kcol[data-s]"); if(!c) return; e.preventDefault(); c.classList.remove("over");
  const [s,id]=(e.dataTransfer.getData("text/plain")||"").split("|"); if(s&&id&&s===c.dataset.s) pjSetStatus(s,id,c.dataset.st); });

/* после отрисовки: фокус на только что созданном пункте */
function pjAfterRender(){ const id=window.pjFocus; if(!id) return; window.pjFocus=null;
  const el=document.querySelector(`.pj-ed[data-id="${id}"]`); if(el){ el.focus(); const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } }

Object.assign(window, {
  projectHTML, pjAfterRender, pjSetStatus, pjCycle, pjCheckTask, pjToggleSub, pjCycleType, pjField, pjFold,
  pjAddStage, pjAddTask, pjAddSub, pjDel, pjGo, pjOpenTask, pjBTabSet, pjPathGo, pjResolve, pjAddBlock, pjSec, pjSub, pjSetSubDone, pjSetFilter, pjSearch, pjFoldAll, pjAddTime, pjDelTime, pjTimeField, pjAddGoal, pjGoalField, pjDelGoal, pjEd, pjPlanBody, pjStats, pjTaskMin, pjStBadge, pjSubHTML, pjTaskHTML, PJ_TABS,
});
