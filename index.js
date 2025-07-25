const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/detect-angle', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  const python = spawn('python3', ['utils/angle_detector.py', imagePath]);

  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on('close', (code) => {
    fs.unlinkSync(imagePath); // Clean up uploaded image
    const angle = parseFloat(result);
    if (!isNaN(angle)) {
      res.json({ angle });
    } else {
      res.status(500).json({ error: 'Invalid response from Python script' });
    }
  });
});

app.get('/', (req, res) => {
  res.send('AngleVision backend is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
