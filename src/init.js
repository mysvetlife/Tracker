/* init.js
   Часть трекера v1. Код перенесён из index.html без изменений поведения.
   Имена вывешиваются в window в конце файла: их зовут обработчики в разметке. */

/* ================= Init ================= */
window.data=load()||migrate(defaultData()); if(!data.active) data.active="overview"; render(); if(activeCourse()) afterCourseRender(); window.initializing=false; syncInit(); evInit();
