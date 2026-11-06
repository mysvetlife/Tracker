/* data-model.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Data model ================= */
const STORE_KEY="progress_tracker_v4";
function uid(){ return Math.random().toString(36).slice(2,9); }
/* ===== Цикл 2 · «Фаза A» (17.08.2026 — 11.10.2026) =====
   Цель фазы — не набрать форму, а погасить обострение и пройти все 10 сеансов
   физиотерапии. Цели по КБЖУ — диапазоны, а не одна цифра: глубокий дефицит
   при лечении тендинопатии работает против физиотерапии. */
const C2_START="2026-08-17", C2_WEEKS=8, C2_STEPGOAL=9000, PHYSIO_TOTAL=10;
const C2_GOALS={kcal:[2000,2050],protein:[155,165],fat:[65,75],carb:[180,195]};
function c2goals(){ return {kcal:C2_GOALS.kcal.slice(),protein:C2_GOALS.protein.slice(),fat:C2_GOALS.fat.slice(),carb:C2_GOALS.carb.slice()}; }
const PHASE_A_EXERCISES=[
 "День 1 — тяни: велотренажёр 10 мин ур. 4–5 · изометрия отведения бедра 5×30 сек · гребля 3×10–12 · тяга сверху к груди 3×10–12 · наружная ротация плеча 3×15 · бицепс 3×10–12 · ягодичный мостик 3×12 · боковая планка с колен 3×20 сек",
 "День 2 — толкай: велотренажёр 10 мин · изометрия 5×30 сек · жим от груди 3×10–12 · трицепс 3×12 · Y-подъёмы 3×10 · наружная ротация 3×15 · разгибание голени 3×12 · сгибание голени 3×12 · мостик 3×12",
 "День 3 — фулбоди: велотренажёр 20 мин ур. 5–6 · изометрия 5×45 сек · присед на стул 3×10 · гребля 3×12 · тяга сверху 3×12 · наружная ротация 3×15 · мостик 3×15"
];
/* Карта восьми недель Фазы A: один фокус на неделю, не два и не три.
   Повышение шагов с недели 5 разрешено только при зелёной зоне боли. */
const GV_EP_MIN=22;   // серия Gravity Falls
const PHASE_A_WEEKS=[
 {focus:"Провокаторы сна. Еду не трогаю", steps:9000, physio:2},
 {focus:"Окно сна сдвигается. Белок по приёмам", steps:9000, physio:2},
 {focus:"Авокадо не чаще 2 раз в неделю", steps:9000, physio:1},
 {focus:"Творог 1 раз в день. Замеры", steps:9000, physio:1},
 {focus:"Сладкое как строка плана", steps:10000, physio:1},
 {focus:"Жиры держатся до 75 г", steps:11000, physio:1},
 {focus:"5 дней из 7 в коридоре КБЖУ", steps:12000, physio:1},
 {focus:"Замеры, итог цикла, решение по Фазе B", steps:13000, physio:1}
];
const PHASE_A_OUT="Убрано на всю фазу: выпады любые · групповые занятия · тренажёр отведения ноги назад · «бабочка» · велотренажёр на 7. Растяжки, которых не будет: поза голубя, «четвёрка», ИТ-тракт, колено поперёк тела — они тянут сухожилие через сдавление.";
const PHASE_A_HOME="Домашний блок, 3–4 раза в неделю по 10 минут: изометрия отведения лёжа с резинкой выше колен 5×30–45 сек · мостик на двух ногах 3×12 с паузой 2 сек · отведение лёжа на боку в нейтрали 2×10 невысоко · наружная ротация плеча 3×15. Если физиотерапевт даст свои упражнения — делаю их.";
/* ===== Программа года (с 2026-11-09 по 2027-11-07), заменяет Цикл 2 «Фаза A» =====
   Здесь только даты, названия фаз и стартовые числа. Числа целей (калории по фазам, белок на кг веса) при первом запуске
   копируются в данные пользователя (sport.prog) и дальше правятся в карточке «Настройки программы». */
const PROGRAM={ start:"2026-11-09", end:"2027-11-07", weeks:52, stepGoal:10000, gymPerWeek:3,
  light:[8,12,16,20,24,28,32,36,40,44,48,52],
  phases:[
    {id:"p1",name:"Вход, без дефицита",from:"2026-11-09",to:"2026-12-06"},
    {id:"p2e",name:"Мягкий вход в дефицит",from:"2026-12-07",to:"2026-12-20"},
    {id:"p2a",name:"Дефицит 2а",from:"2026-12-21",to:"2027-02-28"},
    {id:"b1",name:"Перерыв, поддержание",from:"2027-03-01",to:"2027-03-14"},
    {id:"p2b",name:"Дефицит 2б",from:"2027-03-15",to:"2027-06-06"},
    {id:"b2",name:"Перерыв, поддержание",from:"2027-06-07",to:"2027-06-20"},
    {id:"p2c",name:"Дефицит 2в",from:"2027-06-21",to:"2027-09-12"},
    {id:"hold",name:"Закрепление, поддержание",from:"2027-09-13",to:"2027-11-07"}],
  measDates:["2026-12-06","2027-01-03","2027-01-31","2027-02-28","2027-03-28","2027-04-25","2027-05-23","2027-06-20","2027-07-18","2027-08-15","2027-09-12","2027-10-10","2027-11-07"],
  pcoef:[1.6,2.0],
  kcal:{p1:[2300,2500],p2e:[2150,2350],p2a:[2000,2200]} };
/* порядок и состав блога по умолчанию: одна закреплённая запись «Постоянное» */
const BLOG_PIN={ id:"bl-pin", pin:true, date:"2026-11-09", title:"Постоянное",
  text:"Взвешивание и замеры\n• Взвешивание — по воскресеньям, в одно и то же время; в воскресенье трекер напомнит.\n• Обхваты — раз в 4 недели: 6 дек, 3 янв, 31 янв, 28 фев и дальше по календарю.\n• Калории смотрим по неделе, а не по одному дню. Один «лишний» день ничего не меняет.\n\nБелок\n• Норма — 1,6–2,0 г на кг веса. Трекер считает коридор по последнему взвешиванию.\n• Делим на 3–4 приёма по 20–40 г. Протеиновый коктейль добирает белок, еду не заменяет.\n\nТарелка и еда\n• Половина тарелки — овощи и фрукты, четверть белок, четверть цельные зерна и сложные углеводы. Картофель за овощи не считается.\n• Овощи 400–500 г в день.\n• Никаких дней голода и «отработок»: пропущенный зал — питание то же." };
function defaultData(){
  return { title:"Мой прогресс", active:"overview", updatedAt:0, secDeleted:[], sections:[
    { id:uid(), name:"Спорт / Тело", kind:"sport", color:"var(--a-rose)", icon:"dumbbell",
      sub:"Легче, сильнее, выносливее",
      sport:{ config:{ startDate:PROGRAM.start, exercises:[], height:177, weightStart:null, cycleWeeks:PROGRAM.weeks, stepGoal:PROGRAM.stepGoal, goals:c2goals(), c2Migr:1, yearMigr:1 },
        days:{}, workouts:[], weight:[], chest:[], waist:[], belly:[], hips:[], energy:[], weekNotes:{}, archives:[], physio:{done:{},dates:{}}, cook:{} } },
    { id:uid(), name:"Дизайн и карьера", kind:"career", color:"var(--a-blue)", icon:"sparkle",
      sub:"UX/UI + цифровая доступность", career:ensureCareer(null) },
    { id:uid(), name:"Английский", kind:"english", color:"var(--a-green)", icon:"lang",
      sub:"Яндекс.Практикум + практика речи", english:ensureEnglish(null) },
    { id:uid(), name:"Понедельник", kind:"course", color:"var(--a-violet)", icon:"target",
      sub:"Никто не начинает с совершенства", course:{ done:{}, exp:{0:true}, timeLog:[], moods:[] } }
  ]};
}
function save(){ try{ if(data && !initializing) data.updatedAt=Date.now(); localStorage.setItem(STORE_KEY, JSON.stringify(data)); }catch(e){} window.dataRev++; schedulePush(); }
function mstamp(p){ if(data){ data._m=data._m||{}; data._m[p]=Date.now(); } if(typeof evMark==="function") evMark(p); }   // evMark - журнал событий, events.js
function lsGet(k){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):null; }catch(e){ return null; } }
function ensureSport(sp){ sp=sp||{}; sp.config=Object.assign({startDate:null,exercises:[],height:177,weightStart:82,cycleWeeks:12,stepGoal:10000,sex:'f',age:30,activity:1.45},sp.config||{});
  sp.days=sp.days||{}; sp.workouts=sp.workouts||[]; sp.weight=sp.weight||[]; sp.chest=sp.chest||[]; sp.waist=sp.waist||[]; sp.belly=sp.belly||[]; sp.hips=sp.hips||[]; sp.energy=sp.energy||[]; sp.weekNotes=sp.weekNotes||{}; sp.archives=sp.archives||[]; sp.cardExp=sp.cardExp||{};
  sp.physio=sp.physio||{done:{},dates:{}}; sp.physio.done=sp.physio.done||{}; sp.physio.dates=sp.physio.dates||{};
  sp.cook=sp.cook||{}; sp.cardOrder=sp.cardOrder||[]; sp.paused=sp.paused||{};
  sp.config.goals=sp.config.goals||c2goals();
  /* «Рабочие веса» убраны вместе с данными — карточку не заполняли.
     Чистим и в архивных снимках, иначе mKeepUnknown вернёт lifts с другого устройства. */
  delete sp.lifts;
  sp.archives.forEach(a=>{ if(a&&a.data) delete a.data.lifts; });
  if(!sp.config.exMigr){ sp.config.exMigr=1; sp.config.exercises=(sp.config.exercises||[]).filter(n=>!/присед/i.test(n)); if(!sp.config.exercises.some(n=>/велотренаж/i.test(n))) sp.config.exercises.push("Велотренажёр (скорость)"); }
  if(!sp.config.c2Migr && sp.config.startDate){ sp.config.c2Migr=1; ensureCycle2(sp); }
  if(!sp.config.yearMigr){ sp.config.yearMigr=1; ensureYear(sp); }
  sp.weekWo=sp.weekWo||{};                                 // сколько раз была в зале за неделю: {понедельник: число}
  { const p=sp.prog=sp.prog||{}; p.noNumbers=!!p.noNumbers;
    if(!p.pcoef) p.pcoef=PROGRAM.pcoef.slice();
    if(!p.kcal) p.kcal=JSON.parse(JSON.stringify(PROGRAM.kcal)); }
  sp.blog=sp.blog||[]; sp.blogDel=sp.blogDel||[];
  if(!sp.blogSeeded){ sp.blogSeeded=1; if(!sp.blog.some(b=>b.id===BLOG_PIN.id)&&sp.blogDel.indexOf(BLOG_PIN.id)<0) sp.blog.push(JSON.parse(JSON.stringify(BLOG_PIN))); }
  return sp; }
/* Переход на программу года. Цикл 2 уходит в архив снимком (граница, а не перенос): вес, замеры, бодрость и дни остаются
   на месте, сквозной график не рвётся. Номер архива фиксированный: два устройства, переведшие данные независимо, не дублируют его. */
function ensureYear(sp){ const c=sp.config;
  if(c.startDate && c.startDate<PROGRAM.start && !sp.archives.some(a=>a&&a.id==="cycle2")){
    const from=c.startDate, to=dateAddDays(PROGRAM.start,-1);
    const srt=arr=>(arr||[]).filter(x=>x&&x.date).slice().sort((x,y)=>x.date<y.date?-1:1);
    const w=srt(sp.weight), wIn=w.filter(x=>x.date>=from&&x.date<=to), wBefore=w.filter(x=>x.date<=to);
    const cm=arr=>{ const a=srt(arr).filter(x=>x.date<=to); return a.length?a[a.length-1].cm:null; };
    sp.archives.push({ id:"cycle2", title:"Цикл 2 — август – ноябрь 2026", from:from, to:to,
      goals:Object.assign({steps:c.stepGoal||10000},c.goals||{}),
      exercises:(c.exercises||[]).slice(),
      summary:{ workouts:(sp.workouts||[]).filter(x=>x>=from&&x<=to).length, physio:Object.keys((sp.physio&&sp.physio.done)||{}).filter(k=>sp.physio.done[k]).length },
      result:{ weightStart:wIn.length?wIn[0].kg:c.weightStart, weightEnd:wBefore.length?wBefore[wBefore.length-1].kg:null,
               waist:cm(sp.waist), belly:cm(sp.belly), chest:cm(sp.chest), hips:cm(sp.hips) },
      note:"Закрыт при переходе на программу года" }); }
  c.startDate=PROGRAM.start; c.cycleWeeks=PROGRAM.weeks; c.stepGoal=PROGRAM.stepGoal; }
/* Переход на цикл 2. Архив — это снимок и граница, а не перенос данных:
   weight[], замеры и energy[] остаются на месте целиком, иначе рухнет сквозной
   график с ноября 2025 — он и есть «общий показатель». */
function ensureCycle2(sp){ const c=sp.config;
  if(c.startDate && !sp.archives.some(a=>a&&a.id==="cycle1")){
    const srt=(arr)=>(arr||[]).slice().sort((x,y)=>x.date<y.date?-1:1);
    const w=srt(sp.weight), cm=(arr)=>{ const a=srt(arr); return a.length?a[a.length-1].cm:null; };
    sp.archives.push({ id:"cycle1", title:"Цикл 1 — ноябрь 2025 – август 2026",
      from:c.startDate, to:"2026-08-16",
      goals:{kcal:1740,protein:142,fat:63,carb:151,steps:c.stepGoal||10000},
      exercises:(c.exercises||[]).slice(),
      result:{ weightStart:w.length?w[0].kg:c.weightStart, weightEnd:w.length?w[w.length-1].kg:null,
               waist:cm(sp.waist), belly:cm(sp.belly), chest:cm(sp.chest), hips:cm(sp.hips) },
      note:"Закрыт по назначению врача 03.08.2026: обострение трохантерита, 10 сеансов физиотерапии" });
    if(w.length) c.weightStart=w[w.length-1].kg;
  }
  c.startDate=C2_START; c.cycleWeeks=C2_WEEKS; c.stepGoal=C2_STEPGOAL;
  c.goals=c2goals(); c.exercises=PHASE_A_EXERCISES.slice(); }
function ensureCareer(c){ c=c||{}; c.config=Object.assign({startDate:null,cycleWeeks:12},c.config||{});
  c.sessions=c.sessions||[]; c.features=c.features||[]; c.later=c.later||[]; c.exp=c.exp||{}; c.timeExp=c.timeExp||{}; c.timeLog=c.timeLog||[]; c.vkcourse=ensureVk(c.vkcourse); c.mts=ensureVk(c.mts); c.cardExp=c.cardExp||{};
  c.apply=c.apply||{days:{}}; c.apply.days=c.apply.days||{}; c.li=c.li||{weeks:{}}; c.li.weeks=c.li.weeks||{}; c.tlog=c.tlog||{}; c.cardOrder=c.cardOrder||[]; c.paused=c.paused||{};
  if(!c.timeLog.length && c.sessions.length){ c.timeLog=c.sessions.map(d=>({d,m:0,note:'занятие'})); }
  c.stages=c.stages||{};
  CR_STAGES.forEach(st=>{ c.stages[st.key]=c.stages[st.key]||{}; st.items.forEach(it=>{ if(!(it[0] in c.stages[st.key])) c.stages[st.key][it[0]]=false; }); });
  /* Проекты плана возврата: те же stages, поэтому синхронизация подхватывает их сама */
  RT_PROJECTS.forEach(p=>{ c.stages[p.key]=c.stages[p.key]||{}; p.blocks.forEach(b=>b.items.forEach(it=>{ if(!(it[0] in c.stages[p.key])) c.stages[p.key][it[0]]=false; })); });
  c.vk=Object.assign({osnovy:false,design:false,research:false,dev:false,testing:false},c.vk||{});
  c.checkpoints=Object.assign({cp1:false,cp2:false,cp3:false,cp4:false},c.checkpoints||{});
  return c; }
function ensureVk(v){ v=v||{}; v.done=v.done||{}; v.exp=v.exp||{}; return v; }
/* Конструктор: блоки, которые Света собирает сама, без правок кода.
   Блоки могут жить в ЛЮБОМ разделе (sec.blocks) — и в своих, и во встроенных
   вкладках. Ключи прогресса — только по id блока/пункта (uid), никогда
   по названию: переименование не должно трогать данные. Префикс меток один:
   cb:<blockId>.<ключ>. */
function ensureBlocks(sec){ sec.blocks=sec.blocks||[]; sec.blocksDeleted=sec.blocksDeleted||[];
  sec.blocks.forEach(b=>{
    if(b.type==="habit"){ b.days=b.days||{}; if(!b.ph) b.ph="заметка (по желанию)"; }
    if(b.type==="checklist"){ b.items=b.items||[]; b.done=b.done||{}; b.del=b.del||[]; }
    if(b.type==="dcounter"){ b.days=b.days||{}; if(b.goal===undefined) b.goal=0; if(!b.unit) b.unit="раз"; }
    if(b.type==="program"){ b.groups=b.groups||[]; b.done=b.done||{}; b.exp=b.exp||{}; b.del=b.del||[]; } });
  return sec; }
function ensureCustom(sec){ ensureBlocks(sec);
  sec.cardExp=sec.cardExp||{}; sec.cardOrder=sec.cardOrder||[]; sec.paused=sec.paused||{};
  return sec; }
function ensureEnglish(e){ e=e||{}; e.config=Object.assign({startDate:null,cycleWeeks:12},e.config||{}); e.yandex=e.yandex||{done:{}}; e.yandex.done=e.yandex.done||{}; e.yandex.wexp=e.yandex.wexp||{};
  e.theory=e.theory||{done:{},open:false}; e.theory.done=e.theory.done||{};
  e.a11y=e.a11y||{done:{},exp:{}}; e.a11y.done=e.a11y.done||{}; e.a11y.exp=e.a11y.exp||{}; e.a11y.min=e.a11y.min||{};
  e.writing=e.writing||{};
  e.wdaily=e.wdaily||{days:{}}; e.wdaily.days=e.wdaily.days||{};
  e.hp=e.hp||{days:{}}; e.hp.days=e.hp.days||{};
  e.twenty=e.twenty||{done:{},open:true}; e.twenty.done=e.twenty.done||{};
  e.anki=e.anki||{days:{}}; e.anki.days=e.anki.days||{}; e.cardExp=e.cardExp||{};
  /* Говорение и слух: шэдоуинг и практика Инглекс — ежедневные, занятия — недельные. */
  e.shadow=e.shadow||{days:{}}; e.shadow.days=e.shadow.days||{};
  e.scene=e.scene||{days:{}}; e.scene.days=e.scene.days||{};
  e.lessons=e.lessons||{weeks:{}}; e.lessons.weeks=e.lessons.weeks||{};
  e.ankiQueue=e.ankiQueue||{done:{}}; e.ankiQueue.done=e.ankiQueue.done||{};
  e.paused=e.paused||{}; e.cardOrder=e.cardOrder||[];                           // {yandex:1, theory:1} — блоки на паузе
  e.tlog=e.tlog||{};                               // минуты по дням: "<курс>|<дата>"
  /* старые ключи паузы (по имени блока) переводим в ключи карточек */
  if(e.paused.yandex){ delete e.paused.yandex; e.paused.ya=1; }
  if(e.paused.theory){ delete e.paused.theory; e.paused.th=1; }
  if(!e.speaking||!e.speaking.length) e.speaking=[{done:false,date:null,note:"",min:0},{done:false,date:null,note:"",min:0},{done:false,date:null,note:"",min:0},{done:false,date:null,note:"",min:0}];
  /* полная форма записи: иначе слияние допишет min и холостой прогон будет «изменением» */
  e.speaking.forEach(x=>{ if(x.min===undefined) x.min=0; if(x.note===undefined) x.note=""; if(x.date===undefined) x.date=null; });
  if(!e.gravity){ e.gravity={done:{s0e0:1,s0e1:1,s0e2:1},exp:{}}; } e.gravity.done=e.gravity.done||{}; e.gravity.exp=e.gravity.exp||{}; return e; }
function migrate(d){ if(!d||!d.sections) return d; d._m=d._m||{};
  d.week=d.week||{plan:{},review:{},general:{}}; d.week.plan=d.week.plan||{}; d.week.review=d.week.review||{}; d.week.general=d.week.general||{};
  d.plan=d.plan||{tasks:[],deleted:[]}; d.plan.tasks=d.plan.tasks||[]; d.plan.deleted=d.plan.deleted||[];
  d.secDeleted=d.secDeleted||[];                     // тумбстоны удалённых разделов
  /* «Понедельник» стал направлением-проектом: kind:"course" переводится без потерь (project-model.js).
     Если устаревшее устройство вернуло course с тем же id - сливаем с уже готовым проектом. */
  d.sections.forEach(s=>{ if(!s.kind) s.kind=s.course?"course":(s.sport?"sport":"generic"); });
  d.sections=d.sections.map(s=>s.kind==="course"?courseToProject(s,d._m):s);
  { const seen={}; d.sections=d.sections.filter(s=>{ if(s.kind!=="project") return true; const f=seen[s.id]; if(!f){ seen[s.id]=s; return true; } mergeProject(f,s,d._m,d._m); return false; }); }
  seedPlans(d);
  if(!d.sections.some(s=>s.id===NARC_ID)&&d.secDeleted.indexOf(NARC_ID)<0) d.sections.push(narcSeed());
  orderSections(d); secApplyOrder(d);                // secApplyOrder - sort.js: порядок, который Света выставила перетаскиванием
  ensureNotes(d); ensureHabits(d);
  /* привычки, связанные со «Спортом», получают названия программы года (один раз; метка hbc: - чтобы переименование доехало на другие устройства) */
  if(!d.habRen){ d.habRen=1; const ren={warmup:["Зарядка с планкой","Зарядка"],steps:["10 000 шагов","Шаги 10 000"],reha:["Мини-физио","Физиотерапия 15 минут"]};
    d.habits.forEach(h=>{ const r=ren[h.src]; if(r&&h.name===r[0]){ h.name=r[1]; d._m["hbc:"+h.id]=Date.now(); } }); }
  d.sections.forEach(s=>{ if(!s.kind) s.kind=s.course?"course":(s.sport?"sport":"generic");
    if(s.kind==="custom") ensureCustom(s); else ensureBlocks(s);   // блоки конструктора есть у любого раздела
    if(s.kind==="generic"&&(s.name==="Учёба"||s.name==="Учеба")){ s.name="Дизайн и карьера"; s.sub="UX/UI + цифровая доступность"; s.kind="career"; s.icon="sparkle"; s.color="var(--a-blue)"; delete s.items; }
    if(s.kind==="generic"&&s.name==="Английский"){ s.kind="english"; s.sub="Яндекс.Практикум + практика речи"; delete s.items; }
    if(s.kind==="project") s.project=ensureProject(s.project);
    if(s.kind==="sport") s.sport=ensureSport(s.sport);
    if(s.kind==="career") s.career=ensureCareer(s.career);
    if(s.kind==="english") s.english=ensureEnglish(s.english);
    if(s.kind==="course"){ s.course=Object.assign({done:{},exp:{0:true},timeLog:[],moods:[],cardExp:{},tlog:{},cardOrder:[],paused:{}},s.course||{}); s.course.cardExp=s.course.cardExp||{}; s.course.tlog=s.course.tlog||{}; s.course.cardOrder=s.course.cardOrder||[]; s.course.paused=s.course.paused||{}; } });
  // move any old separate VK-course section into career, then remove the tab
  const vkSec=d.sections.find(s=>s.kind==="vkcourse"), carSec=d.sections.find(s=>s.kind==="career");
  if(vkSec&&carSec){ carSec.career=ensureCareer(carSec.career);
    if(vkSec.vkcourse&&Object.keys(vkSec.vkcourse.done||{}).length>Object.keys(carSec.career.vkcourse.done||{}).length) carSec.career.vkcourse=ensureVk(vkSec.vkcourse); }
  d.sections=d.sections.filter(s=>s.kind!=="vkcourse");
  return d; }
function load(){
  const cur=lsGet(STORE_KEY); const prev=lsGet("progress_tracker_v3")||lsGet("progress_tracker_v2");
  if(!cur&&!prev) return null;
  const raw=cur||defaultData();
  const base=raw;                                    // слияние со старым хранилищем - до перевода «Понедельника» в проект
  if(prev&&prev.sections){
    const pc=prev.sections.find(s=>s.course); const bc=base.sections.find(s=>s.kind==="course");
    if(pc&&pc.course&&bc){
      if(Object.keys(pc.course.done||{}).length>Object.keys(bc.course.done||{}).length) bc.course.done=pc.course.done;
      if((pc.course.timeLog||[]).length>(bc.course.timeLog||[]).length) bc.course.timeLog=pc.course.timeLog;
      if((pc.course.moods||[]).length>(bc.course.moods||[]).length) bc.course.moods=pc.course.moods;
      if(pc.course.exp&&Object.keys(pc.course.exp).length>Object.keys(bc.course.exp||{}).length) bc.course.exp=pc.course.exp;
    }
    prev.sections.filter(s=>s.items&&s.items.length).forEach(ps=>{ const bs=base.sections.find(s=>s.kind==="generic"&&s.name===ps.name);
      if(bs&&(!bs.items||bs.items.every(i=>!i.done&&!i.value&&!i.minutes&&!(i.note)))) bs.items=ps.items; });
  }
  return migrate(base);
}

/* ---- имена наружу ---- */
Object.assign(window, {
  uid, c2goals, defaultData, save, mstamp, lsGet,
  ensureSport, ensureCycle2, ensureCareer, ensureVk, ensureBlocks, ensureCustom,
  ensureEnglish, migrate, load, STORE_KEY, C2_START, C2_WEEKS,
  C2_STEPGOAL, PHYSIO_TOTAL, C2_GOALS, PHASE_A_EXERCISES, GV_EP_MIN, PHASE_A_WEEKS,
  PHASE_A_OUT, PHASE_A_HOME, PROGRAM, BLOG_PIN, ensureYear,
});
