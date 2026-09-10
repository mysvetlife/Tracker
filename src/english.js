/* english.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= English module ================= */
const YA_PROGRAM=[
 ["Другое","Урок «Выходные в городе»"],["Другое","Урок «Какой вид отдыха выбрать?»"],["Другое","Урок «Общение онлайн»"],["Лексика","Литература"],["Лексика","Фильмы и телевидение"],["Лексика","Театр"],["Лексика","Рисование"],["Лексика","Люди искусства"],["Лексика","Инфраструктура аэропорта (дополнительно)"],["Лексика","Достопримечательности"],["Фразы","Глагол play (играть)"],["Лексика","Вещи для отдыха и путешествия"],
 ["Фразы","Виды отпуска"],["Лексика","Одежда (дополнительно)"],["Лексика","Ежедневные занятия"],["Фразы","Названия предметов одежды"],["Фразы","Настоящее длительное время: Словосочетания"],["Лексика","Предметы мебели"],["Лексика","Посуда (дополнительно)"],["Лексика","Дом и двор"],["Лексика","Личности"],["Лексика","Прилагательные для описания впечатлений"],["Лексика","Глаголы для общения в интернете"],["Лексика","Распространённые глаголы 6"],["Лексика","Части тела"],["Лексика","Распространённые глаголы 5"],["Фразы","Определение количества"],
 ["Лексика","Распространённые предметы одежды"],["Лексика","В магазине"],["Фразы","Выражение мнения"],["Лексика","Жанры фильмов"],["Лексика","Части картины"],["Лексика","Люди искусства 2 (extra)"],["Лексика","Сильные прилагательные"],["Фразы","Транспорт"],["Грам. справка","Справочник: Going to"],["Лексика","Вещи для спорта и отдыха на природе"],["Лексика","Места на природе"],["Лексика","Одежда (дополнительно)"],["Лексика","Глаголы в длительном времени"],["Лексика","Предметы в номере отеля"],["Лексика","Столовые приборы (дополнительно)"],
 ["Лексика","Коммунальные услуги"],["Лексика","Предметы первой необходимости"],["Лексика","Характер 2"],["Лексика","Слова для общения в интернете"],["Лексика","Части тела 2"],["Лексика","Наречия образа действия"],["Грамматика","Вопросы о количестве"],["Лексика","Аксессуары (дополнительно)"],["Фразы","В магазине"],["Лексика","Про кино"],["Фразы","Билеты в театр"],["Лексика","Живопись"],["Лексика","Профессии: политика и искусство"],["Грамматика","Предлоги места"],["Лексика","Гостиничные удобства 2"],
 ["Грамматика","Going to в утверждениях и вопросах"],["Фразы","Мнения"],["Лексика","Географические объекты"],["Лексика","Обычная одежда 2"],["Лексика","Глаголы в длительном времени 2"],["Лексика","Подарки"],["Фразы","Просьбы о помощи"],["Лексика","Глаголы, которые помогут одолжить вещь"],["Лексика","Вещи в спальне"],["Лексика","Уборка"],["Фразы","What is he like? What does she like?"],["Грамматика","Советы с should"],["Лексика","Части тела 3"],["Фразы","Наречия образа действия"],["Грамматика","Наречия частоты"],
 ["Лексика","Аксессуары 2"],["Диалог","В магазине сувениров"],["Грамматика","Настоящее время для пересказа сюжета"],["Лексика","Позитивные прилагательные"],["Чтение","Adults: Театралы"],["Фразы","Описание картины"],["Лексика","Школа"],["Фразы","Проблема в аэропорту"],["Фразы","Наречие definitely"],["Грамматика","Going to"],["Чтение","Полетели вместе!"],["Фразы","Глаголы действия и состояния"],["Грам. справка","Справочник: Простое настоящее время"],["Лексика","Аксессуары"],["Лексика","Глаголы в длительном времени 3"],
 ["Лексика","Прилагательные для описания вещей 1"],["Фразы","Не мог бы ты купить продукты?"],["Грамматика","Будущее время для спонтанных решений"],["Фразы","Дела по дому"],["Чтение","Гороскопы"],["Чтение","Советы по онлайн-общению"],["Фразы","Как вести себя на свидании"],["Лексика","Тип волос"],["Фразы","Советы: Разные конструкции"],["Чтение","Совет от известного человека"],["Лексика","Обувь"],["Фразы","Как узнавать о цене"],["Фразы","Рекомендации"],["Фразы","Разговор о проблемах"],["Лексика","География и ландшафт (дополнительно)"],
 ["Лексика","Аксессуары (дополнительно)"],["Лексика","Глаголы в длительном времени 4"],["Лексика","Прилагательные для описания вещей 3"],["Фразы","Усилители прилагательных"],["Фразы","Вежливые просьбы"],["Фразы","Проблемы с соседом"],["Фразы","Предложение помощи"],["Грамматика","Ты не против?"],["Фразы","Ремарки и вопросы к рассказчику"],["Чтение","Не размещай эту фотографию!"],["Аудио","Рассказ о свидании"],["Лексика","Цвет волос"],["Фразы","Предпочтения"],["Аудио","В магазине"],["Фразы","Разговор о фильме"],
 ["Фразы","Просьба о помощи"],["Чтение","Американский футбол"],["Фразы","Измерения"],["Грамматика","Настоящее и настоящее длительное времена"],["Фразы","Глаголы wear и carry"],["Грамматика","Формирование слов с -ing"],["Фразы","Описание предметов"],["Фразы","Разговор с соседом"],["Фразы","Разговор о внешности"],["Грамматика","Настоящее длительное время"],["Фразы","Предположения и советы"],["Грамматика","Произношение be going to"],
 ["Фразы","Союзы and, so, but, because"],["Грамматика","Порядок прилагательных"],["Грам. справка","Справочник: Настоящее длительное время"],["Другое","Сложные предложения с when"],["Фразы","Просьбы и предложения"],["Фразы","Внешность"],["Грамматика","Going to"],["Грамматика","Глаголы plan to, want to, need to"],["Аудио","График знаменитости"],["Грамматика","Настоящее длительное время: утверждения"],["Фразы","Глаголы say, tell, speak и talk"],["Чтение","Мастер на все руки"],
 ["Фразы","Внешность"],["Грамматика","Настоящее длительное время: вопросы"],["Грамматика","Вопросы с How + прилагательное"],["Фразы","Первое свидание"],["Аудио","Первое свидание"],["Чтение","Adults: YOLO"],["Чтение","Сайт знакомств"],["Аудио","Семейное фото"],["Чтение","Фотография с фильтрами"],["Повторение","Модуль 4. А2.1. Повторение"],["Фразы","Который час?"],["Грам. справка","Справочник: Как говорить про время"],["Письм. тест","А2.1 Модули 1–5. Письменный тест"],["Фразы","Время: половина и четверть часа"],["Письм. тест","А1.2 Модуль 3. Письменный тест"],
 ["Препод.","Вопросы по теме «Рассказ о прошлом»"],["Препод.","Вопросы по теме «Путешествия и отдых»"],["Письм. тест","А2.1 Модуль 4. Письменный тест"],["Письм. тест","А2.1 Модуль 7. Письменный тест"],["Повторение","Модуль 5. А2.1. Повторение"],["Препод.","Вопросы по теме «Образ жизни»"],["Письм. тест","А2.1. Модуль 6. Письменный тест"],["Повторение","А2.1 Модуль 6. Повторение"],["Письм. тест","А2.1 Модуль 5. Письменный тест"],["Препод.","Вопросы по теме «Одежда для разных случаев»"],["Препод.","Вопросы по теме «Соседи»"],["Повторение","Модуль 7. А2.1. Повторение"],["Устный тест","А1.2 Модуль 3. Устный тест"],["Устный тест","А2.1 Модуль 4. Устный тест"],["Устный тест","А2.1 Модуль 5. Устный тест"],
 ["Устный тест","А2.1. Модуль 6. Устный тест"],["Устный тест","А2.1 Модуль 7. Устный тест"],["Устный тест","А2.1 Модули 1–5. Устный тест"]
];
const YA_MIN=[11,11,6,5,4,4,3,5,6,3,10,4,10,4,5,8,8,7,4,5,5,5,5,5,4,4,4,3,4,18,4,6,2,5,18,8,5,5,4,4,5,4,4,4,3,4,5,5,11,4,20,4,9,5,3,15,5,7,12,4,3,4,7,11,5,5,5,5,7,3,8,6,2,4,5,6,20,18,5,13,3,5,43,8,3,3,2,3,7,9,7,11,13,16,2,11,11,2,3,6,8,3,2,4,5,10,6,9,9,5,6,31,9,4,10,5,16,3,36,14,12,3,5,9,8,10,7,11,3,18,6,9,14,9,5,5,4,5,5,30,15,6,5,9,7,7,37,14,10,12,14,5,10,30,4,20,15,15,35,32,7,15,24,8,38,15,15,17,20,20,20,20,20,30];
function yaWeekMap(){ if(_yaWk) return _yaWk; const W=12; const total=YA_MIN.reduce((a,m)=>a+m,0); let cum=0; window._yaWk=YA_MIN.map(m=>{ const w=Math.min(W-1,Math.floor(cum/total*W)); cum+=m; return w; }); return _yaWk; }
/* Оценка времени на единицу там, где хронометража в данных нет.
   Правится в одном месте. Это оценка занятости, а не хронометраж. */
const ANKI_QUEUE=[["w1","Ядро рабочей лексики",5],["w2","История Джона",5],["w3","Глаголы действия",5],
  ["w4","Словообразование",5],["w5","Оценка и качество",5],["w6","Остаток",3]];
function activeEng(){ const s=data.sections.find(x=>x.id===data.active); return s&&s.kind==="english"?s:null; }
/* ---- Время раздела «Английский» ----
   Три источника: хронометраж прямо из данных (TW_LESSONS, YA_MIN), фиксированная
   оценка на единицу (TIME_EST) и ручной ввод минут в ежедневных трекерах.
   Целей по минутам нет намеренно: цифра отвечает на вопрос «куда уходит время»,
   а не «выполнила ли норму». */
function engTimeParts(e,mon){
  const out=[], add=(label,min)=>{ if(min>0) out.push({label,min}); };
  add('Gravity Falls', gvWeek(e.gravity,mon)*GV_EP_MIN);   // все серии одной длины, ручной ввод не нужен
  add('Практика Инглекс', dtWeekMin(e,'scene',mon));
  add('Шэдоуинг', dtWeekMin(e,'shadow',mon));
  add('Занятие с преподавателем', lsWeekMin(e,mon));
  add('Занятия с носителями', engSpeakWeekMin(e,mon));
  add('Гарри Поттер', dtWeekMin(e,'hp',mon));
  add('Голосовая практика', dtWeekMin(e,'wdaily',mon));
  add('Anki', dtWeekMin(e,'anki',mon));
  add('20 уроков', tlogWeek(e,'tw',mon));
  add('Курс W3Cx', tlogWeek(e,'ax',mon));
  add('Яндекс.Практикум', tlogWeek(e,'ya',mon));
  add('Теория грамматики', tlogWeek(e,'th',mon));
  return out.sort((a,b)=>b.min-a.min); }
function engWeekMin(e,mon){ return engTimeParts(e,mon).reduce((a,p)=>a+p.min,0); }
/* Ведущая метрика цели «свободно общаться»: всё, где работает рот, а не пальцы. */
function engSpeakMin(e,mon){ return dtWeekMin(e,'shadow',mon)+dtWeekMin(e,'wdaily',mon)+lsWeekMin(e,mon)+engSpeakWeekMin(e,mon); }
function renderEng(){ const sec=activeEng(); if(!sec)return; document.getElementById("view").innerHTML=englishHTML(sec); applyCardLayout(sec); }
function renderEngList(){ const sec=activeEng(); if(!sec)return; const el=document.getElementById("engList"); if(el) el.innerHTML=engListHTML(sec.english); }
function refreshEngDash(){ const sec=activeEng(); if(!sec)return; const e=sec.english; const pct=sectionProgress(sec);
  const r=document.getElementById("engRing"); if(r)r.innerHTML=ring(pct,132,12,'var(--a-green)',true);
  const m=engWeekMin(e,mondayOf(todayStr())); const st=document.getElementById("engStat"); if(st)st.textContent=m?fmtMin(m):"—"; }
function yaKey(i){ return "y"+i; }
function yaTotal(){ return YA_PROGRAM.length; }
function yaDone(e){ let n=0; for(let i=0;i<YA_PROGRAM.length;i++){ if(e.yandex.done[yaKey(i)]) n++; } return n; }
function engWeeks(e){ return e.config.cycleWeeks||12; }
function engCycleWeek(e){ if(!e.config.startDate) return 0; const ms=new Date(todayStr()+"T00:00:00")-new Date(e.config.startDate+"T00:00:00"); const d=Math.floor(ms/86400000)+1; return Math.min(Math.max(1,Math.ceil(d/7)),engWeeks(e)); }
function engListHTML(e){
  const q=(document.getElementById("engSearch")?document.getElementById("engSearch").value:"").trim().toLowerCase();
  const wk=yaWeekMap(), wexp=e.yandex.wexp||{};
  const groups=Array.from({length:12},()=>[]); YA_PROGRAM.forEach((L,i)=>groups[wk[i]].push(i));
  const firstInc=groups.findIndex(idxs=>idxs.some(i=>!e.yandex.done[yaKey(i)]));
  const forceOpen=(engFilter==="left"||q!=="");
  let html="";
  for(let w=0;w<12;w++){ const idxs=groups[w]; if(!idxs.length) continue;
    const vis=idxs.filter(i=>{ const dn=!!e.yandex.done[yaKey(i)]; if(engFilter==="left"&&dn) return false; if(q&&!YA_PROGRAM[i][1].toLowerCase().includes(q)) return false; return true; });
    if((engFilter==="left"||q)&&!vis.length) continue;
    const doneCount=idxs.filter(i=>e.yandex.done[yaKey(i)]).length, full=doneCount===idxs.length, mins=idxs.reduce((a,i)=>a+YA_MIN[i],0), p2=idxs.length?doneCount/idxs.length:0;
    const open=(w in wexp)?wexp[w]:(forceOpen?true:(w===firstInc));
    const DPW=7, nDays=Math.min(DPW,idxs.length); const dayChunks=[]; { let start=0; for(let d=0;d<nDays;d++){ const size=Math.ceil((idxs.length-start)/(nDays-d)); dayChunks.push(idxs.slice(start,start+size)); start+=size; } }
    const rowFor=i=>{ const dn=!!e.yandex.done[yaKey(i)]; return `<div class="step ${dn?'done':''}" onclick="yaToggle(${i})"><span class="ynum">${i+1}</span><span class="yamain"><span class="sname">${esc(YA_PROGRAM[i][1])}</span><span class="ytag">${esc(YA_PROGRAM[i][0])} · ${YA_MIN[i]} мин</span></span><span class="cbox">${svg('check')}</span></div>`; };
    let body=""; dayChunks.forEach((ch,di)=>{ const chVis=ch.filter(i=>vis.indexOf(i)>=0); if(!chVis.length) return; const dDone=ch.filter(i=>e.yandex.done[yaKey(i)]).length, dMin=ch.reduce((a,i)=>a+YA_MIN[i],0); body+=`<div class="dayhdr">День ${di+1} · ${dDone}/${ch.length} · ~${fmtMin(dMin)}</div>`+chVis.map(rowFor).join(""); });
    html+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="yaToggleWeek(${w},${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(p2,38,5,full?'var(--success)':'var(--a-green)',false)}</span>
        <span class="ltitle"><span class="tt">Неделя ${w+1}${w===firstInc?' <span style="color:var(--a-green); font-size:11px; font-weight:600">· текущая</span>':''}</span><span class="mm">${doneCount} из ${idxs.length} уроков · ${nDays} дн. · ~${fmtMin(mins)}</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(p2*100)}%</span>
      </div>
      <div class="lbody">${body}</div>
    </div>`; }
  return html||`<div class="emptyc">Ничего не найдено.</div>`; }
function yaToggleWeek(w,cur){ const e=activeEng().english; e.yandex.wexp=e.yandex.wexp||{}; e.yandex.wexp[w]=!cur; save(); renderEngList(); }

const GRAVITY=[
 {t:"Сезон 1", ep:["Tourist Trapped","The Legend of the Gobblewonker","Headhunters","The Hand That Rocks the Mabel","The Inconveniencing","Dipper vs. Manliness","Double Dipper","Irrational Treasure","The Time Traveler's Pig","Fight Fighters","Little Dipper","Summerween","Boss Mabel","Bottomless Pit!","The Deep End","Carpet Diem","Boyz Crazy","Land Before Swine","Dreamscaperers","Gideon Rises"]},
 {t:"Сезон 2", ep:["Scary-oke","Into the Bunker","The Golf War","Sock Opera","Soos and the Real Girl","Little Gift Shop of Horrors","Society of the Blind Eye","Blendin's Game","The Love God","Northwest Mansion Mystery","Not What He Seems","A Tale of Two Stans","Dungeons, Dungeons, & More Dungeons","The Stanchurian Candidate","The Last Mabelcorn","Roadside Attraction","Dipper and Mabel vs. the Future","Weirdmageddon Part 1","Weirdmageddon 2: Escape From Reality","Weirdmageddon 3: Take Back the Falls"]}
];
function gvKey(bi,ei){ return "s"+bi+"e"+ei; }
function gvBlockDone(g,bi){ return GRAVITY[bi].ep.reduce((a,_,ei)=>a+(g.done[gvKey(bi,ei)]?1:0),0); }
function gvTotal(){ return GRAVITY.reduce((a,b)=>a+b.ep.length,0); }
function gvAllDone(g){ return GRAVITY.reduce((a,b,bi)=>a+gvBlockDone(g,bi),0); }
function gravityCardHTML(sec){
  const e=sec.english;
  const g=e.gravity; const done=gvAllDone(g), total=gvTotal(), pct=total?done/total:0;
  let html=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Все серии примерно по ${GV_EP_MIN} минут, поэтому время считается по числу отмеченных за неделю — вписывать минуты не нужно.</p>`;
  GRAVITY.forEach((b,bi)=>{
    const bd=gvBlockDone(g,bi), tot=b.ep.length, p2=tot?bd/tot:0, full=bd===tot;
    const open=(bi in g.exp)?g.exp[bi]:(bi===0);
    const eps=b.ep.map((title,ei)=>{ const dn=!!g.done[gvKey(bi,ei)]; return `<div class="step ${dn?'done':''}" onclick="gvToggle(${bi},${ei})"><span class="ynum">${ei+1}</span><span class="sname">${esc(title)}</span><span class="cbox">${svg('check')}</span></div>`; }).join("");
    html+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="gvToggleBlock(${bi},${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(p2,38,5,full?'var(--success)':'var(--a-violet)',false)}</span>
        <span class="ltitle"><span class="tt">${esc(b.t)}</span><span class="mm">${bd} из ${tot} серий</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(p2*100)}%</span>
      </div>
      <div class="lbody"><div class="lbtns"><button class="link" onclick="event.stopPropagation();gvMarkBlock(${bi},true)">${svg('check')} Отметить сезон</button><button class="link" onclick="event.stopPropagation();gvMarkBlock(${bi},false)">Снять</button></div>${eps}</div>
    </div>`;
  });
  return cardWrap(sec,'gv','Gravity Falls',done+'/'+total+' серий',pct,'var(--a-violet)',html);
}
function gvToggle(bi,ei){ const g=activeEng().english.gravity; const k=gvKey(bi,ei); if(g.done[k]) delete g.done[k]; else g.done[k]=1; mstamp("gv:"+k); save(); renderEng(); }
function gvToggleBlock(bi,cur){ const g=activeEng().english.gravity; g.exp[bi]=!cur; save(); renderEng(); }
function gvMarkBlock(bi,val){ const g=activeEng().english.gravity; GRAVITY[bi].ep.forEach((_,ei)=>{ const k=gvKey(bi,ei); if(val) g.done[k]=1; else delete g.done[k]; mstamp("gv:"+k); }); save(); renderEng(); }
/* ---- Теория Практикума (грамматика) ---- */
const YA_THEORY=[
"Времена и грамматические структуры английского языка","Present Simple","Present Continuous","Present Perfect","Present Perfect Continuous","Past Simple","Past Continuous","Past Perfect","Список неправильных глаголов","Future Simple","Present Continuous для будущего","Как говорить о будущем",
"«There is» и «there are»","«There is» с неисчисляемыми сущ.","Глагол «be»","Глагол «be» в Present Simple","Глаголы в Past Simple","Модальные глаголы","Модальные глаголы, выражающие вероятность и предположение","Модальные глаголы, выражающие долженствование, запрет и разрешение","Модели управления глаголов (A2)","Модели управления глаголов (B1)",
"Ед. и мн.ч. существительных","Количественные числительные","Порядковые числительные","Указатели количества","Вопросительные слова","Разделительные вопросы","Порядок слов","Артикли","Предлоги","Союзы","Притяжательные местоимения","Указательные местоимения","Количественные местоимения",
"Наречия частотности","Как говорить про время","Сезоны, месяцы, дни недели","Календарные даты","Части речи","Члены предложения","Использование «going to»","«Like» в настоящем времени","Сравнительные прилагательные","Превосходная степень","Типы существительных","Повелительное наклонение",
"Условные предложения нулевого типа","Условные предложения первого типа","Условные предложения второго типа","Условные предложения третьего типа","«Used to»","Косвенная речь","Пассивный залог"
];
function thKey(i){ return "t"+i; }
function thTotal(){ return YA_THEORY.length; }
function thDone(e){ let n=0; for(let i=0;i<YA_THEORY.length;i++) if(e.theory.done[thKey(i)]) n++; return n; }
function thWeek(e,mon){ let n=0; for(let i=0;i<YA_THEORY.length;i++){ const k=thKey(i); if(e.theory.done[k]&&tsInWeek("th:"+k,mon))n++; } return n; }
function thToggle(i){ const e=activeEng().english; const k=thKey(i); if(e.theory.done[k]) delete e.theory.done[k]; else e.theory.done[k]=1; mstamp("th:"+k); save(); renderEng(); }
function thToggleOpen(){ const e=activeEng().english; e.theory.open=!e.theory.open; save(); renderEng(); }
function engToggleSpeak(){ const e=activeEng().english; const cur=e.speakOpen!==false; e.speakOpen=!cur; save(); renderEng(); }

/* ---- Introduction to Web Accessibility ---- */
const A11Y_COURSE=[
 {t:"Course information", v:["Welcome to «Introduction to Web Accessibility»","Course outline, grading, and certificate","Course discussion forums","Time to practice"]},
 {t:"Module 1: What is Web Accessibility", v:["1.1 Introduction","1.2 Technology enabling people with disabilities","1.3 Accessibility is for everyone","1.4 Conclusion"],
  /* s — необязательные подпункты раздела. Названия сняты с бокового меню edX
     и частью обрезаны многоточием: их можно править свободно, ключи позиционные. */
  s:{ 0:["1.1.1 Welcome to Module 1","1.1.2 What you will learn - M…","1.1.3 Module introduction by …"],
      1:["1.2.1 Accessibility is about pe…","1.2.2 Knowledge check","1.2.3 Demo: Introduction to s…","1.2.4 Accessibility of life and …","1.2.5 Some other people who…","1.2.6 More people (who don't…","1.2.7 Knowledge check","1.2.8 Activity - Use the web w…","1.2.9 Demo: Reading with an…","1.2.10 Activity: Browsing with…","1.2.11 Web accessibility imp…","1.2.12 Optional Activity: Vide…"],
      2:["1.3.1 Scope of Accessibility","1.3.2 Web Accessibility is…","1.3.3 Knowledge check","1.3.4 Activity: Challenging as…","1.3.5 Benefits to others","1.3.6 WAI Perspectives videos","1.3.7 Demo: benefits to all us…","1.3.8 Disability is mismatche…","1.3.9 Knowledge check","1.3.10 Activity: overview of w…","1.3.11 Accessibility is built in …"],
      3:["1.4.1 Final thoughts","1.4.2 Assessment - Module 1"] } },
 {t:"Module 2: People and Digital Technology", v:["2.1 Introduction","2.2 Assistive technologies and adaptive strategies","2.3 Physical and visual","2.4 Hearing and speech","2.5 Cognition and learning","2.6 Where people meet digital technology","2.7 Conclusion"],
  s:{ 0:["2.1.1 Welcome to Module 2","2.1.2 What you will learn - M…"],
      1:["2.2.1 Understanding technology","2.2.2 Knowledge checks"],
      2:["2.3.1 Physical disabilities","2.3.2 Switch controls","2.3.3 Speech input","2.3.4 Demo: Kim and speech…","2.3.5 Knowledge check","2.3.6 Activity - Browsing with…","2.3.7 Blindness","2.3.8 Screen readers","2.3.9 Demo: Anthony and his…","2.3.10 Demo: Anthony and hi…","2.3.11 Activity - Using iOS Vo…","2.3.12 Knowledge check","2.3.13 Low vision","2.3.14 Screen magnification","2.3.15 Demo: Juan and scre…","2.3.16 Knowledge check"],
      3:["2.4.1 Hearing disabilities","2.4.2 Speech disabilities","2.4.3 Activity - Closed captio…","2.4.4 Knowledge check"],
      4:["2.5.1 Cognitive and learning …","2.5.2 Commonly encountere…","2.5.3 Meet Franziska","2.5.4 Browser settings and c…","2.5.5 Activity - Customizing c…","2.5.6 Knowledge check","2.5.7 Resources"],
      5:["2.6.1 Essential components …","2.6.2 Technology","2.6.3 Standards and technica…","2.6.4 People","2.6.5 Knowledge check","2.6.6 Bringing it all together","2.6.7 Activity - Contact a pers…"],
      6:["2.7.1 Final thoughts","2.7.2 Assessment - Module 2"] } },
 {t:"Module 3: Business Cases and Benefits", v:["3.1 Introduction","3.2 Discovering who is impacted by digital accessibility","3.3 Understanding the return on investment potential","3.4 Conclusion"],
  s:{ 0:["3.1.1 Welcome to Module 3","3.1.2 What you will learn - M…","3.1.3 Introduction to the vide…"],
      1:["3.2.1 Accessibility is a necessity","3.2.2 Change to be competitive","3.2.3 Knowledge check","3.2.4 The electronic curb-cut","3.2.5 Accessibility and older …","3.2.6 Knowledge check","3.2.7 Accessibility and mobil…","3.2.8 Knowledge check","3.2.9 Reviewing the advanta…","3.2.10 Activity - Build your bu…"],
      2:["3.3.1 Understanding the return","3.3.2 Convincing the manage…","3.3.3 Accessibility and brand …","3.3.4 Knowledge check","3.3.5 Accessibility and huma…","3.3.6 Accessibility and legisla…","3.3.7 Activity - Laws and poli…","3.3.8 Knowledge check","3.3.9 Being a recognized leader","3.3.10 Activity - Adding to yo…"],
      3:["3.4.1 Final thoughts","3.4.2 Assessment - Module 3"] } },
 {t:"Module 4: Principles, Standards and Checks", v:["4.1 Introduction","4.2 W3C accessibility standards","4.3 Principle 1 - Perceivable","4.4 Principle 2 - Operable","4.5 Principle 3 - Understandable","4.6 Principle 4 - Robust","4.7 Conclusion"],
  s:{ 0:["4.1.1 Welcome to Module 4","4.1.2 What you will learn - M…"],
      1:["4.2.1 Overview","4.2.2 POUR principles","4.2.3 Activity - Accessibility g…","4.2.4 Harmonized standards","4.2.5 Assessment - Standards","4.2.6 Introduction to hands-o…"],
      2:["4.3.1 Text alternatives","4.3.2 Checking for text altern…","4.3.3 Knowledge check","4.3.4 Time-based media","4.3.5 Checking for media alte…","4.3.6 Knowledge check","4.3.7 Adaptable content","4.3.8 Checking headings","4.3.9 Checking structure","4.3.10 Knowledge check","4.3.11 Distinguishable content","4.3.12 Checking contrast ratio","4.3.13 Checking text resize","4.3.14 Knowledge check","4.3.15 Discussion","4.3.16 Assessment - Perceiv…"],
      3:["4.4.1 Keyboard accessible","4.4.2 Checking keyboard acc…","4.4.3 Knowledge check","4.4.4 Enough time","4.4.5 Knowledge check","4.4.6 Avoid seizures and phy…","4.4.7 Checking for moving, fl…","4.4.8 Knowledge check","4.4.9 Navigable content","4.4.10 Checking page titles","4.4.11 Knowledge check","4.4.12 Input modalities","4.4.13 Knowledge check","4.4.14 Discussion","4.4.15 Assessment - Operable"],
      4:["4.5.1 Readable content","4.5.2 Knowledge check","4.5.3 Predictable content","4.5.4 Knowledge check","4.5.5 Input assistance","4.5.6 Checking forms","4.5.7 Knowledge check","4.5.8 Discussion","4.5.9 Assessment - Understa…"],
      5:["4.6.1 Compatible content","4.6.2 Accessible Rich Interne…","4.6.3 Knowledge check","4.6.4 How to meet WCAG (Q…","4.6.5 Discussion","4.6.6 Assessment - Robust"],
      6:["4.7.1 Final thoughts"] } },
 {t:"Module 5: Getting Started with Accessibility in your Organization", v:["5.1 Introduction","5.2 Discover and plan","5.3 Implement and maintain","5.4 Conclusion"],
  s:{ 0:["5.1.1 Welcome to this module","5.1.2 What you will learn - M…"],
      1:["5.2.1 Introduction to discover…","5.2.2 Explore your current en…","5.2.3 Reviewing authoring tools","5.2.4 Activity - Explore your e…","5.2.5 Set objectives and alloc…","5.2.6 Gather support and rais…","5.2.7 Introducing accessibilit…","5.2.8 Create your accessibilit…","5.2.9 Create your accessibilit…","5.2.10 Activity - Accessibility …","5.2.11 Create a monitoring fr…","5.2.12 Knowledge check"],
      2:["5.3.1 Introduction to impleme…","5.3.2 Accessibility and roles","5.3.3 Roles and responsibilities","5.3.4 Activity - Roles","5.3.5 Build and maintain skills","5.3.6 Activity - Potential training","5.3.7 Create accessibility","5.3.8 Involve users","5.3.9 Involving users","5.3.10 Monitor changes","5.3.11 Importance of monitori…","5.3.12 Activity - Monitor chan…","5.3.13 Continue engagement","5.3.14 Knowledge check"],
      3:["5.4.1 Final thoughts","5.4.2 Assessment - Module 5"] } },
 {t:"Course Conclusion and Next Steps", v:["Summary and next steps","Course evaluation survey","Acknowledgements","Thank you!"]}
];
function axKey(bi,vi){ return "m"+bi+"i"+vi; }
/* Третий уровень курса. Ключ подпункта = ключ раздела + "s"+индекс, поэтому
   старые отметки разделов (m1i1) остаются валидными и ничего не обнуляется.
   Раздел, отмеченный по-старому, считается пройденным целиком. */
function axSubs(bi,vi){ const b=A11Y_COURSE[bi]; return (b.s&&b.s[vi])||null; }
function axSKey(bi,vi,si){ return axKey(bi,vi)+"s"+si; }
function axLeaves(){ const out=[]; A11Y_COURSE.forEach((b,bi)=>b.v.forEach((_,vi)=>{ const sub=axSubs(bi,vi);
  if(sub) sub.forEach((t,si)=>out.push({bi,vi,si,k:axSKey(bi,vi,si),t,sec:axKey(bi,vi)}));
  else out.push({bi,vi,si:null,k:axKey(bi,vi),t:A11Y_COURSE[bi].v[vi],sec:axKey(bi,vi)}); })); return out; }
function axLeafDone(a,x){ return !!(a.done[x.k]||(x.si!==null&&a.done[x.sec])); }
function axItemTotal(bi,vi){ const sub=axSubs(bi,vi); return sub?sub.length:1; }
function axItemDone(a,bi,vi){ const sub=axSubs(bi,vi); if(!sub) return a.done[axKey(bi,vi)]?1:0;
  if(a.done[axKey(bi,vi)]) return sub.length;
  return sub.reduce((n,_,si)=>n+(a.done[axSKey(bi,vi,si)]?1:0),0); }
function axItemFull(a,bi,vi){ return axItemDone(a,bi,vi)===axItemTotal(bi,vi); }
function axBlockTotal(bi){ return A11Y_COURSE[bi].v.reduce((n,_,vi)=>n+axItemTotal(bi,vi),0); }
function axBlockDone(a,bi){ return A11Y_COURSE[bi].v.reduce((n,_,vi)=>n+axItemDone(a,bi,vi),0); }
function axTotal(){ return A11Y_COURSE.reduce((n,_,bi)=>n+axBlockTotal(bi),0); }
function axAllDone(a){ return A11Y_COURSE.reduce((n,_,bi)=>n+axBlockDone(a,bi),0); }
function axWeek(a,mon){ return axLeaves().filter(x=>axLeafDone(a,x)&&tsInWeek("ax:"+x.k,mon)).length; }
/* Минуты пункта курса больше не вводятся: время живёт в журнале по дням (tlog).
   Поле a11y.min оставлено в данных — там могут быть старые записи. */
function axToggle(bi,vi){ const e=engData(); if(!e)return; const a=e.a11y; const sub=axSubs(bi,vi), k=axKey(bi,vi);
  if(!sub){ if(a.done[k]) delete a.done[k]; else a.done[k]=1; mstamp("ax:"+k); }
  else { const full=axItemFull(a,bi,vi); if(a.done[k]){ delete a.done[k]; mstamp("ax:"+k); }
    sub.forEach((_,si)=>{ const sk=axSKey(bi,vi,si); if(full) delete a.done[sk]; else a.done[sk]=1; mstamp("ax:"+sk); }); }
  save(); render(); }
function axSubToggle(bi,vi,si){ const e=engData(); if(!e)return; const a=e.a11y, sk=axSKey(bi,vi,si), k=axKey(bi,vi);
  if(a.done[k]){ delete a.done[k]; mstamp("ax:"+k);            // разворачиваем старую отметку раздела в подпункты
    (axSubs(bi,vi)||[]).forEach((_,j)=>{ const j2=axSKey(bi,vi,j); a.done[j2]=1; mstamp("ax:"+j2); }); }
  if(a.done[sk]) delete a.done[sk]; else a.done[sk]=1; mstamp("ax:"+sk); save(); render(); }
function axToggleBlock(bi,cur){ const e=engData(); if(!e)return; e.a11y.exp[bi]=!cur; save(); render(); }
function axMarkBlock(bi,val){ const e=engData(); if(!e)return; const a=e.a11y;
  A11Y_COURSE[bi].v.forEach((_,vi)=>{ const k=axKey(bi,vi), sub=axSubs(bi,vi);
    if(sub){ if(a.done[k]){ delete a.done[k]; mstamp("ax:"+k); }
      sub.forEach((_,si)=>{ const sk=axSKey(bi,vi,si); if(val) a.done[sk]=1; else delete a.done[sk]; mstamp("ax:"+sk); }); }
    else { if(val) a.done[k]=1; else delete a.done[k]; mstamp("ax:"+k); } });
  save(); render(); }
function a11yCardHTML(e,wsec){
  const a=e.a11y; const done=axAllDone(a), total=axTotal(), pct=total?done/total:0;
  const descr=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Курс на английском: слушаешь, читаешь и выписываешь карточки. Двойная польза — язык + доступность. Минуты ставь в тот день, когда занималась, — полоска ниже.</p>`;
  let blocks=``;
  A11Y_COURSE.forEach((b,bi)=>{ const bd=axBlockDone(a,bi), tot=axBlockTotal(bi), p2=tot?bd/tot:0, full=bd===tot; const open=(bi in a.exp)?a.exp[bi]:(bi===0);
    const rows=b.v.map((title,vi)=>{ const k=axKey(bi,vi), sub=axSubs(bi,vi), full=axItemFull(a,bi,vi);
      if(!sub) return `<div class="step ${full?'done':''}" onclick="axToggle(${bi},${vi})"><span class="tic video" style="background:rgba(93,214,232,.16); color:var(--a-cyan)">${svg('play')}</span><span class="sname">${esc(title)}</span><span class="cbox">${svg('check')}</span></div>`;
      const dn=axItemDone(a,bi,vi);
      const head=`<div class="step secrow ${full?'done':''}" onclick="axToggle(${bi},${vi})"><span class="tic video" style="background:rgba(93,214,232,.16); color:var(--a-cyan)">${svg('play')}</span><span class="sname"><b>${esc(title)}</b> <small style="color:var(--muted-2)">${dn}/${sub.length}</small></span><span class="cbox">${svg('check')}</span></div>`;
      return head+sub.map((st,si)=>{ const sk=axSKey(bi,vi,si), sd=!!(a.done[sk]||a.done[k]);
        return `<div class="step substep ${sd?'done':''}" onclick="axSubToggle(${bi},${vi},${si})"><span class="sname">${esc(st)}</span><span class="cbox">${svg('check')}</span></div>`; }).join(""); }).join("");
    blocks+=`<div class="lesson ${full?'done':''} ${open?'open':''}">
      <div class="lhead" onclick="axToggleBlock(${bi},${open})">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(p2,38,5,full?'var(--success)':'var(--a-cyan)',false)}</span>
        <span class="ltitle"><span class="tt">${esc(b.t)}</span><span class="mm">${bd} из ${tot}</span></span>
        <span class="lbadge ${full?'full':''}">${Math.round(p2*100)}%</span>
      </div>
      <div class="lbody"><div class="lbtns"><button class="link" onclick="event.stopPropagation();axMarkBlock(${bi},true)">${svg('check')} Отметить модуль</button><button class="link" onclick="event.stopPropagation();axMarkBlock(${bi},false)">Снять</button></div>${rows}</div>
    </div>`; });
  const wmin=tlogWeek(e,'ax',tlogMonOf());
  return cardWrap(wsec,'a11y','Introduction to Web Accessibility',done+'/'+total+' уроков'+(wmin?' · '+fmtMin(wmin)+' за неделю':' · '+A11Y_COURSE.length+' модулей'),pct,'var(--a-cyan)',descr+tlogRowHTML('english','ax')+blocks);
}

/* ---- Английский за 20 уроков (экспресс-курс) ---- */
const TW_LESSONS=["2:27:10","1:17:59","53:53","48:21","1:03:55","42:50","51:43","32:45","30:52","33:31","49:40","32:45","34:40","52:42","49:21","36:29","26:57","43:39","1:18:21","31:12"];
function twKey(i){ return "u"+i; }
function twTotal(){ return TW_LESSONS.length; }
function twDone(e){ let n=0; for(let i=0;i<TW_LESSONS.length;i++) if(e.twenty.done[twKey(i)]) n++; return n; }
function twSecs(s){ const p=String(s).split(":").map(Number); return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]; }
function twAllMin(){ return Math.round(TW_LESSONS.reduce((a,s)=>a+twSecs(s),0)/60); }
function twDoneMin(e){ let s=0; TW_LESSONS.forEach((d,i)=>{ if(e.twenty.done[twKey(i)]) s+=twSecs(d); }); return Math.round(s/60); }
function twWeek(e,mon){ let n=0; for(let i=0;i<TW_LESSONS.length;i++){ const k=twKey(i); if(e.twenty.done[k]&&tsInWeek("tw:"+k,mon))n++; } return n; }
function twToggle(i){ const e=activeEng().english; const k=twKey(i); if(e.twenty.done[k]) delete e.twenty.done[k]; else e.twenty.done[k]=1; mstamp("tw:"+k); save(); renderEng(); }
function twMarkAll(val){ const e=activeEng().english; TW_LESSONS.forEach((_,i)=>{ const k=twKey(i); if(val) e.twenty.done[k]=1; else delete e.twenty.done[k]; mstamp("tw:"+k); }); save(); renderEng(); }
function twentyCardHTML(sec){
  const e=sec.english;
  const done=twDone(e), total=twTotal(), pct=total?done/total:0;
  let html=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Экспресс-курс с нуля, плейлист из 20 видео (A0 → C1). Длинный урок можно смотреть частями — отмечай, когда досмотрела до конца. Просмотрено ${fmtMin(twDoneMin(e))} из ~${fmtMin(twAllMin())}.</p>`;
  html+=tlogRowHTML('english','tw');
  html+=`<div class="lbtns"><button class="link" onclick="event.stopPropagation();twMarkAll(true)">${svg('check')} Отметить все</button><button class="link" onclick="event.stopPropagation();twMarkAll(false)">Снять отметки</button></div>`;
  html+=TW_LESSONS.map((dur,i)=>{ const dn=!!e.twenty.done[twKey(i)];
    return `<div class="step ${dn?'done':''}" onclick="twToggle(${i})"><span class="ynum">${i+1}</span><span class="tic video" style="background:rgba(108,140,255,.16); color:var(--video)">${svg('play')}</span><span class="sname">Урок ${i+1}</span><span class="ytag">${dur}</span><span class="cbox">${svg('check')}</span></div>`; }).join("");
  return cardWrap(sec,'tw','Английский за 20 уроков',done+'/'+total+' уроков',pct,'var(--a-blue)',html);
}

/* ================= Журнал минут по дням =================
   Время курса привязано ко ДНЮ занятия, а не к моменту галочки. Иначе длинный
   урок, начатый на прошлой неделе и отмеченный на этой, целиком падал в текущую
   неделю — и цифра врала. Галочки остались про прогресс, минуты живут отдельно.
   Ключ плоский: "<курс>|<дата>", метка tl:<ключ>. */
function tlogMonOf(){ if(!tlogMon) window.tlogMon=mondayOf(todayStr()); return tlogMon; }
function tlogShift(n){ window.tlogMon=dateAddDays(tlogMonOf(),n*7); render(); }
function tlogOwner(kind){ const s=data.sections.find(x=>x.kind===kind); return s?s[kind]:null; }
function tlogKey(k,ds){ return k+"|"+ds; }
function tlogGet(st,k,ds){ return ((st&&st.tlog)||{})[tlogKey(k,ds)]||0; }
function tlogWeek(st,k,mon){ let n=0; for(let i=0;i<7;i++) n+=tlogGet(st,k,dateAddDays(mon,i)); return n; }
function tlogTotal(st,k){ const t=(st&&st.tlog)||{}; return Object.keys(t).filter(x=>x.indexOf(k+"|")===0).reduce((a,x)=>a+(t[x]||0),0); }
function tlogSet(kind,k,ds,v){ const st=tlogOwner(kind); if(!st) return;
  const t=String(v==null?"":v).trim(), n=parseInt(t,10);
  if(t!=="" && !(n>=1&&n<=600)) return;                    // вне 1–600 — молча игнорируем
  st.tlog=st.tlog||{}; const key=tlogKey(k,ds);
  if(t==="") delete st.tlog[key]; else st.tlog[key]=n;
  mstamp("tl:"+key); save(); render(); }
function tlogRowHTML(kind,k,hint){
  const st=tlogOwner(kind), mon=tlogMonOf(), cur=mondayOf(todayStr()), tot=tlogWeek(st,k,mon);
  const cells=WD.map((lb,i)=>{ const ds=dateAddDays(mon,i), v=tlogGet(st,k,ds);
    return `<div class="tlcell ${ds===todayStr()?'today':''}"><span>${lb}</span><input class="tlin" type="number" inputmode="numeric" min="1" max="600" value="${v||''}" aria-label="Минут ${ruDate(ds)}" onclick="event.stopPropagation()" onchange="tlogSet('${kind}','${k}','${ds}',this.value)"></div>`; }).join("");
  return `<div class="tlbox">
    <div class="tlhead"><span>Минуты по дням</span>
      <span class="weeknav sm"><button aria-label="Раньше" onclick="event.stopPropagation();tlogShift(-1)">‹</button><span>${ruDate(mon)} — ${ruDate(dateAddDays(mon,6))}${mon===cur?' · текущая':''}</span><button aria-label="Позже" onclick="event.stopPropagation();tlogShift(1)">›</button></span>
      <b>${tot?fmtMin(tot):'—'}</b></div>
    <div class="tlrow">${cells}</div>
    <p class="tlhint">${hint||'Ставь минуты в тот день, когда слушала. Галочки уроков остаются про прогресс — на недельное время они не влияют.'}</p></div>`; }

/* ---- Ежедневные трекеры английского (Gemini голосом + Гарри Поттер письмом) ---- */
const DT={
  shadow:{ title:"Шэдоуинг", pfx:"sh:", color:"var(--a-amber)", sec:"english", hasMin:true,
    sub:"Повторяю за диктором вслух, синхронно. Пять минут в день делают больше, чем час раз в неделю.",
    ph:"по чему шэдоуила" },
  scene:{ title:"Практика Инглекс", pfx:"sc:", color:"var(--a-violet)", sec:"english", hasMin:true,
    sub:"Готовый разбор: смотрю и практикую вслед за ним. Это работа, а не просмотр — просмотр отмечается в Gravity Falls.",
    ph:"что смотрела / что разбирала" },
  wdaily:{ title:"Голосовая практика с Gemini", pfx:"wd:", color:"var(--a-rose)", sec:"english", hasMin:true,
    sub:"Говорю с Gemini голосом каждый день. Даже пара фраз вслух — уже отметка: рот должен работать, а не пальцы.",
    ph:"о чём говорила (по желанию)" },
  hp:{ title:"Гарри Поттер · переписываю по-английски", pfx:"hp:", color:"var(--a-amber)", sec:"english", hasMin:true,
    sub:"Переписываю кусочек текста каждый день. Хоть абзац — главное постоянство.",
    ph:"глава / сколько переписала" },
  anki:{ title:"Карточки Анки", pfx:"ak:", color:"var(--a-cyan)", sec:"english", hasMin:true,
    sub:"Прогоняю колоду каждый день. Даже пять карточек — уже отметка.",
    ph:"сколько карточек / какая колода" },
  apply:{ title:"Поиск работы · отклики", pfx:"ap:", color:"var(--a-green)", sec:"career", hasMin:true,
    sub:"Каждый день понемногу: посмотреть вакансии, отправить отклик, написать рекрутеру.",
    ph:"куда откликнулась / что сделала" }
};
/* Конфиг трекера: либо из DT (зашитые), либо синтезируется из habit-блока конструктора.
   Ключ k для конструктора — id блока, префикс меток cb:<id>. — один на всю запись дня. */
function dtCfg(k){ if(DT[k]) return DT[k];
  const f=cbFind(k); if(f&&f.b.type==="habit") return {title:f.b.name, pfx:"cb:"+f.b.id+".", color:f.sec.color, sec:"custom", hasMin:true, sub:"", ph:f.b.ph||"заметка (по желанию)"};
  return null; }
function dtOwner(k){ if(!DT[k]){ const f=cbFind(k); return (f&&f.b.type==="habit")?cbDtWrap(f.b):null; }
  const kind=DT[k].sec||"english"; const s=data.sections.find(x=>x.kind===kind); return s?s[kind]:null; }
function dtRender(k){ if(!DT[k]){ render(); return; } if((DT[k].sec||"english")==="career") renderCareer(); else renderEng(); }
function dtStore(e,k){ e[k]=e[k]||{days:{}}; e[k].days=e[k].days||{}; return e[k]; }
function dtDay(e,k,ds){ return dtStore(e,k).days[ds]||{}; }
function dtMonOf(k){ if(!dtMon[k]) dtMon[k]=mondayOf(todayStr()); return dtMon[k]; }
function dtShift(k,n){ dtMon[k]=dateAddDays(dtMonOf(k),n*7); dtRender(k); }
function dtToggle(k,ds){ const e=dtOwner(k); if(!e)return; const st=dtStore(e,k); const d=st.days[ds]||(st.days[ds]={done:false,note:""}); d.done=!d.done; if(!d.done&&!String(d.note||"").trim()) delete st.days[ds]; mstamp(dtCfg(k).pfx+ds); save(); dtRender(k); }
function dtNote(k,ds,v){ const e=dtOwner(k); if(!e)return; const st=dtStore(e,k); const d=st.days[ds]||(st.days[ds]={done:false,note:""}); d.note=v; if(!d.done&&!String(v||"").trim()) delete st.days[ds]; mstamp(dtCfg(k).pfx+ds); mstamp(dtCfg(k).pfx+ds+"~n"); save(); }
/* Минуты дня. Отдельной метки нет намеренно: запись дня сливается целиком,
   так же как done и note. Ввод минут НЕ ставит галочку — это разные вещи. */
function dtMin(k,ds,v){ const e=dtOwner(k); if(!e)return; const st=dtStore(e,k);
  const s=String(v==null?"":v).trim(), n=parseInt(s,10);
  if(s!=="" && !(n>=1&&n<=600)) return;                 // вне 1–600 — молча игнорируем
  const d=st.days[ds]||(st.days[ds]={done:false,note:""});
  if(s==="") delete d.min; else d.min=n;
  if(!d.done&&!String(d.note||"").trim()&&!d.min) delete st.days[ds];
  mstamp(dtCfg(k).pfx+ds); save(); dtRender(k); }
function dtWeekCount(e,k,mon){ let n=0; for(let i=0;i<7;i++) if(dtDay(e,k,dateAddDays(mon,i)).done) n++; return n; }
function dtWeekMin(e,k,mon){ let n=0; for(let i=0;i<7;i++) n+=dtDay(e,k,dateAddDays(mon,i)).min||0; return n; }
function dtTotal(e,k){ const d=dtStore(e,k).days; return Object.keys(d).filter(x=>d[x].done).length; }
function dtStreak(e,k){ let d=todayStr(); if(!dtDay(e,k,d).done) d=dateAddDays(d,-1); let n=0; while(dtDay(e,k,d).done){ n++; d=dateAddDays(d,-1); } return n; }
function dtBest(e,k){ const st=dtStore(e,k).days; const ds=Object.keys(st).filter(x=>st[x].done).sort(); let best=0,cur=0,prev=null; ds.forEach(x=>{ cur=(prev&&dateAddDays(prev,1)===x)?cur+1:1; if(cur>best)best=cur; prev=x; }); return best; }
function dtFirstMon(e,k){ const st=dtStore(e,k).days; const ds=Object.keys(st).sort(); return ds.length?mondayOf(ds[0]):mondayOf(todayStr()); }
function dailyCardHTML(sec,k){
  const e=DT[k]?uiStore(sec):dtOwner(k);          // для habit-блоков конструктора — обёртка вокруг блока
  const cfg=dtCfg(k), mon=dtMonOf(k), cur=mondayOf(todayStr());
  const cnt=dtWeekCount(e,k,mon), streak=dtStreak(e,k), best=dtBest(e,k), tot=dtTotal(e,k), wmin=dtWeekMin(e,k,mon);
  let rows="";
  for(let i=0;i<7;i++){ const ds=dateAddDays(mon,i), d=dtDay(e,k,ds), fut=ds>todayStr();
    rows+=`<div class="dayrow ${d.done?'done':''} ${fut?'fut':''}">
      <button class="check ${d.done?'on':''}" aria-label="Отметить ${ruDate(ds)}" onclick="dtToggle('${k}','${ds}')">${svg('check')}</button>
      <span class="dayrow-lab"><b>${WD[i]}</b> ${ruDate(ds)}${ds===todayStr()?' <small>· сегодня</small>':''}</span>
      <input class="dayrow-note" type="text" value="${esc(d.note||'')}" placeholder="${cfg.ph}" oninput="dtNote('${k}','${ds}',this.value)">
      ${cfg.hasMin?`<span class="minbox"><input class="minbox-in" type="number" inputmode="numeric" min="1" max="600" value="${d.min||''}" aria-label="Минут ${ruDate(ds)}" onchange="dtMin('${k}','${ds}',this.value)"><i>мин</i></span>`:''}
    </div>`; }
  const first=dtFirstMon(e,k); let hist="", m=cur, guard=0;
  while(m>=first&&guard<12){ const c=dtWeekCount(e,k,m);
    hist+=`<div class="wkrow"><span class="wkr">${ruDate(m)} — ${ruDate(dateAddDays(m,6))}${m===cur?' · текущая':''}</span><span class="wkdots">${[0,1,2,3,4,5,6].map(i=>`<i class="${dtDay(e,k,dateAddDays(m,i)).done?'on':''}"></i>`).join("")}</span><span class="wkn">${c}/7</span></div>`;
    m=dateAddDays(m,-7); guard++; }
  let legacy="";
  if(k==="wdaily"){ const ws=Object.keys(e.writing||{}).filter(w=>e.writing[w]&&(e.writing[w].done||e.writing[w].note)).sort().reverse();
    if(ws.length) legacy=`<div style="font-size:13px; font-weight:600; margin:16px 0 4px">Архив недельной практики</div>`+ws.map(w=>{ const r=e.writing[w]; return `<div class="metric"><div class="micon">${svg('pencil')}</div><div class="mlabel">${esc(w)}<small>${esc((r.note||'').slice(0,70))||'без заметки'}</small></div><div class="mval">${r.done?'✓':'—'}</div></div>`; }).join(""); }
  const body=(cfg.sub?`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">${cfg.sub}</p>`:'')+`
    <div class="weeknav">
      <button aria-label="Предыдущая неделя" onclick="dtShift('${k}',-1)">‹</button>
      <span>${ruDate(mon)} — ${ruDate(dateAddDays(mon,6))}${mon===cur?' · текущая':''}</span>
      <button aria-label="Следующая неделя" onclick="dtShift('${k}',1)">›</button>
    </div>
    ${rows}
    <div class="stats" style="margin-top:16px">
      <div class="stat"><div class="n" style="color:${cfg.color}">${cnt}/7</div><div class="l">за эту неделю</div></div>
      ${cfg.hasMin?`<div class="stat"><div class="n">${wmin?fmtMin(wmin):'—'}</div><div class="l">минут за неделю</div></div>`:''}
      <div class="stat"><div class="n g">${streak}</div><div class="l">стрик, ${plural(streak,'день','дня','дней')}</div></div>
      <div class="stat"><div class="n b">${best}</div><div class="l">лучший стрик</div></div>
      <div class="stat"><div class="n">${tot}</div><div class="l">отмечено дней</div></div>
    </div>
    ${hist?`<div style="font-size:13px; font-weight:600; margin:18px 0 2px">От недели к неделе</div>${hist}`:''}
    ${legacy}`;
  return cardWrap(sec,'dt_'+k,cfg.title,cnt+'/7 за неделю'+(cfg.hasMin&&wmin?' · '+fmtMin(wmin):'')+' · стрик '+streak,cnt/7,cfg.color,body,DT[k]?'':cbEditBtn(k));
}

/* ---- Занятия с преподавателем: недельный трекер ---- */
function lsWk(e,mon){ return (e.lessons.weeks||{})[mon]||{}; }
function lsRow(e,mon){ return e.lessons.weeks[mon]||(e.lessons.weeks[mon]={done:false,note:""}); }
function lsClean(e,mon){ const w=e.lessons.weeks[mon]; if(w&&!w.done&&!String(w.note||"").trim()&&!w.min) delete e.lessons.weeks[mon]; }
function lsToggle(mon){ const e=activeEng().english; const w=lsRow(e,mon); w.done=!w.done; lsClean(e,mon); mstamp("ls:"+mon); save(); renderEng(); }
function lsNote(mon,v){ const e=activeEng().english; const w=lsRow(e,mon); w.note=v; lsClean(e,mon); mstamp("ls:"+mon); mstamp("ls:"+mon+"~n"); save(); }
function lsMin(mon,v){ const e=activeEng().english; const s=String(v==null?"":v).trim(), n=parseInt(s,10);
  if(s!=="" && !(n>=1&&n<=600)) return;
  const w=lsRow(e,mon); if(s==="") delete w.min; else w.min=n; lsClean(e,mon); mstamp("ls:"+mon); save(); renderEng(); }
function lsWeekMin(e,mon){ return lsWk(e,mon).min||0; }
function lsTotal(e){ const w=e.lessons.weeks||{}; return Object.keys(w).filter(x=>w[x].done).length; }
function lessonsCardHTML(sec){
  const e=sec.english, cur=mondayOf(todayStr());
  let rows=""; for(let i=0;i<8;i++){ const m=dateAddDays(cur,-i*7), w=lsWk(e,m);
    rows+=`<div class="dayrow ${w.done?'done':''}">
      <button class="check ${w.done?'on':''}" aria-label="Отметить неделю ${ruDate(m)}" onclick="lsToggle('${m}')">${svg('check')}</button>
      <span class="dayrow-lab"><b>${ruDate(m)} — ${ruDate(dateAddDays(m,6))}</b>${m===cur?' <small>· текущая</small>':''}</span>
      <input class="dayrow-note" type="text" value="${esc(w.note||'')}" placeholder="тема занятия / преподаватель" oninput="lsNote('${m}',this.value)">
      <span class="minbox"><input class="minbox-in" type="number" inputmode="numeric" min="1" max="600" value="${w.min||''}" aria-label="Минут за неделю ${ruDate(m)}" onchange="lsMin('${m}',this.value)"><i>мин</i></span>
    </div>`; }
  const wmin=lsWeekMin(e,cur), now=!!lsWk(e,cur).done;
  const body=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Ведущая метрика цели «свободно общаться» — минуты говорения. Занятие, шэдоуинг и голосовые складываются в одну цифру.</p>
    ${rows}
    <div class="stats" style="margin-top:16px">
      <div class="stat"><div class="n" style="color:var(--a-amber)">${now?'есть':'ещё нет'}</div><div class="l">на этой неделе</div></div>
      <div class="stat"><div class="n">${wmin?fmtMin(wmin):'—'}</div><div class="l">минут занятия</div></div>
      <div class="stat"><div class="n g">${lsTotal(e)}</div><div class="l">всего занятий</div></div>
    </div>
`;
  return cardWrap(sec,'ls','Занятия с преподавателем',(now?'на этой неделе есть':'на этой неделе ещё нет')+' · всего '+lsTotal(e),null,'var(--a-amber)',body);
}

/* ---- Очередь карточек Anki: отмечается импорт файла, а не выученность ---- */
function aqDone(e){ return ANKI_QUEUE.filter(x=>e.ankiQueue.done[x[0]]).length; }
function aqToggle(k){ const e=activeEng().english; if(e.ankiQueue.done[k]) delete e.ankiQueue.done[k]; else e.ankiQueue.done[k]=1; mstamp("aq:"+k); save(); renderEng(); }
function ankiQueueCardHTML(sec){
  const e=sec.english, d=aqDone(e);
  const body=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Шесть недель по 5 карточек. Отмечается факт импорта файла в колоду — выученность считается отдельно, при ревизии раз в месяц.</p>
    ${ANKI_QUEUE.map((x,i)=>{ const on=!!e.ankiQueue.done[x[0]];
      return `<div class="item" style="margin-bottom:8px"><div class="item-top"><button class="check ${on?'on':''}" style="--accent:var(--a-cyan)" onclick="aqToggle('${x[0]}')">${svg('check')}</button><div class="item-name ${on?'done':''}">Неделя ${i+1} · ${esc(x[1])} <small style="color:var(--muted-2)">${x[2]} ${plural(x[2],'карточка','карточки','карточек')}</small></div></div></div>`; }).join("")}`;
  return cardWrap(sec,'aq','Очередь карточек Anki',d+'/'+ANKI_QUEUE.length+' недель импортировано',d/ANKI_QUEUE.length,'var(--a-cyan)',body);
}

/* Пауза блока: общий механизм cardPause/uiPaused. Ключи — ключи карточек.
   Блок на паузе не показывается, не тянет процент раздела вниз и не идёт в отчёт. */
function engPaused(e,k){ return !!(e.paused||{})[k]; }
/* ---- Яндекс.Практикум и теория грамматики ---- */
function practicumCardHTML(sec){
  const e=sec.english;
  const done=yaDone(e), total=yaTotal(), pct=total?done/total:0;
  const openL=!!e.yandex.open;
  const body=`<div class="lesson ${(done===total&&total)?'done':''} ${openL?'open':''}">
      <div class="lhead" onclick="engToggleYa()">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(pct,38,5,'var(--a-green)',false)}</span>
        <span class="ltitle"><span class="tt">Уроки и упражнения</span><span class="mm">${done} из ${total} · по неделям и дням</span></span>
        <span class="lbadge">${Math.round(pct*100)}%</span>
      </div>
      <div class="lbody">${openL?`<div class="filterbar" style="margin:6px 0 10px">
        <div class="seg"><button id="efAll" class="${engFilter==='all'?'on':''}" onclick="event.stopPropagation();setEngFilter('all')">Все</button><button id="efLeft" class="${engFilter==='left'?'on':''}" onclick="event.stopPropagation();setEngFilter('left')">Незавершённые</button></div>
        <input class="search" id="engSearch" placeholder="Поиск по урокам..." oninput="renderEngList()" onclick="event.stopPropagation()">
      </div><div id="engList">${engListHTML(e)}</div>`:''}</div>
    </div>
`;
  return cardWrap(sec,'ya','Яндекс.Практикум',done+'/'+total+' уроков',pct,'var(--a-green)',tlogRowHTML('english','ya')+body);
}
function theoryCardHTML(sec){
  const e=sec.english; const td=thDone(e), tt=thTotal(), tp=tt?td/tt:0; const openT=!!e.theory.open;
  const body=`<div class="lesson ${(td===tt&&tt)?'done':''} ${openT?'open':''}">
      <div class="lhead" onclick="thToggleOpen()">
        <span class="chev">${svg('chev')}</span>
        <span class="lring">${ring(tp,38,5,'var(--a-cyan)',false)}</span>
        <span class="ltitle"><span class="tt">Теория · грамматика</span><span class="mm">${td} из ${tt} тем</span></span>
        <span class="lbadge">${Math.round(tp*100)}%</span>
      </div>
      <div class="lbody">${openT?YA_THEORY.map((t,i)=>{ const dn=!!e.theory.done[thKey(i)]; return `<div class="step ${dn?'done':''}" onclick="thToggle(${i})"><span class="ynum">${i+1}</span><span class="sname">${esc(t)}</span><span class="cbox">${svg('check')}</span></div>`; }).join(""):''}</div>
    </div>
`;
  return cardWrap(sec,'th','Теория · грамматика',td+'/'+tt+' тем',tp,'var(--a-cyan)',tlogRowHTML('english','th')+body);
}
function englishHTML(sec){
  const e=sec.english; const done=yaDone(e), total=yaTotal();
  const pct=sectionProgress(sec);
  const wk=engCycleWeek(e), WEEKS=engWeeks(e); const cur=mondayOf(todayStr());
  const wdW=dtWeekCount(e,'wdaily',cur), hpW=dtWeekCount(e,'hp',cur), akW=dtWeekCount(e,'anki',cur);
  const shW=dtWeekCount(e,'shadow',cur), scW=dtWeekCount(e,'scene',cur);
  const wMin=engWeekMin(e,cur);
  const speakMin=engSpeakMin(e,cur);
  let html=`<div class="card" style="--accent:${sec.color}; --accent-soft:${softColor(sec.color)}">
    <div class="sec-head" style="margin-bottom:18px">
      <div class="sec-ico">${svg('lang')}</div>
      <div><h2 class="sec-title">${esc(sec.name)}</h2><p class="sec-sub">${esc(sec.sub||'')}${e.config.startDate?' · неделя '+wk+' из '+WEEKS:''}</p></div>
      <div class="sec-tools"><button class="iconbtn" aria-label="Запланировать занятие" onclick="planTaskForSec('${sec.id}')">${svg('calplus')}</button><button class="iconbtn" aria-label="Настройки цикла" onclick="openEngSetup()">${svg('pencil')}</button></div>
    </div>
    <div class="dash">
      <div class="dring" id="engRing">${ring(pct,132,12,'var(--a-green)',true)}</div>
      <div style="width:100%">
        <div class="stats">
          <div class="stat"><div class="n g" id="engStat">${wMin?fmtMin(wMin):'—'}</div><div class="l">за эту неделю</div></div>
          <div class="stat"><div class="n" style="color:var(--a-amber)">${speakMin?fmtMin(speakMin):'—'}</div><div class="l">говорения</div></div>
          <div class="stat"><div class="n b">${axAllDone(e.a11y)}/${axTotal()}</div><div class="l">курс W3Cx</div></div>
          <div class="stat"><div class="n" style="color:var(--a-cyan)">${akW}/7</div><div class="l">карточки Анки</div></div>
          <div class="stat"><div class="n" style="color:var(--a-amber)">${shW}/7 · ${scW}/7</div><div class="l">шэдоуинг · разбор</div></div>
          <div class="stat"><div class="n" style="color:var(--a-rose)">${wdW}/7 · ${hpW}/7</div><div class="l">Gemini · Гарри Поттер</div></div>
          <div class="stat"><div class="n" style="color:var(--a-violet)">${gvAllDone(e.gravity)}/${gvTotal()}</div><div class="l">серии (аудир.)</div></div>
        </div>
        ${!e.config.startDate?`<div class="beacon" style="margin-top:12px">${svg('info')}<div>Отмечай сделанное и минуты рядом с заметкой. Планов по минутам здесь нет — цифра нужна, чтобы видеть, куда уходит время.</div></div>`:''}
      </div>
    </div>
  </div>
  ${dailyCardHTML(sec,'shadow')}
  ${dailyCardHTML(sec,'scene')}
  ${gravityCardHTML(sec)}
  ${dailyCardHTML(sec,'anki')}
  ${ankiQueueCardHTML(sec)}
  ${dailyCardHTML(sec,'wdaily')}
  ${dailyCardHTML(sec,'hp')}
  ${twentyCardHTML(sec)}
  ${a11yCardHTML(e,sec)}
  ${lessonsCardHTML(sec)}
  ${nativeCardHTML(sec)}
  ${practicumCardHTML(sec)}
  ${theoryCardHTML(sec)}`;
  return html;
}
function yaToggle(i){ const e=activeEng().english; const k=yaKey(i); if(e.yandex.done[k]) delete e.yandex.done[k]; else e.yandex.done[k]=1; mstamp("ya:"+k); save(); renderEngList(); refreshEngDash(); }
function setEngFilter(f){ window.engFilter=f; const a=document.getElementById("efAll"),b=document.getElementById("efLeft"); if(a)a.classList.toggle("on",f==="all"); if(b)b.classList.toggle("on",f==="left"); renderEngList(); }
function engToggleYa(){ const e=activeEng().english; e.yandex.open=!e.yandex.open; save(); renderEng(); }
function engSpeakToggle(i){ const e=activeEng().english; const s=e.speaking[i]; s.done=!s.done; if(s.done&&!s.date) s.date=todayStr(); mstamp("es:"+i); save(); renderEng(); }
function engSpeakNote(i,v){ const e=activeEng().english; const s=e.speaking[i]; s.note=v; mstamp("es:"+i); save(); }
function engSpeakDate(i,v){ const e=activeEng().english; const s=e.speaking[i]; s.date=v||null; mstamp("es:"+i); save(); renderEng(); }
function engSpeakSetMin(i,v){ const e=activeEng().english; const s=e.speaking[i];
  const t=String(v==null?"":v).trim(), n=parseInt(t,10);
  if(t!=="" && !(n>=1&&n<=600)) return;
  s.min=(t==="")?0:n; mstamp("es:"+i); save(); renderEng(); }
/* Минуты занятия ложатся на неделю его ДАТЫ, а не на неделю отметки. */
function engSpeakWeekMin(e,mon){ return (e.speaking||[]).reduce((a,x)=>a+((x.done&&x.date&&mondayOf(x.date)===mon)?(x.min||0):0),0); }
function engSpeakDone(e){ return (e.speaking||[]).filter(x=>x.done).length; }
function nativeCardHTML(sec){ const e=sec.english, sp=e.speaking||[], done=engSpeakDone(e);
  const tot=sp.reduce((a,x)=>a+(x.done?(x.min||0):0),0);
  const rows=sp.map((x,i)=>`<div class="natrow ${x.done?'done':''}">
      <button class="check ${x.done?'on':''}" style="--accent:var(--a-amber)" aria-label="Отметить занятие ${i+1}" onclick="engSpeakToggle(${i})">${svg('check')}</button>
      <span class="natlab">Занятие ${i+1}</span>
      <input class="natdate" type="date" value="${x.date||''}" aria-label="Дата занятия ${i+1}" onchange="engSpeakDate(${i},this.value)">
      <span class="minbox"><input class="minbox-in" type="number" inputmode="numeric" min="1" max="600" value="${x.min||''}" aria-label="Минут занятия ${i+1}" onchange="engSpeakSetMin(${i},this.value)"><i>мин</i></span>
      <input class="dayrow-note" type="text" value="${esc(x.note||'')}" placeholder="тема / с кем" oninput="engSpeakNote(${i},this.value)">
    </div>`).join("");
  const body=`<p style="font-size:12.5px; color:var(--muted); margin:0 0 12px">Четыре занятия с носителями из Практикума. Ставь дату занятия и сколько оно длилось — минуты пойдут в ту неделю, когда занятие было.</p>
    ${rows}
    <div class="stats" style="margin-top:16px">
      <div class="stat"><div class="n" style="color:var(--a-amber)">${done}/4</div><div class="l">проведено</div></div>
      <div class="stat"><div class="n">${tot?fmtMin(tot):'—'}</div><div class="l">всего разговора</div></div>
    </div>`;
  return cardWrap(sec,'nat','Занятия с носителями',done+'/4'+(tot?' · '+fmtMin(tot):''),done/4,'var(--a-amber)',body); }
function openEngSetup(){ const e=activeEng().english; document.getElementById("modal").innerHTML=`
  <h3>Цикл английского</h3><p class="mhint">12 недель. Отмечай уроки теории и занятия по говорению.</p>
  <label for="enStart">Дата старта</label><input type="date" id="enStart" value="${e.config.startDate||todayStr()}">
  <label for="enWeeks">Длина цикла, недель</label><input type="number" id="enWeeks" value="${e.config.cycleWeeks||12}">
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Отмена</button><button class="btn primary" onclick="saveEngSetup()">Сохранить</button></div>`;
  showModal(); }
function saveEngSetup(){ const e=activeEng().english; e.config.startDate=document.getElementById("enStart").value||todayStr(); e.config.cycleWeeks=parseInt(document.getElementById("enWeeks").value)||12; save(); closeModal(); renderEng(); }

/* ---- имена наружу ---- */
Object.assign(window, {
  yaWeekMap, activeEng, engTimeParts, engWeekMin, engSpeakMin, renderEng,
  renderEngList, refreshEngDash, yaKey, yaTotal, yaDone, engWeeks,
  engCycleWeek, engListHTML, yaToggleWeek, gvKey, gvBlockDone, gvTotal,
  gvAllDone, gravityCardHTML, gvToggle, gvToggleBlock, gvMarkBlock, thKey,
  thTotal, thDone, thWeek, thToggle, thToggleOpen, engToggleSpeak,
  axKey, axSubs, axSKey, axLeaves, axLeafDone, axItemTotal,
  axItemDone, axItemFull, axBlockTotal, axBlockDone, axTotal, axAllDone,
  axWeek, axToggle, axSubToggle, axToggleBlock, axMarkBlock, a11yCardHTML,
  twKey, twTotal, twDone, twSecs, twAllMin, twDoneMin,
  twWeek, twToggle, twMarkAll, twentyCardHTML, tlogMonOf, tlogShift,
  tlogOwner, tlogKey, tlogGet, tlogWeek, tlogTotal, tlogSet,
  tlogRowHTML, dtCfg, dtOwner, dtRender, dtStore, dtDay,
  dtMonOf, dtShift, dtToggle, dtNote, dtMin, dtWeekCount,
  dtWeekMin, dtTotal, dtStreak, dtBest, dtFirstMon, dailyCardHTML,
  lsWk, lsRow, lsClean, lsToggle, lsNote, lsMin,
  lsWeekMin, lsTotal, lessonsCardHTML, aqDone, aqToggle, ankiQueueCardHTML,
  engPaused, practicumCardHTML, theoryCardHTML, englishHTML, yaToggle, setEngFilter,
  engToggleYa, engSpeakToggle, engSpeakNote, engSpeakDate, engSpeakSetMin, engSpeakWeekMin,
  engSpeakDone, nativeCardHTML, openEngSetup, saveEngSetup, YA_PROGRAM, YA_MIN,
  ANKI_QUEUE, GRAVITY, YA_THEORY, A11Y_COURSE, TW_LESSONS, DT,
});
