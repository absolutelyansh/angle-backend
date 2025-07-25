const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}.jpg`);
  },
});
const upload = multer({ storage });

// 🟩 Detect angle from image
app.post('/detect-angle', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  const points = req.body.points;

  try {
    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'utils', 'angle_detector.py'),
      imagePath,
      points ? JSON.stringify(JSON.parse(points)) : '',
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0 || error) {
        console.error('Python error:', error);
        return res.status(500).json({ error: 'Python script failed' });
      }

      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (e) {
        console.error('Invalid JSON from Python:', output);
        res.status(500).json({ error: 'Invalid response from Python script' });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fallback route
app.get('/', (req, res) => {
  res.send('AngleVision backend is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
