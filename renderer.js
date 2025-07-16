(function() {
  const TILE_WIDTH = 96;
  const TILE_HEIGHT = 96;
  const SPRITE_WIDTH = 96;
  const SPRITE_HEIGHT = 96;

  let sceneEl;
  let gridEl;
  let gridWrapperEl;
  let spriteEl;
  let spriteContentEl;
  let spriteImgEl;
  const isoOffset = { x: 0, y: 0 };

  function px(v) {
    return `${Math.round(v)}px`;
  }

  function createGrid(cols, rows, useWrapper) {
    gridEl = document.createElement('div');
    gridEl.className = 'grid';
    gridEl.style.width = px(cols * TILE_WIDTH);
    gridEl.style.height = px(rows * TILE_HEIGHT);

    if (useWrapper) {
      gridEl.style.position = 'absolute';
      gridEl.style.left = '0';
      gridEl.style.top = '0';

      gridWrapperEl = document.createElement('div');
      gridWrapperEl.className = 'grid-wrapper';
      gridWrapperEl.style.position = 'relative';
      gridWrapperEl.appendChild(gridEl);
      sceneEl.appendChild(gridWrapperEl);
    } else {
      gridEl.style.position = 'relative';
      sceneEl.appendChild(gridEl);
    }
  }

  function addTile(x, y) {
    const t = document.createElement('div');
    t.className = 'tile';
    t.style.width = px(TILE_WIDTH);
    t.style.height = px(TILE_HEIGHT);
    t.style.left = px(x * TILE_WIDTH);
    t.style.top = px(y * TILE_HEIGHT);
    gridEl.appendChild(t);
  }

  function getSpritePosForTile(gx, gy) {
    const centerX = (gx + 0.5) * TILE_WIDTH;
    const centerY = (gy + 0.5) * TILE_HEIGHT;
    const { x, y } = Geo.cartesianToIso(centerX, centerY);
    return { x: isoOffset.x + x - SPRITE_WIDTH / 2, y: isoOffset.y + y - SPRITE_HEIGHT };
  }

  function addSprite(gx, gy, imgSrc, outside) {
    spriteEl = document.createElement('div');
    spriteEl.className = 'sprite';
    spriteEl.style.width = px(SPRITE_WIDTH);
    spriteEl.style.height = px(SPRITE_HEIGHT);

    spriteImgEl = document.createElement('img');
    spriteImgEl.src = imgSrc;
    spriteImgEl.alt = 'sprite';

    if (outside) {
      const pos = getSpritePosForTile(gx, gy);
      spriteEl.style.left = px(pos.x);
      spriteEl.style.top = px(pos.y);
      spriteEl.appendChild(spriteImgEl);
      gridWrapperEl.appendChild(spriteEl);
    } else {
      spriteEl.style.left = px(gx * TILE_WIDTH);
      spriteEl.style.top = px(gy * TILE_HEIGHT);

      spriteContentEl = document.createElement('div');
      spriteContentEl.className = 'sprite-content';
      spriteContentEl.style.width = px(SPRITE_WIDTH);
      spriteContentEl.style.height = px(SPRITE_HEIGHT);
      spriteContentEl.appendChild(spriteImgEl);
      spriteEl.appendChild(spriteContentEl);
      gridEl.appendChild(spriteEl);
    }
  }

  function calculateIsometricGridBoundingBox(tiles, w, h) {
    if (!tiles.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const xs = tiles.map(t => t.x);
    const ys = tiles.map(t => t.y);
    const minGX = Math.min(...xs);
    const minGY = Math.min(...ys);
    const maxGX = Math.max(...xs) + 1;
    const maxGY = Math.max(...ys) + 1;
    const corners = [
      Geo.cartesianToIso(minGX * w, minGY * h),
      Geo.cartesianToIso(maxGX * w, minGY * h),
      Geo.cartesianToIso(minGX * w, maxGY * h),
      Geo.cartesianToIso(maxGX * w, maxGY * h),
    ];
    const isoXs = corners.map(p => p.x);
    const isoYs = corners.map(p => p.y);
    return { minX: Math.min(...isoXs), minY: Math.min(...isoYs), maxX: Math.max(...isoXs), maxY: Math.max(...isoYs) };
  }

  function adjustSceneSize({ sceneEl, gridEl, cols, rows, tileW, tileH }) {
    sceneEl.style.position = sceneEl.style.position || 'relative';
    gridEl.style.transformOrigin = '0 0';
    const baseW = cols * tileW;
    const baseH = rows * tileH;
    const COS_Z = Math.SQRT2 / 2;
    const SIN_Z = Math.SQRT2 / 2;
    const COS_X = 0.5;
    const project = (x, y) => {
      const rx = x * COS_Z - y * SIN_Z;
      const ry = x * SIN_Z + y * COS_Z;
      return [rx, ry * COS_X];
    };
    const pts = [project(0,0), project(baseW,0), project(0,baseH), project(baseW,baseH)];
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for (const [x,y] of pts) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    sceneEl.style.width = px(maxX - minX);
    sceneEl.style.height = px(maxY - minY);
    gridEl.style.position = 'absolute';
    gridEl.style.left = px(-minX);
    gridEl.style.top = px(-minY);
  }

  function clearScene() {
    while (sceneEl && sceneEl.firstChild) sceneEl.removeChild(sceneEl.firstChild);
    gridEl = null; gridWrapperEl = null; spriteEl = null; spriteContentEl = null; spriteImgEl = null;
  }

  window.Renderer = {
    init(el) { sceneEl = el; },
    createGrid,
    addTile,
    addSprite,
    adjustSceneSize,
    calculateIsometricGridBoundingBox,
    clearScene,
    constants: { TILE_WIDTH, TILE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT },
    elements: () => ({ sceneEl, gridEl, gridWrapperEl, spriteEl }),
    isoOffset,
  };
})();
