const cv = require('opencv4nodejs');
const fs = require('fs');

function calculateAngleFromPoints(points, imagePath) {
  if (!points || points.length !== 4) {
    throw new Error('Exactly 4 points are required');
  }

  const [p1, p2, p3, p4] = points;

  // Calculate vectors
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const v2 = { x: p4.x - p3.x, y: p4.y - p3.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

  const angleRad = Math.acos(dot / (mag1 * mag2));
  const angleDeg = (angleRad * 180) / Math.PI;

  // Draw lines on image using OpenCV
  const image = cv.imread(imagePath);

  const color1 = new cv.Vec3(0, 255, 0); // green
  const color2 = new cv.Vec3(255, 0, 0); // blue

  image.drawLine(new cv.Point2(p1.x, p1.y), new cv.Point2(p2.x, p2.y), color1, 3);
  image.drawLine(new cv.Point2(p3.x, p3.y), new cv.Point2(p4.x, p4.y), color2, 3);

  // Add text
  image.putText(
    `${angleDeg.toFixed(2)}°`,
    new cv.Point2(50, 50),
    cv.FONT_HERSHEY_SIMPLEX,
    1.2,
    new cv.Vec3(0, 0, 255),
    3
  );

  // Save annotated image
  const outputPath = 'annotated.jpg';
  cv.imwrite(outputPath, image);

  // Convert to base64
  const encodedImage = fs.readFileSync(outputPath, 'base64');

  return {
    angle: angleDeg,
    overlay: `data:image/jpeg;base64,${encodedImage}`,
  };
}

module.exports = calculateAngleFromPoints;
