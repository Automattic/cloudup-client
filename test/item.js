
var Cloudup = require('..');
var assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Item', function(){
  describe('.save(fn)', function(){
    it('should emit "progress" events', function(done){
      var stream = client.stream({ title: 'Files' });
      var item = stream.item({ title: 'package' });
      item.file('package.json');
      item.on('progress', function(e){
        assert('number' == typeof e.remaining);
        assert('number' == typeof e.total);
        assert('number' == typeof e.sent);
        assert('number' == typeof e.percent);
        done();
      });
      stream.save();
    })

    it('should emit "end"', function(done){
      var stream = client.stream({ title: 'Files' });
      var item = stream.item({ title: 'package' });
      item.file('package.json');
      item.on('end', done);
      stream.save();
    })

    describe('when a file is given', function(){
      it('should create the item and upload the file', function(done){
        var stream = client.stream({ title: 'Files' });
        var item = stream.item({ title: 'package' });
        item.file('package.json');
        stream.save(function(err){
          if (err) return done(err);
          assert(item.id);
          assert(item.remote);
          assert(item.complete);
          done();
        });
      })

      it('should "error" when the file does not exist', function(done){
        var stream = client.stream({ title: 'Files' });
        var item = stream.item({ title: 'package' });
        var called = 0;
        
        item.file('does-not-exist');

        stream.on('error', function(err){
          assert('ENOENT' == err.code);
          assert(err.path);
          called++;
        });

        stream.save(function(err){
          if (err) return done(err);
          assert(1 == called);
          done();
        });
      })

      it('should populate the generated .title', function(done){
        var stream = client.stream({ title: 'Files' });
        var item = stream.item().file('package.json');
        stream.save(function(err){
          assert('Package' == item.title);
          done();
        });
      })
    })

    describe('when a url is given', function(){
      it('should create the item', function(done){
        var stream = client.stream({ title: 'Bookmarks' });
        var item = stream.item().url('http://yahoo.com');
        stream.save(function(err){
          if (err) return done(err);
          assert(item.id);
          done();
        });
      })
    })
  })

  describe('.set(prop, val, fn)', function(){
    it('should update the item', function(done){
      var stream = client.stream({ title: 'Bookmarks' });
      var item = stream.item().file('package.json');
      stream.save(function(err){
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
      var stream = client.stream({ title: 'Bookmarks' });
      var item = stream.item().file('package.json');
      stream.save(function(err){
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
      var stream = client.stream({ title: 'Bookmarks' });
      var item = stream.item().url('http://yahoo.com');
      stream.save(function(err){
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
      var stream = client.stream({ title: 'Cloudup client' });
      var item = stream.item();
      item.file('lib/client.js');
      stream.save(function(err){
        if (err) return done(err);
        item.remove(done);
      });
    })
  })
});
