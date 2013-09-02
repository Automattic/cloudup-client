
/**
 * This file illustrates how you can request
 * an oauth token for subsequent use.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  cloudupUrl: 'http://localhost:3000',
  user: 'tobi',
  pass: 'Dev1'
});

// pass your app id

client.requestToken('ah5Oa7F3hT8', function(err, tok){
  if (err) throw err;
  console.log('created token %s', tok);

  var client = new Cloudup({
    url: 'http://localhost:3030',
    token: tok
  });

  client.streams(function(err, streams){
    if (err) throw err;
    console.log('streams:');
    streams.forEach(function(stream){
      console.log('  - %s', stream.title);
    });
  });
});