// =============================================================
// Air Write - script.js
// Real-time hand tracking with TensorFlow.js (Handpose model)
// By Ayushi Shukla | GSSoC 2026 Contributor
// GitHub: https://github.com/ayushishuklaME | ayushishukla775@gmail.com
// =============================================================

const video = document.getElementById('video');
const inkCanvas = document.getElementById('inkCanvas');
const cursorCanvas = document.getElementById('cursorCanvas');
const inkCtx = inkCanvas.getContext('2d');
const cursorCtx = cursorCanvas.getContext('2d');
const statusDiv = document.getElementById('status');
const handCountDiv = document.getElementById('handCount');
const fpsDiv = document.getElementById('fps');
const penStateDiv = document.getElementById('penState');

function resizeCanvases() {
    [inkCanvas, cursorCanvas].forEach(c => {
        c.width = c.offsetWidth;
        c.height = c.offsetHeight;
    });
    redrawAll();
}
window.addEventListener('resize', resizeCanvases);

let stream = null;
let model = null;
let lastFrameTime = Date.now();
let frameCount = 0;
let running = false;

const colors = ['#00ff41', '#ff3b3b', '#3ba7ff', '#ffd60a', '#ff3bd4', '#ffffff'];
let colorIndex = 0;
let currentColor = colors[0];

let strokes = [];       // finished + in-progress strokes: { color, points: [{x,y}] }
let currentStroke = null;
let isPinching = false;
let wasFist = false;
let lastPoint = null;

// ---------- Small UI-animation helper: ripple effect on every button click ----------
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.remove('rippling');
        // restart the animation
        requestAnimationFrame(() => {
            btn.classList.add('rippling');
            setTimeout(() => btn.classList.remove('rippling'), 500);
        });
    });
});

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = stream;
        await new Promise(resolve => { video.onloadedmetadata = resolve; });
        video.play();
        statusDiv.textContent = '[ CAMERA ONLINE ] // loading TensorFlow.js model...';
        statusDiv.className = 'status success';
        initializeHandTracking();
    } catch (err) {
        statusDiv.textContent = '[ ERROR ] camera access denied or unavailable';
        statusDiv.className = 'status error';
        console.error(err);
    }
}

function stopCamera() {
    running = false;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    statusDiv.textContent = '[ SYSTEM HALTED ] // camera stopped';
    statusDiv.className = 'status error';
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
}

async function initializeHandTracking() {
    try {
        await tf.setBackend('webgl');
        await tf.ready();

        model = await handpose.load({
            maxContinuousChecks: 5,
            detectionConfidence: 0.8,
            iouThreshold: 0.3,
            scoreThreshold: 0.75
        });

        statusDiv.textContent = '[ MODEL LOADED ] // pinch to start writing!';
        statusDiv.className = 'status success';
        running = true;
        detectHands();
    } catch (err) {
        console.error('TensorFlow.js model load error:', err);
        statusDiv.textContent = '[ ERROR ] model failed to load, retrying...';
        statusDiv.className = 'status error';
        setTimeout(initializeHandTracking, 1500);
    }
}

function dist2D(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

async function detectHands() {
    if (!running || !model || !video.srcObject) return;

    try {
        const predictions = await model.estimateHands(video, false);
        cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

        const hasHand = predictions && predictions.length > 0;
        handCountDiv.textContent = hasHand ? 1 : 0;

        if (hasHand) {
            const landmarks = predictions[0].landmarks; // array of [x,y,z] in pixel space
            const vw = video.videoWidth || 1280;
            const vh = video.videoHeight || 720;

            const wrist = landmarks[0];
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const fingerTips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

            const pinchDist = dist2D(thumbTip, indexTip) / vw;
            const pinching = pinchDist < 0.07;

            const openDistances = fingerTips.map(tip => dist2D(tip, wrist) / vw);
            const fingersOpen = openDistances.filter(d => d > 0.15).length;
            const isFist = fingersOpen === 0;

            if (isFist && !wasFist) {
                clearCanvas();
                statusDiv.textContent = '[ FIST DETECTED ] // canvas cleared';
                statusDiv.className = 'status success';
            }
            wasFist = isFist;

            const px = (1 - indexTip[0] / vw) * inkCanvas.width;
            const py = (indexTip[1] / vh) * inkCanvas.height;

            // Live finger cursor
            cursorCtx.beginPath();
            cursorCtx.arc(px, py, pinching ? 8 : 10, 0, Math.PI * 2);
            cursorCtx.fillStyle = pinching ? currentColor : 'rgba(0,255,65,0.35)';
            cursorCtx.fill();
            cursorCtx.strokeStyle = '#00ff41';
            cursorCtx.lineWidth = 2;
            cursorCtx.stroke();

            if (pinching && !isFist) {
                if (!isPinching) {
                    currentStroke = { color: currentColor, points: [{ x: px, y: py }] };
                    strokes.push(currentStroke);
                    lastPoint = { x: px, y: py };
                } else if (currentStroke) {
                    currentStroke.points.push({ x: px, y: py });
                    inkCtx.strokeStyle = currentStroke.color;
                    inkCtx.lineWidth = 4;
                    inkCtx.lineCap = 'round';
                    inkCtx.lineJoin = 'round';
                    inkCtx.shadowColor = currentStroke.color;
                    inkCtx.shadowBlur = 6;
                    inkCtx.beginPath();
                    inkCtx.moveTo(lastPoint.x, lastPoint.y);
                    inkCtx.lineTo(px, py);
                    inkCtx.stroke();
                    inkCtx.shadowBlur = 0;
                    lastPoint = { x: px, y: py };
                }
                isPinching = true;
                setPenState(true);
            } else {
                isPinching = false;
                currentStroke = null;
                lastPoint = null;
                setPenState(false);
            }
        } else {
            isPinching = false;
            currentStroke = null;
            lastPoint = null;
            setPenState(false);
        }

        frameCount++;
        const now = Date.now();
        if (now - lastFrameTime > 1000) {
            fpsDiv.textContent = frameCount;
            frameCount = 0;
            lastFrameTime = now;
        }
    } catch (err) {
        console.error(err);
    }

    requestAnimationFrame(detectHands);
}

function setPenState(down) {
    penStateDiv.textContent = down ? 'PEN_DOWN' : 'PEN_UP';
    penStateDiv.classList.toggle('active-pulse', down);
}

function redrawAll() {
    inkCtx.clearRect(0, 0, inkCanvas.width, inkCanvas.height);
    strokes.forEach(stroke => {
        if (stroke.points.length < 2) return;
        inkCtx.strokeStyle = stroke.color;
        inkCtx.lineWidth = 4;
        inkCtx.lineCap = 'round';
        inkCtx.lineJoin = 'round';
        inkCtx.shadowColor = stroke.color;
        inkCtx.shadowBlur = 6;
        inkCtx.beginPath();
        inkCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
            inkCtx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        inkCtx.stroke();
        inkCtx.shadowBlur = 0;
    });
}

function clearCanvas() {
    strokes = [];
    currentStroke = null;
    lastPoint = null;
    redrawAll();
}

function undoStroke() {
    strokes.pop();
    redrawAll();
}

function changeColor() {
    colorIndex = (colorIndex + 1) % colors.length;
    currentColor = colors[colorIndex];
    statusDiv.textContent = '[ PEN COLOR UPDATED ]';
    statusDiv.className = 'status success';
}

resizeCanvases();
