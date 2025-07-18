(function () {
    // Константы селекторов
    const SOLUTION_RADIO_SELECTOR = 'input[name="solution"]';
    const SOLUTION_RADIO_CHECKED_SELECTOR = 'input[name="solution"]:checked';

    // Постоянно существующие DOM-элементы
    let solutionRadioEls;    // Радиокнопки, переключающие 4 возможных решения в демо

    /**
     * Применяет выбранное решение к сетке
     */
    function applySolution() {
        logger.clearLog();
        api.clearScene();

        const selectedSolution = document.querySelector(SOLUTION_RADIO_CHECKED_SELECTOR).value;
        switch (selectedSolution) {
            case 'initial':
                api.fillScene();
                break;
            case 'height-fix':
                api.fillSceneWithHeightFix();
                break;
            case 'perspective-fix':
                api.fillSceneWithPerspectiveFix();
                break;
            case 'positions-calc':
                api.fillSceneWithPositionsCalc();
                break;
        }
        logger.log('Применено решение: ' + selectedSolution);
    }

    solutionRadioEls = document.querySelectorAll(SOLUTION_RADIO_SELECTOR);
    solutionRadioEls[0].checked = true;
    solutionRadioEls.forEach(radio => radio.addEventListener('change', applySolution));
    applySolution();
})();
