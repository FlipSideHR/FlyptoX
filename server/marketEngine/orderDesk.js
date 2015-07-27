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
          return reject({message: 'Withholding requirements not met.'});
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
            console.log('WHY!!');
            // why would we get a resolved promise
            // if no order was created?
            var err = new Error('This might be the dumbest error in the world. TODO: Customer errors ftw');
            reject({error: err, message: 'order not accepted'});

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
          reject({error: err, message: 'order not accepted'});
        });
      })
      // accountManager rejects the order....
      .catch(function(err){
        // ermagherd! FAILCAKE!
        console.error(err);
        reject({error: err, message: 'Withholding requirements not met.'});
      });
  });
};
