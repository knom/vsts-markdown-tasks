# Markdown 2 HTML VSTS Build/Release Task #
Useful for converting [Markdown](https://en.wikipedia.org/wiki/Markdown) language into HTML.

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
    * HTML template file path: 
        * The path of the HTML file used as a template. 
        * The placeholder for the inserted converted Ex-Markdown is 
                
                {body|s}
          Put it wherever you want the converted Markdown to show up in the template.

        * Other custom placeholders for parameters can be used such as

                {title}
                {author}
          These parameters need to be passed in as JSON.

    * JSON Template Parameters: 
        * The parameters to be used instead of placeholders in the template file.
        * **body** is automatically filled 
        * The parameters are case-sensitive

                {"title": "Release Notes", "Author": "knom"}
    * HTML output file path:
        * The path of the output HTML file. If the file does not exist, it will be created. 
        * If the file exists, it will be overwritten.
        * It can contain variables such as $(Build.ArtifactStagingDirectory).

## License ##
Published under [Apache 2.0 License](https://github.com/knom/vsts-markdown-tasks/blob/master/LICENSE).
