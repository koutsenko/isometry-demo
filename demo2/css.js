(function () {
    function px(value) {
        return `${Math.round(value)}px`;
    }

    function translate(x, y) {
        return `translate(${px(x)}, ${px(y)})`;
    }

    window.css = {
        px,
        translate,
    }
})();
