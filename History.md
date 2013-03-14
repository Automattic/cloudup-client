
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
