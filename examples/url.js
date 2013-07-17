
/**
 * This file illustrates how you can
 * save URLs as items.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'tobi',
  pass: 'Dev1'
});

client
.stream({ title: 'Bookmarks' })
.url('http://ign.com')
.url('http://github.com')
.url('http://cuteoverload.com')
.save(function(err){
  if (err) throw err;
  console.log('created stream');
});
