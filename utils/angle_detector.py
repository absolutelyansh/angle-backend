import cv2
import sys
import numpy as np
import math
import json

def angle_between_lines(p1, p2, p3, p4):
    # Calculate direction vectors
    dx1, dy1 = p2[0] - p1[0], p2[1] - p1[1]
    dx2, dy2 = p4[0] - p3[0], p4[1] - p3[1]

    # Calculate angle
    angle1 = math.atan2(dy1, dx1)
    angle2 = math.atan2(dy2, dx2)
    angle = abs(math.degrees(angle1 - angle2))

    return angle if angle <= 180 else 360 - angle

def draw_lines_and_angle(image_path, points, output_path='annotated.jpg'):
    image = cv2.imread(image_path)
    if image is None:
        return None

    p1, p2, p3, p4 = points

    # Draw the two lines
    cv2.line(image, p1, p2, (0, 255, 0), 3)
    cv2.line(image, p3, p4, (255, 0, 0), 3)

    # Calculate the angle
    angle = angle_between_lines(p1, p2, p3, p4)

    # Put angle text
    cv2.putText(image, f"{angle:.2f}°", (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

    # Save output
    cv2.imwrite(output_path, image)
    return angle

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python angle_detector.py <image_path> <json_points>")
        sys.exit(1)

    image_path = sys.argv[1]
    json_points = sys.argv[2]

    try:
        points = json.loads(json_points)
        if len(points) != 4:
            print("0")
            sys.exit(1)
        # Convert to tuples
        points = [tuple(pt) for pt in points]
        angle = draw_lines_and_angle(image_path, points)
        print(angle if angle is not None else "0")
    except Exception as e:
        print("0")
