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
    "MeadCo.ScriptX.Print.HTML",
    "MeadCo.ScriptX.Print.PDF",
    "MeadCo.ScriptX.Print.Licensing"
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

exports.buildDocs = (done) => {

    console.log("start builddocs");
    const config = require('./tooling/docs/jsdoc.json');

    console.log("loaded config");

    var p = pipeline(gulp.src(['readme.md', '.src/**/*.js'], { read: false }),jsdoc(config));

    console.log("Created pipeline");

    return p;
}

exports.postProcessDocs2 = (done) => {

    console.log("Start postProcessDocs");

    var tasks = namespaces.map((nsname) => {

        var badName = nsname.replace(/\./g, "");

        console.log("Replace: " + badName + " with: " + nsname);

        var regx = new RegExp(badName + "(?![a-zA-Z]*\.html)", "gi")

        return gulp.src("./docs/*.html").pipe(replace(regx, nsname)).pipe(gulp.dest("./docs2"));

    });

    console.log("Done postProcessDocs");

    return merge(tasks);
} 

exports.postProcessDocs = (done) => {

    console.log("Start postProcessDocs");

    var nsname = "MeadCo.ScriptX.Print";
    var badName = nsname.replace(/\./g, "");

    console.log("Replace: " + badName + " with: " + nsname);

    var regx = new RegExp(badName + "(?![a-zA-Z]*\.html)", "gi")
    return gulp.src("./docs/*.html").pipe(replace(regx, nsname)).pipe(gulp.dest("./docs2"));
 
} 

exports.makeApiDocs = (done) => {
    return gulp.series(exports.buildDocs(done), exports.postProcessDocs(done));
}

exports.buildDist = gulp.series(cleanDist, gulp.parallel(mintoDist, exports.makeApiDocs));

