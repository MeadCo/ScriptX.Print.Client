"use strict";

const gulp = require("gulp"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    htmlmin = require("gulp-htmlmin"),
    terser = require('gulp-terser'),
    merge = require("merge-stream"),
    sourcemaps = require("gulp-sourcemaps"),
    pipeline = require('readable-stream').pipeline,
    del = require("del"),
    bundleconfig = require("./tooling/distbundlesconfig.json"),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    jsdoc = require('gulp-jsdoc3');

//////////////////////////////
// build minimised distribution packages

// get the package bundle definitions 
function getBundles(regexPattern) {
    return bundleconfig.filter(function (bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}

// minimse and bundle
function BundleMinToDist() {
    var tasks = getBundles(/\.js$/).map(function (bundle) {
        return pipeline(
            gulp.src(bundle.inputFiles, { base: "." }),
            sourcemaps.init(),
            concat(bundle.outputFileName),
            terser(),
            sourcemaps.write('.'),
            gulp.dest(".")
        );
    });
    return merge(tasks);
}

// mimise and map individual files
function MinifyAndMapToDist() {
    return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
        .pipe(terser())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
}

// clean any previous bundle packages 
gulp.task('CleanDist', function () {
    del('dist/**', { force: true });
    return Promise.resolve('the value is ignored');
});

////////////////////////////////////
// Build documentation site from js content using jsdoc

// remove previous output
function cleanDocs() {
    return del('./docs');
}

// extract docs and compile to html, adds in readme.md from docs-src
gulp.task('CompileDocs', function (done) {
    const config = require('./tooling/docs/jsdoc.json');
    gulp.src(['readme.md', '.src/**/*.js'], { read: false }).pipe(jsdoc(config,done));
});

// post processing to put dot delimeters back into names
//
function ProcessName(nsname) {

    var badName = nsname.replace(/\./g, "");

    // console.log("Replace: " + badName + " with: " + nsname);

    var regx = new RegExp(badName + "(?![a-zA-Z]*\.html)", "gi")
    return gulp.src("./docs/*.html").pipe(replace(regx, nsname)).pipe(gulp.dest("./docs"));
}

// call dot processing for each update required so can chain one after the other .. crude but works
gulp.task('ProcessDocs1', function () {
    return ProcessName("MeadCo.ScriptX.Print.Licensing");
});

gulp.task('ProcessDocs2', function () {
    return ProcessName("MeadCo.ScriptX.Print.HTML");
});

gulp.task('ProcessDocs3', function () {
    return ProcessName("MeadCo.ScriptX.Print.PDF");
});

gulp.task('ProcessDocs4', function () {
    return ProcessName("MeadCo.ScriptX.Print");
});

// static docs files that jsdocs won't put where we want
gulp.task('DocStatics', function () {
    return gulp.src('./docs-src/build/**').pipe(gulp.dest('./docs/build/'));
});

///////////////////////////////////////////
// callable processes to build outputs.
//
gulp.task('Minify', gulp.series('CleanDist', gulp.parallel(BundleMinToDist, MinifyAndMapToDist)));

gulp.task('MakeDocs', gulp.series('CompileDocs', 'ProcessDocs1', 'ProcessDocs2', 'ProcessDocs3', 'ProcessDocs4','DocStatics'));

gulp.task('BuildDocs', gulp.series(cleanDocs,'MakeDocs'));

gulp.task('BuildDist', gulp.series(gulp.parallel('CleanDist', cleanDocs), gulp.parallel(BundleMinToDist, 'MakeDocs')));

gulp.task('Clean', gulp.parallel('CleanDist', cleanDocs));

