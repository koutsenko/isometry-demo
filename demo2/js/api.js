(function () {
    const GRID_SIZE = [4, 4];

    function makeScene() {
        render.createGrid(GRID_SIZE[0], GRID_SIZE[1]);
        logger.log('Создана сетка ' + GRID_SIZE[0] + 'x' + GRID_SIZE[1]);

        render.createTiles();
        logger.log('Созданы тайлы');

        render.createTerrain(assets.terrains[0], 3, 1);
        render.createTerrain(assets.terrains[1], 3, 3);
        logger.log('Создана поверхность');

        render.createSprite(assets.sprites[0], 3, 3, assets.terrains[1]);
        render.createSprite(assets.sprites[0], 3, 2);
        render.createSprite(assets.sprites[2], 1, 3);
        render.createSprite(assets.sprites[0], 0, 2);
        render.createSprite(assets.sprites[1], 2, 1);
        logger.log('Созданы спрайты');
    }

    window.api = {
        makeScene,
    }
})();
