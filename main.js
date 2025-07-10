// Константы размеров
const TILE_WIDTH = 96;
const TILE_HEIGHT = 96;
const SPRITE_WIDTH = 96;
const SPRITE_HEIGHT = 96;
const DOT_SIZE = 10;

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
const TILE_ANCHOR_DOT_CLASS = 'tile-anchor-dot';
const SPRITE_ANCHOR_DOT_CLASS = 'sprite-anchor-dot';
const SOLUTION_HEIGHT_FIX_CLASS = 'height-fix';
const SOLUTION_PERSPECTIVE_FIX_CLASS = 'perspective-fix';
const SOLUTION_POSITIONS_CALC_CLASS = 'positions-calc';

// Размеры сетки
const GRID_SIZE_X = 2;
const GRID_SIZE_Y = 2;

// Математические константы для решения 3
const SQRT2 = Math.sqrt(2);
const COS_60_DEG = 0.5; // Math.cos(Math.PI / 3) // cos(60 degrees)

// Постоянно существуюшие DOM-элементы
let scene;
let solutionRadios;
let logArea;
let logAreaClearButton;

// Динамически создаваемые DOM-элементы
let gridWrapper, grid, sprite, spriteContent, spriteImage;

/**
 * Создает сетку с указанными размерами
 * @param {number} sizeX - Количество тайлов по оси X
 * @param {number} sizeY - Количество тайлов по оси Y
 * @param {HTMLElement} parentElement - Элемент, куда будет добавлена сетка
 */
function createGrid(sizeX, sizeY, parentElement) {
    grid = document.createElement('div');
    grid.classList.add(GRID_CLASS);
    grid.setAttribute('data-size', `${sizeX};${sizeY}`);
    grid.style.width = sizeX * TILE_WIDTH + 'px';
    grid.style.height = sizeY * TILE_HEIGHT + 'px';
    parentElement.appendChild(grid);

    log('Создан элемент сетки и пристегнут к родительскому');
}

/**
 * Создает тайл и добавляет его в сетку
 * @param {number} x - Координата X тайла
 * @param {number} y - Координата Y тайла
 */
function createTile(x, y) {
    // Создаем элемент тайла
    const tile = document.createElement('div');
    tile.classList.add(TILE_CLASS);
    tile.setAttribute('data-x', x);
    tile.setAttribute('data-y', y);
    
    // Устанавливаем размеры тайла
    tile.style.width = TILE_WIDTH + 'px';
    tile.style.height = TILE_HEIGHT + 'px';
    
    // Позиционируем тайл
    placeTileAt(tile, x, y);
    
    // Добавляем тайл в сетку
    grid.appendChild(tile);
    
    // Создаем видимую точку привязки для тайла
    createTileAnchorDot(x, y);
}

/**
 * Создает и добавляет спрайт на сетку
 */
function createSprite() {
    sprite = document.createElement('div');
    sprite.classList.add(SPRITE_CLASS);
    sprite.style.width = SPRITE_WIDTH + 'px';
    sprite.style.height = SPRITE_HEIGHT + 'px';
    
    spriteContent = document.createElement('div');
    spriteContent.classList.add(SPRITE_CONTENT_CLASS);
    spriteContent.style.width = SPRITE_WIDTH + 'px';
    spriteContent.style.height = SPRITE_HEIGHT + 'px';
    
    spriteImage = document.createElement('img');
    spriteImage.src = 'orc.png';
    spriteImage.alt = 'orc';
    
    spriteContent.appendChild(spriteImage);
    sprite.appendChild(spriteContent);
    
    // TODO Понять нужна ли отдельная функция для позиционирования спрайта.
    // TODO И почему у тайла аналогичная функция тоже есть?
    // TODO А у грида например нет? И он щас как попало рендерится.
    placeSpriteAt(0, 0);
    
    // TODO Передать сюда parentElement.
    grid.appendChild(sprite);
    log('Создан элемент спрайта и пристегнут к сетке');
}

/**
 * Создает точку привязки для тайла
 * @param {number} x - Координата X точки
 * @param {number} y - Координата Y точки
 */
function createTileAnchorDot(x, y) {
    const tileAnchorDot = document.createElement('div');
    tileAnchorDot.classList.add(TILE_ANCHOR_DOT_CLASS);
    
    // Позиционируем точку привязки
    tileAnchorDot.style.left = x * TILE_WIDTH + 'px';
    tileAnchorDot.style.top = y * TILE_HEIGHT + 'px';
    
    // Добавляем точку привязки в сетку
    grid.appendChild(tileAnchorDot);
}

/**
 * Размещает тайл по указанным координатам
 * @param {HTMLElement} tileElement - Элемент тайла
 * @param {number} x - Координата X
 * @param {number} y - Координата Y
 */
function placeTileAt(tileElement, x, y) {
    tileElement.style.left = x * TILE_WIDTH + 'px';
    tileElement.style.top = y * TILE_HEIGHT + 'px';
}

/**
 * Размещает спрайт по указанным координатам
 * @param {number} x - Координата X
 * @param {number} y - Координата Y
 */
function placeSpriteAt(x, y) {
    sprite.style.left = x * TILE_WIDTH + 'px';
    sprite.style.top = y * TILE_HEIGHT + 'px';
}

/**
 * Transforms Cartesian coordinates from the original grid
 * to isometric screen coordinates based on rotateX(60deg) rotateZ(45deg) transform.
 * The origin (0,0) for Cartesian coordinates is assumed to be the
 * top-left of the container that will be transformed.
 * @param {number} cartesianX - The x-coordinate in the original flat grid.
 * @param {number} cartesianY - The y-coordinate in the original flat grid.
 * @returns {{x: number, y: number}} The projected isometric coordinates.
 */
function cartesianToIsometric(cartesianX, cartesianY) {
    const x_rotated_z = (cartesianX - cartesianY) / SQRT2;
    const y_rotated_z = (cartesianX + cartesianY) / SQRT2;

    const isoX = x_rotated_z;
    const isoY = y_rotated_z * COS_60_DEG;

    return { x: isoX, y: isoY };
}

/**
 * Calculates the bounding box of all tiles after isometric projection.
 * @param {Array<Object>} tilesData - Array of {x: gridX, y: gridY} objects representing tile positions.
 * @param {number} tWidth - The width of a single tile.
 * @param {number} tHeight - The height of a single tile.
 * @returns {{minX: number, minY: number, maxX: number, maxY: number}} Bounding box of the projected grid.
 */
function calculateIsometricGridBoundingBox(tilesData, tWidth, tHeight) {
    let minIsoX = Infinity, minIsoY = Infinity;
    let maxIsoX = -Infinity, maxIsoY = -Infinity;

    if (tilesData.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    tilesData.forEach(tilePos => {
        const gridX = tilePos.x;
        const gridY = tilePos.y;

        const cornersCartesian = [
            { x: gridX * tWidth, y: gridY * tHeight },                     // Top-left
            { x: (gridX + 1) * tWidth, y: gridY * tHeight },               // Top-right
            { x: gridX * tWidth, y: (gridY + 1) * tHeight },               // Bottom-left
            { x: (gridX + 1) * tWidth, y: (gridY + 1) * tHeight }          // Bottom-right
        ];

        cornersCartesian.forEach(corner => {
            const isoPoint = cartesianToIsometric(corner.x, corner.y);
            minIsoX = Math.min(minIsoX, isoPoint.x);
            minIsoY = Math.min(minIsoY, isoPoint.y);
            maxIsoX = Math.max(maxIsoX, isoPoint.x);
            maxIsoY = Math.max(maxIsoY, isoPoint.y);
        });
    });

    return { minX: minIsoX, minY: minIsoY, maxX: maxIsoX, maxY: maxIsoY };
}

/**
 * Размещение тайла
 */
function processTile(tile, offsetX, offsetY) {
    const tileGridX = parseInt(tile.getAttribute('data-x'));
    const tileGridY = parseInt(tile.getAttribute('data-y'));
    log(`Обрабатывается тайл в цикле: [${tileGridX}, ${tileGridY}]`); // Лог для каждого тайла в цикле

    const cartesianTopLeftX = tileGridX * TILE_WIDTH;
    const cartesianTopLeftY = tileGridY * TILE_HEIGHT;
    const topLeftProjected = cartesianToIsometric(cartesianTopLeftX, cartesianTopLeftY);
    log(`cartesianTopLeft для [${tileGridX}, ${tileGridY}]: (${cartesianTopLeftX}, ${cartesianTopLeftY}), projected: (${topLeftProjected.x}, ${topLeftProjected.y})`); // Лог координат верхнего левого угла

    const cartesianCenterX = (tileGridX + 0.5) * TILE_WIDTH;
    const cartesianCenterY = (tileGridY + 0.5) * TILE_HEIGHT;
    const centerProjected = cartesianToIsometric(cartesianCenterX, cartesianCenterY);
    log(`cartesianCenter для [${tileGridX}, ${tileGridY}]: (${cartesianCenterX}, ${cartesianCenterY}), projected: (${centerProjected.x}, ${centerProjected.y})`); // Лог координат центра

    // Создаем красную точку в верхнем левом углу тайла
    const dotTopLeft = document.createElement('div');
    dotTopLeft.classList.add(TILE_ANCHOR_DOT_CLASS);
    dotTopLeft.style.left = (offsetX + topLeftProjected.x - DOT_SIZE / 2) + 'px';
    dotTopLeft.style.top = (offsetY + topLeftProjected.y - DOT_SIZE / 2) + 'px';
    gridWrapper.appendChild(dotTopLeft);
    log(`Создана и добавлена красная точка для [${tileGridX}, ${tileGridY}] в позиции: left=${dotTopLeft.style.left}, top=${dotTopLeft.style.top}`); // Лог позиции красной точки

    // Создаем синюю точку в центре тайла (для позиционирования спрайта)
    const dotCenter = document.createElement('div');
    dotCenter.classList.add(SPRITE_ANCHOR_DOT_CLASS);
    dotCenter.style.left = (offsetX + centerProjected.x - DOT_SIZE / 2) + 'px';
    dotCenter.style.top = (offsetY + centerProjected.y - DOT_SIZE / 2) + 'px';
    gridWrapper.appendChild(dotCenter);
    log(`Создана и добавлена синяя точка для [${tileGridX}, ${tileGridY}] в позиции: left=${dotCenter.style.left}, top=${dotCenter.style.top}`); // Лог позиции синей точки
    
    // Если это тайл [0,0], добавляем спрайт
    if (tileGridX === 0 && tileGridY === 0) {
        log('Обрабатывается тайл [0,0], создаем спрайт'); // Лог перед созданием спрайта
        // Создаем спрайт вне трансформируемого контейнера
        const sprite = document.createElement('div');
        sprite.classList.add('sprite-positioned-calculated');
        
        // Создаем изображение в спрайте
        const spriteImage = document.createElement('img');
        spriteImage.src = 'orc.png';
        spriteImage.alt = 'orc';
        log('Создано изображение для спрайта'); // Лог после создания изображения
        
        // Добавляем изображение в спрайт
        sprite.appendChild(spriteImage);
        log('Изображение добавлено в спрайт'); // Лог после добавления изображения

        // Позиционируем спрайт по центру тайла
        sprite.style.left = (offsetX + centerProjected.x - SPRITE_WIDTH / 2) + 'px';
        sprite.style.top = (offsetY + centerProjected.y - SPRITE_HEIGHT) + 'px';
        log(`Спрайт позиционирован: left=${sprite.style.left}, top=${sprite.style.top}`); // Лог позиции спрайта
        
        // Добавляем спрайт в wrapper
        gridWrapper.appendChild(sprite);
        log('Спрайт добавлен в gridWrapper'); // Лог после добавления спрайта
    }
}

function fillScene() {
    createGrid(GRID_SIZE_X, GRID_SIZE_Y, scene);
    log('В scene создан grid с количеством плиток: ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
            createTile(x, y);
        }
    }
    log('Созданы тайлы');

    createSprite();
    log('Создан спрайт');
}

function fillSceneWithHeightFix() {
    createGrid(GRID_SIZE_X, GRID_SIZE_Y, scene);
    log('В scene создан grid с количеством плиток: ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

    grid.classList.add(SOLUTION_HEIGHT_FIX_CLASS);
    log('На grid навешен доп. CSS класс ' + SOLUTION_HEIGHT_FIX_CLASS);

    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
            createTile(x, y);
        }
    }
    log('Созданы тайлы');

    createSprite();
    log('Создан спрайт');
}

function fillSceneWithPerspectiveFix() {
    createGrid(GRID_SIZE_X, GRID_SIZE_Y, scene);
    log('В scene создан grid с количеством плиток: ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

    grid.classList.add(SOLUTION_PERSPECTIVE_FIX_CLASS);
    log('На grid навешен доп. CSS класс ' + SOLUTION_PERSPECTIVE_FIX_CLASS);

    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
            createTile(x, y);
        }
    }
    log('Созданы тайлы');

    createSprite();
    log('Создан спрайт');
}

function fillSceneWithPositionsCalc() {
    log('Вызвана функция fillSceneWithPositionsCalc'); // Лог в начале функции

    // Настраиваем содержимое wrapper (создает grid и другие элементы)
    gridWrapper = document.createElement('div');
    gridWrapper.classList.add(GRID_WRAPPER_CLASS);
    scene.appendChild(gridWrapper);
    log('Создан wrapper element для сцены');

    // Создаем копию изометрической сетки
    grid = document.createElement('div');
    grid.classList.add(GRID_CLASS, SOLUTION_POSITIONS_CALC_CLASS);
    grid.style.position = 'absolute';
    grid.style.left = '0';
    grid.style.top = '0';
    gridWrapper.appendChild(grid);
    log('Создан и добавлен grid'); // Лог после создания grid
    
    // Получаем данные о тайлах и создаем элементы тайлов
    const tilesData = [];
    for (let y = 0; y < GRID_SIZE_Y; y++) {
        for (let x = 0; x < GRID_SIZE_X; x++) {
             // Генерируем данные о тайле
            tilesData.push({ x, y });
            
            // Создаем элемент тайла для изометрической сетки
            const newTile = document.createElement('div');
            newTile.classList.add(TILE_CLASS);
            newTile.setAttribute('data-x', x);
            newTile.setAttribute('data-y', y);
            newTile.style.width = TILE_WIDTH + 'px';
            newTile.style.height = TILE_HEIGHT + 'px';
            newTile.style.left = x * TILE_WIDTH + 'px';
            newTile.style.top = y * TILE_HEIGHT + 'px';

            grid.appendChild(newTile);
            log(`Создан и добавлен тайл [${x}, ${y}]`); // Лог для каждого тайла
        }
    }
    log('Содержимое grid после добавления тайлов: ' + grid.outerHTML);
    log('Данные тайлов: ' + JSON.stringify(tilesData)); // Лог данных тайлов

    // Рассчитываем необходимое смещение для grid
    const boundingBox = calculateIsometricGridBoundingBox(tilesData, TILE_WIDTH, TILE_HEIGHT);
    log('Рассчитан boundingBox: ' + JSON.stringify(boundingBox)); // Лог boundingBox
    
    let offsetX = 0;
    let offsetY = 0;
    
    // Смещаем контейнер, чтобы левый верхний спроецированный угол совпал с (0,0) родительской обертки
    if (boundingBox.minX < 0) {
        offsetX = -boundingBox.minX;
    }
    
    if (boundingBox.minY < 0) {
        offsetY = -boundingBox.minY;
    }
    log(`Рассчитаны смещения: offsetX=${offsetX}, offsetY=${offsetY}`); // Лог смещений
    
    grid.style.left = offsetX + 'px';
    grid.style.top = offsetY + 'px';
    log(`Применены смещения к grid: left=${grid.style.left}, top=${grid.style.top}`); // Лог примененных смещений
    
    // Создаем и позиционируем точки для каждого тайла
    const tiles = grid.children;
    log('Дочерние элементы grid для добавления точек и спрайта: ' + tiles.length);
    Array.from(tiles).forEach(tile => processTile(tile, offsetX, offsetY));
    log('Функция fillSceneWithPositionsCalc завершена'); // Лог в конце функции
}

/**
 * Применяет выбранное решение к сетке
 */
function applySolution() {
    clearLog();
    clearScene();

    const selectedSolution = document.querySelector(SOLUTION_RADIO_CHECKED_SELECTOR).value;
    log('Выбранное сейчас решение: ' + selectedSolution);

    switch (selectedSolution) {
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
    logArea = document.getElementById('log-area');
    logAreaClearButton = document.getElementById('clear-log-button');
    logAreaClearButton.addEventListener('click', clearLog);
    log('Начата инициализация, настроено логирование');

    scene = document.querySelector(SCENE_SELECTOR);
    log('Получен элемент сцены');
    
    solutionRadios = document.querySelectorAll(SOLUTION_RADIO_SELECTOR);
    solutionRadios[0].checked = true;
    solutionRadios.forEach(radio => radio.addEventListener('change', applySolution));
    log('Настроены переключатели решений');

    applySolution();
}

// Служебные функции
function clearScene() {
    while (scene.firstChild) {
        scene.removeChild(scene.firstChild);
    }
    grid = null;
    gridWrapper = null;
    log('Cцена очищена');
}

function log(msg) {
    let caller = 'anonymous';
    try {
        caller = log.caller?.name || 'anonymous';
    } catch (e) {}

    logArea.textContent = `[${caller}] ${msg}\n` + logArea.textContent;
}

function clearLog() {
    logArea.textContent = '';
    log('Лог очищен');
}

// Вызов точки входа
init();
