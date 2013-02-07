
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:item')
  , Emitter = require('events').EventEmitter
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
  this._file = file;
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
 * Create the file and invoke `fn(err)`.
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
 * Upload the item's file and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Item.prototype.upload = function(fn){
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
 * Create the remote item
 * and upload the associated
 * content, invoking `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

Item.prototype.save = function(fn){
  var self = this;
  this.create(function(err){
    if (err) return fn(err);
    self.upload(fn);
  });
};
