
var Cloudup = require('..')
  , assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Item', function(){
  describe('.save(fn)', function(){
    it('should emit "progress" events', function(done){
      var col = client.collection({ title: 'Files' });
      var item = col.item({ title: 'package' });
      item.file('package.json');
      item.on('progress', function(e){
        assert('number' == typeof e.remaining);
        assert('number' == typeof e.total);
        assert('number' == typeof e.sent);
        assert('number' == typeof e.percent);
        done();
      });
      col.save();
    })

    it('should emit "end"', function(done){
      var col = client.collection({ title: 'Files' });
      var item = col.item({ title: 'package' });
      item.file('package.json');
      item.on('end', done);
      col.save();
    })

    describe('when a file is given', function(){
      it('should create the item and upload the file', function(done){
        var col = client.collection({ title: 'Files' });
        var item = col.item({ title: 'package' });
        item.file('package.json');
        col.save(function(err){
          if (err) return done(err);
          assert(item._id);
          assert(item.remote);
          assert('complete' == item.state);
          done();
        });
      })

      it('should error when the file does not exist', function(done){
        var col = client.collection({ title: 'Files' });
        var item = col.item({ title: 'package' });
        item.file('does-not-exist');
        col.save(function(err){
          assert('ENOENT' == err.code);
          assert(err.path);
          done();
        });
      })

      it('should populate the generated .title', function(done){
        var col = client.collection({ title: 'Files' });
        var item = col.item().file('package.json');
        col.save(function(err){
          assert('Package' == item.title);
          done();
        });
      })
    })

    describe('when a url is given', function(){
      it('should create the item', function(done){
        var col = client.collection({ title: 'Bookmarks' });
        var item = col.item().url('http://yahoo.com');
        col.save(function(err){
          if (err) return done(err);
          assert(item._id);
          done();
        });
      })
    })
  })

  describe('.set(prop, val, fn)', function(){
    it('should update the item', function(done){
      var col = client.collection({ title: 'Bookmarks' });
      var item = col.item().file('package.json');
      col.save(function(err){
        if (err) return done(err);

        item.set('title', 'Some Bookmarks', function(err){
          if (err) return done(err);

          assert('Some Bookmarks' == item.title);
          item.load(function(err){
            if (err) return done(err);
            assert('Some Bookmarks' == item.title);
            done();
          });
        });
      });
    })
  })

  describe('.set(obj, fn)', function(){
    it('should update the item', function(done){
      var col = client.collection({ title: 'Bookmarks' });
      var item = col.item().file('package.json');
      col.save(function(err){
        if (err) return done(err);

        item.set({ title: 'Some Bookmarks' }, function(err){
          if (err) return done(err);

          assert('Some Bookmarks' == item.title);
          item.load(function(err){
            if (err) return done(err);
            assert('Some Bookmarks' == item.title);
            done();
          });
        });
      });
    })
  })

  describe('.load(fn)', function(){
    it('should load the item', function(done){
      var col = client.collection({ title: 'Bookmarks' });
      var item = col.item().url('http://yahoo.com');
      col.save(function(err){
        if (err) return done(err);
        item.load(function(err){
          if (err) return done(err);
          assert(item.created_at instanceof Date);
          assert(item.updated_at instanceof Date);
          done();
        });
      });
    })
  })

  describe('.remove(fn)', function(){
    it('should remove the item', function(done){
      var col = client.collection({ title: 'Cloudup client' });
      var item = col.item();
      item.file('lib/client.js');
      col.save(function(err){
        if (err) return done(err);
        item.remove(done);
      });
    })
  })
});
