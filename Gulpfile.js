var gulp = require('gulp');
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
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

var paths = {
  server: 'server/main.js',
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
  ]
};

// this gets run by the build task
gulp.task('clean-dist', function(){
  console.log('Cleaning dist dir');
  del(['client/dist/**/*.*']);
});

// concats sourcemaps and minifies all js
gulp.task('scripts', function() {
  console.log('Running js tasks');
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(concat('main.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(rename('main.min.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('client/dist/app'));
});

// run our sass build pipeline
gulp.task('sass', function() {
  console.log('Running sass tasks');
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
          .pipe(cssMin())
          .pipe(rename('main.min.css'))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('client/dist/assets/css'));
});

// this copies html from our app components
// into the dist dir.
gulp.task('copy-html', function() {
    gulp.src(paths.html)
    // Perform minification tasks, etc here
    .pipe(gulp.dest('client/dist/app'));
});

// test client files
gulp.task('test', function() {
  return gulp.src([
    'client/app/**/*.js',
  ]).pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(karma({
      configFile: 'test/karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
});

// watch scripts, sass, and html
// and run build tasks when they change
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.html, ['html']);
});

// configure our nodemon tasks
//
gulp.task('nodemon', function() {

  return nodemon({
    // run our server and watch the server files for changes
    script: paths.server,
    watch: ['server/main.js', 'server/**/*.*']
  })
  .on('start', function onStart() {
    // nothing to do here?
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

// Make sure `nodemon` is started before running `browser-sync`.
gulp.task('browser-sync', ['nodemon'], function() {
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
  });
});

// the build task builds all sass out to dist
// concats and minifies all .js out to dist
// and copys all html out to dist
// always clean dist dir first
gulp.task('build', ['clean-dist'], function(){
  gulp.start('sass');
  gulp.start('scripts');
  gulp.start('copy-html');
});

// our default task
gulp.task('default', ['build', 'watch', 'browser-sync']);
