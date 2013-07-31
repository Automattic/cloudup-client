
/**
 * This file illustrates how you can
 * query streams.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  cloudupUrl: 'http://localhost:3000',
  user: 'tobi',
  pass: 'Dev1'
});

// all streams, all 'pages'

client.streams(function(err, streams){
  if (err) throw err;
  console.log(streams);
});

// all streams, all 'pages', matching a given title

client.streams({ title: 'Photos' }, function(err, streams){

});