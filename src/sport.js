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
/* ---- Программа года: фазы и коридоры КБЖУ ----
   Фазы, их даты и названия - PROGRAM (data-model.js). Числа, которые Света правит сама (калории по фазам, белок на кг веса,
   режим «без чисел»), лежат в её данных: sport.prog. Жиры и углеводы считаются от калорий и белка, поэтому отдельно не хранятся.
   У каждого дня свой коридор: фаза и вес берутся по дате дня, смена фазы или нового веса прошлые дни не перекрашивает. */
const PHYS_SET=["короткий комплект (день зала)","плечо, 1-й комплект","короткий комплект (день зала)","ноги, 1-й комплект","короткий комплект (день зала)","плечо, 2-й комплект","ноги, 2-й комплект"];
const GYM_NOTE=["тяжелее","легче","средне"];
const rnd5=x=>Math.ceil(x/5-0.5)*5;
function spGoals(sp){ return (sp.config&&sp.config.goals)||C2_GOALS; }
function rngTxt(r){ return r?r[0]+"–"+r[1]:"не задан"; }
/* «В коридоре» — попал в диапазон или отклонился не больше чем на 5%. */
function inRange(v,r){ if(!v||!r) return false; return v>=r[0]*0.95 && v<=r[1]*1.05; }
function spNoNum(sp){ sp=sp||habSport(); return !!(sp&&sp.prog&&sp.prog.noNumbers); }
function spPhase(ds){ const P=PROGRAM.phases; return P.find(p=>ds>=p.from&&ds<=p.to)||(ds<PROGRAM.start?P[0]:P[P.length-1]); }
function spWeightAt(sp,ds){ const w=(sp.weight||[]).filter(x=>x&&x.date).slice().sort((x,y)=>x.date<y.date?-1:1);
  const upto=w.filter(x=>x.date<=ds), l=upto.length?upto[upto.length-1]:(w.length?w[0]:null); return l?l.kg:(sp.config.weightStart||80); }
function spProteinR(sp,ds){ const w=spWeightAt(sp,ds), c=sp.prog.pcoef; return [rnd5(w*c[0]),rnd5(w*c[1])]; }
function spKcalOf(sp,id){ const k=sp.prog.kcal[id]; return (k&&k[0]&&k[1]&&k[1]>=k[0])?k:null; }
function spKcalR(sp,ds){ return spKcalOf(sp,spPhase(ds).id); }
/* жиры - 25-30% калорий (делим на 9); углеводы - остаток от середины калорий после белка и жиров, коридор ±7%, шаг 5 г */
function spMacroFrom(sp,k,ds){ if(!k) return null; const mid=(k[0]+k[1])/2, pr=spProteinR(sp,ds), pm=(pr[0]+pr[1])/2;
  const fat=[Math.round(.25*mid/9),Math.round(.30*mid/9)], cm=(mid-pm*4-(fat[0]+fat[1])/2*9)/4;
  return {fat:fat, carb:[rnd5(cm*.93),rnd5(cm*1.07)]}; }
function spRange(sp,f,ds){ ds=ds||todayStr();
  if(f==="kcal") return spKcalR(sp,ds); if(f==="protein") return spProteinR(sp,ds);
  const m=spMacroFrom(sp,spKcalR(sp,ds),ds); return m?(f==="fat"?m.fat:m.carb):null; }
function spDayCore(sp,d,ds){ return inRange(d.kcal,spRange(sp,'kcal',ds)) && inRange(d.protein,spRange(sp,'protein',ds)); }
function spDayAll(sp,d,ds){ return spDayCore(sp,d,ds) && inRange(d.fat,spRange(sp,'fat',ds)) && inRange(d.carbs,spRange(sp,'carb',ds)); }
function spWeekCorridor(sp,mon){ let core=0,all=0; for(let i=0;i<7;i++){ const ds=dateAddDays(mon,i), d=spDay(sp,ds); if(spDayCore(sp,d,ds)){ core++; if(spDayAll(sp,d,ds)) all++; } } return {core,all}; }
function spWeekNo(sp,ds){ const st=sp.config.startDate||PROGRAM.start; if(ds<st) return 0;
  return Math.min(spWeeks(sp),Math.floor(Math.round((new Date(mondayOf(ds)+"T00:00:00")-new Date(mondayOf(st)+"T00:00:00"))/86400000)/7)+1); }
/* Сон и боль: поля старых записей. В интерфейс не возвращены, функции читают прежние данные для недельного отчёта. */
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
const SP_MIN={workout:90, reha:15, warmup:10};
const SP_WALK={steps:10000, min:120};
function spCookMin(sp,mon){ const v=(sp.cook||{})[isoWeek(mon)]; return v?(parseInt(v)||0):0; }
function spTimeParts(sp,mon){
  let steps=0,warm=0,reha=0;
  for(let i=0;i<7;i++){ const d=spDay(sp,dateAddDays(mon,i)); steps+=d.stepsCount||0; if(d.warmup)warm++; if(d.reha)reha++; }
  const wo=spWorkoutsInWeek(sp,mon), cook=spCookMin(sp,mon);
  const out=[], add=(label,min,hint)=>{ if(min>0) out.push({label,min,hint}); };
  add('Тренировки в зале',wo*SP_MIN.workout,wo+' × 1 ч 30 мин');
  add('Ходьба',Math.round(steps/SP_WALK.steps*SP_WALK.min),steps.toLocaleString('ru-RU')+' шагов');
  add('Физиотерапия',reha*SP_MIN.reha,reha+' × 15 мин');
  add('Зарядка',warm*SP_MIN.warmup,warm+' × 10 мин');
  add('Готовка ПП',cook,'введено вручную');
  return out; }
function spWeekMin(sp,mon){ return spTimeParts(sp,mon).reduce((a,p)=>a+p.min,0); }
// daily energy history (points for line chart)
function spEnergyPoints(sp){ return Object.keys(sp.days).filter(k=>sp.days[k].energy).sort().map(k=>({label:ruDate(k), y:sp.days[k].energy})); }
function spLastDailyEnergy(sp){ const ks=Object.keys(sp.days).filter(k=>sp.days[k].energy).sort(); return ks.length?sp.days[ks[ks.length-1]].energy:null; }
function activeSport(){ const s=data.sections.find(x=>x.id===data.active); return s&&s.kind==="sport"?s:null; }

/* date helpers */
function dateAddDays(ds,n){ const d=new Date(ds+"T00:00:00"); d.setDate(d.getDate()+n); return ymd(d); }
function mondayOf(ds){ const d=new Date(ds+"T00:00:00"); const off=(d.getDay()+6)%7; d.setDate(d.getDate()-off); return ymd(d); }
function isoWeek(ds){ const date=new Date(ds+"T00:00:00Z"); const dn=(date.getUTCDay()+6)%7; date.setUTCDate(date.getUTCDate()-dn+3); const ft=date.getTime(); date.setUTCMonth(0,1); if(date.getUTCDay()!==4){ date.setUTCMonth(0,1+((4-date.getUTCDay())+7)%7);} const wk=1+Math.ceil((ft-date)/604800000); return new Date(ft).getUTCFullYear()+"-W"+String(wk).padStart(2,"0"); }
function ruDate(ds){ return new Date(ds+"T00:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short"}); }

/* day logic */
function spDay(sp,ds){ return sp.days[ds]||{}; }
/* День зачтён, когда сделаны все четыре: КБЖУ, шаги 10 000, зарядка, физиотерапия (отметка reha). В режиме «без чисел» КБЖУ выпадает.
   Зал в день не входит: это недельная цель. «Полного дня» отдельно нет. */
function spParts(d){ const a=[]; if(!spNoNum()) a.push(!!(d.kcal>0)); a.push(!!d.steps); a.push(!!d.warmup); a.push(!!d.reha); return a; }
function spDoneN(d){ return spParts(d).filter(Boolean).length; }
function spTotalN(){ return spNoNum()?3:4; }
function spCounted(d){ return spDoneN(d)===spTotalN(); }
function spFull(d){ return spCounted(d); }

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
/* Зал считаем по числу раз за неделю (sp.weekWo, метка ww:<понедельник>); у недель до программы года - по старому списку дат. */
function spWorkoutsInWeek(sp,mon){ const w=sp.weekWo||{}; return (mon in w)?w[mon]:sp.workouts.filter(x=>mondayOf(x)===mon).length; }
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

/* ---- карточки «Спорта» (программа года; вид по макету mockups/sport-mock.html) ---- */
const SP_CARDS=["day","str","phy","body","kbzhu","blog","energy","cal","cfg"];
function spCardOrder(sp){ const o=(sp.cardOrder||[]).filter(k=>SP_CARDS.indexOf(k)>=0); SP_CARDS.forEach(k=>{ if(o.indexOf(k)<0) o.push(k); }); return o; }
const spFnum=n=>String(n).replace(".",",");
function spBand(k,title,sub,body,cls){ return `<section class="card" data-sid="${k}"><div class="band ${cls||""}"><span>${title}</span><span class="bsub">${sub||""}</span></div>${body}</section>`; }
function spTiles(arr){ return `<div class="tiles">${arr.map((t,i)=>`<div class="tile t${i+1}"><div class="n${String(t[0]).replace(/<[^>]*>/g,"").length>6?" sm":""}">${t[0]}</div><div class="l">${t[1]}</div></div>`).join("")}</div>`; }
const spFr=(n,m)=>n+"<small>/"+m+"</small>";
function spBarSvg(vals,labels,goal,h){
  const W=900,H=h||130,pad=22,mx=Math.max(goal||0,...vals,1)*1.15,bw=(W-20)/vals.length;
  const bars=vals.map((v,i)=>{ const bh=(v/mx)*(H-pad),x=10+i*bw+7,w=bw-14; return `<rect x="${x}" y="${H-pad-bh}" width="${w}" height="${Math.max(bh,0)}" rx="5" fill="#e9c8ac"/><text x="${x+w/2}" y="${H-6}" text-anchor="middle" font-size="10.5" fill="#9b8573">${labels[i]}</text>`; }).join("");
  const gy=goal?H-pad-(goal/mx)*(H-pad):null;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${bars}${gy!=null?`<line x1="6" x2="${W-6}" y1="${gy}" y2="${gy}" stroke="#b98562" stroke-dasharray="4 4"/>`:""}</svg>`; }
function spLineSvg(pts,h,dec){
  if(pts.length<2) return '<p class="muted" style="font-size:12.5px">Нужно хотя бы две записи, чтобы построить график.</p>';
  const W=900,H=h||140,p=20,ys=pts.map(x=>x.y),mn=Math.min(...ys),mx=Math.max(...ys),rg=(mx-mn)||1;
  const X=i=>p+i*(W-2*p)/(pts.length-1),Y=y=>p+(1-(y-mn)/rg)*(H-2*p-8);
  const path=pts.map((q,i)=>(i?"L":"M")+X(i)+" "+Y(q.y)).join(" ");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%"><path d="${path}" fill="none" stroke="#b98562" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${pts.map((q,i)=>`<circle cx="${X(i)}" cy="${Y(q.y)}" r="3.5" fill="#fffaf4" stroke="#b98562" stroke-width="2"/>`).join("")}<text x="${p}" y="${H-2}" font-size="10.5" fill="#9b8573">${esc(pts[0].label)}</text><text x="${W-p}" y="${H-2}" font-size="10.5" fill="#9b8573" text-anchor="end">${esc(pts[pts.length-1].label)}</text><text x="${X(pts.length-1)}" y="${Y(pts[pts.length-1].y)-9}" font-size="11.5" fill="#6d503b" text-anchor="end" font-weight="600">${pts[pts.length-1].y.toFixed(dec==null?1:dec).replace(".",",")}</text></svg>`; }
function spFmtPost(t){ return String(t||"").split("\n").map(l=>{
  if(/^## /.test(l)||/^(Установка недели|Напоминания|Что лучше съесть|Взвешивание и замеры|Белок|Тарелка и еда)$/.test(l)) return "<h4>"+esc(l.replace(/^## /,""))+"</h4>";
  if(l.charAt(0)==="•") return '<div class="bli">'+esc(l.slice(1).trim())+"</div>";
  return l?"<p>"+esc(l)+"</p>":""; }).join(""); }
function spAvgDay(sp,mon,f,upTo){ let s=0,n=0; for(let i=0;i<7;i++){ const x=dateAddDays(mon,i); if(x>upTo) break; const v=spDay(sp,x)[f]; if(v>0){ s+=v; n++; } } return n?Math.round(s/n):null; }
function spStWord(v,r){ return !v||!r?"":inRange(v,r)?"в коридоре":(v<r[0]?"ниже коридора":"выше коридора"); }

function sportHTML(sec){
  const sp=sec.sport;
  if(!sportDay) window.sportDay=todayStr();
  if(!sportWeekMon) window.sportWeekMon=mondayOf(sportDay);
  return spTopHTML(sp)+`<div class="col" data-sort="sport">${spCardOrder(sp).map(k=>spCard(sp,k)).join("")}</div>`; }
/* четыре плитки сверху: как на страницах других направлений, без рамки и подписей */
function spTopHTML(sp){
  const mon=sportWeekMon, today=todayStr(), goal=spStepGoal(sp), nn=spNoNum(sp);
  let prot=0,steps=0,bright=0,cnt=0;
  for(let i=0;i<7;i++){ const x=dateAddDays(mon,i); if(x>today) break; const y=spDay(sp,x);
    if(inRange(y.protein,spRange(sp,'protein',x))) prot++; if(y.stepsCount>=goal||y.steps) steps++; if((y.energy||0)>=7) bright++; if(spCounted(y)) cnt++; }
  return spTiles([[spFr(spWorkoutsInWeek(sp,mon),3),"тренировок за неделю"],[spFr(steps,7),"дней с шагами "+goal.toLocaleString("ru-RU")],
    [nn?spFr(cnt,7):spFr(prot,7),nn?"дней зачтено":"дней с белком в коридоре"],[spFr(bright,7),"дней с бодростью 7 и выше"]]); }
function spCard(sp,k){
  return k==="day"?spCDay(sp):k==="str"?spCStr(sp):k==="phy"?spCPhy(sp):k==="body"?spCBody(sp):k==="kbzhu"?spCKb(sp):
    k==="blog"?spCBlog(sp):k==="energy"?spCEnergy(sp):k==="cal"?spCCal(sp):k==="cfg"?spCCfg(sp):""; }
function spCDay(sp){
  const mon=sportWeekMon, sd=sportDay, d=spDay(sp,sd), nn=spNoNum(sp), t=spTotalN(), n=spDoneN(d), goal=spStepGoal(sp), wn=spWeekNo(sp,sd), today=todayStr();
  const status=n===t?"День зачтён":n?"Сделано "+n+" из "+t:"Пока ничего не отмечено";
  const days=WD.map((lb,i)=>{ const x=dateAddDays(mon,i), k=spDoneN(spDay(sp,x)), cl=x>today?"fut":k===t?"okd":k?"somed":"";
    return `<button class="dsb ${x===sd?"on":""} ${cl} ${x===today?"istoday":""}" onclick="setSportDay('${x}')"><b>${lb}</b><span>${new Date(x+"T00:00:00").getDate()}</span></button>`; }).join("");
  const ck=(on,label,hint,click)=>`<div class="item"><span class="ck ${on?"d":""}" ${click?`onclick="${click}"`:""}></span><span class="${on?"strike":""}">${label}${hint?` <small class="muted">${hint}</small>`:""}</span></div>`;
  const fld=(l,v,ph,h)=>`<label>${l}<input type="number" min="0" value="${v||""}" placeholder="${ph||""}" onchange="${h}"></label>`;
  const dow=(new Date(sd+"T00:00:00").getDay()+6)%7;
  const fields=(nn?"":fld("Ккал",d.kcal,"","spSetKbju('kcal',this.value)")+fld("Белки, г",d.protein,"","spSetKbju('protein',this.value)")+fld("Жиры, г",d.fat,"","spSetKbju('fat',this.value)")+fld("Углев., г",d.carbs,"","spSetKbju('carbs',this.value)"))+fld("Шаги",d.stepsCount,goal.toLocaleString("ru-RU"),"spSetSteps(this.value)");
  return spBand("day","Действия дня",ruDate(sd)+(wn?" · неделя "+wn+" из "+spWeeks(sp):" · старт "+ruDate(sp.config.startDate))+" · "+status,`
    <div class="wknav"><button aria-label="Предыдущая неделя" onclick="sportWeekShift(-1)">‹</button><span>${ruDate(mon)} – ${ruDate(dateAddDays(mon,6))}</span><button aria-label="Следующая неделя" onclick="sportWeekShift(1)">›</button></div><div class="dsw">${days}</div>
    <div class="cap" style="margin:14px 0 6px">Цифры дня</div>
    <div class="kbju ${nn?"k1":"k5"}">${fields}</div>
    <div class="cap" style="margin:12px 0 2px">Отметки</div>
    ${nn?"":ck(d.kcal>0,"КБЖУ записано","по цифрам выше")}
    ${ck(!!d.steps,"Шаги "+goal.toLocaleString("ru-RU"),"по цифрам выше")}
    ${ck(!!d.warmup,"Зарядка","","spToggle('warmup')")}
    ${ck(!!d.reha,"Физиотерапия 15 минут",PHYS_SET[dow],"spToggle('reha')")}
    <div class="cap" style="margin:12px 0 6px">Бодрость${d.energy?`: <b style="color:#6f8a5a">${d.energy}/10</b>`:""}</div><div class="enrow">${[1,2,3,4,5,6,7,8,9,10].map(k=>`<button class="enbtn ${d.energy===k?"on":""}" onclick="spSetEnergy(${k})">${k}</button>`).join("")}</div>
    <p class="muted" style="font-size:12px;margin-top:10px">День зачтён, когда сделаны все ${t===4?"четыре":"три"}. Часть сделанного — тоже прогресс, день просто остаётся светлым.</p>`); }
function spCStr(sp){
  const mon=sportWeekMon, n=spWorkoutsInWeek(sp,mon), can=mon<=mondayOf(todayStr()), wn=Math.max(1,spWeekNo(sp,mon)), light=PROGRAM.light.indexOf(wn)>=0;
  const slots=[0,1,2].map(i=>{ const on=i<n, lab=(3*(wn-1)+i)%2===0?"A":"B";
    return `<div class="gslot ${on?"on":""} ${can?"":"fut"}" ${can?`onclick="spSetWo('${mon}',${i})"`:""}><b>${i+1}-я · зал ${lab}</b><small>${on?"была":"ещё нет"}${wn>=5?" · "+GYM_NOTE[i]:""}</small></div>`; }).join("");
  return spBand("str","Силовые тренировки",ruDate(mon)+" – "+ruDate(dateAddDays(mon,6))+" · "+Math.min(n,3)+"/3"+(light?" · неделя полегче":""),`<div class="gslots">${slots}</div>
    <p class="muted" style="font-size:12.5px;margin-top:10px">Отмечаем, сколько раз была в зале, а не в какой день: перенесла с пятницы на субботу — всё равно засчитано. Зал идёт по порядку A, B, A, потом B, A, B. Нажми на тренировку, чтобы отметить; нажми ещё раз, чтобы снять.</p>`); }
function spCPhy(sp){
  const mon=sportWeekMon, today=todayStr(); let n=0;
  const cells=WD.map((lb,i)=>{ const x=dateAddDays(mon,i), on=!!spDay(sp,x).reha, fut=x>today; if(on) n++;
    return `<div class="pslot ${on?"on":""} ${fut?"fut":""}" ${fut?"":`onclick="spToggleDay('${x}','reha')"`}><b>${lb}</b><small>${PHYS_SET[i]}</small></div>`; }).join("");
  return spBand("phy","Физиотерапия · 15 минут",ruDate(mon)+" – "+ruDate(dateAddDays(mon,6))+" · "+n+" из 7",`<div class="pslots">${cells}</div><p class="muted" style="font-size:12.5px;margin-top:8px">Дома, каждый день. Нажми на день, чтобы отметить или снять. Сеансы у врача пройдены: 10 из 10.</p>`,"s"); }
function spCBody(sp){
  const w=spLast(sp.weight), h=sp.config.height||177, bmi=w?w.kg/Math.pow(h/100,2):null, wl=spLast(sp.waist), today=todayStr();
  const defs=[["weight","Вес","кг"],["chest","Обхват груди","см"],["waist","Обхват талии","см"],["belly","Обхват живота","см"],["hips","Обхват бёдер","см"]];
  const arr=k=>(k==="weight"?sp.weight:sp[k]).slice().sort((a,b)=>a.date<b.date?-1:1);
  if(window.sportBStat){
    const get=(k)=>arr(k).map(x=>({date:x.date,v:k==="weight"?x.kg:x.cm}));
    const dates=Array.from(new Set([].concat.apply([],defs.map(r=>get(r[0]).map(x=>x.date))))).sort().reverse();
    const cell=(k,ds)=>{ const x=get(k).find(y=>y.date===ds); return x?spFnum(x.v):"·"; };
    const diff=k=>{ const a=get(k); if(a.length<2) return "·"; const c=+(a[a.length-1].v-a[0].v).toFixed(1); return (c>0?"+":c<0?"−":"±")+spFnum(Math.abs(c)); };
    return spBand("body","Статистика замеров","все записи",`<table class="stab"><tr><th>Дата</th>${defs.map(r=>`<th>${r[1].replace("Обхват ","")}</th>`).join("")}</tr>
      ${dates.map(ds=>`<tr><td>${ruDate(ds)} ${ds.slice(0,4)}</td>${defs.map(r=>`<td>${cell(r[0],ds)}</td>`).join("")}</tr>`).join("")}
      <tr class="sum"><td>с первой записи</td>${defs.map(r=>`<td>${diff(r[0])}</td>`).join("")}</tr></table><span class="pill" onclick="spBStat(0)" style="margin-top:12px;display:inline-block">← К показателям</span>`); }
  const rows=defs.map(r=>{ const k=r[0], a=arr(k), last=a.length?a[a.length-1]:null, v=last?(k==="weight"?last.kg:last.cm):null;
    const old=k!=="weight"&&(!last||spDaysSince(last.date)>28);
    return `<div class="mrow"><div><b>${r[1]}</b>${old?'<small class="rem">пора замерить</small>':""}</div><div class="mval">${v!=null?spFnum(v)+" <small>"+r[2]+"</small>":"—"}</div><span class="pill" onclick="${k==="weight"?"openWeight()":"openMeasure('"+k+"')"}">＋</span></div>`; }).join("");
  const pts=arr("weight").map(x=>({label:ruDate(x.date),y:x.kg}));
  return spBand("body",'Параметры тела','<span class="pill" onclick="spBStat(1)" style="margin:-3px 0">Статистика</span>',`<div class="tiles t3"><div class="tile t1"><div class="n">${w?spFnum(w.kg):"—"}</div><div class="l">вес, кг</div></div><div class="tile t2"><div class="n">${bmi?spFnum(bmi.toFixed(1)):"—"}</div><div class="l">ИМТ</div></div><div class="tile t3"><div class="n">${wl?spFnum(wl.cm):"—"}</div><div class="l">талия, см</div></div></div>
    ${rows}<div class="cap" style="margin:16px 0 4px">Прогресс веса по неделям</div>${spLineSvg(pts,140)}`); }
function spCKb(sp){
  const sd=sportDay, mon=sportWeekMon, d=spDay(sp,sd), ph=spPhase(sd), today=todayStr();
  if(spNoNum(sp)) return spBand("kbzhu","КБЖУ","подсчёт выключен",`<p class="muted" style="font-size:13px">Сейчас числа скрыты, день зачитывается по трём действиям. Данные не удалены. Подсчёт можно выключить, если он мешает.</p><span class="pill" onclick="spToggleNN()">Включить подсчёт</span>`);
  const upTo=sd, R={kcal:spRange(sp,"kcal",sd),protein:spRange(sp,"protein",sd),fat:spRange(sp,"fat",sd),carbs:spRange(sp,"carb",sd)};
  const row=(l,k,u)=>{ const r=R[k];
    if(!r) return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:12.5px"><span class="muted">${l}</span><span class="muted">коридор не задан · задай в настройках</span></div></div>`;
    const v=d[k]||0, av=spAvgDay(sp,mon,k,upTo), ok=inRange(v,r), mx=r[1]*1.35, p=x=>Math.min(x/mx*100,100);
    return `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><span class="muted">${l}</span><span><b>${v||"—"}</b> <span class="muted">/ ${r[0]}–${r[1]} ${u}</span> ${v?(ok?'<span style="color:#6f8a5a">✓ в коридоре</span>':'<span class="muted">· '+spStWord(v,r)+"</span>"):""}</span></div><div class="corr"><span class="fill" style="width:${p(v)}%;background:${ok?"#8fa57a":"#d9c6b3"}"></span><span class="cband" style="left:${p(r[0])}%;width:${p(r[1])-p(r[0])}%"></span></div>
      <div class="avgl muted">среднее за неделю: <b>${av==null?"—":av}</b>${av!=null?" · "+spStWord(av,r):""}</div></div>`; };
  const mid=R.kcal?(R.kcal[0]+R.kcal[1])/2:0;
  return spBand("kbzhu","КБЖУ · коридор дня",ruDate(sd)+" · "+ph.name,row("Калории","kcal","ккал")+row("Белок","protein","г")+row("Жиры","fat","г")+row("Углеводы","carbs","г")+spBarSvg(WD.map((_,i)=>spDay(sp,dateAddDays(mon,i)).kcal||0),WD,mid,110)+'<div class="muted" style="font-size:12px;margin-top:4px">Калории оцениваются по неделе, а не по одному дню: пунктир — середина коридора. Подсчёт можно выключить, если он мешает (настройки внизу).</div>'); }
function spCBlog(sp){
  const posts=(sp.blog||[]).slice().sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||(a.date<b.date?1:-1));
  const form=window.sportBlogNew?`<div class="blogform"><input id="blogT" class="di" placeholder="Название, например: Неделя 3 · 23–29 ноября" style="width:100%"><textarea id="blogX" class="di" rows="7" placeholder="Вставь сюда текст недели: установка, напоминания, что съесть" style="width:100%;margin-top:6px"></textarea><div class="inl" style="margin-top:6px"><span class="pill" onclick="spBlogSave()">Сохранить</span><span class="pill" onclick="spBlogNew(0)">Отмена</span></div></div>`:`<span class="pill" onclick="spBlogNew(1)">＋ Запись недели</span>`;
  return spBand("blog","Блог · еда на неделю","новая запись по воскресеньям",`<div class="blogl">${posts.map(p=>`<article class="bpost"><div class="bh"><b>${esc(p.title||"Без названия")}</b><span class="muted">${p.pin?"всегда наверху":ruDate(p.date)+' <span class="del" onclick="spBlogDel(\''+p.id+'\')" title="Удалить">×</span>'}</span></div><div class="btext">${spFmtPost(p.text)}</div></article>`).join("")||'<p class="muted" style="font-size:13px">Записей пока нет.</p>'}</div>${form}`); }
function spCEnergy(sp){
  const pts=[]; for(let i=13;i>=0;i--){ const x=dateAddDays(todayStr(),-i), e=spDay(sp,x).energy; if(e) pts.push({label:ruDate(x),y:e}); }
  const avg=pts.length?pts.reduce((a,p)=>a+p.y,0)/pts.length:null;
  return spBand("energy","Бодрость по дням",pts.length?"в среднем "+avg.toFixed(1).replace(".",",")+"/10":"нет данных",spLineSvg(pts,130,0)+'<div class="muted" style="font-size:12px;margin-top:4px">Оценка 1–10 ставится в «Действиях дня».</div>'); }
function spCCal(sp){
  const sd=sportDay, today=todayStr(), nn=spNoNum(sp), t=spTotalN(), cur=Math.max(1,spWeekNo(sp,today)), from=Math.max(1,cur-5), to=Math.min(spWeeks(sp),cur+1), st0=mondayOf(sp.config.startDate);
  let rows="";
  for(let w=from;w<=to;w++){ const wm=dateAddDays(st0,7*(w-1));
    const cells=WD.map((_,i)=>{ const x=dateAddDays(wm,i), dd=spDay(sp,x), fut=x>today, k=spDoneN(dd), cls=fut?"future":k===t?"counted":k?"partial":"miss";
      const m=[dd.steps?"Ш":"",!nn&&dd.kcal>0?"К":"",dd.warmup?"З":"",dd.reha?"Ф":""].join("");
      return `<span class="cc ${cls} ${x===today?"tod":""} ${x===sd?"sel":""}" onclick="setSportDay('${x}')" title="${ruDate(x)}"><i>${new Date(x+"T00:00:00").getDate()}</i><em>${fut?"":m}</em></span>`; }).join("");
    rows+=`<div class="crow"><span class="cw">${ruDate(wm)}${PROGRAM.light.indexOf(w)>=0?" ·":""}</span>${cells}</div>`; }
  return spBand("cal","Календарь пути","с "+ruDate(sp.config.startDate)+" · неделя "+spWeekNo(sp,today)+" из "+spWeeks(sp),`<div class="clegend"><span><i class="cc counted"></i>день зачтён</span><span><i class="cc partial"></i>сделано часть</span><span><i class="cc miss"></i>без отметок</span><span><i class="cc future"></i>впереди</span></div><div class="clegend"><span><b>Ш</b> шаги</span><span><b>К</b> КБЖУ</span><span><b>З</b> зарядка</span><span><b>Ф</b> физио</span></div><div class="crow chead"><span class="cw"></span>${WD.map(x=>`<span>${x}</span>`).join("")}</div>${rows}<div class="muted" style="font-size:12px;margin-top:8px">Показаны последние недели. Нажми на день — он откроется в «Действиях дня».</div>`); }
function spCCfg(sp){
  const nn=spNoNum(sp), p=sp.prog, today=todayStr(), cur=spPhase(today);
  const rng=r=>r?r[0]+"–"+r[1]:'<span class="muted">посчитается от калорий</span>';
  const rowsP=PROGRAM.phases.map(ph=>{ const k=spKcalOf(sp,ph.id), kk=p.kcal[ph.id]||[0,0], m=spMacroFrom(sp,k,today);
    return `<tr class="${cur.id===ph.id?"curph":""}"><td>${esc(ph.name)}<small class="muted"> ${ruDate(ph.from)} – ${ruDate(ph.to)}</small></td><td class="kin"><input type="number" min="0" step="50" placeholder="от" value="${kk[0]||""}" onchange="spSetKcalPhase('${ph.id}',0,this.value)"> – <input type="number" min="0" step="50" placeholder="до" value="${kk[1]||""}" onchange="spSetKcalPhase('${ph.id}',1,this.value)"></td><td>${rng(m&&m.fat)}</td><td>${rng(m&&m.carb)}</td></tr>`; }).join("");
  const pr=spProteinR(sp,today);
  return spBand("cfg","Настройки программы","правятся прямо здесь",`<div class="item"><span class="ck ${nn?"d":""}" onclick="spToggleNN()"></span><span>Без чисел <small class="muted">скрывает КБЖУ, день зачитывается по трём действиям; данные не удаляются</small></span></div>
    <div class="cap" style="margin:12px 0 4px">Белок на кг веса</div>
    <div class="kin" style="margin-bottom:8px"><input type="number" min="0.5" max="3" step="0.1" value="${p.pcoef[0]}" onchange="spSetCoef(0,this.value)"> – <input type="number" min="0.5" max="3" step="0.1" value="${p.pcoef[1]}" onchange="spSetCoef(1,this.value)"> <small class="muted">г на кг · при весе ${spFnum(spWeightAt(sp,today))} кг это <b>${pr[0]}–${pr[1]} г</b> в день, меняется вместе с весом</small></div>
    <div class="cap" style="margin:12px 0 0">Калории по фазам</div>
    <table class="phtab"><tr><th>Фаза</th><th>Ккал в день (по неделе)</th><th>Жиры, г</th><th>Углеводы, г</th></tr>${rowsP}</table>
    <p class="muted" style="font-size:12px;margin-top:8px">Задай калории фазы — жиры и углеводы подстроятся сами: жиры 25–30% калорий, углеводы — остаток после белка. Белок считается от веса. Прошлые дни не пересчитываются, у каждого дня свой коридор по его фазе. Шаги ${spStepGoal(sp).toLocaleString("ru-RU")} в день, взвешивание по воскресеньям, замеры раз в 4 недели.</p>`); }
/* Заметка недели убрана из интерфейса 15.08.2026. Данные weekNotes и их слияние
   оставлены: в них лежат старые записи цикла 1. */
function wireSport(){}

/* ---- sport actions ---- */
function renderSport(){ render(); }
function spData(){ const sec=activeSport(); return sec?sec.sport:null; }
function setSportDay(ds){ window.sportDay=ds; window.sportWeekMon=mondayOf(ds); renderSport(); }
function sportWeekShift(n){ window.sportWeekMon=dateAddDays(sportWeekMon||mondayOf(todayStr()),n*7); const t=todayStr(); const inWeek=(t>=sportWeekMon&&t<=dateAddDays(sportWeekMon,6)); window.sportDay=inWeek?t:sportWeekMon; renderSport(); }
function spDayObj(sp,ds){ return sp.days[ds]||(sp.days[ds]={}); }
function spSetEnergy(score){ const sp=spData(); const d=spDayObj(sp,sportDay); d.energy=(d.energy===score?0:score); if(!d.energy) delete d.energy; mstamp("sd:"+sportDay+".energy"); save(); renderSport(); }
function spToggleDay(ds,f){ const sp=spData(); const d=spDayObj(sp,ds); d[f]=!d[f]; mstamp("sd:"+ds+"."+f); save(); renderSport(); }
function spToggle(f){ spToggleDay(sportDay,f); }
function spSetSteps(v){ const sp=spData(); const d=spDayObj(sp,sportDay); const n=parseInt(v)||0; d.stepsCount=n; d.steps=(n>=spStepGoal(sp)); mstamp("sd:"+sportDay+".stepsCount"); mstamp("sd:"+sportDay+".steps"); save(); renderSport(); }
function spSetKbju(f,v){ const sp=spData(); const d=spDayObj(sp,sportDay); d[f]=parseFloat(v)||0; d.report=(d.kcal>0); mstamp("sd:"+sportDay+"."+f); mstamp("sd:"+sportDay+".report"); save(); renderSport(); }
/* зал считаем по числу раз за неделю, а не по датам: перенос с пятницы на субботу ничего не меняет */
function spSetWo(mon,i){ const sp=spData(); const n=spWorkoutsInWeek(sp,mon); sp.weekWo=sp.weekWo||{}; sp.weekWo[mon]=(i<n)?i:i+1; mstamp("ww:"+mon); save(); renderSport(); }
function spBStat(on){ window.sportBStat=!!on; renderSport(); }
function spToggleNN(){ const sp=spData(); sp.prog.noNumbers=!sp.prog.noNumbers; mstamp("cf:prog"); save(); renderSport(); }
function spSetKcalPhase(id,idx,v){ const sp=spData(); const k=(sp.prog.kcal[id]||[0,0]).slice(); k[idx]=Math.max(0,parseInt(v)||0);
  if(!k[0]&&!k[1]) delete sp.prog.kcal[id]; else sp.prog.kcal[id]=k; mstamp("cf:prog"); save(); renderSport(); }
function spSetCoef(idx,v){ const sp=spData(); const n=parseFloat(String(v).replace(",",".")); if(!(n>=0.5&&n<=3)){ renderSport(); return; }
  sp.prog.pcoef[idx]=n; mstamp("cf:prog"); save(); renderSport(); }
function spBlogNew(on){ window.sportBlogNew=!!on; renderSport(); }
function spBlogSave(){ const sp=spData(); const t=document.getElementById("blogT").value.trim(), x=document.getElementById("blogX").value.trim();
  if(t||x){ const id=uid(); sp.blog.push({id:id,date:todayStr(),title:t,text:x}); mstamp("bl:"+id); }
  window.sportBlogNew=false; save(); renderSport(); }
function spBlogDel(id){ const sp=spData(); if(!confirm("Удалить запись?")) return; if(sp.blogDel.indexOf(id)<0) sp.blogDel.push(id);
  sp.blog=sp.blog.filter(x=>x.id!==id); mstamp("bl:"+id); save(); renderSport(); }
/* Готовка ПП — единственное время, которое трекер не может вывести из отметок. */
function spSetCook(v){ const sec=activeSport(); const sp=sec.sport; const w=isoWeek(sportWeekMon||mondayOf(todayStr()));
  sp.cook=sp.cook||{}; sp.cardOrder=sp.cardOrder||[]; sp.paused=sp.paused||{}; const n=Math.max(0,parseInt(v)||0); if(n) sp.cook[w]=n; else delete sp.cook[w];
  mstamp("ck:"+w); save(); renderSport(); }
function openWeight(){ document.getElementById("modal").innerHTML=`
  <h3>Записать вес</h3><p class="mhint">Взвешивание — по воскресеньям, в одно и то же время.</p>
  <label for="wDate">Дата</label><input type="date" id="wDate" value="${todayStr()}">
  <label for="wKg">Вес, кг</label><input type="number" step="0.1" id="wKg" placeholder="79.3">
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveWeight()">Сохранить</button></div>`;
  showModal(); setTimeout(()=>{const e=document.getElementById("wKg");if(e)e.focus();},50); }
function saveWeight(){ const sec=activeSport(); const kg=parseFloat(document.getElementById("wKg").value); if(isNaN(kg)){ alert("Укажи вес"); return; }
  const d=document.getElementById("wDate").value||todayStr(); sec.sport.weight.push({date:d,kg}); evMark("wt:"+d); save(); closeModal(); renderSport(); toast("Вес записан"); }
function openMeasure(type){ const label={chest:"Обхват груди",waist:"Обхват талии",belly:"Обхват живота",hips:"Обхват бёдер"}[type]||"Обхват"; document.getElementById("modal").innerHTML=`
  <h3>${label}</h3><p class="mhint">Замеры — раз в 4 недели.</p>
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
  barChart, lineChart, calRange, calendarRows, sportHTML, wireSport, setSportDay, sportWeekShift, spSetEnergy,
  spToggle, spToggleDay, spSetSteps, spSetKbju, spSetCook,
  openWeight, saveWeight, openMeasure, saveMeasure, openEnergy,
  saveEnergy, archiveCycle, spWorkoutsSince, archiveRow, PAIN_COLOR, PAIN_WORD,
  SP_MIN, SP_WALK, WD,
  PHYS_SET, GYM_NOTE, rnd5, spNoNum, spPhase, spWeightAt, spProteinR, spKcalOf, spKcalR, spMacroFrom, spWeekNo,
  spParts, spDoneN, spTotalN, SP_CARDS, spCardOrder, spTopHTML, spCard, spData,
  spSetWo, spBStat, spToggleNN, spSetKcalPhase, spSetCoef, spBlogNew, spBlogSave, spBlogDel,
});
