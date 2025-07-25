const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const calculateAngleFromPoints = require('./utils/calculateAngleFromPoints');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.send('AngleVision backend is running ✅');
});

app.post('/detect-angle', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  let points = null;
  try {
    if (req.body.points) {
      points = JSON.parse(req.body.points);
    }
  } catch (err) {
    console.warn('Points parse error:', err);
  }

  if (points && points.length === 4) {
    try {
      const angle = calculateAngleFromPoints(points);
      const imageData = fs.readFileSync(imagePath, 'base64');
      return res.json({
        angle,
        overlay: `data:image/jpeg;base64,${imageData}`,
      });
    } catch (err) {
      console.error("Custom point calculation failed", err);
      return res.status(500).json({ error: 'Manual angle calculation failed' });
    }
  }

  // Fallback: auto-detect using Python
  exec(`python3 utils/angle_detector.py ${imagePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Python error:', stderr);
      return res.status(500).json({ error: 'Auto angle detection failed' });
    }

    try {
      const data = JSON.parse(stdout.trim());
      res.json(data);
    } catch (parseErr) {
      console.error('Failed to parse Python output:', stdout);
      res.status(500).json({ error: 'Invalid response from Python script' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
