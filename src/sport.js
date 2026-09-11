/* sport.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Sport / Health module ================= */
// evidence-based daily targets (Mifflin-St Jeor + safe deficit for ~0.5 kg/week fat loss)
function spTargets(sp){ const c=sp.config; const w=spLatestWeight(sp)||c.weightStart||82; const h=c.height||177; const age=c.age||30; const sex=c.sex||'f'; const act=c.activity||1.45;
  const bmr=10*w+6.25*h-5*age+(sex==='m'?5:-161); const tdee=bmr*act;
  let kcal=Math.round((tdee-550)/10)*10; kcal=Math.max(kcal, sex==='m'?1500:1300);
  const protein=Math.round(1.8*w), fat=Math.round(0.8*w); const carbs=Math.max(0,Math.round((kcal-protein*4-fat*9)/4));
  return {kcal,protein,fat,carbs,tdee:Math.round(tdee),bmr:Math.round(bmr)}; }
/* ---- Фаза A: коридоры КБЖУ, сон, боль, физиотерапия ---- */
function spGoals(sp){ return (sp.config&&sp.config.goals)||C2_GOALS; }
function spRange(sp,f){ const g=spGoals(sp)[f]; return (g&&g.length===2)?g:C2_GOALS[f]; }
function rngTxt(r){ return r[0]+"–"+r[1]; }
/* «В коридоре» — попал в диапазон или отклонился не больше чем на 5%. */
function inRange(v,r){ if(!v) return false; return v>=r[0]*0.95 && v<=r[1]*1.05; }
function spDayCore(sp,d){ return inRange(d.kcal,spRange(sp,'kcal')) && inRange(d.protein,spRange(sp,'protein')); }
function spDayAll(sp,d){ return spDayCore(sp,d) && inRange(d.fat,spRange(sp,'fat')) && inRange(d.carbs,spRange(sp,'carb')); }
function spWeekCorridor(sp,mon){ let core=0,all=0; for(let i=0;i<7;i++){ const d=spDay(sp,dateAddDays(mon,i)); if(spDayCore(sp,d)){ core++; if(spDayAll(sp,d)) all++; } } return {core,all}; }
/* Светофор боли из программы: 🟢 0–3 · 🟡 4–5 · 🔴 >5. Это медицинский ориентир,
   а не оценка дня: боль ≤3 при тендинопатии допустима и не означает повреждение. */
function painMax(d){ const v=[d.painR,d.painL,d.painS].filter(x=>x!=null&&x!==""); return v.length?Math.max.apply(null,v):null; }
function painZone(d){ const m=painMax(d); if(m==null) return null; return m<=3?"g":(m<=5?"y":"r"); }
const PAIN_COLOR={g:"var(--success)",y:"var(--a-amber)",r:"var(--a-rose)"};
const PAIN_WORD={g:"зелёная зона",y:"жёлтая зона",r:"красная зона"};
function spAvgField(sp,mon,f){ let s=0,n=0; for(let i=0;i<7;i++){ const v=spDay(sp,dateAddDays(mon,i))[f]; if(v!=null&&v!=="") { s+=v; n++; } } return n?s/n:null; }
function spCountField(sp,mon,f){ let n=0; for(let i=0;i<7;i++){ if(spDay(sp,dateAddDays(mon,i))[f]) n++; } return n; }
function spSleepGood(sp,mon){ let n=0; for(let i=0;i<7;i++){ if((spDay(sp,dateAddDays(mon,i)).sleepH||0)>=7) n++; } return n; }
/* Физиотерапия: 10 сеансов, ключи p1..p10, даты — в physio.dates. */
function phKey(i){ return "p"+i; }
function phDone(sp){ let n=0; for(let i=1;i<=PHYSIO_TOTAL;i++){ if(sp.physio.done[phKey(i)]) n++; } return n; }
function phWeek(sp,mon){ const end=dateAddDays(mon,6); let n=0;
  for(let i=1;i<=PHYSIO_TOTAL;i++){ const k=phKey(i); if(!sp.physio.done[k]) continue;
    const ds=sp.physio.dates[k]; if(ds?(ds>=mon&&ds<=end):tsInWeek("fz:"+k,mon)) n++; }
  return n; }
function phLastDate(sp){ let last=null; for(let i=1;i<=PHYSIO_TOTAL;i++){ const ds=sp.physio.dates[phKey(i)]; if(ds&&(!last||ds>last)) last=ds; } return last; }
/* Сквозные цифры. Массивы при архивации не чистятся, но если старый архив
   когда-то их унёс — достаём и оттуда, чтобы линия «всего» не обнулялась никогда. */
function spAllPts(sp,field,valKey){ const out=(sp[field]||[]).slice();
  (sp.archives||[]).forEach(a=>{ if(a&&a.data&&a.data[field]) out.push.apply(out,a.data[field]); });
  const a1=(sp.archives||[]).find(a=>a&&a.id==="cycle1");
  if(a1&&a1.result&&field==="weight"&&a1.result.weightStart!=null) out.push({date:a1.from||"2025-11-01",kg:a1.result.weightStart});
  const seen={},res=[]; out.forEach(x=>{ if(!x||!x.date) return; const k=x.date+"|"+x[valKey]; if(!seen[k]){ seen[k]=1; res.push(x); } });
  return res.sort((x,y)=>x.date<y.date?-1:1); }
function spDelta(sp,field,valKey,from){ const a=spAllPts(sp,field,valKey).filter(x=>!from||x.date>=from);
  if(a.length<1) return null; const base=from?a[0]:a[0], last=a[a.length-1];
  if(base===last) return 0; return +(last[valKey]-base[valKey]).toFixed(1); }
function dTxt(v,unit){ if(v==null) return "—"; const s=v>0?"+":(v<0?"−":"±"); return s+Math.abs(v).toFixed(1).replace(/\.0$/,"").replace(".",",")+" "+unit; }
/* ---- Время, отданное цели за неделю ----
   Нормативы со слов Светы: это оценка занятости целью, а не хронометраж.
   Ходьба считается пропорционально: 10 000 шагов ≈ 2 часа.
   Готовка ПП заводится руками — её длительность каждый раз разная. */
const SP_MIN={workout:90, physio:90, reha:10, warmup:10, photos:5, report:5};
const SP_WALK={steps:10000, min:120};
function spCookMin(sp,mon){ const v=(sp.cook||{})[isoWeek(mon)]; return v?(parseInt(v)||0):0; }
function spTimeParts(sp,mon){
  let steps=0,warm=0,reha=0,ph=0,rep=0;
  for(let i=0;i<7;i++){ const d=spDay(sp,dateAddDays(mon,i)); steps+=d.stepsCount||0;
    if(d.warmup)warm++; if(d.reha)reha++; if(d.photos)ph++; if(d.report)rep++; }
  const wo=(sp.workouts||[]).filter(x=>mondayOf(x)===mon).length, fz=phWeek(sp,mon), cook=spCookMin(sp,mon);
  const out=[], add=(label,min,hint)=>{ if(min>0) out.push({label,min,hint}); };
  add('Тренировки в зале',wo*SP_MIN.workout,wo+' × 1 ч 30 мин');
  add('Физиотерапия',fz*SP_MIN.physio,fz+' × 1 ч 30 мин');
  add('Ходьба',Math.round(steps/SP_WALK.steps*SP_WALK.min),steps.toLocaleString('ru-RU')+' шагов');
  add('Домашний блок',reha*SP_MIN.reha,reha+' × 10 мин');
  add('Зарядка',warm*SP_MIN.warmup,warm+' × 10 мин');
  add('Фото еды',ph*SP_MIN.photos,ph+' × 5 мин');
  add('Отчёт КБЖУ',rep*SP_MIN.report,rep+' × 5 мин');
  add('Готовка ПП',cook,'введено вручную');
  return out; }
function spWeekMin(sp,mon){ return spTimeParts(sp,mon).reduce((a,p)=>a+p.min,0); }
// daily energy history (points for line chart)
function spEnergyPoints(sp){ return Object.keys(sp.days).filter(k=>sp.days[k].energy).sort().map(k=>({label:ruDate(k), y:sp.days[k].energy})); }
function spLastDailyEnergy(sp){ const ks=Object.keys(sp.days).filter(k=>sp.days[k].energy).sort(); return ks.length?sp.days[ks[ks.length-1]].energy:null; }
function activeSport(){ const s=data.sections.find(x=>x.id===data.active); return s&&s.kind==="sport"?s:null; }
function renderSport(){ const sec=activeSport(); if(!sec)return; document.getElementById("view").innerHTML=sportHTML(sec); wireSport(); applyCardLayout(sec); }

/* date helpers */
function dateAddDays(ds,n){ const d=new Date(ds+"T00:00:00"); d.setDate(d.getDate()+n); return ymd(d); }
function mondayOf(ds){ const d=new Date(ds+"T00:00:00"); const off=(d.getDay()+6)%7; d.setDate(d.getDate()-off); return ymd(d); }
function isoWeek(ds){ const date=new Date(ds+"T00:00:00Z"); const dn=(date.getUTCDay()+6)%7; date.setUTCDate(date.getUTCDate()-dn+3); const ft=date.getTime(); date.setUTCMonth(0,1); if(date.getUTCDay()!==4){ date.setUTCMonth(0,1+((4-date.getUTCDay())+7)%7);} const wk=1+Math.ceil((ft-date)/604800000); return new Date(ft).getUTCFullYear()+"-W"+String(wk).padStart(2,"0"); }
function ruDate(ds){ return new Date(ds+"T00:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short"}); }

/* day logic */
function spDay(sp,ds){ return sp.days[ds]||{}; }
function spFull(d){ return !!(d.steps&&d.warmup&&d.photos&&d.report); }
function spCounted(d){ return !!(d.steps&&d.photos&&d.report); }

/* cycle */
function spWeeks(sp){ return sp.config.cycleWeeks||12; }
function spDaysTotal(sp){ return spWeeks(sp)*7; }
function spStepGoal(sp){ return sp.config.stepGoal||10000; }
function spCycleDay(sp){ if(!sp.config.startDate) return 0; const ms=new Date(todayStr()+"T00:00:00")-new Date(sp.config.startDate+"T00:00:00"); return Math.floor(ms/86400000)+1; }
function spCycleWeek(sp){ const d=spCycleDay(sp); if(d<=0) return 0; return Math.min(Math.ceil(d/7),spWeeks(sp)); }

/* compliance & streaks */
function spWeekCountedDays(sp,mon){ mon=mon||mondayOf(todayStr()); let c=0; for(let i=0;i<7;i++){ if(spCounted(spDay(sp,dateAddDays(mon,i)))) c++; } return c; }
function spWeekCompliance(sp,mon){ return spWeekCountedDays(sp,mon)/7; }
function spWeekFullDays(sp,mon){ mon=mon||mondayOf(todayStr()); let c=0; for(let i=0;i<7;i++){ if(spFull(spDay(sp,dateAddDays(mon,i)))) c++; } return c; }
function spCurrentStreak(sp){ let d=todayStr(); if(!spCounted(spDay(sp,d))) d=dateAddDays(d,-1); let n=0; while(spCounted(spDay(sp,d))){ n++; d=dateAddDays(d,-1);} return n; }
/* Лучший стрик считаем по всем записанным дням, а не от startDate: смена цикла
   не должна обнулять уже прожитое. */
function spBestStreak(sp){ const ks=Object.keys(sp.days).sort(); if(!ks.length&&!sp.config.startDate) return spCurrentStreak(sp);
  let d=ks.length?ks[0]:sp.config.startDate; if(sp.config.startDate&&sp.config.startDate<d) d=sp.config.startDate;
  let best=0,cur=0,end=todayStr(); while(d<=end){ if(spCounted(spDay(sp,d))){cur++;best=Math.max(best,cur);}else cur=0; d=dateAddDays(d,1);} return best; }

/* strength */
function spWorkoutsInWeek(sp,mon){ return sp.workouts.filter(w=>mondayOf(w)===mon).length; }
function spWorkoutsThisWeek(sp){ return spWorkoutsInWeek(sp,mondayOf(todayStr())); }
function spStrengthCompliance(sp){ if(!sp.config.startDate) return 0; let m=mondayOf(sp.config.startDate),end=mondayOf(todayStr()),weeks=0,ok=0; while(m<=end){ weeks++; if(spWorkoutsInWeek(sp,m)>=3) ok++; m=dateAddDays(m,7);} return weeks?ok/weeks:0; }

/* weight & bmi */
function spWeekAvg(sp,mon){ const a=sp.weight.filter(w=>mondayOf(w.date)===mon).map(w=>w.kg); return a.length?a.reduce((x,y)=>x+y,0)/a.length:null; }
function spWeightTrend(sp){ const cur=spWeekAvg(sp,mondayOf(todayStr())); const prev=spWeekAvg(sp,dateAddDays(mondayOf(todayStr()),-7)); if(cur==null||prev==null) return {cur,prev,delta:null,state:"none"}; const delta=cur-prev; let state="plateau"; if(delta<=-0.3)state="down"; else if(delta>=0.3)state="up"; return {cur,prev,delta,state}; }
function spLatestWeight(sp){ if(!sp.weight.length) return sp.config.weightStart||null; return sp.weight.reduce((a,b)=>a.date>=b.date?a:b).kg; }
function spBMI(sp){ const kg=spLatestWeight(sp),h=sp.config.height; if(!kg||!h) return null; const m=h/100; return kg/(m*m); }
function bmiCat(b){ if(b<18.5)return["Недостаточный","var(--a-cyan)"]; if(b<25)return["Норма","var(--success)"]; if(b<30)return["Избыточный","var(--a-amber)"]; return["Высокий","var(--a-rose)"]; }
function spLast(arr){ return arr&&arr.length?arr.reduce((a,b)=>a.date>=b.date?a:b):null; }
function spDaysSince(ds){ return Math.floor((new Date(todayStr()+"T00:00:00")-new Date(ds+"T00:00:00"))/86400000); }
function spLatestEnergy(sp){ if(!sp.energy.length) return null; return sp.energy[sp.energy.length-1].score; }
const WD=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
function spWeekSteps(sp,mon){ mon=mon||mondayOf(todayStr()); return WD.map((lb,i)=>{ const c=spDay(sp,dateAddDays(mon,i)).stepsCount||0; return {label:lb, v:c, color:(c>=spStepGoal(sp)?'var(--a-green)':'var(--a-rose)')}; }); }
function spWeekKcal(sp,mon){ mon=mon||mondayOf(todayStr()); return WD.map((lb,i)=>({label:lb, v:(spDay(sp,dateAddDays(mon,i)).kcal||0)})); }
function spWeekMacroAvg(sp,mon){ mon=mon||mondayOf(todayStr()); let k=0,p=0,f=0,c=0,n=0; for(let i=0;i<7;i++){ const dd=spDay(sp,dateAddDays(mon,i)); if(dd.kcal){ k+=dd.kcal; p+=dd.protein||0; f+=dd.fat||0; c+=dd.carbs||0; n++; } } return n?{kcal:Math.round(k/n),p:Math.round(p/n),f:Math.round(f/n),c:Math.round(c/n),days:n}:null; }
function spEnergyByWeek(sp){ const startMon=mondayOf(sp.config.startDate); const out=[]; for(let w=0;w<spWeeks(sp);w++){ const e=sp.energy.find(x=>x.week===isoWeek(dateAddDays(startMon,w*7))); out.push({label:'Н'+(w+1), v:e?e.score:0}); } return out; }
function spCycleCompliance(sp){ if(!sp.config.startDate) return 0; let m=mondayOf(sp.config.startDate),end=mondayOf(todayStr()),weeks=0,sum=0; while(m<=end){ let c=0; for(let i=0;i<7;i++){ const ds=dateAddDays(m,i); if(ds<=todayStr()&&spCounted(spDay(sp,ds))) c++; } sum+=c/7; weeks++; m=dateAddDays(m,7);} return weeks?sum/weeks:0; }

/* ---- charts ---- */
function barChart(data,opts){ opts=opts||{}; const w=320,h=opts.h||120,pt=14,pb=20,pl=6,pr=6;
  const max=Math.max(opts.max||0, ...data.map(d=>d.v), 1); const iw=w-pl-pr, ih=h-pt-pb, bw=iw/data.length;
  const bars=data.map((d,i)=>{ const bh=Math.max(0,d.v/max*ih), x=pl+i*bw+bw*0.18, y=pt+ih-bh;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw*0.64).toFixed(1)}" height="${Math.max(bh,0).toFixed(1)}" rx="3" fill="${d.color||opts.color||'var(--a-rose)'}" ${d.v?'':'opacity=".2"'}/><text x="${(pl+i*bw+bw/2).toFixed(1)}" y="${h-6}" text-anchor="middle" font-size="9" fill="var(--muted-2)">${d.label}</text>`; }).join("");
  let goal=""; if(opts.goal){ const gy=pt+ih-Math.min(opts.goal/max,1)*ih; goal=`<line x1="${pl}" x2="${w-pr}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="var(--muted-2)" stroke-dasharray="3 3"/>`; }
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block">${goal}${bars}</svg>`; }
function lineChart(pts,opts){ opts=opts||{}; const w=320,h=opts.h||140,pt=14,pb=22,pl=32,pr=10;
  if(!pts.length) return ""; const ys=pts.map(p=>p.y); let mn=Math.min(...ys),mx=Math.max(...ys); if(mn===mx){mn-=1;mx+=1;} const rng=mx-mn||1;
  const iw=w-pl-pr,ih=h-pt-pb; const X=i=>pl+(pts.length===1?iw/2:i/(pts.length-1)*iw); const Y=v=>pt+ih-(v-mn)/rng*ih;
  const dpath=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(p.y).toFixed(1)).join(' ');
  const dots=pts.map((p,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3" fill="var(--a-rose)"/>`).join("");
  const yl=`<text x="2" y="${pt+8}" font-size="9" fill="var(--muted-2)">${mx.toFixed(1)}</text><text x="2" y="${pt+ih}" font-size="9" fill="var(--muted-2)">${mn.toFixed(1)}</text>`;
  const step=Math.ceil(pts.length/6)||1; const xl=pts.map((p,i)=>(i%step===0)?`<text x="${X(i).toFixed(1)}" y="${h-6}" text-anchor="middle" font-size="8" fill="var(--muted-2)">${p.label}</text>`:'').join("");
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block"><path d="${dpath}" fill="none" stroke="var(--a-rose)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}${yl}${xl}</svg>`; }
/* Диапазон календаря. «Весь путь» показывает и прошлые циклы: дни никуда не делись,
   их просто не видно в окне текущего цикла. */
function calRange(sp,all){ const cycleMon=mondayOf(sp.config.startDate);
  if(!all) return {from:cycleMon, weeks:spWeeks(sp), byCycle:true};
  let first=cycleMon;
  Object.keys(sp.days||{}).sort().slice(0,1).forEach(k=>{ if(k<first) first=k; });
  (sp.archives||[]).forEach(a=>{ const f=a&&(a.from||a.start); if(f&&f<first) first=f; });
  (sp.weight||[]).forEach(x=>{ if(x&&x.date&&x.date<first) first=x.date; });
  const from=mondayOf(first), end=dateAddDays(cycleMon,spWeeks(sp)*7-1);
  let weeks=0,d=from; while(d<=end&&weeks<400){ weeks++; d=dateAddDays(d,7); }
  return {from, weeks:Math.max(weeks,1), byCycle:false}; }
function calendarRows(sp,all){ const R=calRange(sp,all), startMon=R.from; let rows="";
  const fz={}; Object.keys(sp.physio.dates||{}).forEach(k=>{ if(sp.physio.done[k]) fz[sp.physio.dates[k]]=1; });
  for(let w=0;w<R.weeks;w++){ let cells="",wc=0; for(let i=0;i<7;i++){ const ds=dateAddDays(startMon,w*7+i); const day=spDay(sp,ds); const wo=sp.workouts.includes(ds);
    const marks=[]; if(day.steps)marks.push(['Ш','var(--a-rose)','шаги']); if(day.report)marks.push(['К','var(--a-amber)','КБЖУ']); if(wo)marks.push(['Т','var(--success)','тренировка']); if(day.reha)marks.push(['Д','var(--a-cyan)','домашний блок']); if(fz[ds])marks.push(['Ф','var(--a-violet)','физиотерапия']);
    let cls="cell"; if(ds>todayStr()) cls+=" future"; else if(spFull(day)) cls+=" full"; else if(spCounted(day)) cls+=" counted"; else if(marks.length) cls+=" partial"; else cls+=" miss";
    if(spCounted(day)) wc++;
    const num=new Date(ds+"T00:00:00").getDate();
    const pz=painZone(day);
    const chips=marks.map(m=>`<span class="cchip" style="color:${m[1]}">${m[0]}</span>`).join("");
    const title=ruDate(ds)+(marks.length?' · '+marks.map(m=>m[2]).join(', '):'')+(pz?' · боль '+painMax(day)+'/10, '+PAIN_WORD[pz]:'');
    cells+=`<div class="${cls}" onclick="setSportDay('${ds}')" title="${title}">${pz?`<span class="cpain" style="background:${PAIN_COLOR[pz]}"></span>`:''}<span class="cnum">${num}</span><span class="cchips">${chips}</span></div>`; }
    rows+=`<div class="calrow${R.byCycle?'':' wide'}"><span class="calw">${R.byCycle?'Н'+(w+1):ruDate(dateAddDays(startMon,w*7))}</span><div class="calcells">${cells}</div><span class="calc">${wc}/7</span></div>`; }
  return rows; }

/* ---- setup ---- */
function sportSetupHTML(sec){
  return `<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head" style="margin-bottom:16px">
      <div class="sec-ico">${svg('dumbbell')}</div>
      <div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')}</p></div>
    </div>
    <p style="color:var(--muted); font-size:14px; margin:0 0 18px">Цель — стать легче, сильнее и выносливее за цикл 12 недель. Главное здесь — <b>действия</b>, а вес лишь справочное табло. Настроим старт:</p>
    <button class="btn primary" onclick="openSportSetup()">${svg('sparkle')} Начать цикл</button>
  </div>`;
}
function openSportSetup(){
  const sec=activeSport(); const cfg=sec.sport.config;
  const ex=(cfg.exercises&&cfg.exercises.length?cfg.exercises:PHASE_A_EXERCISES).join("\n");
  document.getElementById("modal").innerHTML=`
    <h3>${cfg.startDate?'Настройки цикла':'Начать цикл'}</h3>
    <p class="mhint">Главная метрика — выполнение действий, а не вес.</p>
    <label for="spStart">Дата старта</label><input type="date" id="spStart" value="${cfg.startDate||todayStr()}">
    <label for="spWeeks">Длина цикла, недель</label><input type="number" id="spWeeks" value="${cfg.cycleWeeks||12}">
    <label for="spGoal">Цель по шагам в день</label><input type="number" id="spGoal" value="${cfg.stepGoal||10000}">
    <label for="spHeight">Рост, см</label><input type="number" id="spHeight" value="${cfg.height||177}">
    <label for="spWeight">Стартовый вес, кг</label><input type="number" step="0.1" id="spWeight" value="${cfg.weightStart!=null?cfg.weightStart:82}">
    <label for="spSex">Пол (для расчёта норм КБЖУ)</label><select id="spSex"><option value="f" ${((cfg.sex||'f')==='f')?'selected':''}>Женский</option><option value="m" ${cfg.sex==='m'?'selected':''}>Мужской</option></select>
    <label for="spAge">Возраст</label><input type="number" id="spAge" value="${cfg.age||30}">
    <label for="spAct">Активность</label><select id="spAct">
      <option value="1.2" ${cfg.activity==1.2?'selected':''}>Низкая (сидячая)</option>
      <option value="1.375" ${cfg.activity==1.375?'selected':''}>Лёгкая (1–3 трен/нед)</option>
      <option value="1.45" ${(!cfg.activity||cfg.activity==1.45)?'selected':''}>Умеренная (шаги + 3 трен)</option>
      <option value="1.55" ${cfg.activity==1.55?'selected':''}>Средняя (3–5 трен/нед)</option>
      <option value="1.725" ${cfg.activity==1.725?'selected':''}>Высокая (6–7 трен/нед)</option>
    </select>
    <label for="spEx">Программа тренировок — один день на строку</label><textarea class="note-area" id="spEx" rows="6" placeholder="День 1 — тяни: ...">${esc(ex)}</textarea>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveSportSetup()">Сохранить</button></div>`;
  showModal();
}
function saveSportSetup(){
  const sec=activeSport(); const sp=sec.sport;
  const sd=document.getElementById("spStart").value||todayStr();
  const h=parseFloat(document.getElementById("spHeight").value)||177;
  const ws=parseFloat(document.getElementById("spWeight").value);
  const exs=document.getElementById("spEx").value.split("\n").map(s=>s.trim()).filter(Boolean);
  const first=!sp.config.startDate;
  const cw=parseInt(document.getElementById("spWeeks").value)||12; const sg=parseInt(document.getElementById("spGoal").value)||10000;
  const sex=document.getElementById("spSex").value||'f'; const age=parseInt(document.getElementById("spAge").value)||30; const act=parseFloat(document.getElementById("spAct").value)||1.45;
  sp.config.startDate=sd; sp.config.height=h; sp.config.weightStart=isNaN(ws)?null:ws; sp.config.exercises=exs; sp.config.cycleWeeks=cw; sp.config.stepGoal=sg; sp.config.sex=sex; sp.config.age=age; sp.config.activity=act;
  if(first && !isNaN(ws)){ sp.weight.push({date:sd,kg:ws}); }
  save(); closeModal(); render();
}

/* ---- main view ---- */
function sportHTML(sec){
  const sp=sec.sport;
  if(!sp.config.startDate) return sportSetupHTML(sec);
  if(!sportDay) window.sportDay=todayStr();
  if(!sportWeekMon) window.sportWeekMon=mondayOf(sportDay);
  const WEEKS=spWeeks(sp), TDAYS=spDaysTotal(sp), GOAL=spStepGoal(sp);
  const wk=spCycleWeek(sp), day=spCycleDay(sp), cyclePct=Math.max(0,Math.min(day/TDAYS,1));
  const curMon=mondayOf(todayStr());
  // дашборд — всегда про текущую неделю; карточки ниже — про выбранную в переключателе
  const comp=spWeekCompliance(sp,curMon), counted=spWeekCountedDays(sp,curMon);
  const streak=spCurrentStreak(sp), best=spBestStreak(sp);
  const overCycle=day>TDAYS, notStarted=day<1;
  // две строки прогресса: за текущий цикл и сквозная, которая не обнуляется никогда
  const dCycW=spDelta(sp,'weight','kg',sp.config.startDate), dCycT=spDelta(sp,'waist','cm',sp.config.startDate);
  const dAllW=spDelta(sp,'weight','kg',null), dAllT=spDelta(sp,'waist','cm',null);
  const allFrom=(spAllPts(sp,'weight','kg')[0]||{}).date;
  const wcount=spWorkoutsInWeek(sp,curMon), scomp=spStrengthCompliance(sp);
  const fullDays=spWeekFullDays(sp,curMon);
  const selMon=sportWeekMon, isCur=(selMon===curMon);
  const selRange=ruDate(selMon)+' — '+ruDate(dateAddDays(selMon,6))+(isCur?' · текущая':'');
  const selCounted=spWeekCountedDays(sp,selMon), selFull=spWeekFullDays(sp,selMon);
  const selWorkouts=spWorkoutsInWeek(sp,selMon);

  // dashboard
  let html=`<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head" style="margin-bottom:18px">
      <div class="sec-ico">${svg('dumbbell')}</div>
      <div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')} · ${notStarted?'старт '+ruDate(sp.config.startDate):(overCycle?'цикл завершён — можно архивировать':'неделя '+wk+' из '+WEEKS)}</p></div>
      <div class="sec-tools"><button class="iconbtn" aria-label="Настройки цикла" onclick="openSportSetup()">${svg('pencil')}</button></div>
    </div>
    <div class="dash">
      <div class="dring">${ring(comp,132,12,'var(--a-rose)',true)}</div>
      <div style="width:100%">
        <div class="stats">
          <div class="stat"><div class="n" style="color:var(--a-rose)">${counted}/7</div><div class="l">дней недели зачтено</div></div>
          <div class="stat"><div class="n">${fullDays}/7</div><div class="l">полных дней</div></div>
          <div class="stat"><div class="n b">${wcount}/3</div><div class="l">силовые за неделю</div></div>
          <div class="stat"><div class="n g">${streak}</div><div class="l">стрик, ${plural(streak,'день','дня','дней')}</div></div>
          <div class="stat"><div class="n">${best}</div><div class="l">лучший стрик</div></div>
          <div class="stat"><div class="n">${wk}/${WEEKS}</div><div class="l">неделя цикла</div></div>
        </div>
        <div class="prog" style="margin-top:14px"><div class="prog-top"><span class="lab">Прогресс цикла</span><span class="pct" style="color:var(--a-rose)">${notStarted?'старт '+ruDate(sp.config.startDate):'день '+Math.max(0,Math.min(day,TDAYS))+'/'+TDAYS}</span></div>
          <div class="track"><i style="width:${Math.round(cyclePct*100)}%; background:linear-gradient(90deg,var(--a-rose),#ff9db0)"></i></div></div>
        <div style="margin-top:14px; font-size:13px; line-height:1.75">
          <div><span style="color:var(--muted)">За цикл (с ${ruDate(sp.config.startDate)}):</span> <b>${dTxt(dCycW,'кг')}</b> · талия <b>${dTxt(dCycT,'см')}</b></div>
          <div><span style="color:var(--muted)">Всего${allFrom?' с '+ruDate(allFrom):''}:</span> <b style="color:var(--success)">${dTxt(dAllW,'кг')}</b> · талия <b style="color:var(--success)">${dTxt(dAllT,'см')}</b></div>
        </div>
        <p style="font-size:13px; color:var(--muted); margin:12px 0 0">${counted>=6?'Сильная неделя — '+counted+'/7 дней. Так держать!':counted>=4?counted+'/7 дней — хороший ритм.':'Каждый отмеченный день — уже вклад.'}</p>
      </div>
    </div>
    <div class="beacon">${svg('info')}<div>Фаза A: погасить обострение и пройти все 10 сеансов физиотерапии. Сохранить сустав важнее, чем ускорить снижение веса. Неделя, где вес не сдвинулся, но сон и боль стали лучше, — хорошая неделя.</div></div>
  </div>`;

  // today's actions (steps + КБЖУ + чекбоксы)
  const d=spDay(sp,sportDay);
  const status = spFull(d)?["Полный день","var(--success)"] : spCounted(d)?["День зачтён","var(--a-amber)"] : ["Ещё не зачтён","var(--muted-2)"];
  const dcheck=(on)=>`<span class="check ${on?'on':''}" style="--accent:var(--a-rose); cursor:default">${svg('check')}</span>`;
  const tog=(f,on,label)=>`<div class="item" style="margin-bottom:10px"><div class="item-top"><button class="check ${on?'on':''}" style="--accent:var(--a-rose)" onclick="spToggle('${f}')">${svg('check')}</button><div class="item-name ${on?'done':''}">${label}</div></div></div>`;
  const painTxt=(f)=>d[f]==null?'—':d[f];
  const painBlock=(f,label)=>{ const v=d[f]; const z=v==null?null:(v<=3?'g':(v<=5?'y':'r'));
    return `<div style="margin-top:9px"><div style="display:flex; justify-content:space-between; gap:8px; font-size:12px; color:var(--muted)"><span>${label}</span><span style="color:${z?PAIN_COLOR[z]:'var(--muted-2)'}">${v==null?'не отмечено':v+'/10 · '+PAIN_WORD[z]}</span></div>
      <div class="painrow">${[0,1,2,3,4,5,6,7,8,9,10].map(n=>{ const nz=n<=3?'g':(n<=5?'y':'r');
        return `<button class="${v===n?'on':''}" ${v===n?`style="background:${PAIN_COLOR[nz]}"`:''} onclick="spSetPain('${f}',${n})">${n}</button>`; }).join("")}</div></div>`; };
  html+=cardWrap(sec,'day','Действия дня',selCounted+'/7 зачтено · '+status[0],selCounted/7,'var(--a-rose)',`
    <div class="weeknav">
      <button aria-label="Предыдущая неделя" onclick="sportWeekShift(-1)">‹</button>
      <span>${selRange}</span>
      <button aria-label="Следующая неделя" onclick="sportWeekShift(1)">›</button>
    </div>
    <div class="dayswitch week">
      ${WD.map((lb,i)=>{ const ds=dateAddDays(sportWeekMon,i); const fut=ds>todayStr(); const num=new Date(ds+"T00:00:00").getDate();
        return `<button class="${ds===sportDay?'on':''} ${fut?'fut':''} ${ds===todayStr()?'today':''}" onclick="setSportDay('${ds}')"><b>${lb}</b><span>${num}</span></button>`; }).join("")}
    </div>
    <div class="morn">
      <h4>Утро · сон и боль</h4>
      <div class="mline">
        <span class="lb">Часов сна</span>
        <input class="sleepin" type="number" step="0.5" min="0" max="12" placeholder="7,5" value="${d.sleepH||''}" onchange="spSetSleep(this.value)">
        <span class="lb" style="min-width:auto">Пробуждений</span>
        <span class="cnt"><button class="cntb" aria-label="Меньше" onclick="spWake(-1)">−</button><span class="cntv">${d.wakeN!=null?d.wakeN:'—'}</span><button class="cntb" aria-label="Больше" onclick="spWake(1)">+</button></span>
      </div>
      <div class="painhead"><span style="color:var(--muted)">Боль 0–10</span><b>Бедро П ${painTxt('painR')} · Л ${painTxt('painL')} · Плечо ${painTxt('painS')}</b></div>
      ${painBlock('painR','Правое бедро')}
      ${painBlock('painL','Левое бедро')}
      ${painBlock('painS','Правое плечо')}
      <p style="font-size:11.5px; color:var(--muted-2); margin:12px 0 0">Боль ≤3 при тендинопатии допустима — это не признак повреждения. Цель не «не болит», а «болит ≤3 и уходит за сутки».</p>
    </div>
    <div class="item" style="margin-bottom:10px">
      <div class="item-top">${dcheck(!!d.steps)}<div class="item-name ${d.steps?'done':''}">Шаги <small style="color:var(--muted-2); white-space:nowrap">цель ${GOAL.toLocaleString('ru-RU')}</small></div></div>
      <div class="stepsrow"><input class="stepsin" type="number" min="0" placeholder="сколько шагов сегодня" value="${d.stepsCount||''}" onchange="spSetSteps(this.value)"></div>
    </div>
    ${tog('reha',!!d.reha,'Домашний блок резинок, 10 минут')}
    ${tog('cola',!!d.cola,'Кофеин не позже 14:00')}
    ${tog('bed',!!d.bed,'Отбой в целевое время')}
    ${tog('warmup',!!d.warmup,'Зарядка')}
    ${tog('photos',!!d.photos,'Фото всех приёмов пищи')}
    <div class="item"><div class="item-top">${dcheck(!!d.report)}<div class="item-name ${d.report?'done':''}">Отчёт по КБЖУ</div></div>
      <div class="kbju">
        <label>Ккал<input type="number" min="0" value="${d.kcal||''}" onchange="spSetKbju('kcal',this.value)"></label>
        <label>Белки, г<input type="number" min="0" value="${d.protein||''}" onchange="spSetKbju('protein',this.value)"></label>
        <label>Жиры, г<input type="number" min="0" value="${d.fat||''}" onchange="spSetKbju('fat',this.value)"></label>
        <label>Углев., г<input type="number" min="0" value="${d.carbs||''}" onchange="spSetKbju('carbs',this.value)"></label>
      </div></div>
    <div class="item" style="margin-bottom:0"><div class="item-top"><div class="item-name">Бодрость${d.energy?`: <b style="color:var(--success)">${d.energy}/10</b>`:' <small style="color:var(--muted-2)">оцени 1–10</small>'}</div></div>
      <div class="enrow">${[1,2,3,4,5,6,7,8,9,10].map(nn=>`<button class="enbtn ${d.energy===nn?'on':''}" onclick="spSetEnergy(${nn})">${nn}</button>`).join("")}</div>
    </div>
    <p style="font-size:12px; color:var(--muted-2); margin:10px 0 0">Отмечай любой день недели через переключатель выше — карточки ниже тоже покажут выбранную неделю. День зачтён при шагах ≥ ${GOAL.toLocaleString('ru-RU')} + фото + КБЖУ (зарядка — бонус). Полных дней на этой неделе: ${selFull}/7.</p>`);

  // strength
  const dots=[0,1,2].map(i=>`<i class="${i<selWorkouts?'on':''}"></i>`).join("");
  html+=cardWrap(sec,'strength','Силовые тренировки',selRange+' · '+(selWorkouts>=3?'неделя зачтена':selWorkouts+'/3'),Math.min(selWorkouts/3,1),'var(--a-rose)',`
    <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap">
      <div style="display:flex; align-items:center; gap:14px"><span class="dots">${dots}</span><span style="font-family:Sora,sans-serif; font-weight:700; font-size:18px">${selWorkouts} <small style="color:var(--muted-2); font-weight:500; font-size:13px">/ 3</small></span></div>
      <button class="btn primary" onclick="openWorkout()">${svg('plus')} Отметить / изменить</button>
    </div>
    <div class="prog" style="margin-top:16px"><div class="prog-top"><span class="lab">Комплаенс силовых за цикл</span><span class="pct" style="color:var(--a-rose)">${Math.round(scomp*100)}%</span></div>
      <div class="track"><i style="width:${Math.round(scomp*100)}%; background:linear-gradient(90deg,var(--a-rose),#ff9db0)"></i></div></div>
    <p style="font-size:12px; color:var(--muted-2); margin:12px 0 0">Всего отмечено тренировок: <b style="color:var(--text)">${sp.workouts.length}</b>. Даты добавляются и убираются в окне «Отметить / изменить».</p>`);

  // физиотерапия: 10 сеансов, счёт только вперёд — без обратного отсчёта
  const fzDone=phDone(sp), fzWeek=phWeek(sp,selMon), fzLast=phLastDate(sp);
  html+=cardWrap(sec,'physio','Физиотерапия','пройдено '+fzDone+' из '+PHYSIO_TOTAL,fzDone/PHYSIO_TOTAL,'var(--success)',`
    <div class="fzrow">${[1,2,3,4,5,6,7,8,9,10].map(i=>{ const on=!!sp.physio.done[phKey(i)], ds=sp.physio.dates[phKey(i)];
      return `<button class="fzdot ${on?'on':''}" onclick="phToggle(${i})" aria-label="Сеанс ${i}" title="${on&&ds?'сеанс '+i+' · '+ruDate(ds):'сеанс '+i}">${i}</button>`; }).join("")}</div>
    <div style="font-family:Sora,sans-serif; font-weight:700; font-size:17px">Пройдено ${fzDone} из ${PHYSIO_TOTAL}</div>
    <p style="font-size:12px; color:var(--muted-2); margin:8px 0 0">Все 10 сеансов проходятся до конца, даже если боль ушла раньше.</p>
    <p style="font-size:12.5px; color:var(--muted); margin:12px 0 0">${fzWeek?'На выбранной неделе: '+fzWeek+' '+plural(fzWeek,'сеанс','сеанса','сеансов'):'На выбранной неделе отметок нет.'}${fzLast?' · последний '+ruDate(fzLast):''}</p>
    <p style="font-size:11.5px; color:var(--muted-2); margin:8px 0 0">Отметка ставится на выбранный день (${ruDate(sportDay)}). Нажми ещё раз, чтобы снять.</p>`);

  // measurements
  const measRow=(label,last,type)=>{ const overdue=!last||spDaysSince(last.date)>14;
    return `<div class="metric"><div class="micon">${svg('target')}</div><div class="mlabel">${label}<small class="${overdue?'reminder':''}">${last?'обновлено '+ruDate(last.date)+(overdue?' · пора замерить':''):'нет данных · пора замерить'}</small></div><div class="mval">${last?last.cm+' <small>см</small>':'—'}</div><button class="btn sm" onclick="openMeasure('${type}')">${svg('plus')}</button></div>`; };
  const meas=[['Обхват груди',spLast(sp.chest),'chest'],['Обхват талии',spLast(sp.waist),'waist'],['Обхват живота',spLast(sp.belly),'belly'],['Обхват бёдер',spLast(sp.hips),'hips']];
  const measFresh=meas.filter(m=>m[1]&&spDaysSince(m[1].date)<=14).length;
  html+=cardWrap(sec,'meas','Обхваты и параметры',measFresh+'/4 обновлены за 2 недели',measFresh/4,'var(--a-rose)',
    meas.map(m=>measRow(m[0],m[1],m[2])).join(""));

  // программа фазы — только чтение, ничего заполнять не нужно
  const exs=(sp.config.exercises||[]);
  html+=cardWrap(sec,'prog','Программа тренировок',exs.length?exs.length+' '+plural(exs.length,'день','дня','дней')+' в неделю':'не задана',null,'var(--a-cyan)',
    (exs.length?exs.map(n=>{ const i=n.indexOf(':'); const t=i>0?n.slice(0,i):n, b=i>0?n.slice(i+1).trim():'';
      return `<div style="padding:11px 0; border-bottom:1px solid var(--line)"><div style="font-size:13.5px; font-weight:600; margin-bottom:4px">${esc(t)}</div>${b?`<div style="font-size:12.5px; color:var(--muted); line-height:1.65">${esc(b)}</div>`:''}</div>`; }).join(""):'<p class="emptyc">Список меняется в настройках цикла (карандаш в шапке вкладки).</p>')+
    `<p style="font-size:11.5px; color:var(--muted-2); margin:12px 0 0">${esc(PHASE_A_HOME)}</p>
    <p style="font-size:11.5px; color:var(--muted-2); margin:9px 0 0">${esc(PHASE_A_OUT)}</p>`);

  // steps week chart
  const wsteps=spWeekSteps(sp,selMon), wsTotal=wsteps.reduce((a,x)=>a+x.v,0), goalDays=wsteps.filter(x=>x.v>=GOAL).length;
  html+=cardWrap(sec,'steps','Шаги за неделю',selRange+' · '+goalDays+'/7 дней ≥ цели',goalDays/7,'var(--a-rose)',`
    ${barChart(wsteps,{h:130,goal:GOAL})}
    <div style="display:flex; justify-content:space-between; font-size:12.5px; color:var(--muted); margin-top:8px"><span>Всего: <b style="color:var(--text)">${wsTotal.toLocaleString('ru-RU')}</b> шагов</span><span>Пунктир — цель</span></div>`);

  // КБЖУ week
  const wkcal=spWeekKcal(sp,selMon), macro=spWeekMacroAvg(sp,selMon);
  const dd=spDay(sp,sportDay), corr=spWeekCorridor(sp,selMon);
  const RK=spRange(sp,'kcal'), RP=spRange(sp,'protein'), RF=spRange(sp,'fat'), RC=spRange(sp,'carb');
  const kcalMid=Math.round((RK[0]+RK[1])/2);
  /* Цель — коридор, а не одна цифра. Засчитываем попадание в диапазон
     или отклонение не больше чем на 5%. */
  const macroRow=(label,val,r,color,unit)=>{ const v=val||0, ok=inRange(v,r), max=r[1]*1.35, p=(x)=>Math.min(x/max*100,100);
    const note=!v?'':(ok?'<span style="color:var(--success)">✓</span>':'<span style="color:var(--muted-2)">· '+(v<r[0]?'ниже':'выше')+' коридора</span>');
    return `<div style="margin-bottom:13px"><div style="display:flex; justify-content:space-between; gap:8px; font-size:12.5px; margin-bottom:6px"><span style="color:var(--muted)">${label}</span><span><b>${v?Math.round(v):'—'}</b> <span style="color:var(--muted-2)">/ ${rngTxt(r)} ${unit}</span> ${note}</span></div>
      <div class="corr"><span class="fill" style="width:${p(v)}%; background:${ok?'var(--success)':color}; opacity:${v?'.9':'0'}"></span><span class="band" style="left:${p(r[0])}%; width:${(p(r[1])-p(r[0])).toFixed(1)}%"></span></div></div>`; };
  html+=cardWrap(sec,'kbju','КБЖУ · коридор дня',ruDate(sportDay)+' · в коридоре '+corr.core+'/7',corr.core/7,'var(--a-amber)',`
    ${macroRow('Калории', dd.kcal, RK, 'var(--a-amber)', 'ккал')}
    ${macroRow('Белок', dd.protein, RP, 'var(--a-rose)', 'г')}
    ${macroRow('Жиры', dd.fat, RF, 'var(--video)', 'г')}
    ${macroRow('Углеводы', dd.carbs, RC, 'var(--practice)', 'г')}
    <p style="font-size:11.5px; color:var(--muted-2); margin:2px 0 0">Цифры выше прежних намеренно: глубокий дефицит при лечении тендинопатии работает против физиотерапии — сухожилию нужны белок и энергия. Белок 1,9–2,1 г/кг, и главное не общая цифра, а <b style="color:var(--muted)">30–40 г на приём, 4–5 раз в день</b>. Сладкое 150–200 ккал вносится в углеводы как строка плана, а не как награда за терпение.</p>
    <div class="section-h" style="margin:20px 0 12px"><h2 style="font-size:16px">Динамика за неделю</h2><span class="daystatus">${selRange}${macro?' · '+macro.days+' '+plural(macro.days,'день','дня','дней')+' с данными':''}</span></div>
    ${barChart(wkcal,{h:120,color:'var(--a-amber)',goal:kcalMid})}
    ${macro?`<div class="stats" style="margin-top:12px">
      <div class="stat"><div class="n" style="color:var(--a-amber)">${macro.kcal}</div><div class="l">ккал/день · ${rngTxt(RK)}</div></div>
      <div class="stat"><div class="n">${macro.p} г</div><div class="l">белки · ${rngTxt(RP)}</div></div>
      <div class="stat"><div class="n">${macro.f} г</div><div class="l">жиры · ${rngTxt(RF)}</div></div>
      <div class="stat"><div class="n">${macro.c} г</div><div class="l">углеводы · ${rngTxt(RC)}</div></div>
    </div>`:`<p class="emptyc">Введи КБЖУ в «Действиях дня» — появится статистика.</p>`}
    <p style="font-size:12px; color:var(--muted-2); margin:12px 0 0">Дней в коридоре на этой неделе: <b style="color:var(--text)">${corr.core}</b> из 7 по калориям и белку, из них <b style="color:var(--text)">${corr.all}</b> — по всем четырём.</p>`);

  // weight + chart
  const tr=spWeightTrend(sp); const bmi=spBMI(sp), cat=bmi?bmiCat(bmi):null; const latestW=spLatestWeight(sp);
  const arrow=tr.state==="down"?"↓":tr.state==="up"?"↑":tr.state==="plateau"?"→":"";
  const arrowColor=tr.state==="down"?"var(--success)":tr.state==="plateau"?"var(--muted)":tr.state==="up"?"var(--a-amber)":"var(--muted-2)";
  const fromStart=(sp.config.weightStart!=null&&latestW!=null)?(latestW-sp.config.weightStart):null;
  const wpts=[...sp.weight].sort((a,b)=>a.date<b.date?-1:1).map(x=>({label:ruDate(x.date),y:x.kg}));
  html+=cardWrap(sec,'weight','Вес',sp.weight.length+' '+plural(sp.weight.length,'замер','замера','замеров')+(latestW!=null?' · '+latestW.toFixed(1)+' кг':''),null,'var(--a-rose)',`
    <div class="stats" style="margin-bottom:10px">
      <div class="stat"><div class="n" style="color:var(--a-rose)">${tr.cur!=null?tr.cur.toFixed(1):(latestW!=null?latestW.toFixed(1):'—')}<small style="font-size:13px; color:var(--muted-2)"> кг</small></div><div class="l">${tr.cur!=null?'средний за неделю':'последний вес'}</div></div>
      <div class="stat"><div class="n" style="color:${arrowColor}">${tr.delta!=null?(tr.delta>0?'+':'')+tr.delta.toFixed(1)+' '+arrow:'—'}</div><div class="l">к прошлой неделе</div></div>
      <div class="stat"><div class="n" style="color:${cat?cat[1]:'var(--muted-2)'}">${bmi?bmi.toFixed(1):'—'}</div><div class="l">ИМТ${cat?' · '+cat[0]:''}</div></div>
      <div class="stat"><div class="n">${fromStart!=null?((fromStart>0?'+':'')+fromStart.toFixed(1)):'—'}</div><div class="l">от старта, кг</div></div>
    </div>
    ${wpts.length>1?lineChart(wpts,{h:150}):`<p class="emptyc">Запиши вес хотя бы дважды — построю график.</p>`}
    ${tr.state==="plateau"?`<div class="plateau">Плато — это нормально при наборе мышц. Продолжай действия.</div>`:''}
    <div style="font-size:11.5px; color:var(--muted-2); margin:10px 0 0">ИМТ = вес ${latestW!=null?latestW.toFixed(1):'—'} кг ÷ рост ${(sp.config.height/100).toFixed(2)} м²</div>
    <div style="margin-top:12px"><button class="btn sm primary" onclick="openWeight()">${svg('plus')} Записать вес</button></div>`);

  // energy metric (daily)
  const enPts=spEnergyPoints(sp), enLast=spLastDailyEnergy(sp), enAvg=enPts.length?(enPts.reduce((a,p)=>a+p.y,0)/enPts.length):null;
  html+=cardWrap(sec,'energy','Бодрость по дням',enLast!=null?enLast+'/10 сегодня':'нет данных',null,'var(--success)',`
    ${enPts.length>1?lineChart(enPts,{h:140}):(enPts.length===1?`<p class="emptyc">Есть одна отметка (${enPts[0].y}/10). Отмечай каждый день — покажу динамику.</p>`:`<p class="emptyc">Отмечай бодрость каждый день в «Действиях дня» — увидишь, как она меняется.</p>`)}
    ${enPts.length?`<div style="display:flex; justify-content:space-between; font-size:12.5px; color:var(--muted); margin-top:8px"><span>Отметок: <b style="color:var(--text)">${enPts.length}</b></span><span>Средняя: <b style="color:var(--text)">${enAvg.toFixed(1)}/10</b></span></div>`:''}
    <p style="font-size:12px; color:var(--muted-2); margin:10px 0 0">Ставь оценку 1–10 для выбранного дня в «Действиях дня».</p>`);

  // время, отданное цели за выбранную неделю
  const tParts=spTimeParts(sp,selMon), tTotal=tParts.reduce((a,p)=>a+p.min,0);
  html+=cardWrap(sec,'time','Время на цель',selRange+' · '+fmtMin(tTotal),null,'var(--a-cyan)',`
    <div style="font-family:Sora,sans-serif; font-weight:700; font-size:22px; margin-bottom:14px">${fmtMin(tTotal)}</div>
    ${tParts.length?tParts.map(p=>`<div class="metric"><div class="micon">${svg('clock')}</div><div class="mlabel">${p.label}<small>${esc(p.hint)}</small></div><div class="mval">${fmtMin(p.min)}</div></div>`).join(""):'<p class="emptyc">Отметь действия дня — время посчитается само.</p>'}
    <label for="spCook" style="margin-top:14px">Готовка ПП за неделю, минут</label>
    <input class="stepsin" id="spCook" type="number" min="0" step="5" placeholder="например 240" value="${spCookMin(sp,selMon)||''}" onchange="spSetCook(this.value)">
    <p style="font-size:11.5px; color:var(--muted-2); margin:10px 0 0">Считается по отметкам: зал 1 ч 30 мин · физиотерапия 1 ч 30 мин · ходьба 10 000 шагов ≈ 2 ч (пропорционально пройденному) · домашний блок и зарядка по 10 мин · фото еды и отчёт КБЖУ по 5 мин. Готовка добавляется вручную и входит в общее время недельного отчёта.</p>`);

  // calendar of the whole path
  html+=cardWrap(sec,'cal','Календарь пути',(calAll?'весь путь':WEEKS+' недель')+' · день '+Math.max(0,Math.min(day,TDAYS))+'/'+TDAYS,cyclePct,'var(--a-rose)',`
    <div class="seg" style="margin-bottom:12px"><button class="${calAll?'':'on'}" onclick="event.stopPropagation();calSetAll(0)">Текущий цикл</button><button class="${calAll?'on':''}" onclick="event.stopPropagation();calSetAll(1)">Весь путь</button></div>`+`
    <div class="callegend"><span><i class="cell full"></i>полный</span><span><i class="cell counted"></i>зачтён</span><span><i class="cell partial"></i>частично</span><span><i class="cell miss"></i>день без отметок</span><span><i class="cell future"></i>впереди</span></div>
    <div class="callegend" style="margin-top:-4px"><span><b class="cchip" style="color:var(--a-rose)">Ш</b>шаги</span><span><b class="cchip" style="color:var(--a-amber)">К</b>КБЖУ</span><span><b class="cchip" style="color:var(--success)">Т</b>тренировка</span><span><b class="cchip" style="color:var(--a-cyan)">Д</b>домашний блок</span><span><b class="cchip" style="color:var(--a-violet)">Ф</b>физиотерапия</span></div>
    <div class="callegend" style="margin-top:-4px"><span><i class="cpain" style="background:var(--success)"></i>боль 0–3</span><span><i class="cpain" style="background:var(--a-amber)"></i>боль 4–5</span><span><i class="cpain" style="background:var(--a-rose)"></i>боль выше 5</span></div>
    <p style="font-size:11.5px; color:var(--muted-2); margin:0 0 12px">Метки в ячейке — что именно сделано в этот день. Полоска слева — светофор боли из программы, медицинский ориентир, а не оценка дня. Нажми на день, чтобы открыть его.</p>
    <div class="calrow calhead"><span class="calw"></span><div class="calcells">${WD.map(x=>`<span>${x}</span>`).join("")}</div><span class="calc"></span></div>
    ${calendarRows(sp,calAll)}`);

  // прошлые циклы — только чтение, границы пути; накопительные цифры остаются сквозными
  const cc=spCycleCompliance(sp);
  html+=cardWrap(sec,'arch','Прошлые циклы',sp.archives.length?sp.archives.length+' '+plural(sp.archives.length,'цикл','цикла','циклов'):'пока пусто',null,'var(--a-violet)',`
    ${sp.archives.length?'<div style="margin-bottom:14px">'+sp.archives.map((a,i)=>archiveRow(a,i)).join("")+'</div>':'<p class="emptyc">Здесь появятся закрытые циклы.</p>'}
    <p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Архив — это граница, а не перенос: вес, замеры и все отметки остаются на месте, сквозные цифры не обнуляются. <b style="color:var(--text)">Отмеченные дни прошлых циклов видны в «Календаре пути» — переключи на «Весь путь».</b> Переключатель недель в «Действиях дня» тоже листается назад сколько угодно.</p>
    <p style="font-size:12.5px; color:var(--muted); margin:0 0 14px">${notStarted?'Цикл 2 начинается '+ruDate(sp.config.startDate)+'. До этого отмечай дни как обычно — они лягут в свои даты, и недельный отчёт за текущую неделю соберётся полностью.':'Средний комплаенс текущего цикла: <b style="color:var(--text)">'+Math.round(cc*100)+'%</b>.'}</p>
    <button class="btn sm" onclick="archiveCycle()">${svg('layers')} Закрыть цикл и начать новый</button>`);

  return html;
}
/* Заметка недели убрана из интерфейса 15.08.2026. Данные weekNotes и их слияние
   оставлены: в них лежат старые записи цикла 1. */
function wireSport(){}

/* ---- sport actions ---- */
function setSportDay(ds){ window.sportDay=ds; window.sportWeekMon=mondayOf(ds); renderSport(); }
function sportWeekShift(n){ window.sportWeekMon=dateAddDays(sportWeekMon||mondayOf(todayStr()),n*7); const t=todayStr(); const inWeek=(t>=sportWeekMon&&t<=dateAddDays(sportWeekMon,6)); window.sportDay=inWeek?t:sportWeekMon; renderSport(); }
function spSetEnergy(score){ const sec=activeSport(); const sp=sec.sport; const d=sp.days[sportDay]||(sp.days[sportDay]={}); d.energy=(d.energy===score?0:score); if(!d.energy) delete d.energy; mstamp("sd:"+sportDay+".energy"); save(); renderSport(); }
function spToggle(f){ const sec=activeSport(); const sp=sec.sport; const d=sp.days[sportDay]||(sp.days[sportDay]={}); d[f]=!d[f]; mstamp("sd:"+sportDay+"."+f); save(); renderSport(); }
function spSetSteps(v){ const sec=activeSport(); const sp=sec.sport; const d=sp.days[sportDay]||(sp.days[sportDay]={}); const n=parseInt(v)||0; d.stepsCount=n; d.steps=(n>=spStepGoal(sp)); mstamp("sd:"+sportDay+".stepsCount"); mstamp("sd:"+sportDay+".steps"); save(); renderSport(); }
function spSetKbju(f,v){ const sec=activeSport(); const sp=sec.sport; const d=sp.days[sportDay]||(sp.days[sportDay]={}); d[f]=parseFloat(v)||0; d.report=(d.kcal>0); mstamp("sd:"+sportDay+"."+f); mstamp("sd:"+sportDay+".report"); save(); renderSport(); }
function calSetAll(v){ window.calAll=!!v; renderSport(); }
/* Готовка ПП — единственное время, которое трекер не может вывести из отметок. */
function spSetCook(v){ const sec=activeSport(); const sp=sec.sport; const w=isoWeek(sportWeekMon||mondayOf(todayStr()));
  sp.cook=sp.cook||{}; sp.cardOrder=sp.cardOrder||[]; sp.paused=sp.paused||{}; const n=Math.max(0,parseInt(v)||0); if(n) sp.cook[w]=n; else delete sp.cook[w];
  mstamp("ck:"+w); save(); renderSport(); }
function spSetSleep(v){ const sec=activeSport(); const sp=sec.sport; const d=sp.days[sportDay]||(sp.days[sportDay]={}); const n=Math.max(0,Math.min(12,parseFloat(String(v).replace(",","."))||0)); if(n) d.sleepH=n; else delete d.sleepH; mstamp("sd:"+sportDay+".sleepH"); save(); renderSport(); }
function spWake(step){ const sec=activeSport(); const sp=sec.sport; const d=sp.days[sportDay]||(sp.days[sportDay]={}); const cur=(d.wakeN!=null?d.wakeN:0); d.wakeN=Math.max(0,Math.min(9,cur+step)); mstamp("sd:"+sportDay+".wakeN"); save(); renderSport(); }
/* Повторное нажатие снимает отметку: 0 — это значение «не болит», а не пустота. */
function spSetPain(f,v){ const sec=activeSport(); const sp=sec.sport; const d=sp.days[sportDay]||(sp.days[sportDay]={}); if(d[f]===v) delete d[f]; else d[f]=v; mstamp("sd:"+sportDay+"."+f); save(); renderSport(); }
function phToggle(i){ const sec=activeSport(); const sp=sec.sport; const k=phKey(i);
  if(sp.physio.done[k]){ delete sp.physio.done[k]; delete sp.physio.dates[k]; }
  else { sp.physio.done[k]=1; sp.physio.dates[k]=sportDay||todayStr(); }
  mstamp("fz:"+k); save(); renderSport(); }
function spAddWorkout(){ const sec=activeSport(); const ds=todayStr(); if(sec.sport.workouts.indexOf(ds)<0) sec.sport.workouts.push(ds); mstamp("wo:"+ds); save(); renderSport(); toast("Тренировка засчитана"); }
function openWorkout(){ const sec=activeSport(); if(!sec)return; const sp=sec.sport; const mon=sportWeekMon||mondayOf(todayStr());
  const list=sp.workouts.map((w,i)=>({w,i})).sort((a,b)=>a.w<b.w?1:-1).slice(0,14);
  document.getElementById("modal").innerHTML=`
  <h3>Силовые тренировки</h3><p class="mhint">Отметь день, когда была тренировка — можно задним числом. Здесь же убирается лишняя дата.</p>
  <label for="woDate">Дата тренировки</label><input type="date" id="woDate" value="${sportDay||todayStr()}" max="${todayStr()}">
  <div style="margin:10px 0 4px"><button class="btn primary" onclick="saveWorkout()">${svg('plus')} Добавить</button></div>
  <label>Отмеченные тренировки${sp.workouts.length>14?' · последние 14':''}</label>
  ${list.length?list.map(({w,i})=>`<div class="tlog"><span class="tm" style="color:var(--a-rose)">${ruDate(w)}</span><span class="tn">${mondayOf(w)===mon?'на выбранной неделе':'&nbsp;'}</span><button class="link danger" onclick="spDelWorkout('${w}')" aria-label="Убрать">✕</button></div>`).join(""):`<p class="emptyc">Пока нет отмеченных тренировок.</p>`}
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Закрыть</button></div>`;
  showModal(); }
function saveWorkout(){ const sec=activeSport(); const d=document.getElementById("woDate").value; if(!d){ alert("Выбери дату"); return; }
  if(sec.sport.workouts.indexOf(d)>=0){ toast("Этот день уже отмечен"); return; }
  sec.sport.workouts.push(d); mstamp("wo:"+d); save(); renderSport(); openWorkout(); toast("Тренировка добавлена"); }
function spDelWorkout(ds){ const sec=activeSport(); const sp=sec.sport; const i=sp.workouts.indexOf(ds); if(i<0) return; sp.workouts.splice(i,1); mstamp("wo:"+ds); save(); renderSport(); if(document.getElementById("woDate")) openWorkout(); }
function openWeight(){ document.getElementById("modal").innerHTML=`
  <h3>Записать вес</h3><p class="mhint">Взвешивайся в любой день, главная цифра — среднее за неделю.</p>
  <label for="wDate">Дата</label><input type="date" id="wDate" value="${todayStr()}">
  <label for="wKg">Вес, кг</label><input type="number" step="0.1" id="wKg" placeholder="81.6">
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveWeight()">Сохранить</button></div>`;
  showModal(); setTimeout(()=>{const e=document.getElementById("wKg");if(e)e.focus();},50); }
function saveWeight(){ const sec=activeSport(); const kg=parseFloat(document.getElementById("wKg").value); if(isNaN(kg)){ alert("Укажи вес"); return; }
  const d=document.getElementById("wDate").value||todayStr(); sec.sport.weight.push({date:d,kg}); evMark("wt:"+d); save(); closeModal(); renderSport(); toast("Вес записан"); }
function openMeasure(type){ const label={chest:"Обхват груди",waist:"Обхват талии",belly:"Обхват живота",hips:"Обхват бёдер"}[type]||"Обхват"; document.getElementById("modal").innerHTML=`
  <h3>${label}</h3><p class="mhint">Замеряй раз в 2 недели.</p>
  <label for="mDate">Дата</label><input type="date" id="mDate" value="${todayStr()}">
  <label for="mCm">${label}, см</label><input type="number" step="0.1" id="mCm" placeholder="напр. 84">
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveMeasure('${type}')">Сохранить</button></div>`;
  showModal(); setTimeout(()=>{const e=document.getElementById("mCm");if(e)e.focus();},50); }
function saveMeasure(type){ const sec=activeSport(); const cm=parseFloat(document.getElementById("mCm").value); if(isNaN(cm)){ alert("Укажи значение"); return; }
  const d=document.getElementById("mDate").value||todayStr(); sec.sport[type].push({date:d,cm}); evMark("ms:"+type+"."+d); save(); closeModal(); renderSport(); toast("Записано"); }
function openEnergy(){ const cur=(function(){ const sp=activeSport().sport; const wk=isoWeek(todayStr()); const e=sp.energy.find(x=>x.week===wk); return e?e.score:0; })();
  document.getElementById("modal").innerHTML=`
  <h3>Бодрость</h3><p class="mhint">Оцени уровень бодрости за неделю (1–10).</p>
  <div class="emgrid" id="enGrid" style="grid-template-columns:repeat(5,1fr)">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button class="${n===cur?'on':''}" style="font-family:Sora,sans-serif; font-weight:700; font-size:18px" onclick="saveEnergy(${n})">${n}</button>`).join("")}</div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Закрыть</button></div>`;
  showModal(); }
function saveEnergy(score){ const sec=activeSport(); const sp=sec.sport; const wk=isoWeek(todayStr()); const e=sp.energy.find(x=>x.week===wk); if(e) e.score=score; else sp.energy.push({week:wk,score}); save(); closeModal(); renderSport(); toast("Бодрость записана"); }

/* ---- прошлые циклы ----
   Архив — это снимок и граница, а не перенос данных. Накопительные массивы
   (вес, замеры, бодрость) остаются на месте: на них держится сквозной график,
   и обнулять его нельзя. */
function archiveCycle(){ const sec=activeSport(); if(!sec) return; const sp=sec.sport;
  if(!sp.config.startDate){ alert("Сначала настрой цикл"); return; }
  if(!confirm("Закрыть текущий цикл и начать новый?\nЦикл уйдёт в «Прошлые циклы» как снимок. Вес, замеры и отметки остаются на месте — сквозные цифры продолжатся.")) return;
  const latest=spLatestWeight(sp); const srt=(arr)=>(arr||[]).slice().sort((x,y)=>x.date<y.date?-1:1);
  const cm=(arr)=>{ const a=srt(arr); return a.length?a[a.length-1].cm:null; };
  const n=sp.archives.length+1, aid="cycle"+n;
  sp.archives.push({ id:aid, title:"Цикл "+n, from:sp.config.startDate, to:todayStr(),
    goals:Object.assign({steps:spStepGoal(sp)},sp.config.goals||{}),
    exercises:(sp.config.exercises||[]).slice(),
    summary:{ weeks:spWeeks(sp), compliance:Math.round(spCycleCompliance(sp)*100),
      workouts:spWorkoutsSince(sp,sp.config.startDate), strengthCompliance:Math.round(spStrengthCompliance(sp)*100), bestStreak:spBestStreak(sp) },
    result:{ weightStart:sp.config.weightStart, weightEnd:latest, waist:cm(sp.waist), belly:cm(sp.belly), chest:cm(sp.chest), hips:cm(sp.hips) } });
  mstamp("ar:"+aid); evLog("block_state",{block:"cycle", state:"archived", archive:aid, section:"sport"});
  sp.config.startDate=todayStr(); if(latest!=null) sp.config.weightStart=latest;
  save(); renderSport(); toast("Цикл закрыт, новый начат");
}
function spWorkoutsSince(sp,from){ return (sp.workouts||[]).filter(x=>!from||x>=from).length; }
function archiveRow(a,i){ const s=a.summary||{}, r=a.result||{};
  const from=a.from||a.start, to=a.to||a.end;
  const d=(r.weightStart!=null&&r.weightEnd!=null)?+(r.weightEnd-r.weightStart).toFixed(1):(s.delta!=null?s.delta:null);
  const bits=[]; if(s.compliance!=null) bits.push('комплаенс '+s.compliance+'%');
  if(s.workouts!=null) bits.push(s.workouts+' трен.');
  if(s.bestStreak!=null) bits.push('лучший стрик '+s.bestStreak);
  if(d!=null) bits.push('вес '+dTxt(d,'кг'));
  if(r.waist!=null) bits.push('талия '+r.waist+' см');
  return `<div class="metric"><div class="micon">${svg('layers')}</div>
    <div class="mlabel">${esc(a.title||('Цикл '+(from?ruDate(from):'')+' — '+(to?ruDate(to):'')))}<small>${from?ruDate(from):'?'} — ${to?ruDate(to):'?'}${bits.length?' · '+bits.join(' · '):''}${a.note?'<br>'+esc(a.note):''}</small></div></div>`;
}

/* ---- имена наружу ---- */
Object.assign(window, {
  spTargets, spGoals, spRange, rngTxt, inRange, spDayCore,
  spDayAll, spWeekCorridor, painMax, painZone, spAvgField, spCountField,
  spSleepGood, phKey, phDone, phWeek, phLastDate, spAllPts,
  spDelta, dTxt, spCookMin, spTimeParts, spWeekMin, spEnergyPoints,
  spLastDailyEnergy, activeSport, renderSport, dateAddDays, mondayOf, isoWeek,
  ruDate, spDay, spFull, spCounted, spWeeks, spDaysTotal,
  spStepGoal, spCycleDay, spCycleWeek, spWeekCountedDays, spWeekCompliance, spWeekFullDays,
  spCurrentStreak, spBestStreak, spWorkoutsInWeek, spWorkoutsThisWeek, spStrengthCompliance, spWeekAvg,
  spWeightTrend, spLatestWeight, spBMI, bmiCat, spLast, spDaysSince,
  spLatestEnergy, spWeekSteps, spWeekKcal, spWeekMacroAvg, spEnergyByWeek, spCycleCompliance,
  barChart, lineChart, calRange, calendarRows, sportSetupHTML, openSportSetup,
  saveSportSetup, sportHTML, wireSport, setSportDay, sportWeekShift, spSetEnergy,
  spToggle, spSetSteps, spSetKbju, calSetAll, spSetCook, spSetSleep,
  spWake, spSetPain, phToggle, spAddWorkout, openWorkout, saveWorkout,
  spDelWorkout, openWeight, saveWeight, openMeasure, saveMeasure, openEnergy,
  saveEnergy, archiveCycle, spWorkoutsSince, archiveRow, PAIN_COLOR, PAIN_WORD,
  SP_MIN, SP_WALK, WD,
});
