//example
var events = require('./app-events');

events.on('order:new', function(data){
  console.log(data.toJSON());
});
