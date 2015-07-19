var gulp = require('gulp');
var browserSync = require('browser-sync');
var karmaServer = require('karma').Server
var del = require('del');
var argv = require('yargs').argv;
var stylish = require('jshint-stylish');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

//
// PATH INFO
//
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
    all: ['client/app/**/*.*'],
    scripts: [
      // bower components
      'client/lib/angular/angular.js',
      'client/lib/angular-chartist.js/dist/angular-chartist.js',
      'client/lib/angular-mocks/angular-mocks.js',
      'client/lib/chartist/dist/chartist.js',

      // main application file
      'client/app/*.js',

      // get all modules
      'client/app/components/**/*.js',

      // dont include specs
      '!client/app/**/*.spec.js',

      // services
      'client/app/lib/services/*.services.js'
    ],
    html: ['client/app/**/*.html'],
    sass: [
      'client/app/components/*.scss',
      'client/app/*.scss'
    ],
    dist: 'client/dist/'
  },
};

/////////////////////////////////////////
//                  CLEAN TASKS

// clean the entire dist dir
gulp.task('clean-dist', function(cb){
  del([paths.client.dist + '**/*.*'], cb);
});

// clean just js
gulp.task('clean-scripts', function(cb){
  del([paths.client.dist + '**/*.js'], cb);
});

// clean sass
gulp.task('clean-sass', function(cb){
  del([paths.client.dist + '**/*.scss'], cb);
});

// clean html
gulp.task('clean-html', function(cb){
  del([paths.client.dist + '**/*.html'], cb);
});

//////////////////////////////////////////
//                  BUILD TASKS

// concats sourcemaps and minifies all js
gulp.task('scripts', ['clean-scripts'], function() {
  return gulp.src(paths.client.scripts)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('main.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('main.min.js'))
    .pipe(plugins.sourcemaps.write())
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


/////////////////////////////////////////
//                  LINT TASKS

// run jshint against client files
gulp.task('lint:client', function(){
  return gulp.src(paths.client.all)
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
gulp.task('test:server', ['lint:server'], function() {
  process.env.NODE_ENV = 'test';
  return gulp.src(paths.server.spec.all)
    // only run mocha tests if server files
    .pipe(plugins.mocha({
      reporter: argv.reporter || 'spec'
    }))
    .once('error', function () {
      process.exit(1);
    })
    .once('end', function () {
      process.exit();
    });
});


/////////////////////////////////////////
//                  WATCH TASKS

// watch scripts, sass, and html
// and run build tasks when they change
gulp.task('watch', function() {
  gulp.watch(paths.client.scripts, ['scripts']);
  gulp.watch(paths.client.sass, ['sass']);
  gulp.watch(paths.client.html, ['copy-html']);
  gulp.watch(paths.client.scripts, ['test:client']);
  gulp.watch(paths.client.spec.all, ['test:client']);
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
    browser: ['google chrome']
  }, cb);
});

// the build task builds all sass out to dist
// concats and minifies all .js out to dist
// and copys all html out to dist
// always clean dist dir first
gulp.task('build', ['sass', 'scripts', 'copy-html']);

// our default task
// always require a build first
gulp.task('default', ['build'], function(){
  gulp.start('watch');
  gulp.start('browser-sync');
});
