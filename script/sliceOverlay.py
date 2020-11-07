from PIL import Image, ImageDraw, ImageFont
from matplotlib import pyplot as plt
from errorHandler import ErrorHandler

import os
import sys
import argparse
import json
import math
import numpy as np
import seaborn as sns; sns.set()
import tiles

DEBUG = False

mu_channel = 0
sig_channel = 1
hits_channel = 2

coord_dtype = float

parser = argparse.ArgumentParser(description='Retrieve required segment from overlay.')
parser.add_argument('x_min', type=coord_dtype, nargs=1, help='Minimum X coordinate of bounding box')
parser.add_argument('y_min', type=coord_dtype, nargs=1, help='Minimum Y coordinate of bounding box')
parser.add_argument('x_max', type=coord_dtype, nargs=1, help='Maximum X coordinate of bounding box')
parser.add_argument('y_max', type=coord_dtype, nargs=1, help='Maximum Y coordinate of bounding box')
parser.add_argument('--errors_file', type=str, nargs=1, help='Path to errors JSON file')
parser.add_argument('--DEBUG', dest='DEBUG', action='store_const', const=True, default=False)

if DEBUG: print("Args: " + str(sys.argv))

try:
    args = parser.parse_args(sys.argv[1:])
except argparse.ArgumentTypeError:
    exit(99)

err = ErrorHandler(args.errors_file[0])

DEBUG = DEBUG or args.DEBUG

# Get values from args
req_x_min = args.x_min[0]
req_x_max = args.x_max[0]
req_y_min = args.y_min[0]
req_y_max = args.y_max[0]

try:
    overlay_canvas = tiles.load_tiles (
        req_x_min,
        req_y_min,
        req_x_max,
        req_y_max,
        DEBUG=DEBUG
    )
except MemoryError:
    err.exitOnError("MemoryError")

if req_x_min < -180 or req_x_max > 180 or req_y_max > 90 or req_y_min < -90:
    raise err.exitOnError("LimitsError")

if req_x_min > req_x_max  or req_y_max < req_y_min:
    raise err.exitOnError("InvertedValues")

if DEBUG: print("Done!")

# Convert sigma-mu to gradient
if DEBUG:
    if (np.max(overlay_canvas[:, :, hits_channel]) == 0):
        print("None active!")
    else:
        print("Found active!")
    print("Mu range: {} <> {}".format(np.min(overlay_canvas[:, :, mu_channel]), np.max(overlay_canvas[:, :, mu_channel])))
    print("Hits range: {} <> {}".format(np.min(overlay_canvas[:, :, hits_channel]), np.max(overlay_canvas[:, :, hits_channel])))

try:
    _mu = overlay_canvas[:, :, mu_channel]
except MemoryError:
    err.exitOnError("MemoryError")

fig = plt.figure(1, figsize=(overlay_canvas.shape[1], overlay_canvas.shape[0]), dpi=1)
ax = sns.heatmap(np.array(_mu), xticklabels=False, yticklabels=False, cbar=False, cmap=sns.diverging_palette(10, 150, sep=80), vmin=0.4, vmax=0.6)
fig.tight_layout(pad=0)
fig.canvas.draw()
data = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
aux_canvas = np.concatenate(
    (data.reshape(fig.canvas.get_width_height()[::-1] + (3, )),
    np.where(overlay_canvas[:, :, mu_channel] != 0.5, 255, 0).astype(np.uint8)[:,:,np.newaxis]), # FIXME should be where overlay_canvas[:, :, hits_channel] > 0
    axis=2)

assert aux_canvas.shape[:2] == overlay_canvas.shape[:2], "Expected {}, got {}".format(str(overlay_canvas.shape[:2]), str(aux_canvas.shape[:2]))

overlay_canvas_img = Image.fromarray(aux_canvas, mode="RGBA")

if DEBUG: overlay_canvas_img.show()

(left, lower, right, upper) = tiles.bounding_box(req_x_min, req_y_min, req_x_max, req_y_max)

if DEBUG: print("Cropping {}, {}, {}, {}".format(left, upper, right, lower))

if DEBUG:
    d = ImageDraw.Draw(overlay_canvas_img)

    ellipse_rad = 10

    d.ellipse([left-ellipse_rad, upper-ellipse_rad, left+ellipse_rad, upper+ellipse_rad], fill=(255, 0, 0))
    d.ellipse([right-ellipse_rad, lower-ellipse_rad, right+ellipse_rad, lower+ellipse_rad], fill=(0, 0, 255))

    overlay_canvas_img.show()

overlay_canvas_img = overlay_canvas_img.crop((left, upper, right, lower))

if DEBUG: print(overlay_canvas_img.size)

if DEBUG: overlay_canvas_img.show()

nonce = os.urandom(32).hex()

with open("./tmp/"+nonce+".png", "wb") as f:
    overlay_canvas_img.save(f, format='PNG')

print(nonce, end="")
