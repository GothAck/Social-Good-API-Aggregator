var jquery = require('jquery')
  , http = require('http')
  , querystring = require('querystring')
  , FeedData = require('../../app/models/feed_data');

var parsers = module.exports.parsers = {
  sparked: require('./sparked')
}

module.exports.download = function download() {
  var sparked = new parsers.sparked('http://api.sparked.com/feeds/openchallenges.xml');
  sparked.on('eventDone', function (event) {
    console.log('Event');
    sparked.adapter(event, function (opp) {
      var data = new FeedData(opp);
      try {
        data.save();
      } catch (e) { console.log ('Error saving')}
    });
  });
  sparked.parse();
}

var geoCache = [];

var interval = null;

module.exports.geoLocate = function(placename, callback) {
  console.log('geo begin');
  if (! interval)
    interval = setInterval(function () {
      var d = geoCache.splice(0,1)[0];
      if (d) 
        d.func(d.pn, d.cb);
    }, 10000);
  geoCache.push({ pn: placename, cb: callback, func: function (placename, callback) {
    console.log('geo timed');
    http.get({
      host: 'maps.googleapis.com',
      path: '/maps/api/geocode/json?' + querystring.stringify({
        address: placename,
        sensor: false
      })
    }, function (res) {
      var buffer = '';
      res.setEncoding('utf-8');
      res.on('data', function (data) {
        buffer += data;
      });
      res.on('end', function () {
        try {
          callback(null, JSON.parse(buffer));
        } catch (e) {
          callback(e);
        }
  
      });
    });
  }});
}

var Opportunity = module.exports.Opportunity = function Opportunity(provider, unique_id) {
  this.unique_key = provider + '__' + unique_id;
  this.status = null;
  this.organisation = new Organisation();
  this.categories = [];
  this.availability = new Availability();
  this.dates = new Dates();
  this.title = null;
  this.description = null;
  this.urls = new Urls();
  this.location = new Location();
  this.ageRange = {
    min: null,
    max: null
  }
  this.volunteers = {
    referred: null,
    max: null,
    min: null
  }
  this.skillsNeeded = new MultiText();
  this.type = null;
}

var Location = module.exports.Location = function Location() {
  this.name = null;
  this.country = null;
  this.lat = null;
  this.lon = null;
  this.virtual = null;
}

var Urls = module.exports.Urls = function Urls() {
  this.organisation = null;
  this.agency = null;
  this.image = null;
  this.email = null;
}

var Dates = module.exports.Dates = function Dates() {
  this.created = new Date();
  this.updated = null;
}

var Organisation = module.exports.Organisation = function Organisation() {
  this.name = null;
  this.firstname = null;
  this.lastname = null;
  this.location = new Location();
  this.urls = new Urls();
  this.accreditation = null;
  this.categories = [];
  this.dates = new Dates();
  this.description = new MultiText();
}

var MultiText = module.exports.MultiText = function MultiText(input) {
  this.html = input || null;
  try {
    this.plain = this.html ? jquery('<p>'+this.html+'</p>').text() : null;
  } catch (e) {
    this.plain = this.html;
  }
  if (this.html === this.plain) {
    this.html = null;
  }
}

var Availability = module.exports.Availability = function Availability() {
  this.start = null;
  this.end = null;
}
