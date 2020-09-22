from ipcqueue import posixmq
from ipcqueue.serializers import RawSerializer
import argparse
import sys
import tiles
import math

DEBUG = False

parser = argparse.ArgumentParser(description='Retrieve quality information between series of points.')
parser.add_argument('--queueTag', type=str, nargs=1, help='Tag used to uniquely identify message queue', required=True)

args = parser.parse_args(sys.argv[1:])
qTag = args.queueTag[0]

mqN2P = posixmq.Queue('/routeN2P' + qTag, serializer=RawSerializer)
mqP2N = posixmq.Queue('/routeP2N' + qTag, serializer=RawSerializer)

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

print("Routing daemon starting")
while True:
    while mqN2P.qsize() > 0:
        try:
            msg = mqN2P.get().decode("UTF-8")
            print('Python got: ' + msg)
            points = [float(a) for a in msg.split()]
            print("Points are {}, {}, {}, {}".format(points[0], points[1], points[2], points[3]))

            # Very inefficient, but should work
            quality = reviewLineSegment(points[0], points[1], points[2], points[3])
            print("Replying with quality = {}".format(quality))
            mqP2N.put(str(quality).encode("UTF-8"))
            print("Replied!")
        except ValueError:
            if msg == "EXIT":
                exit(0)
