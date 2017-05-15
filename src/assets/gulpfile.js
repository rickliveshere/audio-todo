/* eslint-env node */

'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var del = require('del');
var packageJson = require('./package.json');
var path = require('path');
var runSequence = require('run-sequence');
var swPrecache = require('./node_modules/sw-precache/lib/sw-precache.js');
var webpackConfig = require('./webpack.config.js');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var DEV_DIR = 'src';
var DIST_DIR = 'dist';
var WEBSITE_DIR = '../ReactDemo.Web/wwwroot';

function writeServiceWorkerFile(rootDir, handleFetch, callback) {
  var config = {
    cacheId: packageJson.name,
    handleFetch: handleFetch,
    logger: gutil.log,
    staticFileGlobs: [
      rootDir + '/css/**.css',
      rootDir + '/images/**.*',
      rootDir + '/js/**.js'
    ],
    stripPrefix: rootDir + '/'
  };

  swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
}

function compileSass(rootDir) {
  return gulp
    .src(DEV_DIR + '/css/*.scss')
    .pipe(sass())
    .pipe(gulp.dest(rootDir + '/css'));
}

gulp.task('default', ['build']);

gulp.task('build', function(callback) {
  runSequence('clean', 'sass', 'webpack', 'generate-service-worker-dist', 'copy-dist-to-web', callback);
});

gulp.task('dev', function(callback) {
  gulp.watch(DEV_DIR + '/css/*.scss', ['sass-dev']);
  runSequence('generate-service-worker-dev', 'sass-dev', 'webpack-dev-server', callback);
});

gulp.task('copy-dist-to-web', function() {   
    gulp.src([DIST_DIR + '/**/*', '!' + DIST_DIR + '/**/*.html',]).pipe(gulp.dest(WEBSITE_DIR));
});

gulp.task('clean', function() {
  del.sync([DIST_DIR]);
});

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile(DEV_DIR, false, callback);
});

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(DIST_DIR, true, callback);
});

gulp.task("webpack", function(callback) {
    // run webpack
    webpack(webpackConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", function(callback) {
    // Start a webpack-dev-server
    var compiler = webpack(webpackConfig);

    new WebpackDevServer(compiler, {
            contentBase: webpackConfig.devServer.contentBase,
		    stats: {
                colors: true
            }
        }).listen(8080, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        // Server listening
        gutil.log("[webpack-dev-server]", "http://localhost:8080/index.html");

        // keep the server alive or continue?
        // callback();
    });
});


gulp.task('sass-dev', function () {
  return compileSass(DEV_DIR);
});

gulp.task('sass', function () {
  return compileSass(DIST_DIR);
});