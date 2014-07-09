var gulp = require('gulp')
  , doxi = require('./lib/doxi');

gulp.task('default', function() {
  gulp.src('./lib/doxi.js')
    .pipe(doxi('index.html', {template: './templates/index.jade'}))
    .pipe(gulp.dest('./'));
});
