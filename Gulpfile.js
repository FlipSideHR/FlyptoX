var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var karmaServer = require('karma').Server
var del = require('del');
var argv = require('yargs').argv;
var stylish = require('jshint-stylish');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var dbTools = require('./utils/dbTools');

var paths = {
  server: {
    main: 'server/main.js',
    all: ['server/**/*.js'],
    spec: {
        all :['server/**/*.spec.js'],
      models: ['server/models/*.spec.js'],
      controllers: ['server/controllers/*.spec.js']
    }
  },
  client: {
    spec: {
      all: ['client/app/**/*.spec.js'],
    },

    // these are generally loaded in the order they appear
    scripts: {
      // all client js except spec files
      // make sure app.js gets concatted last
      all: ['!client/app.js', '!client/**/*.spec.js', 'client/app/**/*.js', 'client/app.js'],

      // specific bower components
      lib: [
        'client/lib/angular/angular.js',
        'client/lib/angular-ui-router/release/angular-ui-router.js',
        'client/lib/angular-mocks/angular-mocks.js',
        'client/lib/socket.io-client/socket.io.js'
      ],

    },

    // assets directory
    assets: 'client/assets/**/*.*',

    html: ['client/app/**/*.html'],
    sass: [
      'client/app/**/*.scss',

      'client/lib/chartist/dist/chartist.min.css'
    ],
    dist: 'client/dist/'
  },
};





/////////////////////////////////////////
//                  CLEAN TASKS

// clean the entire dist dir
gulp.task('clean-dist', function(cb){
  del([paths.client.dist + '/*'], cb);
});

// clean just js - no minified js
gulp.task('clean-scripts', function(cb){
  del([paths.client.dist + '**/*.js', !paths.client.dist + '**/*min.js'], cb);
});

// clean minified js
gulp.task('clean-minified-scripts', function(cb){
  del([paths.client.dist + '**/*.min.js'], cb);
});

// clean sass
gulp.task('clean-sass', function(cb){
  del([paths.client.dist + '**/*.scss'], cb);
});

// clean html
gulp.task('clean-html', function(cb){
  del([paths.client.dist + '**/*.html'], cb);
});

// clean assets
gulp.task('clean-assets', function(cb){
  del([paths.client.dist + 'assets/**/*.*'], cb);
});

// Clean the database
gulp.task('clean-db', function(done){
  dbTools.clean(function(){
    done();
  });
});



//////////////////////////////////////////
//                  BUILD TASKS

// concats all js starting with the library (bower installed)
// and then onto the application code
gulp.task('scripts-concat', ['clean-scripts'], function() {
  return gulp.src(paths.client.scripts.lib.concat(paths.client.scripts.all))
    .pipe(plugins.concat('main.js'))
    .pipe(gulp.dest(paths.client.dist + 'app'));
});

// run our sass build pipeline
gulp.task('sass', ['clean-sass'], function() {
  return gulp.src(paths.client.sass)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.concat('main.css'))
    .pipe(plugins.cssmin())
    .pipe(plugins.rename('main.min.css'))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(paths.client.dist + 'assets/css'));
});

// this copies html from our app components
// into the dist dir.
gulp.task('copy-html', ['clean-html'], function() {
  return gulp.src(paths.client.html)
    // Perform minification tasks, etc here
    .pipe(gulp.dest(paths.client.dist + 'app'));
});

// this copies html from our app components
// into the dist dir.
gulp.task('copy-assets', ['clean-assets'], function() {
  return gulp.src(paths.client.assets)
    // Perform minification tasks, etc here
    .pipe(gulp.dest(paths.client.dist + 'assets/'));
});

// MINIFY the concatted js
// output as client/dist/app/main.min.js
gulp.task('scripts-minify', ['clean-minified-scripts'], function() {
  return gulp.src([paths.client.dist + 'main.js'])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.uglify())
    .pipe(plugins.rename('main.min.js'))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(paths.client.dist + 'app'));
});

/////////////////////////////////////////
//                  LINT TASKS

// run jshint against client files
gulp.task('lint:client', function(){
  return gulp.src(paths.client.scripts.all)
    .pipe(plugins.jshint({}))
    .pipe(plugins.jshint.reporter(stylish))
});

// run jshint against server files
gulp.task('lint:server', function(){
  return gulp.src(paths.server.all)
    .pipe(plugins.jshint({}))
    .pipe(plugins.jshint.reporter(stylish))
});


/////////////////////////////////////////
//                  TEST TASKS

// test client files
gulp.task('test:client', ['lint:client'], function(done) {
  new karmaServer({
    configFile: __dirname + '/karma.conf.js'
  }, function(){
    done();
  }).start();
});


// test server files
gulp.task('test:server', ['lint:server', 'clean-db'], function() {
  var startEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  // set reporting options
  if (!argv.spec){
    argv.reporter = 'nyan';
  } else {
    argv.reporter = 'spec';
  }

  if (argv.travis){
    process.env.TRAVIS = true;
  }

  return gulp.src(paths.server.spec.all)
    .pipe(plugins.mocha({
      reporter: argv.reporter || 'nyan'
    }))
    .once('error', function () {
      process.env.NODE_ENV = startEnv;
      gulp.start('clean-db', function(){
        if (process.env.TESTRUNNER !== 'continuous'){
          process.exit(1);
        }
      });
    })
    .once('end', function () {
      process.env.NODE_ENV = startEnv;
      gulp.start('clean-db', function(){
        if (process.env.TESTRUNNER !== 'continuous'){
          process.exit();
        }
      });

    });
});

/////////////////////////////////////////
//                  WATCH TASKS

// watch scripts, sass, and html
// and run build tasks when they change
gulp.task('watch', function() {
  gulp.watch(paths.client.scripts.all.concat(paths.client.spec.all), ['scripts-concat']);
  gulp.watch(paths.client.sass, ['sass']);
  gulp.watch(paths.client.html, ['copy-html']);
  gulp.watch(paths.client.scripts.all.concat(paths.client.spec.all), ['test:client']);
  gulp.watch(paths.server.all, ['test:server']);
});

/////////////////////////////////////////
//                  NODEMON
gulp.task('nodemon', function(cb) {
  // We use this `called` variable to make sure the callback is only executed once
  var called = false;
  return plugins.nodemon({
    // run our server and watch the server files for changes
    script: paths.server.main,
    watch: ['server/main.js', 'server/**/*.*']
  })
  .on('start', function onStart() {
    if (!called) {
      cb();
    }
    called = true;
  })
  .on('restart', function onRestart() {

    // Also reload the browsers after a slight delay
    setTimeout(function reload() {
      browserSync.reload({
        stream: false
      });
    }, 500);
  });
});


/////////////////////////////////////////
//                  BROWSER SYNC
// Make sure `nodemon` is started before running `browser-sync`.
gulp.task('browser-sync', ['nodemon'], function(cb) {
  // the port the server is running on
  var port = process.env.PORT || 9999;

  // set browser by platform
  var browser = '';
  if (process.platform === 'linux'){
    browser = ['google-chrome'];
  } else {
    browser = ['google chrome'];
  }

  browserSync.init({

    // All of the following files will be watched
    // watching files in our dist directory ensures
    // we only inject things after they are built
    files: ['client/dist/**/*.*'],

    // Tells BrowserSync on where the express app is running
    proxy: 'http://localhost:' + port,

    notify: true,
    injectChanges: true,

    // the port browser sync runs on (and your browser will connect to)
    port: 4000,

    // Which browser should we launch?
    browser: browser
  }, cb);
});

// the build task builds all sass out to dist
// concats and minifies all .js out to dist
// and copys all html out to dist
// always clean dist dir first
gulp.task('build', ['sass', 'scripts-concat', 'copy-html', 'copy-assets']);

// use this when building for production.
gulp.task('build-dist', ['build'], function(){
  gulp.start('scripts-minify');
  //TODO: make gulp use minified files
});

// a task for just running linter/tests on the server
gulp.task('serverTestRunner', function(){
  argv.reporter = 'nyan';
  process.env.TESTRUNNER = 'continuous';
  gulp.start('test:server');
  gulp.watch(paths.server.all, ['test:server']);
});

// our default task
// always require a build first
gulp.task('default', ['build'], function(){
  process.env.TESTRUNNER = 'continuous';
  gulp.start('watch');

  if (argv.bs){
    gulp.start('browser-sync');
  } else {
    gulp.start('nodemon');
  }
});
