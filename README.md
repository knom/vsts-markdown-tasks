# Markdown 2 HTML VSTS/Azure DevOps Build/Release Task [![Version](https://img.shields.io/vscode-marketplace/v/knom.markdown-task.svg?label=VS%20Marketplace&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=knom.markdown-task) [![Visual Studio Marketplace Downloads](https://img.shields.io/vscode-marketplace/d/knom.markdown-task.svg?logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=knom.markdown-task) [![GitHub License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/knom/vsts-markdown-tasks/blob/master/LICENSE) ![Build Status](https://knom-msft.visualstudio.com/_apis/public/build/definitions/9d8fcb7c-6c11-4014-9dc2-7966c94af2b2/8/badge)

Useful for converting [Markdown](https://en.wikipedia.org/wiki/Markdown) language into HTML.

## Supported Platforms ##

* Visual Studio Team Services - aka. Azure DevOps
* Team Foundation Server 2015 Update 3 and higher ([How to install extensions in TFS](https://www.visualstudio.com/en-us/docs/marketplace/get-tfs-extensions))

## Usage ##

The extension installs the follow tasks:

![Extension Tasks](https://raw.githubusercontent.com/knom/vsts-markdown-tasks/master/src/docs/addtask.png "Extension Tasks")

### Transform a single Markdown file To HTML

![Screenshot](https://raw.githubusercontent.com/knom/vsts-markdown-tasks/master/src/docs/singlefile.png "Screenshot")

#### Parameters: ####

* Markdown file path:
  * The path of the input Markdown file.
  * It can contain variables such as $(Build.ArtifactStagingDirectory)

* HTML output file path:
  * The path of the output HTML file. If the file does not exist, it will be created.
  * If the file exists, it will be overwritten.
  * It can contain variables such as $(Build.ArtifactStagingDirectory).

* HTML template file path:
  * The path of the HTML file used as a template.
  * The placeholder for the inserted transformed Markdown is

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

### Transform multiple Markdown files To HTML

![Screenshot](https://raw.githubusercontent.com/knom/vsts-markdown-tasks/master/src/docs/multifiles.png "Screenshot")

#### Parameters: ####

* Markdown search pattern:
  * The GLOB search patterns to input Markdown files.
  * Multiple lines, each with a COMMA at the end
  * E.g. `**\*.md, !**\node_modules\*`
  * It can contain variables such as $(Build.ArtifactStagingDirectory)

* HTML output folder:
  * If **empty** the output folder will be the source folder of the Markdown files.
  * The path of the folder for output HTML files. If the folder does not exist, it will be created.
  * If the files exists, they will be overwritten.
  * It can contain variables such as $(Build.ArtifactStagingDirectory).

* HTML template file path:
  * The path of the HTML file used as a template.
  * The placeholder for the inserted transformed Markdown is

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

## License ##

Published under [Apache 2.0 License](https://github.com/knom/vsts-markdown-tasks/blob/master/LICENSE).
