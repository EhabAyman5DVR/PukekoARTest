
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

// Photo capture functionality
let capturedImageData: string | null = null;

function capturePhoto() {
  if (!liveRenderTarget) {
    console.error('Canvas not found');
    return;
  }

  try {
    // Capture the current canvas content
    capturedImageData = liveRenderTarget.toDataURL('image/png');
    
    // Get the photo canvas and display the captured photo
    const photoCanvas = document.getElementById('photo-canvas') as HTMLCanvasElement;
    if (photoCanvas) {
      // Set canvas dimensions to match the captured image
      photoCanvas.width = liveRenderTarget.width;
      photoCanvas.height = liveRenderTarget.height;
      
      // Get the 2D context and draw the captured photo
      const ctx = photoCanvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          // Clear the canvas and draw the captured image
          ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
          ctx.drawImage(img, 0, 0);
          
          // Show the photo canvas, hide the main canvas
          photoCanvas.style.display = 'block';
          liveRenderTarget.style.display = 'none';
        };
        img.src = capturedImageData;
      }
    }
    
    // Hide capture button, show download and close buttons
    const screenshotBtn = document.getElementById('screenshot-btn');
    const downloadBtn = document.getElementById('download-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (screenshotBtn) screenshotBtn.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'flex';
    if (closeBtn) closeBtn.style.display = 'flex';
    
  } catch (error) {
    console.error('Failed to capture photo:', error);
  }
}

function downloadPhoto() {
  if (capturedImageData) {
    const a = document.createElement('a');
    a.href = capturedImageData;
    a.download = `pukeko-ar-photo-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function closePhoto() {
  // Clear the captured image
  capturedImageData = null;
  
  // Hide photo canvas, show main canvas
  const photoCanvas = document.getElementById('photo-canvas');
  if (photoCanvas) {
    photoCanvas.style.display = 'none';
  }
  
  if (liveRenderTarget) {
    liveRenderTarget.style.display = 'block';
  }
  
  // Hide download and close buttons
  const downloadBtn = document.getElementById('download-btn');
  const closeBtn = document.getElementById('close-btn');
  
  if (downloadBtn) downloadBtn.style.display = 'none';
  if (closeBtn) closeBtn.style.display = 'none';
  
  // Show capture button again
  const screenshotBtn = document.getElementById('screenshot-btn');
  if (screenshotBtn) screenshotBtn.style.display = 'flex';
  
  // Restart the camera with lens
  if (currentSession && isCameraActive) {
    currentSession.play();
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

   // Add button event listeners
   const screenshotBtn = document.getElementById('screenshot-btn');
   const downloadBtn = document.getElementById('download-btn');
   const closeBtn = document.getElementById('close-btn');
   
   if (screenshotBtn) {
     screenshotBtn.addEventListener('click', capturePhoto);
   }
   
   if (downloadBtn) {
     downloadBtn.addEventListener('click', downloadPhoto);
   }
   
   if (closeBtn) {
     closeBtn.addEventListener('click', closePhoto);
   }
});


