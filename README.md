# VSTS Build/Release Tasks for Markdown #
Useful VSTS tasks for the [Markdown](https://en.wikipedia.org/wiki/Markdown) language.

## Tasks ##
* Markdown To HTML

    Transforms your Markdown file to HTML


## Usage ##
The extension installs the follow tasks:

![Extension Tasks](https://raw.githubusercontent.com/knom/vsts-markdown-tasks/master/docs/addtask.png "Extension Tasks")

* ### Markdown To HTML
    Transforms a Markdown file to an HTML file.
    
    ![Screenshot](https://raw.githubusercontent.com/knom/vsts-markdown-tasks/master/docs/markdown2html.png "Screenshot")
    
    #### Parameters: ####
    * Markdown file path: 
        * The path of the input Markdown file. 
        * It can contain variables such as $(Build.ArtifactStagingDirectory)
    * HTML output file path:
        * The path of the output HTML file. If the file does not exist, it will be created. 
        * If the file exists, it will be overwritten.
        * It can contain variables such as $(Build.ArtifactStagingDirectory).

## License ##
Published under [Apache 2.0 License](https://github.com/knom/vsts-markdown-tasks/blob/master/LICENSE).
