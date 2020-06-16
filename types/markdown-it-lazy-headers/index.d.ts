// Type definitions for MarkdownItLazyHeaders (markdown-it-lazy-headers) 0.13
// Project: https://github.com/Galadirith/markdown-it-lazy-headers
// Definitions by: Knom <https://github.com/knom>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2
declare module "markdown-it-lazy-headers" {
    import MarkdownIt = require('markdown-it');

    function lazyheaders(md: MarkdownIt): void;

    export = lazyheaders;
}