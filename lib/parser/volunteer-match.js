var http = require('http')
  , url = require('url')
  , crypto = require('crypto')
  , dateformat = require('dateformat');

function createAuth (username, password, callback) {
  var auth = {
      username: username
    , created: dateformat(new Date(), 'yyyy-mm-dd"T"HH:MM:sso')
  }
  crypto.randomBytes(128, function (err, bytes) {
    if (err)
      return callback(err);
    var shasum = crypto.createHash('sha1');
    shasum.update(bytes);
    auth.nonce = shasum.digest('base64');
    shasum = crypto.createHash('sha256');
    shasum.update(auth.nonce + auth.created + password);
    auth.digest = shasum.digest('base64');
    callback(null, auth);
  });
}

var query = module.exports.query = function query (action, query, callback) {
  query = JSON.stringify(query);
  var options = url.parse('http://www.volunteermatch.org/api/call?action='+action+'&query=');
  options.path += query;
  options.headers = { 'Authorization': 'WSSE profile="UsernameToken"' }
  createAuth('gregsquared', 'c4149819d4bcbff012a6baf58ba190d8', function (err, auth) {
    options.headers['X-WSSE'] = 'UsernameToken Username="'+auth.username+'", PasswordDigest="'+auth.digest+'", Nonce="'+auth.nonce+'", Created="'+auth.created+'"';
//    return;
    http.get(options, function (res) {
      res.setEncoding('utf8');
      var buffer = '';
      res.on('data', function(data) { buffer += data});
      res.on('end', function () {callback(res.statusCode!==200?res.statusCode:null, buffer)});
    });
  });
}

var calls = ['getKeyStatus', 'getMetaData', 'getServiceStatus', 'helloWorld', 'searchOpportunities', 'searchOrganizations'];

calls.forEach(function (callName) {
  module.exports[callName] = function (options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    query(callName, options, callback);
  }
});
