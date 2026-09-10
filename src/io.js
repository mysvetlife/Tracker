/* io.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Import / Export ================= */
function exportData(){ const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="moy-progress-"+todayStr()+".json"; a.click(); URL.revokeObjectURL(url); toast("Файл сохранён"); }
function importData(ev){ const f=ev.target.files[0]; if(!f)return; const r=new FileReader();
  r.onload=()=>{ try{ const o=JSON.parse(r.result); if(!o.sections) throw 0; window.data=migrate(o); if(!data.active) data.active="overview"; render(); if(activeCourse()) afterCourseRender(); toast("Данные загружены"); }
    catch(e){ alert("Не удалось прочитать файл"); } }; r.readAsText(f); ev.target.value=""; }

/* ================= Toast ================= */
function toast(msg){ const el=document.getElementById("toast");
  el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>${esc(msg)}`;
  el.classList.add("on"); clearTimeout(toastT); window.toastT=setTimeout(()=>el.classList.remove("on"),1700); }

/* ---- имена наружу ---- */
Object.assign(window, {
  exportData, importData, toast,
});
