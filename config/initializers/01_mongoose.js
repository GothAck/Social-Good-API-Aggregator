var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/maketime_aggregator');

var mongooseTypes = require("mongoose-types");
mongooseTypes.loadTypes(mongoose);
