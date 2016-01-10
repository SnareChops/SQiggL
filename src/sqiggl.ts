import {Lexer, LexerOptions} from './lexer';
import {Parser, ParserOptions} from './parser';
import {Action, CORE_ACTIONS} from './actions';
import {Expression, CORE_EXPRESSIONS} from './expressions';
import {Modifier, CORE_MODIFIERS} from './modifiers';
import {ScopedVariables} from './parser';

export interface SQiggLOptions extends LexerOptions, ParserOptions{}

/**
 * Parses a SQiggL query and outputs the raw SQL.
 *
 * @param query {string} - The SQiggL query to parse.
 * @param variables {ScopedVariables} - A map of variables to use while parsing.
 * @param options {SQiggLOptions} - The options to use for parsing
 * @returns {string} - The raw SQL query output.
 */
function parse(query: string, variables?: ScopedVariables, options?: SQiggLOptions): string{
    const lexer = new Lexer(options);
    const dsl = lexer.parse(query);
    const parser = new Parser(options);
    return parser.parse(dsl, variables);
}

/**
 * The SQiggL library export.
 *
 * @type {{parse: (function(string, ScopedVariables=, SQiggLOptions=): string)}}
 */
export const SQiggL = {parse: parse};
