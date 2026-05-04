# Face ID Threshold Configuration

## Overview
This document describes the Face ID recognition threshold setting in the AI Service that controls how strict the face matching algorithm is when verifying users.

## Current Configuration (Demo Mode)

**File**: `AI-Service/AI_Face.py`  
**Line**: ~800 (in `/face-verify` Flask endpoint)

```python
if dist < 1.65:  # Current threshold (LOOSE for demo/testing)
    label_idx = app.classifier.predict([emb])[0]
    name = app.encoder.inverse_transform([label_idx])[0]
    is_authorized = name in app.authorized_users
    
    if is_authorized:  # Only unlock if authorized user
        # Send unlock command
```

### Current Setting
- **Threshold**: `dist < 1.65`
- **Mode**: ESP32-CAM Compatible (Loose)
- **Purpose**: Compensate for ESP32-CAM's low image quality (blurry, low resolution, poor lighting)
- **Security Level**: Lower (more permissive to handle poor camera quality)

## Alternative Configuration (If Using Better Camera)

### Recommended Setting (For High-Quality Camera)
- **Threshold**: `dist < 0.8`
- **Mode**: Strict (For HD Webcam or IP Camera)
- **Purpose**: Higher security when using better quality camera
- **Security Level**: Higher (more restrictive)
- **Note**: Only use this if you upgrade from ESP32-CAM to a better camera (HD webcam, IP camera, etc.)

### How to Change

1. Open file: `DoAn_TTTN/AI-Service/AI_Face.py`
2. Navigate to line ~800 (inside the `/face-verify` Flask endpoint)
3. Change the threshold value:

```python
# FROM (Demo Mode):
if dist < 1.65:

# TO (Production Mode):
if dist < 0.8:
```

## Understanding the Distance Metric

- **Lower distance** = Better match (faces are more similar)
- **Higher distance** = Worse match (faces are less similar)

### Distance Ranges
- `dist < 0.6`: Excellent match (same person, good lighting)
- `dist < 0.8`: Good match (recommended for production)
- `dist < 1.0`: Acceptable match (may have some false positives)
- `dist < 1.65`: Loose match (current demo setting, higher false positive rate)
- `dist >= 1.65`: No match (different person)

## Security Implications

### ESP32-CAM Mode (dist < 1.65) - Current
- ✅ Works with low-quality ESP32-CAM images (blurry, low resolution)
- ✅ Compensates for poor lighting conditions
- ✅ Handles JPEG compression artifacts from ESP32-CAM
- ✅ System already includes ESP32-CAM degradation simulation during training
- ⚠️ Higher false positive rate (may unlock for similar-looking people)
- ⚠️ Trade-off: Usability vs Security (prioritizes usability for ESP32-CAM hardware)

### Strict Mode (dist < 0.8) - For Better Cameras Only
- ✅ Higher security
- ✅ Lower false positive rate
- ✅ More accurate face matching
- ⚠️ **Will NOT work with ESP32-CAM** (images too blurry)
- ⚠️ Requires HD webcam or IP camera
- ⚠️ May need to re-register users with better camera

## Important Notes

1. **Authorization Check**: The system ONLY unlocks if `is_authorized = True`, meaning the recognized person must be in the authorized users list. This is correct and secure.

2. **Testing Before Deployment**: When changing to production mode (`dist < 0.8`), thoroughly test with all registered users to ensure they can still be recognized.

3. **Re-registration**: If users cannot be recognized after tightening the threshold, they may need to be re-registered with more training images (currently 20 images per user).

4. **ESP32-CAM Considerations**: The system already includes ESP32-CAM image degradation simulation during training to improve recognition from lower quality cameras.

## Change History

| Date | Threshold | Mode | Reason |
|------|-----------|------|--------|
| 2024 | 1.65 | Demo | Loosened for graduation project demonstration |
| TBD | 0.8 | Production | To be implemented for real-world deployment |

## Related Files

- `AI-Service/AI_Face.py` - Main AI service with Face ID logic
- `IoT-Firmware/Smart_Jewelry_IoT/Smart_Jewelry_IoT.ino` - ESP32 firmware that calls Face ID API
- `Web-App/BE/src/controllers/security.controller.js` - Backend unlock controller

## Contact

For questions about Face ID threshold configuration, contact the development team.

---

**Last Updated**: 2026-05-05  
**Author**: Lê Dương Bảo
