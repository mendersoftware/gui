var gulp = require('gulp');
var rename = require('gulp-rename');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var browserify = require('browserify');
var babelify = require("babelify");
var source = require("vinyl-source-stream"); // gulp needs a stream not a string, from browserify
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var assign = require('lodash.assign');
var streamify = require('gulp-streamify');


gulp.task('watchify', function() {
  var customOpts = {
    entries: ['./src/js/main.js'],
    debug: true,

  };
  var opts = assign({}, watchify.args, customOpts);
  var b = watchify(browserify(opts));

  b.transform('babelify', {presets: ["es2015", "react"]})
  b.on('update', bundle); // on any dep update, runs the bundler

  function bundle() {
    return b.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('main.js'))
      .pipe(gulp.dest('dist/js'));
  }

  return bundle();
});


gulp.task('styles', function() {
  return gulp.src('src/less/main.less')
    .pipe(less())
    .pipe(prefix({ cascade: true }))
    .pipe(rename('main.css'))
    .pipe(gulp.dest('src'))
    .pipe(gulp.dest('dist/stylesheets'))
});

gulp.task('minify', ['styles'], function() {
  return gulp.src('src/*.css')
    .pipe(minifyCSS())
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('dist/stylesheets'));
});

gulp.task('browserify', function() {
  process.env.NODE_ENV = 'production';
  browserify('./src/js/main.js')
    .transform('babelify', {presets: ["es2015", "react"]})
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('copy', function() {
  gulp.src('src/favicon.ico')
    .pipe(gulp.dest('dist'));
  gulp.src('src/assets/**/*.*')
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('html:dev', function() {
  return gulp.src('src/index.html')
    .pipe(htmlreplace({js: 'js/main.js'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('html:prod', function() {
  return gulp.src('src/index.html')
    .pipe(htmlreplace({js: 'js/main.min.js'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['watchify', 'copy', 'minify', 'html:dev'], function() {
  return gulp.watch('src/**/*.*', ['copy', 'minify']);
});
gulp.task('build', ['browserify', 'copy', 'minify', 'html:dev']);