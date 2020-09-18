"use strict";

const gulp = require("gulp"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    htmlmin = require("gulp-htmlmin"),
    uglify = require("gulp-uglify"),
    merge = require("merge-stream"),
    pipeline = require('readable-stream').pipeline,
    del = require("del"),
    bundleconfig = require("./distbundlesconfig.json");

const replace = require('gulp-replace');
const jsdoc = require('gulp-jsdoc3');

// the md doc output is, e.g. MeadCoScriptXPrint for MeadCo.ScriptX.Print
// this table drives back replacement
const namespaces = [
    "MeadCo.ScriptX.Print",
    "Print.Licensing",
    "Print.PDF",
    "Print.HTML",
];

function getBundles(regexPattern) {
    return bundleconfig.filter(function (bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}

function mintoDist() {
    var tasks = getBundles(/\.js$/).map(function (bundle) {
        return pipeline(
            gulp.src(bundle.inputFiles, { base: "." }),
            uglify({ 
                output: {
                    comments: "some"
                }
                }),
            concat(bundle.outputFileName),
            gulp.dest(".")
        );
    });
    return merge(tasks);
}

function cleanDist() {
    var files = bundleconfig.map(function (bundle) {
        return bundle.outputFileName;
    });

    return del(files, { force: true });
}

function cleanDocs() {
    return del('./docs');
}

gulp.task('CompileDocs', function (done) {
    const config = require('./tooling/docs/jsdoc.json');
    gulp.src(['readme.md', '.src/**/*.js'], { read: false }).pipe(jsdoc(config,done));
});

function ProcessName(nsname) {

    var badName = nsname.replace(/\./g, "");

    // console.log("Replace: " + badName + " with: " + nsname);

    var regx = new RegExp(badName + "(?![a-zA-Z]*\.html)", "gi")
    return gulp.src("./docs/*.html").pipe(replace(regx, nsname)).pipe(gulp.dest("./docs"));
}

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

gulp.task('MakeDocs', gulp.series('CompileDocs', 'ProcessDocs1', 'ProcessDocs2', 'ProcessDocs3', 'ProcessDocs4'));

gulp.task('BuildDocs', gulp.series(cleanDocs,'MakeDocs'));

gulp.task('BuildDist', gulp.series(gulp.parallel(cleanDist,cleanDocs), gulp.parallel(mintoDist, 'MakeDocs')));
