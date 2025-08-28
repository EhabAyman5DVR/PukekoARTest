
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

async function initCameraKit() {
  if (isCameraActive) return; // Prevent multiple initializations
  
  try {
    const cameraKit = await bootstrapCameraKit({ apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzUyNDkyMzM3LCJzdWIiOiJlMDA1YTEzMy1jNmNlLTRmNmUtYjMyMC05YTNkYzVjOTRlZTN-U1RBR0lOR35mZjZkOGU3OC0xZWYzLTQ3ZWUtOGY0ZC1lM2Y5MDZjOTZlZTEifQ.yf7OFtk9dhdjq8FsmXghKNea_7GMoBF01AGEpTVj6ZY' });
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
    video: { facingMode: "environment" }
  });

  const source = createMediaStreamSource(mediaStream, { cameraType: 'environment' });

  await session.setSource(source);
  session.play();
}


// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  //initCarousel();
   initCameraKit();

});


