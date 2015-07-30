var appEvents = require('./app-events');
var socketio = require('socket.io');
var io;

appEvents.on('order:new', function(order) {
  if(order.type !== 'limit') return;
  console.log('New order created server-side! Notifying clients...');
  io.emit('order:new', order);
});

appEvents.on('order:cancelled', function(order) {
  console.log('Order cancelled server-side! Notifying clients...');
  io.emit('order:cancelled', order);
});

appEvents.on('trade', function(trade){
  console.log('Trade occured @', trade.price);
  io.emit('trade', trade);
});

module.exports = function(server) {
  io = socketio(server);
};
