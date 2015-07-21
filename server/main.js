var path = require('path');
var express = require('express');

// import our configed bookshelf object

var app = module.exports = express();

var rootPath = path.dirname(__dirname);
var port = Number(process.env.PORT || 9999);

app.set('views', __dirname + '/views/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//signin and signup routes
var authRouter = require("./routes/auth.js");
app.use('/api/auth', authRouter);

//api routes
var apiRouter = require("./routes/api.js");
app.use('/api/v1', apiRouter);

// serve all files from client/dist
app.use('/', express.static(path.join(rootPath, 'client/dist/')));

app.get('/', function(req, res) {
  res.render('index.html');
});

// TODO: Error Handing here??

// render everything that didnt get caught as index page
app.use(function(req, res) {
  res.render('index.html');
});

app.listen(port, function() {
  console.log('Server listening on port ' + port);
});
