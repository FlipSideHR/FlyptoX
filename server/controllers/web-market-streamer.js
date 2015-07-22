var appEvents = require('./app-events');
var socketio = require('socket.io');
var io;

appEvents.on('order:new', function(order) {
  io.emit('order:new', order);
});

appEvents.on('order:cancelled', function(order) {
  io.emit('order:cancelled', order);
});

module.exports = function(server) {
  io = socketio(server);
};
