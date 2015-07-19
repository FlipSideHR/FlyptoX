var gulp = require('gulp');
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssMin = require('gulp-cssmin');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var karma = require('gulp-karma');
var nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var del = require('del');
var argv = require('yargs').argv;
var stylish = require('jshint-stylish');

if (argv.server){
  console.log('Yeah!');
}

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
      'client/lib/angular/angular.min.js',
      'client/lib/angular-chartist.js/dist/angular-chartist.min.js',
      'client/lib/angular-mocks/angular-mocks.min.js',
      'client/lib/chartist/dist/chartist.min.js',

      // main application file
      'client/app/*.js',

      // get all modules
      'client/app/components/**/*.js',

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
    .pipe(sourcemaps.init())
      .pipe(concat('main.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(rename('main.min.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(paths.client.dist + 'app'));
});

// run our sass build pipeline
gulp.task('sass', ['clean-sass'], function() {
  return gulp.src(paths.client.sass)
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
          .pipe(cssMin())
          .pipe(rename('main.min.css'))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(paths.client.dist + 'assets/css'));
});

// this copies html from our app components
// into the dist dir.
gulp.task('copy-html', ['clean-html'], function() {
    gulp.src(paths.client.html)
    // Perform minification tasks, etc here
    .pipe(gulp.dest(paths.client.dist + 'app'));
});


/////////////////////////////////////////
//                  LINT TASKS

// run jshint against client files
gulp.task('lint:client', function(){
  return gulp.src(paths.client.all)
    .pipe(jshint({}))
    .pipe(jshint.reporter(stylish))
});

// run jshint against server files
gulp.task('lint:server', function(){
  return gulp.src(paths.server.all)
    .pipe(jshint({}))
    .pipe(jshint.reporter(stylish))
});


/////////////////////////////////////////
//                  TEST TASKS

// test client files
gulp.task('test:client', ['lint:client'], function() {
  return gulp.src(paths.client.spec.all)

    // only run karma is these are client tests
    .pipe(karma({
      configFile: 'test/karma.conf.js',
      action: 'run'
    }))
    .once('error', function () {
      process.exit(1);
    })
    .once('end', function () {
      process.exit();
    });
});

// test server files
gulp.task('test:server', ['lint:server'], function() {
  process.env.NODE_ENV = 'test';
  return gulp.src(paths.server.spec.all)
    // only run mocha tests if server files
    .pipe(mocha({
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
  gulp.watch(paths.client.html, ['html']);
});

/////////////////////////////////////////
//                  NODEMON
gulp.task('nodemon', function(cb) {
  // We use this `called` variable to make sure the callback is only executed once
  var called = false;
  return nodemon({
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
