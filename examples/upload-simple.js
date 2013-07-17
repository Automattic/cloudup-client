
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

client
.stream({ title: 'Cloudup API' })
.file('Makefile')
.file('package.json')
.file('lib/client.js')
.file('lib/stream.js')
.file('lib/error.js')
.file('lib/item.js')
.save(function(err){
  if (err) throw err;
  console.log('upload complete');
});
