const gulp = require('gulp');
const spawn = require('child_process').spawn;

gulp.task('default', () => spawn('npm', ['run', 'watch'], { stdio: 'inherit' }));
gulp.task('disclaim', () => spawn('npm', ['run', 'disclaim'], { stdio: 'inherit' }));
gulp.task('build', () => spawn('npm', ['run', 'build'], { stdio: 'inherit' }));
