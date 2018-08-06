var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    cleancss = require('gulp-clean-css'),
    nunjucksrender = require('gulp-nunjucks-render'),
    htmlbeautify = require('gulp-html-beautify'),
    removeemptylines = require('gulp-remove-empty-lines'),
    tap = require('gulp-tap'),
    htmlmin = require('gulp-html-minifier'),
    inject = require('gulp-insert-string-into-tag'),
    browsersync = require('browser-sync'),
    uglify = require('gulp-uglifyjs'),
    sitemap = require('gulp-sitemap');


const PATHS = {
    src: {
        includes: './src/_includes/',
        layouts: './src/_layouts/',
        pages: './src/pages/**/*.{html,nunjucks,njk,njk.html}',
        sass: './src/_sass/**/*.{scss,sass}',
        sassimports: './src/_sass/imports.scss'
    },
    dist: './dist/',
    dev: './dev/'
}

// to prevent errors from crashing gulp watch
function swallowError (error) {
  console.log(error.toString());
  this.emit('end'); // carrys on with gulp watch
}


// for live reload
gulp.task('browsersync', function () {
    browsersync({
        server: {
            baseDir: './dev',
            port: 8000
        }
    })
});


// to generate sitemap
gulp.task('sitemap', function () {
    gulp.src('./src/pages/*.{html,njk}', {
            read: false
        })
        .pipe(sitemap({
            siteUrl: 'http://www.whiteplainsteens.com'
        }))
        .pipe(gulp.dest('./dist'));
});

// to copy assests folder
gulp.task('copy::dev', function () {
    return gulp.src('./src/assets/**/*.*')
      .pipe(gulp.dest('./dev/assets'));
});

// to copy assests folder
gulp.task('copy::prod', function () {
    return gulp.src('./src/assets/**/*.*')
      .pipe(gulp.dest('./dist/assets'));
});





/*
 ######     ###     ######   ######
##    ##   ## ##   ##    ## ##    ##
##        ##   ##  ##       ##
 ######  ##     ##  ######   ######
      ## #########       ##       ##
##    ## ##     ## ##    ## ##    ##
 ######  ##     ##  ######   ######
*/


gulp.task('sass::dev', function () {
  console.log('DEV: compiling sass...');

  gulp.src(PATHS.src.sassimports)
      .pipe(sourcemaps.init({loadMaps: true}))   // sass sourcemaps
      .pipe(sass())                              // compile sass
      .on('error', swallowError)
      .pipe(sourcemaps.write())
      .pipe(rename('app.css'))                   // name file
      .pipe(gulp.dest(PATHS.dev))                // save to dev (development) folder
      .pipe(browsersync.reload({                 // for live reload on save
          stream: true
      }))

  console.log('DEV: sass compiled');
});


gulp.task('sass::prod', function () {
  console.log('PROD: compiling sass...');
  gulp.src(PATHS.src.sassimports)
      .pipe(sass())                             // compile sass
      .pipe(autoprefixer())                     // autoprefix for browser support
      .pipe(cleancss({compatibility: 'ie8'}))   // minify css
      .pipe(rename('app.min.css'))              // name file
      .pipe(gulp.dest(PATHS.dist));             // save to dist (deployment) folder
  console.log('PROD: sass compiled');
});





/*
 #    #  #    #  #    #       #  #    #  #    #   ####
 ##   #  #    #  ##   #       #  #    #  #   #   #
 # #  #  #    #  # #  #       #  #    #  ####     ####
 #  # #  #    #  #  # #       #  #    #  #  #         #
 #   ##  #    #  #   ##  #    #  #    #  #   #   #    #
 #    #   ####   #    #   ####    ####   #    #   ####
*/


gulp.task('nunjucks::dev', function() {
    console.log('DEV: compiling nunjucks...')

    gulp.src(PATHS.src.pages)
        .pipe(nunjucksrender({ path:[PATHS.src.includes, PATHS.src.layouts] }))    // run nunjucks -- uses layouts from _includes and _templates
        .on('error', swallowError)
        .pipe(inject.append({
            startTag:'<!-- inject:css -->',
            endTag:'<!-- endinject:css -->',
            string:'<link rel="stylesheet" type="text/css" href="app.css">'
        }))                                                                       // inserts the stylesheet -- it uses the development version of the css
        .pipe(inject.append({
            startTag:'<!-- inject:js -->',
            endTag:'<!-- endinject:js -->',
            string:'<script src="app.js"><\/script>'
        }))                                                                        // inserts the js file -- it uses the development version of the js
        .pipe(htmlbeautify({indent_char: ' ',                                      // prettify html
                            indent_size: 2,
                            preserve_newlines: true,
                            end_with_newline: false}))
        .pipe(removeemptylines())                                                  // to remove extra newlines in html
        .pipe(gulp.dest(PATHS.dev))
        .pipe(browsersync.reload({                                                 // for live reload on save
            stream: true
        }));

    console.log('DEV: nunjucks compiled')
});


gulp.task('nunjucks::prod', function() {
    console.log('PROD: compiling nunjucks...')
    gulp.src(PATHS.src.pages)
        .pipe(nunjucksrender({ path:[PATHS.src.includes, PATHS.src.layouts] }))    // run nunjucks -- uses layouts from _includes and _templates
        .pipe(inject.append({
            startTag:'<!-- inject:css -->',
            endTag:'<!-- endinject:css -->',
            string:'<link rel="stylesheet" type="text/css" href="app.min.css">'
        }))                                                                        // inserts the stylesheet -- it uses the production version of the css
        .pipe(inject.append({
            startTag:'<!-- inject:js -->',
            endTag:'<!-- endinject:js -->',
            string:'<script src="app.min.js"><\/script>'
        }))                                                                        // inserts the js -- it uses the development version of the js
        .pipe(htmlmin({collapseWhitespace: true}))                                 // to minify
        .pipe(gulp.dest(PATHS.dist));
    console.log('PROD: nunjucks compiled')
});





/*
       #     #####
       #    #     #
       #    #
       #     #####
 #     #          #
 #     #    #     #
  #####      #####
*/

gulp.task('js::dev', function() {
    gulp.src('./src/js/**/*.*')
        .pipe(sourcemaps.init())
        .pipe(uglify('./src/js/**/*.js', {
            output: {
                beautify: true
            }
        }))
        .on('error', swallowError)
        .pipe(sourcemaps.write())
        .pipe(rename('app.js'))
        .pipe(gulp.dest('./dev'))
})


gulp.task('js::prod', function() {
    gulp.src('./src/js/**/*.*')
        .pipe(uglify('./src/js/**/*.js'))
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest(PATHS.dist))
})











/*
 #     #       #       #######     #####     #     #
 #  #  #      # #         #       #     #    #     #
 #  #  #     #   #        #       #          #     #
 #  #  #    #     #       #       #          #######
 #  #  #    #######       #       #          #     #
 #  #  #    #     #       #       #     #    #     #
  ## ##     #     #       #        #####     #     #
*/


gulp.task('watch', ['copy::dev', 'sass::dev', 'nunjucks::dev', 'js::dev', 'browsersync'], function () {
    gulp.watch('./src/_sass/**/*.*', ['sass::dev']);
    gulp.watch(['./src/_includes/**/*.*',
                './src/_layouts/**/*.*',
                './src/pages/**/*.*'], ['nunjucks::dev']);
    gulp.watch('./src/js/**/*.*', ['js::dev']);
    gulp.watch('./dev/**/*.*', browsersync.reload);
})

gulp.task('prod', ['copy::prod', 'sass::prod', 'nunjucks::prod', 'js::prod'], function () {
    gulp.src('./src/public/**/*.*')
        .pipe(gulp.dest('./dist'))
})
