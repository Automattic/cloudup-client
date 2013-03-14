
var Cloudup = require('..')
  , assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Collection', function(){
  it('should emit "end"', function(done){
    var col = client.collection({ title: 'Something' });
    col.on('end', done);
    col.save();
  })

  describe('.item(options)', function(){
    it('should create a new Item', function(){
      var col = client.collection({ title: 'Something' });
      var item = col.item({ title: 'Some item' });
      item.constructor.name.should.equal('Item');
    })
  })

  describe('.set(prop, val, fn)', function(){
    it('should update the item', function(done){
      var col = client.collection({ title: 'Bookmarks' });
      col.save(function(err){
        if (err) return done(err);

        col.set('title', 'Some Bookmarks', function(err){
          if (err) return done(err);

          assert('Some Bookmarks' == col.title);
          col.load(function(err){
            if (err) return done(err);
            assert('Some Bookmarks' == col.title);
            done();
          });
        });
      });
    })
  })

  describe('.set(obj, fn)', function(){
    it('should update the item', function(done){
      var col = client.collection({ title: 'Bookmarks' });
      col.save(function(err){
        if (err) return done(err);

        col.set({ title: 'Some Bookmarks' }, function(err){
          if (err) return done(err);

          assert('Some Bookmarks' == col.title);
          col.load(function(err){
            if (err) return done(err);
            assert('Some Bookmarks' == col.title);
            done();
          });
        });
      });
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

  describe('.item(url)', function(){
    it('should create a url item', function(done){
      client
      .collection({ title: 'Bookmarks' })
      .url('http://yahoo.com')
      .save(done);
    })
  })

  describe('.load(fn)', function(){
    it('should load the collection', function(done){
      var col = client
      .collection({ title: 'Bookmarks' })
      .url('http://yahoo.com');

      col.save(function(err){
        if (err) return done(err);
        col.load(function(err){
          if (err) return done(err);
          assert(col.created_at instanceof Date);
          assert(col.updated_at instanceof Date);
          done();
        });
      });
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
