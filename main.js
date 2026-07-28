/**
 * Veste.AI — Provador Virtual
 * Body tracking com TensorFlow.js MoveNet (Google).
 * Mais leve e confiável que MediaPipe em mobile.
 */

let detector = null;
let currentFacing = 'user';
let stream = null;
let animFrame = null;

const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const flipBtn = document.getElementById('flip');
const statusEl = document.getElementById('status');

function status(msg) { if (statusEl) statusEl.textContent = msg; }

// ── TensorFlow.js + MoveNet ─────────────────────────────────────────
async function initDetector() {
  status('Carregando IA...');

  try {
    // Carrega TF.js e modelo via CDNs oficiais
    const [tf, poseDetection] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.21.0/dist/tf.min.js'),
      import('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js'),
    ]);

    await tf.default.ready();
    await tf.default.setBackend('webgl');

    detector = await poseDetection.default.createDetector(
      poseDetection.default.SupportedModels.MoveNet,
      { modelType: poseDetection.default.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );

    status('Pronto 📸');
    console.log('✅ MoveNet carregado');
  } catch (e) {
    status('IA offline — tente recarregar');
    console.error('Init error:', e);
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
        height: { ideal: 480 },
      },
    });
    video.srcObject = stream;
    await video.play();

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    flipBtn.style.display = 'inline-block';
    startBtn.style.display = 'none';
    status('Câmera ativa');
    detectLoop();
  } catch (e) {
    status('Permita a câmera');
    console.error('Camera:', e);
  }
}

function stopCamera() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  video.srcObject = null;
}

async function flipCamera() {
  await startCamera(currentFacing === 'user' ? 'environment' : 'user');
}

// ── Detecção ────────────────────────────────────────────────────────
function detectLoop() {
  if (!stream || !detector) {
    animFrame = requestAnimationFrame(detectLoop);
    return;
  }

  // Só detecta a cada 3 frames pra economia de bateria
  let skip = 0;

  async function frame() {
    if (!stream) return;
    skip = (skip + 1) % 3;

    if (skip === 0 && video.readyState >= 2) {
      try {
        const poses = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
          const kp = poses[0].keypoints;
          const sL = kp.find(k => k.name === 'left_shoulder');
          const sR = kp.find(k => k.name === 'right_shoulder');
          const hL = kp.find(k => k.name === 'left_hip');
          const hR = kp.find(k => k.name === 'right_hip');

          if (sL && sR && hL && hR && sL.score > 0.25 && sR.score > 0.25) {
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(124, 58, 237, 0.12)';
            ctx.beginPath();
            ctx.moveTo(sL.x, sL.y);
            ctx.lineTo(sR.x, sR.y);
            ctx.lineTo(hR.x, hR.y);
            ctx.lineTo(hL.x, hL.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          status('Corpo detectado ✅');
        }
      } catch { /* frame perdido */ }
    }
    animFrame = requestAnimationFrame(frame);
  }
  animFrame = requestAnimationFrame(frame);
}

// ── Init ────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => startCamera('user'));
flipBtn.addEventListener('click', flipCamera);
flipBtn.style.display = 'none';

initDetector().then(() => startCamera('user').catch(() => {}));
