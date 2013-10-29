
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client');
var request = require('superagent');
var Stream = require('./stream');
var pkg = require('../package');
var ua = require('cloudup-ua');
var error = require('./error');
var Item = require('./item');
var User = require('./user');
var uid = require('uid2');
var os = require('os');

/**
 * Expose `Cloudup`.
 */

module.exports = Cloudup;

/**
 * Initialize a new client with the given options:
 *
 *  - `user` basic auth username
 *  - `pass` basic auth password
 *  - `token` authentication token
 *  - `useragent` user-agent name
 *  - `url` cloudup api url, used for testing only
 *  - `cloudupUrl` cloudup api url, used for testing only
 *
 * @param {Object} options
 * @api public
 */

function Cloudup(options) {
  if (!(this instanceof Cloudup)) return new Cloudup(options);
  if (!options) throw new TypeError('cloudup settings required');
  this.url = options.url || 'https://api.cloudup.com/1';
  this.cloudupUrl = options.cloudupUrl || 'https://cloudup.com';
  this.ua = ua.stringify(options.useragent || 'cloudup-client', { version: pkg.version });
  this.token = options.token;
  this.username = options.user;
  this.password = options.pass;
}

/**
 * Request token with `appId` and invoke `fn(err, tok)`.
 *
 * @param {String} appId
 * @param {Function} fn
 * @api public
 */

Cloudup.prototype.requestToken = function(appId, fn){
  if (!this.username) return fn(new Error('username required to request a token'));
  if (!this.password) return fn(new Error('password required to request a token'));

  var body = {
    grant_type: 'password',
    username: this.username,
    password: this.password,
    client_id: appId
  };

  request
  .post(this.cloudupUrl + '/oauth/access_token')
  .set('User-Agent', this.ua)
  .send(body)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn(null, res.body.access_token);
  })
};

/**
 * Get user information and invoke `fn(err, user)`.
 *
 * @param {Function} fn
 * @api public
 */

Cloudup.prototype.user = function(fn){
  this
  .get('/user')
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn(null, new User(res.body));
  });
};

/**
 * Create a new stream.
 *
 * @param {Object|String} options or id
 * @return {Stream}
 * @api public
 */

Cloudup.prototype.stream = function(options){
  options = options || {};
  if ('string' == typeof options) options = { id: options };
  options.client = this;
  return new Stream(options);
};

/**
 * Get an array of streams.
 *
 * @param {Object|Function} options or fn
 * @param {Function} fn
 * @api public
 */

Cloudup.prototype.streams = function(options, fn){
  var self = this;

  if ('function' == typeof options) {
    fn = options;
    options = {};
  }

  this
  .get('/streams')
  .query(options)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    var streams = res.body.map(self.stream.bind(self));
    fn(null, streams);
  });
};

/**
 * GET `path`.
 *
 * @param {String} path
 * @return {Request}
 * @api private
 */

Cloudup.prototype.get = function(path){
  return this.request('get', path);
};

/**
 * POST to `path`.
 *
 * @param {String} path
 * @return {Request}
 * @api private
 */

Cloudup.prototype.post = function(path){
  return this.request('post', path);
};

/**
 * PATCH `path`.
 *
 * @param {String} path
 * @return {Request}
 * @api private
 */

Cloudup.prototype.patch = function(path){
  return this.request('patch', path);
};

/**
 * DELETE `path`.
 *
 * @param {String} path
 * @return {Request}
 * @api private
 */

Cloudup.prototype.del = function(path){
  return this.request('del', path);
};

/**
 * POST to `path`.
 *
 * @param {String} path
 * @return {Request}
 * @api private
 */

Cloudup.prototype.request = function(method, path){
  var user = this.username;
  var pass = this.password;

  var url = this.url + path;
  debug('%s %s', method, url);

  var req = request[method](url);
  req.set('User-Agent', this.ua);

  // basic auth
  if (user && pass) {
    req.auth(user, pass);
    return req;
  }

  // auth token
  if (this.token) {
    req.set('Authorization', 'Bearer ' + this.token);
    return req;
  }

  throw new Error('basic auth credentials or auth token');
};
