/* state.js
   Переменные, которые меняются во время работы. В исходнике это были let/var
   на верхнем уровне одного скрипта; здесь они живут в window, чтобы оставаться
   общими для всех модулей. Порядок и начальные значения - как в оригинале. */

window.data = null;
window.progTarget = null;
window.bmTarget = null;
window.bmType = null;
window.courseFilter = "all";
window.courseAllOpen = false;
window.sportDay = null;
window.sportWeekMon = null;
window.calAll = false;
window.cardEditSec = null;
window.cdrag = null;
window._yaWk = null;
window.engFilter = "all";
window.tlogMon = null;
window.dtMon = {};
window.syncCfg = null;
window.pushTimer = null;
window.syncBusy = false;
window.syncApplying = false;
window.initializing = true;
window.dataRev = 0;
window.pushAgain = false;
window.pendingRender = false;
window.syncTimer = null;
window.lastSeenAt = null;
window.pollBusy = false;
window.pushBusy = false;
window.reportMon = null;
window.weekMon = null;
window.planMon = null;
window.wplanMon = null;
window.editingSection = null;
window.pickColor = "var(--a-blue)";
window.pickIcon = "star";
window.toastT = undefined;
