/* exported User */

var app = require('../main');
var bookshelf = app.get('bookshelf');

var User = module.exports = bookshelf.Model.extend({
    tableName: 'users'
});