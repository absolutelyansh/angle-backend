const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

app.post('/detect-angle', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const rawPoints = req.body.points;

    if (!rawPoints) {
      return res.status(400).json({ error: 'No points provided' });
    }

    console.log('🟢 Received image:', imagePath);
    console.log('🟢 Received points:', rawPoints);

    const py = spawn('python3', [
      './utils/angle_detector.py',
      imagePath,
      rawPoints,
    ]);

    let output = '';
    let errorOutput = '';

    py.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`📤 Python stdout: ${data}`);
    });

    py.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`❌ Python stderr: ${data}`);
    });

    py.on('close', (code) => {
      console.log(`🔚 Python exited with code ${code}`);

      if (code !== 0) {
        return res.status(500).json({
          error: 'Python execution failed',
          details: errorOutput || 'Unknown error',
        });
      }

      try {
        const result = JSON.parse(output.trim());
        res.json(result);
      } catch (jsonErr) {
        console.error('❌ Failed to parse JSON from Python:', output);
        res.status(500).json({
          error: 'Invalid JSON output from Python',
          details: jsonErr.message,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
