// Gulp stuff
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var util = require('gulp-util');

// General Stuff
var del = require('del');
var runSequence = require('run-sequence');

// Browserify stuff (es6)
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// Config
var dest = 'dist';

// Error handler
var errorHandler = function() {
    return plumber({
        errorHandler: function(error) {
            util.log(util.colors.red('Unhandled error:\n'), error.toString());
            return this.emit('end');
        }
    });
};

/*--------------------------------------
 Javascript
 --------------------------------------*/
gulp.task('clean:js', function() {
    return del(dest);
});

gulp.task('js', ['clean:js'], function() {
    return browserify({
            entries: [
                'src/pjax.js'
            ],
            debug: true
        })
        .transform(babelify, {
            presets: ['env']
        })
        .bundle()
        .pipe(source('pjax.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(errorHandler())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dest));
});

/*--------------------------------------
 General gulp tasks
 --------------------------------------*/
gulp.task('build', ['js']);

gulp.task('watch', function() {
    return gulp.watch('src/**', ['js']);
});

gulp.task('default', function (cb) {
    return runSequence('build', 'watch', cb);
});
