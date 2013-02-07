
/**
 * Module dependencies.
 */

var request = require('superagent')
  , Collection = require('./collection')
  , debug = require('debug')('cloudup-client')
  , Item = require('./item');

/**
 * Expose `Cloudup`.
 */

module.exports = Cloudup;

/**
 * Initialize a new client with the given options:
 *
 *   - `token` cloudup token
 *   - `url` cloudup url, used for testing only
 *
 * @param {Object} options
 * @api public
 */

function Cloudup(options) {
  if (!options) throw new TypeError('cloudup settings required');
  this.url = options.url || 'https://cloudup.com';
  this.token = options.token;
  this.fingerprint = 'asdfadfasdf'; // TODO: remove
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
 * POST to `path`.
 *
 * @param {String} path
 * @return {Request}
 * @api private
 */

Cloudup.prototype.post = function(path){
  var url = this.url + path;
  debug('POST %s', url);
  return request
    .post(url)
    .set('X-Cloudup-Token', this.token)
    .set('X-Cloudup-Fingerprint', this.fingerprint)
};
