// tslint:disable-next-line:no-reference
/// <reference path="../../types/markdown-it-lazy-headers/index.d.ts" />
// tslint:disable-next-line:no-reference
/// <reference path="../../types/markdown-it-imsize/index.d.ts" />
// tslint:disable-next-line:no-reference
/// <reference path="../../types/markdown-it-replace-link/index.d.ts" />

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
// $env:ENDPOINT_AUTH_EP1 = '{ "parameters": { "username": "Some user",
// "password": "Some password" }, "scheme": "Some scheme" }'
// $env:ENDPOINT_DATA_EP1 = '{ "Key1": "Value1", "Key2", "Value2" }'
// $env:INPUT_appManifestXmlPath="C:\...\a.xml"

import dust = require("dustjs-linkedin");
import fs = require("fs");
import MarkdownIt = require("markdown-it");
import mditAnchor = require("markdown-it-anchor");
import mditImsize = require("markdown-it-imsize");
import lazyHeaders = require("markdown-it-lazy-headers");
import replaceLink = require("markdown-it-replace-link");
import path = require("path");
import q = require("q");
import Q = require("q");
import util = require("util");
import tl = require("vsts-task-lib/task");
import trm = require("vsts-task-lib/toolrunner");

function transformTemplate(templatePath: string, templateObject: any): q.Promise<any> {
    const deferred: q.Deferred<any> = q.defer();

    if (templatePath) {
        fs.readFile(templatePath, "utf8", (err: any, data: string) => {
            if (err) {
                throw err;
            }

            tl.debug(util.format("Applying HTML template using parameters %j...", JSON.stringify(templateObject)));

            dust.renderSource("{%esc:s}\n" + data + "{/esc}", templateObject, (error: any, out: string) => {
                tl.debug("Applying HTML template succeeded!");

                if (error) {
                    throw error;
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

function throwIfDirectory(parameter: string, checkpath: string): void {
    if (!checkpath) {
        return;
    }

    if (!fs.existsSync(checkpath)) {
        return;
    }

    if (fs.lstatSync(checkpath).isDirectory()) {
        const message: string = util.format("Parameter '%s=%s' should be a file but is a directory!",
            parameter, checkpath);

        throw { message };
    }
}

function throwIfNotDirectory(parameter: string, checkpath: string): void {
    if (!checkpath) {
        return;
    }

    if (!fs.existsSync(checkpath)) {
        return;
    }

    if (!fs.lstatSync(checkpath).isDirectory()) {
        const message: string = util.format("Parameter '%s=%s' should be a directory but is a file!", parameter,
            checkpath);

        throw { message };
    }
}

function processFile(markdownPath: string, templatePath: string, htmlOutDir: string,
                     htmlOutFile: string, parameters: any, passThruHTML: boolean,
                     replaceHyperlinks: boolean): q.Promise<[string, string]> {

    const deferred: q.Deferred<[string, string]> = q.defer();

    tl.debug("Reading markdown file " + markdownPath + " (UTF-8)...");
    fs.readFile(markdownPath, "utf8", (err: any, data: string) => {
        if (err) {
            throw err;
        }

        tl.debug("Reading file " + markdownPath + " succeeded!");

        const md: MarkdownIt = MarkdownIt({
            html: passThruHTML,
        });

        tl.debug("ReplaceHyperlinks = " + replaceHyperlinks);
        if (replaceHyperlinks) {
            md.use(replaceLink, <replaceLink.ReplaceLinkOptions>{
                replaceLink: (link: string) => {
                    return link.replace(/.md$/, ".html");
                },
            });
        }

        md.use(lazyHeaders);
        md.use(mditAnchor, <mditAnchor.AnchorOptions>{
            level: 1,
            permalink: false,
        });
        md.use(mditImsize, <mditImsize.ImSizeOptions>{
            autofill: true,
        });

        tl.debug("Rendering markdown to html...");
        const result: string = md.render(data);
        tl.debug("Rendering markdown to html succeeded!");

        let parametersObject: any = null;

        if (!parameters) {
            parametersObject = { body: result };
        } else {
            try {
                parametersObject = JSON.parse(parameters);
            } catch (ex) {
                tl.setResult(tl.TaskResult.Failed,
                    util.format("Parameter \"Paramaters\" contains illegal JSON \"%s\"", parameters));

                deferred.reject();
                return;
            }
            parametersObject.body = result;
        }

        transformTemplate(templatePath, parametersObject).then((tresult: string) => {
            let htmlPath = "";

            if (htmlOutFile) {
                htmlPath = htmlOutFile;
            } else if (htmlOutDir && htmlOutDir !== "") {
                htmlPath = path.join(htmlOutDir, path.basename(markdownPath.replace(".md", ".html")));
            } else {
                htmlPath = markdownPath.replace(".md", ".html");
            }

            tl.debug("Writing HTML file " + htmlPath + "...");
            fs.writeFileSync(htmlPath, tresult);
            tl.debug("Writing HTML file " + htmlPath + " succeeded!");

            deferred.resolve([markdownPath, htmlPath]);
        });
    });
    return deferred.promise;
}

function run(): void {
    try {
        const sourcesPath: string = tl.getVariable("System.DefaultWorkingDirectory");

        let markdownFiles: string[] = [];

        let htmlOutFile: string = "";
        let htmlOutDir: string = "";

        const singleOrMultiFileMode = tl.getInput("mode", true);
        if (singleOrMultiFileMode === "singleFile") {
            const markdownPath: string = tl.getPathInput("markdownPath", true, true);
            throwIfDirectory("markdownPath", markdownPath);

            htmlOutFile = tl.getPathInput("htmlPath", true);
            throwIfDirectory("htmlPath", htmlOutFile);

            markdownFiles.push(markdownPath);
        } else {
            const markdownSearchPatterns = tl.getDelimitedInput("markdownPathPattern", ",", true)
                .map((value) => value.trim());

            htmlOutDir = tl.getPathInput("htmlOutDir", false);
            throwIfNotDirectory("htmlOutDir", htmlOutDir);

            if (!fs.existsSync(htmlOutDir)) {
                fs.mkdirSync(htmlOutDir);
            }

            const matches = tl.findMatch("", markdownSearchPatterns);
            if (matches) {
                markdownFiles = matches;
            }
        }

        let templatePath: string = tl.getPathInput("templatePath", false, true);

        if (templatePath === sourcesPath) {
            templatePath = null;
        }

        const parameters: string = tl.getInput("parameters", false);

        let passThruHTML: boolean = tl.getBoolInput("passThruHTML", false);
        if (!passThruHTML) {
            passThruHTML = false;
        }
        const replaceHyperlinks: boolean = tl.getBoolInput("replaceHyperlinksMD2HTML", false);

        throwIfDirectory("templatePath", templatePath);

        const files = markdownFiles.map((markdownFile) => {
            return processFile(markdownFile, templatePath, htmlOutDir,
                htmlOutFile, parameters, passThruHTML, replaceHyperlinks);
        });

        Q.all(files).then((results) => {
            const fileLog = results.map((val) => val[0] + " ==> " + val[1]).join("\r\n");

            const message = `Successfully transformed ${files.length} markdown files to HTML files: \r\n${fileLog}`;

            // tslint:disable-next-line:no-console
            console.log(message);

            tl.setResult(tl.TaskResult.Succeeded, message);
        });

    } catch (err) {
        // handle failures in one place
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
