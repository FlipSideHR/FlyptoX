var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

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

gulp.task('default', function() {
  // place code here
});
