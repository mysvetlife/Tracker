/* vk-course.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= VK course module ================= */
const VK_PROGRAM=[
 {t:"Основы", v:["Что такое цифровая доступность и кому она необходима?","Зачем бизнесу учитывать цифровую доступность?","Восприятие инвалидности и корректная лексика","Типы и особенности пользователей","Как незрячие пользователи взаимодействуют с интерфейсами","Как слабовидящие пользователи взаимодействуют с интерфейсами","Как пользователи с нарушением моторных функций взаимодействуют с интерфейсами","Роли в цифровой доступности","Стандарты цифровой доступности","Альтернативный текст"]},
 {t:"Дизайн", v:["Оценка текущего уровня цифровой доступности","Размер шрифта и его роль","Контрастность","Интерактивные области","Интеграция принципов визуальной доступности в дизайн","Озвучивание элементов в дизайне","Тестирование озвучивания"]},
 {t:"Исследования", v:["Введение в исследование пользователей с особенностями восприятия","Доступность для пожилых пользователей","Особенности организации исследований","Коммуникации и взаимодействие с респондентами","Этические аспекты исследований","Проведение исследований с участием слабослышащих респондентов","Как проверить соответствие дизайна критериям доступности"]},
 {t:"Разработка", v:["Проблемы цифровой доступности","Тестирование доступности в DevTools","Кастомные компоненты пользовательского интерфейса","Чеклист доступности"]},
 {t:"Тестирование", v:["Использование стандартных средств доступности для веб","Основы использования NVDA","Тестирование доступности структуры документа","Тестирование доступности приложений и интерактивных элементов","Тестирование UX","Автотестирование"]}
];
function vkKey(bi,vi){ return "b"+bi+"v"+vi; }
function vkIsDone(v,bi,vi){ return !!v.done[vkKey(bi,vi)]; }
function vkBlockDone(v,bi){ return VK_PROGRAM[bi].v.reduce((a,_,vi)=>a+(vkIsDone(v,bi,vi)?1:0),0); }
function vkTotal(){ return VK_PROGRAM.reduce((a,b)=>a+b.v.length,0); }
function vkAllDone(v){ return VK_PROGRAM.reduce((a,b,bi)=>a+vkBlockDone(v,bi),0); }
function vkBlocksComplete(v){ return VK_PROGRAM.filter((b,bi)=>vkBlockDone(v,bi)===b.v.length).length; }
function vkCardHTML(sec){
  const c=sec.career;
  const v=c.vkcourse; const done=vkAllDone(v), total=vkTotal(), pct=total?done/total:0; const bc=vkBlocksComplete(v);
  let html=``;
  VK_PROGRAM.forEach((b,bi)=>{
    const bd=vkBlockDone(v,bi), tot=b.v.length, p2=tot?bd/tot:0, full=bd===tot;
    const open=(bi in v.exp)?v.exp[bi]:(bi===0);
    const vids=b.v.map((title,vi)=>{ const dn=vkIsDone(v,bi,vi); return `<div class="step ${dn?'done':''}" onclick="vkToggle(${bi},${vi})"><span class="tic video" style="background:rgba(108,140,255,.16); color:var(--video)">${svg('play')}</span><span class="sname">${esc(title)}</span><span class="cbox">${svg('check')}</span></div>`; }).join("");
    html+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="vkToggleBlock(${bi},${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(p2,38,5,full?'var(--success)':'var(--a-cyan)',false)}</span>
        <span class="ltitle"><span class="tt">${esc(b.t)}</span><span class="mm">${bd} из ${tot} видео</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(p2*100)}%</span>
      </div>
      <div class="lbody">
        <div class="lbtns"><button class="link" onclick="event.stopPropagation();vkMarkBlock(${bi},true)">${svg('check')} Отметить весь блок</button><button class="link" onclick="event.stopPropagation();vkMarkBlock(${bi},false)">Снять отметки</button></div>
        ${vids}
      </div></div>`;
  });
  return cardWrap(sec,'vk','Курс VK · доступность',done+'/'+total+' видео · '+bc+'/'+VK_PROGRAM.length+' блоков',pct,'var(--a-cyan)',tlogRowHTML('career','vk')+html);
}
function vkToggle(bi,vi){ const v=activeCareer().career.vkcourse; const k=vkKey(bi,vi); if(v.done[k]) delete v.done[k]; else v.done[k]=1; mstamp("vk:"+k); save(); renderCareer(); }
function vkToggleBlock(bi,cur){ const v=activeCareer().career.vkcourse; v.exp[bi]=!cur; save(); renderCareer(); }
function vkMarkBlock(bi,val){ const v=activeCareer().career.vkcourse; VK_PROGRAM[bi].v.forEach((_,vi)=>{ const k=vkKey(bi,vi); if(val) v.done[k]=1; else delete v.done[k]; mstamp("vk:"+k); }); save(); renderCareer(); }

/* ---- имена наружу ---- */
Object.assign(window, {
  vkKey, vkIsDone, vkBlockDone, vkTotal, vkAllDone, vkBlocksComplete,
  vkCardHTML, vkToggle, vkToggleBlock, vkMarkBlock, VK_PROGRAM,
});
