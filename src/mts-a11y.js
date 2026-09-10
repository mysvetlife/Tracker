/* mts-a11y.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= МТС: Практики цифровой доступности ================= */
const MTS_PROGRAM=[
 {t:"О программе", v:[["О программе «Практики цифровой доступности»","1:56"]]},
 {t:"Основы доступности", v:[["Цифровая доступность. Что это и зачем","6:56"],["Принципы цифровой доступности","8:56"],["Вспомогательные технологии","11:27"]]},
 {t:"Доступность в дизайне", v:[["Цвет и контраст","7:39"],["Типографика","4:51"],["Контент","10:21"],["Ссылки и кнопки","7:11"],["Формы","4:44"],["Документирование","4:45"]]},
 {t:"Доступность в веб-разработке", v:[["Контент","9:29"],["Интерфейс","6:06"],["Навигация","7:17"]]},
 {t:"Доступность в iOS-разработке", v:[["Интерфейс","9:43"],["Контент","6:07"],["Навигация","7:41"]]},
 {t:"Доступность в Android-разработке", v:[["Интерфейс","7:44"],["Контент","6:37"],["Навигация","5:57"]]},
 {t:"Тестирование доступности", v:[["Автоматизированное тестирование","7:31"],["Ручное тестирование","6:33"],["Юзабилити","8:20"]]}
];
function mtsKey(bi,vi){ return "p"+bi+"v"+vi; }
function mtsIsDone(v,bi,vi){ return !!v.done[mtsKey(bi,vi)]; }
function mtsBlockDone(v,bi){ return MTS_PROGRAM[bi].v.reduce((a,_,vi)=>a+(mtsIsDone(v,bi,vi)?1:0),0); }
function mtsTotal(){ return MTS_PROGRAM.reduce((a,b)=>a+b.v.length,0); }
function mtsAllDone(v){ v=v||{done:{}}; return MTS_PROGRAM.reduce((a,b,bi)=>a+mtsBlockDone(v,bi),0); }
function mtsBlocksComplete(v){ return MTS_PROGRAM.filter((b,bi)=>mtsBlockDone(v,bi)===b.v.length).length; }
function mtsSecs(s){ const p=String(s).split(":").map(Number); return p.length>2?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]; }
function mtsBlockMin(bi){ return Math.round(MTS_PROGRAM[bi].v.reduce((a,x)=>a+mtsSecs(x[1]),0)/60); }
function mtsLeftMin(v){ let s=0; MTS_PROGRAM.forEach((b,bi)=>b.v.forEach((x,vi)=>{ if(!mtsIsDone(v,bi,vi)) s+=mtsSecs(x[1]); })); return Math.round(s/60); }
function mtsWeek(v,mon){ let n=0; MTS_PROGRAM.forEach((b,bi)=>b.v.forEach((_,vi)=>{ const k=mtsKey(bi,vi); if(v.done[k]&&tsInWeek("mt:"+k,mon))n++; })); return n; }
function mtsCardHTML(sec){
  const c=sec.career;
  const v=c.mts; const done=mtsAllDone(v), total=mtsTotal(), pct=total?done/total:0; const bc=mtsBlocksComplete(v);
  let html=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Практики цифровой доступности от МТС: ${total} коротких видео. Осталось посмотреть — ${fmtMin(mtsLeftMin(v))}.</p>`;
  MTS_PROGRAM.forEach((b,bi)=>{
    const bd=mtsBlockDone(v,bi), tot=b.v.length, p2=tot?bd/tot:0, full=bd===tot;
    const open=(bi in v.exp)?v.exp[bi]:(bi===0);
    const vids=b.v.map((x,vi)=>{ const dn=mtsIsDone(v,bi,vi); return `<div class="step ${dn?'done':''}" onclick="mtsToggle(${bi},${vi})"><span class="tic video" style="background:rgba(169,134,255,.16); color:var(--a-violet)">${svg('play')}</span><span class="sname">${esc(x[0])} <span style="color:var(--muted-2); font-size:12px">· ${x[1]}</span></span><span class="cbox">${svg('check')}</span></div>`; }).join("");
    html+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="mtsToggleBlock(${bi},${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(p2,38,5,full?'var(--success)':'var(--a-violet)',false)}</span>
        <span class="ltitle"><span class="tt">${esc(b.t)}</span><span class="mm">${bd} из ${tot} · ${mtsBlockMin(bi)} мин</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(p2*100)}%</span>
      </div>
      <div class="lbody">
        <div class="lbtns"><button class="link" onclick="event.stopPropagation();mtsMarkBlock(${bi},true)">${svg('check')} Отметить весь блок</button><button class="link" onclick="event.stopPropagation();mtsMarkBlock(${bi},false)">Снять отметки</button></div>
        ${vids}
      </div></div>`;
  });
  return cardWrap(sec,'mts','Курс МТС · практики доступности',done+'/'+total+' видео · '+bc+'/'+MTS_PROGRAM.length+' блоков',pct,'var(--a-violet)',tlogRowHTML('career','mt')+html);
}
function mtsToggle(bi,vi){ const v=activeCareer().career.mts; const k=mtsKey(bi,vi); if(v.done[k]) delete v.done[k]; else v.done[k]=1; mstamp("mt:"+k); save(); renderCareer(); }
function mtsToggleBlock(bi,cur){ const v=activeCareer().career.mts; v.exp[bi]=!cur; save(); renderCareer(); }
function mtsMarkBlock(bi,val){ const v=activeCareer().career.mts; MTS_PROGRAM[bi].v.forEach((_,vi)=>{ const k=mtsKey(bi,vi); if(val) v.done[k]=1; else delete v.done[k]; mstamp("mt:"+k); }); save(); renderCareer(); }

/* ---- имена наружу ---- */
Object.assign(window, {
  mtsKey, mtsIsDone, mtsBlockDone, mtsTotal, mtsAllDone, mtsBlocksComplete,
  mtsSecs, mtsBlockMin, mtsLeftMin, mtsWeek, mtsCardHTML, mtsToggle,
  mtsToggleBlock, mtsMarkBlock, MTS_PROGRAM,
});
