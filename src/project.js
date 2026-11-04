/* project.js
   Вид раздела kind:"project": План, Канбан и страница задачи (Теория, Практика,
   Заметки, Вопросы, Ссылки). Данные и метки синхронизации описаны в project-model.js.
   Правки идут через mstamp(метка) и save(); перерисовка нужна только при смене состава. */

window.pjTab="plan"; window.pjTask=null; window.pjBTab="theory"; window.pjFocus=null;
const PJ_ST={n:"Не начато",i:"Идёт",d:"Готово",o:"Необязательно"}, PJ_ORDER=["n","i","d","o"];
const PJ_TYPE={"":"•",v:"▶",a:"≡",r:"✎",q:"?"}, PJ_TYPE_NEXT={"":"v",v:"a",a:"r",r:"q",q:""};
const PJ_TYPE_NAME={"":"без типа",v:"видео",a:"текст",r:"практика",q:"тест"};
const PJ_BTABS=[["theory","Теория"],["practice","Практика"],["notes","Заметки"],["questions","Вопросы"],["links","Ссылки"]];
const PJ_BLK=[["p","Текст","¶"],["h","Заголовок","H"],["ul","Список","•"],["todo","Чек-лист","☑"],["quote","Цитата","❝"],["code","Код","</>"]];

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
function pjToggleSub(secId,subId){ const sec=pjSec(secId); const f=sec&&pjSub(sec.project,subId); if(!f) return; const s=f.sub,t=f.task;
  s.done=!s.done; mstamp("ps:"+s.id);
  if(t.subs.every(x=>x.done)&&t.status!=="d"&&t.status!=="o"){ t.status="d"; t.doneOn=todayStr(); pjTouchTask(t); }
  else if(!s.done&&t.status==="d"){ t.status="i"; t.doneOn=""; pjTouchTask(t); }
  render(); }
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
function pjBlockCount(t){ return PJ_BLOCK_KEYS.reduce((a,k)=>a+(t.blocks[k]||[]).filter(b=>String(b.text||"").trim()).length,0); }

/* ---------- переименование на месте ---------- */
function pjRename(el,live){ if(!el.isConnected) return; const sec=pjSec(el.dataset.s); if(!sec) return; const p=sec.project, id=el.dataset.id, k=el.dataset.k;
  const v=el.innerText.replace(/\s*\n\s*/g," ").trim(); if(!live) el.textContent=v;      // при наборе текст не трогаем, чтобы не сбить курсор
  if(k==="proj"){ if(!v){ if(!live) el.textContent=sec.name; return; } if(sec.name===v) return; sec.name=v; mstamp("cs:"+sec.id); save(); renderTabs(); return; }
  if(k==="goal"){ if(sec.goal===v) return; sec.goal=v; mstamp("cs:"+sec.id); save(); return; }
  if(k==="stage"){ const st=p.stages.find(x=>x.id===id); if(st&&st.name!==v){ st.name=v; mstamp("pj:"+id); save(); } return; }
  if(k==="task"){ const f=pjFind(p,id); if(f&&f.task.name!==v){ f.task.name=v; pjTouchTask(f.task); save(); } return; }
  if(k==="sub"){ const f=pjSub(p,id); if(f&&f.sub.name!==v){ f.sub.name=v; mstamp("pj:"+id); save(); } } }

/* ---------- открытие страницы задачи ---------- */
function pjGo(secId,tab){ data.active=secId; window.pjTab=tab||window.pjTab; window.pjTask=null; render(); }
function pjOpenTask(secId,taskId){ data.active=secId; window.pjTask=taskId; window.pjBTab="theory"; render(); window.scrollTo(0,0); }
function pjBTabSet(k){ window.pjBTab=k; render(); }

/* ---------- отрисовка ---------- */
function projectHTML(sec){ const p=sec.project;
  if(window.pjTask){ const f=pjFind(p,window.pjTask); if(f) return pjTaskHTML(sec,f.task,f.stage); window.pjTask=null; }
  const pr=pjProgress(p), pct=Math.round(pr.pct*100), going=pjTasks(p).filter(t=>t.status==="i").length;
  const next=pjTasks(p).filter(t=>t.status!=="d"&&t.status!=="o"&&t.end).sort((a,b)=>a.end<b.end?-1:1)[0];
  const head=`<div class="card pj-head" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head"><div class="sec-ico">${svg(sec.icon||'star')}</div>
      <div style="flex:1;min-width:0"><h2 class="sec-title">${pjEd("proj",sec.id,sec.id,sec.name,"Название")}</h2><p class="sec-sub">${pjEd("goal",sec.id,sec.id,sec.goal||"","Цель направления")}</p></div>
      <div class="sec-tools"><button class="iconbtn" aria-label="Редактировать" onclick="openSectionModal('${sec.id}')">${svg('pencil')}</button><button class="iconbtn danger" aria-label="Удалить" onclick="deleteSection('${sec.id}')">${svg('trash')}</button></div></div>
    <div class="pj-stats"><div class="stat"><div class="n">${pr.done}<small style="font-size:14px;color:var(--muted-2)"> из ${pr.total}</small></div><div class="l">сделано</div></div>
      <div class="stat"><div class="n b">${going}</div><div class="l">идёт</div></div>
      <div class="stat"><div class="n">${next?pjDate(next.end):"—"}</div><div class="l">ближайший срок</div></div></div>
    <div class="prog" style="margin-top:12px"><div class="prog-top"><span class="lab">Прогресс направления</span><span class="pct">${pct}%</span></div><div class="track"><i style="width:${pct}%"></i></div></div>
    <div class="pj-tabs"><button class="${pjTab==='plan'?'on':''}" onclick="pjGo('${sec.id}','plan')">План</button><button class="${pjTab==='kan'?'on':''}" onclick="pjGo('${sec.id}','kan')">Канбан</button></div></div>`;
  return head+(pjTab==="kan"?pjKanbanHTML(sec):pjPlanHTML(sec));
}
function pjSubHTML(sec,s){ return `<div class="pj-sub"><span class="pj-ck ${s.done?'on':''}" onclick="pjToggleSub('${sec.id}','${s.id}')" role="checkbox" aria-checked="${s.done}"></span>
  <span class="pj-ty" onclick="pjCycleType('${sec.id}','${s.id}')" title="Тип: ${PJ_TYPE_NAME[s.type||'']} (нажми, чтобы сменить)">${PJ_TYPE[s.type||'']}</span>
  ${pjEd("sub",sec.id,s.id,s.name,"Подзадача",s.done?'strike':'')}<span class="pj-x" onclick="pjDel('${sec.id}','sub','${s.id}')" title="Удалить">×</span></div>`; }
function pjStBadge(sec,t){ return `<span class="pj-st st-${t.status}" onclick="pjCycle('${sec.id}','${t.id}')" title="Нажми, чтобы сменить статус">${PJ_ST[t.status]}</span>`; }
function pjPlanHTML(sec){ const p=sec.project;
  if(!p.stages.length) return `<div class="card pj-empty"><div class="serif" style="font-size:24px">Плана пока нет</div><p style="color:var(--muted)">Начни с первого этапа, потом добавь в него задачи и подзадачи.</p><button class="btn primary" onclick="pjAddStage('${sec.id}')">${svg('plus')} Первый этап</button></div>`;
  const stages=p.stages.map(st=>{ const open=pjOpenState(p,st.id,true), dn=st.tasks.filter(t=>t.status==="d").length;
    const rows=open?st.tasks.map(t=>{ const sopen=pjOpenState(p,t.id,false), sd=t.subs.filter(s=>s.done).length;
      return `<div class="pj-task"><div class="pj-row">
        ${t.subs.length?`<span class="pj-chev ${sopen?'open':''}" onclick="pjFold('${sec.id}','${t.id}',false)">›</span>`:'<span class="pj-chev none"></span>'}
        <span class="pj-ck ${pjDone(t)?'on':''}" onclick="pjCheckTask('${sec.id}','${t.id}')" role="checkbox" aria-checked="${pjDone(t)}"></span>
        ${pjEd("task",sec.id,t.id,t.name,"Задача",pjDone(t)?'strike':'')}
        ${t.subs.length?`<span class="pj-cnt">${sd}/${t.subs.length}</span>`:''}
        <span class="pj-sp"></span>${t.end?`<span class="pj-due">до ${pjDate(t.end)}</span>`:''}${pjStBadge(sec,t)}
        <span class="pj-go" onclick="pjOpenTask('${sec.id}','${t.id}')" title="Открыть страницу задачи">↗</span><span class="pj-x" onclick="pjDel('${sec.id}','task','${t.id}')" title="Удалить">×</span></div>
        ${sopen?`<div class="pj-subs">${t.subs.map(s=>pjSubHTML(sec,s)).join("")}<div class="pj-add" onclick="pjAddSub('${sec.id}','${t.id}')">＋ подзадача</div></div>`:''}</div>`; }).join("")+`<div class="pj-add" onclick="pjAddTask('${sec.id}','${st.id}')">＋ задача</div>`:"";
    return `<div class="card pj-stage"><div class="pj-stagehead"><span class="pj-chev ${open?'open':''}" onclick="pjFold('${sec.id}','${st.id}',true)">›</span>
      ${pjEd("stage",sec.id,st.id,st.name,"Название этапа","pj-stname")}<span class="pj-cnt">${dn}/${st.tasks.length}</span><span class="pj-sp"></span><span class="pj-x" onclick="pjDel('${sec.id}','stage','${st.id}')" title="Удалить этап">×</span></div>${rows}</div>`; }).join("");
  return stages+`<div class="pj-add pj-addstage" onclick="pjAddStage('${sec.id}')">＋ этап</div>`;
}
function pjKanbanHTML(sec){ const p=sec.project, all=[];
  p.stages.forEach(st=>st.tasks.forEach(t=>all.push({t,st})));
  const cols=PJ_ORDER.map(k=>{ const items=all.filter(x=>x.t.status===k), open=pjOpenState(p,"col:"+k,true);
    const cards=open?items.map(({t,st})=>{ const kopen=pjOpenState(p,"k:"+t.id,false), sd=t.subs.filter(s=>s.done).length;
      return `<div class="pj-card" draggable="true" data-s="${sec.id}" data-id="${t.id}">
        <div class="pj-cardtop"><a class="pj-cardname" onclick="pjOpenTask('${sec.id}','${t.id}')">${esc(t.name||"Без названия")}</a>${t.subs.length?`<span class="pj-chev ${kopen?'open':''}" onclick="pjFold('${sec.id}','k:${t.id}',false)">›</span>`:''}</div>
        <div class="pj-cardmeta">${esc(st.name)}${t.end?' · до '+pjDate(t.end):''}${t.subs.length?' · '+sd+'/'+t.subs.length:''}</div>
        ${kopen?`<div class="pj-cardsubs">${t.subs.map(s=>`<div class="pj-sub"><span class="pj-ck ${s.done?'on':''}" onclick="pjToggleSub('${sec.id}','${s.id}')"></span><span class="pj-ty">${PJ_TYPE[s.type||'']}</span><span class="${s.done?'strike':''}">${esc(s.name||"Подзадача")}</span></div>`).join("")}</div>`:''}</div>`; }).join("")||'<div class="pj-colempty">Пусто</div>':'';
    return `<div class="pj-col" data-s="${sec.id}" data-st="${k}"><div class="pj-colhead" onclick="pjFold('${sec.id}','col:${k}',true)"><span class="pj-chev ${open?'open':''}">›</span><span class="pj-st st-${k}">${PJ_ST[k]}</span><span class="pj-cnt">${items.length}</span></div>${cards}</div>`; }).join("");
  if(!all.length) return `<div class="card pj-empty"><p style="color:var(--muted)">Задач пока нет. Добавь их на вкладке «План».</p></div>`;
  return `<div class="pj-board">${cols}</div>`;
}

/* ---------- страница задачи ---------- */
function pjTaskHTML(sec,t,st){ const key=window.pjBTab, list=t.blocks[key]||[];
  const tabs=PJ_BTABS.map(([k,n])=>{ const c=(t.blocks[k]||[]).filter(b=>String(b.text||"").trim()).length; return `<button class="${key===k?'on':''}" onclick="pjBTabSet('${k}')">${n}${c?` <span class="c">${c}</span>`:''}</button>`; }).join("");
  const sopts=PJ_ORDER.map(k=>`<option value="${k}" ${t.status===k?'selected':''}>${PJ_ST[k]}</option>`).join("");
  return `<div class="card pj-page" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="pj-crumb"><a onclick="pjGo('${sec.id}')">← ${esc(sec.name)}</a> <span>/ ${esc(st.name)}</span></div>
    <h2 class="sec-title pj-title">${pjEd("task",sec.id,t.id,t.name,"Название задачи")}</h2>
    <div class="pj-props">
      <label>Статус<select onchange="pjSetStatus('${sec.id}','${t.id}',this.value)">${sopts}</select></label>
      <label>С<input type="date" value="${esc(t.start)}" onchange="pjField('${sec.id}','${t.id}','start',this.value)"></label>
      <label>До<input type="date" value="${esc(t.end)}" onchange="pjField('${sec.id}','${t.id}','end',this.value)"></label>
      <label>Часов по плану<input type="number" min="0" step="0.5" value="${t.hours||''}" onchange="pjField('${sec.id}','${t.id}','hours',this.value)"></label>
      <label class="pj-flag"><input type="checkbox" ${t.note?'checked':''} onchange="pjField('${sec.id}','${t.id}','note',this.checked)"> Конспект есть</label>
      <label class="pj-flag"><input type="checkbox" ${t.prac?'checked':''} onchange="pjField('${sec.id}','${t.id}','prac',this.checked)"> Практика сделана</label></div>
    <div class="pj-subs pj-pagesubs"><div class="pj-subcap">Подзадачи</div>${t.subs.map(s=>pjSubHTML(sec,s)).join("")}<div class="pj-add" onclick="pjAddSub('${sec.id}','${t.id}')">＋ подзадача</div></div>
    <div class="pj-btabs">${tabs}</div>
    <div class="pj-blocks" id="pjBlocks" data-s="${sec.id}" data-t="${t.id}" data-k="${key}">${pjBlocksInner(list,key)}</div></div>`; }
function pjBlocksInner(list,key){
  if(!list.length) return `<div class="pj-ghost" onclick="pjAddBlock(null)">Нажми и начни писать · «/» — тип блока</div>`;
  return list.map(b=>{ const ph={h:"Заголовок",ul:"Пункт списка",todo:"Задача",quote:"Цитата",code:"Код"}[b.type]||"Пиши текст или нажми «/»";
    const mark=b.type==="ul"?'<span class="pj-dot">•</span>':(b.type==="todo"?`<span class="pj-ck ${b.done?'on':''}" data-ck="${b.id}"></span>`:'');
    return `<div class="pj-b t-${b.type}" data-b="${b.id}">${mark}<div class="pj-bt ${b.type==='todo'&&b.done?'strike':''}" contenteditable="plaintext-only" data-ph="${ph}">${esc(b.text)}</div></div>`; }).join("")+`<div class="pj-add" onclick="pjAddBlock(null)">＋ блок</div>`; }

/* ---------- редактор блоков ---------- */
function pjBlkEnv(el){ const box=el.closest("#pjBlocks"); if(!box) return null; const sec=pjSec(box.dataset.s); const f=sec&&pjFind(sec.project,box.dataset.t); if(!f) return null;
  const key=box.dataset.k, list=f.task.blocks[key]||(f.task.blocks[key]=[]); return {sec,task:f.task,key,list,box}; }
function pjBlkStamp(env){ mstamp("pb:"+env.task.id+"."+env.key); save(); }
function pjBlocksRefresh(env,focusId,atEnd){ env.box.innerHTML=pjBlocksInner(env.list,env.key);
  if(focusId){ const el=env.box.querySelector(`[data-b="${focusId}"] .pj-bt`); if(el){ el.focus(); if(atEnd!==false){ const r=document.createRange(); r.selectNodeContents(el); r.collapse(false); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } } } }
function pjAddBlock(afterId,type){ const box=document.getElementById("pjBlocks"); if(!box) return; const env=pjBlkEnv(box.firstElementChild||box); if(!env) return;
  const b={id:uid(),type:type||"p",text:""}; if(b.type==="todo") b.done=false;
  const i=afterId?env.list.findIndex(x=>x.id===afterId):env.list.length-1; env.list.splice(i+1,0,b); pjBlkStamp(env); pjBlocksRefresh(env,b.id); }
document.addEventListener("input",e=>{ const el=e.target; if(el.classList&&el.classList.contains("pj-ed")){ pjRename(el,true); return; } if(!el.classList||!el.classList.contains("pj-bt")) return; const env=pjBlkEnv(el); if(!env) return;
  const b=env.list.find(x=>x.id===el.parentNode.dataset.b); if(!b) return; b.text=el.innerText.replace(/\n$/,""); pjBlkStamp(env); });
document.addEventListener("keydown",e=>{ const el=e.target; if(!el.classList) return;
  if(el.classList.contains("pj-ed")&&(e.key==="Enter"||e.key==="Escape")){ e.preventDefault(); el.blur(); return; }
  if(!el.classList.contains("pj-bt")) return; const env=pjBlkEnv(el); if(!env) return; const id=el.parentNode.dataset.b, i=env.list.findIndex(x=>x.id===id), b=env.list[i]; if(!b) return;
  if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); pjMenuClose();
    if(!el.innerText.trim()&&(b.type==="ul"||b.type==="todo")){ b.type="p"; delete b.done; pjBlkStamp(env); pjBlocksRefresh(env,b.id); return; }
    const nb={id:uid(),type:(b.type==="ul"||b.type==="todo")?b.type:"p",text:""}; if(nb.type==="todo") nb.done=false;
    env.list.splice(i+1,0,nb); pjBlkStamp(env); pjBlocksRefresh(env,nb.id); return; }
  if(e.key==="Backspace"&&!el.innerText.length){ e.preventDefault(); pjMenuClose();
    if(b.type!=="p"){ b.type="p"; delete b.done; pjBlkStamp(env); pjBlocksRefresh(env,b.id); return; }
    env.list.splice(i,1); pjBlkStamp(env); pjBlocksRefresh(env,i>0?env.list[i-1].id:null); return; }
  if(e.key==="/"&&!el.innerText.trim()){ e.preventDefault(); pjMenuOpen(el,b.id); return; }
  if(e.key==="Escape") pjMenuClose(); });
document.addEventListener("click",e=>{ const ck=e.target.closest&&e.target.closest("[data-ck]"); if(ck){ const env=pjBlkEnv(ck); if(!env) return; const b=env.list.find(x=>x.id===ck.dataset.ck); if(!b) return;
    b.done=!b.done; pjBlkStamp(env); pjBlocksRefresh(env,null); return; }
  const mi=e.target.closest&&e.target.closest(".pj-menu [data-t]"); if(mi){ const m=document.querySelector(".pj-menu"), env=pjBlkEnv(document.querySelector(`#pjBlocks [data-b="${m.dataset.b}"] .pj-bt`)||document.getElementById("pjBlocks")); if(!env) return;
    const b=env.list.find(x=>x.id===m.dataset.b); if(b){ b.type=mi.dataset.t; if(b.type==="todo"&&b.done===undefined) b.done=false; pjBlkStamp(env); pjBlocksRefresh(env,b.id); } pjMenuClose(); return; }
  if(!(e.target.closest&&e.target.closest(".pj-menu"))) pjMenuClose(); });
document.addEventListener("focusout",e=>{ const el=e.target; if(el.classList&&el.classList.contains("pj-ed")) pjRename(el); });
function pjMenuOpen(el,bid){ pjMenuClose(); const m=document.createElement("div"); m.className="pj-menu"; m.dataset.b=bid;
  m.innerHTML=PJ_BLK.map(([t,n,g])=>`<div data-t="${t}"><b>${g}</b> ${n}</div>`).join(""); el.parentNode.appendChild(m); }
function pjMenuClose(){ document.querySelectorAll(".pj-menu").forEach(m=>m.remove()); }

/* ---------- перетаскивание карточек канбана между колонками ---------- */
document.addEventListener("dragstart",e=>{ const c=e.target.closest&&e.target.closest(".pj-card"); if(!c) return; e.dataTransfer.setData("text/plain",c.dataset.s+"|"+c.dataset.id); e.dataTransfer.effectAllowed="move"; });
document.addEventListener("dragover",e=>{ const c=e.target.closest&&e.target.closest(".pj-col"); if(c){ e.preventDefault(); c.classList.add("over"); } });
document.addEventListener("dragleave",e=>{ const c=e.target.closest&&e.target.closest(".pj-col"); if(c&&!c.contains(e.relatedTarget)) c.classList.remove("over"); });
document.addEventListener("drop",e=>{ const c=e.target.closest&&e.target.closest(".pj-col"); if(!c) return; e.preventDefault(); c.classList.remove("over");
  const [s,id]=(e.dataTransfer.getData("text/plain")||"").split("|"); if(s&&id&&s===c.dataset.s) pjSetStatus(s,id,c.dataset.st); });

/* после отрисовки: фокус на только что созданном пункте */
function pjAfterRender(){ const id=window.pjFocus; if(!id) return; window.pjFocus=null;
  const el=document.querySelector(`.pj-ed[data-id="${id}"]`); if(el){ el.focus(); const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } }

Object.assign(window, {
  projectHTML, pjAfterRender, pjSetStatus, pjCycle, pjCheckTask, pjToggleSub, pjCycleType, pjField, pjFold,
  pjAddStage, pjAddTask, pjAddSub, pjDel, pjGo, pjOpenTask, pjBTabSet, pjAddBlock, pjSec,
});
