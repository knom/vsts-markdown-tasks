import ma = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");

const taskPath: string = path.join(__dirname, "..", "src", "Markdown2Html", "markdown2html.js");
const markdownPath: string = path.join(__dirname, "sample-md-files", "UtF8.md");
const htmlPath: string = path.join(__dirname, "sample-md-files", "Output.html");

const taskMock: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);
taskMock.setInput("mode", "singleFile");
taskMock.setInput("markdownPath", markdownPath);
taskMock.setInput("htmlPath", htmlPath);

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    checkPath: {},
};
answers.checkPath[markdownPath] = true;

taskMock.setAnswers(answers);
taskMock.run();
