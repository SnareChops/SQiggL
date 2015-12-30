import {ParserOptions} from "../parser";

/**
 * The parser responsible for parsing all DSL Comments
 *
 * @internal
 */
export class CommentParser{

    /**
     * Creates a new instance of CommentParser
     *
     * @param options {ParserOptions} - The {@link ParserOptions} for string output.
     */
    constructor(private options: ParserOptions){}

    /**
     * Change the comment into a SQL comment using the provided start and ending tokens
     * and output the newly formatted comment
     *
     * @internal
     * @param comment {string} - The DSL for a comment is simply a string
     * @returns {string}
     */
    public parse(comment: string): string{
        return `${this.options.commentBeginning} ${comment} ${this.options.commentEnding}`;
    }
}