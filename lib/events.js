
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

exports = module.exports = Events;

/**
 * Initialize a new Events manager with the given options:
 *
 *  - `id` events id
 *
 * Raw event batches are emitted with their associated
 * object's id as the key, for example:
 *
 * 51ef11f72dd223d10b000018 [[["set","title","Config"],["set","updated_at","2013-07-23T23:30:21.190Z"]]] +8s
 * 51ef11f72dd223d10b000018 [[["set","updated_at","2013-07-23T23:30:21.198Z"],["push","items","iuuQQi4LuAI"]]] +6ms
 * 51ef11f72dd223d10b000018 [[["set","updated_at","2013-07-23T23:30:21.326Z"]]] +125ms
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
  if (this.id) this.flush()
  else this.connect();
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
  if (this.id) this.flush()
  else this.connect();
};

/**
 * Emit `err`.
 *
 * @param {Error} err
 * @api private
 */

Events.prototype.error = function(err){
  this.emit('error', err);
};

/**
 * Flush pending subscriptions.
 *
 * @api private
 */

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

/**
 * Attempt to connect event stream.
 *
 * @api private
 */

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

/**
 * Events singleton.
 */

var events;

/**
 * Mixin event support to `obj`.
 *
 * @param {Object} obj
 * @api private
 */

exports.mixin = function(obj){
  function onevent() {
    console.log(arguments);
  }

  obj.subscribe = function(){
    events = events || new Events({ client: this.client });
    events.subscribe(this.id);
    events.on(this.id, onevent);
  };

  obj.unsubscribe = function(){
    if (!events) return;
    events.unsubscribe(this.id);
    events.removeListener(this.id, onevent);
  };
};