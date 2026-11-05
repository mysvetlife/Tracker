/* project-model.js
   Раздел kind:"project": направление с планом обучения (этапы -> задачи -> подзадачи),
   страницей задачи (разделы Теория, Практика, Заметки, Вопросы, Ссылки), записями времени
   и целями. Раздел лежит в data.sections рядом со старыми и их не трогает.

   sec = { id, name, kind:"project", icon, color, sub, cover, goal,
           project:{ stages:[{id,name,tasks:[task]}], goals:[], time:[], del:[], exp:{} } }
   task = { id, name, status:"n|i|d|o", start, end, hours, doneOn, note, prac,
            subs:[{id,name,done,type}], blocks:{theory,practice,notes,questions,links} }
   блок страницы задачи: {id, type:"p|h|ul|todo|quote|code|page", text, done?, kids?}
   type:"page" - вложенная страница: text - название, kids - её блоки (те же типы, страницы вкладываются дальше),
   done - галочка страницы. Всё вложенное лежит в списке своей вкладки и синхронизируется меткой pb: этой вкладки.
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
function ensureProject(p){ p=p||{}; p.stages=p.stages||[]; p.goals=p.goals||[]; p.time=p.time||[]; p.del=p.del||[]; p.exp=p.exp||{}; p.moods=p.moods||[];
  p.stages.forEach(st=>{ st.id=st.id||uid(); st.name=st.name||""; st.tasks=st.tasks||[]; st.tasks.forEach(ensureTask); });
  p.goals.forEach(g=>{ g.id=g.id||uid(); g.kind=g.kind||"global"; g.title=g.title||""; g.date=g.date||""; g.pct=+g.pct||0; });
  p.time.forEach(x=>{ x.id=x.id||uid(); x.task=x.task||""; x.date=x.date||""; x.min=+x.min||0; x.what=x.what||""; x.src=x.src||""; });
  return p; }

/* ---- «Понедельник»: старый раздел kind:"course" -> kind:"project", без потерь ----
   Урок = задача, пункт программы = подзадача (тип пункта сохранён). Номера детерминированные
   (co-l<урок>, co-l<урок>s<пункт>): два устройства, переведшие раздел независимо, получают одни и те же id,
   и слияние их объединяет, а не дублирует. Отметки done, минуты (timeLog, tlog) и настроения (moods)
   переносятся; метки co:<ключ> копируются в ps:<id>. Полная копия старого раздела лежит в project.legacy. */
function pjHash(str){ let h=5381; for(let i=0;i<str.length;i++) h=((h<<5)+h+str.charCodeAt(i))|0; return (h>>>0).toString(36); }
function pjCourseStages(){ let cur={name:"Введение",items:[]}; const out=[cur]; let mod=0;
  COURSE.forEach((l,li)=>{ cur.items.push(li);
    if(li===1||/^Обратная связь по модулю/.test(l.t)){ mod++; cur={name:"Модуль "+mod,items:[]}; out.push(cur); } });
  if(!cur.items.length) out.pop(); else if(cur.items.length===1&&/^Заключение/.test(COURSE[cur.items[0]].t)) cur.name="Заключение";
  out.forEach((st,i)=>{ st.id="co-m"+i; }); return out; }
function courseToProject(sec,M){ M=M||{}; const c=JSON.parse(JSON.stringify(sec.course||{})), done=c.done||{};
  const stages=pjCourseStages().map(st=>({id:st.id,name:st.name,tasks:st.items.map(li=>{ const l=COURSE[li];
    const subs=l.s.map((x,si)=>{ const k="l"+li+"s"+si, id="co-l"+li+"s"+si; if(M["co:"+k]) M["ps:"+id]=Math.max(M["ps:"+id]||0,M["co:"+k]);
      return {id:id,name:x[1],type:x[0],done:!!done[k]}; });
    const dn=subs.filter(x=>x.done).length;
    return {id:"co-l"+li,name:l.t,status:dn===subs.length?"d":(dn?"i":"n"),subs:subs}; })}));
  const time=[], seen={};
  (c.timeLog||[]).forEach(t=>{ const base="tl-"+pjHash((t.d||"")+"|"+(t.m||0)+"|"+(t.note||"")); seen[base]=(seen[base]||0)+1;
    time.push({id:seen[base]>1?base+"-"+seen[base]:base,task:"",date:t.d||"",min:t.m||0,what:t.note||"",src:""}); });
  Object.keys(c.tlog||{}).forEach(k=>{ const ds=k.split("|")[1]||""; if(c.tlog[k]) time.push({id:"tlg-"+pjHash(k),task:"",date:ds,min:c.tlog[k],what:"",src:"минуты по дням"});
    if(M["tl:"+k]) M["pt:tlg-"+pjHash(k)]=M["tl:"+k]; });
  const exp={}; Object.keys(c.exp||{}).forEach(li=>{ if(c.exp[li]) exp["co-l"+li]=1; });
  const out=Object.assign({},sec,{kind:"project",legacyKey:"course",cover:sec.cover||"",goal:sec.goal||sec.sub||"",
    project:ensureProject({stages:stages,time:time,moods:c.moods||[],exp:exp,legacy:{course:c}})});
  delete out.course; return out; }
function newProjectSection(o){ o=o||{};
  return { id:o.id||uid(), name:o.name||"Новое направление", kind:"project", color:o.color||"var(--a-blue)", icon:o.icon||"star",
    sub:o.sub||"", cover:o.cover||"", goal:o.goal||"", project:ensureProject(o.project) }; }
/* «Психология нарциссов»: заготовка из трёх разделов без выдуманных шагов (подробный план Света даст позже).
   Номера фиксированные: два устройства, создавшие заготовку независимо, при слиянии не дублируют её.
   Один раз: если раздел удалён (тумбстон в data.secDeleted), заново он не появляется. */
const NARC_ID="pj-narc";
function narcSeed(){ return newProjectSection({id:NARC_ID,name:"Психология нарциссов",sub:"Блог и книга",goal:"Цель: блог и книга",color:"var(--a-violet)",icon:"book",
  project:{stages:[{id:"pj-narc-blog",name:"Блог",tasks:[]},{id:"pj-narc-ideas",name:"Идеи и темы",tasks:[]},{id:"pj-narc-book",name:"Книга",tasks:[]}],
    goals:[{id:"pg-narc",kind:"global",title:"Блог и книга",date:"",pct:0}]}}); }
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
/* записи страницы задачи считаются вместе со вложенными страницами (блок type:"page" хранит свои блоки в kids) */
function pjBlkCount(list){ return (list||[]).reduce((a,b)=>a+(b&&String(b.text||"").trim()?1:0)+(b?pjBlkCount(b.kids):0),0); }
/* галочки внутри страницы: чек-листы и страницы (у страницы всегда есть галочка), в том числе вложенные */
function pjTodoCount(list){ let d=0,t=0; (list||[]).forEach(b=>{ if(!b) return;
  if(b.type==="todo"||b.type==="page"){ t++; if(b.done) d++; }
  const c=pjTodoCount(b.kids); d+=c.d; t+=c.t; }); return {d:d,t:t}; }
function projectScore(p){ if(!p) return 0; let n=0;
  pjTasks(p).forEach(t=>{ if(t.status==="d") n++; n+=t.subs.filter(s=>s.done).length;
    PJ_BLOCK_KEYS.forEach(k=>{ n+=pjBlkCount(t.blocks[k]); }); });
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
  a.moods=mergeArr(a.moods,bb.moods,x=>x.ts);
  a.exp=Object.assign({},bb.exp,a.exp);
  const sp="cs:"+b.id; if((bM[sp]||0)>(aM[sp]||0)){ ["name","sub","color","icon","cover","goal"].forEach(f=>{ m[f]=b[f]; }); }
  else ["cover","goal"].forEach(f=>{ if(!m[f]&&b[f]) m[f]=b[f]; });
  mKeepUnknown(a,bb); m.project=ensureProject(a); }

Object.assign(window, {
  PJ_BLOCK_KEYS, PJ_RANK, pjBlkCount, pjTodoCount, ensureTask, ensureProject, newProjectSection, pjTasks, pjFind, pjProgress,
  projectScore, mergeProject, pjWeekMin, courseToProject, pjCourseStages, NARC_ID, narcSeed, pjHash,
});
