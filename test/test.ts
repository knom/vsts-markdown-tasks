import * as assert from "assert";
import * as ttm from "azure-pipelines-task-lib/mock-test";
import * as chai from "chai";
import * as fs from "fs";
import * as path from "path";
function readAndNormalize(filePath: string) {
    const content = fs.readFileSync(filePath, "utf8");

    const normalizeNewline = require("normalize-newline");
    return normalizeNewline(content.trim());
}

// tslint:disable-next-line:no-unused-expression
// tslint:disable-next-line:only-arrow-functions
describe("VSTS Markdown Task Tests", function() {
    this.timeout(10000);
    this.slow(1000);
    // tslint:disable-next-line:no-empty
    before(() => {
        // tslint:disable-next-line:no-string-literal
        // process.env["TASK_TEST_TRACE"] = "1";
        // tslint:disable-next-line:no-string-literal
        process.env["SYSTEM_DEFAULTWORKINGDIRECTORY"] = "DefaultWorkingDirectory";
        // tslint:disable-next-line:no-string-literal
        // process.env["SYSTEM_DEBUG"] = "true";
    });
    // tslint:disable-next-line:no-empty
    after(() => {
    });

    it("Should succeed with simple inputs, but lazy headers", (done: MochaDone) => {
        const taskPath: string = path.join(__dirname, "Simple_Mock.js");
        const expectedHtmlPath: string = path.join(__dirname, "sample-md-files", "Simple-expected.html");
        const actualHtmlPath: string = path.join(__dirname, "sample-md-files", "Output.html");

        const testRunner: ttm.MockTestRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 0, "should have no errors");

        const html: string = readAndNormalize(actualHtmlPath);
        const markdown: string = readAndNormalize(expectedHtmlPath);

        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");

        done();
    });

    it("Should succeed with simple UTF8 inputs", (done: MochaDone) => {
        const taskPath: string = path.join(__dirname, "UTF8_Mock.js");
        const expectedHtmlPath: string = path.join(__dirname, "sample-md-files", "UTF8-expected.html");
        const actualHtmlPath: string = path.join(__dirname, "sample-md-files", "Output.html");

        const testRunner: ttm.MockTestRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 0, "should have no errors");

        const html: string = readAndNormalize(actualHtmlPath);
        const markdown: string = readAndNormalize(expectedHtmlPath);

        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");

        done();
    });

    it("Should fail with non-existing Markdown file path", (done: MochaDone) => {
        const taskPath: string = path.join(__dirname, "FailNoExistMdFile_Mock.js");

        const testRunner: ttm.MockTestRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.failed, "should have failed");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 1, "should have 1 error");

        done();
    });

    it("Should badly encode inline HTML", (done: MochaDone) => {
        const taskPath: string = path.join(__dirname, "FailInlineHtmlEncoding_Mock.js");
        const expectedHtmlPath: string = path.join(__dirname, "sample-md-files",
            "FailInlineHtmlEncoding-expected.html");
        const actualHtmlPath: string = path.join(__dirname, "sample-md-files", "Output.html");

        const testRunner: ttm.MockTestRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        chai.expect(testRunner.errorIssues.length).to.equal(0, "should have no errors");

        const html: string = readAndNormalize(actualHtmlPath);
        const markdown: string = readAndNormalize(expectedHtmlPath);

        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");

        done();
    });

    it("Should succeed with input & template set", (done: MochaDone) => {
        const taskPath: string = path.join(__dirname, "Template_Mock.js");
        const expectedHtmlPath: string = path.join(__dirname, "sample-md-files", "Template-expected.html");
        const actualHtmlPath: string = path.join(__dirname, "sample-md-files", "Output.html");

        const testRunner: ttm.MockTestRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 0, "should have no errors");

        const html: string = readAndNormalize(actualHtmlPath);
        const markdown: string = readAndNormalize(expectedHtmlPath);
        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");

        done();
    });

    it("Should succeed with input, template & parameters set", (done: MochaDone) => {
        const taskPath: string = path.join(__dirname, "Parameters_Mock.js");
        const expectedHtmlPath: string = path.join(__dirname, "sample-md-files", "Parameters-expected.html");
        const actualHtmlPath: string = path.join(__dirname, "sample-md-files", "Output.html");

        const testRunner: ttm.MockTestRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        // assert.equal(tr.invokedToolCount, 1);
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        // assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 0, "should have no errors");

        // assert(tr.stdout.indexOf("atool output here") >= 0, "tool stdout");
        // assert(tr.stdout.indexOf("Hello Mock!") >= 0, "task module is called");

        const html: string = readAndNormalize(actualHtmlPath);
        const markdown: string = readAndNormalize(expectedHtmlPath);

        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");

        done();
    });

    it("Should successfully encode inline HTML when flag is set", (done) => {
        const taskPath = path.join(__dirname, "PassThruInlineHtmlEncoding_Mock.js");
        const expectedHtmlPath = path.join(__dirname, "sample-md-files", "EncodeInlineHtmlEncoding-expected.html");
        const actualHtmlPath = path.join(__dirname, "sample-md-files", "Output.html");

        const testRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 0, "should have no errors");

        const html = readAndNormalize(actualHtmlPath);
        const markdown = readAndNormalize(expectedHtmlPath);

        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");
        done();
    });

    it("Should successfully replace hyperlinks when flag is set", (done) => {
        const taskPath = path.join(__dirname, "ReplaceHyperlinks_Mock.js");
        const expectedHtmlPath = path.join(__dirname, "sample-md-files", "ReplaceHyperlinks-expected.html");
        const actualHtmlPath = path.join(__dirname, "sample-md-files", "Output.html");

        const testRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 0, "should have no errors");

        const html = readAndNormalize(actualHtmlPath);
        const markdown = readAndNormalize(expectedHtmlPath);

        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");
        done();
    });

    it("Should successfully transform multiple MD files", (done) => {
        const taskPath = path.join(__dirname, "MultiFiles_Mock.js");
        const expectedHtmlPath = path.join(__dirname, "sample-md-files", "Simple-expected.html");
        const actualHtmlPath = path.join(__dirname, "out", "Simple.html");

        const testRunner = new ttm.MockTestRunner(taskPath);
        testRunner.run();

        assert(testRunner.succeeded, "should have succeeded");
        chai.expect(testRunner.warningIssues.length).to.equal(0, "should have no warnings");
        assert.equal(testRunner.errorIssues.length, 0, "should have no errors");

        const html = readAndNormalize(actualHtmlPath);
        const markdown = readAndNormalize(expectedHtmlPath);

        chai.expect(html).to.equal(markdown, "should have valid HTML as output!");

        chai.expect(testRunner.stdout.indexOf("Successfully transformed 1 markdown files")).to.gte(0);

        done();
    });
});
