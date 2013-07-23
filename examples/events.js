
/**
 * This file illustrates how you can
 * upload several files to a stream
 * by referencing files only.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'tobi',
  pass: 'Dev1'
});

var events = client.events();

var stream = client.stream('cNBjUb1Z6Eo');
stream.subscribe();

stream.on('op', function(type, key, val){
  console.log('%s %s %s', type, key, val);
});

stream.on('set', function(key, val){
  console.log('set %s to %s', key, val);
});

stream.on('title', function(str){
  console.log('set title to "%s"', str);
});

//var photos = client.stream({ title: 'Maru' });
//
//photos.save(function(err){
//  if (err) throw err;
//
//  console.log('created %s', photos.id);
//  events.subscribe(photos);
//
//  events.on('connect', function(){
//    console.log('subscribed to events');
//
//    photos
//    .file('examples/files/maru-1.jpg')
//    .file('examples/files/maru-2.jpg')
//    .file('examples/files/maru-3.jpg');
//
//    photos.save(function(err){
//      if (err) throw err;
//      console.log('saved');
//    });
//  });
//});
