"use strict";

var gulp = require("gulp");

function copyvendor() {

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

}


exports.copyvendor = copyvendor;

