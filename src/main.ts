
import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  //Transform2D,
} from '@snap/camera-kit';

// Import the AR handler
import './model-viewer-ar';


// Store the current session
let currentSession: CameraKitSession;
let mediaStream: MediaStream;
let isCameraActive = false;

const liveRenderTarget = document.getElementById(
  'canvas'
) as HTMLCanvasElement;

async function initCameraKit() {
  if (isCameraActive) return; // Prevent multiple initializations
  
  try {
    const cameraKit = await bootstrapCameraKit({ apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzUyNDkyMzM3LCJzdWIiOiJlMDA1YTEzMy1jNmNlLTRmNmUtYjMyMC05YTNkYzVjOTRlZTN-U1RBR0lOR35mZjZkOGU3OC0xZWYzLTQ3ZWUtOGY0ZC1lM2Y5MDZjOTZlZTEifQ.yf7OFtk9dhdjq8FsmXghKNea_7GMoBF01AGEpTVj6ZY' });
    currentSession = await cameraKit.createSession({ liveRenderTarget });
    const lenses = await cameraKit.lensRepository.loadLens('d7528926-199d-4e36-8e06-c1e6d27ff519',
      'c352182f-89be-4007-b24c-8fcf50c56d56'
    );

    currentSession.applyLens(lenses);

    // Remove fullscreen class after lens is loaded
    liveRenderTarget.classList.remove('fullscreen');

    await setCameraKitSource(currentSession);
    isCameraActive = true;
  } catch (error) {
    console.error('Failed to initialize CameraKit:', error);
  }
}

async function setCameraKitSource(
  session: CameraKitSession) {

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  const source = createMediaStreamSource(mediaStream, { cameraType: 'environment' });

  await session.setSource(source);

  // source.setTransform(Transform2D.MirrorX);



  session.play();
}
// Carousel functionality for model switching
function initCarousel() {
  const viewer = document.getElementById('shoe-viewer') as any;
  const buttons = document.querySelectorAll('.variant-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active state from all buttons
      buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      // Set active state on clicked button
      btn.setAttribute('aria-pressed', 'true');
      // Change model source
      const newSrc = btn.getAttribute('data-src');
      if (newSrc && viewer) {
        viewer.setAttribute('src', newSrc);
        console.log('Switched to model:', newSrc);
      }
    });
  });
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initWorkflowHandlers();
});

// Workflow handlers for camera and AR
function initWorkflowHandlers() {
  const tryOnBtn = document.getElementById('try-on-btn');
  const arBtn = document.getElementById('ar-btn');
  const cameraSection = document.getElementById('camera-section');
  const closeCameraBtn = document.getElementById('close-camera-btn');

  // Try On with Camera button
  tryOnBtn?.addEventListener('click', async () => {
    console.log('Starting camera try-on experience...');
    cameraSection!.style.display = 'flex';
    await initCameraKit();
  });

  // AR button (uses model-viewer's built-in AR)
  arBtn?.addEventListener('click', () => {
    console.log('Launching AR experience...');
    const modelViewer = document.getElementById('shoe-viewer') as any;
    if (modelViewer && modelViewer.activateAR) {
      modelViewer.activateAR();
    }
  });

  // Close camera button
  closeCameraBtn?.addEventListener('click', () => {
    console.log('Closing camera experience...');
    cameraSection!.style.display = 'none';
    
    // Stop camera stream
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (currentSession) {
      currentSession.pause();
    }
    isCameraActive = false;
  });
}

