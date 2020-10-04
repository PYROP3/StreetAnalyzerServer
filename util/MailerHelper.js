const nodemailer = require('nodemailer');
const Constants = require("./Constants");
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config({path: __dirname + '/.env'});

const transporter = nodemailer.createTransport({
    host: Constants.SOURCE_EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: Constants.SOURCE_EMAIL_ADDRESS,
        pass:     process.env.SOURCE_EMAIL_PASSWORD,
    }
});

transporter.use('compile', hbs({
    viewEngine: 'express-handlebars',
    viewPath: './util/templates'
}));

/**
 * Generic send email
 * Uses environment variables to get authentication tokens to communicate with email provider
 *
 * @param emailData {Object} File to be located
 */
module.exports.sendMail = function(emailData) {
    transporter.sendMail(emailData, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}