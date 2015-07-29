var path = require('path');
var express = require('express');

var app = module.exports = express();
var server = require('http').Server(app);

var rootPath = path.dirname(__dirname);
var port = Number(process.env.PORT || 9999);

app.set('views', __dirname + '/views/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Configure the socket.io object with our Express app
require('./controllers/web-market-streamer.js')(server);

var marketEngine = require('./marketEngine');
marketEngine.start();

//signin and signup routes
var authRouter = require("./api/auth.js");
app.use('/api/auth', authRouter);

//api routes
var apiRouter = require("./api/v1.js");
app.use('/api/v1', apiRouter);

// serve all files from client/dist
app.use('/', express.static(path.join(rootPath, 'client/dist/')));

app.get('/', function(req, res) {
  res.render('index.html');
});

// TODO: Error Handing here??

// render everything that didnt get caught as index page
// It might be a better idea to return a status 404 ??
app.use(function(req, res) {
  res.render('index.html');
});

server.listen(port, function() {
  console.log('Server listening on port ' + port);
});
