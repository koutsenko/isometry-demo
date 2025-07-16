(function() {
  const sceneEl = document.getElementById('scene');
  const radios = document.querySelectorAll('input[name="solution"]');

  function currentMode() {
    const checked = document.querySelector('input[name="solution"]:checked');
    return checked ? checked.value : 'initial';
  }

  function render() {
    const mode = currentMode();
    GameAPI.createScene(2, 2, mode);
    GameAPI.addSprite(0, 0, 'orc.png', mode);
  }

  radios.forEach(r => r.addEventListener('change', render));

  GameAPI.init(sceneEl);
  render();
})();
