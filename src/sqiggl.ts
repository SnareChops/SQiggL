import {Lexer, LexerOptions} from './lexer';
import {Parser, ParserOptions} from './parser';
import {Action, CORE_ACTIONS} from './actions';
import {Expression, CORE_EXPRESSIONS} from './expressions';
import {Modifier, CORE_MODIFIERS} from './modifiers';
import {ScopedVariables} from './variables';

export interface SQiggLOptions extends LexerOptions, ParserOptions{}

/**
 * Parses a SQiggL query and outputs the raw SQL.
 *
 * @param query {string} - The SQiggL query to invoke.
 * @param variables {ScopedVariables} - A map of variables to use while parsing.
 * @param options {SQiggLOptions} - The options to use for parsing
 * @returns {string} - The raw SQL query output.
 */
function parse(query: string, variables?: Object, options?: SQiggLOptions): string{
    const scopedVariables = new ScopedVariables(variables);
    const lexer = new Lexer(options);
    const dsl = lexer.invoke(query);
    const parser = new Parser(options);
    return parser.parse(dsl, scopedVariables);
}

/**
 * The SQiggL library export.
 *
 * @type {{parse: (function(string, ScopedVariables?, SQiggLOptions?): string)}}
 */
export const SQiggL = {parse: parse};
