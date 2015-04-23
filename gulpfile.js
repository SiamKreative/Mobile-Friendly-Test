var gulp = require('gulp'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	minifycss = require('gulp-minify-css'),
	notify = require('gulp-notify'),
	del = require('del');

/*
Copy stuff to dist folder
 */
gulp.task('copy', function () {
	gulp.src('./*.html')
		.pipe(gulp.dest('./dist'));
	gulp.src('./img/**/*')
		.pipe(gulp.dest('./dist/img'));
});

/*
Clean dist folder
 */
gulp.task('clean', function (cb) {
	del(['dist'], cb);
});

/*
Parse build blocks in HTML files to replace references to non-optimized scripts or stylesheets with useref
 */
gulp.task('html', function () {
	var assets = useref.assets();

	return gulp.src('./index.html')
		.pipe(assets)
		.pipe(gulpif('*.js', uglify()))
		.pipe(notify({
			message: 'Scripts task complete'
		}))
		.pipe(gulpif('*.css', minifycss()))
		.pipe(notify({
			message: 'Styles task complete'
		}))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'));
});

/*
Default Task
 */
gulp.task('default', ['clean'], function () {
	gulp.start('copy', 'html');
});