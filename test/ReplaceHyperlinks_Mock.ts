import path = require("path");
import ma = require("vsts-task-lib/mock-answer");
import tmrm = require("vsts-task-lib/mock-run");

const taskPath: string = path.join(__dirname, "..", "src", "Markdown2Html", "markdown2html.js");
const markdownPath: string = path.join(__dirname, "sample-md-files", "ReplaceHyperlinks.md");
const htmlPath: string = path.join(__dirname, "sample-md-files", "Output.html");

const taskMock: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);
taskMock.setInput("mode", "singleFile");
taskMock.setInput("markdownPath", markdownPath);
taskMock.setInput("htmlPath", htmlPath);

taskMock.setInput("replaceHyperlinksMD2HTML", "true");

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    checkPath: {},
};
answers.checkPath[markdownPath] = true;

taskMock.setAnswers(answers);
taskMock.run();
