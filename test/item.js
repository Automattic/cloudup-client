
var Cloudup = require('..');
var fs = require('fs');
var assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Item', function(){
  describe('.thumb(path, [fn])', function(){
    it('should work', function(done){
      var stream = client.stream({ title: 'Files' });
      var item = stream.item({ title: 'package' });
      item.file('package.json');
      item.save(function(err){
        if (err) return done(err);
        item.thumb('examples/files/maru-1.jpg', done);
      });
    })

    it('should add dimensions', function(done){
      var stream = client.stream({ title: 'Files' });
      var item = stream.item({ title: 'Maru' });
      item.file('package.json');
      item.save(function(err){
        if (err) return done(err);

        item.thumb('examples/files/maru-2.jpg', function(){
          item.load(function(){
            assert(480 == item.thumb_width);
            assert(360 == item.thumb_height);
            done();
          });
        });
      });
    })

    it('should queue callback', function(done){
      var stream = client.stream({ title: 'Files' });
      var item = stream.item({ title: 'Maru' });
      item.file('package.json');

      item.thumb('examples/files/maru-2.jpg', function(){
        item.load(function(){
          assert(480 == item.thumb_width);
          assert(360 == item.thumb_height);
          done();
        });
      });

      item.save(function(){});
    })
  })

  describe('.save(fn)', function(){
    it('should emit "progress" events', function(done){
      var stream = client.stream({ title: 'Files' });
      var item = stream.item({ title: 'package' });
      item.file('package.json');
      item.once('progress', function(e){
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
      describe('and is an image', function(){
        it('should send dimensions', function(done){
          var stream = client.stream({ title: 'Files' });
          var item = stream.item({ title: 'Maru' });
          item.file('examples/files/maru-2.jpg');
          item.save(function(err){
            if (err) return done(err);
            assert(480 == item.width);
            assert(360 == item.height);
            done();
          });
        })
      })

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

      it('should allow overriding the .filename', function(done){
        var stream = client.stream({ title: 'Files' });
        var item = stream.item({ title: 'package', filename: 'pkg.json' });
        item.file('package.json');
        stream.save(function(err){
          if (err) return done(err);
          item = stream.item(item.id);
          item.load(function(){
            assert('pkg.json' == item.filename);
            done();
          });
        });
      })

      it('should "error" when the file is too large', function(done){
        var stream = client.stream({ title: 'Files' });
        var item = stream.item({ title: 'package' });
        var called = 0;

        var _ = fs.statSync;
        fs.statSync = function(path){
          return {
            size: 409715200
          }
        };
        
        item.file('package.json');

        stream.on('error', function(err){
          assert('EFBIG' == err.code);
          assert(209715200 == err.limit);
          assert(err.path);
          called++;
        });

        stream.save(function(err){
          if (err) return done(err);
          assert(1 == called);
          fs.statSync = _;
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
        var item = stream.item().link('http://yahoo.com');
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
      var item = stream.item().link('http://yahoo.com');
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
