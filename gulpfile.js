"use strict";
var gulp = require("gulp");
var typescript = require("gulp-typescript");
var bump = require("gulp-bump");
var exec = require('child_process').exec;
var merge = require('merge-stream');
var semver = require('semver');
var fs = require('fs-extra');
var jeditor = require("gulp-json-editor");

var args = require("yargs");

gulp.task('default', ['package']);

gulp.task('versionAdd', function () {
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
        .src(['./markdown2html/package.json'])
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

gulp.task('package', function (cb) {
    gulp.src(['./markdown2html/markdown2html.js', 
                './markdown2html/package.json', 
                './markdown2html/task.json', 
                './markdown2html/icon.png'])
        .pipe(gulp.dest('./out'))
		.on('end', function(){
			console.log("Renaming folders..");
			fs.renameSync("./markdown2html","markdown2html.old");
			fs.renameSync("./out","markdown2html");
				
			console.log("Running npm install --only=production");
			exec('npm install --only=production', { cwd: "./markdown2html"}, function (err, stdout, stderr) {
				console.log(stdout);
				console.log(stderr);
				
				if (err)
					cb(err);
				
				exec('tfx extension create --manifest-globs ./vss-extension.json', function (err, stdout, stderr) {
					console.log(stdout);
					console.log(stderr);
										
					console.log("Renaming folders back..");			
					
					fs.removeSync("./markdown2html/");
					fs.renameSync("./markdown2html.old","./markdown2html");
					cb(err);
				});
			});
		});
	
	
});