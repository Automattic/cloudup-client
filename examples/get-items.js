
/**
 * This file illustrates how you can
 * query streams and then load items
 * within the stream.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  cloudupUrl: 'http://localhost:3000',
  user: 'tobi',
  pass: 'Dev1'
});

// load first page of streams

client.streams(function(err, streams){
  streams.forEach(function(stream){
    stream.items(function(err, items){
      console.log('  %s items:', stream.title);
      items.forEach(function(item){
        console.log('    - %s: %s', item.title, item.filename);
      });
    });
  });
});