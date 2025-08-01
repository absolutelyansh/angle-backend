import cv2
import sys
import numpy as np
import math
import json
import traceback

def angle_between_lines(p1, p2, p3, p4):
    dx1, dy1 = p2[0] - p1[0], p2[1] - p1[1]
    dx2, dy2 = p4[0] - p3[0], p4[1] - p3[1]
    angle1 = math.atan2(dy1, dx1)
    angle2 = math.atan2(dy2, dx2)
    angle = abs(math.degrees(angle1 - angle2))
    return angle if angle <= 180 else 360 - angle

def draw_lines_and_angle(image_path, points, output_path='annotated.jpg'):
    print(f"Reading image from: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Image could not be read. Check the image path.")

    p1, p2, p3, p4 = points

    # Draw lines
    cv2.line(image, p1, p2, (0, 255, 0), 3)
    cv2.line(image, p3, p4, (255, 0, 0), 3)

    angle = angle_between_lines(p1, p2, p3, p4)

    # Draw angle text
    cv2.putText(image, f"{angle:.2f}°", (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

    cv2.imwrite(output_path, image)
    return angle

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python angle_detector.py <image_path> <json_points>")
        sys.exit(1)

    image_path = sys.argv[1]
    json_points = sys.argv[2]

    try:
        print("✅ Python script started")
        print(f"image_path: {image_path}")
        print(f"raw json points: {json_points}")

        points = json.loads(json_points)
        if len(points) != 4:
            raise ValueError("Exactly 4 points required")

        # Convert to integer coordinate tuples
        points = [tuple(map(int, pt)) for pt in points]
        print(f"Converted points: {points}")

        angle = draw_lines_and_angle(image_path, points)
        print(angle if angle is not None else "0")

    except Exception as e:
        print("Python error:", str(e))
        traceback.print_exc()
        sys.exit(1)
