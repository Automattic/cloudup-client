
/**
 * This file illustrates how you can
 * load collections and items using
 * their ids.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

var col = client.collection({ title: 'Files' });

var item = col
  .item({ title: 'Configuration' })
  .file('package.json')

console.log('saving');
col.save(function(){
  console.log('created %s', col._id);

  col = client.collection({ _id: col._id });
  col.load(function(){
    console.log('loaded %s', col.title);
    var item = col.item({ _id: col.items[0] });
    item.load(function(){
      console.log('item:');
      console.log(item);
    });
  });
});
