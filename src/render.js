/* render.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Render ================= */
function render(){ document.getElementById("appTitle").textContent=data.title; renderTabs(); renderView(); save(); }
function renderTabs(){
  let h=`<button class="tab ${data.active==='overview'?'active':''}" onclick="go('overview')">${svg('layers')} Обзор</button>`;
  data.sections.forEach(s=>{ h+=`<button class="tab ${data.active===s.id?'active':''}" onclick="go('${s.id}')"><span class="tdot" style="background:${s.color}"></span>${esc(s.name)}</button>`; });
  h+=`<button class="tab add" onclick="openSectionModal()">${svg('plus')} Раздел</button>`;
  document.getElementById("tabs").innerHTML=h;
}
function renderView(){
  const v=document.getElementById("view");
  if(data.active==="overview"){ v.innerHTML=overviewHTML(); wireNotes(); return; }
  const sec=data.sections.find(s=>s.id===data.active);
  if(!sec){ data.active="overview"; return renderView(); }
  /* Блоки конструктора и явная кнопка «Добавить блок» — в конце каждого раздела */
  if(sec.kind==="course"){ v.innerHTML=courseHTML(sec)+blocksHTML(sec)+addBlockCardHTML(sec); applyCardLayout(sec); return; }
  if(sec.kind==="sport"){ v.innerHTML=sportHTML(sec)+blocksHTML(sec)+addBlockCardHTML(sec); applyCardLayout(sec); wireSport(); return; }
  if(sec.kind==="career"){ v.innerHTML=careerHTML(sec)+blocksHTML(sec)+addBlockCardHTML(sec); applyCardLayout(sec); return; }
  if(sec.kind==="english"){ v.innerHTML=englishHTML(sec)+blocksHTML(sec)+addBlockCardHTML(sec); applyCardLayout(sec); return; }
  if(sec.kind==="custom"){ v.innerHTML=customHTML(sec); applyCardLayout(sec); return; }
  v.innerHTML=sectionHTML(sec); wireNotes();
}

function overviewHTML(){
  if(!data.sections.length) return `<div class="card empty">Пока нет разделов. Нажми «＋ Раздел».</div>`;
  const total=data.sections.reduce((a,s)=>a+sectionTime(s),0);
  let done=0,checks=0;
  data.sections.forEach(s=>{ if(s.kind==="course"){ done+=cDoneSteps(s.course); checks+=cTotalSteps(); }
    else if(s.kind==="custom"){ (s.blocks||[]).forEach(b=>{ if(b.type==="checklist"){ checks+=b.items.length; done+=b.items.filter(it=>b.done[it.id]).length; }
      if(b.type==="program"){ (b.groups||[]).forEach(g=>{ checks+=g.lessons.length; done+=g.lessons.filter(l=>b.done[l.id]).length; }); } }); }
    else if(s.items){ s.items.filter(i=>i.type==="check").forEach(i=>{ checks++; if(i.done) done++; }); } });
  const th=Math.floor(total/60), tm=total%60;
  const cards=data.sections.map(s=>{
    const p=sectionProgress(s), pct=p===null?0:p, t=sectionTime(s);
    const meta=t>0?fmtMin(t):itemsMeta(s);
    return `<div class="ring-card" style="--accent:${s.color}; --accent-soft:${softColor(s.color)}" onclick="go('${s.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')go('${s.id}')">
      <div class="ring-ico">${svg(s.icon||'star')}</div>
      <div class="ring-wrap">${ring(pct,96,9,s.color,true)}</div>
      <div class="ring-name">${esc(s.name)}</div>
      <div class="ring-meta">${meta}</div>
    </div>`;
  }).join("");
  return `<div class="card"><div class="hero">
      <div><div class="hero-label">Всего времени учтено</div>
        <div class="hero-time">${th}<span> ч </span>${tm}<span> мин</span></div></div>
      <div class="hero-legend"><div><b>${done}/${checks}</b> отмечено</div>
        <div><b>${data.sections.length}</b> ${plural(data.sections.length,'раздел','раздела','разделов')}</div></div>
    </div></div>
  <div class="grid">${cards}</div>`;
}

/* ---- generic section ---- */
function sectionHTML(sec){
  const p=sectionProgress(sec), pct=p===null?0:p, t=sectionTime(sec);
  let items=sec.items.map(it=>itemHTML(sec,it)).join("");
  if(!sec.items.length) items=`<div class="item empty">Пунктов пока нет — добавь ниже.</div>`;
  return `<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head">
      <div class="sec-ico">${svg(sec.icon||'star')}</div>
      <div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')}${t>0?' · '+fmtMin(t)+' учтено':''}</p></div>
      <div class="sec-tools">
        <button class="iconbtn" aria-label="Редактировать" onclick="openSectionModal('${sec.id}')">${svg('pencil')}</button>
        <button class="iconbtn danger" aria-label="Удалить" onclick="deleteSection('${sec.id}')">${svg('trash')}</button>
      </div>
    </div>
    <div class="prog"><div class="prog-top"><span class="lab">Прогресс раздела</span><span class="pct">${Math.round(pct*100)}%</span></div>
      <div class="track"><i style="width:${Math.round(pct*100)}%"></i></div></div>
  </div>
  <div style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">${items}</div>
  <div class="card" style="--accent:${sec.color}"><div class="add-item">
    <button class="btn" onclick="addItem('${sec.id}','check')">${svg('check')} Пункт-галочка</button>
    <button class="btn" onclick="addItem('${sec.id}','counter')">${svg('plus')} Счётчик</button>
    <button class="btn" onclick="addItem('${sec.id}','time')">${svg('clock')} Время</button>
  </div></div>`;
}
function itemHTML(sec,it){
  const ren=`<button class="link" onclick="renameItem('${sec.id}','${it.id}')">${svg('pencil')} Переименовать</button>`;
  const del=`<button class="link danger" onclick="deleteItem('${sec.id}','${it.id}')">${svg('trash')} Удалить</button>`;
  if(it.type==="check"){
    return `<div class="item"><div class="item-top">
      <button class="check ${it.done?'on':''}" aria-label="Отметить" onclick="toggleCheck('${sec.id}','${it.id}')">${svg('check')}</button>
      <div class="item-name ${it.done?'done':''}">${esc(it.name)}</div><span class="pill">галочка</span></div>
      <div class="row-actions">${ren}${del}</div></div>`;
  }
  if(it.type==="counter"){
    return `<div class="item"><div class="item-top">
      <div class="item-name">${esc(it.name)}</div><div class="value">${it.value}${it.goal?` <small>/ ${it.goal}</small>`:''}</div></div>
      <div class="chips">
        <button class="chip minus" onclick="bump('${sec.id}','${it.id}',-1)">−1</button>
        <button class="chip accent" onclick="bump('${sec.id}','${it.id}',1)">+1</button>
        <button class="chip accent" onclick="bump('${sec.id}','${it.id}',5)">+5</button>
        <button class="chip accent" onclick="bump('${sec.id}','${it.id}',10)">+10</button></div>
      <div class="row-actions">${ren}<button class="link" onclick="setGoal('${sec.id}','${it.id}')">${svg('target')} Цель: ${it.goal||'—'}</button>${del}</div></div>`;
  }
  return `<div class="item"><div class="item-top">
    <div class="item-name">${esc(it.name)}</div><div class="value">${fmtMin(it.minutes||0)}${it.goal?` <small>/ ${fmtMin(it.goal)}</small>`:''}</div></div>
    <div class="chips">
      <button class="chip accent" onclick="addMin('${sec.id}','${it.id}',5)">+5 мин</button>
      <button class="chip accent" onclick="addMin('${sec.id}','${it.id}',10)">+10 мин</button>
      <button class="chip accent" onclick="addMin('${sec.id}','${it.id}',15)">+15 мин</button>
      <button class="chip accent" onclick="addMin('${sec.id}','${it.id}',30)">+30 мин</button>
      <button class="chip minus" onclick="addMin('${sec.id}','${it.id}',-5)">−5 мин</button></div>
    <textarea class="note-area" data-sid="${sec.id}" data-iid="${it.id}" placeholder="Заметки...">${esc(it.note||'')}</textarea>
    <div class="row-actions">${ren}<button class="link" onclick="setGoalTime('${sec.id}','${it.id}')">${svg('target')} Цель: ${it.goal?fmtMin(it.goal):'—'}</button>${del}</div></div>`;
}
function wireNotes(){
  document.querySelectorAll(".note-area").forEach(t=>{ t.addEventListener("input",()=>{ const it=findItem(t.dataset.sid,t.dataset.iid); if(it){ it.note=t.value; save(); } }); });
}

/* ================= Конструктор (kind: "custom") =================
   Раздел собирается из блоков четырёх типов: habit (ежедневная привычка,
   рисуется общим dailyCardHTML), checklist, dcounter (счётчик по дням),
   program (курс из вставленного текста). Блоки живут в sec.blocks, удаления
   защищены тумбстонами sec.blocksDeleted и b.del — как plan.deleted.
   Прогресс и структура держатся ТОЛЬКО на id (uid): переименование ничего не трогает. */
/* UX-принцип конструктора: никаких скрытых режимов. Кнопка «Добавить блок»
   видна внизу каждого раздела, настройки блока — за карандашом в его шапке,
   пункты чек-листа добавляются прямо в карточке. */
function cbFind(bid){ let r=null; data.sections.forEach(s=>{ if(r||!s.blocks) return;
  const b=s.blocks.find(x=>x.id===bid); if(b) r={sec:s,b:b}; }); return r; }
function cbCardKey(b){ return b.type==="habit"?("dt_"+b.id):("cb_"+b.id); }
function cbDtWrap(b){ const e={}; e[b.id]=b; return e; }
function cbWeekMin(sec,mon){ let n=0; (sec.blocks||[]).forEach(b=>{ if(b.type!=="habit") return;
  for(let i=0;i<7;i++){ const d=(b.days||{})[dateAddDays(mon,i)]; n+=(d&&d.min)||0; } }); return n; }
/* ---- счётчик по дням ---- */
function cbcDay(b,ds){ return (b.days||{})[ds]||0; }
function cbcWeekSum(b,mon){ let n=0; for(let i=0;i<7;i++) n+=cbcDay(b,dateAddDays(mon,i)); return n; }
function cbcFirstMon(b){ const ds=Object.keys(b.days||{}).sort(); return ds.length?mondayOf(ds[0]):mondayOf(todayStr()); }
/* ---- рендер раздела-конструктора ---- */
function customHTML(sec){ ensureCustom(sec);
  const p=sectionProgress(sec), pct=p===null?0:p, t=sectionTime(sec);
  const head=`<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head">
      <div class="sec-ico">${svg(sec.icon||'star')}</div>
      <div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')}${t>0?' · '+fmtMin(t)+' за неделю':''}</p></div>
      <div class="sec-tools">
        <button class="iconbtn" aria-label="Название, цвет и иконка раздела" title="Название, цвет и иконка" onclick="openSectionModal('${sec.id}')">${svg('pencil')}</button>
        <button class="iconbtn danger" aria-label="Удалить раздел" title="Удалить раздел" onclick="deleteSection('${sec.id}')">${svg('trash')}</button>
      </div>
    </div>
    ${p!==null?`<div class="prog"><div class="prog-top"><span class="lab">Прогресс раздела</span><span class="pct">${Math.round(pct*100)}%</span></div>
      <div class="track"><i style="width:${Math.round(pct*100)}%"></i></div></div>`:''}
  </div>`;
  const blocks=blocksHTML(sec);
  const empty=(sec.blocks||[]).length?'':`<div class="card empty">Раздел пока пустой. Нажми «Добавить блок» ниже — там на выбор привычка, чек-лист, счётчик и курс, с пояснениями.</div>`;
  return head+empty+blocks+addBlockCardHTML(sec);
}
function blocksHTML(sec){ return (sec.blocks||[]).map(b=>cbBlockHTML(sec,b)).join(""); }
/* Явная кнопка добавления — видна внизу КАЖДОГО раздела */
function addBlockCardHTML(sec){
  return `<button class="card addblock" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}" onclick="openBlockModal('${sec.id}')">
    <span class="abico" aria-hidden="true">${svg('plus')}</span>
    <span class="abtxt"><b>Добавить блок</b><small>Своя задача, привычка, счётчик или курс — появится в этом разделе</small></span></button>`;
}
function cbBlockHTML(sec,b){
  if(b.type==="habit") return dailyCardHTML(sec,b.id);
  if(b.type==="checklist") return cbChecklistHTML(sec,b);
  if(b.type==="dcounter") return cbCounterHTML(sec,b);
  if(b.type==="program") return cbProgramHTML(sec,b);
  return ""; }
/* Карандаш в шапке блока — настройки: имя, параметры, удаление */
function cbEditBtn(bid){ return `<button class="cpause" aria-label="Настройки блока" title="Настройки блока" onclick="event.stopPropagation();openBlockEdit('${bid}')">${svg('pencil')}</button>`; }
/* ---- чек-лист: пункты добавляются и правятся прямо в карточке ---- */
function cbChecklistHTML(sec,b){
  const t=b.items.length, d=b.items.filter(it=>b.done[it.id]).length, pct=t?d/t:0;
  const rows=b.items.map(it=>{ const on=!!b.done[it.id];
    return `<div class="step ${on?'done':''}" onclick="cbCheck('${b.id}','${it.id}')" role="checkbox" aria-checked="${on}" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();cbCheck('${b.id}','${it.id}')}">
      <span class="tic" style="background:${softColor(sec.color)}; color:${sec.color}">${svg('check')}</span>
      <span class="sname">${esc(it.name)}</span>
      <button class="iconbtn cbi" aria-label="Переименовать «${esc(it.name)}»" title="Переименовать" onclick="event.stopPropagation();cbRenameItem('${b.id}','${it.id}')">${svg('pencil')}</button>
      <button class="iconbtn cbi danger" aria-label="Удалить «${esc(it.name)}»" title="Удалить" onclick="event.stopPropagation();cbDelItem('${b.id}','${it.id}')">${svg('trash')}</button>
      <span class="cbox">${svg('check')}</span></div>`; }).join("");
  const addRow=`<div class="cbadd">
    <input id="cbadd_${b.id}" type="text" placeholder="Новая задача..." aria-label="Название новой задачи в списке «${esc(b.name)}»" onkeydown="if(event.key==='Enter'){event.preventDefault();cbAddItemFrom('${b.id}')}">
    <button class="btn sm" onclick="cbAddItemFrom('${b.id}')">${svg('plus')} Добавить</button></div>`;
  const body=(rows||`<p class="tlhint" style="margin:4px 0 4px">Задач пока нет — впиши первую в поле ниже.</p>`)+addRow;
  return cardWrap(sec,cbCardKey(b),esc(b.name),d+'/'+t+' готово',t?pct:null,sec.color,body,cbEditBtn(b.id));
}
function cbCheck(bid,iid){ const f=cbFind(bid); if(!f) return; const b=f.b;
  if(b.done[iid]) delete b.done[iid]; else b.done[iid]=1; mstamp("cb:"+bid+"."+iid); render(); }
function cbAddItemFrom(bid){ const el=document.getElementById("cbadd_"+bid); const v=el?el.value.trim():"";
  if(!v){ if(el) el.focus(); return; }
  const f=cbFind(bid); if(!f) return; f.b.items.push({id:uid(),name:v}); mstamp("cb:"+bid+"~cfg"); render(); toast("Задача добавлена");
  setTimeout(()=>{ const e2=document.getElementById("cbadd_"+bid); if(e2) e2.focus(); },30); }
function cbRenameItem(bid,iid){ const f=cbFind(bid); if(!f) return; const it=f.b.items.find(x=>x.id===iid); if(!it) return;
  const v=prompt("Название пункта:",it.name); if(v===null||!v.trim()) return; it.name=v.trim(); mstamp("cb:"+bid+"~cfg"); render(); }
function cbDelItem(bid,iid){ const f=cbFind(bid); if(!f) return; if(!confirm("Удалить этот пункт?")) return; const b=f.b;
  if(b.del.indexOf(iid)<0) b.del.push(iid); b.items=b.items.filter(x=>x.id!==iid); delete b.done[iid];
  mstamp("cb:"+bid+"~cfg"); render(); }
/* ---- счётчик по дням ---- */
function cbCounterHTML(sec,b){
  const ds=todayStr(), today=cbcDay(b,ds), mon=mondayOf(ds), wk=cbcWeekSum(b,mon);
  let hist="", m=mon, guard=0; const first=cbcFirstMon(b);
  while(m>=first&&guard<12){ const s=cbcWeekSum(b,m);
    hist+=`<div class="wkrow"><span class="wkr">${ruDate(m)} — ${ruDate(dateAddDays(m,6))}${m===mon?' · текущая':''}</span><span class="wkn">${s}${b.goal?'/'+b.goal:''} ${esc(b.unit)}</span></div>`;
    m=dateAddDays(m,-7); guard++; }
  const body=`
    <div class="stats">
      <div class="stat"><div class="n" style="color:${sec.color}">${today}</div><div class="l">сегодня, ${esc(b.unit)}</div></div>
      <div class="stat"><div class="n g">${wk}${b.goal?' / '+b.goal:''}</div><div class="l">за неделю</div></div>
    </div>
    <div class="chips" style="margin-top:12px">
      <button class="chip accent" onclick="cbBump('${b.id}',1)">+1</button>
      <button class="chip accent" onclick="cbBump('${b.id}',5)">+5</button>
      <button class="chip accent" onclick="cbBump('${b.id}',10)">+10</button>
      <button class="chip minus" onclick="cbBump('${b.id}',-1)">−1</button></div>
    ${hist?`<div style="font-size:13px; font-weight:600; margin:16px 0 2px">От недели к неделе</div>${hist}`:''}`;
  const meta=today+' сегодня · '+wk+(b.goal?'/'+b.goal:'')+' за неделю';
  return cardWrap(sec,cbCardKey(b),esc(b.name),meta,b.goal>0?Math.min(wk/b.goal,1):null,sec.color,body,cbEditBtn(b.id));
}
function cbBump(bid,d){ const f=cbFind(bid); if(!f) return; const b=f.b, ds=todayStr();
  const v=Math.max(0,cbcDay(b,ds)+d); if(v) b.days[ds]=v; else delete b.days[ds];
  mstamp("cb:"+bid+"."+ds); render(); }
/* ---- курс из текста ---- */
function cbProgramHTML(sec,b){
  const tot=(b.groups||[]).reduce((a,g)=>a+g.lessons.length,0);
  const done=(b.groups||[]).reduce((a,g)=>a+g.lessons.filter(l=>b.done[l.id]).length,0);
  let html="";
  (b.groups||[]).forEach((g,gi)=>{ const gd=g.lessons.filter(l=>b.done[l.id]).length, gt=g.lessons.length, p2=gt?gd/gt:0, full=gt>0&&gd===gt;
    const open=(g.id in b.exp)?b.exp[g.id]:(gi===0);
    const rows=g.lessons.map(l=>{ const dn=!!b.done[l.id];
      return `<div class="step ${dn?'done':''}" onclick="cbProgToggle('${b.id}','${l.id}')"><span class="tic" style="background:${softColor(sec.color)}; color:${sec.color}">${svg('book')}</span><span class="sname">${esc(l.name)}</span><span class="cbox">${svg('check')}</span></div>`; }).join("");
    html+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="cbProgGroup('${b.id}','${g.id}',${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(p2,38,5,full?'var(--success)':sec.color,false)}</span>
        <span class="ltitle"><span class="tt">${esc(g.name)}</span><span class="mm">${gd} из ${gt} ${plural(gt,'урока','уроков','уроков')}</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(p2*100)}%</span>
      </div>
      <div class="lbody">
        <div class="lbtns"><button class="link" onclick="event.stopPropagation();cbProgMark('${b.id}','${g.id}',true)">${svg('check')} Отметить весь блок</button><button class="link" onclick="event.stopPropagation();cbProgMark('${b.id}','${g.id}',false)">Снять отметки</button></div>
        ${rows}
      </div></div>`; });
  const editRow=`<div class="row-actions" style="margin:0 0 10px"><button class="link" onclick="openProgramModal('${sec.id}','${b.id}')">${svg('pencil')} Изменить список уроков</button></div>`;
  const body=editRow+(html||`<p class="tlhint" style="margin:4px 0 8px">Список уроков пуст — нажми «Изменить список уроков» выше и вставь программу текстом.</p>`);
  return cardWrap(sec,cbCardKey(b),esc(b.name),done+'/'+tot+' пройдено',tot?done/tot:null,sec.color,body,cbEditBtn(b.id));
}
function cbProgToggle(bid,lid){ const f=cbFind(bid); if(!f) return; const b=f.b;
  if(b.done[lid]) delete b.done[lid]; else b.done[lid]=1; mstamp("cb:"+bid+"."+lid); render(); }
function cbProgGroup(bid,gid,cur){ const f=cbFind(bid); if(!f) return; f.b.exp[gid]=!cur; render(); }
function cbProgMark(bid,gid,val){ const f=cbFind(bid); if(!f) return; const b=f.b, g=(b.groups||[]).find(x=>x.id===gid); if(!g) return;
  g.lessons.forEach(l=>{ if(val) b.done[l.id]=1; else delete b.done[l.id]; mstamp("cb:"+bid+"."+l.id); }); render(); }
function cbProgText(b){ return (b.groups||[]).map(g=>"# "+g.name+"\n"+g.lessons.map(l=>l.name).join("\n")).join("\n"); }
/* Разбор текста программы. Урокам и блокам с прежними названиями оставляем прежние id —
   так отметки переживают правку списка. */
function cbParseProgram(txt,old){
  const lines=String(txt||"").split("\n").map(s=>s.trim()).filter(s=>s!=="");
  const oldL={}, oldG={};
  if(old){ (old.groups||[]).forEach(g=>{ if(!(g.name in oldG)) oldG[g.name]=g.id;
    g.lessons.forEach(l=>{ if(!(l.name in oldL)) oldL[l.name]=l.id; }); }); }
  const groups=[]; let cur=null;
  lines.forEach(s=>{ if(s.charAt(0)==="#"){ const nm=s.replace(/^#+\s*/,"")||"Блок";
      const gid=oldG[nm]||uid(); delete oldG[nm]; groups.push(cur={id:gid,name:nm,lessons:[]}); }
    else { if(!cur){ const gid=oldG["Программа"]||uid(); delete oldG["Программа"]; groups.push(cur={id:gid,name:"Программа",lessons:[]}); }
      const lid=oldL[s]||uid(); delete oldL[s]; cur.lessons.push({id:lid,name:s}); } });
  return groups; }
function openProgramModal(sid,bid){ const sec=findSec(sid); if(!sec) return;
  const b=(sec.blocks||[]).find(x=>x.id===bid); if(!b) return;
  window.progTarget={sid:sid,bid:bid};
  document.getElementById("modal").innerHTML=`<h3>Изменить список уроков</h3>
  <p class="mhint">По строке на урок. Строка, начинающаяся с «#», открывает новый блок курса. Отметки сохраняются у уроков, чьи названия не изменились.</p>
  <label for="pgText">Программа курса «${esc(b.name)}»</label>
  <textarea class="note-area" id="pgText" style="min-height:180px" placeholder="# Блок 1&#10;Урок 1&#10;Урок 2">${esc(cbProgText(b))}</textarea>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveProgramModal()">Сохранить</button></div>`;
  showModal(); setTimeout(()=>{ const e=document.getElementById("pgText"); if(e) e.focus(); },50); }
function saveProgramModal(){ if(!progTarget) return; const sec=findSec(progTarget.sid); if(!sec) return;
  const txt=document.getElementById("pgText").value;
  const b=(sec.blocks||[]).find(x=>x.id===progTarget.bid); if(!b) return;
  const oldIds={}; (b.groups||[]).forEach(g=>{ g.lessons.forEach(l=>{ oldIds[l.id]=1; }); });
  b.groups=cbParseProgram(txt,b);
  const kept={}; b.groups.forEach(g=>g.lessons.forEach(l=>{ kept[l.id]=1; }));
  Object.keys(oldIds).forEach(id=>{ if(!kept[id]){ if(b.del.indexOf(id)<0) b.del.push(id); delete b.done[id]; } });
  mstamp("cb:"+b.id+"~cfg"); window.progTarget=null; closeModal(); toast("Курс сохранён"); render(); }
/* ---- «Добавить блок»: модалка с выбором типа и пояснениями ---- */
const BLOCK_TYPES=[
  {t:'checklist',ic:'check',n:'Чек-лист задач',d:'Разовые задачи и этапы: сделала — отметила. Считается в процент раздела.',ex:'«Обновить резюме», «Собрать кейс», «Записаться к врачу»'},
  {t:'habit',ic:'clock',n:'Ежедневная привычка',d:'Галочка на каждый день, заметка и минуты. Считает стрик и показывает неделю.',ex:'«Чтение 10 минут», «Зарядка», «Дневник»'},
  {t:'dcounter',ic:'target',n:'Счётчик',d:'«+1 сегодня» с историей по неделям. Можно задать цель на неделю.',ex:'«Стаканы воды», «Страницы книги», «Отклики»'},
  {t:'program',ic:'book',n:'Курс / программа',d:'Список уроков: вставь программу текстом и отмечай пройденное. Считается в процент раздела.',ex:'«Основы Figma», «Курс по SQL»'}];
function openBlockModal(sid){ const sec=findSec(sid); if(!sec) return; ensureBlocks(sec);
  window.bmTarget=sid; window.bmType=null;
  document.getElementById("modal").innerHTML=`<h3>Новый блок</h3>
  <p class="mhint">Что добавить в раздел «${esc(sec.name)}»? Блок появится внизу раздела; потом его можно переименовать (✎ в шапке блока), приостановить (⏸) или переставить (⠿).</p>
  <div class="btypes" role="group" aria-label="Тип блока">${BLOCK_TYPES.map(x=>`
    <button type="button" class="btype" id="bt_${x.t}" aria-pressed="false" onclick="bmPick('${x.t}')">
      <span class="btico" aria-hidden="true">${svg(x.ic)}</span>
      <span class="bttxt"><b>${x.n}</b><small>${x.d}</small><small class="btex">Например: ${x.ex}</small></span></button>`).join("")}
  </div>
  <div id="bmFields"></div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" id="bmGo" onclick="bmCreate()" disabled style="opacity:.45">Добавить блок</button></div>`;
  showModal(); setTimeout(()=>{ const e=document.getElementById("bt_checklist"); if(e) e.focus(); },50); }
function bmPick(t){ window.bmType=t;
  BLOCK_TYPES.forEach(x=>{ const e=document.getElementById("bt_"+x.t); if(e){ const on=x.t===t;
    e.classList.toggle("sel",on); e.setAttribute("aria-pressed",on?"true":"false"); } });
  const f=document.getElementById("bmFields"); if(!f) return;
  let h=`<label for="bmName">Название</label><input id="bmName" type="text" placeholder="${t==='habit'?'Например, Чтение 10 минут':t==='checklist'?'Например, Дела по дому':t==='dcounter'?'Например, Стаканы воды':'Например, Основы Figma'}">`;
  if(t==="dcounter") h+=`<label for="bmUnit">Единица счёта</label><input id="bmUnit" type="text" value="раз">
    <label for="bmGoal">Цель на неделю (0 — без цели)</label><input id="bmGoal" type="number" inputmode="numeric" min="0" value="0">`;
  if(t==="program") h+=`<label for="bmProg">Программа курса</label>
    <p class="mhint" style="margin:4px 0 8px">По строке на урок. Строка с «#» в начале открывает блок курса. Список можно править и позже.</p>
    <textarea class="note-area" id="bmProg" style="min-height:130px" placeholder="# Блок 1&#10;Урок 1&#10;Урок 2"></textarea>`;
  f.innerHTML=h;
  const go=document.getElementById("bmGo"); if(go){ go.disabled=false; go.style.opacity=""; }
  setTimeout(()=>{ const e=document.getElementById("bmName"); if(e) e.focus(); },30); }
function bmCreate(){ if(!bmTarget||!bmType) return; const sec=findSec(bmTarget); if(!sec) return; ensureBlocks(sec);
  const nameEl=document.getElementById("bmName"); const name=(nameEl?nameEl.value:"").trim();
  if(!name){ alert("Введи название блока"); if(nameEl) nameEl.focus(); return; }
  const b={id:uid(),type:bmType,name:name};
  if(bmType==="habit"){ b.days={}; b.ph="заметка (по желанию)"; }
  if(bmType==="checklist"){ b.items=[]; b.done={}; b.del=[]; }
  if(bmType==="dcounter"){ b.days={}; const uEl=document.getElementById("bmUnit"), gEl=document.getElementById("bmGoal");
    b.unit=((uEl&&uEl.value)||"").trim()||"раз"; const g=parseInt(gEl?gEl.value:"0",10); b.goal=isNaN(g)?0:Math.max(0,g); }
  if(bmType==="program"){ const pEl=document.getElementById("bmProg");
    b.groups=cbParseProgram(pEl?pEl.value:"",null); b.done={}; b.exp={}; b.del=[]; }
  sec.blocks.push(b); mstamp("cb:"+b.id+"~cfg"); evLog("block_new",{block:b.id, kind:b.type, name:b.name, section:sec.kind});
  window.bmTarget=null; window.bmType=null; closeModal(); toast("Блок «"+b.name+"» добавлен"); render(); }
/* ---- настройки блока (карандаш в шапке) ---- */
function openBlockEdit(bid){ const f=cbFind(bid); if(!f) return; const b=f.b;
  const tn={habit:"ежедневная привычка",checklist:"чек-лист задач",dcounter:"счётчик",program:"курс"}[b.type]||"блок";
  let extra="";
  if(b.type==="dcounter") extra=`<label for="beUnit">Единица счёта</label><input id="beUnit" type="text" value="${esc(b.unit)}">
    <label for="beGoal">Цель на неделю (0 — без цели)</label><input id="beGoal" type="number" inputmode="numeric" min="0" value="${b.goal||0}">`;
  if(b.type==="habit") extra=`<label for="bePh">Подсказка в поле заметки</label><input id="bePh" type="text" value="${esc(b.ph||'')}" placeholder="например: что читала">`;
  if(b.type==="program") extra=`<p class="mhint" style="margin:12px 0 0">Список уроков правится кнопкой «Изменить список уроков» в карточке курса.</p>`;
  document.getElementById("modal").innerHTML=`<h3>Настройки блока</h3>
  <p class="mhint">Тип: ${tn}. Переименование не сбрасывает прогресс.</p>
  <label for="beName">Название</label><input id="beName" type="text" value="${esc(b.name)}">
  ${extra}
  <div class="modal-actions">
    <button class="link danger" style="margin-right:auto" onclick="cbDeleteBlock('${f.sec.id}','${b.id}')">${svg('trash')} Удалить блок</button>
    <button class="btn" onclick="closeModal()">Отмена</button>
    <button class="btn primary" onclick="saveBlockEdit('${b.id}')">Сохранить</button></div>`;
  showModal(); setTimeout(()=>{ const e=document.getElementById("beName"); if(e) e.focus(); },50); }
function saveBlockEdit(bid){ const f=cbFind(bid); if(!f) return; const b=f.b;
  const name=(document.getElementById("beName").value||"").trim();
  if(!name){ alert("Название не может быть пустым"); return; }
  b.name=name;
  if(b.type==="dcounter"){ const u=(document.getElementById("beUnit").value||"").trim(); if(u) b.unit=u;
    const g=parseInt(document.getElementById("beGoal").value,10); b.goal=isNaN(g)?0:Math.max(0,g); }
  if(b.type==="habit"){ b.ph=(document.getElementById("bePh").value||"").trim()||"заметка (по желанию)"; }
  mstamp("cb:"+bid+"~cfg"); closeModal(); render(); }
function cbDeleteBlock(sid,bid){ const sec=findSec(sid); if(!sec) return; const b=(sec.blocks||[]).find(x=>x.id===bid); if(!b) return;
  if(!confirm("Удалить блок «"+b.name+"»? Отметки в нём тоже удалятся.")) return;
  if(sec.blocksDeleted.indexOf(bid)<0) sec.blocksDeleted.push(bid); evLog("block_state",{block:bid, state:"deleted", name:b.name, section:sec.kind});
  sec.blocks=sec.blocks.filter(x=>x.id!==bid); closeModal(); toast("Блок удалён"); render(); }

/* ---- course section ---- */
function activeCourse(){ const s=data.sections.find(x=>x.id===data.active); return s&&s.kind==="course"?s:null; }
function courseHTML(sec){
  const c=sec.course;
  const done=cDoneSteps(c), total=cTotalSteps(), pct=total?done/total:0;
  const lessonsDone=COURSE.filter((l,li)=>cLessonDone(c,li)===l.s.length).length;
  const bm=cLastBookmark(c);
  const legendItems=[['video','play','Видео'],['text','textline','Текст'],['practice','practice','Практика'],['test','test','Тест']];
  const legend=legendItems.map(i=>`<span><span class="ic ${i[0]}">${svg(i[1])}</span>${i[2]}</span>`).join("");
  return `<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head" style="margin-bottom:20px">
      <div class="sec-ico">${svg('target')}</div>
      <div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')}</p></div>
      <div class="sec-tools">
        <button class="iconbtn" aria-label="Запланировать занятие" onclick="planTaskForSec('${sec.id}')">${svg('calplus')}</button>
        <button class="iconbtn" aria-label="Редактировать" onclick="openSectionModal('${sec.id}')">${svg('pencil')}</button>
      </div>
    </div>
    <div class="dash">
      <div class="dring">${ring(pct,132,12,'var(--a-violet)',true)}</div>
      <div style="width:100%">
        <div class="stats">
          <div class="stat"><div class="n v">${done}/${total}</div><div class="l">этапов пройдено</div></div>
          <div class="stat"><div class="n g">${lessonsDone}/${COURSE.length}</div><div class="l">уроков завершено</div></div>
          <div class="stat"><div class="n b">${cWeekSteps(c,mondayOf(todayStr()))}</div><div class="l">подтем за неделю</div></div>
        </div>
        ${bm?`<div class="bookmark">${svg('bookmark')}<div>Остановилась на: <b>${esc(bm)}</b></div></div>`:''}
      </div>
    </div>
  </div>

  ${cardWrap(sec,'program','Программа курса',done+'/'+total+' этапов · '+lessonsDone+'/'+COURSE.length+' уроков',pct,'var(--a-violet)',tlogRowHTML('course','co')+
    `<div class="legend">${legend}</div>
    <div class="filterbar">
      <div class="seg">
        <button id="fAll" class="${courseFilter==='all'?'on':''}" onclick="event.stopPropagation();setCFilter('all')">Все</button>
        <button id="fLeft" class="${courseFilter==='left'?'on':''}" onclick="event.stopPropagation();setCFilter('left')">Незавершённые</button>
      </div>
      <input class="search" id="csearch" placeholder="Поиск по этапам..." oninput="renderCourseLessons()" onclick="event.stopPropagation()">
      <button class="btn sm" onclick="event.stopPropagation();toggleAllLessons()">Свернуть / развернуть всё</button>
    </div>
    <div id="lessons"></div>`)}`;
}
function afterCourseRender(){ renderCourseLessons(); }
function renderCourseLessons(){
  const sec=activeCourse(); if(!sec) return; const c=sec.course;
  const q=(document.getElementById("csearch")?document.getElementById("csearch").value:"").trim().toLowerCase();
  let html="";
  COURSE.forEach((l,li)=>{
    const total=l.s.length, done=cLessonDone(c,li), pct=total?done/total:0, full=done===total;
    const vis=l.s.map((st,si)=>({st,si})).filter(x=>{
      if(courseFilter==="left"&&cIsDone(c,li,x.si)) return false;
      if(q&&!x.st[1].toLowerCase().includes(q)) return false;
      return true;
    });
    if((courseFilter==="left"||q)&&vis.length===0) return;
    const open=c.exp[li]||q!=="";
    const steps=vis.map(({st,si})=>{ const tp=TYPE[st[0]]||TYPE.v, d=cIsDone(c,li,si);
      return `<div class="step ${d?'done':''}" onclick="toggleStep(${li},${si})">
        <span class="tic ${tp.cls}">${svg(tp.ic)}</span><span class="sname">${esc(st[1])}</span><span class="cbox">${svg('check')}</span></div>`;
    }).join("");
    html+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="toggleLesson(${li})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(pct,38,5,full?'var(--success)':'var(--a-violet)',false)}</span>
        <span class="ltitle"><span class="tt">${esc(l.t)}</span><span class="mm">${done} из ${total} ${plural(total,'этапа','этапов','этапов')} пройдено</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(pct*100)}%</span>
      </div>
      <div class="lbody">
        <div class="lbtns"><button class="link" onclick="event.stopPropagation();markLesson(${li},true)">${svg('check')} Отметить весь урок</button>
          <button class="link" onclick="event.stopPropagation();markLesson(${li},false)">Снять отметки</button></div>
        ${steps}
      </div></div>`;
  });
  const el=document.getElementById("lessons"); if(el) el.innerHTML=html||`<div class="emptyc">Ничего не найдено.</div>`;
}

/* ---- имена наружу ---- */
Object.assign(window, {
  render, renderTabs, renderView, overviewHTML, sectionHTML, itemHTML,
  wireNotes, cbFind, cbCardKey, cbDtWrap, cbWeekMin, cbcDay,
  cbcWeekSum, cbcFirstMon, customHTML, blocksHTML, addBlockCardHTML, cbBlockHTML,
  cbEditBtn, cbChecklistHTML, cbCheck, cbAddItemFrom, cbRenameItem, cbDelItem,
  cbCounterHTML, cbBump, cbProgramHTML, cbProgToggle, cbProgGroup, cbProgMark,
  cbProgText, cbParseProgram, openProgramModal, saveProgramModal, openBlockModal, bmPick,
  bmCreate, openBlockEdit, saveBlockEdit, cbDeleteBlock, activeCourse, courseHTML,
  afterCourseRender, renderCourseLessons, BLOCK_TYPES,
});
