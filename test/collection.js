
var Cloudup = require('..');

describe('Collection', function(){
  describe('.item(options)', function(){
    it('should create a new Item', function(){
      var client = new Cloudup({
        url: 'http://local.cloudup.com'
      });

      var col = client.collection({ title: 'Something' });
      var item = col.item({ title: 'Some item' });
      item.constructor.name.should.equal('Item');
    })
  })
})
