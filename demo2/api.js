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

    // Размеры сетки
    const GRID_SIZE_X = 4;
    const GRID_SIZE_Y = 4;

    // Позиция спрайта
    const SPRITE_POS_X = 1;
    const SPRITE_POS_Y = 1;

    // Постоянно существующие DOM-элементы
    let sceneEl;            // Корневой элемент с игровым полем

    // Динамически создаваемые DOM-элементы
    let gridWrapperEl;      // Буфер, содержит спрайты в прямых координатах и повернутую grid с изометрическими тайлами-декорацией
    let gridEl;             // Контейнер для тайлов поверхности
    let spriteEl;           // Основной элемент юнита
    let spriteImgEl;        // IMG-изображение спрайта

    // Смещение начала координат для изометрической сетки относительно прямоугольника.
    let isoOffset = { x: 0, y: 0 };

    /**
     * Создает сетку с указанными размерами
     * @param {number} sizeX - Количество тайлов по оси X
     * @param {number} sizeY - Количество тайлов по оси Y
     * @param {HTMLElement} parentEl - Элемент, куда будет добавлена сетка
     */
    function createGrid(sizeX, sizeY, parentEl) {
        gridEl = document.createElement('div');
        gridEl.style.width = px(sizeX * TILE_WIDTH);
        gridEl.style.height = px(sizeY * TILE_HEIGHT);
        gridEl.classList.add(GRID_CLASS);
        gridEl.style.position = 'absolute';
        gridEl.style.left = '0';
        gridEl.style.top = '0';

        gridWrapperEl = document.createElement('div');
        gridWrapperEl.style.position = 'relative';
        gridWrapperEl.classList.add(GRID_WRAPPER_CLASS);
        gridWrapperEl.appendChild(gridEl);

        parentEl.appendChild(gridWrapperEl);
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
     */
    function createSprite(gridX, gridY) {
        spriteImgEl = document.createElement('img');
        spriteImgEl.src = './orc.png';
        spriteImgEl.alt = 'orc';

        spriteEl = document.createElement('div');
        spriteEl.classList.add(SPRITE_CLASS);
        spriteEl.style.width = px(SPRITE_WIDTH);
        spriteEl.style.height = px(SPRITE_HEIGHT);
        const {x, y} = math.getSpriteIsoPosition(
            [gridX, gridY],
            [TILE_WIDTH, TILE_HEIGHT],
            [SPRITE_WIDTH, SPRITE_HEIGHT]
        );
        spriteEl.style.left = px(x + isoOffset.x);
        spriteEl.style.top = px(y + isoOffset.y);
        spriteEl.appendChild(spriteImgEl);

        gridWrapperEl.appendChild(spriteEl);
    }

    function fillScene() {
        createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl);
        logger.log('Созданы gridEl и gridWrapper [' + GRID_SIZE_X + 'x' + GRID_SIZE_Y + ']');

        createTiles();
        logger.log('Созданы тайлы');

        isoOffset = adjustSceneSize(gridWrapperEl, gridEl);
        logger.log('Размер gridWrapper обновлён, запомнили смещение координат');

        createSprite(SPRITE_POS_X, SPRITE_POS_Y);
        logger.log('Создан спрайт, используя запомненное смещение');
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
    }
})();
