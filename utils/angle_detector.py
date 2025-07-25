import cv2
import sys

def detect_angle(image_path):
    # dummy detection logic
    return 42.5

if __name__ == "__main__":
    image_path = sys.argv[1]
    angle = detect_angle(image_path)
    print(angle)
