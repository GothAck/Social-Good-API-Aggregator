var Account = require('../app/models/account');

/*
 * Model -> form converstion
 */

// Convert create and update to new and edit
_actions = {
    create: 'new' // Create uses same form as new
  , update: 'edit' // Update uses same form as edit
}

// Twitter bootstrap iterator for Forms
function bs_iterator (name, field) {
  if (field.widget && field.widget.type === 'hidden') return field.widget.toHTML(name, field);
  var label = this.label || name[0].toUpperCase() + name.substr(1).replace('_', ' ');
  var html = '<div class="control-group'
    + (field.error ? ' error' : '')
    + '">'
    + '<label class="control-label" for="'+(field.id || 'id_'+name)+'">'+label+'</label>'
    + '<div class="controls">'
    + field.widget.toHTML(name, field)
    + (field.error ? '<p class="help-block">' + field.error + '</p>' : '')
    + '</div>'
    + '</div>'
  return html
}

// Filter to auto convert model to form & expose form_render function to template
module.exports.convertModelForm = function (next) {
  var self = this;
  // Setup form_render helper for view
  this.form_render = function () {
    if (this.form)
      return this.form.toHTML(bs_iterator);
    return '';
  }
  // If controller has _model parameter create form from model based on current action
  if (this._model) {
    this.form = this.forms_create(this._model, _actions[this.__action] || this.__action);
  }
  next();
}

/*
 * Authentication
 */
// If not authenticated redirect to login
module.exports.isAuth = function (next) {
  if (!this.req.isAuthenticated()) {
    this.req.flash('error', 'Please login to perform this action');
    if (this.route.action !== 'logout')
      this.req.session.onLoginRedirect = this.urlFor();
    return this.redirect(this.urlFor({ controller: 'account', action: 'login'}));
  }
  delete this.req.session.onLoginRedirect;
  next();
}
// If authenticated redirect to account#show
module.exports.notAuth = function (next) {
  if (this.req.isAuthenticated()) {
    this.req.flash('error', "You can't perform this action while logged in");
    return this.redirect(this.urlFor({ controller: 'account', action: 'show' }));
  }
  next();
}

reWsse = /^UsernameToken.*?Username=\"(.*?)\",.*?PasswordDigest=\"(.*?)\",.*?Nonce=\"(.*?)\",.*?Created=\"(.*?)\"/
// TODO: Stop duplicate digests!
module.exports.authApiToken = function (next) {
  var self = this
    , auth_header = this.req.header('Authorization')
    , wsse_header = this.req.header('X-WSSE')
    , email, nonce, created, digest;
  if (auth_header !== 'WSSE profile="UsernameToken"')
    return next('Invalid Authorization header');
  var match;
  if (!(match = reWsse.exec(wsse_header)))
    return next('Invalid X-WSSE Header');
  email = match[1];
  digest = match[2];
  nonce = match[3];
  created = match[4];
  if (!(email && nonce && created && digest))
    return next('Need email, nonce, created, digest!');
  Account.authenticateToken (email, nonce, created, digest, function (err, authed) {
    if (err)
      return callback(err);
    if (!user)
      return callback('Not authenticated');
    self.user = user;
    next();
  });
}
