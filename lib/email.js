/*
 * Locomotive Mailer Glue
 */

var nodemailer = require('nodemailer')
  , _ = require('underscore');

// Set up your transport here
var transport = nodemailer.createTransport('SMTP', {
    host: 'localhost'
  , port: 10025
});

// Default options for NodeMaier
var defaultOptions = {
    transport: transport
  , from: 'Test Server <noreply@test.com>'
  , subject: 'Test'
  , generateTextFromHTML: true
}

function sendMail (options, callback) {
  options = _.defaults(options, defaultOptions);
  nodemailer.sendMail(options, callback)
}

// Express middleware to expose sendMail function on req
module.exports = function () {
  return function (req, res, next) {
    req.sendMail = sendMail;
    next();
  }
}
