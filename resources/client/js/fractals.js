"use strict";

const w = 1920, h = 1080;
const xStep = 320, yStep = 90;
let completeSegments = [];
let zoom, max, x0, y0, xj, yj, lastXj, lastYj, res, format, power, julia = false;

let nodes = ['http://10.0.0.2:8081', 'http://10.0.0.3:8081', 'http://10.0.0.4:8081', 'http://10.0.0.5:8081', 'http://10.0.0.6:8081', 'http://10.0.0.7:8081'];

let nodeThreads = 4;
let segmentQueue = [];

let keydown = false, hud = false, mode = 1;

function pageLoad() {

    x0 = Number(localStorage.getItem("x0"));
    y0 = Number(localStorage.getItem("y0"));
    xj = Number(localStorage.getItem("xj"));
    yj = Number(localStorage.getItem("yj"));
    lastXj = Number(localStorage.getItem("lastXj"));
    lastYj = Number(localStorage.getItem("lastYj"));
    zoom = Number(localStorage.getItem("zoom"));
    max = Number(localStorage.getItem("max"));
    res = Number(localStorage.getItem("res"));
    mode = Number(localStorage.getItem("mode"));
    format = Number(localStorage.getItem("format"));
    power = Number(localStorage.getItem("power"));
    julia = Number(localStorage.getItem("julia"));

    const canvas = document.getElementById('fractalCanvas');
    canvas.width = w;
    canvas.height = h;

    canvas.addEventListener('click', event => {
        x0 = x0 + (event.clientX - w / 2) / zoom;
        y0 = y0 + (event.clientY - h / 2) / zoom;
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

        if (event.key === "-") {
            power--;
            if (power < 2) power = 2;
            requestFractal();
        }
        if (event.key === "=") {
            power++;
            requestFractal();
        }

        if (event.key === "ArrowLeft") {
            max = Math.floor(max / 1.1);
            if (max < 1) max = 1;
            requestFractal();
        }
        if (event.key === "ArrowRight") {
            max = Math.floor(max * 1.1);
            requestFractal();
        }

        if (event.key === "[") {
            max = Math.floor(max / 2);
            if (max < 1) max = 1;
            requestFractal();
        }
        if (event.key === "]") {
            max = Math.floor(max * 2);
            requestFractal();
        }

        if (event.key === "PageUp") {
            res *= 2;
            if (res > 8) res = 8;
            requestFractal();
        }
        if (event.key === "PageDown") {
            res /= 2;
            if (res < 1) res = 1;
            requestFractal();
        }

        if (event.key === "ArrowUp") {
            zoom *= 2;
            requestFractal();
        }

        if (event.key === "ArrowDown") {
            zoom /= 2;
            requestFractal();
        }

        if (event.key === "j") {
            julia = !julia;
            if (julia) {
                xj = x0;
                yj = y0;
                x0 = lastXj;
                y0 = lastYj;
            } else {
                lastXj = x0;
                lastYj = y0;
                x0 = xj;
                y0 = yj;
            }
            requestFractal();
        }

        if (event.key === "Home") {
            x0 = -0.5;
            y0 = 0;
            zoom = 750;
            max = 1000;
            res = 1;
            mode = 1;
            power = 2;
            julia = false;
            xj = 0;
            yj = 0;
            lastXj = 0;
            lastYj = 0;
            requestFractal();
        }

        if (event.key === "h") {
            hud = !hud;
            redraw();
        }
        
        if (event.key === "f") {
            if (format == "jpg") {
                format = "png";
            } else {
                format = "jpg";
            }
            requestFractal();
        }

        keydown = true;

    }

}


function requestFractal() {

    if (isNaN(x0) || x0 =="NaN" || x0 == "Infinity" || x0 == "-Infinity") x0 = 0;
    if (isNaN(y0) || y0 == "NaN" || y0 == "Infinity" || y0 === "-Infinity") y0 = 0;
    if (isNaN(xj) || xj =="NaN" || xj == "Infinity" || xj == "-Infinity") xj = 0;
    if (isNaN(yj) || yj == "NaN" || yj == "Infinity" || yj === "-Infinity") yj = 0;
    if (isNaN(lastXj) || lastXj =="NaN" || lastXj == "Infinity" || lastXj == "-Infinity") lastXj = 0;
    if (isNaN(lastYj) || lastYj == "NaN" || lastYj == "Infinity" || lastYj === "-Infinity") lastYj = 0;
    if (isNaN(zoom) || zoom == "NaN" || zoom == "Infinity" || zoom == "-Infinity") zoom = 1000;
    if (isNaN(max) || max == "NaN" || max == "Infinity" || max == "-Infinity") max = 1000;
    if (isNaN(res) || res == "NaN" || res == "Infinity" || res == "-Infinity" || res < 1) res = 1;
    if (isNaN(mode) || mode == "NaN" || mode == "Infinity" || mode == "-Infinity") mode = 1;
    if (format != "jpg" && format != "png" ) format = "png";
    if (isNaN(power) || power == "NaN" || power == "Infinity" || power == "-Infinity") power = 2;

    localStorage.setItem("x0", x0);
    localStorage.setItem("y0", y0);
    localStorage.setItem("xj", xj);
    localStorage.setItem("yj", yj);
    localStorage.setItem("lastXj", lastXj);
    localStorage.setItem("lastYj", lastYj);
    localStorage.setItem("zoom", zoom);
    localStorage.setItem("max", max);
    localStorage.setItem("res", res);
    localStorage.setItem("mode", mode);
    localStorage.setItem("power", power);
    localStorage.setItem("julia", julia);

    segmentQueue = [];
    for (let t = 0; t < nodes.length; t++) {
        segmentQueue.push([]);
    }

    completeSegments = [];

    for (let i = 0; i < w; i += xStep) {
        for (let j = 0; j < h; j += yStep) {
    
            let x = x0 + (i - w / 2) / zoom;
            let y = y0 + (j - h / 2) / zoom;
            let n = Math.floor(i / (w/nodes.length));

            let segment = {
                x: i,
                y: j,
                request: `/fractal/generate?x=${x}` +
                    `&y=${y}` +
                    `&w=${xStep / zoom}` +
                    `&h=${yStep / zoom}` +
                    `&xStep=${xStep}` +
                    `&yStep=${yStep}` +
                    `&res=${res}` +
                    `&mode=${mode}` +
                    `&format=${format}` +
                    `&power=${power}` +
                    `&julia=${julia}` +
                    `&xj=${xj}` +
                    `&yj=${yj}` +
                    `&max=${Math.floor(max)}`,
                image: new Image(),
                n: n
            };

            segmentQueue[n].push(segment);

            

        }
    }

    for (let n = 0; n < nodes.length; n++) {
        for (let t = 0; t < nodeThreads && segmentQueue[n].length > 0; t++) {
        //while (segmentQueue[n].length > 0) {
            makeRequest(segmentQueue[n].shift());
        }
    }

}

function makeRequest(segment) {

    segment.image.src = nodes[segment.n] + segment.request;
    segment.image.onload = () => {
        completeSegments.push(segment);
        redraw();
        nextRequest(segment.n);
    };

}

function nextRequest(n) {
    if (segmentQueue[n].length === 0) return;
    makeRequest(segmentQueue[n].shift());
}

function redraw() {

    const canvas = document.getElementById('fractalCanvas');
    const context = canvas.getContext('2d');

    //context.clearRect(0,0,w,h);

    for (let s of completeSegments) {
        context.drawImage(s.image, s.x, s.y);
    }

    if (hud) {
        
        context.font = "24px Arial";
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        
        context.fillStyle = 'white'; 
        context.strokeStyle = 'white'; 
        for (let s of completeSegments) {
            context.fillText((s.n+1), s.x + 20, s.y + 20);
            context.strokeRect(s.x, s.y, xStep, yStep);
        }
        
        context.fillStyle = 'black';
        context.fillRect(0, h - 50, w, 50);
        
        context.fillStyle = 'white'; 
        context.fillText("x = " + x0 + ", y = " + y0 + ", zoom = " + zoom + ", iterations = " + max +
            (power > 2 ? (", power = " + power) : "") +
            (julia ? (", juliaX " + xj + ", juliaY " + yj) : "") +
            ", resolution = " + res + ", palette = " + mode + ", format = " + format, w / 2, h - 25);
        
    }

}




