var gulp = require('gulp');
var rename = require('gulp-rename');
var browserify = require('browserify');
var babelify = require("babelify");
var source = require("vinyl-source-stream"); // gulp needs a stream not a string, from browserify
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');

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
  browserify('./src/js/main.js')
    .transform('babelify', {presets: ["es2015", "react"]})
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('copy', function() {
  gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
  gulp.src('src/favicon.ico')
    .pipe(gulp.dest('dist'));
  gulp.src('src/assets/**/*.*')
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('default', ['browserify', 'copy', 'minify'], function() {
  return gulp.watch('src/**/*.*', ['browserify', 'copy', 'minify']);
});