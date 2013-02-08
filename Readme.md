
# Cloudup

  Cloudup API client.

## Installation

```
$ npm install --save cloudup-client
```

## API

  - [Cloudup()](#cloudup)
  - [Cloudup.collection()](#cloudupcollectionoptionsobject)
  - [Cloudup.collections()](#cloudupcollectionsfnfunction)

  - [Collection()](#collection)
  - [Collection.prototype__proto__](#collectionprototype__proto__)
  - [Collection.item()](#collectionitemoptionsobject)
  - [Collection.file()](#collectionfileitemstring)
  - [Collection.toJSON()](#collectiontojson)
  - [Collection.remove()](#collectionremovefnfunction)
  - [Collection.save()](#collectionsavefnfunction)

  - [Item()](#item)
  - [Item.prototype__proto__](#itemprototype__proto__)
  - [Item.toJSON()](#itemtojson)
  - [Item.file()](#itemfilefilestring)
  - [Item.remove()](#itemremovefnfunction)
  - [Item.save()](#itemsavefnfunction)

## Cloudup()

  Initialize a new client with the given options:

```js
- `user` basic auth username
- `pass` basic auth password
- `url` cloudup url, used for testing only
```

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

## Collection.prototype__proto__

  Inherit from `Emitter.prototype`.

## Collection.item([options]:Object)

  Create a new item in this collection.

## Collection.file(item:String)

  Upload `file` as an item.

## Collection.toJSON()

  Return JSON representation.

## Collection.remove([fn]:Function)

  Remove and invoke `fn(err)`.

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

## Item.prototype__proto__

  Inherit from `Emitter.prototype`.

## Item.toJSON()

  Return JSON representation.

## Item.file(file:String)

  Queue `file` for uploading.

## Item.remove([fn]:Function)

  Remove and invoke `fn(err)`.

## Item.save(fn:Function)

  Create the remote item
  and upload the associated
  content, invoking `fn(err)`.

