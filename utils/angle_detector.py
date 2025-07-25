import sys

def detect_angle(image_path):
    # Dummy angle value — replace with actual OpenCV logic later
    return 42.5

if __name__ == "__main__":
    try:
        image_path = sys.argv[1]
        angle = detect_angle(image_path)
        print(angle)  # ✅ ONLY PRINT A NUMBER (NO TEXT!)
    except Exception as e:
        print("error", e)
