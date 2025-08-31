
import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  //Transform2D,
} from '@snap/camera-kit';

// Import the AR handler


// Store the current session
let currentSession: CameraKitSession;
let mediaStream: MediaStream;
let isCameraActive = false;

const liveRenderTarget = document.getElementById(
  'canvas'
) as HTMLCanvasElement;

// Screenshot functionality
function takeScreenshot() {
  if (!liveRenderTarget) {
    console.error('Canvas not found');
    return;
  }

  try {
    // Create a temporary canvas to handle the mirror effect
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      console.error('Could not get 2D context');
      return;
    }

    // Set dimensions
    tempCanvas.width = liveRenderTarget.width;
    tempCanvas.height = liveRenderTarget.height;

    // Draw the canvas content (which is already mirrored)
    tempCtx.drawImage(liveRenderTarget, 0, 0);

    // Convert to blob and download
    tempCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pukeko-ar-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

async function initCameraKit() {
  if (isCameraActive) return; // Prevent multiple initializations
  
  try {
    const cameraKit = await bootstrapCameraKit({ apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU2NDAyNDMwLCJzdWIiOiI1NzUwMjVjOS0xYjBlLTQ5ZjgtOWMzMy1mM2ZhN2M5ZDE0YTh-UFJPRFVDVElPTn41MDQ2Njc1Mi01N2MwLTQ5MGUtODc3MS1jYTA5NjNlZDIxNjEifQ.3sbRD47P17pMhnb3Sl5_12XA0xtSeBglslHFZNxr5r8'});
    currentSession = await cameraKit.createSession({ liveRenderTarget });
    const lenses = await cameraKit.lensRepository.loadLens('ff807fbc-e949-42b4-a54b-47501745d4f2',
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
    video: { facingMode: "user" }
  });

  const source = createMediaStreamSource(mediaStream, { cameraType: 'user' });

  await session.setSource(source);
  session.play();
}


// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  //initCarousel();
   initCameraKit();

   // Add screenshot button event listener
   const screenshotBtn = document.getElementById('screenshot-btn');
   if (screenshotBtn) {
     screenshotBtn.addEventListener('click', takeScreenshot);
   }
});


