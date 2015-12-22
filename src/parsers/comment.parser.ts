import {ParserOptions} from "../parser";

export class CommentParser{
    constructor(private options: ParserOptions){}

    /**
     * Change the comment into a SQL comment using the provided start and ending tokens
     * and output the newly formatted comment
     *
     * @param comment {string} - The DSL for a comment is simply a string
     * @returns {string}
     */
    public parse(comment: string): string{
        return `${this.options.commentBeginning} ${comment} ${this.options.commentEnding}`;
    }
}