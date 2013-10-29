
/**
 * Module dependencies.
 */

var debug = require('debug')('cloudup-client:user');
var Emitter = require('events').EventEmitter;
var schema = require('./schemas/user');
var only = require('only');

/**
 * Expose `User`.
 */

module.exports = User;

/**
 * Public properties.
 */

var props = Object.keys(schema.properties);

/**
 * Initialize a new User.
 *
 * @param {Object} options
 * @api public
 */

function User(options) {
  if (!(this instanceof User)) return new User(options);
  this.merge(options || {});
}

/*!
 * Inherit from `Emitter.prototype`.
 */

User.prototype.__proto__ = Emitter.prototype;

/**
 * Return JSON representation.
 *
 * @return {Object}
 * @api public
 */

User.prototype.toJSON = function(){
  return only(this, props);
};

/**
 * Merge `obj`.
 *
 * @param {Object} obj
 * @api private
 */

User.prototype.merge = function(obj){
  for (var key in obj) this[key] = obj[key];
};

/**
 * Select avatar `size` when available
 * or return `undefined`.
 *
 * @param {String} size
 * @return {Object}
 * @api public
 */

User.prototype.avatarSize = function(size){
  return this.avatar.filter(function(a){
    return a.size.string == size;
  }).pop();
};