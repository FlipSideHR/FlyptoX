var path = require('path');
var url = require('url');
var express = require('express');

// used for our template engine (handlebars)
var cons = require('consolidate');

// do we need this?
var cookieParser = require('cookie-parser');

var knexConfig = require('../knexfile');
var knex = require('knex')(knexConfig.development);
var bookshelf = require('bookshelf')(knex);

var app = module.exports = express();

var globalConfig = {
    minify: process.env.MINIFY == 'yes' ? true : false,
    environment: process.env.ENVIRONMENT || 'local'
};

var rootPath = path.dirname(__dirname);
var port = Number(process.env.PORT || 9999);

app.set('views', path.join(rootPath, 'server'));
app.engine('html', cons.handlebars);
app.set('view engine', 'html');

// set an application wide bookshelf property
app.set('bookshelf', bookshelf);

// load our models into the global scope and the app properties
var models = require('require-directory')(module, './models');
for(var modelName in models) {
    global[modelName] = models[modelName](bookshelf);
    app.set(modelName, global[modelName]);
}
// load collections

var apiRouter = require("./routes/api.js");

if(globalConfig.environment == 'local') {
    app.use(require('connect-livereload')());
}

// why cookieParser if we are sessionless?
app.use(cookieParser());

// what is this doing?
app.use(function(req, res, next) {
    var config = configFromReq(req);
    var parsedUrl = url.parse(req.url);
    var splittedPath = parsedUrl.pathname.split(path.sep);

    if(splittedPath[1]) {
        var fileExtension = getFileExtension(parsedUrl.pathname);
        if(fileExtension == 'js' || fileExtension == 'css') {
            addPathPrefix(splittedPath, getMinPrefix(config));
        }
    }

    parsedUrl.pathname = splittedPath.join(path.sep);
    req.url = url.format(parsedUrl);

    req.config = config;
    next();
});

app.use('/', express.static(path.join(rootPath, 'app')));

app.get('/', function(req, res) {
    renderIndex(req.config, res);
});

app.use('/api', apiRouter);

app.use(function(req, res) {
    res.redirect('/');
});

app.listen(port, function() {
    console.log('Server listening on port ' + port);

    // one could verify that the user model had loaded by 
    // uncommenting this code... if one were so inclined
    //app.get('User').fetchAll().then(function(users){
    //  console.log(users);
    //});
});

//
// do these need to be moved into a helper/util module?
//
function renderIndex(config, res) {
    res.render(getMinPrefix(config) + '/views/index');
}

function configFromReq(req) {
    var config = {};
    config.minify = req.cookies.minify == 'true' ? true : false;
    return config;
}

function getMinPrefix(conf) {
    return conf.minify || globalConfig.minify ? 'minified' : 'unminified';
}

function addPathPrefix(filePath, prefix) {
    filePath.splice(1, 0, prefix);
}

function getFileExtension(filePath) {
    return filePath.split('.').pop();
}
