# 3D Models Directory

This directory contains 3D models for the AR shoe try-on application.

## Supported Formats

- **GLB/GLTF**: Primary format for AR models (recommended)
- **USDZ**: iOS Quick Look support
- **OBJ/FBX**: Conversion required for AR

## Adding Your Models

1. **Place your model file** in this directory (e.g., `Shoe_1.glb`)
2. **Update the HTML** to reference your model:
   ```html
   <model-viewer 
     src="/models/your-model.glb"
     alt="Your Model Description"
     ...>
   ```

## Model Requirements

### For AR Compatibility:
- **File size**: Keep under 10MB for optimal loading
- **Format**: GLB is preferred for cross-platform AR
- **Textures**: Embedded in GLB file
- **Scale**: Models should be in real-world units (meters)

### For Web Display:
- **Polygon count**: Under 50,000 triangles for smooth performance
- **Textures**: 2048x2048 max resolution
- **Materials**: PBR materials work best

## Example Model Structure

```
public/models/
├── Shoe_1.glb          # Main shoe model
├── Shoe_2.glb          # Alternative shoe
├── Shoe_3.glb          # Another option
└── README.md           # This file
```

## Troubleshooting

### Model Not Loading:
- Check file path in HTML (`/models/filename.glb`)
- Verify file exists in this directory
- Ensure file format is supported (GLB recommended)
- Check browser console for CORS errors

### AR Not Working:
- Ensure model is GLB format
- Check model size (should be reasonable scale)
- Verify AR attributes are set in HTML

## Sample Models

You can find free 3D models at:
- [Sketchfab](https://sketchfab.com/) - Free and paid models
- [TurboSquid](https://www.turbosquid.com/) - Professional models
- [Google Poly](https://poly.google.com/) - Free models (archived)
- [BlendSwap](https://www.blendswap.com/) - Free Blender models

## Converting Models

If you have models in other formats:

### OBJ to GLB:
```bash
# Using Blender (free)
blender --background --python convert_obj_to_glb.py input.obj output.glb

# Using online converters
# - https://modelconverter.com/
# - https://www.mixamo.com/
```

### FBX to GLB:
```bash
# Using Blender
blender --background --python convert_fbx_to_glb.py input.fbx output.glb
```

## Model Optimization

For better performance:
1. Reduce polygon count
2. Compress textures
3. Remove unused materials
4. Optimize UV maps
5. Use texture atlasing 