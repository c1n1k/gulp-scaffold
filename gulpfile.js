var config = {
        http_port: "9000",
        livereload_port: "35729",
        startpage:  "public/index.html",

        // html
        src_html: "assets/template/*.html",

        // styles
        src_styl: "assets/stylus/main.styl",
        src_ie_styl: "assets/stylus/ie.styl",
        dest_css: "public/css",
        build_dest_css: "build/css",

        // scripts
        src_js: "assets/js/*.js",
        dest_js: "public/js",
        js_concat_target: "main.js",
        build_dest_js: 'build/js',
        build_vendor_js: 'build/js/vendor',

        // plugins
        src_plugins: "assets/js/plugins/*.js",
        plugins_concat: "plugins.js",

        // images
        src_img: "assets/img/**/*.*",
        dest_img: "public/img",
        build_dest_img: "build/img"

    };

// Инициализируем плагины
var lr = require('tiny-lr'), // Минивебсервер для livereload
    gulp = require('gulp'), // Сообственно Gulp JS
    // jade = require('gulp-jade'), // Плагин для Jade
    stylus = require('gulp-stylus'), // Плагин для Stylus
    autoprefixer = require('autoprefixer-stylus'), // Плагин Autoprefixer для Stylus
    nib = require('nib'), // Плагин для Stylus
    livereload = require('gulp-livereload'), // Livereload для Gulp
    // myth = require('gulp-myth'), // Плагин для Myth - http://www.myth.io/
    csso = require('gulp-csso'), // Минификация CSS
    imagemin = require('gulp-imagemin'), // Минификация изображений
    uglify = require('gulp-uglify'), // Минификация JS
    concat = require('gulp-concat'), // Склейка файлов
    connect = require('connect'), // Webserver
    server = lr();


// Собираем Stylus
gulp.task('stylus', function() {
    return gulp.src(config.src_styl)
        .pipe(stylus({
            use: autoprefixer('last 2 version', 'Firefox >= 20', '> 1%', 'ie 8', 'ie 7', { cascade: true })
        })) // собираем stylus
    .on('error', console.log) // Если есть ошибки, выводим и продолжаем
    // .pipe(myth()) // добавляем префиксы - http://www.myth.io/
    .pipe(gulp.dest(config.dest_css)) // записываем css
    .pipe(livereload(server)); // даем команду на перезагрузку css
});

// Собираем Stylus ie
gulp.task('stylus_ie', function() {
    return gulp.src('./assets/stylus/ie.styl')
        .pipe(stylus({
            use: autoprefixer('last 2 version', 'Firefox >= 20', '> 1%', 'ie 8', 'ie 7', { cascade: true })
        })) // собираем stylus
    .on('error', console.log) // Если есть ошибки, выводим и продолжаем
    // .pipe(myth()) // добавляем префиксы - http://www.myth.io/
    .pipe(gulp.dest(config.dest_css)) // записываем css
    .pipe(livereload(server)); // даем команду на перезагрузку css
});

// Собираем html из Jade

gulp.task('html', function() {
    return gulp.src(config.src_html)
        // .pipe(jade({
        //     pretty: true
        // }))  // Собираем Jade только в папке ./assets/template/ исключая файлы с _*
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
    .pipe(gulp.dest('public/')) // Записываем собранные файлы
    .pipe(livereload(server)); // даем команду на перезагрузку страницы
}); 



// Собираем JS plugins
gulp.task('js_plugins', function() {
    return gulp.src([config.src_plugins])
        .pipe(concat(config.plugins_concat)) // Собираем все JS, кроме тех которые находятся в ./assets/js/vendor/**
        .pipe(gulp.dest(config.dest_js))
        .pipe(livereload(server)); // даем команду на перезагрузку страницы
});

// Собираем JS
gulp.task('js', function() {
    return gulp.src([config.src_js, '!./assets/js/vendor/**/*.js'])
        .pipe(concat(config.js_concat_target)) // Собираем все JS, кроме тех которые находятся в ./assets/js/vendor/**
        .pipe(gulp.dest(config.dest_js))
        .pipe(livereload(server)); // даем команду на перезагрузку страницы
        
});


// Копируем и минимизируем изображения

gulp.task('images', function() {
    return gulp.src(config.src_img)
        .pipe(imagemin())
        .pipe(gulp.dest(config.dest_img))
});

// Локальный сервер для разработки
gulp.task('http-server', function() {
    connect()
        .use(require('connect-livereload')())
        .use(connect.static('public'))
        .listen('9000');

    console.log('Server listening on http://localhost:9000');
});

// Запуск сервера разработки gulp watch
gulp.task('default', function() {
    gulp.start('stylus','stylus_ie','html','images','js_plugins','js');

    // Подключаем Livereload
    server.listen(35729, function(err) {
        if (err) return console.log(err);

        gulp.watch('assets/stylus/**/*.styl', ['stylus']);

        gulp.watch('assets/stylus/ie.styl', ['stylus_ie']);
        
        gulp.watch('assets/template/**/*.html', ['html']);
        gulp.watch('assets/img/**/*', ['images']);
        gulp.watch('assets/js/**/*', ['js_plugins']);
        gulp.watch('assets/js/**/*', ['js']);
    });
    gulp.start('http-server');
});

gulp.task('build', function() {

    // css
    gulp.src([config.src_styl])
        .pipe(stylus({
            use: autoprefixer('last 2 version', 'Firefox >= 20', '> 1%', 'ie 8', 'ie 7', { cascade: true })
        })) // собираем stylus
    .on('error', console.log) // Если есть ошибки, выводим и продолжаем
    .pipe(csso())
    .pipe(gulp.dest(config.build_dest_css)); // записываем css

    // css ie
    gulp.src([config.src_ie_styl])
        .pipe(stylus({
            use: autoprefixer('last 2 version', 'Firefox >= 20', '> 1%', 'ie 8', 'ie 7', { cascade: true })
        })) // собираем stylus
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(csso())
        .pipe(gulp.dest(config.build_dest_css)); // записываем css

    // jade
    gulp.src([config.src_html])
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(gulp.dest('build')); // Записываем собранные файлы

    // js
    gulp.src([config.src_js, '!./assets/js/vendor/**/*.js'])
        .pipe(concat(config.js_concat_target))
        .on('error', console.log) // Собираем все JS, кроме тех которые находятся в ./assets/js/vendor/**
        .pipe(uglify())
        .pipe(gulp.dest(config.build_dest_js));

    // js plugins
    gulp.src([config.src_plugins])
        .pipe(concat(config.plugins_concat))
        .on('error', console.log) // Собираем все JS, кроме тех которые находятся в ./assets/js/vendor/**
        .pipe(uglify())
        .pipe(gulp.dest(config.build_dest_js));

    // js vendor
    gulp.src(['./assets/js/vendor/**/*.js'])
        .pipe(gulp.dest(config.build_vendor_js));

    // image
    gulp.src([config.src_img])
        .pipe(imagemin())
        .pipe(gulp.dest(config.build_dest_img));

});