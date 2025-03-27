"use strict";

const gulp = require("gulp");
const packagedef = require("./package.json");
const replace = require('gulp-replace');

//    concat = require("gulp-concat"),
//    cssmin = require("gulp-cssmin"),
//    htmlmin = require("gulp-htmlmin"),
//    terser = require('gulp-terser'),
//    merge = require("merge-stream"),
//    sourcemaps = require("gulp-sourcemaps"),
//    pipeline = require('readable-stream').pipeline,
//    del = require("del"),
//    bundleconfig = require("./tooling/distbundlesconfig.json"),
//    replace = require('gulp-replace'),
//    rename = require('gulp-rename'),
//    jsdoc = require('gulp-jsdoc3');

////////////////////////////////
//// build minimised distribution packages

//// get the package bundle definitions 
//function getBundles(regexPattern) {
//    return bundleconfig.filter(function (bundle) {
//        return regexPattern.test(bundle.outputFileName);
//    });
//}

//// minimse and bundle
//function BundleMinToDist() {
//    var tasks = getBundles(/\.js$/).map(function (bundle) {
//        return gulp.src(bundle.inputFiles, { base: "." })
//            .pipe(sourcemaps.init())
//            .pipe(concat(bundle.outputFileName))
//            .pipe(terser())
//            .pipe(sourcemaps.write('.'))
//            .pipe(gulp.dest("."));
//    });
//    return merge(tasks);
//}

//// mimise and map individual files
//function MinifyAndMapToDist() {
//    var tasks = gulp.src('src/**/*.js')
//    .pipe(sourcemaps.init())
//        .pipe(terser())
//        .pipe(rename({ suffix: '.min' }))
//        .pipe(sourcemaps.write('.'))
//        .pipe(gulp.dest('dist'));
//    return merge(tasks);
//}

async function CleanDistFolder() {
    console.log("Cleaning dist folder...");
    const del = await import('del');
    return del.deleteAsync(['./dist/*']);
}

//////////////////////////////////////
//// Build documentation site from js content using jsdoc

//// remove previous output
async function CleanDocsFolder() {
    console.log("Cleaning docs folder...");
    const del = await import('del');
    return del.deleteAsync(['./docs/*']);
}

// extract docs and compile to html, adds in readme.md from docs-src
function CompileDocs(done) {
    const { exec } = require('child_process');

    console.log("Building documentation.");
    exec('npx jsdoc -c ./configs/jsdoc.json', (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return done(err);
        }
        console.log(stdout);
        done();
    });
}

// static docs files that jsdocs won't put where we want
function CopyDocStatics() {
    return gulp.src('./docs-src/configs/**').pipe(gulp.dest('./docs/configs/'));
}

// post processing to put dot delimeters back into names
//
function ProcessVersion() {
    return gulp.src("./docs/*.html").pipe(replace(/{@packageversion}/g, packagedef.version)).pipe(gulp.dest("./docs"));
}

function ProcessName(nsname) {
    var badName = nsname.replace(/\./g, "");
    var regx = new RegExp(badName + "(?![a-zA-Z]*\.html|[a-zA-Z]*\")", "gi");

    return gulp.src("./docs/*.html").pipe(replace(regx, nsname)).pipe(gulp.dest("./docs"));
}

// call dot processing for each update required so can chain one after the other .. crude but works
function ProcessDocs1(done) {
    return ProcessName("MeadCo.ScriptX.Print.Licensing");
}

function ProcessDocs2() {
    return ProcessName("MeadCo.ScriptX.Print.HTML");
}

function ProcessDocs3() {
    return ProcessName("MeadCo.ScriptX.Print.PDF");
}

function ProcessDocs4() {
    return ProcessName("MeadCo.ScriptX.Print");
}

//// post processing to put dot delimeters back into names
////
//function ProcessName(nsname) {

//    var badName = nsname.replace(/\./g, "");

//    console.log("Replace: " + badName + " with: " + nsname);

////    var regx = new RegExp(badName + "(?![a-zA-Z]*\.html)", "gi")
////    return gulp.src("./docs/*.html").pipe(replace(regx, nsname)).pipe(gulp.dest("./docs"));

//    var regx = new RegExp(badName + "(?![a-zA-Z]*\.html)", "gi")
//    return gulp.src("./docs/**/*.html").pipe(replace(regx, nsname)).pipe(gulp.dest("./docs"));
//}

//// call dot processing for each update required so can chain one after the other .. crude but works
//gulp.task('ProcessDocs1', function () {
//    return ProcessName("MeadCo.ScriptX.Print.Licensing");
//});

//gulp.task('ProcessDocs2', function () {
//    return ProcessName("MeadCo.ScriptX.Print.HTML");
//});

//gulp.task('ProcessDocs3', function () {
//    return ProcessName("MeadCo.ScriptX.Print.PDF");
//});

//gulp.task('ProcessDocs4', function () {
//    return ProcessName("MeadCo.ScriptX.Print");
//});

//// static docs files that jsdocs won't put where we want
//gulp.task('DocStatics', function () {
//    return gulp.src('./docs-src/build/**').pipe(gulp.dest('./docs/build/'));
//});

//gulp.task('Bundle1', function () {
//    return BundleMinToDist();
//});

//gulp.task('Minify1', function () {
//    return MinifyAndMapToDist();
//});

//gulp.task("CleanDist", function () {
//    return CleanDistFolder();
//});

//gulp.task("CleanDocs", function () {
//    return CleanDocsFolder();
//});

/////////////////////////////////////////////
//// callable processes to build outputs.
////
//gulp.task('Minify', gulp.series('CleanDist', gulp.series(BundleMinToDist, MinifyAndMapToDist)));

//gulp.task('Clean', gulp.parallel('CleanDist', 'CleanDocs'));

//gulp.task('MakeDocs', gulp.series('CompileDocs', 'ProcessDocs1', 'ProcessDocs2', 'ProcessDocs3', 'ProcessDocs4','DocStatics'));

//gulp.task('BuildDocs', gulp.series('CleanDocs','MakeDocs'));

//gulp.task('BuildDist', gulp.series('Clean', gulp.parallel(gulp.series(BundleMinToDist, MinifyAndMapToDist), 'MakeDocs')));



exports.Clean = gulp.parallel(CleanDistFolder, CleanDocsFolder);
exports.BuildDocs = gulp.series(CleanDocsFolder, gulp.series(CompileDocs, ProcessDocs1, ProcessDocs2, ProcessDocs3, ProcessDocs4, ProcessVersion,CopyDocStatics));

