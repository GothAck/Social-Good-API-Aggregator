var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Email = mongoose.SchemaTypes.Email;

var FeedDataSchema = new Schema({
  unique_key: { type: String, unique: true }
});

module.exports = mongoose.model('FeedData', FeedDataSchema);
