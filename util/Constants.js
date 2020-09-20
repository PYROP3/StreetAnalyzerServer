// Requests
// -- API
module.exports.QUALITY_OVERLAY_REQUEST = "/qualityOverlay";
module.exports.LOG_TRIP_REQUEST = "/logTrip";
module.exports.ROUTE_REQUEST = "/route";
// -- Account
module.exports.CREATE_ACCOUNT_REQUEST      = "/createAccount";
module.exports.VERIFY_ACCOUNT_REQUEST      = "/verifyAccount";
module.exports.AUTH_REQUEST                = "/auth";
module.exports.DEAUTH_REQUEST              = "/deauth";
module.exports.RECOVER_PASS_NONCE_REQUEST  = "/recoverPasswordNonce";
module.exports.RECOVER_PASS_REQUEST        = "/recoverPassword";

// Scripts
module.exports.SCRIPT_PATH = "script/"
module.exports.SCRIPT_SLICE_OVERLAY = module.exports.SCRIPT_PATH + "sliceOverlay.py"
module.exports.SCRIPT_LOG_TRIP      = module.exports.SCRIPT_PATH + "logTrip.py"
module.exports.SCRIPT_ROUTE         = module.exports.SCRIPT_PATH + "route.py"

// Log storage
module.exports.LOG_STORAGE_PATH = "log/";

// Error data
module.exports.SCRIPT_ERRORS_PATH   = module.exports.SCRIPT_PATH + "errorCodes.json";

// Localization defaults
module.exports.DEFAULT_LOCALE = "English";

// Mailer data
module.exports.SOURCE_EMAIL_ADDRESS = "streetAnalyzer@gmail.com";
module.exports.SOURCE_EMAIL_SERVICE = "gmail";
module.exports.SOURCE_EMAIL_HOST    = "smtp.gmail.com";

// Mongo keys
module.exports.USER_PRIMARY_KEY  = "email"
module.exports.USER_PASSWORD_KEY = "password"
module.exports.AUTH_TOKEN_KEY    = "authToken"
module.exports.TIMESTAMP_KEY     = "timestamp"
module.exports.USER_PIC_KEY      = "pic"
module.exports.USER_NAME_KEY     = "name"

// Authentication info
module.exports.AUTH_TOKEN_LENGTH = 64;
module.exports.AUTH_TOKEN_TYPE = "Bearer";
module.exports.AUTH_TOKEN_NAME = module.exports.AUTH_TOKEN_TYPE + " ";

// Mongo collections
module.exports.MONGO_COLLECTION_USERS = "users";
module.exports.MONGO_COLLECTION_SESSIONS = "sessions";
module.exports.MONGO_COLLECTION_PENDING_USERS = "pendingUsers";
module.exports.MONGO_COLLECTION_PENDING_RECOVER_PASS = "passwordNonces";

module.exports.SERVER_PORT_DEFAULT = 8080
module.exports.SERVER_URL_DEFAULT = "http://localhost:"+module.exports.SERVER_PORT_DEFAULT

module.exports.QUALITY_DATA_TAG = "quality"

module.exports.ROUTE_API_ENDPOINT = "https://api.tomtom.com/routing/1/calculateRoute/%s/json?key=%s"

// TODO remove before deploy
module.exports.MOCK_DIRECTIONS_RESPONSE = {
    "formatVersion": "0.0.12",
    "routes": [
      {
        "summary": {
          "lengthInMeters": 1146,
          "travelTimeInSeconds": 132,
          "trafficDelayInSeconds": 0,
          "departureTime": "2020-09-20T20:38:55+02:00",
          "arrivalTime": "2020-09-20T20:41:07+02:00"
        },
        "legs": [
          {
            "summary": {
              "lengthInMeters": 1146,
              "travelTimeInSeconds": 132,
              "trafficDelayInSeconds": 0,
              "departureTime": "2020-09-20T20:38:55+02:00",
              "arrivalTime": "2020-09-20T20:41:07+02:00"
            },
            "points": [
              {
                "latitude": 52.5093,
                "longitude": 13.42937
              },
              {
                "latitude": 52.50904,
                "longitude": 13.42913
              },
              {
                "latitude": 52.50895,
                "longitude": 13.42904
              },
              {
                "latitude": 52.50868,
                "longitude": 13.4288
              },
              {
                "latitude": 52.5084,
                "longitude": 13.42857
              },
              {
                "latitude": 52.50816,
                "longitude": 13.42839
              },
              {
                "latitude": 52.50791,
                "longitude": 13.42825
              },
              {
                "latitude": 52.50757,
                "longitude": 13.42772
              },
              {
                "latitude": 52.50752,
                "longitude": 13.42785
              },
              {
                "latitude": 52.50742,
                "longitude": 13.42809
              },
              {
                "latitude": 52.50735,
                "longitude": 13.42824
              },
              {
                "latitude": 52.5073,
                "longitude": 13.42837
              },
              {
                "latitude": 52.50673,
                "longitude": 13.42961
              },
              {
                "latitude": 52.50619,
                "longitude": 13.43092
              },
              {
                "latitude": 52.50574,
                "longitude": 13.43195
              },
              {
                "latitude": 52.50528,
                "longitude": 13.43299
              },
              {
                "latitude": 52.50513,
                "longitude": 13.43336
              },
              {
                "latitude": 52.50464,
                "longitude": 13.43451
              },
              {
                "latitude": 52.50451,
                "longitude": 13.43482
              },
              {
                "latitude": 52.50444,
                "longitude": 13.43499
              },
              {
                "latitude": 52.50418,
                "longitude": 13.43564
              },
              {
                "latitude": 52.50372,
                "longitude": 13.43673
              },
              {
                "latitude": 52.50343,
                "longitude": 13.43738
              },
              {
                "latitude": 52.5033,
                "longitude": 13.43767
              },
              {
                "latitude": 52.50275,
                "longitude": 13.43873
              }
            ]
          }
        ],
        "sections": [
          {
            "startPointIndex": 0,
            "endPointIndex": 24,
            "sectionType": "TRAVEL_MODE",
            "travelMode": "car"
          }
        ]
      }
    ]
  }
  
// Pic info
module.exports.DEFAULT_PIC_PATH = "public/images/default_pic.b64"
