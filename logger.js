(function () {
    // Константы селекторов
    const LOG_PANEL_SELECTOR = '#log-area';
    const LOG_CLEAR_BUTTON = '#clear-log-button';

    // Постоянно существующие DOM-элементы
    let logAreaEl;          // Панель с логированием, под игровым полем
    let logAreaClearBtnEl;  // Кнопка очистки лога

    function log(msg) {
        let caller = 'anonymous';
        try {
            caller = log.caller?.name || 'anonymous';
        } catch (e) { }

        logAreaEl.textContent = `[${caller}] ${msg}\n` + logAreaEl.textContent;
    }

    function clearLog() {
        logAreaEl.textContent = '';
    }

    logAreaEl = document.querySelector(LOG_PANEL_SELECTOR);
    logAreaClearBtnEl = document.querySelector(LOG_CLEAR_BUTTON);
    logAreaClearBtnEl.addEventListener('click', clearLog);

    window.logger = { clearLog, log };
})();
