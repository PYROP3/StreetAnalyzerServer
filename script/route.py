from ipcqueue import posixmq
from ipcqueue.serializers import RawSerializer
import argparse
import sys
import random # testing purposes
import segments
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
    overlay_canvas = segments.load_segments (
        min(startLong, endLong),
        min(startLat, endLat),
        max(startLong, endLong),
        max(startLat, endLat),
        alias_append="_sigma_mu",
        DEBUG=DEBUG
    )

    samples = []

    # Bresenhams algorithm
    # TODO this code is similar to logTrip.py, find a way to reuse it
    dx = abs(endLong - startLong)
    sx = 1 if startLong < endLong else -1
    dy = -abs(endLat - startLat)
    sy = 1 if startLat < endLat else -1
    err = dx + dy
    if DEBUG: print("Bresenham: dx={}, sx={}, dy={}, sy={}, err={}".format(dx, sx, dy, sy, err))
    while (endLong != startLong or endLat != startLat):
        # Process (startLong, startLat)
        canvas_x = startLong
        canvas_y = startLat
        this_sample = float(overlay_canvas[canvas_y, canvas_x, mu_channel])/255.
        samples.append(this_sample)
        if DEBUG: print("Canvas @ {}, {} => mu = {}[sto {}]; sig = {}[sto {}]".format(canvas_x, canvas_y, prev_mu, overlay_canvas[canvas_y, canvas_x, mu_channel], prev_sig, overlay_canvas[canvas_y, canvas_x, sig_channel]))
        e2 = 2*err
        if (e2 >= dy):
            err += dy
            startLong += sx
        if (e2 <= dx):
            err += dx
            startLat += sy
    seg_avg = sum(samples) / len(samples)
    if DEBUG: print("Line segment average = {}".format(seg_avg))
    return seg_avg

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
