import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let poseLandmarker;
let currentFacing = 'user';
let lastVideoTime = -1;
let stream = null;

const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const flipBtn = document.getElementById('flip');
const statusEl = document.getElementById('status');

function status(msg) { if (statusEl) statusEl.textContent = msg; }

// ── Pose Landmarker (CDN oficial Google + fallback) ────────────────
async function initPose() {
  status('Carregando IA...');
  const wasmFilesets = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
    'https://unpkg.com/@mediapipe/tasks-vision@0.10.18/wasm',
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
  ];
  const modelFiles = [
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
    'https://cdn.jsdelivr.net/npm/@mediapipe-models/pose_landmarker/pose_landmarker_lite.task',
  ];

  let vision = null;
  for (const wasmUrl of wasmFilesets) {
    try {
      vision = await FilesetResolver.forVisionTasks(wasmUrl);
      if (vision) break;
    } catch { continue; }
  }
  if (!vision) { status('Erro no carregamento'); return; }

  for (const modelUrl of modelFiles) {
    try {
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: modelUrl, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1
      });
      if (poseLandmarker) break;
    } catch { continue; }
  }
  if (!poseLandmarker) { status('Modelo offline'); return; }

  status('Pronto 📸');
}

// ── Câmera ──────────────────────────────────────────────────────────
async function startCamera(facing) {
  stopCamera();
  currentFacing = facing || 'user';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: currentFacing,
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    video.srcObject = stream;
    await video.play();

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    flipBtn.style.display = 'inline-block';
    startBtn.style.display = 'none';
    status('Câmera ativa');
    requestAnimationFrame(detectLoop);
  } catch (e) {
    status('Permita a câmera');
    console.error(e);
  }
}

function stopCamera() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  video.srcObject = null;
}

async function flipCamera() {
  await startCamera(currentFacing === 'user' ? 'environment' : 'user');
}

// ── Detecção ────────────────────────────────────────────────────────
function detectLoop() {
  if (!stream || !poseLandmarker) return;

  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    try {
      const result = poseLandmarker.detectForVideo(video, performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (result.landmarks?.length > 0) {
        const lm = result.landmarks[0];
        const sL = lm[11], sR = lm[12], hL = lm[23], hR = lm[24];
        if (sL && sR && hL && hR) {
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 2;
          ctx.fillStyle = 'rgba(124, 58, 237, 0.12)';
          ctx.beginPath();
          ctx.moveTo(sL.x * canvas.width, sL.y * canvas.height);
          ctx.lineTo(sR.x * canvas.width, sR.y * canvas.height);
          ctx.lineTo(hR.x * canvas.width, hR.y * canvas.height);
          ctx.lineTo(hL.x * canvas.width, hL.y * canvas.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        status('Corpo detectado ✅');
      }
    } catch { /* frame descartado */ }
  }
  requestAnimationFrame(detectLoop);
}

// ── Init ────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => startCamera('user'));
flipBtn.addEventListener('click', flipCamera);
flipBtn.style.display = 'none';

initPose().then(() => startCamera('user').catch(() => {}));
