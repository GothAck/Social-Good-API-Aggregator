var sax = require('sax')
  , strict = true
  , events = require('events')
  , http = require('http')
  , url = require('url')
  , util = require('util')
  , jquery = require('jquery');

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
  var obj = objects;
  if (!path.length)
    return objects;
  for (var i = 0; i < path.length; i++) {
    obj = obj[path[i]];
  }
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
  //console.log('opentag', node);
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
    currentNode[currentTag = node.name] = { attrs: node.attributes };
    currentNode = currentNode[currentTag];
    break;
  }
});

saxStream.on('closetag', function (name) {
  //console.log('closetag', name);
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
    currentNode.text = parseText.indexOf(currentTag) !== -1 ? jquery(t).text() : t;
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
