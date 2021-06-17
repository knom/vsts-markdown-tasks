import ma = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");

const taskPath: string = path.join(__dirname, "..", "dist", "Markdown2Html", "markdown2html.js");
const markdownPathPattern: string = path.join(__dirname, "sample-md-files", "Simple*.md");
const markdownPath: string = path.join(__dirname, "sample-md-files", "Simple.md");

const taskMock: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

taskMock.setInput("mode", "multiFile");
taskMock.setInput("markdownPathPattern", markdownPathPattern);
taskMock.setInput("htmlOutDir", "");

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    checkPath: {},
    findMatch: {},
};
answers.findMatch[markdownPathPattern] = [markdownPath];
answers.checkPath[markdownPath] = true;

taskMock.setAnswers(answers);
taskMock.run();
