
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
.stream({ title: 'Cloudup API' })
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

```js
var stream = client.stream({ title: 'Photos' });
```

  Or load an existing stream with its `.id`:

```js
var stream = client.stream('cyswccQQZkw');
stream.load(function(){
  console.log(stream);
});
```

#### Cloudup.streams(fn:Function)

  Get an array of streams.

#### Cloudup.streams(options, fn:Function)

  Get an array of streams with the given `options`:

  - `title` filter by title

### Stream()

  Initialize a new Stream with the given options:
  
- `title` optional Stream title string
  
```js
 client
 .stream({ title: 'Animals' })
 .file('path/to/maru-1.jpg')
 .file('path/to/maru-2.jpg')
 .link('http://farm5.static.flickr.com/4131/5001570832_c1341f609f.jpg')
 .save(function(err){

 })
```

#### Events:
  
- `item` (item) when an item is added
- `save` Stream saved
- `end` item uploads complete

#### Stream.isNew()

  Check if the stream is new.

#### Stream.set(prop:String|Object, val:String|Function, [fn]:Function)

  Set `prop`'s `val` with optional callback `fn`.

#### Stream.item([options:Object|String)

  Create a new item in this stream.
  
```js
var item = stream.item({ title: 'Maru the cat' })
```

  Or load an existing item with its `.id`:

```js
var item = stream.item('iyswccQQZkw');
item.load(function(){
  console.log(item);
});
```

#### Stream.file(file:String, [options:Object])

  Upload `file` as an item.
  
```js
client
.stream({ title: 'Images' })
.file('maru 1.png', { filename: 'Maru.png', })
.file('maru 2.png', { title: 'Awesome Maru' })
.file('maru 3.png')
```

#### Stream.link(url:String, [options:Object])

  Upload `url` as an item.
  
```js
client
.stream({ title: 'Bookmarks' })
.link('http://ign.com', { title: 'IGN' })
.link('http://cuteoverload.com')
.link('http://uglyoverload.com')
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

#### Item.link(url:String)

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

