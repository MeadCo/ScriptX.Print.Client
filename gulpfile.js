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

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require("fs");

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

exports.makeApiDocs = (done) => {
    var output = jsdoc2md.renderSync(
        {
            "configure": "tooling/docs/jsdoc.json",
            "files": "src/*.js",
            "global-index-format": "none",
            "partial": [
                "tooling/docs/header.hbs",
                "tooling/docs/link.hbs",
                "tooling/docs/body.hbs"
            ]
        }); // .then(output => fs.writeFileSync("docs/api.md"));

    namespaces.forEach((nsname) => {

        var badName = nsname.replace(/\./g, "");

        console.log("Replace: " + badName + " with: " + nsname);

        output = output.replace(new RegExp(badName, "g"), nsname);

    });

    output = output.replace(/MeadCoScriptXPrint/g, "MeadCo.ScriptX.Print");

    fs.writeFileSync("docs/api.md", output);
    done();
 };

exports.buildDist = gulp.series(cleanDist, gulp.parallel(mintoDist, exports.makeApiDocs));

