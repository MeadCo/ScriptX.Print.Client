"use strict";

const gulp = require("gulp");
const packagedef = require("./package.json");
const replace = require('gulp-replace');
const path = require("path");
const fs = require("fs");


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

/**
 * Helper function to get all files with a specific extension from a directory
 */
function getAllFiles(dir, ext) {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(getAllFiles(fullPath, ext));
        } else if (item.isFile() && path.extname(item.name) === ext) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Process namespace strings in documentation files (to put dot delimeters back into names)
 */
function ProcessNamespacesAndVersion(cb) {
    const namespaces = [
        "MeadCo.ScriptX.Print.Licensing",
        "MeadCo.ScriptX.Print.HTML",
        "MeadCo.ScriptX.Print.PDF",
        "MeadCo.ScriptX.Print"
    ];

    console.log("Processing namespace strings in documentation files...");

    try {
        // Get all HTML files in docs directory
        const docFiles = getAllFiles('./docs', '.html');

        // Process each namespace in each file
        for (const file of docFiles) {
            let content = fs.readFileSync(file, 'utf8');

            for (const namespace of namespaces) {
                const badName = namespace.replace(/\./g, "");
                const regex = new RegExp(badName + "(?![a-zA-Z]*\.html|[a-zA-Z]*\")", "gi");
                content = content.replace(regex, namespace);
            }

            content = content.replace(/{@packageversion}/g, packagedef.version);

            // Remove the footer element and its content (the generated date etc.)
            content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');

            fs.writeFileSync(file, content, 'utf8');
        }

        console.log('Namespace processing completed');
        cb();
    } catch (err) {
        cb(err);
    }
}


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
exports.BuildDocs = gulp.series(CleanDocsFolder, gulp.series(CompileDocs, ProcessNamespacesAndVersion,CopyDocStatics));

