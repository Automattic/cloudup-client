
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

  - [Cloudup()](#cloudup)
    - [.collection()](#cloudupcollectionoptionsobject)
    - [.collections()](#cloudupcollectionsfnfunction)
  - [Collection()](#collection)
    - [.isNew()](#collectionisnew)
    - [.item()](#collectionitemoptionsobject)
    - [.file()](#collectionfilefilestring)
    - [.url()](#collectionurlurlstring)
    - [.toJSON()](#collectiontojson)
    - [.remove()](#collectionremovefnfunction)
    - [.load()](#collectionloadfnfunction)
    - [.save()](#collectionsavefnfunction)
  - [Item()](#item)
    - [.isNew()](#itemisnew)
    - [.toJSON()](#itemtojson)
    - [.set()](#itemset)
    - [.file()](#itemfilefilestring)
    - [.url()](#itemurlurlstring)
    - [.remove()](#itemremovefnfunction)
    - [.save()](#itemsavefnfunction)

## Cloudup

  Initialize a new client with the given options:

   - `user` basic auth username
   - `pass` basic auth password
   - `url` cloudup url, used for testing only

## Cloudup.collection(options:Object)

  Create a new collection.

## Cloudup.collections(fn:Function)

  Get an array of collections.

## Collection()

  Initialize a new Collection with the given options:

```js
- `title` optional collection title string
```

  Events:

```js
- `item` (item) when an item is added
```

  Examples:

```js
 client
 .collection({ title: 'Animals' })
 .file('path/to/maru-1.jpg')
 .file('path/to/maru-2.jpg')
 .url('http://farm5.static.flickr.com/4131/5001570832_c1341f609f.jpg')
 .save(function(err){
```


```js
 })
```

## Collection.isNew()

  Check if the collection is new.

## Collection.item([options]:Object)

  Create a new item in this collection.

```js
var item = client.item({ title: 'Maru the cat' })
```

## Collection.file(file:String)

  Upload `file` as an item.

```js
client
.collection({ title: 'Images' })
.file('maru 1.png')
.file('maru 2.png')
.file('maru 3.png')
```

## Collection.url(url:String)

  Upload `url` as an item.

```js
client
.collection({ title: 'Bookmarks' })
.url('http://ign.com')
.url('http://cuteoverload.com')
.url('http://uglyoverload.com')
```

## Collection.toJSON()

  Return JSON representation.

## Collection.remove([fn]:Function)

  Remove and invoke `fn(err)`.

## Collection.load(fn:Function)

  Load the collection and invoke `fn(err, col)`.

## Collection.save([fn]:Function)

  Save and invoke `fn(err)`

## Item()

  Initialize a new Item with the given options:

```js
- `title` optional Item title string
```

  Events:

```js
- `progress` (n) upload progress
```

## Item.isNew()

  Check if the collection is new.

## Item.toJSON()

  Return JSON representation.

## Item.set(obj:Object, [fn]:Function)

  Update item values with an object and optional callback `fn`.

```js
item.set('title', 'Something else');
```

## Item.set(prop:String, val:String, [fn]:Function)

  Update item `prop` to `val` with optional callback `fn`.

```js
item.set({
  title: 'Something else'
});
```

## Item.file(file:String)

  Queue `file` for uploading.

```js
 var col = client.collection({ title: 'Animals' })
 var item = col.item({ title: 'Simon' })
 item.file('path/to/simon.jpg')
 item.on('progress', function(n){
   console.log(n)
 });
```

## Item.url(url:String)

  Queue `url` for uploading.

```js
 var col = client.collection({ title: 'Bookmarks' })
 var item = col.item({ title: 'Ign' })
 item.file('http://ign.com')
```

## Item.remove([fn]:Function)

  Remove and invoke `fn(err)`.

## Item.save(fn:Function)

  Create the remote item
  and upload the associated
  content, invoking `fn(err)`.
