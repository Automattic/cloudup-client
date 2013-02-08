
/**
 * This file illustrates how you can
 * upload several files to a collection
 * by referencing files only.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

client
.collection({ title: 'Cloudup API' })
.file('Makefile')
.file('package.json')
.file('lib/client.js')
.file('lib/collection.js')
.file('lib/error.js')
.file('lib/item.js')
.save(function(){
  console.log('upload complete');
});
