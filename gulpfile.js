var { src, dest, watch, series, parallel } = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    cleancss = require('gulp-clean-css'),
    nunjucksrender = require('gulp-nunjucks-render'),
    htmlpretty = require('pretty'),
    tap = require('gulp-tap'),
    htmlmin = require('gulp-html-minifier-terser'),
    inject = require('gulp-insert-string-into-tag'),
    browsersync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    sitemap = require('gulp-sitemap');


const PATHS = {
    src: {
        includes: 'src/_includes/',
        layouts: 'src/_layouts/',
        pages: 'src/pages/**/*.{html,nunjucks,njk,njk.html}',
        sass: 'src/_sass/**/*.{scss,sass}',
        sassimports: 'src/_sass/imports.scss',
        js: 'src/js/**/*.*',
        assets: 'src/assets/**/*.*'
    },
    dist: 'dist/',
    dev: 'dev/'
}

// to prevent errors from crashing gulp watch
function swallowError (error) {
  console.log(error.toString());
  this.emit('end'); // carrys on with gulp watch
}


// for live reload
function taskBrowserSync() {
    browsersync({
        server: {
            baseDir: PATHS.dev,
            port: 8000
        }
    })
};


// to generate sitemap
function taskSitemap() {
    return src(PATHS.src.pages, {
            read: false
        })
        .pipe(sitemap({
            siteUrl: 'http://www.jackfriend.com'
        }))
        .pipe(dest(PATHS.dist));
};

// to copy assests folder
function taskCopyDev() {
    return src(PATHS.src.assets)
      .pipe(dest(PATHS.dev +'assets'));
};

// to copy assests folder
function taskCopyProd() {
    return src(PATHS.src.assets)
      .pipe(dest(PATHS.dist + 'assets'));
};





/*
 ######     ###     ######   ######
##    ##   ## ##   ##    ## ##    ##
##        ##   ##  ##       ##
 ######  ##     ##  ######   ######
      ## #########       ##       ##
##    ## ##     ## ##    ## ##    ##
 ######  ##     ##  ######   ######
*/

function taskSassDev() {
  console.log('DEV: compiling sass...');

  return src(PATHS.dev.sass)
      .pipe(sourcemaps.init({loadMaps: true}))   // sass sourcemaps
      .pipe(sass())                              // compile sass
      .on('error', swallowError)
      .pipe(sourcemaps.write())
      .pipe(rename('app.css'))                   // name file
      .pipe(dest(PATHS.dev))                     // save to dev (development) folder
      .pipe(browsersync.reload({                 // for live reload on save
          stream: true
      }))

  console.log('DEV: sass compiled');
};


function taskSassProd() {
  console.log('PROD: compiling sass...');
  return src(PATHS.src.sass)
      .pipe(sass())                             // compile sass
      .pipe(autoprefixer())                     // autoprefix for browser support
      .pipe(cleancss({compatibility: 'ie8'}))   // minify css
      .pipe(rename('app.min.css'))              // name file
      .pipe(dest(PATHS.dist));                  // save to dist (deployment) folder
  console.log('PROD: sass compiled');
};





/*
 #    #  #    #  #    #       #  #    #  #    #   ####
 ##   #  #    #  ##   #       #  #    #  #   #   #
 # #  #  #    #  # #  #       #  #    #  ####     ####
 #  # #  #    #  #  # #       #  #    #  #  #         #
 #   ##  #    #  #   ##  #    #  #    #  #   #   #    #
 #    #   ####   #    #   ####    ####   #    #   ####
*/


function taskNunjucksDev() {
    console.log('DEV: compiling nunjucks...')

    return src(PATHS.src.pages)
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
        .pipe(htmlpretty({ocd: true))
        .pipe(dest(PATHS.dev))
        .pipe(browsersync.reload({                                                 // for live reload on save
            stream: true
        }));

    console.log('DEV: nunjucks compiled')
};


function taskNunjucksProd() {
    console.log('PROD: compiling nunjucks...')
    return src(PATHS.src.pages)
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
        .pipe(dest(PATHS.dist));
    console.log('PROD: nunjucks compiled')
};





/*
       #     #####
       #    #     #
       #    #
       #     #####
 #     #          #
 #     #    #     #
  #####      #####
*/

function taskJsDev() {
    return src(PATHS.src.js)
        .pipe(sourcemaps.init())
        .pipe(uglify(PATHS.src.js, {
            output: {
                beautify: true
            }
        }))
        .on('error', swallowError)
        .pipe(sourcemaps.write())
        .pipe(rename('app.js'))
        .pipe(dest(PATHS.dist));
};


function taskJsProd() {
    return src(PATHS.src.js)
        .pipe(uglify(PATHS.src.js))
        .pipe(rename('app.min.js'))
        .pipe(dest(PATHS.dist));
};











/*
 #     #       #       #######     #####     #     #
 #  #  #      # #         #       #     #    #     #
 #  #  #     #   #        #       #          #     #
 #  #  #    #     #       #       #          #######
 #  #  #    #######       #       #          #     #
 #  #  #    #     #       #       #     #    #     #
  ## ##     #     #       #        #####     #     #
*/


 exports.default = series(
    taskCopyDev,
    taskBrowserSync,
    taskSassDev,
    taskNunjucksDev,
    taskJsDev,
    parallel(
        watch(PATHS.src.sass, series(taskSassDev, browsersync.reload)),
        watch([PATHS.src.pages, PATHS.src.includes, PATHS.src.layouts], series(taskNunjucksDev, browsersync.reload)),
        watch(PATHS.src.js, series(taskJsDev, browsersync.reload))
    )
);

exports.prod = series(taskCopyProd, taskSassProd, taskNunjucksProd, taskJsProd);

