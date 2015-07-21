var Promise = require("bluebird");
var Order = require("../models/Order");
var accountManager = require('./accountManager.js');


// all this module does it take orders
// and return a failure or success object
module.exports = function(order, callback){

  // get user from order
  // determine funds needed to be withheld.
    // if buy side
    // withhold = price * volume
  // if sell order
    // withHold = order.size from account of currency type

  // ask account manager to hold the funds
  accountManager.withHoldFunds(user, withhold, asset)
    .then(function(successMessage){
      // create the order
      done(null, successMessage)
    })
    .catch(function(err){
      // oh no
      // send an error
      done(err);
    });
      // send an error if we get one here

      // otherwise
        // match the order
        // or put it on the books

};
