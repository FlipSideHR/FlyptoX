var Promise = require("bluebird");
var Order = require("../models/Order");
var accountManager = require('./accountManager.js');
var matcherMaker = require('./matchMaker.js');


// take an order
// return a promise of an order
module.exports = function(order){

  return new Promise(function(resolve, reject){
    // ask account manager to hold the funds
    // required for this order
    accountManager.withhold(order)

      // if account manager resolves the promise
      // it means the requirements have been met
      // and we can proceed with creating the order
      .then(function(){
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
            reject('order not accepted');
          } else {
            // return the order matcher promise
            // order matcher will match any of the order it can
            // sending promises in a promise resolution? am I doing this right? :)
            //resolve(matcherMaker.match(order));

            // for now send the user id and the order id
            // TODO: send the matchMaker.match(order) in the resolve
            resolve({
              id: order.get('id'),
              user: order.get('user_id')
            });

            //TODO: We need to guarantee that orders going to
            // matchmaker are being executed in FIFO order
            // It is possible we could put these in a queue
            // and let matchmaker consume it?
          }
        })
        .catch(function(err){
          console.error(err);
          // what would be best to send with rejection here?
          reject('order not accepted');
        });
      })
      // accountManager rejects the order....
      .catch(function(err){
        // ermagherd! FAILCAKE!
        console.error(err);
        reject(err);
      });
  });
};
