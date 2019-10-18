"use strict";

const w = 1920, h = 1080;
const xStep = 128, yStep = 120;
let completeSegments = [];
let zoom, max, x0, y0, res;

let nodes = ['localhost:8081'];
let nodeThreads = 6;
let segmentQueue = [];

let keydown = false, hud = false, mode = 1;

function pageLoad() {

    x0 = Number(localStorage.getItem("x0"));
    y0 = Number(localStorage.getItem("y0"));
    zoom = Number(localStorage.getItem("zoom"));
    max = Number(localStorage.getItem("max"));
    res = Number(localStorage.getItem("res"));
    mode = Number(localStorage.getItem("mode"));

    const canvas = document.getElementById('fractalCanvas');
    canvas.width = w;
    canvas.height = h;

    canvas.addEventListener('click', event => {
        x0 = x0 + (event.clientX - w / 2) / zoom;
        y0 = y0 + (event.clientY - h / 2) / zoom;
        zoom *= 2;
        requestFractal();
    }, false);

    window.addEventListener("keydown", processKey);
    window.addEventListener("keyup", () => {keydown = false;});

    requestFractal();
}


function processKey(event) {

    if (!keydown) {

        if (event.key === "1") {
            mode = 1;
            requestFractal();
        }
        if (event.key === "2") {
            mode = 2;
            requestFractal();
        }
        if (event.key === "3") {
            mode = 3;
            requestFractal();
        }
        if (event.key === "4") {
            mode = 4;
            requestFractal();
        }
        if (event.key === "5") {
            mode = 5;
            requestFractal();
        }
        if (event.key === "6") {
            mode = 6;
            requestFractal();
        }
        if (event.key === "7") {
            mode = 7;
            requestFractal();
        }
        if (event.key === "8") {
            mode = 8;
            requestFractal();
        }
        if (event.key === "9") {
            mode = 9;
            requestFractal();
        }
        if (event.key === "0") {
            mode = 0;
            requestFractal();
        }


        if (event.key === "ArrowDown") {
            max = Math.floor(max / 1.5);
            if (max < 1) max = 1;
            requestFractal();
        }
        if (event.key === "ArrowUp") {
            max = Math.floor(max * 1.5);
            requestFractal();
        }

        if (event.key === "ArrowRight") {
            res *= 2;
            if (res > 8) res = 8;
            requestFractal();
        }
        if (event.key === "ArrowLeft") {
            res /= 2;
            if (res < 1) res = 1;
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
            res = 1;
            mode = 1;
            requestFractal();
        }

        if (event.key === "Enter") {
            hud = !hud;
            redraw();
        }

        keydown = true;

    }

}


function requestFractal() {

    if (isNaN(x0) || x0 =="NaN" || x0 == "Infinity" || x0 == "-Infinity") x0 = 0;
    if (isNaN(y0) || y0 == "NaN" || y0 == "Infinity" || y0 === "-Infinity") y0 = 0;
    if (isNaN(zoom) || zoom == "NaN" || zoom == "Infinity" || zoom == "-Infinity") zoom = 1000;
    if (isNaN(max) || max == "NaN" || max == "Infinity" || max == "-Infinity") max = 1000;
    if (isNaN(res) || res == "NaN" || res == "Infinity" || res == "-Infinity" || res < 1) res = 1;
    if (isNaN(mode) || mode == "NaN" || mode == "Infinity" || mode == "-Infinity") mode = 1;

    localStorage.setItem("x0", x0);
    localStorage.setItem("y0", y0);
    localStorage.setItem("zoom", zoom);
    localStorage.setItem("max", max);
    localStorage.setItem("res", res);
    localStorage.setItem("mode", mode);

    completeSegments = [];

    segmentQueue = [];
    for (let t = 0; t < nodes.length; t++) {
        segmentQueue.push([]);
    }

    let n = 0;

    for (let j = 0; j < h; j += yStep) {
        for (let i = 0; i < w; i += xStep) {

            let x = x0 + (i - w / 2) / zoom;
            let y = y0 + (j - h / 2) / zoom;

            let segment = {
                x: i,
                y: j,
                request: `/fractal/generate?x=${x}` +
                    `&y=${y}` +
                    `&w=${xStep / zoom}` +
                    `&h=${yStep / zoom}` +
                    `&res=${res}` +
                    `&mode=${mode}` +
                    `&max=${Math.floor(max)}`,
                image: new Image()
            };

            segmentQueue[n].push(segment);

            n = (n + 1) % nodes.length;

        }
    }

    for (let n = 0; n < nodes.length; n++) {
        for (let t = 0; t < nodeThreads; t++) {
            makeRequest(segmentQueue[n].pop(), n);
        }
    }

}

function makeRequest(segment, n) {

    segment.image.src = segment.request;
    segment.image.onload = () => {
        completeSegments.push(segment);
        redraw();
        nextRequest(n);
    };

}

function nextRequest(n) {

    if (segmentQueue[n].length === 0) return;

    makeRequest(segmentQueue[n].pop(), n);

}

function redraw() {

    const canvas = document.getElementById('fractalCanvas');
    const context = canvas.getContext('2d');

    for (let s of completeSegments) {
        context.drawImage(s.image, s.x, s.y);
    }

    if (hud) {
        context.fillStyle = 'black';
        context.fillRect(0, h - 200, w, 50);
        context.font = "24px Arial";
        context.fillStyle = 'white';
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText("x = " + x0 + ", y = " + y0 + ", z = " + zoom + ", d = " + max + ", r = " + res + ", m = " + mode, w / 2, h - 175);
    }

}



