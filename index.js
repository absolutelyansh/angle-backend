const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const detectAngleAutomatically = require('./utils/angle_detector'); // OpenCV auto method
const calculateAngleFromPoints = require('./utils/calculateAngleFromPoints'); // NEW FUNCTION

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/detect-angle', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const pointsJson = req.body.points;

    // ✅ If user selected points are provided
    if (pointsJson) {
      const points = JSON.parse(pointsJson);

      if (!Array.isArray(points) || points.length !== 4) {
        return res.status(400).json({ error: 'Exactly 4 points are required (2 lines).' });
      }

      const angle = calculateAngleFromPoints(points);

      // Optionally generate overlay with user lines
      return res.json({
        angle,
        overlay: null, // You can generate annotated image later
      });
    }

    // ❌ No points? Run default OpenCV detection
    const { angle, overlayPath } = await detectAngleAutomatically(imagePath);
    const overlayBase64 = fs.readFileSync(overlayPath, { encoding: 'base64' });

    return res.json({
      angle,
      overlay: `data:image/jpeg;base64,${overlayBase64}`,
    });
  } catch (err) {
    console.error('Detection error:', err);
    return res.status(500).json({ error: 'Internal server error during angle detection.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Angle backend running on port ${PORT}`);
});
