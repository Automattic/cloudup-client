
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

client.registerApplication({ name: 'My app' }, function(err, app){
  if (err) throw err;
  
  console.log('created token %s', app.token);
  console.log('authenticating through %s', app.name);
  var client = new Cloudup({
    url: 'http://localhost:3030',
    fingerprint: app.fingerprint,
    token: app.token,
    user: 'tobi'
  });

  client.streams(function(err, streams){
    if (err) throw err;
    console.log('streams:');
    streams.forEach(function(stream){
      console.log('  - %s', stream.title);
    });
  });
});