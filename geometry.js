(function() {
  const SQRT2 = Math.SQRT2;
  const COS_60_DEG = 0.5; // cos(60deg)

  /**
   * Convert cartesian coordinates to isometric projection.
   * @param {number} x
   * @param {number} y
   * @returns {{x:number,y:number}}
   */
  function cartesianToIso(x, y) {
    const xr = (x - y) / SQRT2;
    const yr = (x + y) / SQRT2;
    return { x: xr, y: yr * COS_60_DEG };
  }

  /**
   * Reverse of cartesianToIso.
   * @param {number} x
   * @param {number} y
   * @returns {{x:number,y:number}}
   */
  function isoToCartesian(x, y) {
    const yr = y / COS_60_DEG;
    const cx = (x + yr) / SQRT2;
    const cy = (yr - x) / SQRT2;
    return { x: cx, y: cy };
  }

  window.Geo = {
    SQRT2,
    COS_60_DEG,
    cartesianToIso,
    isoToCartesian,
  };
})();
