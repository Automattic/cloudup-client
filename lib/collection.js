
/**
 * Module dependencies.
 */

var Item = require('./item')
  , Emitter = require('events').EventEmitter
  , debug = require('debug')('cloudup-client:collection')
  , Batch = require('batch')
  , dates = require('./dates')
  , error = require('./error')
  , path = require('path');

/**
 * Expose `Collection`.
 */

module.exports = Collection;

/**
 * Initialize a new Collection with the given options:
 *
 *   - `title` optional collection title string
 *
 * Events:
 *
 *   - `item` (item) when an item is added
 *
 * @param {Object} options
 * @api public
 */

function Collection(options) {
  if (!options) throw new TypeError('collection settings required');
  for (var key in options) this[key] = options[key];
  this.queue = [];
}

/**
 * Inherit from `Emitter.prototype`.
 */

Collection.prototype.__proto__ = Emitter.prototype;

/**
 * Check if the collection is new.
 *
 * @return {Boolean}
 * @api public
 */

Collection.prototype.isNew = function(){
  return !! this._id;
};

/**
 * Create a new item in this collection.
 *
 * @param {Object} [options]
 * @return {Item}
 * @api public
 */

Collection.prototype.item = function(options){
  options = options || {};
  options.collection = this;
  var item = new Item(options);
  this.queue.push(item);
  this.emit('item', item);
  return item;
};

/**
 * Upload `file` as an item.
 *
 * @param {String} file
 * @return {Collection} self
 * @api public
 */

Collection.prototype.file = function(file){
  this.item().file(file);
  return this;
};

/**
 * Upload `url` as an item.
 *
 * @param {String} url
 * @return {Collection} self
 * @api public
 */

Collection.prototype.url = function(url){
  this.item().url(url);
  return this;
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
 * Save queued items.
 *
 * @param {Function} fn
 * @api private
 */

Collection.prototype.saveItems = function(fn){
  var items = this.queue;
  var batch = new Batch;

  items.forEach(function(item){
    batch.push(item.save.bind(item));
  });

  batch.end(fn);
};

/**
 * Remove and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

Collection.prototype.remove = function(fn){
  var self = this;
  fn = fn || function(){};

  debug('remove %s', this._id);
  this.client
  .del('/collections/' + this._id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn();
  });
};

/**
 * Load the collection and invoke `fn(err, col)`.
 *
 * @param {Function} fn
 * @api public
 */

Collection.prototype.load = function(fn){
  var self = this;

  debug('load %s', this._id);
  this.client
  .get('/collections/' + this._id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    var col = res.body;
    for (var key in col) self[key] = col[key];
    dates(self, 'created_at updated_at');
    fn(null, self);
  });
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
    var col = res.body;
    for (var key in col) self[key] = col[key];
    debug('saving items for %s', self._id);
    self.saveItems(function(err){
      debug('saved %s items', self.queue.length);
      fn(err);
    });
  });
};
