'use strict'

const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const atImport = require('postcss-import');
const reporter = require('postcss-reporter');
const cssnext = require('postcss-cssnext');
const nested = require('postcss-nested');
const short = require('postcss-short');
const assets = require('postcss-assets');
const sourcemaps = require('gulp-sourcemaps');
const mqpacker = require('css-mqpacker');
const pugBeautify = require('gulp-pug-beautify');
const rename = require('gulp-rename');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-cleancss');
const pug = require('gulp-pug');
const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const debug = require('gulp-debug');
const size = require('gulp-size');
const insert = require('gulp-insert');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const include = require('gulp-include');

const path = {
	dist: {
		pages: 'dist/',
		js: 'dist/js/',
		css: 'dist/css/',
		img: 'dist/img/',
		bg: 'dist/assets/bg/',
		icon: 'dist/assets/icon/',
		fonts: 'dist/assets/fonts/'
	},
	src: {
		pages: 'src/pug/*.pug',
		scriptJS: 'src/scripts/custom/script.js',
		customJS: 'src/scripts/custom/custom.js',
		libsJS: 'src/scripts/libs/',
		style: 'src/styles/style.css',
		libsCSS: './src/styles/libs/*',
		icon: 'src/assets/images/icon/*.{gif,png,jpg,jpeg,svg}',
		img: 'src/assets/images/img/**/*.{gif,png,jpg,jpeg,svg}',
		bg: 'src/assets/images/bg/**/*.{gif,png,jpg,jpeg,svg}',
		fonts: 'src/assets/fonts/**/*.{woff,woff2}'
	},
	watch: {
		pages: 'src/pug/**/*.pug',
		scripts: 'src/scripts/**/*.js',
		styles: 'src/styles/**/*.css',
		images: 'src/assets/images/**/*',
		fonts: 'src/assets/fonts/**/*'
	},
	base: './dist'
};

const config = {};
config.env = process.env.NODE_ENV || 'null';

let styleFileMsg = '/*!*\n * ВНИМАНИЕ! Этот файл генерируется автоматически.\n * Не пишите сюда ничего вручную, все такие правки будут потеряны при следующей компиляции.\n * Правки без возможности компиляции ДОЛЬШЕ И ДОРОЖЕ в 2-3 раза.\n * Нужны дополнительные стили? Создайте новый css-файл и подключите его к странице.\n * Читайте ./README.md для понимания.\n */\n\n\n';
let scriptFileMsg = '/*!*\n * ВНИМАНИЕ! Этот файл генерируется автоматически.\n *  * Не пишите сюда ничего вручную. Нужно дописать? прошу в custom.js.\n */\n\n\n';

const processors = [
	atImport,
	cssnext({ 							// Автопреффиксер включен в этот плагин, отдельно подключать не нужно.
		'customProperties': true,
		'customFunction': true,
		'customSelectors': true,
	}),
	nested,
	short,
	assets({
		loadPaths: ['src/assets/fonts/**/*', 'src/assets/images/**/*'],
		relativeTo: 'src/styles/'
	}),
	mqpacker({
		sort: true
	})
];

// ЗАДАЧА: Очистка папки сборки
//
gulp.task('clean', function() {
	console.log('---------- Прибираюсь ----------');
	return del([ path.base, '!' + 'build/readme.md' ]);		// кроме readme.md
});

// ЗАДАЧА: Компиляция стилей
//
gulp.task('styles', function() {
	console.log('========================================= Значение NODE_ENV: ' + config.env + ' поехали: =========================================');
	console.log('---------- Собираю стили: ----------');
	gulp.src(path.src.style)
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Styles',
					message: err.message
				}
			})
		}))
		.pipe(debug({title: 'Style:'}))
		// .pipe(gulpIf(config.env === 'development', sourcemaps.init()))
		.pipe(postcss(processors))
		// .pipe(gulpIf(config.env === 'development', sourcemaps.write('/')))
		.pipe(gulp.dest(path.dist.css))
		// .pipe(cleanCSS())
        .pipe(gulpIf(config.env === 'production', insert.prepend(styleFileMsg)))
        .pipe(gulpIf(config.env === 'production', rename('style.min.css')))
		// .pipe(insert.prepend(styleFileMsg))
		// .pipe(rename('style.min.css'))
		.pipe(gulp.dest(path.dist.css))
		.pipe(size({
			title: 'Размер:',
			showFiles: true,
			showTotal: false
		}))
		.pipe(browserSync.stream());
	return gulp.src(path.src.libsCSS)
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Styles',
					message: err.message
				}
			})
		}))
		.pipe(debug({title: 'libs styles:'}))
		.pipe(cleanCSS())
		.pipe(concat('libs.min.css'))
        .pipe(insert.prepend(styleFileMsg))
		.pipe(gulp.dest(path.dist.css))
		.pipe(size({
			title: 'Размер:',
			showFiles: true,
			showTotal: false
		}))
		.pipe(browserSync.stream());
});

gulp.task('pug', function() {
	console.log('---------- Собираю страницы ----------');
	return gulp.src('./src/pug/*.pug')

	.pipe(plumber({
		errorHandler: notify.onError(function(err) {
			return {
				title: 'Pugs',
				message: err.message
			}
		})
	}))
	.pipe(pug({pretty: true}))
	.pipe(pugBeautify({
		omit_empty: true,
		fill_tab: true,
		tab_size: 4
	}))
	.pipe(gulp.dest(path.dist.pages));
});

// ЗАДАЧА: Копирование изображений
//
gulp.task('images', function () {
	console.log('---------- Веду обработку картинок ----------');
	gulp.src(path.src.icon)				// Обработка статичных картинок
		.pipe(plumber({
				errorHandler: notify.onError(function(err) {
					return {
						title: 'Images',
						message: err.message
					}
				})
			}))
		.pipe(newer(path.dist.icon)) // оставить в потоке только новые файлы (сравниваем с содержимым папки билда)
		.pipe(gulpIf(config.env === 'production', imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imageminJpegRecompress({
				loops: 5,
				min: 65,
				max: 70,
				quality:'medium'
			}),
			imagemin.optipng({optimizationLevel: 3}),
			pngquant({quality: '65-70', speed: 5})
			],{	verbose: true })
		))
		.pipe(gulp.dest(path.dist.icon))
	gulp.src(path.src.img) 		// Обработка динамических картинок
		.pipe(plumber({
				errorHandler: notify.onError(function(err) {
					return {
						title: 'Images',
						message: err.message
					}
				})
			}))
		.pipe(newer(path.dist.img)) // оставить в потоке только новые файлы (сравниваем с содержимым папки билда)
		.pipe(gulpIf(config.env === 'production', imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imageminJpegRecompress({
				loops: 5,
				min: 65,
				max: 70,
				quality:'medium'
			}),
			imagemin.optipng({optimizationLevel: 3}),
			pngquant({quality: '65-70', speed: 5})
			],{	verbose: true })
		))
		.pipe(gulp.dest(path.dist.img))
	return gulp.src(path.src.bg) 		// Обработка динамических картинок
		.pipe(plumber({
				errorHandler: notify.onError(function(err) {
					return {
						title: 'Images',
						message: err.message
					}
				})
			}))
		.pipe(newer(path.dist.bg)) // оставить в потоке только новые файлы (сравниваем с содержимым папки билда)
		.pipe(gulpIf(config.env === 'production', imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imageminJpegRecompress({
				loops: 5,
				min: 65,
				max: 70,
				quality:'medium'
			}),
			imagemin.optipng({optimizationLevel: 3}),
			pngquant({quality: '65-70', speed: 5})
			],{	verbose: true })
		))
		.pipe(gulp.dest(path.dist.bg))
});

// Задача: Копирование шрифтов
//
gulp.task('fonts', function() {
	console.log('---------- Переношу шрифты: ----------');
	return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

// Задача: Копирование ресурсов (видео и др.)
//
// gulp.task('source', function() {
// 	console.log('---------- Сурсы переношу: ----------');
//     return gulp.src('./src/source/**/*')
//         .pipe(debug({ title: 'source:' }))
//         .pipe(gulp.dest('build/source/'))
// });

// ЗАДАЧА: Конкатенация и углификация Javascript
//
gulp.task('scripts', function () {
	console.log('---------- Собираю скрипты ----------');
	gulp.src(path.src.scriptJS)
        .pipe(include())
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Scripts',
					message: err.message
				}
			})
		}))
		.pipe(insert.prepend(scriptFileMsg))
		.pipe(gulp.dest(path.dist.js));

	gulp.src(path.src.customJS)
		.pipe(insert.prepend('/*!*\n * Backend? Прошу, пиши скрипты здесь: *\n */ \n\n\n'))
		.pipe(gulp.dest(path.dist.js));

	return gulp.src([
			// './src/scripts/vendor/jquery*.js',
			// './src/scripts/vendor/!(jquery)*.js'
			path.src.libsJS + 'jquery*.js',
			path.src.libsJS + '!(jquery)*.js'
		])
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Scripts',
					message: err.message
				}
			})
		}))
		.pipe(concat('libs.min.js'))
		// .pipe(uglify())
		.pipe(uglify({
			mangle: false,
			compress: false,
			output: { beautify: true }
		}))
		.pipe(insert.prepend(scriptFileMsg))
		.pipe(gulp.dest(path.dist.js))
		.pipe(size({
			title: 'Размер:',
			showFiles: true,
			showTotal: false
		}));
});

// ЗАДАЧА: Сборка всего
//
gulp.task('build', gulp.series(
	'clean',
	gulp.parallel('styles', 'images', 'scripts', 'fonts'), 'pug'
	// gulp.parallel('less', 'img', 'js', 'css:fonts:woff', 'css:fonts:woff2'),'pug','html'  // последовательно: сборку разметки
));

// ЗАДАЧА: Локальный сервер, слежение
//
gulp.task('dev', gulp.series('build', function() {
	console.log('---------- Все готово. ----------');
	browserSync.init({
		server: {
			baseDir: path.base
		},
		port: 3000,
		startPath: '/index.html',
		open: true
	});

	gulp.watch(path.watch.pages, gulp.series('pug', reloader));
	gulp.watch(path.watch.styles, gulp.series('styles'));
	gulp.watch(path.watch.fonts, gulp.series('fonts', reloader));
	gulp.watch(path.watch.images, gulp.series('images', reloader));
	gulp.watch(path.watch.scripts, gulp.series('scripts', reloader));
}));

// ЗАДАЧА: Задача по умолчанию
//
gulp.task('default',
	gulp.series('dev')
);

// Дополнительная функция для перезагрузки в браузере
//
function reloader(done) {
	browserSync.reload();
	done();
}
