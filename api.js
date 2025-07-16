(function() {
  const { TILE_WIDTH, TILE_HEIGHT } = Renderer.constants;

  function createScene(cols, rows, mode) {
    Renderer.clearScene();
    Renderer.createGrid(cols, rows, mode === 'positions-calc');

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        Renderer.addTile(x, y);
      }
    }

    if (mode === 'height-fix') {
      Renderer.elements().gridEl.classList.add('height-fix');
    }
    if (mode === 'perspective-fix') {
      Renderer.elements().gridEl.classList.add('perspective-fix');
    }

    if (mode === 'positions-calc') {
      const tiles = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) tiles.push({ x, y });
      }
      const box = Renderer.calculateIsometricGridBoundingBox(tiles, TILE_WIDTH, TILE_HEIGHT);
      const wrapper = Renderer.elements().gridWrapperEl;
      wrapper.style.width = `${box.maxX - box.minX}px`;
      wrapper.style.height = `${box.maxY - box.minY}px`;
      Renderer.isoOffset.x = box.minX < 0 ? -box.minX : 0;
      Renderer.isoOffset.y = box.minY < 0 ? -box.minY : 0;
      Renderer.elements().gridEl.style.left = `${Renderer.isoOffset.x}px`;
      Renderer.elements().gridEl.style.top = `${Renderer.isoOffset.y}px`;
    }

    Renderer.adjustSceneSize({
      sceneEl: Renderer.elements().sceneEl,
      gridEl: Renderer.elements().gridEl,
      cols,
      rows,
      tileW: TILE_WIDTH,
      tileH: TILE_HEIGHT,
    });
  }

  function addSprite(x, y, imgSrc, mode) {
    const outside = mode === 'positions-calc';
    Renderer.addSprite(x, y, imgSrc, outside);
  }

  window.GameAPI = {
    init(sceneEl) { Renderer.init(sceneEl); },
    createScene,
    addSprite,
  };
})();
