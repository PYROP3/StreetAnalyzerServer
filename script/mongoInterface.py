from pymongo import MongoClient
from bson.binary import Binary
try:
    from dotenv import load_dotenv
except:
    load_dotenv = None

import os

class MongoInterface:
    def __init__(self, mode='pickle', prod=True):
        if load_dotenv: load_dotenv()
        if prod:
            _env = os.environ
            
        self._dbUrl = "mongodb+srv://{}:{}@{}/{}?retryWrites=true&w=majority".format(_env['MONGO_USER'], _env['MONGO_PASS'], _env['MONGO_URL'], _env['MONGO_DB_NAME'])

        self.client = MongoClient(self._dbUrl)

        self.db = self.client.get_database(_env['MONGO_DB_NAME'])

        self.collection = self.db[mode]

        # FIXME caching may cause race conditions
        self.cache = []

        self.max_cache = 5

    def getTile(self, lat, long, quad):
        # Check if tile is not cached
        _tile = None
        new_key = "{}_{}_{}".format(lat, long, quad)
        for key, segment in self.cache:
            if key == new_key:
                _tile = segment
                break

        # If not found yet, look in database
        if _tile is None:
            _tile = self.collection.find_one({'lat':lat, 'long':long, 'quad':quad})
            if _tile:
                # Update cache
                while len(self.cache) >= self.max_cache:
                    self.cache.pop(0)
                self.cache.append((new_key, _tile['tile']))
        
        _tile = self.collection.find_one({'lat':lat, 'long':long, 'quad':quad})

        if _tile:
            return _tile['tile']
        else:
            raise FileNotFoundError("Tile for {}:{},{} not found".format(quad, lat, long))


    def saveTile(self, lat, long, quad, tile):
        _tile = Binary(tile)
        _doc = self.collection.find_one_and_update({'lat':lat, 'long':long, 'quad':quad}, {'$set': {'tile':_tile}})
        if not _doc: # Create
            _doc = self.collection.insert_one({'lat':lat, 'long':long, 'quad':quad, 'tile':_tile})

if __name__ == "__main__":
    this = MongoInterface()
    this.getTile(10, 10, 'NE')
    this.saveTile(10, 10, 'NE', 'abc')
    this.getTile(10, 10, 'NE')
