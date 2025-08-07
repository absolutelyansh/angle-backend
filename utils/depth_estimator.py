import torch
import torchvision.transforms as T
import cv2
import numpy as np
import sys
import os
from PIL import Image

def estimate_depth(image_path, output_path='depth.jpg'):
    model_type = "DPT_Large"
    midas = torch.hub.load("intel-isl/MiDaS", model_type)
    midas.eval()

    transform = torch.hub.load("intel-isl/MiDaS", "transforms").dpt_transform

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Failed to read image for depth estimation")

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    input_image = Image.fromarray(image_rgb)
    input_batch = transform(input_image).unsqueeze(0)

    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=input_image.size[::-1],
            mode="bicubic",
            align_corners=False,
        ).squeeze()

    depth_map = prediction.cpu().numpy()

    # Normalize for visualization
    depth_vis = cv2.normalize(depth_map, None, 0, 255, cv2.NORM_MINMAX)
    depth_vis = depth_vis.astype(np.uint8)

    cv2.imwrite(output_path, depth_vis)

    return output_path  # Path to the depth map image

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python depth_estimator.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    out_path = estimate_depth(image_path)
    print(f"✅ Depth map saved at: {out_path}")
