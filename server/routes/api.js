var express = require('express');
var router = express.Router();
var users = require("../controllers/users");

router.get('/users', function(req, res) {
    users.fetchAll().then(function(users) {
        res.send(users);
    }).catch(function(error) {
        console.log(error.stack);
        res.send('Error getting Users');
    });
});

module.exports = router;
