var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;

var accountManager = require('../../marketEngine/accountManager.js');
var User = require("../../models/User");
var Account = require("../../models/Account");
var utils = require('../helpers.js');

chai.use(chaiAsPromised);

describe('accountManager', function(){

  describe('#withhold', function(){
    var uid = null;

    before(function(done){
      var myUser = {
        password: 'floydsRflamingosToo',
        email: 'roger@waters.com',
        fullname: 'Rogery Waters'
      };

      // create a user to test with
      utils.user.createCustom(myUser)
        .then(function(user){

          // create a new usd wallet for this user
          uid = user.get('id');
          Account.forge({
            user_id: uid,
            balance: 100000,
            currency_id: 1,
            available: 10000
          })
          .save()
          .then(function(account){
            return new Account({id: account.id}).fetch({withRelated: 'currency'})
          })
          .then(function(){
            //console.log(account.related('currency').get('currency'));
            //console.log(account.get('balance'));
            return;
          })
          .then(function(){

            // create a new BTC Wallet for this user
            Account.forge({
              user_id: uid,
              balance: 100,
              currency_id: 2,
              available: 100
            })
            .save()
            .then(function(account){
              return new Account({id: account.id}).fetch({withRelated: 'currency'})
            })
            .then(function(){
              //console.log(JSON.stringify(account));
              //console.log(account.get('balance'));
              //console.log(account.related('currency').get('currency'));
              //console.log(account.get('balance'));
            })
          })
        })
        .catch(function(err){
          console.log(err);
        })
        .finally(done);
    });

    it('returns a promise of withholding an orders requirements', function(){

      var myOrder = {
        sequence: 1,
        currency_pair_id: 1,
        type: 'limit',
        side: 'buy',
        price: 300.01,
        size: 5,
        filled_size: 5,
        user_id: uid
      };

      return expect(accountManager.withhold(myOrder)).to.eventually.have.property('requirements');


      /*
      // send the order to order desk
      accountManager.withholdFunds(myOrder)

        .then(function(response){
         //success
          expect(response.id).to.equal(uid);
          //expect(response).to.equal(undefined);
          done();
         })
         .catch(function(err){
           expect(err).to.equal(undefined);
           done();
         });
      */
      });

    xit('withholds funds when its supposed to', function(){
      var user_id = 1;
      new Account.forge({
        user_id: user_id,
        currency_id: 1,
        balance: 10000,
        available: 10000
      })
      .save()
      .then(function(){
        return new User({id: user_id}).fetch({withRelated: ['accounts']});
      })
      .then(function(){
      })
      .catch(function(err){
        console.log(err);
      });
    });
  });
});
