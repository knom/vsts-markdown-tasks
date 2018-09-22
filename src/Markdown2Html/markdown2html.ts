/// <reference path="../../types/markdown-it-lazy-headers/index.d.ts" />
/// <reference path="../../types/markdown-it-imsize/index.d.ts" />

// upload just build task to VSTS...
// tfx build tasks upload --task-path ./
// tfx build tasks delete --task-id 7346cf50-6858-11e6-b59a-6fe0ce03f800

// upload extension VSTS...
// tfx extension create --manifest-globs .\vss-extension.json
// upload to https://marketplace.visualstudio.com/manage/

// toolrunner help
// https://github.com/Microsoft/vsts-task-lib/blob/be60205671545ebef47d3a40569519da9b4d34b0/node/docs/vsts-task-lib.md


// tsc -w
// $env:INPUT_ewsConnectedServiceName = "EP1"
// $env:ENDPOINT_URL_EP1 = "https://mail.office365.com/"
// $env:ENDPOINT_AUTH_EP1 = '{ "parameters": { "username": "Some user", "password": "Some password" }, "scheme": "Some scheme" }'
// $env:ENDPOINT_DATA_EP1 = '{ "Key1": "Value1", "Key2", "Value2" }'
// $env:INPUT_appManifestXmlPath="C:\...\a.xml"

import tl = require("vsts-task-lib/task");
import trm = require("vsts-task-lib/toolrunner");
import q = require("q");
import fs = require("fs");
import mdit = require("markdown-it");
import lazyHeaders = require("markdown-it-lazy-headers");
import dust = require("dustjs-linkedin");
import util = require("util");
import mditAnchor = require("markdown-it-anchor");
import mditImsize = require("markdown-it-imsize");

function transformTemplate(templatePath: string, templateObject: any): any {
	let deferred: q.Deferred<any> = q.defer();

	if (templatePath) {
		fs.readFile(templatePath, "utf8", function (err: any, data: string): void {
			if (err) {
				throw err;
			}

			tl.debug(util.format("Applying HTML template using parameters %j...", JSON.stringify(templateObject)));

			dust.renderSource(data, templateObject, function (err: any, out: string): void {
				tl.debug("Applying HTML template succeeded!");

				if (err) {
					throw err;
				} else {
					deferred.resolve(out);
				}
			});
		});
	} else {
		deferred.resolve(templateObject.body);
	}

	return deferred.promise;
}

function throwIfDirectory(parameter: string, path: string): void {
	if (!path) {
		return;
	}

	if (!fs.existsSync(path)) {
		return;
	}

	if (fs.lstatSync(path).isDirectory()) {
		let message: string = util.format("Parameter '%s=%s' should be a file but is a directory!", parameter, path);

		throw { message: message };
	}
}

function run(): void {
	try {
		let sourcesPath: string = tl.getVariable("System.DefaultWorkingDirectory");

		let markdownPath: string = tl.getPathInput("markdownPath", true, true);
		let htmlPath: string = tl.getPathInput("htmlPath", true);

		let templatePath: string = tl.getPathInput("templatePath", false, true);

		if (templatePath === sourcesPath) {
			templatePath = null;
		}

		let parameters: string = tl.getInput("parameters", false);

		throwIfDirectory("markdownPath", markdownPath);
		throwIfDirectory("htmlPath", htmlPath);
		throwIfDirectory("templatePath", templatePath);

		tl.debug("Reading markdown file " + markdownPath + " (UTF-8)...");
		fs.readFile(markdownPath, "utf8", function (err: any, data: any): void {
			if (err) {
				throw err;
			}

			tl.debug("Reading file " + markdownPath + " succeeded!");

			var md: mdit.MarkdownIt = mdit();
			md.use(lazyHeaders);
			md.use(mditAnchor, <mditAnchor.AnchorOptions>{
				level: 1,
				permalink: false
			});
			md.use(mditImsize, <mditImsize.ImSizeOptions>{
				autofill: true
			});

			tl.debug("Rendering markdown to html...");
			var result: any = md.render(data);
			tl.debug("Rendering markdown to html succeeded!");

			let parametersObject: any = null;

			if (!parameters) {
				parametersObject = { body: result };
			} else {
				try {
					parametersObject = JSON.parse(parameters);
				} catch (ex) {
					tl.setResult(tl.TaskResult.Failed, util.format("Parameter \"Paramaters\" contains illegal JSON \"%s\"", parameters));
					return;
				}
				parametersObject.body = result;
			}

			transformTemplate(templatePath, parametersObject).then(function (tresult: string): any {
				tl.debug("Writing HTML file " + htmlPath + "...");
				fs.writeFileSync(htmlPath, tresult);
				tl.debug("Writing HTML file " + htmlPath + " succeeded!");

				tl.setResult(tl.TaskResult.Succeeded, "Successfully transformed markdown file " + markdownPath + " to HTML file " + htmlPath);
			});
		});
	} catch (err) {
		// handle failures in one place
		tl.setResult(tl.TaskResult.Failed, err.message);
	}
}

run();
