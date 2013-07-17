
/**
 * This file illustrates how you can
 * load stream and items using
 * their ids.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'tobi',
  pass: 'Dev1'
});

var stream = client.stream({ title: 'Files' });

var item = stream
  .item({ title: 'Configuration' })
  .file('package.json')

stream.save(function(){
  stream = client.stream(stream.id);
  stream.load(function(){
    console.log('stream:');
    console.log(stream.toJSON());
    console.log('\n');
    var item = stream.item(stream.items[0]);
    item.load(function(){
      console.log('item:');
      console.log(item.toJSON());
    });
  });
});
