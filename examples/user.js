
/**
 * This file shows how you can fetch
 * the authenticated user's information.
 */

var Cloudup = require('..');
var fs = require('fs');

var client = new Cloudup({
  url: 'http://localhost:3030',
  cloudupUrl: 'http://localhost:3000',
  user: 'tobi',
  pass: 'Dev1'
});

client.user(function(err, user){
  if (err) throw err;
  console.log(user);
  console.log(user.avatarSize('300x300').url);
});