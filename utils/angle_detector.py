import cv2
import numpy as np
import sys
import math

def detect_angle(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Edge detection
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)

    # Line detection
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 150)

    if lines is None or len(lines) < 2:
        return -1  # Not enough lines to calculate angle

    # Get first two lines
    rho1, theta1 = lines[0][0]
    rho2, theta2 = lines[1][0]

    # Convert to degrees and get absolute angle between them
    angle = abs(theta1 - theta2) * (180 / np.pi)

    # Always return the smaller angle (e.g., 30° instead of 150°)
    angle = angle if angle <= 90 else 180 - angle

    return round(angle, 2)

if __name__ == "__main__":
    try:
        image_path = sys.argv[1]
        angle = detect_angle(image_path)
        print(angle)
    except Exception as e:
        print("error", e)
