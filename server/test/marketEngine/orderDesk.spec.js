var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;

var orderDesk = require('../../marketEngine/orderDesk.js');
var utils = require('../helpers.js');

chai.use(chaiAsPromised);

describe('orderDesk', function(){
  var uid = null;

  before(function(done){

    var myUser = {
      password: 'angerdome',
      email: 'farnsworth@planetexpress.com',
      fullname: 'Professor Hubert J. Farnsworth'
    };

    // create a user to test with
    utils.user.createCustom(myUser)
      .then(function(user){
        uid = user.get('id');
      })
      .catch(function(err){
        console.error(err);
      })
      .finally(done);
  });

  it('Returns a promised order containing the order id and the user id of the order', function(done){

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

    // send the order to order desk
    orderDesk(myOrder)
      .then(function(order){
        expect(order.user).to.equal(uid);
      })
      .catch(function(err){
        expect(err).to.equal(null);
      })
      .finally(done);
  });

});
