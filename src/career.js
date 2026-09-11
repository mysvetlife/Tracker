/* career.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Career / Design module ================= */
/* Роадмап проекта «Семейное древо» (03.08.2026): 10 этапов + параллельная отрисовка в Figma.
   Ключи ft* — новые, старые (t1, r2, s2, w2, u1, e1, a2, p2 …) остались в данных, но не показываются. */
const TREE_BLOCKS=[
 {t:"Этап 0. Рамка и бриф", items:[
  ['ft0a','Гипотеза одним предложением, антискоуп, отличие от MyHeritage и Древа Жизни'],
  ['ft0b','Критерии успеха продукта и кейса разведены, метрики зафиксированы → 01-brief.md']]},
 {t:"Этап 1. Ресёрч и конкуренты", items:[
  ['ft1a','Возрастные изменения с источниками: зрение, моторика, когнитивка, слух'],
  ['ft1b','Разбор 5 сервисов + экспресс-аудит доступности, 2–3 прокликать руками'],
  ['ft1c','Проверить, кто главная персона: пожилой хранитель или взрослый ребёнок → 02-research.md, 03-competitors.md']]},
 {t:"Этап 2. Персоны и JTBD", items:[
  ['ft2a','3 сегмента и 3–4 прото-персоны с профилем доступности'],
  ['ft2b','JTBD и 4–5 сценариев, включая «внучка настраивает бабушке» → 04-personas.md']]},
 {t:"Этап 3. CJM и карта возможностей", items:[
  ['ft3a','CJM основной персоны, 6 этапов, с отдельной дорожкой a11y-барьеров'],
  ['ft3b','CJM совместного сценария: один заносит, другой вспоминает'],
  ['ft3c','Карта возможностей: каждая боль → дизайн-возможность, приоритеты → 05-cjm.md']]},
 {t:"Этап 4. IA и user flows", items:[
  ['ft4a','Модель данных и краевые случаи: второй брак, усыновление, неизвестный родитель'],
  ['ft4b','Карта экранов и 5 флоу: онбординг, первый родственник, связь, карточка, экспорт'],
  ['ft4c','Карта состояний, включая пустые экраны с подсказкой → 06-ia-flows.md']]},
 {t:"Этап 5. Вайрфреймы и UX-тексты", items:[
  ['ft5a','Вайрфреймы ключевых экранов — структура, без визуала'],
  ['ft5b','Логика редактора древа: пошаговый диалог «кем приходится» вместо драг-н-дропа'],
  ['ft5c','UX-тексты простым языком, без «сиблинга» и «пробанда» → 07-wireframes.md, 08-uxcopy.md']]},
 {t:"Этап 6. Дизайн-система и a11y-спека", items:[
  ['ft6a','Визуальная концепция и шрифтовая пара: архив и бумага, без китча и «детского»'],
  ['ft6b','Токены и компоненты во всех состояниях: кегль 18px, контраст от 7:1'],
  ['ft6c','A11y-спека: фокус, тач-таргеты 48px, ARIA для древа, альтернатива схеме списком → 09-design-system.md, 10-a11y-spec.md']]},
 {t:"Этап 7. HTML-прототип", items:[
  ['ft7a','5 ключевых экранов в рабочем коде, адаптив 375 / 768 / 1440'],
  ['ft7b','Скриншоты прототипа как визуальный референс для Figma']]},
 {t:"Этап 8. Валидация", items:[
  ['ft8a','Эвристическая оценка по Нильсену — честно, с находками'],
  ['ft8b','Аудит прототипа: axe, Lighthouse, WCAG 2.2 AA, клавиатура, скринридер → 11-validation.md'],
  ['ft8c','Гайд интервью готов; по возможности — три разговора с людьми 60+']]},
 {t:"Этап 9. Упаковка кейса", items:[
  ['ft9a','Кейс: контекст → проблема → исследование → решения → доказательства → рефлексия'],
  ['ft9b','EN-выжимка для LinkedIn и польского рынка → 12-case-structure.md'],
  ['ft9c','Разбить процесс на 3–4 поста для контент-серии про доступность']]},
 {t:"Отрисовка в Figma", items:[
  ['ftfa','Дизайн-система в Figma: токены, компоненты, состояния'],
  ['ftfb','Ключевые экраны в финальном визуале, адаптив'],
  ['ftfc','Обложка и публикация кейса на Behance']]}
];
const CR_STAGES=[
 {key:'tree', title:'Семейное древо — кейс по доступности', weeks:'проект', cp:'cp3', cpLabel:'Чек-поинт: прототип прошёл аудит, кейс опубликован',
  items:TREE_BLOCKS.reduce((a,b)=>a.concat(b.items),[])}
];
/* ключевые артефакты роадмапа: бриф, ресёрч-пакет, персоны, CJM, IA+флоу, дизайн-система, прототип, кейс */
const CR_ARTIFACTS=[['tree','ft0b'],['tree','ft1c'],['tree','ft2b'],['tree','ft3c'],['tree','ft4c'],['tree','ft6c'],['tree','ft7a'],['tree','ft9a']];

/* ================= План возврата в профессию =================
   Три проекта: кейс по собственному трекеру, повторение Figma, витрина.
   Отдельного типа раздела не заводим: шаги лежат в тех же c.stages, что и древо,
   поэтому метки "st:" и слияние mStagesT работают без единой правки синхронизации.
   Расписания и оценок «сколько часов» в трекере намеренно нет — план даёт порядок
   шагов, а время Света расставляет сама и отмечает по факту в журнале минут. */
const RT_CASE=[
 {t:"Сбор материала «до»", items:[
  ['tc1a','Скриншоты всех вкладок на ноутбуке: Обзор, Спорт, Дизайн, Английский, Понедельник, планировщик, отчёт'],
  ['tc1b','Те же экраны на телефоне, в ту же папку, без обрезки и правок'],
  ['tc1c','История: чем пробовала пользоваться раньше и почему бросала'],
  ['tc1d','История: что должно было измениться, чтобы не бросила'],
  ['tc1e','История: чем пользуюсь каждый день, а чем не пользуюсь совсем'],
  ['tc1f','История: что до сих пор бесит'],
  ['tc1g','История: сколько месяцев веду и какой самый длинный стрик'],
  ['tc1h','История: какое правило заложила специально и почему'],
  ['tc1i','Перепись: разделы и экраны внутри каждого'],
  ['tc1j','Перепись состояний: пусто, отмечено, пропущено, стрик идёт и сорван, неделя закрыта, отчёт, ошибка синхронизации, данные с другого устройства'],
  ['tc1k','Материал собран в одном месте: про трекер можно рассказать за пять минут, не открывая его']]},
 {t:"Разбор", items:[
  ['tc2a','Обычный день с трекером по шагам: сколько занимает, что раздражает, где ошибаюсь'],
  ['tc2b','Ровно три проблемы в форме «когда … я … потому что …»'],
  ['tc2c','Пять чужих трекеров: как показан прогресс за неделю'],
  ['tc2d','Пять чужих трекеров: что происходит с пропущенным днём'],
  ['tc2e','Оглавление кейса: десять заголовков без текста']]},
 {t:"Редизайн", items:[
  ['tc3a','UI-основа: сетка 12/4, шкала отступов, типографика с ролями, палитра в двух режимах'],
  ['tc3b','Компоненты рабочего минимума: кнопка, карточка, галочка, карточка дня, индикатор прогресса, строка списка'],
  ['tc3c','Экран «Обзор», десктоп: сначала на бумаге решить, что человек видит первым'],
  ['tc3d','Экран раздела «Дизайн и карьера», десктоп — проверка строки списка на длинных названиях'],
  ['tc3e','Планировщик недели, отдельно — день без задач: он не должен выглядеть упрёком'],
  ['tc3f','Недельный отчёт, десктоп: сделанное, стрики, сравнение с прошлой неделей'],
  ['tc3g','Недельный отчёт за тихую неделю, где сделано мало — он важнее удачного'],
  ['tc3h','Три экрана на телефоне при ширине 390: обзор, раздел, отчёт — пересобрать, а не сжать'],
  ['tc3i','Пять краевых состояний из переписи'],
  ['tc3j','Прогон по WCAG 2.2 AA: контраст, видимый фокус, порядок обхода, тач-таргеты, информация не только цветом']]},
 {t:"Упаковка кейса", items:[
  ['tc4a','Текст по оглавлению, десять абзацев, начиная с трёх разделов про решения'],
  ['tc4b','В каждом разделе про решение — «рассматривала ещё вот так, отказалась потому что»'],
  ['tc4c','Визуальная подача: единая сетка, пары «до/после» рядом, крупные скрины с подписями'],
  ['tc4d','Первый экран кейса: одна фраза о проекте и один самый сильный кадр'],
  ['tc4e','Кейс опубликован на Behance'],
  ['tc4f','Кейс добавлен в файл «Портфолио Плотникова С.А.» в Figma']]}
];
const RT_FIGMA=[
 {t:"Шаблон поста", items:[
  ['fg1a','Шесть решений зафиксированы: формат, поля, шрифт, цвета, что есть всегда, чего нет никогда'],
  ['fg1b','Шаблон собран: фрейм 1080×1350, автолейаут, три текстовых слоя, превращён в компонент'],
  ['fg1c','Шаблон проверен самым длинным заголовком из контент-плана'],
  ['fg1d','Четыре поста прогнаны от темы до экспорта PNG']]},
 {t:"Автолейауты", items:[
  ['fg2a','Карточка задачи на горизонтальном автолейауте, тянется по ширине'],
  ['fg2b','Список из карточек: вложенный автолейаут, отступы только через gap'],
  ['fg2c','Шапка: логотип слева, кнопки справа, space between'],
  ['fg2d','Экран «Обзор» целиком из вложенных автолейаутов, проверен растягиванием']]},
 {t:"Компоненты и варианты", items:[
  ['fg3a','Кнопка в четырёх состояниях как варианты одного компонента'],
  ['fg3b','Булево свойство «с иконкой» и текстовое свойство подписи'],
  ['fg3c','Галочка задачи: не сделано / сделано / сегодня / пропущено'],
  ['fg3d','Карточка дня: пусто / частично / полностью / пропущен']]},
 {t:"Переменные и сборка файла", items:[
  ['fg4a','Шесть цветовых переменных: фон, поверхность, текст основной и второстепенный, акцент, линия'],
  ['fg4b','Два режима, светлый и тёмный, переключение одним кликом'],
  ['fg4c','Переменные отступов 4/8/12/16/24/32, автолейауты посажены на них'],
  ['fg4d','Переменные размеров текста 12/14/16/20/24/32, собрана шкала'],
  ['fg4e','Файл «Трекер — редизайн»: переменные, компоненты и шкалы сведены, черновики удалены']]}
];
const RT_SITE=[
 {t:"Сайт", items:[
  ['pf1a','Выбран один инструмент: Figma Sites, Framer или Тильда — остальные не пробую'],
  ['pf1b','Блок «кто я и что делаю» — два предложения'],
  ['pf1c','Кейс про трекер — крупно, первым'],
  ['pf1d','Два-три старых кейса — мелко'],
  ['pf1e','Контакты'],
  ['pf1f','Сайт опубликован']]},
 {t:"Резюме", items:[
  ['pf2a','Версия А для продуктовых команд: дашборды, ролевые кабинеты, дизайн-системы, состояния'],
  ['pf2b','Версия Б для соц- и медтеха: аудиты, доступность, W3Cx, аудиты на Машпроме'],
  ['pf2c','Зарплатное ожидание поднято в обеих версиях'],
  ['pf2d','Сопроводительное в три предложения: что умею, почему именно к вам, ссылка на кейс']]}
];
const RT_PROJECTS=[
 {key:'tcase', tk:'rc', short:'Кейс', color:'var(--a-green)', title:'Кейс по трекеру · главный проект',
  cp:'cp1', cpLabel:'Чек-поинт: кейс опубликован',
  hint:'Кейс делается про то, что уже есть. Новая фича ради кейса — это разработка вместо портфолио.',
  blocks:RT_CASE},
 {key:'figma', tk:'rf', short:'Figma', color:'var(--a-violet)', title:'Повторение Figma',
  cp:'cp2', cpLabel:'Чек-поинт: файл «Трекер — редизайн» собран',
  hint:'Дриллы не в стол: все четыре компонента и обе шкалы уходят в редизайн кейса.',
  blocks:RT_FIGMA},
 {key:'site', tk:'rp', short:'Витрина', color:'var(--a-amber)', title:'Сайт-портфолио и резюме',
  cp:'cp4', cpLabel:'Чек-поинт: сайт опубликован, резюме в двух версиях',
  hint:'Опубликованное на четвёрку лучше неопубликованного на пятёрку. Отклики идут в своём блоке выше.',
  blocks:RT_SITE}
];
function rtStage(c,p){ c.stages=c.stages||{}; c.stages[p.key]=c.stages[p.key]||{}; return c.stages[p.key]; }
function rtBlockDone(c,p,b){ const s=rtStage(c,p); return b.items.reduce((a,x)=>a+(s[x[0]]?1:0),0); }
function rtDone(c,p){ return p.blocks.reduce((a,b)=>a+rtBlockDone(c,p,b),0); }
function rtTotal(p){ return p.blocks.reduce((a,b)=>a+b.items.length,0); }
function rtCurBlock(c,p){ for(let i=0;i<p.blocks.length;i++){ if(rtBlockDone(c,p,p.blocks[i])<p.blocks[i].items.length) return p.blocks[i]; } return p.blocks[p.blocks.length-1]; }
function rtNextStep(c,p){ const s=rtStage(c,p); for(let i=0;i<p.blocks.length;i++){ const b=p.blocks[i]; for(let j=0;j<b.items.length;j++){ if(!s[b.items[j][0]]) return b.items[j][1]; } } return ""; }
function rtWeekItems(c,p,mon){ const s=rtStage(c,p); let n=0; p.blocks.forEach(b=>b.items.forEach(it=>{ if(s[it[0]]&&tsInWeek("st:"+p.key+"."+it[0],mon)) n++; })); return n; }
function rtCardKey(p){ return "rt_"+p.key; }
function rtAllDone(c){ return RT_PROJECTS.reduce((a,p)=>a+rtDone(c,p),0); }
function rtAllTotal(){ return RT_PROJECTS.reduce((a,p)=>a+rtTotal(p),0); }
function rtWeekMin(c,mon){ return RT_PROJECTS.reduce((a,p)=>a+tlogWeek(c,p.tk,mon),0); }
/* Время раздела за неделю: журналы минут проектов и курсов плюс минуты откликов и поста.
   Курса a11y здесь намеренно нет: его минуты живут в английском (english.tlog),
   а учёт в двух разделах сразу удвоил бы «всего времени» в «Обзоре». */
function careerTimeParts(c,mon){
  const out=[], add=(label,min)=>{ if(min>0) out.push({label,min}); };
  RT_PROJECTS.forEach(p=>add(p.short,tlogWeek(c,p.tk,mon)));
  add('Семейное древо', tlogWeek(c,'tr',mon));
  add('Отклики', dtWeekMin(c,'apply',mon));
  add('Пост в LinkedIn', liWeekMin(c,mon));
  add('Курс VK', tlogWeek(c,'vk',mon));
  add('Курс МТС', tlogWeek(c,'mt',mon));
  return out.sort((a,b)=>b.min-a.min); }
function careerWeekMin(c,mon){ return careerTimeParts(c,mon).reduce((a,p)=>a+p.min,0); }
function rtCardHTML(sec,p){
  const c=sec.career, s=rtStage(c,p);
  const done=rtDone(c,p), total=rtTotal(p), cur=rtCurBlock(c,p), next=rtNextStep(c,p);
  let body=next?`<p style="font-size:12.5px; color:var(--muted); margin:0 0 4px">Сейчас: <b style="color:var(--text)">${esc(cur.t)}</b></p>
    <p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Следующий шаг: <b style="color:var(--text)">${esc(next)}</b></p>`
   :`<p style="font-size:12.5px; color:var(--success); margin:0 0 12px">Все шаги пройдены 🎉</p>`;
  body+=tlogRowHTML('career',p.tk,'Ставь минуты в тот день, когда работала над проектом. Галочки шагов — про прогресс, минуты — про потраченное время.');
  p.blocks.forEach((b,bi)=>{
    const bd=rtBlockDone(c,p,b), btot=b.items.length, bp=btot?bd/btot:0, full=bd===btot;
    const ekey=p.key+'b'+bi;
    const open=(ekey in c.exp)?c.exp[ekey]:(b===cur);
    const items=b.items.map(([k,label])=>`<div class="step ${s[k]?'done':''}" onclick="crToggleItem('${p.key}','${k}')"><span class="sname">${esc(label)}</span><span class="cbox">${svg('check')}</span></div>`).join("");
    body+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="crToggleStage('${ekey}',${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(bp,38,5,full?'var(--success)':p.color,false)}</span>
        <span class="ltitle"><span class="tt">${esc(b.t)}${(b===cur&&!full)?' <span style="color:'+p.color+'; font-size:11px; font-weight:600">· сейчас</span>':''}</span><span class="mm">${bd} из ${btot} ${plural(btot,'шага','шагов','шагов')}</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(bp*100)}%</span>
      </div>
      <div class="lbody">${items}</div></div>`;
  });
  const cpDone=!!c.checkpoints[p.cp];
  body+=`<div class="step ${cpDone?'done':''}" style="margin-top:8px; border-top:1px solid var(--line); padding-top:12px" onclick="crToggleCheckpoint('${p.cp}')"><span class="tic" style="background:rgba(255,182,92,.16); color:var(--a-amber)">${svg('star')}</span><span class="sname">${esc(p.cpLabel)}</span><span class="cbox">${svg('check')}</span></div>
    <p style="font-size:11.5px; color:var(--muted-2); margin:14px 0 0">${esc(p.hint)}</p>`;
  const wmin=tlogWeek(c,p.tk,mondayOf(todayStr()));
  return cardWrap(sec,rtCardKey(p),p.title,done+'/'+total+' шагов'+(wmin?' · '+fmtMin(wmin)+' за неделю':''),total?done/total:0,p.color,body);
}
function activeCareer(){ const s=data.sections.find(x=>x.id===data.active); return s&&s.kind==="career"?s:null; }
function renderCareer(){ const sec=activeCareer(); if(!sec)return; document.getElementById("view").innerHTML=careerHTML(sec); applyCardLayout(sec); }
function crWeeks(c){ return c.config.cycleWeeks||12; }
function crCycleDay(c){ if(!c.config.startDate) return 0; const ms=new Date(todayStr()+"T00:00:00")-new Date(c.config.startDate+"T00:00:00"); return Math.floor(ms/86400000)+1; }
function crCycleWeek(c){ const d=crCycleDay(c); if(d<=0) return 1; return Math.min(Math.ceil(d/7),crWeeks(c)); }
function crSessionsInWeek(c,mon){ return c.timeLog.filter(t=>mondayOf(t.d)===mon).length; }
function crSessionsThisWeek(c){ return crSessionsInWeek(c,mondayOf(todayStr())); }
function crWeekCompliance(c){ if(!c.config.startDate) return 0; let m=mondayOf(c.config.startDate),end=mondayOf(todayStr()),weeks=0,ok=0; while(m<=end){ weeks++; if(crSessionsInWeek(c,m)>=2) ok++; m=dateAddDays(m,7);} return weeks?ok/weeks:0; }
function crBlockDone(c,b){ return b.items.reduce((a,x)=>a+(c.stages.tree&&c.stages.tree[x[0]]?1:0),0); }
function crCurBlock(c){ for(let i=0;i<TREE_BLOCKS.length;i++){ if(crBlockDone(c,TREE_BLOCKS[i])<TREE_BLOCKS[i].items.length) return TREE_BLOCKS[i]; } return TREE_BLOCKS[TREE_BLOCKS.length-1]; }
function crNextStep(c){ for(let i=0;i<TREE_BLOCKS.length;i++){ const b=TREE_BLOCKS[i]; for(let j=0;j<b.items.length;j++){ if(!(c.stages.tree&&c.stages.tree[b.items[j][0]])) return b.items[j][1]; } } return ""; }
function engData(){ const s=data.sections.find(x=>x.kind==="english"); return s?s.english:null; }
function crStageDone(c,st){ return st.items.reduce((a,x)=>a+(c.stages[st.key][x[0]]?1:0),0); }
function crAllDone(c){ return CR_STAGES.reduce((a,st)=>a+crStageDone(c,st),0); }
function crAllTotal(){ return CR_STAGES.reduce((a,st)=>a+st.items.length,0); }
function crArtifacts(c){ return CR_ARTIFACTS.reduce((a,x)=>a+((c.stages[x[0]]&&c.stages[x[0]][x[1]])?1:0),0); }
function crVkDone(c){ return Object.values(c.vk).filter(Boolean).length; }
function crCheckDone(c){ return Object.values(c.checkpoints).filter(Boolean).length; }

function careerSetupHTML(sec){
  return `<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head" style="margin-bottom:16px"><div class="sec-ico">${svg('sparkle')}</div><div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')}</p></div></div>
    <p style="color:var(--muted); font-size:14px; margin:0 0 18px">Стратегия: главный проект — кейс по собственному трекеру, параллельно возвращается рука в Figma, в конце — витрина и резюме. Отклики и пост в LinkedIn идут фоном каждую неделю. Прогресс — это <b>артефакты и отклики</b>, а не часы видео.</p>
    <button class="btn primary" onclick="openCareerSetup()">${svg('sparkle')} Начать цикл</button>
  </div>`;
}
function openCareerSetup(){ const sec=activeCareer(); const cfg=sec.career.config; document.getElementById("modal").innerHTML=`
  <h3>${cfg.startDate?'Настройки цикла':'Начать цикл'}</h3><p class="mhint">Дизайн и карьера — 12 недель, 4 этапа.</p>
  <label for="crStart">Дата старта</label><input type="date" id="crStart" value="${cfg.startDate||todayStr()}">
  <label for="crWeeks">Длина цикла, недель</label><input type="number" id="crWeeks" value="${cfg.cycleWeeks||12}">
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveCareerSetup()">Сохранить</button></div>`;
  showModal(); }
function saveCareerSetup(){ const sec=activeCareer(); const c=sec.career; c.config.startDate=document.getElementById("crStart").value||todayStr(); c.config.cycleWeeks=parseInt(document.getElementById("crWeeks").value)||12; save(); closeModal(); render(); }

function careerHTML(sec){
  const c=sec.career;
  if(!c.config.startDate) return careerSetupHTML(sec);
  const WEEKS=crWeeks(c), wk=crCycleWeek(c);
  const curBlock=crCurBlock(c), nextStep=crNextStep(c);
  const done=crAllDone(c), total=crAllTotal();
  const engE=engData(); const axD=engE?axAllDone(engE.a11y):0;
  const vkD=vkAllDone(c.vkcourse), mtD=mtsAllDone(c.mts);
  const pct=sectionProgress(sec);
  const arts=crArtifacts(c);
  const curMon=mondayOf(todayStr());
  const apW=dtWeekCount(c,'apply',curMon);
  const liS=liStreak(c), liNow=!!liWk(c,curMon).done;
  const wmin=careerWeekMin(c,curMon);
  const treeOn=!cardIsPaused(sec,'stages');
  const rtStats=RT_PROJECTS.filter(p=>!cardIsPaused(sec,rtCardKey(p)))
    .map(p=>`<div class="stat"><div class="n" style="color:${p.color}">${rtDone(c,p)}/${rtTotal(p)}</div><div class="l">${esc(p.short.toLowerCase()==='кейс'?'кейс по трекеру':p.short.toLowerCase())}</div></div>`).join("");
  const nextP=RT_PROJECTS.filter(p=>!cardIsPaused(sec,rtCardKey(p))).find(p=>rtNextStep(c,p));

  // dashboard
  let html=`<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head" style="margin-bottom:18px">
      <div class="sec-ico">${svg('sparkle')}</div>
      <div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')} · неделя ${wk} из ${WEEKS}</p></div>
      <div class="sec-tools"><button class="iconbtn" aria-label="Запланировать занятие" onclick="planTaskForSec('${sec.id}')">${svg('calplus')}</button><button class="iconbtn" aria-label="Настройки" onclick="openCareerSetup()">${svg('pencil')}</button></div>
    </div>
    <div class="dash">
      <div class="dring">${ring(pct,132,12,'var(--a-blue)',true)}</div>
      <div style="width:100%">
        <div class="stats">
          <div class="stat"><div class="n b">${wmin?fmtMin(wmin):'—'}</div><div class="l">за эту неделю</div></div>
          ${rtStats}
          <div class="stat"><div class="n g">${apW}/7</div><div class="l">дней с откликами</div></div>
          <div class="stat"><div class="n" style="color:var(--a-blue)">${liNow?'есть':'—'}</div><div class="l">пост в LinkedIn${liS?' · серия '+liS:''}</div></div>
          <div class="stat"><div class="n" style="color:var(--a-cyan)">${axD}/${axTotal()}</div><div class="l">курс a11y</div></div>
          <div class="stat"><div class="n" style="color:var(--a-cyan)">${vkD}/${vkTotal()}</div><div class="l">курс VK</div></div>
          <div class="stat"><div class="n" style="color:var(--a-violet)">${mtD}/${mtsTotal()}</div><div class="l">курс МТС</div></div>
          ${treeOn?`<div class="stat"><div class="n">${done}/${total}</div><div class="l">шагов по древу</div></div>`:''}
        </div>
      </div>
    </div>
    <div class="beacon">${svg('info')}<div>${nextP?`Следующий шаг — <b style="color:var(--text)">${esc(rtNextStep(c,nextP))}</b> (${esc(nextP.short)}).`:'Все шаги плана пройдены 🎉'} Отклики каждый день понемногу, пост в LinkedIn раз в неделю.${treeOn?` Ключевых артефактов по древу собрано: <b style="color:var(--text)">${arts}</b> из ${CR_ARTIFACTS.length}.`:''}</div></div>
  </div>`;

  // ежедневные отклики + LinkedIn
  html+=dailyCardHTML(sec,'apply');
  html+=liCardHTML(sec);

  // проекты плана возврата в профессию
  RT_PROJECTS.forEach(p=>{ html+=rtCardHTML(sec,p); });

  // проект «Семейное древо»
  const st=CR_STAGES[0];
  let treeBody=nextStep?`<p style="font-size:12.5px; color:var(--muted); margin:0 0 4px">Сейчас: <b style="color:var(--text)">${esc(curBlock.t)}</b></p>
    <p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Следующий шаг: <b style="color:var(--text)">${esc(nextStep)}</b></p>`:`<p style="font-size:12.5px; color:var(--success); margin:0 0 12px">Все шаги пройдены 🎉</p>`;
  treeBody+=tlogRowHTML('career','tr','Ставь минуты в тот день, когда работала над проектом. Галочки шагов — про прогресс, минуты — про потраченное время.');
  TREE_BLOCKS.forEach((b,bi)=>{
    const bd=crBlockDone(c,b), btot=b.items.length, bp=btot?bd/btot:0, full=bd===btot;
    const ekey='tb'+bi;
    const open=(ekey in c.exp)?c.exp[ekey]:(b===curBlock);
    const items=b.items.map(([k,label])=>{ const dn=!!c.stages.tree[k]; return `<div class="step ${dn?'done':''}" onclick="crToggleItem('tree','${k}')"><span class="sname">${esc(label)}</span><span class="cbox">${svg('check')}</span></div>`; }).join("");
    treeBody+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="crToggleStage('${ekey}',${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(bp,38,5,full?'var(--success)':'var(--a-blue)',false)}</span>
        <span class="ltitle"><span class="tt">${esc(b.t)}${b===curBlock&&!full?' <span style="color:var(--a-blue); font-size:11px; font-weight:600">· сейчас</span>':''}</span><span class="mm">${bd} из ${btot} ${plural(btot,'шага','шагов','шагов')}</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(bp*100)}%</span>
      </div>
      <div class="lbody">${items}</div></div>`;
  });
  const cpDone=!!c.checkpoints[st.cp];
  treeBody+=`<div class="step ${cpDone?'done':''}" style="margin-top:8px; border-top:1px solid var(--line); padding-top:12px" onclick="crToggleCheckpoint('${st.cp}')"><span class="tic" style="background:rgba(255,182,92,.16); color:var(--a-amber)">${svg('star')}</span><span class="sname">${esc(st.cpLabel)}</span><span class="cbox">${svg('check')}</span></div>
    <p style="font-size:11.5px; color:var(--muted-2); margin:14px 0 0">Узкое место проекта — схема древа: она плохо ложится на клавиатуру и скринридер. Решишь её небанально — кейс станет профильным для доступности. Отрисовка в Figma идёт параллельно, начиная с этапа 6.</p>`;
  const trMin=tlogWeek(c,'tr',curMon);
  html+=cardWrap(sec,'stages','Семейное древо · проект',done+'/'+total+' шагов · '+TREE_BLOCKS.length+' '+plural(TREE_BLOCKS.length,'этап','этапа','этапов')+(trMin?' · '+fmtMin(trMin)+' за неделю':''),total?done/total:0,'var(--a-blue)',treeBody);

  // courses
  if(engE) html+=a11yCardHTML(engE,sec);
  html+=vkCardHTML(sec);
  html+=mtsCardHTML(sec);

  return html;
}

/* ---- Пост в LinkedIn: раз в неделю ---- */
function liStore(c){ c.li=c.li||{weeks:{}}; c.li.weeks=c.li.weeks||{}; return c.li; }
function liWk(c,mon){ return liStore(c).weeks[mon]||{}; }
function liRow(c,mon){ const s=liStore(c); return s.weeks[mon]||(s.weeks[mon]={done:false,note:""}); }
function liClean(c,mon){ const s=liStore(c), w=s.weeks[mon]; if(w&&!w.done&&!String(w.note||"").trim()&&!w.min) delete s.weeks[mon]; }
function liToggle(mon){ const c=activeCareer().career; const w=liRow(c,mon); w.done=!w.done; liClean(c,mon); mstamp("li:"+mon); save(); renderCareer(); }
function liNote(mon,v){ const c=activeCareer().career; const w=liRow(c,mon); w.note=v; liClean(c,mon); mstamp("li:"+mon); mstamp("li:"+mon+"~n"); save(); }
/* Минуты недели. Метка та же, что у done: liWeeks сливаются mDailyT, где min едет на метке недели. */
function liMin(mon,v){ const c=activeCareer().career; const s=String(v==null?"":v).trim(), n=parseInt(s,10);
  if(s!=="" && !(n>=1&&n<=600)) return;                  // вне 1–600 — молча игнорируем
  const w=liRow(c,mon); if(s==="") delete w.min; else w.min=n; liClean(c,mon); mstamp("li:"+mon); save(); renderCareer(); }
function liWeekMin(c,mon){ return liWk(c,mon).min||0; }
function liTotalMin(c){ const w=liStore(c).weeks; return Object.keys(w).reduce((a,x)=>a+(w[x].min||0),0); }
function liTotal(c){ const w=liStore(c).weeks; return Object.keys(w).filter(x=>w[x].done).length; }
function liStreak(c){ let m=mondayOf(todayStr()); if(!liWk(c,m).done) m=dateAddDays(m,-7); let n=0; while(liWk(c,m).done){ n++; m=dateAddDays(m,-7); } return n; }
function liBest(c){ const w=liStore(c).weeks; const ks=Object.keys(w).filter(x=>w[x].done).sort(); let best=0,cur=0,prev=null; ks.forEach(x=>{ cur=(prev&&dateAddDays(prev,7)===x)?cur+1:1; if(cur>best)best=cur; prev=x; }); return best; }
function liWeekIn(c,mon){ return liWk(c,mon).done?1:0; }
function liCardHTML(sec){
  const c=sec.career, cur=mondayOf(todayStr());
  const streak=liStreak(c), best=liBest(c), tot=liTotal(c), now=!!liWk(c,cur).done;
  let rows="";
  for(let i=0;i<8;i++){ const m=dateAddDays(cur,-i*7), w=liWk(c,m);
    rows+=`<div class="dayrow ${w.done?'done':''}">
      <button class="check ${w.done?'on':''}" aria-label="Отметить неделю ${ruDate(m)}" onclick="liToggle('${m}')">${svg('check')}</button>
      <span class="dayrow-lab"><b>${ruDate(m)} — ${ruDate(dateAddDays(m,6))}</b>${m===cur?' <small>· текущая</small>':''}</span>
      <input class="dayrow-note" type="text" value="${esc(w.note||'')}" placeholder="тема поста / ссылка" oninput="liNote('${m}',this.value)">
      <span class="minbox"><input class="minbox-in" type="number" inputmode="numeric" min="1" max="600" value="${w.min||''}" aria-label="Минут за неделю ${ruDate(m)}" onchange="liMin('${m}',this.value)"><i>мин</i></span>
    </div>`; }
  const wmin=liWeekMin(c,cur), tmin=liTotalMin(c);
  const body=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Один пост в неделю: разбор кейса, находка по доступности, заметка о процессе. Тема в поле — чтобы не забыть, о чём был пост. Минуты — сколько ушло на текст и картинку.</p>
    ${rows}
    <div class="stats" style="margin-top:16px">
      <div class="stat"><div class="n" style="color:var(--a-blue)">${now?'есть':'ещё нет'}</div><div class="l">на этой неделе</div></div>
      <div class="stat"><div class="n">${wmin?fmtMin(wmin):'—'}</div><div class="l">минут за неделю</div></div>
      <div class="stat"><div class="n g">${streak}</div><div class="l">${plural(streak,'неделя','недели','недель')} подряд</div></div>
      <div class="stat"><div class="n b">${best}</div><div class="l">лучшая серия</div></div>
      <div class="stat"><div class="n">${tot}</div><div class="l">всего постов</div></div>
      <div class="stat"><div class="n">${tmin?fmtMin(tmin):'—'}</div><div class="l">всего времени</div></div>
    </div>`;
  return cardWrap(sec,'li','Пост в LinkedIn · раз в неделю',(now?'на этой неделе есть':'серия '+streak)+(wmin?' · '+fmtMin(wmin):''),now?1:0,'var(--a-blue)',body);
}

/* ---- career actions ---- */
function crToggleItem(sk,k){ const c=activeCareer().career; c.stages[sk][k]=!c.stages[sk][k]; mstamp("st:"+sk+"."+k); save(); renderCareer(); }
function crToggleCheckpoint(cp){ const c=activeCareer().career; c.checkpoints[cp]=!c.checkpoints[cp]; mstamp("st:cp."+cp); save(); renderCareer(); if(c.checkpoints[cp]) toast("Чек-поинт закрыт 🎉"); }
function crToggleStage(k,cur){ const c=activeCareer().career; c.exp[k]=!cur; save(); renderCareer(); }

/* ================= Порядок блоков и «Временно приостановлено» =================
   Порядок и пауза живут в данных раздела (cardOrder, paused) и синхронизируются.
   Раскладка делается по готовому DOM после render() — поэтому любой новый блок
   подхватывается сам, без правок в сборке вкладок.

   Перестановка идёт в отдельном компактном режиме: карточки высокие, тянуть
   двенадцатую к первой через 5000 пикселей невозможно, а список заголовков
   помещается в один экран.

   Приостановленное убрано с глаз намеренно: задач много, и невыполненное не должно
   маячить. Это не «провал», а осознанная пауза — вернуть можно одной кнопкой. */
function uiOrder(sec){ const st=uiStore(sec); st.cardOrder=st.cardOrder||[]; return st.cardOrder; }
function uiPaused(sec){ const st=uiStore(sec); st.paused=st.paused||{}; return st.paused; }
function cardIsPaused(sec,k){ return !!uiPaused(sec)[k]; }
function cardPause(sid,k,on){ const sec=findSec(sid); if(!sec) return; const p=uiPaused(sec);
  if(on) p[k]=1; else delete p[k];
  mstamp("pa:"+k); evLog("block_state",{block:k, state:on?"paused":"active", section:sec.kind}); save(); render(); toast(on?"Блок приостановлен":"Блок вернулся"); }
function cardZoneToggle(sid){ const sec=findSec(sid); if(!sec) return; const st=uiStore(sec);
  st.pauseOpen=!st.pauseOpen; save(); render(); }
function cardEditOn(sid){ window.cardEditSec=sid; render();
  const b=document.getElementById("cardedit"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); }
function cardEditOff(){ window.cardEditSec=null; render(); }
function cardTitle(el,k){ const h=el?el.querySelector(".chead h2"):null; return h?h.textContent.trim():k; }
/* Собираем карточки вкладки: активные — в своём порядке, приостановленные — отдельно. */
function cardSplit(sec,view){
  const all=Array.prototype.filter.call(view.children,x=>x.classList&&x.classList.contains("card-c")&&x.getAttribute("data-k"));
  const paused=uiPaused(sec), ord=uiOrder(sec);
  const act=all.filter(x=>!paused[x.getAttribute("data-k")]);
  const pau=all.filter(x=>paused[x.getAttribute("data-k")]);
  act.sort((a,b)=>{ const ia=ord.indexOf(a.getAttribute("data-k")), ib=ord.indexOf(b.getAttribute("data-k"));
    return (ia<0?900+act.indexOf(a):ia)-(ib<0?900+act.indexOf(b):ib); });
  return {all:all, act:act, pau:pau};
}
function applyCardLayout(sec){
  const view=document.getElementById("view"); if(!view||!sec||!view.children) return;
  const sp=cardSplit(sec,view); if(!sp.all.length) return;
  const first=sp.all[0];
  const zone=document.createElement("div"); zone.className="cardzone"; zone.id="cardzone";
  const pz=document.createElement("div"); pz.className="pausezone"; pz.id="pausezone";
  first.parentNode.insertBefore(zone,first);
  sp.act.forEach(el=>zone.appendChild(el));
  const open=!!uiStore(sec).pauseOpen;
  pz.innerHTML=`<div class="pzhead" role="button" tabindex="0" aria-expanded="${open}" onclick="cardZoneToggle('${sec.id}')"><span class="chev">${svg('chev')}</span><h2>Временно приостановлено</h2><span class="daystatus">${sp.pau.length?sp.pau.length+' '+plural(sp.pau.length,'блок','блока','блоков'):'пусто'}</span></div><div class="pzbody"></div>`;
  if(open) pz.classList.add("open");
  zone.parentNode.insertBefore(pz,zone.nextSibling);
  const body=pz.querySelector(".pzbody");
  if(!sp.pau.length) body.innerHTML='<p class="tlhint" style="margin:0 0 10px">Пусто. Нажми ⠿ у любого блока и перетащи его сюда — он свернётся и перестанет попадаться на глаза.</p>';
  sp.pau.forEach(el=>{ const k=el.getAttribute("data-k"), title=cardTitle(el,k);
    const row=document.createElement("div"); row.className="pzrow";
    row.innerHTML=`<span class="pzname">${esc(title)}</span><button class="btn sm" onclick="cardPause('${sec.id}','${esc(k)}',0)">Вернуть</button>`;
    body.appendChild(row); el.parentNode.removeChild(el); });
  if(cardEditSec===sec.id) cardEditRender(sec,zone,pz,sp);
}
/* Компактный режим перестановки: список заголовков + зона паузы как цель. */
function cardEditRender(sec,zone,pz,sp){
  zone.classList.add("hidden");
  const box=document.createElement("div"); box.className="ceBox"; box.id="cardedit";
  box.innerHTML=`<div class="ceHead"><h2>Порядок блоков</h2><button class="btn sm primary" onclick="cardEditOff()">Готово</button></div>
    <p class="tlhint" style="margin:0 0 10px">Тяни за ⠿. Чтобы приостановить блок — перетащи его в зону ниже.</p>
    <div class="ceList" id="ceList">${sp.act.map(el=>{ const k=el.getAttribute("data-k");
      return `<div class="ceRow" data-k="${esc(k)}"><span class="chandle" aria-label="Перетащить" onpointerdown="cardDragStart(event,'${sec.id}','${esc(k)}')">${svg('grip')}</span><span class="ceName">${esc(cardTitle(el,k))}</span><button class="cpause" aria-label="Приостановить" title="Приостановить" onclick="cardPause('${sec.id}','${esc(k)}',1)">${svg('pause')}</button></div>`; }).join("")}</div>`;
  zone.parentNode.insertBefore(box,zone);
  zone.parentNode.insertBefore(pz,box.nextSibling);
}
function cardSaveOrder(sec){ const list=document.getElementById("ceList"); if(!list) return;
  const ord=Array.prototype.map.call(list.children,x=>x.getAttribute("data-k")).filter(Boolean);
  const st=uiStore(sec); st.cardOrder=ord; mstamp("or:"+(sec.kind==="custom"?sec.id:sec.kind)); save(); }
/* Перетаскивание указателем: одинаково работает мышью и пальцем. */
function cardDragStart(ev,sid,k){
  const sec=findSec(sid); if(!sec) return;
  const list=document.getElementById("ceList"); if(!list) return;
  const el=list.querySelector('.ceRow[data-k="'+k+'"]'); if(!el) return;
  ev.preventDefault(); ev.stopPropagation();
  window.cdrag={sec:sec,k:k,el:el,list:list,pz:document.getElementById("pausezone"),moved:false};
  el.classList.add("dragging");
  document.addEventListener("pointermove",cardDragMove,{passive:false});
  document.addEventListener("pointerup",cardDragEnd);
  document.addEventListener("pointercancel",cardDragEnd);
}
function cardDragMove(ev){
  if(!cdrag) return; ev.preventDefault(); cdrag.moved=true;
  /* автопрокрутка у краёв: без неё нижнюю строку не дотащить до верхней */
  const H=(window.innerHeight||600);
  if(ev.clientY<90) window.scrollBy(0,-18); else if(ev.clientY>H-90) window.scrollBy(0,18);
  if(cdrag.pz){ const r=cdrag.pz.getBoundingClientRect();
    cdrag.pz.classList.toggle("over", ev.clientY>=r.top&&ev.clientY<=r.bottom); }
  const kids=Array.prototype.filter.call(cdrag.list.children,x=>x!==cdrag.el);
  for(let i=0;i<kids.length;i++){ const r=kids[i].getBoundingClientRect();
    if(ev.clientY < r.top+r.height/2){ if(kids[i].previousSibling!==cdrag.el) cdrag.list.insertBefore(cdrag.el,kids[i]); return; } }
  if(cdrag.list.lastChild!==cdrag.el) cdrag.list.appendChild(cdrag.el);
}
function cardDragEnd(ev){
  document.removeEventListener("pointermove",cardDragMove);
  document.removeEventListener("pointerup",cardDragEnd);
  document.removeEventListener("pointercancel",cardDragEnd);
  if(!cdrag) return; const d=cdrag; window.cdrag=null;
  d.el.classList.remove("dragging"); if(d.pz) d.pz.classList.remove("over");
  let toPause=false;
  if(d.pz&&ev&&ev.clientY!=null){ const r=d.pz.getBoundingClientRect(); toPause=ev.clientY>=r.top&&ev.clientY<=r.bottom; }
  if(toPause){ cardPause(d.sec.id,d.k,1); return; }
  cardSaveOrder(d.sec); render();
}

/* ---- сворачиваемые карточки (общий механизм для всех вкладок) ---- */
function uiStore(sec){ return sec.career||sec.english||sec.sport||sec.course||sec; }
/* Прошлые циклы и программа — справка, а не ежедневная работа: свёрнуты по умолчанию. */
const CARD_CLOSED={prog:1};
function uiOpen(sec,k){ if(!sec) return true; const st=uiStore(sec), e=st.cardExp||{}; return (k in e)?!!e[k]:!CARD_CLOSED[k]; }
function uiToggle(sid,k){ const sec=findSec(sid); if(!sec) return; const st=uiStore(sec); st.cardExp=st.cardExp||{}; st.cardExp[k]=!uiOpen(sec,k); save(); render(); if(activeCourse()) afterCourseRender(); }
function cardWrap(sec,k,title,meta,pct,accent,body,hdrx){
  const open=uiOpen(sec,k), hasPct=(pct!==null&&pct!==undefined), p=hasPct?Math.round(pct*100):0, full=hasPct&&p>=100;
  return `<div class="card card-c ${open?'open':''}" data-k="${k}" data-sec="${sec.id}" style="--accent:${accent}; --accent-soft:${softColor(accent)}">
    <div class="section-h chead" role="button" tabindex="0" aria-expanded="${open}" onclick="uiToggle('${sec.id}','${k}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();uiToggle('${sec.id}','${k}')}">
      <span class="chandle" role="button" tabindex="0" aria-label="Изменить порядок блоков" title="Порядок блоков" onclick="event.stopPropagation();cardEditOn('${sec.id}')">${svg('grip')}</span>
      <span class="chev">${svg('chev')}</span>
      <h2>${title}</h2>
      ${meta?`<span class="daystatus" style="color:${full?'var(--success)':'var(--muted)'}">${meta}</span>`:''}
      ${hasPct?`<span class="lbadge ${full?'full':''}">${p}%</span>`:''}
      ${hdrx||''}
      <button class="cpause" aria-label="Приостановить блок" title="Приостановить" onclick="event.stopPropagation();cardPause('${sec.id}','${k}',1)">${svg('pause')}</button>
    </div>
    ${hasPct?`<div class="cmini"><div class="track"><i style="width:${p}%"></i></div></div>`:''}
    <div class="cbody">${body}</div>
  </div>`;
}

/* ---- имена наружу ---- */
Object.assign(window, {
  rtStage, rtBlockDone, rtDone, rtTotal, rtCurBlock, rtNextStep,
  rtWeekItems, rtCardKey, rtAllDone, rtAllTotal, rtWeekMin, careerTimeParts,
  careerWeekMin, rtCardHTML, activeCareer, renderCareer, crWeeks, crCycleDay,
  crCycleWeek, crSessionsInWeek, crSessionsThisWeek, crWeekCompliance, crBlockDone, crCurBlock,
  crNextStep, engData, crStageDone, crAllDone, crAllTotal, crArtifacts,
  crVkDone, crCheckDone, careerSetupHTML, openCareerSetup, saveCareerSetup, careerHTML,
  liStore, liWk, liRow, liClean, liToggle, liNote,
  liMin, liWeekMin, liTotalMin, liTotal, liStreak, liBest,
  liWeekIn, liCardHTML, crToggleItem, crToggleCheckpoint, crToggleStage, uiOrder,
  uiPaused, cardIsPaused, cardPause, cardZoneToggle, cardEditOn, cardEditOff,
  cardTitle, cardSplit, applyCardLayout, cardEditRender, cardSaveOrder, cardDragStart,
  cardDragMove, cardDragEnd, uiStore, uiOpen, uiToggle, cardWrap,
  TREE_BLOCKS, CR_STAGES, CR_ARTIFACTS, RT_CASE, RT_FIGMA, RT_SITE,
  RT_PROJECTS, CARD_CLOSED,
});
