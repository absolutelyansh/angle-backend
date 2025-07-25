app.post('/detect-angle', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const annotatedPath = 'annotated.jpg';

  const python = spawn('python3', ['utils/angle_detector.py', imagePath]);

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
