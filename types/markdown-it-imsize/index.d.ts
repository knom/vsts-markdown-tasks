// Type definitions for markdown-it-imsize 2.0
// Project: https://github.com/tatsy/markdown-it-imsize
// Definitions by: Knom <https://github.com/knom>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "markdown-it-imsize" {
    export = imsize;

    import MarkdownIt = require('markdown-it');

    function imsize(md: MarkdownIt, options: imsize.ImSizeOptions): void;

    namespace imsize {
        interface ImSizeOptions {
            autofill: boolean;
        }
    }
}