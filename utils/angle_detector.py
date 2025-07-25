import cv2
import sys
import numpy as np
import math
import base64
import json
import os

def detect_angle(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return None, None

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply Canny edge detection
    edges = cv2.Canny(gray, 100, 200)

    # Detect lines using Hough Transform
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=80, maxLineGap=10)

    if lines is None or len(lines) < 2:
        return None, None

    # Sort lines by length
    def line_length(l):
        x1, y1, x2, y2 = l[0]
        return np.hypot(x2 - x1, y2 - y1)

    sorted_lines = sorted(lines, key=line_length, reverse=True)
    line1 = sorted_lines[0][0]
    line2 = sorted_lines[1][0]

    # Calculate angle
    def angle_between_lines(l1, l2):
        x1, y1, x2, y2 = l1
        x3, y3, x4, y4 = l2
        dx1, dy1 = x2 - x1, y2 - y1
        dx2, dy2 = x4 - x3, y4 - y3
        angle1 = math.atan2(dy1, dx1)
        angle2 = math.atan2(dy2, dx2)
        result = abs(math.degrees(angle1 - angle2))
        return result if result <= 180 else 360 - result

    angle = angle_between_lines(line1, line2)

    # Draw lines
    cv2.line(image, (line1[0], line1[1]), (line1[2], line1[3]), (0, 255, 0), 3)
    cv2.line(image, (line2[0], line2[1]), (line2[2], line2[3]), (255, 0, 0), 3)
    cv2.putText(image, f"{angle:.2f}°", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

    # Save and encode overlay
    output_path = "annotated.jpg"
    cv2.imwrite(output_path, image)

    with open(output_path, "rb") as f:
        encoded_image = base64.b64encode(f.read()).decode('utf-8')

    # Return as JSON
    result = {
        "angle": angle,
        "overlay": f"data:image/jpeg;base64,{encoded_image}"
    }

    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path not provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = detect_angle(image_path)

    if result is not None:
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "Could not detect angle"}))

    sys.stdout.flush()
