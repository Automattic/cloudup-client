
/**
 * Module dependencies.
 */

var request = require('superagent');
var Stream = require('./stream');
var debug = require('debug')('cloudup-client');
var Item = require('./item');
var error = require('./error');
var uid = require('uid2');
var os = require('os');

/*!
 * User-Agent string.
 */

var ua = [
  'cloudup-client',
  'node/' + process.version,
  'os/' + os.platform()
].join(' ');

/**
 * Expose `Cloudup`.
 */

module.exports = Cloudup;

/**
 * Initialize a new client with the given options:
 *
 *  - `user` basic auth username
 *  - `pass` basic auth password
 *  - `fingerprint` application fingerprint 
 *  - `token` application token 
 *  - `useragent` user-agent string 
 *  - `url` cloudup api url, used for testing only
 *
 * @param {Object} options
 * @api public
 */

function Cloudup(options) {
  if (!(this instanceof Cloudup)) return new Cloudup(options);
  if (!options) throw new TypeError('cloudup settings required');
  this.url = options.url || 'https://api.cloudup.com';
  this.ua = ua + (options.useragent || '');
  this.fingerprint = options.fingerprint;
  this.token = options.token;
  this.user = options.user;
  this.pass = options.pass;
}

/**
 * Register `app` and invoke `fn(err, app)`.
 *
 * @param {Object} app
 * @param {Function} fn
 * @api public
 */

Cloudup.prototype.registerApplication = function(app, fn){
  if (!this.user) return fn(new Error('.user required to register an app'));
  if (!this.pass) return fn(new Error('.pass required to register an app'));

  var body = {
    platform: os.platform(),
    fingerprint: uid(100),
    login: this.user,
    pass: this.pass,
    name: app.name
  };

  this
  .post('/apps')
  .send(body)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn(null, res.body);
  })
};

/**
 * Create a new stream.
 *
 * @param {Object|String} options or id
 * @return {Stream}
 * @api public
 */

Cloudup.prototype.stream = function(options){
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
  var url = this.url + path;
  debug('%s %s', method, url);
  
  var req = request[method](url);
  req.set('User-Agent', this.ua);

  // basic auth
  if (this.user && this.pass) {
    req.auth(this.user, this.pass);
    return req;
  }

  // app token
  if (this.token && this.fingerprint && this.user) {
    req.set('X-Cloudup-User', this.user);
    req.set('X-Cloudup-Token', this.token);
    req.set('X-Cloudup-Fingerprint', this.fingerprint);
    return req;
  }

  throw new Error('basic auth credentials or application token / fingerprint required');
};
