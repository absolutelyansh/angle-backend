const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // for parsing JSON

const PORT = process.env.PORT || 10000;

// multer setup
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, 'input.jpg');
  },
});
const upload = multer({ storage });

app.post('/detect-angle', upload.single('image'), (req, res) => {
  const inputPath = path.join(__dirname, 'uploads', 'input.jpg');
  const outputPath = path.join(__dirname, 'annotated.jpg');

  const points = req.body.points || []; // expected: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
  const pointStr = JSON.stringify(points);

  exec(`python3 ./utils/angle_detector.py ${inputPath} '${pointStr}'`, (err, stdout, stderr) => {
    if (err) {
      console.error('Python error:', stderr);
      return res.status(500).json({ error: 'Python execution failed' });
    }

    const angle = parseFloat(stdout.trim());
    if (isNaN(angle)) {
      return res.status(400).json({ error: 'Invalid angle received' });
    }

    fs.readFile(outputPath, (err, imageData) => {
      if (err) {
        return res.status(500).json({ error: 'Image read failed' });
      }

      const base64 = `data:image/jpeg;base64,${imageData.toString('base64')}`;
      return res.json({ angle, overlay: base64 });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
