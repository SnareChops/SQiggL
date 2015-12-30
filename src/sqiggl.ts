import {Lexer, LexerOptions} from './lexer';
import {Parser, ParserOptions} from './parser';
import {Action, CORE_ACTIONS} from './actions';
import {Expression, CORE_EXPRESSIONS} from './expressions';
import {Modifier, CORE_MODIFIERS} from './modifiers';
import {ScopedVariables} from './parser';

export interface SQiggLOptions extends LexerOptions, ParserOptions{}

function parse(query: string, variables?: ScopedVariables, options?: SQiggLOptions): string{
    const lexer = new Lexer(options);
    const dsl = lexer.parse(query);
    const parser = new Parser(options);
    return parser.parse(dsl, variables);
}

export const SQiggL = {parse: parse};
