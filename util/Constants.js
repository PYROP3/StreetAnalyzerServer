// Requests
// -- API
module.exports.QUALITY_OVERLAY_REQUEST = "/qualityOverlay";
module.exports.LOG_TRIP_REQUEST = "/logTrip";
module.exports.ROUTE_REQUEST = "/route";
// -- Account
module.exports.CREATE_ACCOUNT_REQUEST = "/createAccount";
module.exports.VERIFY_ACCOUNT_REQUEST = "/verifyAccount";
module.exports.AUTH_REQUEST           = "/auth";
module.exports.DEAUTH_REQUEST         = "/deauth";

// Scripts
module.exports.SCRIPT_PATH = "script/"
module.exports.SCRIPT_SLICE_OVERLAY = module.exports.SCRIPT_PATH + "sliceOverlay.py"
module.exports.SCRIPT_LOG_TRIP      = module.exports.SCRIPT_PATH + "logTrip.py"
module.exports.SCRIPT_ROUTE         = module.exports.SCRIPT_PATH + "route.py"

// Log storage
module.exports.LOG_STORAGE_PATH = "log/"

// Error data
module.exports.SCRIPT_ERRORS_PATH   = module.exports.SCRIPT_PATH + "errorCodes.json"

// Localization defaults
module.exports.DEFAULT_LOCALE = "English"

// Mailer data
module.exports.SOURCE_EMAIL_ADDRESS = "streetAnalyzer@gmail.com"
module.exports.SOURCE_EMAIL_SERVICE = "gmail"
module.exports.SOURCE_EMAIL_HOST    = "smtp.gmail.com"

// Mongo keys
module.exports.USER_PRIMARY_KEY  = "email"
module.exports.USER_PASSWORD_KEY = "password"
module.exports.AUTH_TOKEN_KEY    = "authToken"
module.exports.TIMESTAMP_KEY     = "timestamp"
module.exports.USER_PIC_KEY      = "pic"
module.exports.USER_NAME_KEY     = "name"

// Authentication info
module.exports.AUTH_TOKEN_LENGTH = 64
module.exports.AUTH_TOKEN_TYPE = "Bearer"
module.exports.AUTH_TOKEN_NAME = module.exports.AUTH_TOKEN_TYPE + " "

module.exports.SERVER_PORT_DEFAULT = 8080
module.exports.SERVER_URL_DEFAULT = "http://localhost:"+module.exports.SERVER_PORT_DEFAULT

module.exports.QUALITY_DATA_TAG = "quality"

// TODO remove before deploy
module.exports.MOCK_DIRECTIONS_RESPONSE = {
    "status": "OK",
    "geocoded_waypoints": [
        {
            "geocoder_status": "OK",
            "place_id": "ChIJ7cv00DwsDogRAMDACa2m4K8",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "geocoder_status": "OK",
            "place_id": "ChIJ69Pk6jdlyIcRDqM1KDY3Fpg",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "geocoder_status": "OK",
            "place_id": "ChIJgdL4flSKrYcRnTpP0XQSojM",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "geocoder_status": "OK",
            "place_id": "ChIJE9on3F3HwoAR9AhGJW_fL-I",
            "types": [
                "locality",
                "political"
            ]
        }
    ],
    "routes": [
        {
            "summary": "I-40 W",
            "legs": [
                {
                    "steps": [
                        {
                            "travel_mode": "DRIVING",
                            "start_location": {
                                "lat": 41.85073,
                                "lng": -87.65126
                            },
                            "end_location": {
                                "lat": 41.85258,
                                "lng": -87.65141
                            },
                            "polyline": {
                                "points": "a~l~Fjk~uOwHJy@P"
                            },
                            "duration": {
                                "value": 19,
                                "text": "1 min"
                            },
                            "html_instructions": "Head <b>north</b> on <b>S Morgan St</b> toward <b>W Cermak Rd</b>",
                            "distance": {
                                "value": 207,
                                "text": "0.1 mi"
                            }
                        }
                    ],
                    "duration": {
                        "value": 74384,
                        "text": "20 hours 40 mins"
                    },
                    "distance": {
                        "value": 2137146,
                        "text": "1,328 mi"
                    },
                    "start_location": {
                        "lat": 35.4675602,
                        "lng": -97.5164276
                    },
                    "end_location": {
                        "lat": 34.0522342,
                        "lng": -118.2436849
                    },
                    "start_address": "Oklahoma City, OK, USA",
                    "end_address": "Los Angeles, CA, USA"
                }
            ],
            "copyrights": "Map data ©2010 Google, Sanborn",
            "overview_polyline": {
                "points": "a~l~Fjk~uOnzh@vlbBtc~@tsE`vnApw{A`dw@~w\\|tNtqf@l{Yd_Fblh@rxo@b}@xxSfytAblk@xxaBeJxlcBb~t@zbh@jc|Bx}C`rv@rw|@rlhA~dVzeo@vrSnc}Axf]fjz@xfFbw~@dz{A~d{A|zOxbrBbdUvpo@`cFp~xBc`Hk@nurDznmFfwMbwz@bbl@lq~@loPpxq@bw_@v|{CbtY~jGqeMb{iF|n\\~mbDzeVh_Wr|Efc\\x`Ij{kE}mAb~uF{cNd}xBjp]fulBiwJpgg@|kHntyArpb@bijCk_Kv~eGyqTj_|@`uV`k|DcsNdwxAott@r}q@_gc@nu`CnvHx`k@dse@j|p@zpiAp|gEicy@`omFvaErfo@igQxnlApqGze~AsyRzrjAb__@ftyB}pIlo_BflmA~yQftNboWzoAlzp@mz`@|}_@fda@jakEitAn{fB_a]lexClshBtmqAdmY_hLxiZd~XtaBndgC"
            },
            "warnings": [],
            "waypoint_order": [
                0,
                1
            ],
            "bounds": {
                "southwest": {
                    "lat": 34.05236,
                    "lng": -118.24356
                },
                "northeast": {
                    "lat": 41.87811,
                    "lng": -87.62979
                }
            }
        }
    ]
}
  
// Pic info
module.exports.DEFAULT_PIC_PATH = "public/images/default_pic.b64"
