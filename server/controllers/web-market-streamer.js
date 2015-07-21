var appEvents = require('./app-events');
var io = require('socket.io');

appEvents.on('order:new', function(order) {
  io.emit('order:new', order);
});

appEvents.on('order:cancelled', function(order) {
  io.emit('order:cancelled', order);
});

module.exports = function(app) {
  io(app);
};
