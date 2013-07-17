
/**
 * Module dependencies.
 */

var request = require('superagent');
var Stream = require('./stream');
var debug = require('debug')('cloudup-client');
var Item = require('./item');
var error = require('./error');
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
 *  - `url` cloudup api url, used for testing only
 *
 * @param {Object} options
 * @api public
 */

function Cloudup(options) {
  if (!(this instanceof Cloudup)) return new Cloudup(options);
  if (!options) throw new TypeError('cloudup settings required');
  this.url = options.url || 'https://api.cloudup.com';
  this.user = options.user;
  this.pass = options.pass;
}

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
 * @param {Function} fn
 * @api public
 */

Cloudup.prototype.streams = function(fn){
  var self = this;

  this
  .get('/streams')
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
  return request
    [method](url)
    .set('User-Agent', ua)
    .auth(this.user, this.pass)
};
