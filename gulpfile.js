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

var gulpDocumentation = require('gulp-documentation');

var regex = {
    css: /\.css$/,
    html: /\.(html|htm)$/,
    js: /\.js$/,
    scss: /\.scss$/
};

var docFiles = [
    {
        inputName : "./src/meadco-core.js",
        outputFolder : "core"
    },
    {
        inputName: "./src/meadco-scriptxprint.js",
        outputFolder: "scriptxprint"
    },
    {
        inputName: "./src/meadco-scriptxprinthtml.js",
        outputFolder: "scriptxprinthtml"
    },
    {
        inputName: "./src/meadco-scriptxprintlicensing.js",
        outputFolder: "scriptxprintlicensing"
    },
    {
        inputName: "./src/meadco-scriptxfactory.js",
        outputFolder: "scriptxfactory"
    }
];


function getBundles(regexPattern) {
    return bundleconfig.filter(function (bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}

function mintoDist() {
    var tasks = getBundles(regex.js).map(function (bundle) {
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

function docOutputLocation(fmt, doc) {
    return './jsdoc/' + fmt + '/' + doc.outputFolder;
}


function buildDocs(fmt) {
    return gulp.src('../../src/*.js')
        .pipe(gulpDocumentation(fmt, {},
            {
                name: 'ScriptX.Services Client',
                version: '1.5.0'
            }))
        .pipe(gulp.dest('./jsDoc/' + fmt));
}

function buildDocFiles(fmt) {
    var tasks = docFiles.map(function (doc) {
        return gulp.src(doc.inputName)
            .pipe(
            gulpDocumentation(
                fmt, {
                    shallow: true,
                    hljs:
                    {
                        highlightAuto: true
                    }
                },
                {
                    name: 'ScriptX.Services Client',
                    version: '1.5.0'
                }
            )
        )
        .pipe(gulp.dest(docOutputLocation(fmt,doc)));
        
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
    return del(['./jsDoc/**', '!./jsDoc'], { force: true }).then(paths => { console.log('Deleted:\n', paths.join('\n')); });
}

exports.buildDist = gulp.series(cleanDist, mintoDist);

exports.cleanDocs = cleanDocs;

exports.buildHtmlDocs = () => { return buildDocs('html'); };
exports.buildHtmlDocFiles = gulp.series(cleanDocs, () => { return buildDocFiles('html'); });

exports.buildMdDocs = () => { buildDocs('md'); };
exports.buildMdDocFiles = gulp.series(cleanDocs, () => { return buildDocFiles('md'); });

exports.buildJsonDocs = () => { buildDocs('json'); };
exports.buildJSonDocFiles = gulp.series(cleanDocs, () => { return buildDocFiles('json'); });

exports.buildDocs = gulp.series(cleanDocs, gulp.parallel(exports.buildHtmlDocFiles, exports.buildMdDocFiles));

