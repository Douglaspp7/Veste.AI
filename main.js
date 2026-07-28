import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

let poseLandmarker;
let lastVideoTime = -1;
const video = document.getElementById('camera');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');

async function initPose() {
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
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: 'user', width: 640, height: 480 } 
  });
  video.srcObject = stream;
  await video.play();
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  startBtn.textContent = '✅ Câmera Ativa';
  startBtn.disabled = true;
  requestAnimationFrame(detectLoop);
}

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
      // Desenha esqueleto (placeholder até termos overlay de roupa)
      const landmarks = result.landmarks[0];
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      // Desenha ombros → quadril (região do torso — onde a roupa vai)
      const shoulderL = landmarks[11];
      const shoulderR = landmarks[12];
      const hipL = landmarks[23];
      const hipR = landmarks[24];
      
      if (shoulderL && shoulderR && hipL && hipR) {
        const sx = (shoulderL.x + shoulderR.x) / 2 * canvas.width;
        const sy = (shoulderL.y + shoulderR.y) / 2 * canvas.height;
        const hx = (hipL.x + hipR.x) / 2 * canvas.width;
        const hy = (hipL.y + hipR.y) / 2 * canvas.height;
        
        // Torso: ombros → quadril
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
    }
  }
  
  requestAnimationFrame(detectLoop);
}

// Init
startBtn.addEventListener('click', startCamera);
initPose().catch(console.error);
