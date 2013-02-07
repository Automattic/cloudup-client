
/**
 * Return an Error for `res`.
 *
 * @param {Response} res
 * @return {Error}
 * @api private
 */

module.exports = function(res){
  return new Error(res.status + ': ' + res.text);
};
