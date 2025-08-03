(function () {
    const sprites = [{
        alt: 'orc_small',
        size: [64, 64],
        src: './assets/orc.png',
    }, {
        alt: 'orc_middle',
        size: [96, 96],
        src: './assets/orc.png',
    }, {
        alt: 'orc_big',
        size: [128, 128],
        src: './assets/orc.png',
    }];
    const terrains = [{
        alt: 'rock',
        size: [96, 96],
        src: './assets/rock.png'
    }, {
        alt: 'rock',
        size: [96, 192],
        src: './assets/rock_high.png'
    }];

    window.assets = {
        sprites,
        terrains,
    }
})();
