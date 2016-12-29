"use strict";
var gulp = require("gulp");
var typescript = require("gulp-typescript");
var bump = require("gulp-bump");
var exec = require('child_process').exec;
var merge = require('merge-stream');
var semver = require('semver');
var fs = require('fs');
var jeditor = require("gulp-json-editor");

var args = require("yargs");

gulp.task('default', ['build']);

gulp.task('build', function () {
    var tsProject = typescript.createProject('tsconfig.json');
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest('dest/'));
});

gulp.task('watch', ['build'], function () {
    gulp.watch('**/*.ts', ['build']);
});

gulp.task('versionAdd', function () {
    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    var oldVersion = pkg.version;

    var argv = args.argv;
    var type = argv.type;
    var version = argv.version;
    var options = {};
    
    if (!type){
        type = "patch";
    }
    options.type = type;

    var newVersion = semver.inc(oldVersion, type);
    options.version = newVersion;

    var bump1 = gulp
        .src(['task.json'])
        .pipe(jeditor(function(json){
            json.version = {
                "Major": semver.major(newVersion).toString(),
                "Minor": semver.minor(newVersion).toString(),
                "Patch": semver.patch(newVersion).toString()
            };
            return json;    
        }))
        .pipe(gulp.dest('./'));

    var bump2 = gulp
        .src(['package.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('./'));
    
    var bump3 = gulp
        .src(['../vss-extension.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('../'));
    
    return merge(bump1, bump2, bump3);
});

gulp.task('package', function (cb) {
    exec('tfx extension create --manifest-globs ./vss-extension.json', {cwd: "../"}, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});