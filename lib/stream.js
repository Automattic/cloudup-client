
/**
 * Module dependencies.
 */

var Item = require('./item');
var Emitter = require('events').EventEmitter;
var debug = require('debug')('cloudup-client:stream');
var schema = require('./schemas/stream');
var Batch = require('batch');
var dates = require('./dates');
var error = require('./error');
var only = require('only');
var path = require('path');

/**
 * Expose `Stream`.
 */

module.exports = Stream;

/**
 * Public properties.
 */

var props = Object.keys(schema.properties);

/**
 * Initialize a new Stream with the given options:
 *
 *  - `title` optional Stream title string
 *
 * Events:
 *
 *  - `item` (item) when an item is added
 *  - `save` Stream saved
 *  - `end` item uploads complete
 *
 * Examples:
 *
 *    client
 *    .stream({ title: 'Animals' })
 *    .file('path/to/maru-1.jpg')
 *    .file('path/to/maru-2.jpg')
 *    .url('http://farm5.static.flickr.com/4131/5001570832_c1341f609f.jpg')
 *    .save(function(err){
 *      // do stuff
 *    })
 *
 * @param {Object} options
 * @api public
 */

function Stream(options) {
  if (!options) throw new TypeError('stream settings required');
  this.merge(options);
  if (this.id) this.url = this.url || 'https://cloudup.com/' + this.id;
  this.concurrency(8);
  this._items = [];
}

/*!
 * Inherit from `Emitter.prototype`.
 */

Stream.prototype.__proto__ = Emitter.prototype;

/**
 * Check if the stream is new.
 *
 * @return {Boolean}
 * @api public
 */

Stream.prototype.isNew = function(){
  return !this.id;
};

/**
 * Set `prop`'s `val` with optional callback `fn`.
 *
 * @param {String|Object} prop or object
 * @param {String|Function} val or [fn]
 * @param {Function} [fn]
 * @api public
 */

Stream.prototype.set = function(prop, val, fn){
  var self = this;
  var obj = {};
  fn = fn || function(){};

  // key/val or object
  if ('object' == typeof prop) {
    obj = prop;
    fn = val;
  } else {
    obj[prop] = val;
  }

  // merge
  for (var key in obj) {
    this[key] = obj[key];
  }

  // PATCH
  debug('set %j', obj);
  this.client
  .patch('/streams/' + this.id)
  .send(obj)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn();
  });
};

/**
 * Merge `obj`.
 *
 * @param {Object} obj
 * @api private
 */

Stream.prototype.merge = function(obj){
  if (obj.items) obj.item_ids = obj.items;
  delete obj.items;
  for (var key in obj) this[key] = obj[key];
  dates(this, 'created_at updated_at');
};

/**
 * Create a new item in this stream.
 *
 *   var item = client.item({ title: 'Maru the cat' })
 *
 * @param {Object|String} [options or id]
 * @return {Item}
 * @api public
 */

Stream.prototype.item = function(options){
  if ('string' == typeof options) options = { id: options };
  options = options || {};
  options.stream = this;
  var item = new Item(options);
  this._items.push(item);
  this.emit('item', item);
  return item;
};

/**
 * Upload `file` as an item.
 *
 *   client
 *   .stream({ title: 'Images' })
 *   .file('maru 1.png', { filename: 'maru.png' })
 *   .file('maru 2.png')
 *   .file('maru 3.png')
 *
 * @param {String} file
 * @param {Object} [options]
 * @return {Stream} self
 * @api public
 */

Stream.prototype.file = function(file, options){
  this.item(options).file(file);
  return this;
};

/**
 * Upload `url` as an item.
 *
 *   client
 *   .stream({ title: 'Bookmarks' })
 *   .link('http://ign.com', { title: 'IGN' })
 *   .link('http://cuteoverload.com')
 *   .link('http://uglyoverload.com')
 *
 * @param {String} url
 * @param {Object} [options]
 * @return {Stream} self
 * @api public
 */

Stream.prototype.link = function(url, options){
  this.item(options).link(url);
  return this;
};

/**
 * Return JSON representation.
 *
 * @return {Object}
 * @api public
 */

Stream.prototype.toJSON = function(){
  return only(this, props);
};

/**
 * Upload concurrency.
 *
 * @param {Number} n
 * @return {Stream} self
 * @api public
 */

Stream.prototype.concurrency = function(n){
  this._concurrency = n;
  return this;
};

/**
 * Save queued items.
 *
 * @param {Function} fn
 * @api private
 */

Stream.prototype.saveItems = function(fn){
  var self = this;
  var items = this._items;
  var batch = new Batch;
  batch.concurrency(this._concurrency);

  items.forEach(function(item){
    batch.push(function(done){
      item.save(function(err){
        if (err) self.emit('error', err, item);
        done();
      });
    });
  });

  batch.end(fn);
};

/**
 * Remove and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

Stream.prototype.remove = function(fn){
  var self = this;
  fn = fn || function(){};

  debug('remove %s', this.id);
  this.client
  .del('/streams/' + this.id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn();
  });
};

/**
 * Load stream items and invoke `fn(err, items)`.
 *
 * @param {Function} fn
 * @api public
 */

Stream.prototype.items = function(fn){
  var self = this;

  debug('load %s items', this.id);
  this.client
  .get('/streams/' + this.id + '/items')
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(res.error);
    var items = res.body;
    
    items = items.map(function(item){
      item.stream = self;
      return new Item(item);
    });

    fn(null, items);
  });
};

/**
 * Load the stream and invoke `fn(err, stream)`.
 *
 * @param {Function} fn
 * @api public
 */

Stream.prototype.load = function(fn){
  var self = this;

  debug('load %s', this.id);
  this.client
  .get('/streams/' + this.id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    self.merge(res.body);
    fn(null, self);
  });
};

/**
 * Save and invoke `fn(err)`
 *
 * Emits "error" events with `(err, item)` if an item
 * fails to properly save. The callback of this method
 * is _only_ invoked with an error related to creating
 * the stream itself.
 *
 * @param {Function} [fn]
 * @api public
 */

Stream.prototype.save = function(fn){
  var self = this;
  fn = fn || function(){};

  // new 
  if (this.isNew()) {
    this.client
    .post('/streams')
    .send({ title: this.title })
    .end(function(err, res){
      if (err) return fn(err);
      if (res.error) return fn(error(res));
      self.merge(res.body);
      debug('saving items for %s', self.id);
      self.emit('save');
      self.saveItems(function(err){
        debug('saved %s items', self._items.length);
        if (!err) self.emit('end');
        fn(err);
      });
    });
    return;
  }

  // update
  this.emit('save');
  this.saveItems(function(err){
    debug('saved %s items', self._items.length);
    if (!err) self.emit('end');
    fn(err);
  });
};
