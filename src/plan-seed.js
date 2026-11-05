/* plan-seed.js
   Готовые направления с планом обучения: Аналитик данных, Английский, Изучение ИИ, UX/UI Design.
   Содержимое планов лежит в src/plans.json и собрано ТОЛЬКО из файлов Светы в её проектах
   (D:\Projects\Личное Personal\Обучение\..., D:\Projects\Аналитик Данных\...); у каждой задачи там есть поле source.
   Здесь ничего про содержание планов не придумывается: код строит разделы из JSON.
   Номера разделов, этапов и задач фиксированные: два устройства, создавшие направление независимо, при слиянии не дублируют его.
   Один раз: если раздел удалён (тумбстон в data.secDeleted), заново он не появляется.
   Старые разделы «Английский» (kind:"english") и «Дизайн и карьера» (kind:"career") заменяются новыми направлениями;
   их данные не теряются: полная копия лежит в project.legacy (как у «Понедельника»). */
import PLANS from "./plans.json";

/* оформление направлений (цвет, значок) и какой старый раздел заменяет направление */
/* ver: версия плана направления. Раздел, заведённый по более старой версии, обновляется один раз (upgradePlan);
   у направлений без ver остаётся версия 1 и их id не меняются. */
const PLAN_META={
  "pj-analyst":{color:"var(--a-blue)",icon:"star",replaces:"",ver:2},
  "pj-english":{color:"var(--a-green)",icon:"lang",replaces:"english"},
  "pj-ai":{color:"var(--a-violet)",icon:"sparkle",replaces:"",ver:2},
  "pj-ux":{color:"var(--a-rose)",icon:"target",replaces:"career"}
};
const PLAN_ST={n:1,i:1,d:1,o:1};
function planSection(dir){ const used={}, ver=(PLAN_META[dir.id]||{}).ver||1, sp=ver>1?"-v"+ver:"";
  const stages=(dir.stages||[]).map((st,si)=>({id:dir.id+sp+"-s"+si,name:st.name,tasks:(st.tasks||[]).map((r,ri)=>{
    let id=dir.id+"-t"+pjHash(st.name+"|"+r.name); if(used[id]){ id+="-"+ri; } used[id]=1;
    const status=PLAN_ST[r.status]?r.status:"n";
    const t=ensureTask({id:id,name:r.name,status:status,start:r.start||"",end:r.end||"",hours:r.hours||0});
    if(status==="d") t.doneOn=r.end||r.start||"";
    t.subs=(r.subs||[]).map((n,i)=>({id:id+"-u"+i,name:n,done:false,type:""}));
    const para=(k,arr)=>{ if(arr.length) t.blocks[k]=arr.map((x,i)=>({id:id+"-"+k.charAt(0)+i,type:"p",text:x})); };
    para("notes",r.note?[r.note]:[]); para("practice",r.out?[r.out]:[]); para("links",r.links||[]);
    para("theory",r.theory?[r.theory]:[]); para("questions",r.questions||[]);
    return t; })}));
  const meta=PLAN_META[dir.id]||{};
  /* в цели из файлов бывают пометки источника «(Файл.md, раздел)», кавычки и приписка «Цель (её слова, дата):»; в шапку идёт первая фраза, полный текст - в «Цели» */
  const full=(dir.goal||"").replace(/\s*\([^()]*\.md[^()]*\)/g,"").replace(/^Цель[^:]{0,40}:\s*/,"").replace(/[«»]/g,"").replace(/^[\s;.]+|[\s;]+$/g,"").trim();
  const m=full.match(/^(.{20,}?[.;])\s/), short=m?m[1].replace(/[.;]$/,""):full;
  const goals=short!==full?[{id:dir.id+"-g0",kind:"global",title:full,date:"",pct:0}]:[];
  const sec=newProjectSection({id:dir.id,name:dir.name,goal:short,color:meta.color,icon:meta.icon,project:{stages:stages,goals:goals}});
  if(meta.ver>1) sec.planVer=meta.ver; return sec; }
/* Раздел заведён по плану старой версии: старые этапы и задачи удаляются, ставится новый план.
   Id старых этапов и задач идут в тумбстоны, чтобы устройство со старым планом не вернуло их при синхронизации.
   Записи времени и настроения не относятся к плану и остаются. */
function upgradePlan(d,old,fresh){ const op=ensureProject(old.project), np=fresh.project, del=op.del.slice();
  op.stages.forEach(st=>{ del.push(st.id); st.tasks.forEach(t=>{ del.push(t.id); t.subs.forEach(s=>{ del.push(s.id); }); }); });
  const live={}; np.stages.forEach(st=>{ live[st.id]=1; st.tasks.forEach(t=>{ live[t.id]=1; t.subs.forEach(s=>{ live[s.id]=1; }); }); });
  np.del=del.filter(id=>!live[id]); np.time=op.time; np.moods=op.moods;
  const i=d.sections.indexOf(old); d.sections[i]=Object.assign({},old,{goal:fresh.goal,project:np,planVer:fresh.planVer}); }
/* Один раз заводит направления из plans.json; старый раздел того же дела (english, career) уходит в project.legacy */
function seedPlans(d){ d.secDeleted=d.secDeleted||[];
  (PLANS.directions||[]).forEach(dir=>{ const have=PLAN_META[dir.id]&&d.sections.find(s=>s.id===dir.id);
    if(have&&have.kind==="project"&&(have.planVer||1)<(PLAN_META[dir.id].ver||1)){ upgradePlan(d,have,planSection(dir)); return; }
    if(!PLAN_META[dir.id]||have||d.secDeleted.indexOf(dir.id)>=0) return;
    const sec=planSection(dir), rep=PLAN_META[dir.id].replaces; let at=d.sections.length;
    if(rep){ const i=d.sections.findIndex(s=>s.kind===rep);
      if(i>=0){ const old=d.sections[i], lg={}; lg[rep]=JSON.parse(JSON.stringify(old[rep]||{}));
        if(old.blocks&&old.blocks.length) lg.blocks=JSON.parse(JSON.stringify(old.blocks));
        sec.project.legacy=lg; sec.legacyKey=rep; at=i;
        d.sections.splice(i,1); if(d.secDeleted.indexOf(old.id)<0) d.secDeleted.push(old.id); } }
    d.sections.splice(at,0,sec); }); }
/* порядок левой панели как в макете; один раз, дальше порядок остаётся как есть */
function orderSections(d){ if(d.navOrder) return; d.navOrder=1;
  const rank=s=>s.id==="pj-analyst"?0:s.id==="pj-english"?1:s.id==="pj-ai"?2:s.id==="pj-ux"?3:s.id===NARC_ID?4:s.kind==="sport"?5:(s.legacyKey==="course"||/понедельн/i.test(s.name))?6:7;
  d.sections=d.sections.map((s,i)=>[rank(s),i,s]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(x=>x[2]); }

Object.assign(window,{ planSection, seedPlans, orderSections });
