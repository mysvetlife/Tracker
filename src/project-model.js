/* project-model.js
   Раздел kind:"project": направление с планом обучения (этапы -> задачи -> подзадачи),
   страницей задачи (разделы Теория, Практика, Заметки, Вопросы, Ссылки), записями времени
   и целями. Раздел лежит в data.sections рядом со старыми и их не трогает.

   sec = { id, name, kind:"project", icon, color, sub, cover, goal,
           project:{ stages:[{id,name,tasks:[task]}], goals:[], time:[], del:[], exp:{} } }
   task = { id, name, status:"n|i|d|o", start, end, hours, doneOn, note, prac,
            subs:[{id,name,done,type}], blocks:{theory,practice,notes,questions,links} }
   type подзадачи: "" | v видео | a текст | r практика | q тест (как в course-program.js).
   exp: {id:1|0} - свёртка: 1 развёрнуто, 0 свёрнуто; нет ключа - по умолчанию (этап развёрнут, задача свёрнута).
        Для колонок канбана и карточек ключи "col:<статус>" и "k:<id задачи>".
   del: id удалённых этапов, задач, подзадач, записей времени и целей (тумбстоны).

   Метки синхронизации (data._m), которые обязан ставить интерфейс через mstamp():
     cs:<секция>       название, подпись, иконка, цвет, картинка, цель раздела
     pj:<id>           этап: название; задача: название, статус, сроки, часы, отметки; подзадача: название и тип
     ps:<id подзадачи> галочка подзадачи
     pb:<id задачи>.<theory|practice|notes|questions|links>  список записей страницы задачи
     pt:<id>           запись времени
     pg:<id>           цель
   Слияние ничего не теряет: без меток объединяет, с метками побеждает более свежая правка. */

const PJ_BLOCK_KEYS=["theory","practice","notes","questions","links"];
const PJ_RANK={n:0,i:1,d:3,o:2};
function ensureTask(t){ t.id=t.id||uid(); t.name=t.name||""; t.status=(t.status in PJ_RANK)?t.status:"n";
  t.start=t.start||""; t.end=t.end||""; t.hours=+t.hours||0; t.doneOn=t.doneOn||""; t.note=!!t.note; t.prac=!!t.prac;
  t.subs=t.subs||[]; t.subs.forEach(s=>{ s.id=s.id||uid(); s.name=s.name||""; s.done=!!s.done; s.type=s.type||""; });
  t.blocks=t.blocks||{}; PJ_BLOCK_KEYS.forEach(k=>{ t.blocks[k]=t.blocks[k]||[]; });
  return t; }
function ensureProject(p){ p=p||{}; p.stages=p.stages||[]; p.goals=p.goals||[]; p.time=p.time||[]; p.del=p.del||[]; p.exp=p.exp||{};
  p.stages.forEach(st=>{ st.id=st.id||uid(); st.name=st.name||""; st.tasks=st.tasks||[]; st.tasks.forEach(ensureTask); });
  p.goals.forEach(g=>{ g.id=g.id||uid(); g.kind=g.kind||"global"; g.title=g.title||""; g.date=g.date||""; g.pct=+g.pct||0; });
  p.time.forEach(x=>{ x.id=x.id||uid(); x.task=x.task||""; x.date=x.date||""; x.min=+x.min||0; x.what=x.what||""; x.src=x.src||""; });
  return p; }
function newProjectSection(o){ o=o||{};
  return { id:o.id||uid(), name:o.name||"Новое направление", kind:"project", color:o.color||"var(--a-blue)", icon:o.icon||"star",
    sub:o.sub||"", cover:o.cover||"", goal:o.goal||"", project:ensureProject(o.project) }; }
function pjTasks(p){ const r=[]; (p.stages||[]).forEach(st=>(st.tasks||[]).forEach(t=>r.push(t))); return r; }
function pjFind(p,id){ for(const st of p.stages){ const t=st.tasks.find(x=>x.id===id); if(t) return {task:t,stage:st}; } return null; }
/* доля сделанного: подзадачи считаются поштучно, задача без подзадач - по статусу; «необязательно» не в счёт */
function pjProgress(p){ let d=0,t=0;
  pjTasks(p).forEach(k=>{ if(k.status==="o") return;
    if(k.subs.length){ t+=k.subs.length; d+=k.status==="d"?k.subs.length:k.subs.filter(s=>s.done).length; }
    else { t++; if(k.status==="d") d++; } });
  return {done:d,total:t,pct:t?d/t:0}; }
/* минуты за неделю по записям времени (понедельник недели mon, строка YYYY-MM-DD) */
function pjWeekMin(p,mon){ const e=new Date(mon+"T00:00:00"); e.setDate(e.getDate()+6); const to=ymd(e);
  return (p.time||[]).filter(x=>x.date>=mon&&x.date<=to).reduce((a,x)=>a+(+x.min||0),0); }
function projectScore(p){ if(!p) return 0; let n=0;
  pjTasks(p).forEach(t=>{ if(t.status==="d") n++; n+=t.subs.filter(s=>s.done).length;
    PJ_BLOCK_KEYS.forEach(k=>{ n+=(t.blocks[k]||[]).filter(b=>b&&String(b.text||"").trim()).length; }); });
  return n+(p.time||[]).length; }

/* ---- слияние ---- */
function pjPick(av,bv,p,aM,bM,tie){ const ta=aM[p]||0, tb=bM[p]||0; if(ta||tb) return (tb>ta)?bv:av; return tie?tie(av,bv):av; }
function pjById(a,b){ a=a||[]; b=b||[]; const seen={},out=[]; a.concat(b).forEach(x=>{ if(x&&!seen[x.id]){ seen[x.id]=1; out.push(x); } }); return out; }
function pjMergeList(a,b,p,aM,bM){ a=a||[]; b=b||[]; const ta=aM[p]||0, tb=bM[p]||0;
  if(ta||tb) return JSON.parse(JSON.stringify((tb>ta)?b:a));
  return JSON.parse(JSON.stringify(pjById(a,b))); }
function pjMergeTask(a,b,aM,bM){ const p="pj:"+a.id, ta=aM[p]||0, tb=bM[p]||0, F=["name","status","start","end","hours","doneOn"];
  let src; if(ta||tb) src=(tb>ta)?b:a; else src=((PJ_RANK[b.status]||0)>(PJ_RANK[a.status]||0))?b:a;
  F.forEach(f=>{ a[f]=src[f]; });
  if(ta||tb){ a.note=src.note; a.prac=src.prac; } else { a.note=!!(a.note||b.note); a.prac=!!(a.prac||b.prac); }
  /* подзадачи: состав - объединение, галочка - по метке ps:<id>, название и тип - по метке pj:<id> */
  const subs=[]; const bs={}; (b.subs||[]).forEach(s=>{ bs[s.id]=s; });
  (a.subs||[]).forEach(s=>{ const o=bs[s.id]; if(o){ const sp="pj:"+s.id, sa=aM["ps:"+s.id]||0, sb=bM["ps:"+s.id]||0;
      s.done=(sa||sb)?((sb>sa)?!!o.done:!!s.done):!!(s.done||o.done);
      const meta=pjPick(s,o,sp,aM,bM); s.name=meta.name; s.type=meta.type; } subs.push(s); });
  (b.subs||[]).forEach(s=>{ if(!(a.subs||[]).some(x=>x.id===s.id)) subs.push(JSON.parse(JSON.stringify(s))); });
  a.subs=subs;
  PJ_BLOCK_KEYS.forEach(k=>{ a.blocks[k]=pjMergeList(a.blocks[k],(b.blocks||{})[k],"pb:"+a.id+"."+k,aM,bM); });
  Object.keys(b.blocks||{}).forEach(k=>{ if(!(k in a.blocks)) a.blocks[k]=JSON.parse(JSON.stringify(b.blocks[k])); });
  mKeepUnknown(a,b); return a; }
function mergeProject(m,b,aM,bM){ const a=ensureProject(m.project), bb=ensureProject(b.project);
  bb.del.forEach(id=>{ if(a.del.indexOf(id)<0) a.del.push(id); });
  const gone=id=>a.del.indexOf(id)>=0;
  /* этапы и задачи: состав - объединение; задача, которой нет у нас, едет в свой этап (или в одноимённый новый) */
  bb.stages.forEach(bs=>{ if(gone(bs.id)) return;
    let ms=a.stages.find(x=>x.id===bs.id);
    if(!ms){ ms={id:bs.id,name:bs.name,tasks:[]}; a.stages.push(ms); }
    else ms.name=pjPick(ms.name,bs.name,"pj:"+bs.id,aM,bM);
    bs.tasks.forEach(bt=>{ if(gone(bt.id)) return;
      const have=pjFind(a,bt.id);
      if(!have) ms.tasks.push(JSON.parse(JSON.stringify(bt)));
      else pjMergeTask(have.task,bt,aM,bM); }); });
  a.stages=a.stages.filter(st=>!gone(st.id));
  a.stages.forEach(st=>{ st.tasks=st.tasks.filter(t=>!gone(t.id)); st.tasks.forEach(t=>{ t.subs=t.subs.filter(s=>!gone(s.id)); }); });
  a.time=pjById(a.time,bb.time).filter(x=>!gone(x.id));
  { const bt={}; bb.time.forEach(x=>{ bt[x.id]=x; }); a.time=a.time.map(x=>bt[x.id]?pjPick(x,bt[x.id],"pt:"+x.id,aM,bM):x); }
  a.goals=pjById(a.goals,bb.goals).filter(x=>!gone(x.id));
  { const bg={}; bb.goals.forEach(x=>{ bg[x.id]=x; }); a.goals=a.goals.map(x=>bg[x.id]?pjPick(x,bg[x.id],"pg:"+x.id,aM,bM):x); }
  a.exp=Object.assign({},bb.exp,a.exp);
  const sp="cs:"+b.id; if((bM[sp]||0)>(aM[sp]||0)){ ["name","sub","color","icon","cover","goal"].forEach(f=>{ m[f]=b[f]; }); }
  else ["cover","goal"].forEach(f=>{ if(!m[f]&&b[f]) m[f]=b[f]; });
  mKeepUnknown(a,bb); m.project=ensureProject(a); }

Object.assign(window, {
  PJ_BLOCK_KEYS, ensureTask, ensureProject, newProjectSection, pjTasks, pjFind, pjProgress,
  projectScore, mergeProject, pjWeekMin,
});
