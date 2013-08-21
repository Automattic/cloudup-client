
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:item');
var Emitter = require('events').EventEmitter;
var JSONStream = require('JSONStream');
var throttle = require('throttleit');
var schema = require('./schemas/item');
var FormData = require('form-data');
var dates = require('./dates');
var error = require('./error');
var only = require('only');
var http = require('http');
var mime = require('mime');
var path = require('path');
var url = require('url');
var basename = path.basename;
var extname = path.extname;
var parse = url.parse;
var fs = require('fs');
var noop = function(){};

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
  if (!(this instanceof Item)) return new Item(options);
  if (!options) throw new TypeError('item settings required');
  this.merge(options);
  if (this.id) this.url = this.url || 'https://cloudup.com/' + this.id;
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
  return !this.id;
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
 *    item.link('http://ign.com')
 *
 * @param {String} url
 * @return {Item} self
 * @api public
 */

Item.prototype.link = function(url){
  debug('queue url %s', url);
  this._url = url;
  return this;
};

/**
 * Merge `obj`.
 *
 * @param {Object} obj
 * @api private
 */

Item.prototype.merge = function(obj){
  for (var key in obj) this[key] = obj[key];
  dates(this, 'created_at updated_at completed_at progress_at');
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
    self.merge(res.body);
    fn(null, self);
  });
};

/**
 * Create the item and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Item.prototype.create = function(len, fn){
  var self = this;
  var type = this._mime;
  var path = this.filename || this._file;
  var stream = this.stream;

  this.client
  .post('/items')
  .send({ filename: path, mime: type, size: len, stream_id: stream.id })
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    if (self._thumb) self.thumb(self._thumb, noop);
    self.merge(res.body);
    self.emit('save');
    fn(null, res.body);
  });
};

/**
 * Return a new `FormData` instance.
 *
 * @param {String} key
 * @return {FormData}
 * @api private
 */

Item.prototype.form = function(key){
  var form = new FormData;
  form.append('key', key || this.s3_key);
  form.append('AWSAccessKeyId', this.s3_access_key);
  form.append('acl', 'public-read');
  form.append('policy', this.s3_policy);
  form.append('signature', this.s3_signature);
  return form;
};

/**
 * Assign `path` as the thumbnail for this
 * item and upload. This __MUST__ be called
 * _after_ the item has been created and
 * has a .id in order for the callback to be invoked.
 *
 * If `fn` is omitted then the thumb is queued for
 * the next `.save()`, and any error will be ignored.
 *
 * TODO: support buffers
 * TODO: support streams
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

  // format
  if (!valid) return fn(new Error('thumb must be a png or jpeg'));

  // queued
  if (!fn) return this._thumb = path;

  // new
  if (this.isNew()) return fn(new Error('item must be saved before adding a thumb'));

  var key = this.s3_key + '-thumb' + extname(path);
  debug('upload thumb %s %s as %s', path, type, key);

  var form = this.form(key);
  var len = size(path);
  var file = fs.createReadStream(path);

  form.append('Content-Type', type);
  form.append('Content-Length', len);
  form.append('file', file);
  submit(form, this.s3_url, function(err){
    if (err) return fn(err);
    self.set({ thumb: key }, fn);
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
  var stream = this.stream;
  var remote = this.remote = this.id + extname(path);
  var type = this._mime;
  var len = size(path);
  var file = fs.createReadStream(path);
  var prev;

  debug('upload %s', path);

  var form = this.form();
  form.append('Content-Type', type);
  form.append('Content-Length', len);
  form.append('file', file);

  submit(form, this.s3_url, function(err, res){
    if (err) return fn(err);
    var s = res.statusCode;
    var t = res.statusCode / 100 | 0;
    if (2 == t) return fn();
    var buf = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){ buf += chunk });
    res.on('end', function(){
      var err = new Error('got ' + s + ' response: ' + buf)
      fn(err);      
    });
  });

  var bytes = 0;
  form.on('progress', function(chunk, total){
    bytes += chunk.length;
    var n = (bytes / total) * 100;

    self.emit('progress', {
      total: total,
      sent: bytes,
      remaining: total - bytes,
      percent: n
    });

    pubProgress(n);
  });

  function pubProgress(n) {
    if (prev && !prev.res) return;
    prev = self.set('progress', n);
  }

  pubProgress = throttle(pubProgress, 250);
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
    self.merge(res.body);
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

  this.create(len, function(err){
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

// FIX: https://github.com/felixge/node-form-data/issues/47

function submit(form, url, fn) {
  form.getLength(function(err, len){
    if (err) return fn(err);

    var opts = parse(url);

    opts.method = 'post';
    opts.headers = form.getHeaders({ 'Content-Length': len });

    var req = http.request(opts);

    var write = req.write;
    req.write = function(chunk){
      return write.call(this, chunk, function(){
        form.emit('progress', chunk, len);
      });
    };

    form.pipe(req);
    
    req.on('error', fn);
    
    req.on('response', function(res){
      fn(null, res);
    });
  });
}
