
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
