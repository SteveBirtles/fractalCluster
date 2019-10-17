const w = 1920, h = 1080;
const step = 160;
let segments = [];
let zoom, max, x0, y0;

function pageLoad() {

    x0 = Number(localStorage.getItem("x0"));
    y0 = Number(localStorage.getItem("y0"));
    zoom = Number(localStorage.getItem("zoom"));
    max = Number(localStorage.getItem("max"));

    if (isNaN(x0)) x0 = 0;
    if (isNaN(y0)) y0 = 0;
    if (isNaN(zoom)) zoom = 1000;
    if (isNaN(max)) max = 1000;

    const canvas = document.getElementById('fractalCanvas');
    canvas.width = w;
    canvas.height = h;

    canvas.addEventListener('click', event => {
        x0 = x0 + (event.clientX-w/2)/zoom;
        y0 = y0 + (event.clientY-h/2)/zoom;
        zoom *= 2;
        requestFractal();
    }, false);

    window.addEventListener("keydown", processKey);

    requestFractal();
}

function processKey(event) {

    if (event.key === "ArrowDown") {
        max = max / 1.5;
        if (max < 1) max = 1;
        requestFractal();
    }
    if (event.key === "ArrowUp") {
        max = max * 1.5;
        requestFractal();
    }
    if (event.key === "Backspace") {
        zoom /= 2;
        requestFractal();
    }
    if (event.key === "Home") {
        x0 = 0;
        y0 = 0;
        zoom = 1000;
        max = 1000;
        requestFractal();
    }
}


function requestFractal() {

    localStorage.setItem("x0", x0);
    localStorage.setItem("y0", y0);
    localStorage.setItem("zoom", zoom);
    localStorage.setItem("max", max);

    segments = [];
    for (let j = 0; j < h; j += step) {
        let row = [];
        for (let i = 0; i < w; i += step) {
            let x = x0 + (i-w/2)/zoom;
            let y = y0 + (j-h/2)/zoom;
            let size = step/zoom;
            let image = new Image();
            image.src = `/fractal/generate?x=${x}&y=${y}&w=${size}&h=${size}&max=${Math.floor(max)}`;
            image.onload = () => redraw();
            row.push(image);
        }
        segments.push(row);
    }

}

function redraw() {

    const canvas = document.getElementById('fractalCanvas');
    const context = canvas.getContext('2d');

    let y = 0;
    for (let row of segments) {
        let x = 0;
        for (let image of row) {
            context.drawImage(image, x, y);
            x += 160;
        }
        y += 160;
    }


}



