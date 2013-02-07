
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
 *   - `url` cloudup url, used for testing only
 *
 * @param {Object} options
 * @api public
 */

function Cloudup(options) {
  if (!options) throw new TypeError('cloudup settings required');
  this.url = options.url || 'https://cloudup.com';
}

Cloudup.prototype.collection = function(options){
  options.client = this;
  return new Collection(options);
};
