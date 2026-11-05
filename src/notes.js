/* notes.js
   Заметки-«входящие»: быстро записать мысль, не выбирая места, и потом переложить в направление.
   data.notes=[{id,text,ts}], data.notesDel=[id] (тумбстоны удалённых и перенесённых).
   Метка синхронизации: nt:<id> - текст заметки. Слияние ничего не теряет: заметки объединяются по id,
   текст при расхождении берётся у более свежей правки. */

function ensureNotes(d){ d.notes=d.notes||[]; d.notesDel=d.notesDel||[];
  d.notes.forEach(n=>{ n.id=n.id||uid(); n.text=String(n.text||""); n.ts=n.ts||Date.now(); });
  return d; }
function mergeNotes(M,B,aM,bM){ ensureNotes(M); const bn=B.notes||[], bd=B.notesDel||[];
  bd.forEach(id=>{ if(M.notesDel.indexOf(id)<0) M.notesDel.push(id); });
  bn.forEach(b=>{ const m=M.notes.find(x=>x.id===b.id);
    if(!m){ M.notes.push(JSON.parse(JSON.stringify(b))); return; }
    const p="nt:"+b.id; if((bM[p]||0)>(aM[p]||0)) m.text=b.text; });
  M.notes=M.notes.filter(n=>M.notesDel.indexOf(n.id)<0)
    .sort((x,y)=>(y.ts||0)-(x.ts||0)); }

function ntFind(id){ return (data.notes||[]).find(n=>n.id===id); }
function ntWhen(ts){ const d=new Date(ts); return d.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})+", "+d.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}); }

/* ---------- создание ---------- */
function openNoteModal(){
  document.getElementById("modal").innerHTML=`<h3>Новая заметка</h3>
    <p class="mhint">Запиши мысль сразу, как есть. Она попадёт во «Входящие», оттуда её можно переложить в направление.</p>
    <textarea class="note-area" id="ntNew" rows="5" style="margin-top:0" placeholder="Что хочешь не потерять?" onkeydown="if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();ntSave()}"></textarea>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="ntSave()">Сохранить</button></div>`;
  showModal(); setTimeout(()=>{ const e=document.getElementById("ntNew"); if(e) e.focus(); },50); }
function ntSave(){ const el=document.getElementById("ntNew"), text=el?el.value.trim():""; if(!text){ if(el) el.focus(); return; }
  ensureNotes(data); const n={id:uid(),text:text,ts:Date.now()}; data.notes.unshift(n); mstamp("nt:"+n.id);
  closeModal(); toast("Заметка во «Входящих»"); render(); }

/* ---------- правка и удаление ---------- */
function ntEdit(id,el){ const n=ntFind(id); if(!n) return; n.text=el.value; mstamp("nt:"+id); save(); }
function ntRemove(id){ ensureNotes(data); if(data.notesDel.indexOf(id)<0) data.notesDel.push(id);
  data.notes=data.notes.filter(n=>n.id!==id); }
function ntDel(id){ const n=ntFind(id); if(!n) return; if(n.text.trim()&&!confirm("Удалить заметку?")) return; ntRemove(id); render(); }

/* ---------- «Переместить в…» ----------
   Заметка становится страницей задачи в выбранном этапе направления: первая строка - название, весь текст - во вкладке «Заметки». */
function openNoteMove(id){ const n=ntFind(id); if(!n) return;
  const projs=data.sections.filter(s=>s.kind==="project");
  if(!projs.length){ toast("Пока нет направления с планом, куда можно переложить"); return; }
  window.ntMoving=id;
  document.getElementById("modal").innerHTML=`<h3>Переместить в…</h3>
    <p class="mhint">Заметка станет страницей задачи в выбранном этапе, а её текст окажется во вкладке «Заметки».</p>
    <label for="ntDir">Направление</label><select id="ntDir" onchange="ntFillStages()">${projs.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select>
    <label for="ntStage">Этап</label><select id="ntStage"></select>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="ntMoveGo()">Переместить</button></div>`;
  ntFillStages(); showModal(); }
function ntFillStages(){ const sec=pjSec(document.getElementById("ntDir").value), box=document.getElementById("ntStage"); if(!sec||!box) return;
  const st=sec.project.stages;
  box.innerHTML=st.length?st.map(x=>`<option value="${x.id}">${esc(x.name||"Без названия")}</option>`).join(""):`<option value="">Новый этап «Заметки»</option>`; }
function ntMoveGo(){ const n=ntFind(window.ntMoving); const sec=pjSec(document.getElementById("ntDir").value); if(!n||!sec) return;
  const p=sec.project; let st=p.stages.find(x=>x.id===document.getElementById("ntStage").value);
  if(!st){ st={id:uid(),name:"Заметки",tasks:[]}; p.stages.push(st); mstamp("pj:"+st.id); }
  const lines=n.text.split("\n").map(s=>s.trim()).filter(Boolean), first=lines[0]||"Заметка";
  const t=ensureTask({id:uid(),name:first.slice(0,80),status:"n"});
  if(lines.length>1||first.length>80){ t.blocks.notes=lines.map(s=>({id:uid(),type:"p",text:s})); mstamp("pb:"+t.id+".notes"); }
  st.tasks.push(t); mstamp("pj:"+t.id); p.exp[st.id]=1;
  ntRemove(n.id); window.ntMoving=null; data.active=sec.id; window.pjTask=null; window.pjTab="plan";
  closeModal(); toast("Перенесено в «"+sec.name+"»"); render(); }

/* ---------- страница «Входящие» ---------- */
function inboxHTML(){ ensureNotes(data);
  const head=`<div class="card nt-head"><div><h2 class="sec-title">Входящие</h2><p class="sec-sub">Быстрые записи. Когда будет время, переложи их в направление.</p></div>
    <button class="btn primary" onclick="openNoteModal()">${svg('plus')} Создать заметку</button></div>`;
  if(!data.notes.length) return head+`<div class="card pj-empty"><p style="color:var(--muted)">Заметок пока нет. Нажми «Создать заметку», чтобы записать первую мысль.</p></div>`;
  return head+data.notes.map(n=>`<div class="card nt-item"><div class="nt-meta">${ntWhen(n.ts)}</div>
    <textarea class="note-area nt-text" rows="${Math.min(12,n.text.split("\n").length+1)}" aria-label="Текст заметки" oninput="ntEdit('${n.id}',this)">${esc(n.text)}</textarea>
    <div class="row-actions"><button class="link" onclick="openNoteMove('${n.id}')">${svg('chev')} Переместить в…</button><button class="link danger" onclick="ntDel('${n.id}')">${svg('trash')} Удалить</button></div></div>`).join(""); }

Object.assign(window, {
  ensureNotes, mergeNotes, ntFind, openNoteModal, ntSave, ntEdit, ntRemove, ntDel,
  openNoteMove, ntFillStages, ntMoveGo, inboxHTML,
});
