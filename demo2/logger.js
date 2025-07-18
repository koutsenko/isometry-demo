(function () {
    // Константы селекторов
    const LOG_PANEL_SELECTOR = '#log-area';

    // Постоянно существующие DOM-элементы
    let logAreaEl;          // Панель с логированием, под игровым полем

    function log(msg) {
        let caller = 'anonymous';
        try {
            caller = (log.caller && log.caller.name) || 'anonymous';
        } catch (e) { }

        logAreaEl.textContent = logAreaEl.textContent + `[${caller}] ${msg}\n`;
    }

    function clearLog() {
        logAreaEl.textContent = '';
    }

    logAreaEl = document.querySelector(LOG_PANEL_SELECTOR);
    window.logger = { clearLog, log };
})();
