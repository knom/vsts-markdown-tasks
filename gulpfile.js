"use strict";
var gulp = require("gulp");
var del = require("del");
var typescript = require("gulp-typescript");
var bump = require("gulp-bump");
var exec = require('child_process').exec;
var merge = require('merge-stream');
var semver = require('semver');
var fs = require('fs-extra');
var path = require('path')
var jeditor = require("gulp-json-editor");
var args = require("yargs");

gulp.task('default', ['build']);

gulp.task('build', ['build:markdown2html']);

gulp.task('build:markdown2html', function () {
    var tsProject = typescript.createProject('./markdown2html/tsconfig.json');
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(function(file) {
			return file.base;
		}));
});

gulp.task('watch', ['watch:markdown2html']);

gulp.task('watch:markdown2html', ['build:markdown2html'], function () {
    gulp.watch('./markdown2html/**/*.ts', ['build:markdown2html']);
});

gulp.task('addVersion', function () {
    var pkg = JSON.parse(fs.readFileSync('./vss-extension.json', 'utf8'));
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

    console.log("New Version is: " + newVersion);

    var bump1 = gulp
        .src(['./markdown2html/task.json'])
        .pipe(jeditor(function(json){
            json.version = {
                "Major": semver.major(newVersion).toString(),
                "Minor": semver.minor(newVersion).toString(),
                "Patch": semver.patch(newVersion).toString()
            };
            return json;    
        }))
        .pipe(gulp.dest(function(file) {
			return file.base;
		}));

    var bump2 = gulp
        .src(['./package.json'])
        .pipe(bump(options))
        .pipe(gulp.dest(function(file) {
			return file.base;
		}));
    
    var bump3 = gulp
        .src(['./vss-extension.json'])
        .pipe(bump(options))
        .pipe(gulp.dest(function(file) {
			return file.base;
		}));
    
    return merge(bump1, bump2, bump3);
});

gulp.task('package:clean', function () {
    return del(['package/*/**']);
});

gulp.task('package', ['package:copy'], function () {	
});

gulp.task('package:copy', ['package:clean'], function () {
    var main = gulp.src([
                './extension-icon*.png', 'LICENSE', 'README.md', 'vss-extension.json', 'package.json', 
                'docs/**/*', 
                './markdown2html/markdown2html.js', './markdown2html/package.json', './markdown2html/task.json', './markdown2html/icon.png'],
                 {base: "."})
        .pipe(gulp.dest("./package"));

    return merge(main);	
});