
/**
 * Module dependencies.
 */

var request = require('superagent');

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
