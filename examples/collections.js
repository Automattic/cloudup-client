
var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

var col = client.collection({ title: 'Animals' });

var a = col
  .item({ title: 'Maru 1' })
  .file('examples/files/maru-1.jpg')

var b = col
  .item({ title: 'Maru 2' })
  .file('examples/files/maru-2.jpg')

var c = col
  .item({ title: 'Maru 3' })
  .file('examples/files/maru-3.jpg')

col.save(function(){
  client.collections(function(err, cols){
    if (err) throw err;
    console.log(cols);
  });
});
