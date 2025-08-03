(function () {
    // Константы размеров
    const TILE_WIDTH = 96;
    const TILE_HEIGHT = 96;

    // Константы селекторов
    const SCENE_SELECTOR = '#scene';

    // Константы классов
    const GRID_CLASS = 'grid';
    const GRID_WRAPPER_CLASS = 'grid-wrapper';
    const SPRITE_CLASS = 'sprite';
    const TILE_CLASS = 'tile';

    // Постоянно существующие DOM-элементы
    let sceneEl;            // Корневой элемент с игровым полем

    // Динамически создаваемые DOM-элементы
    let gridWrapperEl;      // Буфер, содержит спрайты в прямых координатах и повернутую grid с изометрическими тайлами-декорацией
    let gridEl;             // Контейнер для тайлов поверхности
    let spriteEl;           // Основной элемент юнита

    // Смещение начала координат для изометрической сетки относительно прямоугольника.
    let isoOffset = { x: 0, y: 0 };

    // Внутренние переменные с размерами сетки
    let gridSizeX = 0;
    let gridSizeY = 0;

    /**
     * Вычисляет высоту terrain в изометрической проекции
     * @param {Object} terrain - Информация о terrain
     * @returns {number} Высота terrain в пикселях
     */
    function calculateTerrainHeight(terrain) {
        const {minX, maxX} = math.calcIsoBox(TILE_WIDTH, TILE_HEIGHT);
        const width = maxX - minX;
        return terrain.size[1] * width / terrain.size[0];
    }

    /**
     * Создает сетку с указанными размерами, позиционирует ее в родителе и запоминает смещение позиции для спрайта
     * @param {number} sizeX - Количество тайлов по оси X
     * @param {number} sizeY - Количество тайлов по оси Y
     */
    function createGrid(sizeX, sizeY) {
        gridSizeX = sizeX;
        gridSizeY = sizeY;

        gridEl = document.createElement('div');
        gridEl.classList.add(GRID_CLASS);
        gridEl.style.setProperty('--grid-w', css.px(sizeX * TILE_WIDTH));
        gridEl.style.setProperty('--grid-h', css.px(sizeY * TILE_HEIGHT));

        gridWrapperEl = document.createElement('div');
        gridWrapperEl.classList.add(GRID_WRAPPER_CLASS);
        gridWrapperEl.appendChild(gridEl);

        sceneEl = document.querySelector(SCENE_SELECTOR);
        sceneEl.appendChild(gridWrapperEl);

        isoOffset = adjustSceneSize(gridWrapperEl, gridEl);
    }

    /**
     * Создает тайлы сетки
     */
    function createTiles() {
        for (let y = 0; y < gridSizeY; y++) {
            for (let x = 0; x < gridSizeX; x++) {
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
        tileEl.style.transform = css.translate(gridX * TILE_WIDTH, gridY * TILE_HEIGHT);

        gridEl.appendChild(tileEl);
    }

    /**
     * Создает и добавляет спрайт на сетку
     * @param {Object} sprite - Информация о спрайте
     * @param {number} gridX - Координата X тайла
     * @param {number} gridY - Координата Y тайла
     * @param {Object} terrain - Опциональная информация о terrain для поднятия спрайта
     */
    function createSprite(sprite, gridX, gridY, terrain) {
        const { x, y } = math.getSpriteIsoPosition(
            [gridX, gridY],
            [TILE_WIDTH, TILE_HEIGHT],
            [sprite.size[0], sprite.size[1]]
        );

        spriteEl = document.createElement('img');
        spriteEl.src = sprite.src;
        spriteEl.alt = sprite.alt;
        spriteEl.style.setProperty('--size-w', css.px(sprite.size[0]));
        spriteEl.style.setProperty('--size-h', css.px(sprite.size[1]));

        // Если передан terrain, поднимаем спрайт так, чтобы он стоял на его вершине
        let yOffset = 0;
        if (terrain) {
            const terrainHeight = calculateTerrainHeight(terrain);

            // Высота проекции одного изометрического тайла на экране (в пикселях)
            const { minY, maxY } = math.calcIsoBox(TILE_WIDTH, TILE_HEIGHT);
            const isoTileHeight = maxY - minY;

            // Смещаем спрайт вверх на всю высоту террейна, затем возвращаем его на уровень земли
            yOffset = -terrainHeight + isoTileHeight;
        }

        spriteEl.style.transform = css.translate(x + isoOffset.x, y + isoOffset.y + yOffset);
        spriteEl.style.zIndex = 1000*gridY + gridX;
        spriteEl.classList.add(SPRITE_CLASS);

        gridWrapperEl.appendChild(spriteEl);
    }

    /**
     * Создает спрайт-декорацию поверх тайла
     * @param {number} gridX - Координата X тайла
     * @param {number} gridY - Координата Y тайла
     */
    function createTerrain(terrain, gridX, gridY) {
        const {minX, maxX} = math.calcIsoBox(TILE_WIDTH, TILE_HEIGHT);
        const width = maxX - minX;
        const height = calculateTerrainHeight(terrain);
        const { x, y } = math.getSpriteIsoPosition(
            [gridX, gridY],
            [TILE_WIDTH, TILE_HEIGHT],
            [width, height],
            true
        );

        spriteEl = document.createElement('img');
        spriteEl.src = terrain.src;
        spriteEl.alt = terrain.alt;
        spriteEl.style.setProperty('--size-w', css.px(width));
        spriteEl.style.setProperty('--size-h', css.px(height));
        spriteEl.style.transform = css.translate(x + isoOffset.x, y + isoOffset.y);
        spriteEl.style.zIndex = 1000*gridY + gridX;
        spriteEl.classList.add(SPRITE_CLASS);

        gridWrapperEl.appendChild(spriteEl);
    }

    /**
     * Сдвигает изометрическую сетку gridEl по центру и вписывает родительский контейнер в габариты ромба
     * @param {HTMLElement} parentEl – родительский контейнер
     * @param {HTMLElement} gridEl – изометрическая сетка
     */
    function adjustSceneSize(parentEl, gridEl) {
        const { maxX, maxY, minX, minY } = math.calcIsoBox(gridSizeX * TILE_WIDTH, gridSizeY * TILE_HEIGHT);

        gridEl.style.setProperty('--grid-x', css.px(-minX));
        gridEl.style.setProperty('--grid-y', css.px(-minY));

        parentEl.style.setProperty('--wrapper-w', css.px(maxX - minX));
        parentEl.style.setProperty('--wrapper-h', css.px(maxY - minY));

        return { x: -minX, y: -minY };
    }

    window.render = {
        createGrid,
        createSprite,
        createTiles,
        createTerrain,
    }
})();
