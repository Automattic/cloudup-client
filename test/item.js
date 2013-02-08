
var Cloudup = require('..')
  , assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Item', function(){
  describe('.save(fn)', function(){
    describe('when a file is given', function(){
      it('should create the item and upload the file', function(done){
        var col = client.collection({ title: 'Files' });
        var item = col.item({ title: 'package' });
        item.file('package.json');
        col.save(function(err){
          if (err) return done(err);
          assert(item._id);
          done();
        });
      })
    })
  })

  describe('.remove(fn)', function(){
    it('should remove the item', function(done){
      var col = client.collection({ title: 'Cloudup client' });
      var item = col.item({ title: 'Something' });
      item.file('lib/client.js');
      col.save(function(err){
        if (err) return done(err);
        item.remove(done);
      });
    })
  })
});
