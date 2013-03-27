
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:item')
  , Emitter = require('events').EventEmitter
  , JSONStream = require('JSONStream')
  , throttle = require('throttleit')
  , dates = require('./dates')
  , error = require('./error')
  , only = require('only')
  , http = require('http')
  , mime = require('mime')
  , path = require('path')
  , url = require('url')
  , parse = url.parse
  , extname = path.extname
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
 * @param {Object} options
 * @api public
 */

function Item(options) {
  if (!options) throw new TypeError('item settings required');
  for (var key in options) this[key] = options[key];
  this.client = this.collection.client;
}

/*!
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
  return only(this, 'uid title filename updated_at created_at remote');
};

/**
 * Queue `file` for uploading.
 *
 *    var col = client.collection({ title: 'Animals' })
 *    var item = col.item({ title: 'Simon' })
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
 *    var col = client.collection({ title: 'Bookmarks' })
 *    var item = col.item({ title: 'Ign' })
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
 * Request signature and invoke `fn(err, url)`.
 *
 * @param {String} mime
 * @param {String} name
 * @param {Function} fn
 * @api private
 */

Item.prototype.sign = function(mime, name, fn){
  debug('sign');

  this.client
  .get('/sign/' + this.uid)
  .query({ mime: mime, name: name })
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    fn(null, res.text);
  });
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
  .patch('/files/' + this._id)
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

  debug('load %s', this._id);
  this.client
  .get('/files/' + this._id)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(error(res));
    var item = res.body;
    for (var key in item) self[key] = item[key];
    dates(self, 'created_at updated_at');
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
  var col = this.collection;

  this.client
  .post('/files/data/' + col._id)
  .send({ filename: path, mime: type })
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
 * has a .uid.
 *
 * @param {String} path
 * @param {Function} [fn]
 * @api private
 */

Item.prototype.thumb = function(path, fn){
  var self = this;
  var type = mime.lookup(path);
  var remote = this.uid + '.thumb' + extname(path);

  // noop
  fn = fn || function(err){
    if (err) debug('error %s', err.message)
  };

  debug('upload thumb %s %s', path, type);
  this.sign(type, remote, function(err, url){
    if (err) return fn(err);

    var len = size(path);
    var opts = parse(url);
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
      if (200 != s) return fn(new Error('got ' + s + ' response'));
      self.set('thumb', remote);
      fn();
    });

    // pipe
    fs.createReadStream(path)
    .on('error', fn)
    .pipe(req)
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
  var remote = this.remote = this.uid + extname(path);
  var type = this._mime;
  var prev;

  debug('upload %s', path);
  this.sign(type, remote, function(err, url){
    if (err) return fn(err);

    var len = size(path);
    var opts = parse(url);
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
      if (200 != s) return fn(new Error('got ' + s + ' response'));
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
  this.create(function(err){
    if (err) return fn(err);
    self.postFile(function(err){
      if (err) return fn(err);
      self.set({ complete: true, remote: self.remote }, fn);
      self.emit('end');
    });
  });
};

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
