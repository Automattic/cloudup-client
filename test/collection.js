
var Cloudup = require('..');

var client = new Cloudup({
  url: 'http://localhost:3000',
  token: 'h1YXjGq3mru91ArPAAAD'
});

describe('Collection', function(){
  describe('.item(options)', function(){
    it('should create a new Item', function(){
      var col = client.collection({ title: 'Something' });
      var item = col.item({ title: 'Some item' });
      item.constructor.name.should.equal('Item');
    })
  })

  describe('.save(fn)', function(){
    it('should save the collection', function(done){
      var col = client.collection({ title: 'Ferrets' });
      col.save(done);
    })
  })
})
