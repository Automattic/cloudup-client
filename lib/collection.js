
/**
 * Module dependencies.
 */

var Item = require('./item')
  , Emitter = require('events').EventEmitter
  , debug = require('debug')('cloudup-client:collection')
  , error = require('./error');

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
 * Inherit from `Emitter.prototype`.
 */

Collection.prototype.__proto__ = Emitter.prototype;

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

/**
 * Save and invoke `fn(err)`
 *
 * @param {Function} [fn]
 * @api public
 */

Collection.prototype.save = function(fn){
  var self = this;
  fn = fn || function(){};

  this.client
  .post('/collections')
  .send({ title: this.title })
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
  });
};
