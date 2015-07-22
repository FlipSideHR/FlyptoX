// accountManager
// withhold / clear accounts

var Promise = require("bluebird");
var User = require("../models/User");
var Account = require("../models/Account");

// our export object
var accountManager = module.exports;

// account helper functions??
// exported for testing
var hold = accountManager.hold = function(account, orderInfo){
  // move funds from available to hold
  return new Promise(function(resolve, reject){
    // if we were able to withhold the funds
    if (1){
      resolve();
    // otherwise reject
    } else {
      reject();
    }
  });
};

var clear = accountManager.clear = function(account, orderInfo){
  // release from hold back to available
};

var transfer = accountManager.transfer = function(account1, account2){
  // move funds from 1 account to another
};

// object map for calculating withholding requirements
var calculateRequirements = accountManager.calculateRequirements = {

  // calculate withholding requirements for a buy order
  'buy': function(orderRequest){

    // TODO: determine withhold rules for a market orderRequest?
    // -> just hold all funds until order is resolved!

    // account to place the hold against
    var account = 1;
    // currency should be 1 since we need to withhold dollars
    //console.log('Calculating buy requirements for: ', orderRequest);
    return new Promise(function(resolve, reject){
      // Base Currency vs. Quote Currency
      // buy orderRequest of XBT/USD = hold USD
      //
      //     orderRequest.price in currency_pair.quote_currency
      //   * orderRequest.size
      //   * withHoldingRequirement
      //   ------------------------
      //   = withHoldAmount

      // hardcoded until calcs above are implemented
      var amountToWithHold = 500;
      resolve({account: account, requirements: amountToWithHold});

      // fake reject condition
      if(1 === 2){
        reject();
      }

    });

  },
  // calculate withholding requirements for a sell order
  'sell': function(orderRequest){

    // the proper account to make the hold against
    var account = 1;
    // currency should be 2 since we need to withhold btc
    //console.log('Calculating buy requirements for: ', orderRequest);
    return new Promise(function(resolve, reject){

      // sell orderRequest of XBT/USD = withhold XBT

      //     orderRequest.size from account of currency_pair_id type
      //   * withHoldingRequirement
      //   ---------------------
      //   = holdAmount

      // move withholdAmount to holding account
        // if successful
          // resolve();
        // else reject();
      var amountToWithHold = 500;
      resolve({account: account, requirements: amountToWithHold});

      // fake reject condition
      if(1 === 2){
        reject();
      }
    });
  }
};

// main export function
// takes an orderRequest and returns a promise
accountManager.withhold = function(orderRequest){

    // return a promise which will confirm or reject the orderRequest
    // based on funds being withholdable
    return new Promise(function(resolve, reject){

      // this users accounts
      var accounts;

      // get user (specifically user accounts) from orderRequest
      // this query is whacked im sure.. but this is the idea
      new User({id: orderRequest.user_id}).fetch({withRelated: 'accounts'})
        .then(function(user){
          // locate the users account

          accounts = user.related('accounts');
          //console.log(accounts);

          // calculate withholding requirements of this order
          // returns an object with the account(id) and requirements to withhold
          // {account: <account_id>, requirements: <amountToWithHold>}
          calculateRequirements[orderRequest.side](orderRequest)

            .then(function(requirements){
              // in the account in play for this transaction
              // move withholdAmount to holding account
              // or however holds are implemented

              //TODO: implement the following psuedo
              //hold(account, requirements);
                // if successful
                  // resolve();

                  // for now we are just resolving no matter what
                  // with the req. object that we get back from the method
                  resolve(requirements);

                // if the hold gets rejected
                  // reject the order with reason from hold rejection

             // if there was an error
             // else reject();

            })
            .catch(function(err){
              console.error(err);
              reject(err);
            });

        })
        .catch(function(err){
          console.log(err);
          reject(err);
        });

      })

      // error finding user - reject orderRequest
      .catch(function(err){
        reject(err);
      });
};
