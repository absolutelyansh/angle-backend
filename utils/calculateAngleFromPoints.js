function calculateAngleFromPoints(points) {
  const [p1, p2, p3, p4] = points;

  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  const dot = dx1 * dx2 + dy1 * dy2;
  const mag1 = Math.sqrt(dx1 ** 2 + dy1 ** 2);
  const mag2 = Math.sqrt(dx2 ** 2 + dy2 ** 2);

  const cosAngle = dot / (mag1 * mag2);
  const angleRad = Math.acos(Math.min(Math.max(cosAngle, -1), 1)); // Clamp for safety
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}

module.exports = calculateAngleFromPoints;
