from flask import Flask, request, jsonify
import os
import subprocess
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/angle', methods=['POST'])
def detect_angle():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    filename = secure_filename(image.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    image.save(filepath)

    try:
        # Run the Python script and capture output
        result = subprocess.check_output(
            ['python3', 'utils/angle_detector.py', filepath],
            stderr=subprocess.STDOUT
        )
        angle = result.decode('utf-8').strip()
        os.remove(filepath)  # Clean up after processing
        return jsonify({'angle': angle})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': 'Failed to process image', 'details': e.output.decode()}), 500

# For local development only — this line is ignored in production with gunicorn
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 3000)))
