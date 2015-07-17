var models = require('require-directory')(module,'../models');
var bookshelf = require('./bookshelf')();


for(var modelName in models) {
    //global[modelName] = models[modelName](bookshelf);
    //app.set(modelName, global[modelName]);
    module.exports[modelName] = models[modelName](bookshelf);
}
