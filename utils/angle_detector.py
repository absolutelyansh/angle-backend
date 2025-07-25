import cv2
import sys
import numpy as np
import math

def detect_angle(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Canny edge detection
    edges = cv2.Canny(gray, 100, 200)

    # Detect lines using Hough Transform
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=100,
        minLineLength=80,
        maxLineGap=10
    )

    if lines is None or len(lines) < 2:
        return None

    # Sort lines by length (longest first)
    def line_length(l):
        x1, y1, x2, y2 = l[0]
        return np.hypot(x2 - x1, y2 - y1)

    sorted_lines = sorted(lines, key=line_length, reverse=True)
    line1 = sorted_lines[0][0]
    line2 = sorted_lines[1][0]

    # Calculate angle between two lines
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

    # Draw lines on image
    cv2.line(image, (line1[0], line1[1]), (line1[2], line1[3]), (0, 255, 0), 3)
    cv2.line(image, (line2[0], line2[1]), (line2[2], line2[3]), (255, 0, 0), 3)

    # Put angle text
    cv2.putText(image, f"{angle:.2f}°", (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

    cv2.imwrite("annotated.jpg", image)

    return angle

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python angle_detector.py <image_path> <mode>")
        sys.exit(1)

    image_path = sys.argv[1]
    mode = sys.argv[2]

    if mode == 'angle':
        result = detect_angle(image_path)
        if result is not None:
            print(result)
        else:
            print("0")
    else:
        # Future: Add shape/length/etc
        print("0")
