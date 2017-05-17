/* eslint-env node */

'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var del = require('del');
var packageJson = require('./package.json');
var path = require('path');
var uglify = require('gulp-uglify');
var pump = require('pump');
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
    staticFileGlobs: [rootDir + '/**/*.{js,css,png,jpg,gif,svg,eot,ttf,woff}'],
    importScripts: [
       'js/sw/sw-toolbox/sw-toolbox.js',
       'js/sw/service-worker-toolbox.js'
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

gulp.task('deploy', function(callback) {
  runSequence('build', 'clean-web', 'copy-dist-to-web', callback);
});

gulp.task('build', function(callback) {
  runSequence('clean', 'sass', 'webpack', 'generate-service-worker-dist', 'minify-js', callback);
});

gulp.task('dev', function(callback) {
  gulp.watch(DEV_DIR + '/css/*.scss', ['sass-dev']);
  runSequence('generate-service-worker-dev', 'sass-dev', 'webpack-dev-server', callback);
});

gulp.task('minify-js', function (callback) {
  pump([
        gulp.src(DIST_DIR + '/**/*.js'),
        uglify(),
        gulp.dest(DIST_DIR)
    ],
    callback
  );
});

gulp.task('copy-dist-to-web', function(callback) {   
  gulp.src([DIST_DIR + '/**', '!' + DIST_DIR + '/**/*.html'])
  .pipe(gulp.dest(WEBSITE_DIR))
  .on('end', function() { callback(); });
});

gulp.task('clean', function(callback) {
  del.sync([DEV_DIR + '/js/sw/sw-toolbox']);
  del.sync([DIST_DIR]);
  callback();
});

gulp.task('clean-web', function(callback) {
  del.sync([WEBSITE_DIR] + '/*', {force: true});
  callback();
});

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile(DEV_DIR, false, function() {
    gulp.src(['node_modules/sw-toolbox/**'])
    .pipe(gulp.dest(DEV_DIR + '/js/sw/sw-toolbox'))
    .on('end', function() { callback(); });
  });
});

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(DIST_DIR, true, function() {
    gulp.src(['node_modules/sw-toolbox/**'])
    .pipe(gulp.dest(DIST_DIR + '/js/sw/sw-toolbox'))
    .on('end', function() { 
      gulp.src([DEV_DIR + '/js/sw/**'])
      .pipe(gulp.dest(DIST_DIR + '/js/sw'))
      .on('end', function() { 
        callback();
      });
    });
    
    
  });
});

gulp.task("webpack", function(callback) {
    // run webpack
    webpack(webpackConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
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