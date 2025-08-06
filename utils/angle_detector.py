import cv2
import numpy as np
import sys
import base64
import json

def draw_lines_and_angle(image_path, points):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Failed to read image from path")

    points = [(int(p[0]), int(p[1])) for p in points]

    # Draw lines between points (1-2 and 3-4)
    cv2.line(image, points[0], points[1], (0, 255, 0), 3)
    cv2.line(image, points[2], points[3], (0, 0, 255), 3)

    # Calculate angle
    def vector(p1, p2):
        return [p2[0] - p1[0], p2[1] - p1[1]]

    v1 = vector(points[0], points[1])
    v2 = vector(points[2], points[3])

    def angle_between(v1, v2):
        dot = np.dot(v1, v2)
        norm_product = np.linalg.norm(v1) * np.linalg.norm(v2)
        cos_theta = dot / norm_product
        angle_rad = np.arccos(np.clip(cos_theta, -1.0, 1.0))
        return np.degrees(angle_rad)

    angle = angle_between(v1, v2)

    # Encode image
    _, buffer = cv2.imencode('.jpg', image)
    base64_image = base64.b64encode(buffer).decode('utf-8')

    # Output only final JSON
    result = {
        "angle": angle,
        "annotatedImage": base64_image
    }

    print(json.dumps(result))  
    sys.stdout.flush()

if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: angle_detector.py <image_path> <points_json>")

        image_path = sys.argv[1]
        raw_points = json.loads(sys.argv[2])

        draw_lines_and_angle(image_path, raw_points)

    except Exception as e:
        # Print all errors to stderr so backend can handle cleanly
        print(f"❌ Python error: {str(e)}", file=sys.stderr)
        sys.exit(1)
