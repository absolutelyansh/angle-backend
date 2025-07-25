import cv2
import numpy as np
import sys
import math
import os

def draw_angle_overlay(image_path, output_path='annotated.jpg'):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 150)

    if lines is None or len(lines) < 2:
        cv2.imwrite(output_path, img)
        print("-1")
        return

    rho1, theta1 = lines[0][0]
    rho2, theta2 = lines[1][0]

    # Convert polar to cartesian points
    def get_line(rho, theta):
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a * rho
        y0 = b * rho
        x1 = int(x0 + 1000 * (-b))
        y1 = int(y0 + 1000 * a)
        x2 = int(x0 - 1000 * (-b))
        y2 = int(y0 - 1000 * a)
        return (x1, y1), (x2, y2)

    pt1_start, pt1_end = get_line(rho1, theta1)
    pt2_start, pt2_end = get_line(rho2, theta2)

    # Draw the two lines
    cv2.line(img, pt1_start, pt1_end, (0, 0, 255), 2)
    cv2.line(img, pt2_start, pt2_end, (0, 255, 0), 2)

    # Compute angle
    angle = abs(theta1 - theta2) * (180 / np.pi)
    angle = angle if angle <= 90 else 180 - angle
    angle = round(angle, 2)

    # Draw angle text
    cv2.putText(img, f'{angle} deg', (30, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 1.6, (255, 255, 255), 3)

    # Save annotated image
    cv2.imwrite(output_path, img)
    print(angle)

if __name__ == "__main__":
    image_path = sys.argv[1]
    draw_angle_overlay(image_path)
