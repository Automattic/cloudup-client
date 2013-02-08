
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:item')
  , Emitter = require('events').EventEmitter
  , hydrateDates = require('./hydrate-dates')
  , JSONStream = require('JSONStream')
  , error = require('./error')
  , fs = require('fs');

/**
 * Expose `Item`.
 */

module.exports = Item;

/**
 * Initialize a new Item with the given options:
 *
 *   - `title` optional Item title string
 *
 * Events:
 *
 *   - `progress` (n) upload progress
 *
 * @param {Object} options
 * @api public
 */

function Item(options) {
  if (!options) throw new TypeError('item settings required');
  for (var key in options) this[key] = options[key];
  this.client = this.collection.client;
}

/**
 * Inherit from `Emitter.prototype`.
 */

Item.prototype.__proto__ = Emitter.prototype;

/**
 * Check if the collection is new.
 *
 * @return {Boolean}
 * @api public
 */

Item.prototype.isNew = function(){
  return !! this._id;
};

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

/**
 * Queue `file` for uploading.
 *
 * @param {String} file
 * @return {Item} self
 * @api public
 */

Item.prototype.file = function(file){
  debug('queue file %s', file);
  this._file = file;
  return this;
};

/**
 * Queue `url` for uploading.
 *
 * @param {String} url
 * @return {Item} self
 * @api public
 */

Item.prototype.url = function(url){
  debug('queue url %s', url);
  this._url = url;
  return this;
};

/**
 * Remove and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

Item.prototype.remove = function(fn){
  var self = this;
  fn = fn || function(){};

  debug('remove %s', this._id);
  this.client
  .del('/files/' + this._id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn();
  });
};

/**
 * Track upload progress.
 *
 * @api private
 */

Item.prototype.trackProgress = function(){
  var self = this;
  // TODO: only GET when we have progress listeners
  this.client
  .get('/files/' + this._id + '/progress')
  .buffer(false)
  .end(function(res){
    var json = JSONStream.parse([true]);
    res.pipe(json);
    json.on('data', function(n){
      self.emit('progress', n);
    });
  });
};

/**
 * Load the item and invoke `fn(err, item)`.
 *
 * @param {Function} fn
 * @api private
 */

Item.prototype.load = function(fn){
  var self = this;

  debug('load %s', this._id);
  this.client
  .get('/files/' + this._id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    var item = res.body;
    for (var key in item) self[key] = item[key];
    hydrateDates(self, 'created_at updated_at');
    fn(null, self);
  });
};

/**
 * Create the item and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Item.prototype.create = function(fn){
  var self = this;
  var path = this._file;
  var col = this.collection;

  this.client
  .post('/files/data/' + col._id)
  .send({ filename: path })
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    self._id = res.body._id;
    fn(null, res.body);
  });
};

/**
 * POST the item's file and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Item.prototype.postFile = function(fn){
  var self = this;
  var path = this._file;
  var col = this.collection;

  this.trackProgress();

  debug('upload %s', path);
  this.client
  .post('/files/' + this._id)
  .attach('file', path)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn();
  });
};

/**
 * POST the item's url and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Item.prototype.postURL = function(fn){
  var self = this;
  var url = this._url;
  var col = this.collection;

  debug('url %s', url);
  this.client
  .post('/files/url/' + col._id)
  .send({ url: url })
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    self._id = res.body._id;
    fn();
  });
};

/**
 * Create the remote item
 * and upload the associated
 * content, invoking `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

Item.prototype.save = function(fn){
  var self = this;
  if (this._url) return this.postURL(fn);
  this.create(function(err){
    if (err) return fn(err);
    self.postFile(fn);
  });
};
