
var Cloudup = require('..')
  , assert = require('better-assert');

var client = new Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

describe('Cloudup', function(){
  describe('.collection(options)', function(){
    it('should create a new Collection', function(){
      var col = client.collection({ title: 'Something' });
      col.constructor.name.should.equal('Collection');
    })
  })

  describe('.collections(fn)', function(){
    it('should respond with an array of collections', function(done){
      client.collections(function(err, cols){
        if (err) return done(err);
        assert(Array.isArray(cols));
        done();
      });
    })
  })
})
