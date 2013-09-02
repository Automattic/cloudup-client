
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
.link('http://ign.com')
.link('http://github.com')
.link('http://cuteoverload.com')
.save(function(err){
  if (err) throw err;
  console.log('created stream');
});
