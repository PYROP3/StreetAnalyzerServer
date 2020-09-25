from PIL import Image, ImageDraw, ImageFont
import mongoInterface
import tiles
import numpy as np

mu_channel=0

# [[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084],[37.4219983,-122.084]]

global_coordinates=[[-22.1542655728, -47.1149176376], [-22.1743303693, -47.1005861652], [-22.1764570632, -47.1261083091]]

global_coordinates = [[a[1],a[0]] for a in global_coordinates]

# Find bounding box of all coordinates
req_x_min = min([c[0] for c in global_coordinates])
req_y_min = min([c[1] for c in global_coordinates])
req_x_max = max([c[0] for c in global_coordinates])
req_y_max = max([c[1] for c in global_coordinates])

print("Bounding box from {}, {} to {}, {}".format(req_x_min, req_y_min, req_x_max, req_y_max))

overlay_canvas = tiles.load_tiles (
    req_x_min,
    req_y_min,
    req_x_max,
    req_y_max,
    DEBUG=True
)

print("Mu range: {} <> {}".format(np.min(overlay_canvas[:, :, mu_channel]), np.max(overlay_canvas[:, :, mu_channel])))

tiles.save_overlay(
    req_x_min,
    req_y_min,
    req_x_max,
    req_y_max,
    overlay_canvas,
    DEBUG=True
)
