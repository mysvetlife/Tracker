/* habits.js
   Привычки на главной (таблица как в макете: Привычка, Цель, Прогресс, Пн-Вс) и «План на сегодня».
   data.habits=[{id,name,sched:[7 из 0|1],src,days:{дата:1}}], data.habitsDel=[id].
   src - общий источник со спортом: "warmup" зарядка, "steps" 10 000 шагов, "reha" мини-физио. У таких привычек отметка
   живёт в sport.days[дата][поле] (та же, что в «Действиях дня»), своих days нет.
   Метки синхронизации: hbc:<id> название и дни недели, hb:<id>.<дата> отметка, sd:<дата>.<поле> - как в спорте.
   data.today=[{id,text,done}], data.todayDel=[id]: метки tt:<id> текст, td:<id> галочка. */

const HAB_SEED=[["hb-warm","Зарядка с планкой",[1,1,1,1,1,1,1],"warmup"],["hb-steps","10 000 шагов",[1,1,1,1,1,1,1],"steps"],
  ["hb-physio","Мини-физио",[1,1,1,1,1,1,1],"reha"],["hb-care","Душ, крем, уход",[1,1,1,1,1,1,1],""],
  ["hb-book","Книга на ночь",[1,1,1,1,1,1,1],""],["hb-mind","Практика осознанности",[1,1,1,1,1,0,0],""]];
const DOW=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
function ensureHabits(d){
  if(!d.habits) d.habits=HAB_SEED.map(x=>({id:x[0],name:x[1],sched:x[2].slice(),src:x[3],days:{}}));
  d.habitsDel=d.habitsDel||[]; d.today=d.today||[]; d.todayDel=d.todayDel||[];
  d.habits.forEach(h=>{ h.id=h.id||uid(); h.name=h.name||""; h.sched=(h.sched||[1,1,1,1,1,1,1]).slice(0,7).map(x=>x?1:0); while(h.sched.length<7) h.sched.push(1); h.src=h.src||""; h.days=h.days||{}; });
  d.today.forEach(t=>{ t.id=t.id||uid(); t.text=String(t.text||""); t.done=!!t.done; });
  return d; }
function mergeHabits(M,B,aM,bM){ ensureHabits(M); const cl=x=>JSON.parse(JSON.stringify(x));
  (B.habitsDel||[]).forEach(id=>{ if(M.habitsDel.indexOf(id)<0) M.habitsDel.push(id); });
  (B.habits||[]).forEach(b=>{ const m=M.habits.find(x=>x.id===b.id); if(!m){ M.habits.push(cl(b)); return; }
    const p="hbc:"+b.id; if((bM[p]||0)>(aM[p]||0)){ m.name=b.name; m.sched=(b.sched||m.sched).slice(); }
    m.days=mmT(m.days,b.days,"hb:"+b.id+".",aM,bM); });
  M.habits=M.habits.filter(h=>M.habitsDel.indexOf(h.id)<0);
  (B.todayDel||[]).forEach(id=>{ if(M.todayDel.indexOf(id)<0) M.todayDel.push(id); });
  (B.today||[]).forEach(b=>{ const m=M.today.find(x=>x.id===b.id); if(!m){ M.today.push(cl(b)); return; }
    if((bM["tt:"+b.id]||0)>(aM["tt:"+b.id]||0)) m.text=b.text; if((bM["td:"+b.id]||0)>(aM["td:"+b.id]||0)) m.done=!!b.done; });
  M.today=M.today.filter(t=>M.todayDel.indexOf(t.id)<0); }

function habSport(){ const s=data.sections.find(x=>x.kind==="sport"); return s&&s.sport?s.sport:null; }
function habDone(h,ds){ if(h.src){ const sp=habSport(); return !!(sp&&sp.days[ds]&&sp.days[ds][h.src]); } return !!h.days[ds]; }
function habToggle(id,ds){ const h=data.habits.find(x=>x.id===id); if(!h) return;
  if(h.src){ const sp=habSport(); if(!sp) return; const d=sp.days[ds]||(sp.days[ds]={}); d[h.src]=!d[h.src]; mstamp("sd:"+ds+"."+h.src); }
  else { if(h.days[ds]) delete h.days[ds]; else h.days[ds]=1; mstamp("hb:"+id+"."+ds); }
  render(); }
function habWeek(h,ws){ const days=[0,1,2,3,4,5,6].map(i=>dateAddDays(ws,i)); const goal=h.sched.filter(Boolean).length;
  const dn=days.reduce((a,ds,i)=>a+(h.sched[i]&&habDone(h,ds)?1:0),0); return {goal:goal,done:dn,pct:goal?Math.round(dn/goal*100):0}; }
function habitsTable(ws){
  const rows=data.habits.map(h=>{ const w=habWeek(h,ws);
    const cells=h.sched.map((s,i)=>{ const ds=dateAddDays(ws,i);
      return s?`<td><span class="ck ${habDone(h,ds)?'d':''}" onclick="habToggle('${h.id}','${ds}')"></span></td>`:`<td><span class="ck off" title="В этот день привычки нет"></span></td>`; }).join("");
    return `<tr><td><span class="ed" contenteditable="plaintext-only" data-ph="Привычка" onblur="habRename('${h.id}',this)" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">${esc(h.name)}</span> <span class="del" onclick="habDel('${h.id}')" title="Удалить привычку">×</span></td>
      <td class="muted"><span class="goalch" onclick="openHabDays('${h.id}')" title="Выбрать дни недели">${w.goal} ${plural(w.goal,'день','дня','дней')}</span></td>
      <td><div class="pg"><span>${w.pct}%</span><div class="bar"><i style="width:${w.pct}%"></i></div></div></td>${cells}</tr>`; }).join("");
  return `<table class="hab"><colgroup><col><col style="width:72px"><col style="width:128px">${'<col style="width:33px">'.repeat(7)}</colgroup><tr><th>Привычка</th><th>Цель</th><th>Прогресс</th>${DOW.map(d=>`<th>${d}</th>`).join("")}</tr>${rows}</table>`; }
function habRename(id,el){ const h=data.habits.find(x=>x.id===id); if(!h) return; const v=el.innerText.replace(/\s*\n\s*/g," ").trim();
  if(!v){ el.textContent=h.name; return; } if(v===h.name) return; h.name=v; mstamp("hbc:"+id); save(); }
function habAdd(){ const name=prompt("Название привычки:"); if(!name||!name.trim()) return;
  const h={id:uid(),name:name.trim(),sched:[1,1,1,1,1,1,1],src:"",days:{}}; data.habits.push(h); mstamp("hbc:"+h.id); render(); }
function habDel(id){ const h=data.habits.find(x=>x.id===id); if(!h||!confirm("Удалить привычку «"+h.name+"»? Отметки в ней тоже удалятся.")) return;
  if(data.habitsDel.indexOf(id)<0) data.habitsDel.push(id); data.habits=data.habits.filter(x=>x.id!==id); render(); }
function openHabDays(id){ const h=data.habits.find(x=>x.id===id); if(!h) return; window.habEditing=id;
  document.getElementById("modal").innerHTML=`<h3>Дни привычки</h3><p class="mhint">«${esc(h.name)}»: в какие дни недели она есть. В остальные дни клетка серая.</p>
    <div class="daychips">${DOW.map((d,i)=>`<span class="dchip ${h.sched[i]?'on':''}" onclick="habDayFlip(${i},this)">${d}</span>`).join("")}</div>
    <div class="modal-actions"><button class="btn primary" onclick="closeModal();render()">Готово</button></div>`; showModal(); }
function habDayFlip(i,el){ const h=data.habits.find(x=>x.id===window.habEditing); if(!h) return;
  h.sched[i]=h.sched[i]?0:1; if(!h.sched.some(Boolean)) h.sched[i]=1; el.classList.toggle("on",!!h.sched[i]); mstamp("hbc:"+h.id); save(); }

/* ---------- план на сегодня ---------- */
function todayHTML(){ ensureHabits(data);
  const rows=data.today.map(t=>`<div class="bl"><span class="ck ${t.done?'d':''}" onclick="tdToggle('${t.id}')"></span><span class="ed ${t.done?'strike':''}" contenteditable="plaintext-only" data-ph="Пункт" onblur="tdRename('${t.id}',this)" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">${esc(t.text)}</span><span class="del" onclick="tdDel('${t.id}')" title="Удалить">×</span></div>`).join("");
  return rows+`<div class="addrow" onclick="tdAdd()">＋ Пункт</div>`; }
function tdAdd(){ const t={id:uid(),text:"",done:false}; data.today.push(t); mstamp("tt:"+t.id); render();
  setTimeout(()=>{ const els=document.querySelectorAll('[data-sid="w-today"] .ed'); const e=els[els.length-1]; if(e) e.focus(); },30); }
function tdToggle(id){ const t=data.today.find(x=>x.id===id); if(!t) return; t.done=!t.done; mstamp("td:"+id); render(); }
function tdRename(id,el){ const t=data.today.find(x=>x.id===id); if(!t) return; const v=el.innerText.replace(/\s*\n\s*/g," ").trim();
  if(!v){ tdDel(id,true); return; } if(v===t.text) return; t.text=v; mstamp("tt:"+id); save(); }
function tdDel(id,quiet){ if(data.todayDel.indexOf(id)<0) data.todayDel.push(id); data.today=data.today.filter(x=>x.id!==id); if(!quiet||true) render(); }

Object.assign(window,{ HAB_SEED, DOW, ensureHabits, mergeHabits, habDone, habToggle, habWeek, habitsTable, habRename, habAdd, habDel, openHabDays, habDayFlip,
  todayHTML, tdAdd, tdToggle, tdRename, tdDel });
