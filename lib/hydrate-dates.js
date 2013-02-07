
module.exports = function(arr, props){
  props = props.split(' ');

  arr.forEach(function(obj){
    props.forEach(function(prop){
      obj[prop] = new Date(obj[prop]);
    })
  });

  return arr;
}
