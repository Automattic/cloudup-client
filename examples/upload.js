
/**
 * This file illustrates how you can
 * upload several items to a stream
 * in parallel.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'tobi',
  pass: 'Dev1'
});

var stream = client.stream({ title: 'Animals' });

stream.on('item', function(item){
  console.log('upload %s', item.title);
  item.on('progress', function(e){
    console.log('progress %s %d%', item.title, e.percent | 0);
  });
});

stream
  .item({ title: 'Maru 1' })
  .file('examples/files/maru-1.jpg')

stream
  .item({ title: 'Maru 2' })
  .file('examples/files/maru-2.jpg')

stream
  .item({ title: 'Maru 3' })
  .file('examples/files/maru-3.jpg')

stream.on('save', function(){
  console.log('created http://local-cloudup.com/%s', stream.id);
});

stream.save(function(){
  client.streams(function(err, streams){
    if (err) throw err;
    console.log('done');
    console.log('removing %s', streams[0].id);
    streams[0].remove(function(err){
      if (err) throw err;
      console.log('removed');
    });
  });
});
