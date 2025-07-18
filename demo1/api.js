(function () {
    // Константы размеров
    const TILE_WIDTH = 96;
    const TILE_HEIGHT = 96;
    const SPRITE_WIDTH = 96;
    const SPRITE_HEIGHT = 96;

    // Константы селекторов
    const SCENE_SELECTOR = '#scene';

    // Константы классов
    const GRID_CLASS = 'grid';
    const GRID_WRAPPER_CLASS = 'grid-wrapper';
    const SPRITE_CLASS = 'sprite';
    const SPRITE_CONTENT_CLASS = 'sprite-content';
    const TILE_CLASS = 'tile';
    const SOLUTION_HEIGHT_FIX_CLASS = 'height-fix';
    const SOLUTION_PERSPECTIVE_FIX_CLASS = 'perspective-fix';

    // Размеры сетки
    const GRID_SIZE_X = 4;
    const GRID_SIZE_Y = 4;

    // Позиция спрайта
    const SPRITE_POS_X = 1;
    const SPRITE_POS_Y = 1;

    // Постоянно существующие DOM-элементы
    let sceneEl;            // Корневой элемент с игровым полем

    // Динамически создаваемые DOM-элементы
    let gridWrapperEl;      // Буфер для solution 4, содержит спрайты в прямых координатах и повернутую grid с изометрическими тайлами-декорацией
    let gridEl;             // Контейнер для тайлов поверхности и (только в solution 1-3) для спрайта
    let spriteEl;           // Основной элемент юнита
    let spriteContentEl;    // Обертка с обратной трансформацией юнита в solution 1-3
    let spriteImgEl;        // IMG-изображение спрайта

    // Смещение начала координат для изометрической сетки относительно прямоугольника.
    let isoOffset = { x: 0, y: 0 };

    /**
     * Создает сетку с указанными размерами
     * @param {number} sizeX - Количество тайлов по оси X
     * @param {number} sizeY - Количество тайлов по оси Y
     * @param {HTMLElement} parentEl - Элемент, куда будет добавлена сетка
     * @param {boolean} useWrapper - Признак использования дополнительной обертки, которая будет родителем и для сетки и для тайлов.
     * @param {string} additionalCss - Дополнительные стили.
     */
    function createGrid(sizeX, sizeY, parentEl, useWrapper, additionalCss) {
        gridEl = document.createElement('div');
        gridEl.style.width = px(sizeX * TILE_WIDTH);
        gridEl.style.height = px(sizeY * TILE_HEIGHT);
        gridEl.classList.add(GRID_CLASS);
        additionalCss && gridEl.classList.add(additionalCss);

        if (useWrapper) {
            gridEl.style.position = 'absolute';
            gridEl.style.left = '0';
            gridEl.style.top = '0';
            gridWrapperEl = document.createElement('div');
            gridWrapperEl.style.position = 'relative';
            gridWrapperEl.classList.add(GRID_WRAPPER_CLASS);
            gridWrapperEl.appendChild(gridEl);
            parentEl.appendChild(gridWrapperEl);
        } else {
            gridEl.style.position = 'relative';
            parentEl.appendChild(gridEl);
        }
    }

    /**
     * Создает тайлы сетки
     */
    function createTiles() {
        for (let y = 0; y < GRID_SIZE_Y; y++) {
            for (let x = 0; x < GRID_SIZE_X; x++) {
                createTile(x, y);
            }
        }
    }

    /**
     * Создает тайл и добавляет его в сетку
     * @param {number} gridX - Координата X тайла
     * @param {number} gridY - Координата Y тайла
     */
    function createTile(gridX, gridY) {
        const tileEl = document.createElement('div');
        tileEl.classList.add(TILE_CLASS);
        tileEl.style.width = px(TILE_WIDTH);
        tileEl.style.height = px(TILE_HEIGHT);
        tileEl.style.left = px(gridX * TILE_WIDTH);
        tileEl.style.top = px(gridY * TILE_HEIGHT);
        gridEl.appendChild(tileEl);
    }

    /**
     * Создает и добавляет спрайт на сетку
     * @param {number} gridX - Координата X тайла
     * @param {number} gridY - Координата Y тайла
     * @param {boolean} [isAlternate] - Признак рендеринга в прямой сетке поверх изометрической.
     */
    function createSprite(gridX, gridY, isAlternate = false) {
        spriteEl = document.createElement('div');
        spriteEl.classList.add(SPRITE_CLASS);
        spriteEl.style.width = px(SPRITE_WIDTH);
        spriteEl.style.height = px(SPRITE_HEIGHT);

        spriteImgEl = document.createElement('img');
        spriteImgEl.src = './orc.png';
        spriteImgEl.alt = 'orc';

        if (isAlternate) {
            const {x, y} = math.getSpriteIsoPosition(
                [gridX, gridY],
                [TILE_WIDTH, TILE_HEIGHT],
                [SPRITE_WIDTH, SPRITE_HEIGHT]
            );
            spriteEl.style.left = px(x + isoOffset.x);
            spriteEl.style.top = px(y + isoOffset.y);

            spriteEl.appendChild(spriteImgEl);
            gridWrapperEl.appendChild(spriteEl);
        } else {
            spriteEl.style.left = px(gridX * TILE_WIDTH);
            spriteEl.style.top = px(gridY * TILE_HEIGHT);

            spriteContentEl = document.createElement('div');
            spriteContentEl.classList.add(SPRITE_CONTENT_CLASS);
            spriteContentEl.style.width = px(SPRITE_WIDTH);
            spriteContentEl.style.height = px(SPRITE_HEIGHT);

            spriteContentEl.appendChild(spriteImgEl);
            spriteEl.appendChild(spriteContentEl);
            gridEl.appendChild(spriteEl);
        }
    }

    function fillScene() {
        createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl, false);
        logger.log('Создан gridEl [' + GRID_SIZE_X + 'x' + GRID_SIZE_Y + ']');

        createTiles();
        logger.log('Созданы тайлы');

        adjustSceneSize(sceneEl, gridEl);
        logger.log('Размер sceneEl обновлен по фактическим габаритам gridEl');

        createSprite(SPRITE_POS_X, SPRITE_POS_Y);
        logger.log('Создан спрайт');
    }

    function fillSceneWithHeightFix() {
        createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl, false, SOLUTION_HEIGHT_FIX_CLASS);
        logger.log('Создан gridEl [' + GRID_SIZE_X + 'x' + GRID_SIZE_Y + '] с CSS классом ' + SOLUTION_HEIGHT_FIX_CLASS);

        createTiles();
        logger.log('Созданы тайлы');

        adjustSceneSize(sceneEl, gridEl);
        logger.log('Размер sceneEl обновлен по фактическим габаритам gridEl');

        createSprite(SPRITE_POS_X, SPRITE_POS_Y);
        logger.log('Создан спрайт');
    }

    function fillSceneWithPerspectiveFix() {
        createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl, false, SOLUTION_PERSPECTIVE_FIX_CLASS);
        logger.log('Создан gridEl [' + GRID_SIZE_X + 'x' + GRID_SIZE_Y + '] с CSS классом ' + SOLUTION_PERSPECTIVE_FIX_CLASS);

        createTiles();
        logger.log('Созданы тайлы');

        adjustSceneSize(sceneEl, gridEl);
        logger.log('Размер sceneEl обновлен по фактическим габаритам gridEl');

        createSprite(SPRITE_POS_X, SPRITE_POS_Y);
        logger.log('Создан спрайт');
    }

    function fillSceneWithPositionsCalc() {
        createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl, true);
        logger.log('Созданы gridEl и gridWrapper [' + GRID_SIZE_X + 'x' + GRID_SIZE_Y + ']');

        createTiles();
        logger.log('Созданы тайлы');

        isoOffset = adjustSceneSize(gridWrapperEl, gridEl);
        logger.log('Размер gridWrapper обновлён, запомнили смещение координат');

        createSprite(SPRITE_POS_X, SPRITE_POS_Y, true);
        logger.log('Создан спрайт, используя запомненное смещение');
    }

    function clearScene() {
        while (sceneEl.firstChild) {
            sceneEl.removeChild(sceneEl.firstChild);
        }
        gridEl = null;
        gridWrapperEl = null;
    }

    function px(value) {
        return `${Math.round(value)}px`;
    }

    /**
     * Сдвигает изометрическую сетку gridEl по центру и вписывает родительский контейнер в габариты ромба
    *
    * @param {HTMLElement} parentEl – родительский контейнер
    * @param {HTMLElement} gridEl – изометрическая сетка
    */
   function adjustSceneSize(parentEl, gridEl) {
       const { maxX, maxY, minX, minY } = math.calcIsoBox(GRID_SIZE_X * TILE_WIDTH, GRID_SIZE_Y * TILE_HEIGHT);

       gridEl.style.transformOrigin = '0 0';
       gridEl.style.position = 'absolute';
       gridEl.style.left = px(-minX);
       gridEl.style.top = px(-minY);

       parentEl.style.position = parentEl.style.position || 'relative';
       parentEl.style.width = px(maxX - minX);
       parentEl.style.height = px(maxY - minY);

       return { x: -minX, y: -minY };
    }

    sceneEl = document.querySelector(SCENE_SELECTOR);
    window.api = {
        fillScene,
        fillSceneWithHeightFix,
        fillSceneWithPerspectiveFix,
        fillSceneWithPositionsCalc,
        clearScene
    }
})();
