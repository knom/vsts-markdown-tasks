import ma = require("azure-pipelines-task-lib/mock-answer");
import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");

const taskPath: string = path.join(__dirname, "..", "dist", "Markdown2Html", "markdown2html.js");
const markdownPath: string = "**/*.md,!**/node_modules/**";
const templatePath: string = path.join(__dirname, "sample-md-files", "Template.html");
const markdownFileFound: string[] = [
    path.join(__dirname, "sample-md-files", "Simple.md"),
];
const htmlOutPath: string = path.join(__dirname, "out");

const taskMock: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);
taskMock.setInput("mode", "multiFiles");
taskMock.setInput("markdownPathPattern", markdownPath);
// taskMock.setInput("templatePath", templatePath);
taskMock.setInput("htmlOutDir", htmlOutPath);

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    checkPath: {},
    findMatch: {},
};
// answers.checkPath[markdownPath] = true;
answers.checkPath[templatePath] = true;
answers.findMatch[markdownPath.replace(",", "\n")] = markdownFileFound;

taskMock.setAnswers(answers);
taskMock.run();
