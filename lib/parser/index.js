var jquery = require('jquery');

module.exports.sparked = require('./sparked');

var Opportunity = module.exports.Opportunity = function Opportunity() {
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
