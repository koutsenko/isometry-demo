(function () {
    // Математические константы
    const SQRT2 = Math.sqrt(2);
    const COS_60_DEG = 0.5;

    /**
     * Перевод точки из прямоугольной (картезианской) сетки в изометрическую проекцию «вид сверху»
     *
     * @param {number} x - Координата X во входной сетке (пиксели)
     * @param {number} y - Координата Y во входной сетке (пиксели)
     */
    function cartesianToIso(x, y) {
        return {
            x: (x - y) / SQRT2,
            y: (x + y) / SQRT2 * COS_60_DEG
        };
    }

    /**
     * Нахождение габаритов изометрически трансформированного контейнера
     *
     * @param {number} width - Ширина в пикселях
     * @param {number} height - Высота в пикселях
     */
    function calcIsoBox(width, height) {
        const isoCorners = [
            cartesianToIso(0, 0),
            cartesianToIso(width, 0),
            cartesianToIso(0, height),
            cartesianToIso(width, height),
        ];

        const isoXs = isoCorners.map(p => p.x);
        const isoYs = isoCorners.map(p => p.y);

        return {
            minX: Math.min(...isoXs),
            minY: Math.min(...isoYs),
            maxX: Math.max(...isoXs),
            maxY: Math.max(...isoYs),
        };
    }

    /**
     * Расчет координат спрайта, чтобы он встал нижней серединой в центр тайла
     *
     * @param {number[]} gridXY - Координата тайла [x, y]
     * @param {number[]} tileSize - Размер тайла [width, height]
     * @param {number[]} spriteSize - Размер спрайта [width, height]
     * @param {boolean} isBottomAnchor - Признак якоря по низу, а не по центру
    */
    function getSpriteIsoPosition(gridXY, tileSize, spriteSize, isBottomAnchor) {
        const [gridX, gridY] = gridXY;
        const [tileWidth, tileHeight] = tileSize;
        const [spriteWidth, spriteHeight] = spriteSize;

        const delta = isBottomAnchor ? 1 : 0.5;
        const tileCenterX = (gridX + delta) * tileWidth;
        const tileCenterY = (gridY + delta) * tileHeight;
        const { x: isoX, y: isoY } = cartesianToIso(tileCenterX, tileCenterY);

        return {
            x: isoX - spriteWidth / 2,
            y: isoY - spriteHeight
        };
    }

    window.math = { calcIsoBox, cartesianToIso, getSpriteIsoPosition };
})();
