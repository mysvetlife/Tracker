/* home.js
   Оболочка и главная по макету mockups/app.html: баннер, шапка, левая колонка (навигация), виджеты.
   Каждый раздел рисуется в колонке #view, шапка и баннер зависят от открытого раздела (renderShell). */

const mkBanner=(a,b,h)=>`<div class="banner" style="height:${h||120}px"><div class="b1"></div><div class="b2"><div class="big" style="font-size:${h>140?27:24}px">${a}</div><div class="script" style="font-size:${h>140?25:20}px">${b}</div></div><div class="b3"></div></div>`;
const MK_TOOLS=`<span class="pill" id="syncBtn" onclick="openSyncModal()"><span class="slabel">Всё сохранено</span></span><span class="pill" onclick="exportData()">Сохранить в файл</span><span class="pill" onclick="document.getElementById('imp').click()">Загрузить из файла</span><span class="pill" onclick="openPlan()">План</span>`;

/* ---------- шапка и баннер ---------- */
function renderShell(){
  const a=data.active, sec=data.sections.find(s=>s.id===a); let banner, logo, title, sub, tools=MK_TOOLS;
  if(a==="overview"){ banner=mkBanner("Весь твой год может измениться.","Пусть это будет он.",170); logo="🏠"; title=esc(data.title); sub="Будь внимательной. Будь последовательной. Будь собой."; }
  else if(a==="inbox"){ banner=mkBanner("Входящие","быстрые записи"); logo="✎"; title="Входящие"; sub="Записать мысль сейчас, переложить в направление потом"; }
  else if(sec){ banner=mkBanner(esc(sec.name),sec.kind==="sport"?"сильнее каждый день":"шаг за шагом"); logo=secEmoji(sec);
    if(sec.kind==="project"){ const f=window.pjTask?pjFind(sec.project,window.pjTask):null;
      if(f){ title=`<span style="font-size:34px">${pjEd("task",sec.id,f.task.id,f.task.name,"Название задачи")}</span>`;
        sub=`<a style="color:var(--accent);cursor:pointer" onclick="pjGo('${sec.id}','plan')">← План</a> · ${esc(f.stage.name)}`; tools=""; }
      else { title=pjEd("proj",sec.id,sec.id,sec.name,"Название"); sub=pjEd("goal",sec.id,sec.id,sec.goal||"","Цель направления");
        tools=`<span class="pill" onclick="pjAddTask('${sec.id}')">＋ Задача</span><span class="pill" onclick="openNoteModal()">＋ Заметка</span>`+tools; } }
    else { title=esc(sec.name); sub=esc(sec.sub||""); tools=`<span class="pill" onclick="openSectionModal('${sec.id}')">Изменить</span>`+tools; } }
  else { banner=mkBanner("Мой прогресс","",120); logo="🏠"; title=esc(data.title); sub=""; }
  document.getElementById("mkBanner").innerHTML=banner;
  document.getElementById("mkHead").innerHTML=`<div class="logo">${logo}</div><div><h1>${title}</h1><div class="sub">${sub}</div></div><div class="tools">${tools}</div>`;
  document.getElementById("mkLayout").className="layout"+(a==="overview"?" three":"");
  if(typeof updateSyncBtn==="function") updateSyncBtn(); }

/* ---------- левая колонка ---------- */
function renderTabs(){ const on=id=>data.active===id?"on":"", nn=(data.notes||[]).length;
  const dirs=data.sections.map(s=>`<a class="${on(s.id)}" onclick="go('${s.id}')">${secEmoji(s)} ${esc(s.name)}</a>`).join("");
  document.getElementById("mkNav").innerHTML=`<div class="card nav"><a class="${on('overview')}" onclick="go('overview')">🏡 Главная</a><a onclick="openReport2()">📅 Отчёт по неделям</a></div>
  <div class="card nav"><div class="cap">Направления</div><div>${dirs}</div><a class="plus" onclick="openSectionModal()">＋ Новое направление</a></div>
  <div class="card qa"><a onclick="openNoteModal()"><span class="qi">✎</span>Создать заметку</a><a class="${on('inbox')}" onclick="go('inbox')"><span class="qi">▤</span>Входящие${nn?" ("+nn+")":""}</a></div>`; }

/* ---------- виджеты главной ---------- */
function hmTasks(){ const r=[]; data.sections.filter(s=>s.kind==="project").forEach(sec=>sec.project.stages.forEach(st=>st.tasks.forEach(t=>r.push({sec:sec,st:st,t:t})))); return r; }
function wDirs(){
  const cards=data.sections.map(s=>{ const p=sectionProgress(s), pct=Math.round((p===null?0:p)*100);
    return `<a class="dir" data-sid="${s.id}" onclick="go('${s.id}')"><div class="img" style="${secCoverStyle(s)}"><span class="cam" onclick="event.stopPropagation();coverPick('${s.id}')" title="Своя картинка">📷</span></div>
      <div class="tt"><b>${esc(s.name)}</b><div class="pg"><div class="bar"><i style="width:${pct}%"></i></div><span>${pct}%</span></div></div></a>`; }).join("");
  return `<section class="card" data-sid="w-dirs"><div class="band">Направления</div><div class="dirs">${cards}<a class="dir newdir" onclick="openSectionModal()"><span class="plusbig">＋</span><span>Добавить новое направление</span></a></div></section>`; }
function wNow(){ const now=hmTasks().filter(x=>x.t.status==="i").sort((a,b)=>(a.t.end||"9")<(b.t.end||"9")?-1:1);
  const more=now.length>5?`<tr><td></td><td class="muted" colspan="3">и ещё ${now.length-5} — все видны в плане каждого направления</td></tr>`:"";
  const rows=now.slice(0,5).map(x=>`<tr><td style="width:34px"><span class="ck" onclick="pjCheckTask('${x.sec.id}','${x.t.id}')"></span></td>
    <td><a class="serif big" onclick="pjOpenTask('${x.sec.id}','${x.t.id}')">${esc(x.t.name||"Без названия")}</a><div class="muted" style="font-size:12px">${esc(x.sec.name)} · ${esc(x.st.name)}</div></td>
    <td><span class="tag st-i">Идёт</span></td><td class="muted">${x.t.end?"до "+fmtDate(x.t.end):""}</td></tr>`).join("")||`<tr><td class="muted">Нет задач со статусом «Идёт»</td></tr>`;
  return `<section class="card now" data-sid="w-now"><div class="cap">Сейчас в работе</div><table>${rows}${more}</table></section>`; }
function wHabits(){ ensureHabits(data);
  return `<section class="card" data-sid="w-habits"><div class="band s">Привычки · эта неделя</div>${habitsTable(mondayOf(todayStr()))}<div class="addrow" onclick="habAdd()">＋ Привычка</div></section>`; }
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
  const y=new Date(); y.setDate(y.getDate()-1); const d=(sp.days||{})[ymd(y)]||{}, g=(sp.config&&sp.config.goals)||{};
  const rng=a=>a?` <span class="muted">/ ${a[0]}–${a[1]}</span>`:"";
  return `<section class="card" data-sid="w-sport"><div class="cap">Спорт</div><table class="mini">
    <tr><td class="muted">Вес</td><td style="text-align:right"><b>${last?String(last.kg).replace(".",",")+" кг":"—"}</b></td></tr>
    <tr><td class="muted">Ккал вчера</td><td style="text-align:right"><b>${d.kcal||"—"}</b>${rng(g.kcal)}</td></tr>
    <tr><td class="muted">Белок вчера</td><td style="text-align:right"><b>${d.protein?d.protein+" г":"—"}</b>${rng(g.protein)}</td></tr></table></section>`; }
function overviewHTML(){
  return `<div class="col">${wDirs()}${wNow()}${wHabits()}</div><div class="col">${wTime()}${wToday()}${wSoon()}${wGoals()}${wSport()}</div>`; }

/* своя картинка карточки направления: пока адрес картинки; фото из набора добавим вместе с папкой src/public/img */
function coverPick(id){ const s=data.sections.find(x=>x.id===id); if(!s) return;
  const v=prompt("Адрес своей картинки (пусто - вернуть рисунок):",s.cover||""); if(v===null) return;
  s.cover=v.trim(); mstamp("cs:"+id); render(); }

Object.assign(window,{ mkBanner, renderShell, renderTabs, hmTasks, overviewHTML, coverPick,
  wDirs, wNow, wHabits, wTime, wToday, wSoon, wGoals, wSport });
