
/**
 * This file illustrates how you can
 * upload several items to a collection
 * in parallel.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

var col = client.collection({ title: 'Animals' });

col.on('item', function(item){
  console.log('upload %s', item.title);
  item.on('progress', function(e){
    console.log('progress %s %d%', item.title, e.percent | 0);
  });
});

var a = col
  .item({ title: 'Maru 1' })
  .file('examples/files/maru-1.jpg')

var b = col
  .item({ title: 'Maru 2' })
  .file('examples/files/maru-2.jpg')

var c = col
  .item({ title: 'Maru 3' })
  .file('examples/files/maru-3.jpg')

col.on('save', function(){
  console.log('created http://local.cloudup.com/%s', col.uid);
});

col.save(function(){
  client.collections(function(err, cols){
    if (err) throw err;
    console.log('removing %s', cols[0].uid);
    cols[0].remove(function(err){
      if (err) throw err;
      console.log('removed');
    });
  });
});
