// Type definitions for markdown-it-replace-link 2.0
// Project: https://github.com/martinheidegger/markdown-it-replace-link
// Definitions by: Knom <https://github.com/knom>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "markdown-it-replace-link" {
    export = replacelink;

    import { MarkdownIt } from 'markdown-it';

    function replacelink(md: MarkdownIt): void;

    namespace replacelink {
        interface ReplaceLinkOptions {
            replaceLink: (link: string) => string;
        }
    }
}