from PIL import Image, ImageDraw, ImageFont
import os
import sys
import argparse
import json
import math
import numpy as np
import base64
from io import BytesIO
import mongoInterface
import pickle

resolution = 0.01 # Arclength (in degrees) corresponding to each tile side - 0.01deg ~ 1Km
dpb = 500 # Dots per block; each image should be (dpb x dpb)

def red_sigmoid(x):
    return 1. / (1. + math.exp(10*x-5))

v_red_sigmoid = np.vectorize(red_sigmoid)

def blu_sigmoid(x):
    return 1. / (1. + math.exp(5-10*x))

v_blu_sigmoid = np.vectorize(blu_sigmoid)

def gre_bell(x):
    return 0.5*math.exp(-10*((x-0.5)**2))

v_gre_bell = np.vectorize(gre_bell)

mu_channel = 0
sig_channel = 1
util_channel = 2

tileHandler = mongoInterface.MongoInterface(mode='pickle')

def __rangeMap(min1, max1, val1, min2, max2):
    return min2 + (val1 - min1) * (max2 - min2)/(max1 - min1)

def __quad(x, y):
    return ("NE" if y > 0 else "SE") if x > 0 else ("NW" if y > 0 else "SW")

def __sign(x):
    return 1 if x >= 0 else -1

def expand_corners(min_x, min_y, max_x, max_y, resolution=resolution):
    return [
        [math.floor(min_x / resolution), math.floor(min_y / resolution)],
        [math.ceil(max_x / resolution), math.ceil(max_y / resolution)]
    ]

def load_tiles(min_x, min_y, max_x, max_y, resolution=resolution, dpb=dpb, DEBUG=False):

    default_empty_tile = np.zeros((dpb, dpb, 3))
    default_empty_tile[:,:,mu_channel] = 0.5

    required_corners = expand_corners(min_x, min_y, max_x, max_y, resolution=resolution)

    required_delta_x = abs(required_corners[1][0] - required_corners[0][0]) + 0
    required_delta_y = abs(required_corners[1][1] - required_corners[0][1]) + 0

    try:
        overlay_canvas = np.zeros((required_delta_y * dpb, required_delta_x * dpb, 3))
    except ValueError:
        raise MemoryError

    __x =  math.ceil(min_x / resolution) if min_x > 0 else math.floor(min_x / resolution)
    __y =  math.ceil(min_y / resolution) if min_y > 0 else math.floor(min_y / resolution)

    for _x in range(required_delta_x):
        x = _x + __x - __sign(min_x)

        for _y in range(required_delta_y):
            y = _y + __y - __sign(min_y)

            overlay_alias = "{}_{}_{}".format(__quad(x, y), abs(y), abs(x))
            if DEBUG: print("Opening {}".format(overlay_alias))

            try: # Get tile if it exists
                _tile = tileHandler.getTile(y, x, __quad(x, y))
                _tile = pickle.loads(_tile)
                overlay_canvas[_y*dpb:(_y+1)*dpb, _x*dpb:(_x+1)*dpb, :] = _tile[:, :, :]
            except: # Create new tile if not found
                overlay_canvas[_y*dpb:(_y+1)*dpb, _x*dpb:(_x+1)*dpb, :] = default_empty_tile[:,:,:]

    return overlay_canvas

def bounding_box(min_x, min_y, max_x, max_y, resolution=resolution, dpb=dpb):
    required_corners = expand_corners(min_x, min_y, max_x, max_y, resolution=resolution)

    required_delta_x = abs(required_corners[1][0] - required_corners[0][0])
    required_delta_y = abs(required_corners[1][1] - required_corners[0][1])

    return (
        int(__rangeMap(required_corners[0][0], required_corners[1][0], min_x / resolution, 0, required_delta_x * dpb)),
        int(__rangeMap(required_corners[0][1], required_corners[1][1], min_y / resolution, required_delta_y * dpb, 0)),
        int(__rangeMap(required_corners[0][0], required_corners[1][0], max_x / resolution, 0, required_delta_x * dpb)),
        int(__rangeMap(required_corners[0][1], required_corners[1][1], max_y / resolution, required_delta_y * dpb, 0))
    )

def save_overlay(min_x, min_y, max_x, max_y, canvas, resolution=resolution, dpb=dpb, DEBUG=False):
    required_corners = expand_corners(min_x, min_y, max_x, max_y, resolution=resolution)

    required_delta_x = abs(required_corners[1][0] - required_corners[0][0])
    required_delta_y = abs(required_corners[1][1] - required_corners[0][1])

    __x =  math.ceil(min_x / resolution) if min_x > 0 else math.floor(min_x / resolution)
    __y =  math.ceil(min_y / resolution) if min_y > 0 else math.floor(min_y / resolution)

    for _x in range(required_delta_x):
        x = _x + __x - __sign(min_x)

        for _y in range(required_delta_y):
            y = _y + __y - __sign(min_y)

            if DEBUG: print("Saving as {}_{}_{}".format(__quad(x, y), abs(y), abs(x)))

            _tile = pickle.dumps(canvas[_y*dpb:(_y+1)*dpb, _x*dpb:(_x+1)*dpb, :], protocol=3)
            tileHandler.saveTile(y, x, __quad(x, y), _tile)
