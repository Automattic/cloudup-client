
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:item');

/**
 * Expose `Item`.
 */

module.exports = Item;

/**
 * Initialize a new Item with the given options:
 *
 *   - `title` optional Item title string
 *
 * @param {Object} options
 * @api public
 */

function Item(options) {
  if (!options) throw new TypeError('item settings required');
  this.title = options.title;
  this.collection = options.collection;
  debug('item %j', this);
}

/**
 * Return JSON representation.
 *
 * @return {Object}
 * @api public
 */

Item.prototype.toJSON = function(){
  return {
    title: this.title,
    collection: this.collection.title
  }
};
