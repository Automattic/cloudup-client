
var Cloudup = require('..');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

client.collections(function(err, cols){
  if (err) throw err;
  console.log(cols);
});
