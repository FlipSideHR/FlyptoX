/*
  This will be a global event emitter object used by components/controllers to emit
  application wide events.

  The intenet is to have loosely coupled controllers in the system,
  and this event system is one simple pattern that can acheive this idea.

  It can be an abstraction for a 'communication bus/queue' which could be used
  to run controllers on separate nodes, making the application scale horizontally
  when required.
*/
var AsyncEventEmitter = require('async-eventemitter');


module.exports = new AsyncEventEmitter();
