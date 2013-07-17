
var Cloudup = require('..');
var assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3030',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Cloudup', function(){
  it('should work without new', function(){
    var client = Cloudup({
      url: 'http://localhost:3030',
      user: 'ewald',
      pass: 'Dev1'
    });

    assert(client.url);
    assert(client.user);
    assert(client.pass);
  })

  describe('.stream(id)', function(){
    it('should create a new Stream', function(){
      var stream = client.stream('123');
      assert(stream.id == '123');
    })
  })

  describe('.stream(options)', function(){
    it('should create a new Stream', function(){
      var stream = client.stream({ title: 'Something' });
      stream.constructor.name.should.equal('Stream');
    })
  })

  describe('.streams(fn)', function(){
    it('should respond with an array of streams', function(done){
      client
      .stream({ title: 'Animals' })
      .save(function(err){
        if (err) return done(err);
        client.streams(function(err, streams){
          if (err) return done(err);
          assert(Array.isArray(streams));
          var stream = streams.shift();
          assert('Stream' == stream.constructor.name);
          assert(stream.id);
          assert(stream.created_at);
          assert(stream.updated_at);
          assert(stream.title);
          assert(Array.isArray(stream.items));
          done();
        });
      });
    })
  })
})
