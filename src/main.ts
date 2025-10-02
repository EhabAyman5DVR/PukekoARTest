import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,  // Use zoneLensMap from the top level scopesform2D,
  Transform2D
} from '@snap/camera-kit';

// Import the AR handler

// Map of zone names to lens indices
const zoneLensMap: { [key: string]: number } = {
    sky: 1,
    treat: 3,
    care: 0,
    use: 5,
    capture: 2,
    sea: 4,
    selfie: 6  // Selfie lens index

};

// Function to get the zone from URL parameters
function getZoneFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  const zone = params.get('zone')?.toLowerCase();
  return zone && zoneLensMap.hasOwnProperty(zone) ? zone : null;
}

// Store session and media stream
let currentSession: CameraKitSession;
let mediaStream: MediaStream;
let isCameraActive = false;
let { LensesGroup }: any = {}; // Replace 'any' with the appropriate type if available
const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;

// Zones UI functionality
document.addEventListener('DOMContentLoaded', async () => {
  const qaButton = document.getElementById('qa-btn');
  const zonesSection = document.getElementById('zones-section');
  const zonesCloseBtn = document.getElementById('zones-close-btn');
  const homeSection = document.getElementById('home-section');
  const selfieBackBtn = document.getElementById('selfie-back-btn');

  // Initialize Camera Kit
  await initCameraKit();
  // Show zones when Q&A button is clicked
  qaButton?.addEventListener('click', () => {
    if (homeSection && zonesSection) {
      homeSection.style.display = 'none';
      zonesSection.style.display = 'flex';
    }
  });

  // Hide zones when close button is clicked
  zonesCloseBtn?.addEventListener('click', () => {
    if (homeSection && zonesSection) {
      zonesSection.style.display = 'none';
      homeSection.style.display = 'flex';
    }
  });

  // Handle selfie back button click
  selfieBackBtn?.addEventListener('click', () => {
    const selfieSection = document.getElementById('Selfie-section');
    if (homeSection && selfieSection) {
      selfieSection.style.display = 'none';
      homeSection.style.display = 'flex';
      currentSession.pause();
      // Stop all tracks in the media stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    }
  });

  // Handle zone button clicks
  const zoneButtons = document.querySelectorAll('.zone-btn');
  const zoneContentSection = document.getElementById('zone-content-section');
  const zoneBackBtn = document.getElementById('zone-back-btn');

  // Using zoneLensMap from the top level scope

  // Handle back button click
  zoneBackBtn?.addEventListener('click', () => {
    if (zoneContentSection && zonesSection) {
      // Move canvas back to selfie section
      const selfieSection = document.getElementById('Selfie-section');
      if (selfieSection && liveRenderTarget) {
        selfieSection.appendChild(liveRenderTarget);
      }
      //currentSession.pause();
      currentSession.removeLens();
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      zoneContentSection.style.display = 'none';
      zonesSection.style.display = 'flex';
    }
  });

  // Set up zone-specific camera
  async function initZoneCamera(zoneName: string) {
    try {
      const lensIndex = zoneLensMap[zoneName];
      if (lensIndex !== undefined && LensesGroup.lenses[lensIndex]) {
        await currentSession.applyLens(LensesGroup.lenses[lensIndex]).then(() => {
          currentSession.unmute();
        });

        await setCameraKitSource(currentSession, false); // Use back camera for zone content
        console.log(`Applied lens for zone: ${zoneName}`);
      }
    } catch (error) {
      console.error('Failed to initialize zone camera:', error);
    }
  }

  zoneButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const zone = (e.currentTarget as HTMLElement).dataset.zone;
      if (zone && zonesSection && zoneContentSection) {
        // Move canvas to zone content section and ensure it's visible
        if (liveRenderTarget) {
          liveRenderTarget.style.display = 'block';
          zoneContentSection.appendChild(liveRenderTarget);
        }
        // Initialize camera with new lens
        await initZoneCamera(zone);
        // Show the zone content
        zonesSection.style.display = 'none';
        zoneContentSection.style.display = 'flex';
      }
    });
  });

});

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
          photoCanvas.style.width = '100%';
          photoCanvas.style.height = '100%';
          photoCanvas.style.objectFit = 'contain';
          photoCanvas.style.position = 'absolute';  // Match live canvas positioning if it uses absolute
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
  let loadedLensesCount: number = 0;
  try {
    const cameraKit = await bootstrapCameraKit({ apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU2NDAyNDMwLCJzdWIiOiI1NzUwMjVjOS0xYjBlLTQ5ZjgtOWMzMy1mM2ZhN2M5ZDE0YTh-UFJPRFVDVElPTn41MDQ2Njc1Mi01N2MwLTQ5MGUtODc3MS1jYTA5NjNlZDIxNjEifQ.3sbRD47P17pMhnb3Sl5_12XA0xtSeBglslHFZNxr5r8' });
    currentSession = await cameraKit.createSession({ liveRenderTarget });
    { LensesGroup = await cameraKit.lensRepository.loadLensGroups(['c2b104f9-6b4e-4d68-bd16-6ff2c95feaeb']) };
    
    // Check if we're accessing a specific lens through URL
    const zoneParam = getZoneFromURL();
    if (zoneParam) {
      // Hide all sections except splash and show only the canvas
      document.querySelectorAll('section:not(#splash-section)').forEach(section => {
        (section as HTMLElement).style.display = 'none';
      });
      if (liveRenderTarget) {
        liveRenderTarget.style.display = 'block';
        document.body.appendChild(liveRenderTarget);
      }
      // Apply the specific lens and start camera
      const lensIndex = zoneLensMap[zoneParam];
      await currentSession.applyLens(LensesGroup.lenses[lensIndex]).then(() => {
        // Hide splash only after lens is loaded
        hideSplashLoader();
        document.body.classList.add('splash-hidden');
      });
      await setCameraKitSource(currentSession, zoneParam === 'selfie');
      return; // Exit early as we don't need to load other lenses
    }

    // Normal initialization for the full app
    console.log(LensesGroup.lenses.length);
    LensesGroup.lenses.forEach((lens: any) => {
      currentSession.applyLens(lens).then(() => {
        loadedLensesCount++;
        if (loadedLensesCount === LensesGroup.lenses.length) {
          console.log(`Loaded ${loadedLensesCount} lenses`);
          // Hide loader immediately and start splash fade-out
          hideSplashLoader();
          document.body.classList.add('splash-hidden');
          const homeSection = document.getElementById('home-section');
          if (homeSection) homeSection.style.display = 'flex';
        }
      });
    });
    // Remove fullscreen class after lens is loaded
    liveRenderTarget.classList.remove('fullscreen');
  } catch (error) {
    console.error('Failed to initialize CameraKit:', error);
  }
}

//@ts-ignore
async function setCameraKitSource(
  session: CameraKitSession,
  isFront: boolean = true) {

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: isFront ? "user" : "environment" }
  });

  const source = createMediaStreamSource(mediaStream, {
    cameraType: isFront ? 'user' : 'environment'
  });

  await session.setSource(source);
  // Only apply mirror transform for front camera
  if (isFront) {
    source.setTransform(Transform2D.MirrorX);
  }
  session.play();
  source.setRenderSize(1080, 1920);
}


// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {


  // Wire up home buttons
  const arBtn = document.getElementById('ar-btn');
  const homeSection = document.getElementById('home-section');
  const cameraSection = document.getElementById('Selfie-section');

  if (arBtn && homeSection && cameraSection) {
    arBtn.addEventListener('click', async () => {
      homeSection.style.display = 'none';
      cameraSection.style.display = 'flex';
      // await initCameraKit();
      currentSession.applyLens(LensesGroup.lenses[zoneLensMap.selfie]);
      await setCameraKitSource(currentSession, true); // Use front camera for selfie section

    });
  }

  // Add capture/download/close listeners
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

// Function to hide the splash loader
function hideSplashLoader() {
  const loader = document.getElementById('splash-loader');
  if (loader) loader.style.display = 'none';
}

// No longer need the transitionend listener since we hide the loader immediately


