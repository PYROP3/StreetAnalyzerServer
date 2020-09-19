from pymongo import MongoClient
import os

class MongoInterface:
    def __init__(self, mode='sigma_mu', prod=True):
        if prod:
            _env = os.environ
            
        self._dbUrl = "mongodb+srv://{}:{}@{}/{}?retryWrites=true&w=majority".format(_env['MONGO_USER'], _env['MONGO_PASS'], _env['MONGO_URL'], _env['MONGO_DB_NAME'])

        self.client = MongoClient(self._dbUrl)

        self.db = self.client.get_database(_env['MONGO_DB_NAME'])

        self.collection = self.db[mode]

    def getSegment(self, lat, long, quad):
        _seg = self.collection.find_one({'lat':lat, 'long':long, 'quad':quad})
        print("Get segment: " + str(_seg))
        if _seg:
            return _seg['segment']
        else:
            FileNotFoundError("Segment for {}:{},{} not found".format(quad, lat, long))

    def saveSegment(self, lat, long, quad, segment):
        _doc = self.collection.find_one_and_update({'lat':lat, 'long':long, 'quad':quad}, {'$set': {'segment':segment}})
        if not _doc: # Create
            _doc = self.collection.insert_one({'lat':lat, 'long':long, 'quad':quad, 'segment':segment})
        print("Save segment: " + str(_doc))

if __name__ == "__main__":
    this = MongoInterface()
    this.getSegment(10, 10, 'NE')
    this.saveSegment(10, 10, 'NE', 'abc')
    this.getSegment(10, 10, 'NE')