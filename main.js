import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let poseLandmarker;
let currentFacing = 'user'; // 'user' = frontal, 'environment' = traseira
let lastVideoTime = -1;
let stream = null;

const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const flipBtn = document.getElementById('flip');
const statusEl = document.getElementById('status');

// ── Pose Landmarker ──────────────────────────────────────────────────
async function initPose() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numPoses: 1
    });
    console.log('✅ Pose Landmarker pronto');
    status('IA pronta');
  } catch (e) {
    status('Erro ao carregar IA');
    console.error(e);
  }
}

// ── Câmera ──────────────────────────────────────────────────────────
async function startCamera(facing = 'user') {
  stopCamera();
  currentFacing = facing;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacing, width: { ideal: 640 }, height: { ideal: 480 } }
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
    status('Erro: permita o acesso à câmera');
    console.error(e);
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

async function flipCamera() {
  currentFacing = currentFacing === 'user' ? 'environment' : 'user';
  await startCamera(currentFacing);
}

// ── Detecção ────────────────────────────────────────────────────────
function detectLoop() {
  if (!poseLandmarker || video.readyState < 2) {
    requestAnimationFrame(detectLoop);
    return;
  }

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = poseLandmarker.detectForVideo(video, performance.now());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (result.landmarks?.length > 0) {
      const landmarks = result.landmarks[0];
      const shoulderL = landmarks[11];
      const shoulderR = landmarks[12];
      const hipL = landmarks[23];
      const hipR = landmarks[24];

      if (shoulderL && shoulderR && hipL && hipR) {
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 3;

        // Torso — região do overlay de roupa
        ctx.beginPath();
        ctx.moveTo(shoulderL.x * canvas.width, shoulderL.y * canvas.height);
        ctx.lineTo(shoulderR.x * canvas.width, shoulderR.y * canvas.height);
        ctx.lineTo(hipR.x * canvas.width, hipR.y * canvas.height);
        ctx.lineTo(hipL.x * canvas.width, hipL.y * canvas.height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
        ctx.fill();
        ctx.stroke();
      }

      status('Corpo detectado ✅');
    }
  }

  requestAnimationFrame(detectLoop);
}

// ── UI ──────────────────────────────────────────────────────────────
function status(msg) {
  if (statusEl) statusEl.textContent = msg;
}

// ── Init ────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => startCamera('user'));
flipBtn.addEventListener('click', flipCamera);
flipBtn.style.display = 'none';
initPose();
