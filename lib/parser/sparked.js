var sax = require('sax')
  , strict = true
  , events = require('events')
  , http = require('http')
  , url = require('url')
  , util = require('util')
  , jquery = require('jquery')
  , protos = require('./');

var sparked = module.exports = function Parser(url) {
  this.url = url;
  workParser.apply(this);
}

sparked.prototype = new events.EventEmitter;
var rootTag = 'challenges';
var eventTag = 'challenge';
var idTag = 'url';
var parseText = ['description'];

function treeGet(objects, path) {
//  console.log('treeGet', path);
  var obj = objects;
  if (!path.length)
    return objects;
  for (var i = 0; i < path.length; i++) {
    if (!obj) {
//      console.log('treeGetNone');
      return {}
    }
    obj = obj[path[i]];
  }
//  console.log('treeGetRes', path, obj);
  return obj;
}

function workParser() {
  var saxStream = this.saxStream = sax.createStream(strict, {lowercasetags: true})
  var self = this;
  var currentNode
    , currentRoot
    , currentTag
    , currentPath;

saxStream.on('opentag', function (node) {
//  console.log('opentag', node, currentPath);
  switch (node.name) {
  case rootTag:
    break;
  case eventTag:
    currentRoot = currentNode = {};
    currentPath = [];
    break
  default:
    if (currentTag)
      currentPath.push(currentTag);
    currentNode = treeGet(currentRoot, currentPath);
//    console.log('###', currentTag, currentPath);
    currentTag = node.name;
    currentNode[currentTag] = { attrs: node.attributes };
//    console.log('###', currentTag);
    currentNode = currentNode[currentTag];
    break;
  }
});

saxStream.on('closetag', function (name) {
//  console.log('closetag', name, currentPath);
  switch (name) {
  case rootTag:
    break;
  case eventTag:
    //console.log('eventDone', currentRoot);
    self.emit('eventDone', currentRoot);
    break;
  case currentTag:
    currentTag = currentPath.splice(-1, 1)[0];
    currentNode = treeGet(currentRoot, currentPath);
    break;
  default:
    throw new Error('OOPS');
    break;
  }
});

saxStream.on('text', function (t) {
  if (currentNode) {
    currentNode.text = t;
    while (currentNode.text.indexOf('\\\\') !== -1) {
      currentNode.text = currentNode.text.replace('\\\\', '\\');
    }
  }
})
}

sparked.prototype.parse = function () {
  var self = this;
  var path = url.parse(this.url);
  http.get(path, function (res) {
    res.pipe(self.saxStream);
    res.on('end', function () {
      self.emit('end');
    });
  });
}

function tG(object, path) {
  if (typeof path === 'string')
    path = path.split('.')
  return (treeGet(object, path) || {}).text || null;
}

sparked.prototype.adapter = function (data, callback) {
  if (!data)
    return;
  var opp = new protos.Opportunity('sparked', tG(data, 'url'));
  opp.title = tG(data, 'title');
  var cat = tG(data, 'cause');
  opp.categories = cat ? [cat] : null;
  opp.skillsNeeded = new protos.MultiText(tG(data, 'skill'));
  opp.urls.agency = tG(data, 'url');
  opp.description = new protos.MultiText(tG(data, 'description'));

  try {
    var sp = tG(data, 'deadline').split('/');
    if (1*sp[2] < 1000) sp[2] = '20'+sp[2];
    opp.availability.start = new Date(sp[2], sp[0], sp[1]);
  } catch (e) {}
  //deadline - parse date
  opp.volunteers.referred = tG(data, 'numSolvers');
  // Seeker
  with (opp.organisation) {
    name = tG(data, 'seeker.orgName');
    firstname = tG(data, 'seeker.firstName');
    lastname = tG(data, 'seeker.lastName');
    location.name = tG(data, 'seeker.location');
    var _location = location;
    if (location.name) {
      var a = protos.geoLocate(location.name, function (err, data) {
        if (err) {
          console.log('ERROR Locating', err);
          return callback(opp);
        }
        try {
          if (data.status !== 'OK') {
            console.log('WRN Locating', data);
            return callback(opp);
          }
          var loc = data.results[0].geometry.location;
          opp.location.lat = _location.lat = loc.lat;
          opp.location.lon = _location.lon = loc.lng;
        } catch (e) {console.log('WARNING Locating', e)}
        callback(opp);
      });
    }
    urls.agency = tG(data, 'seeker.sparkedProfileUrl');
    urls.organisation = tG(data, 'seeker.orgUrl');
    description = new protos.MultiText(tG(data, 'seeker.orgBio'));
    accreditation = tG(data, 'seeker.orgAccreditation');
  }
}
