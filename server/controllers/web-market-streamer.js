var appEvents = require('./app-events');
var socketio = require('socket.io');
var io;

appEvents.on('order:new', function(order) {
  console.log('New order created server-side! Notifying clients...');
  io.emit('order:new', order);
});

appEvents.on('order:cancelled', function(order) {
  console.log('Order cancelled server-side! Notifying clients...');
  io.emit('order:cancelled', order);
});

module.exports = function(server) {
  io = socketio(server);
};
