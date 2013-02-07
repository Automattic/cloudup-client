
/**
 * Module dependencies.
 */

var Item = require('./item')
  , debug = require('debug')('cloudup-client:collection');

/**
 * Expose `Collection`.
 */

module.exports = Collection;

/**
 * Initialize a new Collection with the given options:
 *
 *   - `title` optional collection title string
 *
 * @param {Object} options
 * @api public
 */

function Collection(options) {
  if (!options) throw new TypeError('collection settings required');
  this.title = options.title;
  this.client = options.client;
  debug('collection %j', this);
}

/**
 * Create a new item in this collection.
 *
 * @param {Object} options
 * @return {Item}
 * @api public
 */

Collection.prototype.item = function(options){
  options.collection = this;
  return new Item(options);
};

/**
 * Return JSON representation.
 *
 * @return {Object}
 * @api public
 */

Collection.prototype.toJSON = function(){
  return {
    title: this.title
  }
};
