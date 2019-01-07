"use strict";

var gulp = require("gulp"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    htmlmin = require("gulp-htmlmin"),
    uglify = require("gulp-uglify"),
    merge = require("merge-stream"),
    pipeline = require('readable-stream').pipeline,
    del = require("del"),
    bundleconfig = require("./distbundlesconfig.json");

var regex = {
    css: /\.css$/,
    html: /\.(html|htm)$/,
    js: /\.js$/,
    scss: /\.scss$/
};

gulp.task("min:js", function () {
    var tasks = getBundles(regex.js).map(function (bundle) {
        return pipeline(
            gulp.src(bundle.inputFiles, { base: "." }),
            uglify(),
            concat(bundle.outputFileName),
            gulp.dest(".")
        );
    });
    return merge(tasks);
});

gulp.task("copy:vendor", function () {

    gulp.src('./node_modules/bootstrap/dist/css/*.{css,map}')
        .pipe(gulp.dest('wwwroot/vendor/css'));

    gulp.src('./node_modules/bootstrap/dist/js/*.{js,map}')
        .pipe(gulp.dest('wwwroot/vendor/js'));

    gulp.src('./node_modules/jquery/dist/jquery*.{js,map}')
        .pipe(gulp.dest('wwwroot/vendor/js'));

    gulp.src('./node_modules/qunit/qunit/*.{js,map}')
        .pipe(gulp.dest('wwwroot/vendor/js'));

    gulp.src('./node_modules/qunit/qunit/*.{css,map}')
        .pipe(gulp.dest('wwwroot/vendor/css'));

    return gulp.src('./node_modules/popper.js/dist/*.{js,map}')
        .pipe(gulp.dest('wwwroot/vendor/js'));

    //gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}')
    //    .pipe(gulp.dest('wwwroot/fonts'));

});

gulp.task("clean", function () {
    var files = bundleconfig.map(function (bundle) {
        return bundle.outputFileName;
    });

    return del(files);
});

function getBundles(regexPattern) {
    return bundleconfig.filter(function (bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}
