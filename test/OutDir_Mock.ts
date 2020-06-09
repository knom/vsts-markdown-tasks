import path = require("path");
import ma = require("vsts-task-lib/mock-answer");
import tmrm = require("vsts-task-lib/mock-run");

const taskPath: string = path.join(__dirname, "..", "src", "Markdown2Html", "markdown2html.js");
const markdownPathPattern: string = path.join(__dirname, "sample-md-files", "Simple*.md");
const markdownPath: string = path.join(__dirname, "sample-md-files", "Simple.md");

const taskMock: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

taskMock.setInput("mode", "multiFile");
taskMock.setInput("markdownPathPattern", markdownPathPattern);
taskMock.setInput("htmlOutDir", "");

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    checkPath: {},
    findMatch: {}
};
answers.findMatch[markdownPathPattern] = [markdownPath];
answers.checkPath[markdownPath] = true;

taskMock.setAnswers(answers);
taskMock.run();
