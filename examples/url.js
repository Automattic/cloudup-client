
/**
 * This file illustrates how you can
 * save URLs as items.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

client
.collection({ title: 'Bookmarks' })
.url('http://ign.com')
.url('http://github.com')
.url('http://cuteoverload.com')
.save(function(err){
  if (err) throw err;
  console.log('created collection');
});
