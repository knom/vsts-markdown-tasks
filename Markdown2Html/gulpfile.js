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