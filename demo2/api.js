(function () {
    // Размеры сетки
    const GRID_SIZE_X = 4;
    const GRID_SIZE_Y = 4;

    // Позиция спрайта
    const SPRITE_POS_X = 1;
    const SPRITE_POS_Y = 1;

    function makeScene() {
        render.createGrid(GRID_SIZE_X, GRID_SIZE_Y);
        logger.log('Создана сетка ' + GRID_SIZE_X + 'x' + GRID_SIZE_Y);

        render.createTiles();
        logger.log('Созданы тайлы');

        render.createSprite(SPRITE_POS_X, SPRITE_POS_Y);
        logger.log('Создан спрайт');
    }

    window.api = {
        makeScene,
    }
})();
