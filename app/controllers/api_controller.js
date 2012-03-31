var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , filters = require('../../lib/filters')
  , mongoose = require('mongoose')
  , FeedData = require('../models/feed_data')
  , parser = require('../../lib/parser');

var ApiController = new Controller();

ApiController.download = function () {
  parser.download();
  this.error('Downloading');
}

ApiController.feed = function () {
  var format = this.param('format') || 'json'
    , last_id = this.param('syncstate')
    , self = this
    , filter = {};
  if (last_id) {
    try {
      filter._id = {
        $gt: mongoose.mongo.BSONPure.ObjectID.fromString(last_id)
      }
    } catch (e) {}
  }
  self.res.contentType('application/json');
  self.res.write('[');
  var stream = FeedData.find(filter).stream();
  var data_happened = false;
  stream.on('data', function (doc) {
    if (data_happened)
      self.res.write(',');
    self.res.write(JSON.stringify(doc));
    data_happened = true;
  });
  stream.on('close', function () {
    self.res.end(']');
  });
}
//ApiController.before('feed', filters.apiKey);

module.exports = ApiController;
