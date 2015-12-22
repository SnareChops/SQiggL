import {LexerOptions} from '../lexer';
import {ExpressionLexer} from './expression.lexer';
import {DSLReplacement} from '../dsl';
import {Expression, SPACE} from '../expressions';

export class ReplacementLexer{
    constructor(private options: LexerOptions, private expressions: Expression[]){}

    /**
     * Split the input into it's respective parts then compare them against expressions
     * or return the input if the contents are literal.
     * @param input {string}
     * @returns {DSLReplacement}
     */
    public invoke(input: string): DSLReplacement{
        input = this.cleanInput(input);
        let dsl: DSLReplacement = <DSLReplacement>{literal: input};
        let parts: string[] = this.extractParts(input);
        if(parts.length > 1) dsl = new ExpressionLexer(this.options, this.expressions).invoke(dsl, parts);
        return dsl;
    }

    /**
     * Split the found string into parts
     * A part is any set of characters, separated by a space.
     * Words within a literal string are *not* split. They are treated as one "Part"
     * @param input {string}
     * @returns {string[]}
     */
    private extractParts(input: string): string[]{
        let idx: number = 0, parts: string[] = [];
        let oops: number = 0;
        while(idx < input.length){
            parts.push(this.extractWord(input, idx));
            idx += parts[parts.length-1].length;
            if(input[idx] === ' '){
                parts.push(SPACE);
                idx++;
            }
        }
        return parts;
    }

    /**
     * Finds a single "part".
     * If the "part" is a literal string, use the `extractString` method instead.
     * @param input {string}
     * @param start {number} - The starting index to search
     * @returns {string}
     */
    private extractWord(input: string, start: number): string{
        let nextSpace: number;
        if(input[start] === "'" || input[start] === '"'){
            return this.extractString(input, start, input[start]);
        } else {
            nextSpace = input.indexOf(' ', start);
            return input.slice(start, nextSpace > 0 ? nextSpace : input.length);
        }
    }

    /**
     * Finds a single "part" that is a literal string.
     * Honors escaped quotes.
     * @param input {string}
     * @param start {number} - The starting index to search
     * @param stringChar {string} - Which type of quote was used
     * @returns {string}
     */
    private extractString(input: string, start: number, stringChar: string): string{
        let idx: number = start + 1;
        while(idx < input.length){
            switch(input[idx]){
                case this.options.stringEscapeChar:
                    if(input[idx+1] === this.options.stringEscapeChar || input[idx+1] === stringChar){
                        idx+=2;
                    } else {
                        throw new Error(`SQiggLLexerError: Illegal escape character found in string ${input} at index ${idx}`);
                    }
                    break;
                case stringChar:
                    return input.slice(start, idx+1);
                default:
                    idx++;
            }
        }
        throw new Error(`SQiggLLexerError: Invalid string found in ${input}`);
    }

    /**
     * Clean and prepare the input for parsing
     * @param input {string}
     * @returns {string}
     */
    private cleanInput(input: string): string{
        return input.replace('\n', ' ').trim();
    }
}