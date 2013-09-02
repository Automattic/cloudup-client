
/**
 * Hydrate date `props` in `obj`.
 *
 * @param {Object} obj
 * @param {Array} props
 * @api private
 */

module.exports = function(obj, props){
  props = props.split(' ');
  props.forEach(function(prop){
    obj[prop] = new Date(obj[prop]);
  });
};
