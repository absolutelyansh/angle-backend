import cv2
import sys

def detect_angle(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print("Error: Cannot read image", file=sys.stderr)
        sys.exit(1)

    # Dummy value for demonstration
    angle = 45.0

    # Replace this with actual computer vision logic
    print(angle)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python angle_detector.py <image_path>", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]
    detect_angle(image_path)
