//var requireDirectory = require('require-directory');
//module.exports = requireDirectory(module);

var marketEngine = module.exports;
marketEngine.placeOrder = require('./orderDesk');
marketEngine.start = function(){
  console.log('Starting HeartOfGold trade engine.')
  require('./matcher');
};
