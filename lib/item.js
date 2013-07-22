
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:item');
var Emitter = require('events').EventEmitter;
var JSONStream = require('JSONStream');
var throttle = require('throttleit');
var schema = require('./schemas/item');
var dates = require('./dates');
var error = require('./error');
var only = require('only');
var http = require('http');
var mime = require('mime');
var path = require('path');
var url = require('url');
var parse = url.parse;
var extname = path.extname;
var fs = require('fs');

/**
 * Expose `Item`.
 */

module.exports = Item;

/**
 * Public properties.
 */

var props = Object.keys(schema.properties);

/**
 * Max upload size.
 */

var maxSize = 209715200;

/**
 * Initialize a new Item with the given options:
 *
 *  - `title` optional Item title string
 *
 * @param {Object} options
 * @api public
 */

function Item(options) {
  if (!options) throw new TypeError('item settings required');
  for (var key in options) this[key] = options[key];
  this.client = this.stream.client;
}

/*!
 * Inherit from `Emitter.prototype`.
 */

Item.prototype.__proto__ = Emitter.prototype;

/**
 * Check if the stream is new.
 *
 * @return {Boolean}
 * @api public
 */

Item.prototype.isNew = function(){
  return !! this.id;
};

/**
 * Return JSON representation.
 *
 * @return {Object}
 * @api public
 */

Item.prototype.toJSON = function(){
  return only(this, props);
};

/**
 * Queue `file` for uploading.
 *
 *    var stream = client.stream({ title: 'Animals' })
 *    var item = stream.item({ title: 'Simon' })
 *    item.file('path/to/simon.jpg')
 *
 * @param {String} file
 * @return {Item} self
 * @api public
 */

Item.prototype.file = function(file){
  this._file = file;
  this._mime = mime.lookup(file);
  debug('queue file %s (%s)', file, this._mime);
  return this;
};

/**
 * Queue `url` for uploading.
 *
 *    var stream = client.stream({ title: 'Bookmarks' })
 *    var item = stream.item({ title: 'Ign' })
 *    item.file('http://ign.com')
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

  debug('remove %s', this.id);
  this.client
  .del('/items/' + this.id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn();
  });
};

/**
 * Set `prop`'s `val` with optional callback `fn`.
 *
 * @param {String|Object} prop or object
 * @param {String|Function} val or [fn]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

Item.prototype.set = function(prop, val, fn){
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
  return this.client
  .patch('/items/' + this.id)
  .send(obj)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn();
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

  debug('load %s', this.id);
  this.client
  .get('/items/' + this.id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    var item = res.body;
    for (var key in item) self[key] = item[key];
    dates(self, 'created_at updated_at completed_at progress_at');
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
  var type = this._mime;
  var path = this.filename || this._file;
  var stream = this.stream;

  this.client
  .post('/items')
  .send({ filename: path, mime: type, stream_id: stream.id })
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    var body = res.body;
    for (var key in body) self[key] = body[key];
    self.emit('save');
    fn(null, res.body);
  });
};

/**
 * Assign `path` as the thumbnail for this
 * item and upload. This __MUST__ be called
 * _after_ the item has been created and
 * has a .id.
 *
 * @param {String} path
 * @param {Function} [fn]
 * @api private
 */

Item.prototype.thumb = function(path, fn){
  var self = this;
  var type = mime.lookup(path);
  var jpg = type == 'image/jpeg';
  var png = type == 'image/png';
  var valid = jpg || png;
  var stream = this.stream;

  // default
  fn = fn || function(err){
    if (err) throw err;
  };

  // new
  if (this.isNew()) return fn(new Error('item must be saved before adding a thumb'));

  // format
  if (!valid) return fn(new Error('thumb must be a png or jpeg'));

  // select remote
  var remote = png
    ? this.signed_png_thumb_url
    : this.signed_jpg_thumb_url;

  debug('upload thumb %s %s', path, type);

  var len = size(path);
  var opts = parse(remote);
  opts.method = 'PUT';

  debug('PUT %s -> %s (%s)', path, remote, type);

  // header
  opts.headers = {
    'x-amz-acl': 'public-read',
    'Content-Length': len,
    'Content-Type': type
  };

  // request
  var req = http.request(opts, function(res){
    var s = res.statusCode;
    debug('%s response', s);
    if (200 != s) return fn(error(res));
    self.set('thumb_type', jpg ? 'jpg' : 'png');
    fn();
  });

  // pipe
  fs.createReadStream(path)
  .on('error', fn)
  .pipe(req)
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
  var stream = this.stream;
  var remote = this.remote = this.id + extname(path);
  var type = this._mime;
  var prev;

  debug('upload %s', path);

  var len = size(path);
  var opts = parse(this.signed_url);
  opts.method = 'PUT';
  opts.agent = false;
  debug('PUT %s -> %s (%s)', path, remote, type);

  // header
  opts.headers = {
    'x-amz-acl': 'public-read',
    'Content-Length': len,
    'Content-Type': type
  };

  // request
  var req = http.request(opts, function(res){
    var s = res.statusCode;
    debug('%s response', s);
    if (200 != s) return fn(error(res));
    fn();
  });

  // progress
  var bytes = 0;
  function progress(chunk) {
    bytes += chunk.length;
    var n = (bytes / len) * 100;

    self.emit('progress', {
      total: len,
      sent: bytes,
      remaining: len - bytes,
      percent: n
    });
  }

  function pubProgress() {
    if (prev && !prev.res) return;
    var n = (bytes / len) * 100;
    prev = self.set('progress', n);
  }

  // proxy for progress
  pubProgress = throttle(pubProgress, 250);
  var write = req.write;
  req.write = function(chunk){
    return write.call(this, chunk, function(){
      progress(chunk);
      pubProgress();
    });
  };

  // pipe
  fs.createReadStream(path)
  .on('error', fn)
  .pipe(req)
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
  var stream = this.stream;

  debug('url %s', url);
  this.client
  .post('/items/url')
  .send({ url: url, stream_id: stream.id })
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    self.id = res.body.id;
    fn();
    self.emit('end');
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

  var len = size(this._file);
  if (!len) return fn(enoent(this._file));
  if (len > maxSize) return fn(efbig(this._file));

  this.create(function(err){
    if (err) return fn(err);
    self.postFile(function(err){
      if (err) return fn(err);
      self.set({ complete: true }, fn);
      self.emit('end');
    });
  });
};

/**
 * Return EFBIG error for `path`.
 *
 * @param {String} path
 * @return {Error}
 * @api private
 */

function efbig(path) {
  var err = new Error('file "' + path + '" is too large');
  err.code = 'EFBIG';
  err.limit = maxSize;
  err.path = path;
  return err;
}

/**
 * Return ENOENT error for `path`.
 *
 * @param {String} path
 * @return {Error}
 * @api private
 */

function enoent(path) {
  var err = new Error('file "' + path + '" does not exist');
  err.code = 'ENOENT';
  err.path = path;
  return err;
}

/**
 * Return filesize.
 *
 * @param {String} path
 * @return {Number}
 * @api private
 */

function size(path) {
  try {
    return fs.statSync(path).size;
  } catch (err) {
    // ignore
  }
}
