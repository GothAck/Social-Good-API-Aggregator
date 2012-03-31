/*
 * Locomotive Mailer Glue
 */

var nodemailer = require('nodemailer')
  , _ = require('underscore');

// Set up your transport here
var transport = nodemailer.createTransport('SMTP', {
    host: 'localhost'
  , port: 25
});

// Default options for NodeMaier
var defaultOptions = {
    transport: transport
  , from: 'VolunteerFeed <greg@greg-net.co.uk>'
  , subject: 'VolunteerFeed'
  , generateTextFromHTML: true
}

function sendMail (options, callback) {
  options = _.defaults(options, defaultOptions);
  console.log('EMAILING', options);
  nodemailer.sendMail(options, callback)
}

// Express middleware to expose sendMail function on req
module.exports = function () {
  return function (req, res, next) {
    req.sendMail = sendMail;
    next();
  }
}
