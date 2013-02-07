
/**
 * Module dependencies.
 */

var request = require('superagent')
  , Collection = require('./collection')
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

Cloudup.prototype.post = function(path){
  return request
    .set('X-Cloudup-Token', this.token)
    .set('X-Cloudup-Fingerprint', this.fingerprint)
    .post(this.url + path);
};
