'use strict';

var fs = require('fs');
var path = require('path');
var del = require('del');
var tslint = require('gulp-tslint');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var shell = require('shelljs');
var spawn = require('child_process').spawn;
var gutil = require('gulp-util');
var typescript = require("gulp-typescript");

var copyNodeModulesToTasks = function (done) {
    fs.readdirSync('src').forEach(function (file) {
        var filePath = path.join('dist', 'src', file);
        if (fs.statSync(filePath).isDirectory()) {
            try {
                if (fs.statSync(path.join(filePath, 'task.json')).isFile()) {
                    shell.cp('-rf', 'dist/node_modules', filePath);
                }
            } catch (e) {
                /* swallow error: not a task directory */
            }
        }
    });
    done();
};

var executeCommand = function (cmd, dir, done) {
    gutil.log('Running command: ' + cmd);
    var pwd = shell.pwd();
    if (undefined !== dir) {
        gutil.log(' Working directory: ' + dir);
        shell.cd(dir);
    }
    shell.exec(cmd, {
        silent: true
    }, function (code, stdout, stderr) {
        gutil.log(' stdout: ' + stdout);
        if (code !== 0) {
            gutil.log('Command failed: ' + cmd + '\nManually execute to debug');
            gutil.log(' stderr: ' + stderr);
        }
        shell.cd(pwd);
        done();
    });
};

var createVsixPackage = function (done) {
    if (!shell.which('tfx')) {
        gutil.log('Packaging requires tfx cli. Please install with `npm install tfx-cli -g`.');
        done();
        return;
    }
    var packagingCmd = 'tfx extension create --manifest-globs vss-extension.json --root dist/src --output-path dist';
    executeCommand(packagingCmd, shell.pwd(), done);
};

var getNodeDependencies = function (done) {
    gutil.log('Copy package.json to dist directory');
    shell.mkdir('-p', 'dist/node_modules');
    shell.cp('-f', 'package.json', 'dist');

    gutil.log('Fetch node modules to package with tasks');
    var npmPath = shell.which('npm');
    var npmInstallCommand = '"' + npmPath + '" install --production';
    executeCommand(npmInstallCommand, 'dist', done);
};

// Tasks
gulp.task('clean', function (done) {
    del('dist').then(function () {
        done();
    });
});

gulp.task('tests:clean', function (done) {
    del('coverage').then(function () {
        del('test/out').then(function () {
            del('test/*.js').then(function () {
                del('test/*.js.*').then(function () {
                    done();
                });
            });
        });
    });
});

gulp.task('lint', ['clean'], function () {
    return gulp.src('src/Markdown2Html/markdown2html.ts')
        .pipe(tslint())
        .pipe(tslint.report());
});

gulp.task('markdown2html:build', function () {
    var tsProject = typescript.createProject('src/markdown2html/tsconfig.json');
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('tests:build', ['build', 'tests:clean', 'tests:lint'], function () {
    var tsProject = typescript.createProject('test/tsconfig.json');
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('tests:lint', ['tests:clean'], function () {
    return gulp.src('test/*.ts')
        .pipe(tslint())
        .pipe(tslint.report());
});

gulp.task('build', ['markdown2html:build', 'lint'], function () {
    return gulp.src('src/**/*', {
            base: '.'
        })
        .pipe(gulp.dest('dist'));
});

gulp.task('pre-test', ['build'], function () {
    return gulp.src('src/**/*.js')
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire());
});

// gulp.task('test', gulp.parallel('mocha-test', 'pester-test'));

gulp.task('test', ['tests:build', 'pre-test'],
    function (done) { //'pre-test',
        var mochaErr;

        gulp.src('test/**/test.js')
            .pipe(mocha({
                reporter: 'mocha-junit-reporter'
            }))
            .on('error', function (err) {
                mochaErr = err;
            })
            .on('end', function () {
                // process.exit();
                done(mochaErr);
            })
            .pipe(plumber())
            .pipe(istanbul.writeReports());
    });

gulp.task('test:cli', ['tests:build', 'pre-test'],
    function (done) {
        var mochaErr;

        gulp.src('test/**/test.js')
            .pipe(mocha({}))
            .on('error', function (err) {
                mochaErr = err;
            })
            .on('end', function () {
                // process.exit();
                done(mochaErr);
            })
            .pipe(plumber())
            .pipe(istanbul.writeReports());
    });

gulp.task('default');

gulp.task('package', function (done) {
    // gulp.task('package', ['test'], function (done) {
    getNodeDependencies(function () {
        // TODO We need a per task dependency copy
        copyNodeModulesToTasks(function () {
            done();
        });
    });
});