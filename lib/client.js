
/**
 * Module dependencies.
 */

var request = require('superagent')
  , Collection = require('./collection')
  , debug = require('debug')('cloudup-client')
  , Item = require('./item')
  , error = require('./error')
  , os = require('os');

/**
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
 *   - `user` basic auth username
 *   - `pass` basic auth password
 *   - `url` cloudup url, used for testing only
 *
 * @param {Object} options
 * @api public
 */

function Cloudup(options) {
  if (!options) throw new TypeError('cloudup settings required');
  this.url = options.url || 'https://cloudup.com';
  this.user = options.user;
  this.pass = options.pass;
}

/**
 * Create a new collection.
 *
 * @param {Object} options
 * @return {Collection}
 * @api public
 */

Cloudup.prototype.collection = function(options){
  options.client = this;
  return new Collection(options);
};

/**
 * Get an array of collections.
 *
 * @param {Function} fn
 * @api public
 */

Cloudup.prototype.collections = function(fn){
  var self = this;

  this
  .get('/collections/list')
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn(null, res.body.collections);
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
