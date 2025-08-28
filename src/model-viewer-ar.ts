// Model Viewer AR Interaction Handler
interface ModelViewerElement extends HTMLElement {
  src: string;
  alt: string;
  cameraControls: boolean;
  autoRotate: boolean;
  shadowIntensity: number;
  environmentImage: string;
  exposure: number;
  shadowSoftness: number;
  cameraOrbit: string;
  minCameraOrbit: string;
  maxCameraOrbit: string;
  interactionPrompt: string;
  loading: string;
  ar: boolean;
  arModes: string;
  arScale: string;
  arPlacement: string;
  arButton: boolean;
  
  // AR-specific methods
  activateAR(): Promise<void>;
  
  // Event listeners
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

class ModelViewerARHandler {
  private modelViewers: ModelViewerElement[] = [];
  private arSupported: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Check AR support
    this.arSupported = await this.checkARSupport();
    
    // Initialize model viewers
    this.initializeModelViewers();
    
    // Add event listeners
    this.addEventListeners();
    
    console.log('Model Viewer AR Handler initialized');
  }

  private async checkARSupport(): Promise<boolean> {
    // Check for WebXR support
    if ('xr' in navigator) {
      try {
        const xr = (navigator as any).xr;
        const isSupported = await xr.isSessionSupported('immersive-ar');
        console.log('WebXR AR supported:', isSupported);
        return isSupported;
      } catch (error) {
        console.log('WebXR AR not supported:', error);
        return false;
      }
    }
    
    // Check for Scene Viewer (Android)
    if (navigator.userAgent.includes('Android')) {
      console.log('Android detected - Scene Viewer may be available');
      return true;
    }
    
    // Check for Quick Look (iOS)
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      console.log('iOS detected - Quick Look may be available');
      return true;
    }
    
    return false;
  }

  private initializeModelViewers(): void {
    const modelViewerElements = document.querySelectorAll('model-viewer') as NodeListOf<ModelViewerElement>;

    modelViewerElements.forEach((modelViewer) => {
      this.modelViewers.push(modelViewer);
      
      // Add loading indicator
      this.addLoadingIndicator(modelViewer);
    });
  }

  private addLoadingIndicator(modelViewer: ModelViewerElement): void {
    // Create loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
      <div class="spinner"></div>
      <span>Loading 3D Model...</span>
    `;
    
    // Style the loading indicator
    loadingIndicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      z-index: 5;
    `;
    
    // Add spinner styles
    const spinner = loadingIndicator.querySelector('.spinner') as HTMLElement;
    spinner.style.cssText = `
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;
    
    // Add keyframes for spinner animation
    if (!document.querySelector('#spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // Add to model viewer
    modelViewer.appendChild(loadingIndicator);

    // Remove loading indicator when model is loaded
    modelViewer.addEventListener('load', () => {
      loadingIndicator.remove();
    });
  }

  private addEventListeners(): void {
    this.modelViewers.forEach((modelViewer, index) => {
      // AR activation events
      modelViewer.addEventListener('ar-status', (event: any) => {
        console.log(`AR Status for model ${index}:`, event.detail.status);
        this.handleARStatus(event.detail, index);
      });

      // Model loading events
      modelViewer.addEventListener('load', () => {
        console.log(`Model ${index} loaded successfully`);
        this.onModelLoaded(index);
      });
      
      // Error handling
      modelViewer.addEventListener('error', (event: any) => {
        console.error(`Error loading model ${index}:`, event.detail);
        this.handleModelError(index, event.detail);
      });
      
      // AR button click
      const arButton = modelViewer.querySelector('button[slot="ar-button"]');
      if (arButton) {
        arButton.addEventListener('click', (event) => {
          event.preventDefault();
          this.handleARButtonClick(index);
        });
      }
    });
  }

  private handleARStatus(status: any, modelIndex: number): void {
    switch (status) {
      case 'failed':
        console.error(`AR failed for model ${modelIndex}`);
        // Don't show error immediately, AR might still work
        break;
      case 'not-presenting':
        console.log(`AR session ended for model ${modelIndex}`);
        break;
      case 'session-started':
        console.log(`AR session started for model ${modelIndex}`);
        this.onARSessionStarted(modelIndex);
        break;
      case 'session-ended':
        console.log(`AR session ended for model ${modelIndex}`);
        this.onARSessionEnded(modelIndex);
        break;
    }
  }

  private async handleARButtonClick(modelIndex: number): Promise<void> {
    const modelViewer = this.modelViewers[modelIndex];
    
    console.log(`Attempting to activate AR for model ${modelIndex}`);
    
    try {
      // Let the model-viewer handle AR activation directly
      // Don't check canActivateAR as it might be unreliable
      console.log(`Activating AR for model ${modelIndex}`);
      await modelViewer.activateAR();
    } catch (error) {
      console.error(`Error activating AR for model ${modelIndex}:`, error);
      // Only show error if it's a real error, not just AR opening in another app
      const errorMessage = error?.toString() || '';
      if (errorMessage.includes('User denied') || errorMessage.includes('cancelled')) {
        console.log('User cancelled AR activation');
      } else {
        this.showARError();
      }
    }
  }

  private onModelLoaded(modelIndex: number): void {
    console.log(`Model ${modelIndex} is ready for AR`);
    
    // Add success indicator
    const modelViewer = this.modelViewers[modelIndex];
    const successIndicator = document.createElement('div');
    successIndicator.className = 'model-ready-indicator';
    successIndicator.innerHTML = '✅ Model Ready';
    successIndicator.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(76, 175, 80, 0.9);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
      z-index: 5;
    `;
    
    modelViewer.appendChild(successIndicator);
    
    // Remove indicator after 3 seconds
    setTimeout(() => {
      successIndicator.remove();
    }, 3000);
  }

  private handleModelError(modelIndex: number, error: any): void {
    console.error(`Model ${modelIndex} failed to load:`, error);
    
    const modelViewer = this.modelViewers[modelIndex];
    const errorIndicator = document.createElement('div');
    errorIndicator.className = 'model-error-indicator';
    errorIndicator.innerHTML = '❌ Model Failed to Load';
    errorIndicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(244, 67, 54, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: bold;
      z-index: 5;
    `;

    modelViewer.appendChild(errorIndicator);
  }


  private showARError(): void {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      ">
        ❌ AR failed to start
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  private onARSessionStarted(modelIndex: number): void {
    console.log(`AR session started for model ${modelIndex}`);
    
    // Add AR session indicator
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      ">
        🎯 AR Session Active
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  private onARSessionEnded(modelIndex: number): void {
    console.log(`AR session ended for model ${modelIndex}`);
    
    // Add session ended indicator
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #2196f3;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      ">
        👋 AR Session Ended
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Public methods
  public getModelViewers(): ModelViewerElement[] {
    return this.modelViewers;
  }

  public isARSupported(): boolean {
    return this.arSupported;
  }

  public async activateARForModel(modelIndex: number): Promise<void> {
    if (modelIndex >= 0 && modelIndex < this.modelViewers.length) {
      await this.handleARButtonClick(modelIndex);
    }
  }
}

// Initialize the AR handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for model-viewer to be defined
  customElements.whenDefined('model-viewer').then(() => {
    new ModelViewerARHandler();
  });
});

export default ModelViewerARHandler; 