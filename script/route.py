from ipcqueue import posixmq
from ipcqueue.serializers import RawSerializer
import argparse
import sys
import random # testing purposes

parser = argparse.ArgumentParser(description='Retrieve quality information between series of points.')
parser.add_argument('--queueTag', type=str, nargs=1, help='Tag used to uniquely identify message queue', required=True)

args = parser.parse_args(sys.argv[1:])
qTag = args.queueTag[0]

mqN2P = posixmq.Queue('/routeN2P' + qTag, serializer=RawSerializer)
mqP2N = posixmq.Queue('/routeP2N' + qTag, serializer=RawSerializer)

while True:
    while mqN2P.qsize() > 0:
        try:
            msg = mqN2P.get().decode("UTF-8")
            print('Python got: ' + msg)
            points = [float(a) for a in msg.split()]
            print("Points are {}, {}, {}, {}".format(points[0], points[1], points[2], points[3]))
            quality = random.random()
            print("Replying with random = {}".format(quality))
            mqP2N.put(str(quality).encode("UTF-8"))
            print("Replied!")
        except ValueError:
            if msg == "EXIT":
                exit(0)
