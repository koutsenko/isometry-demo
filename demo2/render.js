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
    const TILE_CLASS = 'tile';

    // Постоянно существующие DOM-элементы
    let sceneEl;            // Корневой элемент с игровым полем

    // Динамически создаваемые DOM-элементы
    let gridWrapperEl;      // Буфер, содержит спрайты в прямых координатах и повернутую grid с изометрическими тайлами-декорацией
    let gridEl;             // Контейнер для тайлов поверхности
    let spriteEl;           // Основной элемент юнита
    let spriteImgEl;        // IMG-изображение спрайта

    // Смещение начала координат для изометрической сетки относительно прямоугольника.
    let isoOffset = { x: 0, y: 0 };

    // Внутренние переменные с размерами сетки
    let gridSizeX = 0;
    let gridSizeY = 0;

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
     * @param {number} gridX - Координата X тайла
     * @param {number} gridY - Координата Y тайла
     */
    function createSprite(gridX, gridY) {
        spriteImgEl = document.createElement('img');
        spriteImgEl.src = './orc.png';
        spriteImgEl.alt = 'orc';

        spriteEl = document.createElement('div');
        spriteEl.classList.add(SPRITE_CLASS);
        const { x, y } = math.getSpriteIsoPosition(
            [gridX, gridY],
            [TILE_WIDTH, TILE_HEIGHT],
            [SPRITE_WIDTH, SPRITE_HEIGHT]
        );
        spriteEl.style.transform = css.translate(x + isoOffset.x, y + isoOffset.y);
        spriteEl.appendChild(spriteImgEl);

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
        createTiles,
        createSprite,
    }
})();
