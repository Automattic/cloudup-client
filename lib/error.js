
/**
 * Return an Error for `res`.
 *
 * @param {Response} res
 * @return {Error}
 * @api private
 */

module.exports = function(res){
  var req = res.req;
  var url = res.req.path;
  return new Error(res.status + ': ' + res.text + ' (' + req.method + ' ' + req.path + ')');
};
