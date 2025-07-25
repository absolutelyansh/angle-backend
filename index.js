const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Upload handler
const upload = multer({ dest: 'uploads/' });

// Default route (optional)
app.get('/', (req, res) => {
  res.send('AngleVision backend is running');
});

// POST /detect-angle
app.post('/detect-angle', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const mode = req.body.mode || 'angle';
  const annotatedPath = 'annotated.jpg';

  const python = spawn('python3', ['utils/angle_detector.py', imagePath, mode]);

  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on('close', (code) => {
    const angle = parseFloat(result);
    if (!isNaN(angle) && fs.existsSync(annotatedPath)) {
      const base64Image = fs.readFileSync(annotatedPath, { encoding: 'base64' });

      // Clean up
      fs.unlinkSync(imagePath);
      fs.unlinkSync(annotatedPath);

      return res.json({
        angle,
        overlay: `data:image/jpeg;base64,${base64Image}`,
      });
    } else {
      return res.json({ error: 'Invalid response from Python script' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AngleVision backend is running on port ${PORT}`);
});
