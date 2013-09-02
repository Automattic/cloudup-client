
var Cloudup = require('..');
var assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Stream', function(){
  it('should emit "end"', function(done){
    var stream = client.stream({ title: 'Something' });
    stream.on('end', done);
    stream.save();
  })

  describe('.item(id)', function(){
    it('should create a new Item', function(){
      var stream = client.stream('123');
      assert(stream.id == '123');
    })
  })

  describe('.item(options)', function(){
    it('should create a new Item', function(){
      var stream = client.stream({ title: 'Something' });
      var item = stream.item({ title: 'Some item' });
      item.constructor.name.should.equal('Item');
    })
  })

  describe('.set(prop, val, fn)', function(){
    it('should update the item', function(done){
      var stream = client.stream({ title: 'Bookmarks' });
      stream.save(function(err){
        if (err) return done(err);

        stream.set('title', 'Some Bookmarks', function(err){
          if (err) return done(err);

          assert('Some Bookmarks' == stream.title);
          stream.load(function(err){
            if (err) return done(err);
            assert('Some Bookmarks' == stream.title);
            done();
          });
        });
      });
    })
  })

  describe('.set(obj, fn)', function(){
    it('should update the item', function(done){
      var stream = client.stream({ title: 'Bookmarks' });
      stream.save(function(err){
        if (err) return done(err);

        stream.set({ title: 'Some Bookmarks' }, function(err){
          if (err) return done(err);

          assert('Some Bookmarks' == stream.title);
          stream.load(function(err){
            if (err) return done(err);
            assert('Some Bookmarks' == stream.title);
            done();
          });
        });
      });
    })
  })

  describe('.save(fn)', function(){
    it('should save the stream', function(done){
      var stream = client.stream({ title: 'Ferrets' });
      stream.save(function(err){
        if (err) return done(err);
        assert(stream.id);
        done();
      });
    })

    it('should save the items', function(done){
      var stream = client.stream({ title: 'Maru' });
      var a = stream.item({ title: 'make' }).file('Makefile');
      var b = stream.item({ title: 'conf' }).file('package.json');
      stream.save(function(err){
        if (err) return done(err);
        assert(a.id);
        assert(b.id);
        done();
      });
    })
  })

  describe('.file(path)', function(){
    it('should upload the file as an item', function(done){
      client
      .stream({ title: 'Maru' })
      .file('Makefile')
      .file('package.json')
      .save(done);
    })
  })

  describe('.item(url)', function(){
    it('should create a url item', function(done){
      client
      .stream({ title: 'Bookmarks' })
      .link('http://yahoo.com')
      .save(done);
    })
  })

  describe('.load(fn)', function(){
    it('should load the stream', function(done){
      var stream = client.stream({ title: 'Bookmarks' });

      stream.save(function(err){
        if (err) return done(err);
        stream.load(function(err){
          if (err) return done(err);
          assert(stream.created_at instanceof Date);
          assert(stream.updated_at instanceof Date);
          done();
        });
      });
    })
  })

  describe('.remove(fn)', function(){
    it('should remove the stream', function(done){
      var stream = client.stream({ title: 'Ferrets' });
      stream.save(function(err){
        if (err) return done(err);
        stream.remove(done);
      });
    })
  })
})
