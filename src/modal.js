/* modal.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Section modal ================= */
const COLORS=["var(--a-green)","var(--a-blue)","var(--a-violet)","var(--a-rose)","var(--a-amber)","var(--a-cyan)"];
const ICONS=["star","dumbbell","book","lang","target","clock","sparkle","layers"];
function openSectionModal(id){
  window.editingSection=id?findSec(id):null;
  const s=editingSection||{name:"",sub:"",color:"var(--a-blue)",icon:"star"};
  window.pickColor=s.color; window.pickIcon=s.icon||"star";
  const sw=COLORS.map(c=>`<div class="swatch ${c===pickColor?'sel':''}" style="background:${c}" data-c="${c}" onclick="selColor('${c}')"></div>`).join("");
  const ic=ICONS.map(n=>`<div class="swatch ${n===pickIcon?'sel':''}" style="background:var(--surface-3);display:flex;align-items:center;justify-content:center;color:var(--text)" data-i="${n}" onclick="selIcon('${n}')">${svg(n)}</div>`).join("");
  document.getElementById("modal").innerHTML=`
    <h3>${id?'Редактировать раздел':'Новый раздел · шаг 1 из 2'}</h3>
    <p class="mhint">${id?'Название, цвет и иконка.':'Сначала название и вид. После «Создать раздел» сразу откроется шаг 2 — выбор первого блока: задачи, привычки, счётчики или курс.'}</p>
    <label for="mName">Название</label><input id="mName" type="text" value="${esc(s.name)}" placeholder="Например, Спорт">
    <label for="mSub">Подпись</label><input id="mSub" type="text" value="${esc(s.sub||'')}" placeholder="Короткое описание">
    <label>Цвет</label><div class="swatches" id="swColor">${sw}</div>
    <label>Иконка</label><div class="swatches" id="swIcon">${ic}</div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveSection()">${id?'Сохранить':'Создать раздел'}</button></div>`;
  showModal(); setTimeout(()=>{const e=document.getElementById("mName");if(e)e.focus();},50);
}
function selColor(c){ window.pickColor=c; document.querySelectorAll("#swColor .swatch").forEach(e=>e.classList.toggle("sel",e.dataset.c===c)); }
function selIcon(n){ window.pickIcon=n; document.querySelectorAll("#swIcon .swatch").forEach(e=>e.classList.toggle("sel",e.dataset.i===n)); }
function saveSection(){ const name=document.getElementById("mName").value.trim(); if(!name){ alert("Введите название"); return; }
  const sub=document.getElementById("mSub").value.trim();
  if(editingSection){ editingSection.name=name; editingSection.sub=sub; editingSection.color=pickColor; editingSection.icon=pickIcon;
    if(editingSection.kind==="custom") mstamp("cs:"+editingSection.id); }
  else{ const ns=ensureCustom({id:uid(),name,sub,color:pickColor,icon:pickIcon,kind:"custom"});
    data.sections.push(ns); data.active=ns.id; mstamp("cs:"+ns.id);
    closeModal(); render(); toast("Раздел создан");
    openBlockModal(ns.id);                       // шаг 2: сразу выбор первого блока
    return; }
  closeModal(); render(); if(activeCourse()) afterCourseRender(); }

/* ================= Modal utils ================= */
function showModal(){ document.getElementById("overlay").classList.add("on"); }
function closeModal(){ document.getElementById("overlay").classList.remove("on"); window.editingSection=null; }
document.getElementById("overlay").addEventListener("click",e=>{ if(e.target.id==="overlay") closeModal(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeModal(); });

/* ---- имена наружу ---- */
Object.assign(window, {
  openSectionModal, selColor, selIcon, saveSection, showModal, closeModal,
  COLORS, ICONS,
});
