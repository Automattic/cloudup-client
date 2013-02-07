
var Cloudup = require('..');

describe('Cloudup', function(){
  describe('.collection(options)', function(){
    it('should create a new Collection', function(){
      var client = new Cloudup({
        url: 'http://local.cloudup.com'
      });

      client
      .collection({ title: 'Something' })
      .constructor.name.should.equal('Collection');
    })
  })
})
