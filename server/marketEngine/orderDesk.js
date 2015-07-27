var Promise = require("bluebird");
var Order = require("../models/Order");
var accountManager = require('./accountManager.js');
var appEvents = require("../controllers/app-events");

// take an order
// return a promise of an order
module.exports = function(order){

  return new Promise(function(resolve, reject){
    // ask account manager if user's available balance
    //covers the order requirements
    accountManager.orderIsCovered(order)

      .then(function(covered){
        if(!covered) {
          return reject({name: 'requirementsNotMet', message: 'Withholding requirements not met.'});
        }
        // create the order
        Order.forge({
          user_id: order.user_id,
          currency_pair_id: order.currency_pair_id,
          type: order.type,
          price: parseFloat(order.price),
          side: order.side,
          size: parseFloat(order.size)
        })
        .save()
        .then(function(order){
          if(!order) {
            // why would we get a resolved promise
            // if no order was created?
            reject({name: 'orderNotAccepted', message: 'Order not accepted.'});
          } else {
            order.load(['currency_pair']).then(function(order){

              // set status to open
              order.set('status', 'open');

              // create a json object
              var orderJSON = order.toJSON();

              // tell the world!
              appEvents.emit('order:new', orderJSON);

              // resolve our promise with the order id
              resolve({
                id: order.get('id'),
              });

            });
          }
        })
        .catch(function(err){
          console.error(err);
          // what would be best to send with rejection here?
          reject({name: 'orderCreationFailure', message: 'Unable to create order.'});
        });
      })
      // accountManager rejects the order....
      .catch(function(err){
        reject({name: typeof err, message: 'Account Manager failed to process the order'});
      });
  });
};
