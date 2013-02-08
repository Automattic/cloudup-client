
var Cloudup = require('..')
  , assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Cloudup', function(){
  it('should work without new', function(){
    var client = Cloudup({
      url: 'http://localhost:3000',
      user: 'ewald',
      pass: 'Dev1'
    });

    assert(client.url);
    assert(client.user);
    assert(client.pass);
  })

  describe('.collection(options)', function(){
    it('should create a new Collection', function(){
      var col = client.collection({ title: 'Something' });
      col.constructor.name.should.equal('Collection');
    })
  })

  describe('.collections(fn)', function(){
    it('should respond with an array of collections', function(done){
      client
      .collection({ title: 'Animals' })
      .save(function(err){
        if (err) return done(err);
        client.collections(function(err, cols){
          if (err) return done(err);
          assert(Array.isArray(cols));
          var col = cols.shift();
          assert('Collection' == col.constructor.name);
          assert(col._id);
          assert(col.created_at);
          assert(col.updated_at);
          assert(col.title);
          assert('number' == typeof col.views);
          assert(Array.isArray(col.items));
          done();
        });
      });
    })
  })
})
