import argparse
import sys
import tiles
import math

DEBUG = False

def validate_coords(lat, lng):
    assert lat >= -90 and lat <= 90, "Latitude {} is invalid".format(lat)
    assert lng >= -180 and lng <= 180, "Longitude {} is invalid".format(lng)
    return (lat, lng)

def parse_route(coords):
    assert len(coords) % 2 == 0
    return [validate_coords(coords[2*i], coords[2*i+1]) for i in range(len(coords)//2)]

parser = argparse.ArgumentParser(description='Retrieve quality information between series of points.')
parser.add_argument('--route', nargs='+', help='Sequence of coordinates defining a route', action='append', required=True, type=float)

if DEBUG: print("Args: " + str(sys.argv))

args = parser.parse_args(sys.argv[1:])
routes = [parse_route(route) for route in args.route]

if DEBUG: print("Got routes = {}".format(routes))

mu_channel = 0
sig_channel = 1
util_channel = 2

e_sq = math.e**2
gauss_sigma = 7
gauss_factor = 10
gauss_runs = 3

def reviewLineSegment(startLat, startLong, endLat, endLong):
    overlay_canvas = tiles.load_tiles (
        min(startLong, endLong),
        min(startLat, endLat),
        max(startLong, endLong),
        max(startLat, endLat),
        DEBUG=DEBUG
    )

    required_corners = tiles.expand_corners(min(startLong, endLong), min(startLat, endLat), max(startLong, endLong), max(startLat, endLat))

    required_delta_x = abs(required_corners[1][0] - required_corners[0][0])
    required_delta_y = abs(required_corners[1][1] - required_corners[0][1])

    samples = []

    x00 = int(tiles.__rangeMap(required_corners[0][0], required_corners[1][0], startLong / tiles.resolution, 0, required_delta_x * tiles.dpb))
    y00 = int(tiles.__rangeMap(required_corners[0][1], required_corners[1][1], startLat / tiles.resolution, required_delta_y * tiles.dpb, 0))
    x0 = x00
    y0 = y00
    x1 = int(tiles.__rangeMap(required_corners[0][0], required_corners[1][0], endLong / tiles.resolution, 0, required_delta_x * tiles.dpb))
    y1 = int(tiles.__rangeMap(required_corners[0][1], required_corners[1][1], endLat / tiles.resolution, required_delta_y * tiles.dpb, 0))

    # Bresenhams algorithm
    # TODO this code is similar to logTrip.py, find a way to reuse it
    dx = abs(x1 - x0)
    sx = 1 if x0 < x1 else -1
    dy = -abs(y1 - y0)
    sy = 1 if y0 < y1 else -1
    err = dx + dy
    if DEBUG: print("Bresenham: dx={}, sx={}, dy={}, sy={}, err={}".format(dx, sx, dy, sy, err))
    while (x1 != x0 or y1 != y0):
        # Process (x0, y0)
        samples.append(overlay_canvas[y0, x0, mu_channel])
        e2 = 2*err
        if (e2 >= dy):
            err += dy
            x0 += sx
        if (e2 <= dx):
            err += dx
            y0 += sy
    seg_avg = sum(samples) / len(samples)
    if DEBUG: print("Line tile average = {}".format(seg_avg))
    return seg_avg

avgs = []
for idx, val in enumerate(routes):
    aux = []
    for _idx, _val in enumerate(val):
        if _idx > 0:
            lat0, lng0 = val[_idx-1]
            lat1, lng1 = val[_idx]
            aux.append(reviewLineSegment(
                lat0, lng0,
                lat1, lng1
            ))
    avgs.append(float(sum(aux)/len(aux)))

print(",".join([str(avg) for avg in avgs]), end="", flush=True)