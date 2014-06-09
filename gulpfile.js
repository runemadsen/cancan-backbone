// some gulp tasks
// ecstatic

var gulp = require('gulp'),
    gutil = require("gutil"),
    coffee = require("gulp-coffee"),
    connect = require("gulp-connect"),
    qunit = require('node-qunit-phantomjs'),
    sourcemaps = require('gulp-sourcemaps');


var config = {
  src: {
    app: ['./cancan_backbone.coffee'],
    test: {
      root: 'test',
      files: ['./test/**/*.coffee', './cancan_backbone.coffee'],
      html: './test/index.html'
    }
  },
  dest: {
    root: 'build',
    test: './test/build'
  }
}

gulp.task('html', function () {
  gulp.src(config.src.test.html)
    .pipe(connect.reload());
});

// TODO: make that work for headless dev!
gulp.task("qunit", function() {
  return qunit(config.src.test.html);
});

gulp.task("tests", function() {
  gulp.src(config.src.app)
   .pipe(sourcemaps.init())
   .pipe(coffee().on("error", gutil.log))
   .pipe(sourcemaps.write())
   .pipe(gulp.dest(config.dest.test))
   .pipe(connect.reload());

  return gulp.src(config.src.test.files)
          .pipe(sourcemaps.init())
          .pipe(coffee().on("error", gutil.log))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(config.dest.test))
          .pipe(connect.reload());
});

// build the coffee files for distribution
gulp.task("build", function() {
  return gulp.src(config.src.app)
          .pipe(coffee().on("error", gutil.log))
          .pipe(gulp.dest(config.dest.root))
          .pipe(connect.reload());
});

gulp.task("watch", function() {
  gulp.watch(config.src.test.files, ['tests']);
  gulp.watch(config.src.test.files, ['tests']);
  gulp.watch(config.src.test.html,  ['html']);
});

// server with livereload capabilities
gulp.task('test-server', function() {
  connect.server({
    root: 'test/',
    livereload: true
  });
});

gulp.task('default', ['test-server', 'watch']);
