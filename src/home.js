/* home.js
   Оболочка и главная по макету mockups/app.html: баннер, шапка, левая колонка (навигация), виджеты.
   Каждый раздел рисуется в колонке #view, шапка и баннер зависят от открытого раздела (renderShell). */

/* шапка страницы - фото (art.js, secBannerStyle); на главной поверх фото лежит девиз */
const mkBanner=(sec,h,motto)=>`<div class="banner" style="height:${h||140}px;${secBannerStyle(sec)}">${motto?`<div class="motto"><div class="big">${motto[0]}</div><div class="script">${motto[1]}</div></div>`:""}</div>`;
/* служебные кнопки всегда на одном месте: справа, в одном порядке, статус синхронизации - последним и фиксированной ширины;
   кнопки направления (acts) стоят левее и от статуса не зависят */
const MK_SYS=`<span class="pill" onclick="exportData()">Сохранить в файл</span><span class="pill" onclick="document.getElementById('imp').click()">Загрузить из файла</span><span class="pill" onclick="openPlan()">План</span><span class="pill" id="syncBtn" onclick="openSyncModal()"><span class="slabel">Всё сохранено</span></span>`;
const mkTools=acts=>`<div class="acts">${acts}</div><div class="sys">${MK_SYS}</div>`;

/* ---------- шапка и баннер ---------- */
function renderShell(){
  const a=data.active, sec=data.sections.find(s=>s.id===a); let banner, logo, title, sub="", acts="", long=false;
  if(a==="overview"){ banner=mkBanner(null,170,["Весь твой год может измениться.","Пусть это будет он."]); logo=IC("home"); title=esc(data.title); }
  else if(a==="inbox"){ banner=mkBanner(null,170); logo=IC("inbox"); title="Входящие"; }
  else if(sec){ banner=mkBanner(sec,170); logo=secIcon(sec);
    /* под названием направления надписей нет; подпись остаётся только у страницы задачи (путь назад) */
    if(sec.kind==="project"){ const f=window.pjTask?pjFind(sec.project,window.pjTask):null;
      if(f){ long=true; title=`<span style="font-size:34px">${pjEd("task",sec.id,f.task.id,f.task.name,"Название задачи")}</span>`;
        sub=`<a style="color:var(--accent);cursor:pointer" onclick="pjGo('${sec.id}','plan')">← План</a> · ${esc(f.stage.name)}`; }
      else { title=pjEd("proj",sec.id,sec.id,sec.name,"Название");
        acts=`<span class="pill" onclick="pjAddTask('${sec.id}')">${IC("plus")}Задача</span><span class="pill" onclick="openNoteModal()">${IC("plus")}Заметка</span><span class="pill" onclick="deleteSection('${sec.id}')">Удалить направление</span>`; } }
    else { title=esc(sec.name); acts=`<span class="pill" onclick="openSectionModal('${sec.id}')">Изменить</span>`; } }
  else { banner=mkBanner(null,170); logo=IC("home"); title=esc(data.title); }
  document.getElementById("mkBanner").innerHTML=banner;
  document.getElementById("mkHead").innerHTML=`<button class="burger" type="button" aria-label="Меню" onclick="mkNavToggle()">${IC("menu")}</button><div class="logo">${logo}</div><div class="ttl"><h1${long?' class="long"':""}>${title}</h1>${sub?`<div class="sub">${sub}</div>`:""}</div><div class="tools">${mkTools(acts)}</div>`;
  document.getElementById("mkLayout").className="layout"+(a==="overview"?" three":"");
  if(typeof updateSyncBtn==="function") updateSyncBtn(); }

/* ---------- левая колонка ---------- */
function renderTabs(){ const on=id=>data.active===id?"on":"", nn=(data.notes||[]).length;
  const dirs=data.sections.map(s=>`<a class="${on(s.id)}" data-sid="${s.id}" onclick="go('${s.id}')">${secIcon(s)}${esc(s.name)}</a>`).join("");
  document.getElementById("mkNav").innerHTML=`<div class="card nav"><a class="${on('overview')}" onclick="go('overview')">${IC("home")}Главная</a><a onclick="openReport2()">${IC("calendar")}Отчёт по неделям</a></div>
  <div class="card nav"><div class="cap">Направления</div><div data-sort="nav">${dirs}</div><a class="plus" onclick="openSectionModal()">${IC("plus")}Новое направление</a></div>
  <div class="card qa"><a onclick="openNoteModal()"><span class="qi">${IC("pencil")}</span>Создать заметку</a><a class="${on('inbox')}" onclick="go('inbox')"><span class="qi">${IC("inbox")}</span>Входящие${nn?" ("+nn+")":""}</a></div>`; }

/* ---------- виджеты главной ---------- */
function hmTasks(){ const r=[]; data.sections.filter(s=>s.kind==="project").forEach(sec=>sec.project.stages.forEach(st=>st.tasks.forEach(t=>r.push({sec:sec,st:st,t:t})))); return r; }
function wDirs(){
  const cards=data.sections.map(s=>{ const p=sectionProgress(s), pct=Math.round((p===null?0:p)*100);
    return `<a class="dir" data-sid="${s.id}" onclick="go('${s.id}')"><div class="img" style="${secCoverStyle(s)}"><span class="cam" onclick="event.stopPropagation();coverPick('${s.id}')" title="Своя картинка">${IC("camera")}</span></div>
      <div class="tt"><b>${esc(s.name)}</b><div class="pg"><div class="bar"><i style="width:${pct}%"></i></div><span>${pct}%</span></div></div></a>`; }).join("");
  return `<section class="card" data-sid="w-dirs"><div class="band">Направления</div><div class="dirs" data-sort="dirs">${cards}<a class="dir newdir" onclick="openSectionModal()"><span class="plusbig">${IC("plus")}</span><span>Добавить новое направление</span></a></div></section>`; }
function wNow(){ const now=hmTasks().filter(x=>x.t.status==="i").sort((a,b)=>(a.t.end||"9")<(b.t.end||"9")?-1:1);
  const more=now.length>5?`<tr><td></td><td class="muted" colspan="3">и ещё ${now.length-5} — все видны в плане каждого направления</td></tr>`:"";
  const rows=now.slice(0,5).map(x=>`<tr><td style="width:34px"><span class="ck" onclick="pjCheckTask('${x.sec.id}','${x.t.id}')"></span></td>
    <td><a class="serif big" onclick="pjOpenTask('${x.sec.id}','${x.t.id}')">${esc(x.t.name||"Без названия")}</a><div class="muted" style="font-size:12px">${esc(x.sec.name)} · ${esc(x.st.name)}</div></td>
    <td><span class="tag st-i">Идёт</span></td><td class="muted">${x.t.end?"до "+fmtDate(x.t.end):""}</td></tr>`).join("")||`<tr><td class="muted">Нет задач со статусом «Идёт»</td></tr>`;
  return `<section class="card now" data-sid="w-now"><div class="cap">Сейчас в работе</div><table>${rows}${more}</table></section>`; }
function wHabits(){ ensureHabits(data);
  return `<section class="card" data-sid="w-habits"><div class="band s">Привычки · эта неделя</div>${habitsTable(mondayOf(todayStr()))}<div class="addrow" onclick="habAdd()">${IC("plus")}Привычка</div></section>`; }
function wTime(){ const ws=mondayOf(todayStr()), ps=data.sections.filter(s=>s.kind==="project");
  const days=[0,1,2,3,4,5,6].map(i=>{ const ds=dateAddDays(ws,i); return ps.reduce((a,s)=>a+s.project.time.filter(x=>x.date===ds).reduce((b,x)=>b+(+x.min||0),0),0); });
  const mx=Math.max(60,...days), wk=days.reduce((a,b)=>a+b,0);
  const bars=days.map((m,i)=>`<div class="${dateAddDays(ws,i)===todayStr()?"hi":""}" style="height:${Math.round(m/mx*100)}%" title="${fmtMin(m)}"><span>${DOW[i]}</span></div>`).join("");
  return `<section class="card" data-sid="w-time"><div class="cap">Время · эта неделя</div><div class="bars" style="margin-bottom:22px">${bars}</div><div class="muted" style="font-size:12px">Всего ${fmtMin(wk)} · <a onclick="openReport2()" style="color:var(--accent);cursor:pointer">отчёт недели →</a></div></section>`; }
function wToday(){ return `<section class="card" data-sid="w-today"><div class="band y">План на сегодня</div>${todayHTML()}</section>`; }
function wSoon(){ const up=hmTasks().filter(x=>x.t.status!=="d"&&x.t.status!=="o"&&x.t.end).sort((a,b)=>a.t.end<b.t.end?-1:1).slice(0,5);
  return `<section class="card" data-sid="w-soon"><div class="band p">Ближайшие сроки</div><table>${up.map(x=>`<tr><td><a onclick="pjOpenTask('${x.sec.id}','${x.t.id}')" style="cursor:pointer">${esc(x.t.name||"Без названия")}</a><div class="muted" style="font-size:11.5px">${esc(x.sec.name)}</div></td><td class="muted" style="text-align:right;white-space:nowrap">${fmtDate(x.t.end)}</td></tr>`).join("")||`<tr><td class="muted">Сроков пока нет</td></tr>`}</table></section>`; }
function wGoals(){ const kn={month:"Месяц",year:"Год"};
  const goals=[]; data.sections.filter(s=>s.kind==="project").forEach(s=>s.project.goals.forEach(g=>goals.push({s:s,g:g})));
  goals.sort((a,b)=>(a.g.kind==="global")-(b.g.kind==="global")); const top=goals.slice(0,3);
  return `<section class="card" data-sid="w-goals"><div class="cap">Цели</div>${top.map(({s,g})=>`<div class="goal"><b><span>${kn[g.kind]||"Цель"}: ${esc(g.title.length>80?g.title.slice(0,78)+"…":g.title)}</span><span>${g.pct}%</span></b><div class="bar"><i style="width:${g.pct}%"></i></div><small class="muted">${esc(s.name)}${g.date?" · до "+fmtDate(g.date):""}</small></div>`).join("")||`<div class="muted">Цели направлений появятся здесь.</div>`}</section>`; }
function wSport(){ const sec=data.sections.find(s=>s.kind==="sport"); if(!sec||!sec.sport) return "";
  const sp=sec.sport, w=(sp.weight||[]).slice().sort((x,y)=>x.date<y.date?-1:1), last=w.length?w[w.length-1]:null;
  const y=new Date(); y.setDate(y.getDate()-1); const yd=ymd(y), d=(sp.days||{})[yd]||{}, nn=spNoNum(sp);
  const rng=a=>a?` <span class="muted">/ ${a[0]}–${a[1]}</span>`:"";
  return `<section class="card" data-sid="w-sport"><div class="cap">Спорт</div><table class="mini">
    <tr><td class="muted">Вес</td><td style="text-align:right"><b>${last?String(last.kg).replace(".",",")+" кг":"—"}</b></td></tr>
    ${nn?"":`<tr><td class="muted">Ккал вчера</td><td style="text-align:right"><b>${d.kcal||"—"}</b>${rng(spRange(sp,"kcal",yd))}</td></tr>
    <tr><td class="muted">Белок вчера</td><td style="text-align:right"><b>${d.protein?d.protein+" г":"—"}</b>${rng(spRange(sp,"protein",yd))}</td></tr>`}</table></section>`; }
function overviewHTML(){
  return `<div class="col">${wDirs()}${wNow()}${wHabits()}</div><div class="col">${wTime()}${wToday()}${wSoon()}${wGoals()}${wSport()}</div>`; }

/* своя картинка карточки направления: пока адрес картинки; фото из набора добавим вместе с папкой src/public/img */
function coverPick(id){ const s=data.sections.find(x=>x.id===id); if(!s) return;
  const v=prompt("Адрес своей картинки (пусто - вернуть рисунок):",s.cover||""); if(v===null) return;
  s.cover=v.trim(); mstamp("cs:"+id); render(); }

/* выезжающее меню на телефоне (≤760px): кнопка меню в шапке, закрытие касанием вне меню или выбором пункта */
function mkNavToggle(){ document.body.classList.toggle("nav-open"); }
function mkNavClose(){ document.body.classList.remove("nav-open"); }
document.addEventListener("click",e=>{ if(!document.body.classList.contains("nav-open")) return;
  if(e.target.closest("#mkNav a")||e.target.id==="mkScrim") mkNavClose(); },true);   // захват: onclick пункта перерисовывает меню раньше
document.addEventListener("keydown",e=>{ if(e.key==="Escape") mkNavClose(); });

Object.assign(window,{ mkNavToggle, mkNavClose, mkBanner, renderShell, renderTabs, hmTasks, overviewHTML, coverPick,
  wDirs, wNow, wHabits, wTime, wToday, wSoon, wGoals, wSport });
