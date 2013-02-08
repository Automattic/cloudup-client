
var Cloudup = require('..')
  , assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Collection', function(){
  describe('.item(options)', function(){
    it('should create a new Item', function(){
      var col = client.collection({ title: 'Something' });
      var item = col.item({ title: 'Some item' });
      item.constructor.name.should.equal('Item');
    })
  })

  describe('.save(fn)', function(){
    it('should save the collection', function(done){
      var col = client.collection({ title: 'Ferrets' });
      col.save(function(err){
        if (err) return done(err);
        assert(col._id);
        assert(col.uid);
        done();
      });
    })

    it('should save the items', function(done){
      var col = client.collection({ title: 'Maru' });
      var a = col.item({ title: 'make' }).file('Makefile');
      var b = col.item({ title: 'conf' }).file('package.json');
      col.save(function(err){
        if (err) return done(err);
        assert(a._id);
        assert(b._id);
        done();
      });
    })
  })

  describe('.file(path)', function(){
    it('should upload the file as an item', function(done){
      client
      .collection({ title: 'Maru' })
      .file('Makefile')
      .file('package.json')
      .save(done);
    })
  })

  describe('.remove(fn)', function(){
    it('should remove the collection', function(done){
      var col = client.collection({ title: 'Ferrets' });
      col.save(function(err){
        if (err) return done(err);
        col.remove(done);
      });
    })
  })
})
