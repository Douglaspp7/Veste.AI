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

// ── Status helper ───────────────────────────────────────────────────
function status(msg) { if (statusEl) statusEl.textContent = msg; }

// ── Pose Landmarker (carrega em background) ─────────────────────────
async function initPose() {
  try {
    status('Carregando IA...');
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
    status('Pronto 📸');
  } catch (e) {
    status('IA offline — tente recarregar');
    console.error(e);
  }
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

    // Ajusta canvas quando o vídeo estiver pronto
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }, { once: true });
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    flipBtn.style.display = 'inline-block';
    startBtn.style.display = 'none';
    status('Câmera ativa');
    requestAnimationFrame(detectLoop);
  } catch (e) {
    status('Permita a câmera nas configurações');
    console.error('Camera error:', e);
    startBtn.style.display = 'inline-block';
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
}

async function flipCamera() {
  await startCamera(currentFacing === 'user' ? 'environment' : 'user');
}

// ── Detecção de corpo ──────────────────────────────────────────────
function detectLoop() {
  if (!stream) return; // câmera desligada

  if (!poseLandmarker || video.readyState < 2) {
    requestAnimationFrame(detectLoop);
    return;
  }

  if (video.currentTime !== lastVideoTime) {
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
    } catch (e) {
      // frame descartado, ignora
    }
  }

  requestAnimationFrame(detectLoop);
}

// ── Init ────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => startCamera('user'));
flipBtn.addEventListener('click', flipCamera);
flipBtn.style.display = 'none';

// Inicia IA e abre câmera automaticamente
(async () => {
  await initPose();
  try { await startCamera('user'); } catch { /* usuário decide quando tocar */ }
})();
