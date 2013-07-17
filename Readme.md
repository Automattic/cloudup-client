
# Cloudup

  Cloudup API client.

## Installation

```
$ npm install --save cloudup-client
```

## Links

  - [examples](https://github.com/LearnBoost/cloudup-client/tree/master/examples)

## Example

```js
var Cloudup = require('cloudup-client');

var client = Cloudup({
  url: 'http://localhost:3000',
  user: 'ewald',
  pass: 'Dev1'
});

client
.collection({ title: 'Cloudup API' })
.file('Makefile')
.file('package.json')
.file('lib/client.js')
.file('lib/collection.js')
.file('lib/error.js')
.file('lib/item.js')
.save(function(){
  console.log('upload complete');
});
```

## API

### Cloudup()

  Initialize a new client with the given options:
  
   - `user` basic auth username
   - `pass` basic auth password
   - `url` cloudup api url, used for testing only

#### Cloudup.stream(options:Object|String)

  Create a new stream.

#### Cloudup.streams(fn:Function)

  Get an array of streams.

### Stream()

  Initialize a new Stream with the given options:
  
- `title` optional Stream title string
  
  Events:
  
- `item` (item) when an item is added
- `save` Stream saved
- `end` item uploads complete

  
  Examples:
  
```js
 client
 .stream({ title: 'Animals' })
 .file('path/to/maru-1.jpg')
 .file('path/to/maru-2.jpg')
 .url('http://farm5.static.flickr.com/4131/5001570832_c1341f609f.jpg')
 .save(function(err){

 })
```

#### Stream.isNew()

  Check if the stream is new.

#### Stream.set(prop:String|Object, val:String|Function, [fn]:Function)

  Set `prop`'s `val` with optional callback `fn`.

#### Stream.item([options:Object|String)

  Create a new item in this stream.
  
```js
var item = client.item({ title: 'Maru the cat' })
```

#### Stream.file(file:String)

  Upload `file` as an item.
  
```js
client
.stream({ title: 'Images' })
.file('maru 1.png')
.file('maru 2.png')
.file('maru 3.png')
```

#### Stream.url(url:String)

  Upload `url` as an item.
  
```js
client
.stream({ title: 'Bookmarks' })
.url('http://ign.com')
.url('http://cuteoverload.com')
.url('http://uglyoverload.com')
```

#### Stream.toJSON()

  Return JSON representation.

#### Stream.concurrency(n:Number)

  Upload concurrency.

#### Stream.remove([fn]:Function)

  Remove and invoke `fn(err)`.

#### Stream.load(fn:Function)

  Load the stream and invoke `fn(err, stream)`.

#### Stream.save([fn]:Function)

  Save and invoke `fn(err)`
  
  Emits "error" events with `(err, item)` if an item
  fails to properly save. The callback of this method
  is _only_ invoked with an error related to creating
  the stream itself.
  - [props](#props)
  - [Item()](#item)
  - [Item.isNew()](#itemisnew)
  - [Item.toJSON()](#itemtojson)
  - [Item.file()](#itemfilefilestring)
  - [Item.url()](#itemurlurlstring)
  - [Item.remove()](#itemremovefnfunction)
  - [Item.set()](#itemsetpropstringobjectvalstringfunctionfnfunction)
  - [Item.save()](#itemsavefnfunction)

### Item()

  Initialize a new Item with the given options:
  
 - `title` optional Item title string

#### Item.isNew()

  Check if the stream is new.

#### Item.toJSON()

  Return JSON representation.

#### Item.file(file:String)

  Queue `file` for uploading.
  
```js
 var stream = client.stream({ title: 'Animals' })
 var item = stream.item({ title: 'Simon' })
 item.file('path/to/simon.jpg')
```

#### Item.url(url:String)

  Queue `url` for uploading.
  
```js
 var stream = client.stream({ title: 'Bookmarks' })
 var item = stream.item({ title: 'Ign' })
 item.file('http://ign.com')
```

#### Item.remove([fn]:Function)

  Remove and invoke `fn(err)`.

#### Item.set(prop:String|Object, val:String|Function, [fn]:Function)

  Set `prop`'s `val` with optional callback `fn`.

#### Item.save(fn:Function)

  Create the remote item
  and upload the associated
  content, invoking `fn(err)`.
