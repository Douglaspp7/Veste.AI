/**
 * Veste.AI — Provador Virtual
 * Body tracking: TensorFlow.js MoveNet (carregado via script tags)
 */

/* globals tf, poseDetection */

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

// ── Inicializa detector assim que TF.js estiver pronto ──────────────
async function initDetector() {
  status('Carregando IA...');

  const check = () => {
    if (window.tf && window.poseDetection) {
      setupDetector();
    } else {
      setTimeout(check, 200);
    }
  };

  if (window.tf && window.poseDetection) {
    await setupDetector();
  } else {
    setTimeout(check, 200);
  }
}

async function setupDetector() {
  try {
    await tf.ready();
    await tf.setBackend('webgl');
    console.log('TF backend:', tf.getBackend());

    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );

    status('Pronto 📸');
    console.log('✅ MoveNet carregado');

    // Auto-abre câmera
    startCamera('user').catch(() => {});
  } catch (e) {
    status('IA offline — recarregue');
    console.error('Detector error:', e);
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
    status('Permita a câmera no navegador');
    console.error('Camera error:', e);
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
      } catch { /* frame descartado */ }
    }
    animFrame = requestAnimationFrame(frame);
  }
  animFrame = requestAnimationFrame(frame);
}

// ── Init ────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => startCamera('user'));
flipBtn.addEventListener('click', flipCamera);
flipBtn.style.display = 'none';
status('Carregando IA...');
initDetector();
