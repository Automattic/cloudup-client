
var Cloudup = require('..');

describe('Cloudup', function(){
  describe('.collection(options)', function(){
    it('should create a new Collection', function(){
      var client = new Cloudup({
        url: 'http://localhost:3000'
      });

      var col = client.collection({ title: 'Something' });
      col.constructor.name.should.equal('Collection');
    })
  })
})
