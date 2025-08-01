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

// Multer setup for file uploads
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

// POST endpoint to receive image + points
app.post('/detect-angle', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const points = req.body.points;

  if (!points) {
    return res.status(400).json({ error: 'No points provided' });
  }

  console.log('🟢 Received image:', imagePath);
  console.log('🟢 Received points:', points);

  const python = spawn('python3', ['utils/angle_detector.py', imagePath, points]);

  let pythonOutput = '';
  let pythonError = '';

  python.stdout.on('data', (data) => {
    pythonOutput += data.toString();
    console.log(`📤 Python stdout: ${data}`);
  });

  python.stderr.on('data', (data) => {
    pythonError += data.toString();
    console.error(`❌ Python stderr: ${data}`);
  });

  python.on('close', (code) => {
    console.log(`🔚 Python exited with code ${code}`);

    if (code !== 0) {
      return res.status(500).json({
        error: 'Python execution failed',
        details: pythonError || 'No error output',
      });
    }

    const angle = pythonOutput.trim();
    const annotatedPath = 'annotated.jpg';

    if (!fs.existsSync(annotatedPath)) {
      return res.status(500).json({ error: 'Annotated image not found' });
    }

    const imageBuffer = fs.readFileSync(annotatedPath);
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    res.json({
      angle: parseFloat(angle),
      annotatedImage: base64Image,
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
