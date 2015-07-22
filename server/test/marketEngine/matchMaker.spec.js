var Promise = require("bluebird");


// takes an actual order model and attempts to match it
module.exports = function(order){

  console.log(order);
  return new Promise(function(resolve, reject){

  if (1){
    resolve();
  } else {
    reject();
  }

  });

};
