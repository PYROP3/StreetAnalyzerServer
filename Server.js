const express = require('express');
const server = express();
const Constants = require("./util/Constants");
const {spawn} = require('child_process');
const fs = require('fs');
const mongo = require("./mongodb/MongoHelper.js");
//const oauth2 = require("./oauth2/Oauth2Helper.js").oauth2;
const assert = require('assert');
const userModel = require("./mongodb/model/User.js");
const serverUtils = require("./util/Util.js");
const logger = require("./util/Logger.js").logger;
const mailer = require("./util/MailerHelper.js");
const PosixMQ = require('posix-mq');
const polylineDecode = require('decode-google-map-polyline');

// JSON via post
const bodyParser = require('body-parser');
const { Logger } = require('mongodb');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

// Environment variables
require('dotenv').config({path: __dirname + '/util/.env'});
require('dotenv').config({path: __dirname + '/script/.env'});
require('dotenv').config({path: __dirname + '/mongodb/.env'});

//Email
EmailTemplate = require('email-templates').EmailTemplate,
path = require('path'),
Promise = require('bluebird');

// Cookies
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

// Static pages
server.use('/static', express.static('public'));

// Oauth2 setup
// server.use(oauth2.inject());
// server.post('/token', oauth2.controller.token);
// server.get('/authorization', isAuthorized, oauth2.controller.authorization, function(req, res) {
//     // Render our decision page
//     // Look into ./test/server for further information
//     res.render('authorization', {layout: false});
// });
// server.post('/authorization', isAuthorized, oauth2.controller.authorization);
// function isAuthorized(req, res, next) {
//     if (req.session.authorized) next();
//     else {
//         var params = req.query;
//         params.backUrl = req.path;
//         res.redirect('/login?' + query.stringify(params));
//     }
// };

// Error handling
function sendErrorMessage(code, request, response) {
    let error;
    if (typeof(code)==='string') {
        error = serverUtils.findErrorByName(code)
    } else {
        let rawdata = fs.readFileSync(serverUtils.fetchFile(Constants.SCRIPT_ERRORS_PATH));
        let parsedData = JSON.parse(rawdata);
        error = parsedData[code];
    }
    let errorData = error["Data"][request.header("Locale") != null ? request.header("Locale") : Constants.DEFAULT_LOCALE];
    let thisErr = {
        "Error": errorData["PrettyName"],
        "Description": errorData["Description"],
        "Code": error["id"]
    }
    response.status(error["HttpReturn"]).header("Content-Type", "application/json").send(JSON.stringify(thisErr));
}

//Email template
function loadTemplate(templateName, contexts){
    let template = new EmailTemplate(path.join(__dirname, '/templates', templateName));
    return Promise.all([contexts].map((context) => {
        return new Promise((resolve, reject) => {
            template.render(context, (err, result) => {
                if (err) reject(err);
                else resolve({
                    email: result,
                    context,
                });
            });
        });
    }));
}

// =================================== Requests ===================================

server.post(Constants.CREATE_ACCOUNT_REQUEST, async function(req, res) {
    let data = req.body;
    let authToken = req.token;
    
    let findResult = await mongo.db.collection('users').findOne({[Constants.USER_PRIMARY_KEY]:data[Constants.USER_PRIMARY_KEY]});
    if (findResult) {
        logger.info("Account requested for PK ("  + Constants.USER_PRIMARY_KEY + ") " + data[Constants.USER_PRIMARY_KEY] + " already in use");
        sendErrorMessage("PrimaryKeyInUse", req, res); //TODO find a better way to reply
        return 
    }
    var newUser = new userModel.User(
        data['email'], 
        data['name'], 
        serverUtils.saltAndHashPassword(
            data['email'], 
            data['password']
        )
    ).toJSON();
    newUser['authToken'] = serverUtils.generateToken(32);
    logger.info("Creating user : ", newUser[Constants.USER_PRIMARY_KEY]);
    let result = await mongo.db.collection('pendingUsers').insertOne(newUser);
    if (result == null) {
        sendErrorMessage(1, req, res);
    } else {
        sendErrorMessage(0, req, res); //TODO find a better way to reply
        //TODO des-gambiarrar esse processo de enviar email
        loadTemplate('validation', newUser).then((results) => {
            return Promise.all(results.map((result) =>{         
                mailer.sendMail({
                    from: Constants.SOURCE_EMAIL_ADDRESS,
                    to: newUser['email'],
                    subject: 'Street analyzer account validation',
                    html: result.email.html
                });
            }));
        });
    }
});

server.get(Constants.VERIFY_ACCOUNT_REQUEST, async function(req, res) {
    let query = req.query;
    let authToken = query.token;
    if (authToken == null) {
        sendErrorMessage("MalformedToken", req, res);
        return;
    }

    let auth = await mongo.db.collection('pendingUsers').findOneAndDelete({'authToken':authToken});
    if (auth == null) {
        sendErrorMessage(7, req, res);
    } else {
        auth = auth['value'];
        logger.info("Validating user : ", auth);
        delete(auth['authToken']);
        await mongo.db.collection('users').insertOne(new userModel.User(auth).toJSON());
        sendErrorMessage(0, req, res); //TODO find a better way to reply
    }
});

server.post(Constants.AUTH_REQUEST, async function(req, res) {
    let data = req.body;
    // TODO use SHA256 of password
    let authResult = await mongo.createSession(data[Constants.USER_PRIMARY_KEY], data[Constants.USER_PASSWORD_KEY]);
    logger.debug("Authentication result for " + JSON.stringify(data) + " is " + String(authResult))
    if (typeof(authResult) === 'string') {
        res.status(200).header("Content-Type", "application/json").send(JSON.stringify({[Constants.AUTH_TOKEN_KEY]:authResult}));
    } else {
        sendErrorMessage(authResult['id'], req, res);
    }
});

server.get(Constants.DEAUTH_REQUEST, async function(req, res) {
    let authToken = serverUtils.parseAuthToken(req.get("Authorization"));
    logger.debug("Got authorization = " + req.get("Authorization"));

    if (authToken == null) {
        sendErrorMessage("MalformedToken", req, res);
        return;
    }

    let result = await mongo.destroySession(authToken);

    if (result == null) {
        sendErrorMessage("SessionNotFound", req, res);
        return;
    }
    
    sendErrorMessage(0, req, res); //TODO find a better way to reply
});

server.get(Constants.QUALITY_OVERLAY_REQUEST, function(req, res) {
    var query = req.query;
    query.minLatitude   = parseFloat(query.minLatitude);
    query.minLongitude  = parseFloat(query.minLongitude);
    query.maxLatitude   = parseFloat(query.maxLatitude);
    query.maxLongitude  = parseFloat(query.maxLongitude);

    logger.info("[Server][qualityOverlay] Overlay requested from ("+query.minLatitude+","+query.minLongitude+") to ("+query.maxLatitude+","+query.maxLongitude+")");

    if(query.minLatitude > query.maxLatitude || query.minLongitude > query.maxLongitude){
        sendErrorMessage(6, req, res);
        return;
    }
    if(query.minLatitude < -90 || query.maxLatitude > 90 || query.maxLongitude > 180 || query.minLongitude < -180){
        sendErrorMessage(5, req, res);
        return;
    }

    if(query.minLatitude == query.maxLatitude || query.minLongitude == query.maxLatitude){
        sendErrorMessage(14, req, res);
        return;
    }

    const python = spawn(
        process.env.PYTHON_BIN,
        [
            serverUtils.fetchFile(Constants.SCRIPT_SLICE_OVERLAY), 
            query.minLongitude, // x_min
            query.minLatitude,  // y_min
            query.maxLongitude, // x_max
            query.maxLatitude,  // y_max
            "--overlay_folder",
            serverUtils.fetchFile("/overlay/"),         // overlay_folder
            "--errors_file",
            serverUtils.fetchFile(Constants.SCRIPT_ERRORS_PATH),
            //"--DEBUG"
        ]
    );

    var overlayNonce = ""

    // Collect data from script
    python.stdout.on('data', function (data) {
        logger.debug('[Server][qualityOverlay][python/stdout] : ' + data);
        overlayNonce += data.toString();
    });

    // Collect error data from script (for debugging)
    python.stderr.on('data', function (data) {
        logger.error('[Server][qualityOverlay][python/stderr] :' + data);
    });

    // Send status of operation to user on close
    python.on('close', (code) => {
        logger.debug(`[Server][qualityOverlay] Script exit code : ${code}`);

        if (code != 0) {
            sendErrorMessage(code, req, res);
            return;
        }

        res.set('Content-Type', 'image/jpeg');

        // Get file using nonce from script
        const path = serverUtils.fetchFile("/tmp/"+overlayNonce+".jpg");

        // Send customized overlay
        res.sendFile(path, (err) => {
            // Remove tmp file after send
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        });
    });
});

server.post(Constants.LOG_TRIP_REQUEST, async function(req, res){
    var data = req.body;
    let authToken = serverUtils.parseAuthToken(req.get("Authorization"));
    logger.debug("Got authorization = " + req.get("Authorization"));

    if (authToken == null) {
        sendErrorMessage("MalformedToken", req, res);
        return;
    }

    let authResult = await mongo.validateSession(authToken);

    if (authResult == null) {
        sendErrorMessage("AuthorizationNotRecognized", req, res);
        return;
    }

    logger.info("[Server][logTrip] Trip log requested")

    logger.debug("[Server][logTrip] Authentication : " + JSON.stringify(authResult))
    logger.debug("[Server][logTrip] Coordinates    : " + JSON.stringify(data["pontos"]))
    logger.debug("[Server][logTrip] Accel data     : " + JSON.stringify(data["dados"]))

    for(let i = 0; i < (data["pontos"]).length; i++){
        if(data["pontos"][i][0] > 180 || data["pontos"][i][0] < -180 || data["pontos"][i][1] > 90 || data["pontos"][i][1] < -90){
            sendErrorMessage(5, req, res);
            return;
        }
    }

    if((data["pontos"]).length != (data["dados"]).length + 1){
        sendErrorMessage(13, req, res);
        return;
    }

    let py_args = [
        serverUtils.fetchFile(Constants.SCRIPT_LOG_TRIP),
        "--coordinates"    , data["pontos"].map(coord => coord.join(",")).join(" "),
        "--overlay_folder" , serverUtils.fetchFile("/overlay/"),
        "--errors_file"    , serverUtils.fetchFile(Constants.SCRIPT_ERRORS_PATH),
        //"--DEBUG"
    ]

    py_args = py_args.concat([].concat.apply([], data["dados"].map(line => ["--accel_data", line.map(data => data.join(",")).join(" ")])))

    logger.debug("[Server][logTrip][debug] py_args = " + py_args)
    const python = spawn(
        process.env.PYTHON_BIN,
        py_args
    );

    var pythonData = ""

    // Collect data from script
    python.stdout.on('data', function (data) {
        logger.debug('[Server] Pipe data from python script : ' + data);
        pythonData += data.toString();
    });

    // Collect error data from script (for debugging)
    python.stderr.on('data', function (data) {
        logger.error('[Server][python/stderr] :' + data);
    });

    // Send status of operation to user on close
    python.on('close', (code) => {
        logger.debug(`[Server] Script exit code : ${code}`);

        if (code != 0) {
            sendErrorMessage(code, req, res);
            return;
        }

        res.send("Obrigado pela contribuição, " + data["usuario"] + "!")
    });

});

server.get(Constants.ROUTE_REQUEST, async function(req, res) {
    // TODO uncomment authentication before deploy
    //let authToken = serverUtils.parseAuthToken(req.get("Authorization"));
    //logger.debug("Got authorization = " + req.get("Authorization"));

    //if (authToken == null) {
    //    sendErrorMessage("MalformedToken", req, res);
    //    return;
    //}
    
    let query = req.query;
    let origin = req.origin;
    let destination = req.destination;
    let key = process.env.MAPS_API_KEY;
    // TODO add optional parameters

    // Make a request to Google Directions API
    // FIXME REQUEST_DENIED: You must enable Billing on the Google Cloud Project 
    // at https://console.cloud.google.com/project/_/billing/enable 
    // Learn more at https://developers.google.com/maps/gmp-get-started
    let paramString = serverUtils.format("origin=%s&destination=%s&key=%s", origin, destination, key);
    let reqUrl = "https://maps.googleapis.com/maps/api/directions/json?" + paramString;
    logger.debug("Making request to Directions: " + reqUrl);

    let directionResponse = await serverUtils.request(reqUrl);
    logger.debug("Got response: " + directionResponse);

    directionResponse = JSON.parse(directionResponse);
    if (directionResponse['status'] != "OK") {
        logger.error("Error in Directions API");
        //sendErrorMessage("UnknownError", req, res);
        //return;
        // TODO remove mocked response before deploy
        directionResponse = {...Constants.MOCK_DIRECTIONS_RESPONSE};
    }

    // Open message queues
    const queueToken = String(Date.now());
    logger.debug("Queue token = " + queueToken);

    let mqN2P = new PosixMQ();
    mqN2P.open({
        name: '/routeN2P' + queueToken,
        create: true,
        mode: '0777',
        maxmsgs: 10,
        msgsize: 40
    });

    let mqP2N = new PosixMQ();
    mqP2N.open({
        name: '/routeP2N' + queueToken,
        create: true,
        mode: '0777',
        maxmsgs: 10,
        msgsize: 20
    });

    // Spawn python process that will take in line segments via IPC-MQ and output quality data for each tuple (queueToken as param)
    const python = spawn(
        process.env.PYTHON_BIN,
        [
            serverUtils.fetchFile(Constants.SCRIPT_ROUTE),
            '--queueTag', queueToken
        ]
    );

    // Collect data from script
    python.stdout.on('data', function (data) {
        logger.debug('[Server] Pipe data from python script : ' + data);
    });

    // Collect error data from script (for debugging)
    python.stderr.on('data', function (data) {
        logger.error('[Server][python/stderr] :' + data);
    });

    // Send status of operation to user on close
    python.on('close', (code) => {
        logger.debug(`[Server] Script exit code : ${code}`);
    });

    // TODO it might be possible to use "overview_polyline" attribute of each route instead of iterating over every step
    // For each route available...
    directionResponse['routes'].reduce((promiseChain, element, index, self) => {
        return promiseChain.then(() => new Promise((resolve, reject) => {
            // Routes are a collection of legs
            element['legs'].forEach((_element, _index, _self) => {
                // Legs are a collection of steps
                _element['steps'].forEach((__element, __index, __self) => {
                    // Steps are a set of lines (encoded polyline)
                    logger.debug("Polyline = " + __element['polyline']['points']);
                    polylineDecode(__element['polyline']['points']).reduce((___promiseChain, ___element, ___index, ___self) => {
                        return ___promiseChain.then(() => new Promise((___resolve, ___reject) => {
                            if (___index > 0) {
                                var _start = ___self[___index-1];
                                var _end = ___self[___index];
                                logger.debug(serverUtils.format("Step: %s,%s to %s,%s", _start['lat'], _start['lng'], _end['lat'], _end['lng']));
                
                                // Send tuple to python script
                                var _msg = serverUtils.format("%s %s %s %s", _start['lat'], _start['lng'], _end['lat'], _end['lng']);
                                logger.debug("Msg = " + _msg + " (" + _msg.length + ")");
                                mqN2P.push(_msg);
                                
                                // Get response related to this step
                                serverUtils.getMessageFromQueue(mqP2N).then((msg) => {
                                    logger.debug(serverUtils.format("Step %s, quality = %s", ___index, msg));
                                    if (___index > 1) {
                                        __self[__index]['polyline'][[Constants.QUALITY_DATA_TAG]].push(parseFloat(msg));
                                    } else {
                                        __self[__index]['polyline'][[Constants.QUALITY_DATA_TAG]] = [parseFloat(msg)];
                                    }
                                    ___resolve();
                                });
                            } else {
                                ___resolve();
                            }
                        }));
                    }, Promise.resolve()).then(() => {
                        logger.debug("Resolve called at most internal level");
                        resolve();
                    });
                    // TODO improvement: add callback at end to calculate average for this step (can be done on app instead)
                });
                // TODO improvement: add callback at end to calculate average for this leg (can be done on app instead)
                //_self[_index][Constants.QUALITY_DATA_TAG] = _element['steps'].reduce((a, val) => a + val[Constants.QUALITY_DATA_TAG]) / _element['steps'].length;
                //logger.debug(serverUtils.format("Got avg quality for leg %s of route %s = %s", _index, index, _self[_index][Constants.QUALITY_DATA_TAG]));
            });
            // TODO improvement: add callback at end to calculate average for this route (can be done on app instead)
            //self[index][Constants.QUALITY_DATA_TAG] = element['legs'].reduce((a, val) => a + val[Constants.QUALITY_DATA_TAG]) / element['legs'].length;
            //logger.debug(serverUtils.format("Got avg quality for route %s = %s", index, self[index][Constants.QUALITY_DATA_TAG]));
        }));
    }, Promise.resolve()).then(() => {
        // Inform python script to exit
        mqN2P.push("EXIT");
    
        // Close message queues
        mqP2N.unlink();
        mqP2N.close();
        mqN2P.unlink();
        mqN2P.close();

        // Reply to user
        res.status(200).header("Content-Type", "application/json").send(directionResponse);
    });
});

// =================================== End page require ===================================

// Listen on port
let port = process.env.PORT;
if (port == undefined) port = Constants.SERVER_PORT_DEFAULT;

logger.info("Starting server...");
server.listen(port);
logger.info("[Server] Listening on port " + port);
