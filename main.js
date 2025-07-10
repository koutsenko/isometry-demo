// Константы размеров
const TILE_WIDTH = 96;
const TILE_HEIGHT = 96;
const SPRITE_WIDTH = 96;
const SPRITE_HEIGHT = 96;

// Константы селекторов
const SCENE_SELECTOR = '#scene';
const SOLUTION_RADIO_SELECTOR = 'input[name="solution"]';
const SOLUTION_RADIO_CHECKED_SELECTOR = 'input[name="solution"]:checked';

// Константы классов
const GRID_CLASS = 'grid';
const GRID_WRAPPER_CLASS = 'grid-wrapper';
const SPRITE_CLASS = 'sprite';
const SPRITE_CONTENT_CLASS = 'sprite-content';
const TILE_CLASS = 'tile';
const SOLUTION_HEIGHT_FIX_CLASS = 'height-fix';
const SOLUTION_PERSPECTIVE_FIX_CLASS = 'perspective-fix';

// Размеры сетки
const GRID_SIZE_X = 2;
const GRID_SIZE_Y = 2;

// Математические константы
const SQRT2 = Math.sqrt(2);
const COS_60_DEG = 0.5;

// Постоянно существующие DOM-элементы
let sceneEl;            // Корневой элемент с игровым полем
let solutionRadioEls    // Радиокнопки, переключающие 4 возможных решения в демо
let logAreaEl;          // Панель с логированием, под игровым полем
let logAreaClearBtnEl;  // Кнопка очистки лога

// Динамически создаваемые DOM-элементы
let gridWrapperEl;      // Буфер для solution 4, содержит спрайты в прямых координатах и повернутую grid с изометрическими тайлами-декорацией
let gridEl;             // Контейнер для тайлов поверхности и (только в solution 1-3) для спрайта
let spriteEl;           // Основной элемент юнита
let spriteContentEl;    // Обертка с обратной трансформацией юнита в solution 1-3
let spriteImgEl;        // IMG-изображение спрайта

// Смещение начала координат для изометрической сетки относительно прямоугольника.
const isoOffset = { x: 0, y: 0 };

/**
 * Создает сетку с указанными размерами
 * @param {number} sizeX - Количество тайлов по оси X
 * @param {number} sizeY - Количество тайлов по оси Y
 * @param {HTMLElement} parentEl - Элемент, куда будет добавлена сетка
 * @param {boolean} useWrapper - Признак использования дополнительной обертки, которая будет родителем и для сетки и для тайлов.
 */
function createGrid(sizeX, sizeY, parentEl, useWrapper = false) {
    gridEl = document.createElement('div');
    gridEl.classList.add(GRID_CLASS);
    gridEl.style.width = px(sizeX * TILE_WIDTH);
    gridEl.style.height = px(sizeY * TILE_HEIGHT);

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
 * Создает тайл и добавляет его в сетку
 * @param {number} gridX - Координата X тайла
 * @param {number} gridY - Координата Y тайла
 */
function createTile(gridX, gridY) {
    const tileEl = document.createElement('div');
    tileEl.classList.add(TILE_CLASS);
    tileEl.setAttribute('data-x', gridX);
    tileEl.setAttribute('data-y', gridY);
    tileEl.style.width = px(TILE_WIDTH);
    tileEl.style.height = px(TILE_HEIGHT);
    tileEl.style.left = px(gridX * TILE_WIDTH);
    tileEl.style.top = px(gridY * TILE_HEIGHT);
    gridEl.appendChild(tileEl);
}

/**
 * Создает и добавляет спрайт на сетку
 * @param {number} [gridX=0] - Координата X тайла
 * @param {number} [gridY=0] - Координата Y тайла
 * @param {boolean} [isAlternate] - Признак рендеринга в прямой сетке поверх изометрической.
 */
function createSprite(gridX = 0, gridY = 0, isAlternate = false) {
    spriteEl = document.createElement('div');
    spriteEl.classList.add(SPRITE_CLASS);
    spriteEl.style.width = px(SPRITE_WIDTH);
    spriteEl.style.height = px(SPRITE_HEIGHT);

    spriteImgEl = document.createElement('img');
    spriteImgEl.src = 'orc.png';
    spriteImgEl.alt = 'orc';

    if (isAlternate) {
        const position = getSpritePosForTile(gridX, gridY);
        spriteEl.style.left = px(position.x);
        spriteEl.style.top = px(position.y);

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

/**
 * Расчет координата спрайта, чтобы он встал нижней серединой в центр тайла
 *
 * @param {number} gridX - Координата X тайла
 * @param {number} gridY - Координата Y тайла
*/
function getSpritePosForTile(gridX, gridY) {
    // Вычисляем центр тайла, рассчитанный под изометрической формуле
    const tileCenterX = (gridX + 0.5) * TILE_WIDTH;
    const tileCenterY = (gridY + 0.5) * TILE_HEIGHT;
    const { x: isoX, y: isoY } = cartesianToIsometric(tileCenterX, tileCenterY);

    // Добавляем смещение начала координат и смещение (нижняя середина) якоря спрайта
    return {
        x: isoOffset.x + isoX - SPRITE_WIDTH / 2,
        y: isoOffset.y + isoY - SPRITE_HEIGHT
    };
}

/**
 * Перевод точки из прямоугольной (картезианской) сетки в изометрическую проекцию «вид сверху»
 * Проекция базируется на transform rotateX(60deg) rotateZ(45deg)
 * Реализация на базе формул 2D rotation matrix 45 degrees и 2:1 dimetric projection formula
 *
 * @param {number} x - Координата X во входной сетке (пиксели)
 * @param {number} y - Координата Y во входной сетке (пиксели)
 */
function cartesianToIsometric(x, y) {
    const xRotated = (x - y) / SQRT2;
    const yRotated = (x + y) / SQRT2;

    return {
        x: xRotated,
        y: yRotated * COS_60_DEG
    };
}

/**
 * Нахождение габаритов контейнера с изометрически трансформированным содержимым
 * @param {*} tiles Данные (координаты) тайлов
 * @param {*} w Ширина тайла
 * @param {*} h Высота тайла
 */
function calculateIsometricGridBoundingBox(tiles, w, h) {
    if (!tiles.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    // 1. Находим минимальные и максимальные индексы плиток
    const xs = tiles.map(t => t.x);
    const ys = tiles.map(t => t.y);
    const minGX = Math.min(...xs);
    const minGY = Math.min(...ys);
    const maxGX = Math.max(...xs) + 1;   // +1 — правый/нижний край тайла
    const maxGY = Math.max(...ys) + 1;

    // 2. Проецируем только 4 угла всего прямоугольника
    const corners = [
        cartesianToIsometric(minGX * w, minGY * h),
        cartesianToIsometric(maxGX * w, minGY * h),
        cartesianToIsometric(minGX * w, maxGY * h),
        cartesianToIsometric(maxGX * w, maxGY * h),
    ];

    const isoXs = corners.map(p => p.x);
    const isoYs = corners.map(p => p.y);

    return {
        minX: Math.min(...isoXs),
        minY: Math.min(...isoYs),
        maxX: Math.max(...isoXs),
        maxY: Math.max(...isoYs),
    };
}

function fillScene() {
    createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl);
    log('В sceneEl создан gridEl с количеством плиток: ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
            createTile(x, y);
        }
    }
    log('Созданы тайлы');

    adjustSceneSize({
        sceneEl: sceneEl,
        gridEl: gridEl,
        cols: GRID_SIZE_X,
        rows: GRID_SIZE_Y,
        tileW: TILE_WIDTH,
        tileH: TILE_HEIGHT,
    });
    log('Размер sceneEl обновлен по фактическим габаритам gridEl');

    createSprite();
    log('Создан спрайт');
}

function fillSceneWithHeightFix() {
    createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl);
    log('В sceneEl создан gridEl с количеством плиток: ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

    gridEl.classList.add(SOLUTION_HEIGHT_FIX_CLASS);
    log('На gridEl навешен доп. CSS класс ' + SOLUTION_HEIGHT_FIX_CLASS);

    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
            createTile(x, y);
        }
    }
    log('Созданы тайлы');

    adjustSceneSize({
        sceneEl: sceneEl,
        gridEl: gridEl,
        cols: GRID_SIZE_X,
        rows: GRID_SIZE_Y,
        tileW: TILE_WIDTH,
        tileH: TILE_HEIGHT,
    });
    log('Размер sceneEl обновлен по фактическим габаритам gridEl');

    createSprite();
    log('Создан спрайт');
}

function fillSceneWithPerspectiveFix() {
    createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl);
    log('В sceneEl создан gridEl с количеством плиток: ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

    gridEl.classList.add(SOLUTION_PERSPECTIVE_FIX_CLASS);
    log('На gridEl навешен доп. CSS класс ' + SOLUTION_PERSPECTIVE_FIX_CLASS);

    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
            createTile(x, y);
        }
    }
    log('Созданы тайлы');

    adjustSceneSize({
        sceneEl: sceneEl,
        gridEl: gridEl,
        cols: GRID_SIZE_X,
        rows: GRID_SIZE_Y,
        tileW: TILE_WIDTH,
        tileH: TILE_HEIGHT,
    });
    log('Размер sceneEl обновлен по фактическим габаритам gridEl');

    createSprite();
    log('Создан спрайт');
}

function fillSceneWithPositionsCalc() {
    createGrid(GRID_SIZE_X, GRID_SIZE_Y, sceneEl, true);
    log('В sceneEl созданы gridEl и gridWrapper, количество плиток: ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

    // Получаем данные о тайлах и создаем элементы тайлов
    const tilesData = [];
    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
            tilesData.push({ x, y });

            const newTile = document.createElement('div');
            newTile.classList.add(TILE_CLASS);
            newTile.setAttribute('data-x', x);
            newTile.setAttribute('data-y', y);
            newTile.style.width = px(TILE_WIDTH);
            newTile.style.height = px(TILE_HEIGHT);
            newTile.style.left = px(x * TILE_WIDTH);
            newTile.style.top = px(y * TILE_HEIGHT);

            gridEl.appendChild(newTile);
        }
    }
    log('Созданы тайлы');

    // Рассчитываем габариты gridEl
    const { maxX, maxY, minX, minY } = calculateIsometricGridBoundingBox(tilesData, TILE_WIDTH, TILE_HEIGHT);
    log('Рассчитан gridEl boundingBox: ' + JSON.stringify(roundObjValues({ maxX, maxY, minX, minY })));

    // Подгоняем размер gridWrapper под габариты gridEl, чтобы flex-родитель центрировал одновременно gridWrapperEl и gridEl
    gridWrapperEl.style.width = px(maxX - minX);
    gridWrapperEl.style.height = px(maxY - minY);

    // Вычисляем и запоминаем сдвиг начала координат gridEl относительно gridWrapper
    isoOffset.x = minX < 0 ? -minX : 0;
    isoOffset.y = minY < 0 ? -minY : 0;
    log(`Рассчитаны смещения: isoOffset.x=${Math.round(isoOffset.x)}, isoOffset.y=${Math.round(isoOffset.y)}`);

    // Осуществляем сдвиг gridEl
    gridEl.style.left = px(isoOffset.x);
    gridEl.style.top = px(isoOffset.y);
    log(`Применены смещения к gridEl: left=${gridEl.style.left}, top=${gridEl.style.top}`);

    // Добавление спрайта
    createSprite(0, 0, true);
    log('Создан спрайт');
}

/**
 * Применяет выбранное решение к сетке
 */
function applySolution() {
    clearLog();
    clearScene();

    switch (document.querySelector(SOLUTION_RADIO_CHECKED_SELECTOR).value) {
        case 'initial':
            fillScene();
            break;
        case 'height-fix':
            fillSceneWithHeightFix();
            break;
        case 'perspective-fix':
            fillSceneWithPerspectiveFix();
            break;
        case 'positions-calc':
            fillSceneWithPositionsCalc();
            break;
    }
    log('Применено решение: ' + selectedSolution);
}

/**
 * Точка входа
 */
function init() {
    logAreaEl = document.getElementById('log-area');
    logAreaClearBtnEl = document.getElementById('clear-log-button');
    logAreaClearBtnEl.addEventListener('click', clearLog);

    sceneEl = document.querySelector(SCENE_SELECTOR);

    solutionRadioEls = document.querySelectorAll(SOLUTION_RADIO_SELECTOR);
    solutionRadioEls[0].checked = true;
    solutionRadioEls.forEach(radio => radio.addEventListener('change', applySolution));

    applySolution();
}

// Служебные функции
function clearScene() {
    while (sceneEl.firstChild) {
        sceneEl.removeChild(sceneEl.firstChild);
    }
    gridEl = null;
    gridWrapperEl = null;
}

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

function px(value) {
    return `${Math.round(value)}px`;
}

function roundObjValues(obj) {
    const roundedObj = { ...obj };
    for (let key of Object.keys(roundedObj)) {
        roundedObj[key] = Math.round(roundedObj[key]);
    }

    return roundedObj;
}

/**
 * Подгоняет размеры sceneEl и сдвигает gridEl так, чтобы изометрический ромб занял контейнер без зазоров.
 *
 * @param {Object} o
 * @param {HTMLElement} o.sceneEl   –  #scene
 * @param {HTMLElement} o.gridEl    –  .grid
 * @param {number} o.cols           –  тайлов по X
 * @param {number} o.rows           –  тайлов по Y
 * @param {number} o.tileW          –  ширина тайла (до поворота), px
 * @param {number} o.tileH          –  высота тайла (до поворота), px
 */
function adjustSceneSize({ sceneEl, gridEl, cols, rows, tileW, tileH }) {
    /* ---------- 0. Базовые настройки ---------- */

    // Сцена должна быть относительным родителем для абсолютного wrapper-а
    sceneEl.style.position = sceneEl.style.position || 'relative';

    // Гарантируем, что поворот считается от левого-верхнего угла,
    // иначе origin: center даст вертикальный сдвиг вниз
    gridEl.style.transformOrigin = '0 0';

    /* ---------- 1. Геометрия ромба ---------- */

    // Размеры прямоугольной сетки до трансформации
    const baseW = cols * tileW;
    const baseH = rows * tileH;

    // Константы для rotateZ(45°) → rotateX(60°)
    const COS_Z = Math.SQRT2 / 2;    // cos(45°)
    const SIN_Z = Math.SQRT2 / 2;    // sin(45°)
    const COS_X = 0.5;               // cos(60°)

    // Проекция точки (x, y, 0) на экран после двух поворотов
    const project = (x, y) => {
        // rotateZ
        const rx = x * COS_Z - y * SIN_Z;
        const ry = x * SIN_Z + y * COS_Z;
        // rotateX  -- z нам не нужен, а ry сжимается по cosX
        return [rx, ry * COS_X];
    };

    // Четыре угла прямоугольника
    const pts = [
        project(0, 0),
        project(baseW, 0),
        project(0, baseH),
        project(baseW, baseH),
    ];

    // Ограничивающий прямоугольник ромба
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const [x, y] of pts) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    /* ---------- 2. Размеры контейнера ---------- */

    sceneEl.style.width = px(maxX - minX);
    sceneEl.style.height = px(maxY - minY);

    /* ---------- 3. Сдвиг .gridEl ---------- */

    // Позиционируем относительно #scene
    gridEl.style.position = 'absolute';
    gridEl.style.left = px(-minX);
    gridEl.style.top = px(-minY);
}

// Вызов точки входа
init();
