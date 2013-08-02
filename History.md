
0.5.0 / 2013-08-02 
==================

 * add `Stream#items(fn)`
 * add oauth token support
 * add support for passing options to `.link()`
 * add new item.thumb() implementation based on pre-signed urls
 * add support for passing options to `.file()`
 * add .useragent option
 * add capping of filesize. Closes #25
 * add .streams(options, fn) support
 * rename .url() to .link() to avoid prop collision
 * change ._id -> .id
 * fix clobbering of .url from api

0.4.0 / 2013-03-28 
==================

  * add saving of .mime
  * add Item#thumb(file)
  * disable http agent
  * dont pub progress when in-flight
  * use throttle() to pub every 250ms. Closes #16

0.3.1 / 2013-03-25
==================

  * change .state to .complete

0.3.0 / 2013-03-15
==================

  * fix in-flight progress PATCH requests from clobbering each other. Closes #14
  * fix progress reporting

0.2.0 / 2013-03-15
==================

  * add Item "save" event
  * add Item "end" event
  * add .filename support to Item#create()
  * add Collection "end" event test
  * add Collection "save" event
  * add Collection "end" event
  * improve .toJSON() methods
  * change concurrency to 8
  * remove "item uploaded" event

0.1.0 / 2013-03-14
==================

  * add progress back
  * add Collection#concurrency() with default of 4
  * add direct s3 support

0.0.4 / 2013-02-22
==================

  * add "item uploaded" event

0.0.3 / 2013-02-22
==================

  * add populating Item properties on .save() response
  * add `Collection#set()`
  * add `Item#set(obj, [fn])` support. Closes #9
  * add `Item#set(prop, val, fn)`
  * change `Item#set()` callback to be optional
  * change `.queue` to `.items` and make it public
  * remove Item progress events for now
  * fix superagent ENOENT handling. Closes #2

0.0.2 / 2013-02-08
==================

  * make item .trackProgress() conditional
