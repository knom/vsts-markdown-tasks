"use strict";
var tl = require("vsts-task-lib/task");
var q = require("q");
var fs = require("fs");
var mdit = require("markdown-it");
var lazyHeaders = require("markdown-it-lazy-headers");
var dust = require("dustjs-linkedin");
function transformTemplate(templatePath, templateObject) {
    var deferred = q.defer();
    if (templatePath) {
        fs.readFile(templatePath, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            tl.debug("Applying HTML template...");
            dust.renderSource(data, templateObject, function (err, out) {
                tl.debug("Applying HTML template succeeded!");
                if (err) {
                    throw err;
                }
                else {
                    deferred.resolve(out);
                }
            });
        });
    }
    else {
        deferred.resolve(templateObject.body);
    }
    return deferred.promise;
}
function run() {
    try {
        var markdownPath_1 = tl.getPathInput('markdownPath', true, true);
        var htmlPath_1 = tl.getPathInput('htmlPath', true);
        var templatePath_1 = tl.getPathInput('templatePath', false, true);
        var parameters_1 = tl.getInput('parameters', false);
        tl.debug("Reading markdown file " + markdownPath_1 + " (UTF-8)...");
        fs.readFile(markdownPath_1, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            tl.debug("Reading file " + markdownPath_1 + " succeeded!");
            var md = mdit().use(lazyHeaders);
            tl.debug("Rendering markdown to html...");
            var result = md.render(data);
            tl.debug("Rendering markdown to html succeeded!");
            var parametersObject = null;
            if (!parameters_1) {
                parametersObject = { body: result };
            }
            else {
                parametersObject = JSON.parse(parameters_1);
                console.log(parametersObject);
                parametersObject.body = result;
            }
            transformTemplate(templatePath_1, parametersObject).then(function (tresult) {
                tl.debug("Writing HTML file " + htmlPath_1 + "...");
                tl.writeFile(htmlPath_1, tresult);
                tl.debug("Writing HTML file " + htmlPath_1 + " succeeded!");
                tl.setResult(tl.TaskResult.Succeeded, "Successfully transformed markdown file " + markdownPath_1 + " to HTML file " + htmlPath_1);
            });
        });
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
run();
//# sourceMappingURL=markdown2html.js.map