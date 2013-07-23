
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:events');
var Emitter = require('events').EventEmitter;
var Newline = require('nlstream');
var dates = require('./dates');
var error = require('./error');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize a new Events manager with the given options:
 *
 *  - `id` events id
 *
 * @param {Object} options
 * @api public
 */

function Events(options) {
  options = options || {};
  for (var key in options) this[key] = options[key];
  this.on('event_id', this.onid.bind(this));
  this.client = this.client;
  this.queue = [];
  this.connect();
}

/*!
 * Inherit from `Emitter.prototype`.
 */

Events.prototype.__proto__ = Emitter.prototype;

/**
 * Handle event id.
 */

Events.prototype.onid = function(batch){
  debug('id %s', batch[0]);
  this.id = batch[0];
  this.flush();
  this.emit('connect');
};

/**
 * Subscribe to `id`.
 *
 * @param {String|Object} id
 * @api public
 */

Events.prototype.subscribe = function(id){
  id = id.id || id;
  debug('subscribe %s', id);
  if (!id) throw new Error('subscription id required');
  this.queue.push(['sub', id]);
  if (this.id) this.flush();
};

/**
 * Unsubscribe to `id`.
 *
 * @param {String|Object} id
 * @api public
 */

Events.prototype.unsubscribe = function(id){
  id = id.id || id;
  if (!id) throw new Error('subscription id required');
  debug('unsubscribe %s', id);
  this.queue.push(['unsub', id]);
  if (this.id) this.flush();
};

Events.prototype.error = function(err){
  this.emit('error', err);
};

Events.prototype.flush = function(){
  var self = this;
  debug('flush');

  this.queue.forEach(function(o){
    debug('flush %j', o);
    var method = 'sub' == o[0] ? 'post' : 'del';

    self
    .client
    [method]('/events/' + self.id + '/' + o[1])
    .end(function(err, res){
      if (err) return self.error(err);
      if (res.error) return self.error(res.error);
    });
  });
};

Events.prototype.connect = function(){
  var self = this;
  debug('connecting');
  
  this.client
  .get('/events')
  .buffer(false)
  .end(function(err, res){
    if (err) return self.error(err);
    if (res.error) return self.error(res.error);
    debug('connected');
    var stream = new Newline;
    res.pipe(stream);
    stream.on('data', function(o){
      var type = o.shift();
      self.emit(type, o);
      debug('emit %s %j', type, o);
    });
  });
};