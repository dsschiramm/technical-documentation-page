const { src, dest, series, watch, parallel } = require('gulp');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const assets = require('postcss-assets');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const environments = require('gulp-environments');
const CacheBuster = require('gulp-cachebust');

const cachebust = new CacheBuster({ random: true });

function cleanTask() {
	return src('build', { read: false, allowEmpty: true }).pipe(clean());
}

function cssTask() {
	var plugins = [assets({ loadPaths: ['./src/images/'] }), autoprefixer(), cssnano()];

	return src(['node_modules/normalize.css/normalize.css', './src/css/*.css'])
		.pipe(environments.development(sourcemaps.init()))
		.pipe(postcss(plugins))
		.pipe(concat('app.min.css'))
		.pipe(environments.development(sourcemaps.write('.')))
		.pipe(cachebust.references())
		.pipe(cachebust.resources())
		.pipe(dest('build/css'));
}

function htmlTask() {
	return src('./src/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(cachebust.references())
		.pipe(dest('build'));
}

if (environments.production()) {
	exports.default = series(cleanTask, cssTask, htmlTask);
} else {
	const connect = require('gulp-connect');

	function serverTask() {
		connect.server({
			root: 'build',
			livereload: true,
		});
	}

	function watchTask() {
		watch(['./src/css/*.css', './src/*.html'], series(cssTask, htmlTask));
	}

	exports.default = series(cleanTask, cssTask, htmlTask, parallel(serverTask, watchTask));
}
