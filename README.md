# Shoe Tryon - CameraKit + Model Viewer AR Demo

This project demonstrates the integration of **CameraKit Web SDK** and **Google Model Viewer** with **Augmented Reality (AR)** capabilities for a shoe try-on experience.

## Features

### 🎥 CameraKit AR Experience
- Real-time camera feed with AR lens effects
- Environment-facing camera support
- Custom lens application for AR overlays

### 🎯 3D Model Viewer with AR
- **Basic 3D Model**: Simple model viewer with AR support
- **Interactive 3D Model**: Enhanced interaction with AR capabilities
- **Shoe Model (Placeholder)**: Dedicated shoe try-on model viewer

### 🚀 AR Capabilities
- **WebXR Support**: Native AR experience on supported devices
- **Scene Viewer**: Android AR experience
- **Quick Look**: iOS AR experience
- **Cross-platform**: Works on mobile and desktop devices

## AR Features

### Supported AR Modes
- `webxr`: Native WebXR AR (Chrome, Edge, Firefox)
- `scene-viewer`: Android Scene Viewer
- `quick-look`: iOS Quick Look

### AR Placement Options
- **Floor Placement**: Models placed on detected surfaces
- **Wall Placement**: Models attached to vertical surfaces
- **Auto Scaling**: Models automatically scaled to real-world size

### Interactive Elements
- AR activation buttons for each model
- Loading indicators during model preparation
- Success/error notifications
- AR session status indicators

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with WebXR support
- Mobile device for full AR experience

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Shoe-Tryon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### AR Testing

#### Desktop Testing
- Use Chrome/Edge with WebXR support
- Enable AR features in browser settings
- Use device emulation for mobile testing

#### Mobile Testing
- **Android**: Use Chrome or Samsung Internet
- **iOS**: Use Safari with AR Quick Look support
- Ensure device has ARCore (Android) or ARKit (iOS)

## Project Structure

```
Shoe-Tryon/
├── index.html              # Main HTML with Model Viewer examples
├── styles.css              # Styling for layout and AR components
├── src/
│   ├── main.ts             # CameraKit initialization
│   └── model-viewer-ar.ts  # AR interaction handler
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## AR Implementation Details

### Model Viewer Configuration
```html
<model-viewer 
  src="model.glb"
  ar
  ar-modes="webxr scene-viewer quick-look"
  ar-scale="auto"
  ar-placement="floor"
  ar-button>
  <button slot="ar-button">Activate AR</button>
</model-viewer>
```

### AR Event Handling
The project includes comprehensive AR event handling:
- AR session start/end events
- Model loading states
- Error handling and user feedback
- Cross-platform compatibility checks

### Supported 3D Formats
- **GLB/GLTF**: Primary format for AR models
- **USDZ**: iOS Quick Look support
- **OBJ/FBX**: Conversion required for AR

## Browser Compatibility

### AR Support Matrix
| Browser | WebXR | Scene Viewer | Quick Look |
|---------|-------|--------------|------------|
| Chrome (Android) | ✅ | ✅ | ❌ |
| Safari (iOS) | ❌ | ❌ | ✅ |
| Firefox (Android) | ✅ | ❌ | ❌ |
| Edge (Windows) | ✅ | ❌ | ❌ |

### Device Requirements
- **Android**: ARCore supported devices
- **iOS**: ARKit supported devices (iPhone 6s+, iPad 5th gen+)
- **Desktop**: WebXR enabled browsers

## Development

### Adding New Models
1. Place your GLB file in the `public/models/` directory
2. Update the `src` attribute in the model-viewer element
3. Test AR functionality on target devices

### Customizing AR Experience
- Modify AR placement options in `model-viewer-ar.ts`
- Adjust AR button styling in `styles.css`
- Add custom AR interactions in the handler class

### Debugging AR
- Check browser console for AR support detection
- Use device emulation for testing
- Verify model format compatibility

## Troubleshooting

### Common Issues

#### AR Not Working
- Ensure device supports AR (ARCore/ARKit)
- Check browser compatibility
- Verify HTTPS connection (required for AR)

#### Models Not Loading
- Check model file format (GLB recommended)
- Verify file path and CORS settings
- Ensure model file size is reasonable

#### AR Button Not Appearing
- Check AR support detection
- Verify model-viewer element configuration
- Ensure proper CSS styling

## Future Enhancements

- [ ] Real shoe model integration
- [ ] Foot tracking and measurement
- [ ] Multiple shoe models and sizes
- [ ] AR try-on with foot detection
- [ ] Social sharing features
- [ ] Analytics and user tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test AR functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Google Model Viewer](https://modelviewer.dev/) for 3D model rendering
- [CameraKit Web SDK](https://camera-kit.com/) for AR lens effects
- [WebXR Device API](https://immersive-web.github.io/webxr/) for AR standards 