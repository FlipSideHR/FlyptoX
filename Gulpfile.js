var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssMin = require('gulp-cssmin');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var install = require('gulp-install');
var karma = require('gulp-karma');
var nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');

var paths = {
  scripts: [
    './client/lib/angular/angular.min.js',
    './client/lib/angular-chartist.js/dist/angular-chartist.min.js',
    './client/lib/angular-mocks/angular-mocks.js',
    './client/lib/chartist/dist/chartist.min.js',

    './client/app/app.js',
    './client/app/modules.js',

    './client/app/lib/services/account.services.js'
  ],
  stylesheets: [
    './client/lib/chartist/dist/chartist.min.css',

    './client/assets/css/app.css'
  ],
  sass: [
    './client/assets/sass/*.scss'
  ]
};

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(concat('main.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(rename('main.min.js'))
    .pipe(sourcemaps.write())
    // Output to app/dist
    // TODO: UGLIFY AND RENAME FILE FOR MINIFY VERSION
    .pipe(gulp.dest('./client/dist/app'));
});

gulp.task('stylesheets', function() {
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./client/assets/css'))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./client/assets/dist'))
          .pipe(cssMin())
          .pipe(rename('main.min.css'))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('./client/dist/assets'));
});

gulp.task('test', function() {
  return gulp.src([
    './client/app/**/*.js',
    './server/**/*.js'
  ]).pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(karma({
      configFile: './test/karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
});

// gulp.task('install', function() {
//   return gulp.src(['./bower.json'])
//     .pipe(install());
// });

// gulp.task('deploy', ['install'], function() {
//   gulp.start('stylesheets');
//   gulp.start('scripts');
// });

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.sass, ['stylesheets']);
});

gulp.task('serve', function() {
  nodemon({
    script: './server/main.js',
    ext: 'html js css scss',
    tasks: ['scripts', 'stylesheets']
  }).on('restart', function() {
    console.log('restarted nodemon');
  });
});

gulp.task('build', function(){
  gulp.start('stylesheets');
  gulp.start('scripts');
});

gulp.task('default', ['serve', 'watch']);
