var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;

var orderDesk = require('../../marketEngine/orderDesk.js');
var users = require('../../controllers/users');

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
    users.signup(myUser.email, myUser.password)
      .then(function(user){
        uid = user.get('id');
      })
      .catch(function(err){
        console.error(err);
      })
      .finally(done);
  });

  it('Returns a promised order containing the order id of the order', function(done){

    var myOrder = {
      sequence: 1,
      currency_pair_id: 1,
      type: 'limit',
      side: 'buy',
      price: 1,
      size: 1,
      filled_size: 0,
      user_id: uid
    };

    // send the order to order desk
    orderDesk(myOrder)
      .then(function(order){
        expect(order.id).to.not.equal(null);
      })
      .finally(done);
  });

});
