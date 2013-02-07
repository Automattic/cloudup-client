
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
        var col = client.collection({ title: 'Maru photos' });
        var item = col.item({ title: 'Maru 1' });
        item.file('test/fixtures/maru-1.jpg');
        col.save(function(err){
          if (err) return done(err);
          assert(item._id);
          done();
        });
      })
    })
  })
});
