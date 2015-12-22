import {Lexer, LexerOptions} from './src/lexer';
import {Parser, ParserOptions} from './src/parser';
import {Action, CORE_ACTIONS} from './src/actions';
import {Expression, CORE_EXPRESSIONS} from './src/expressions';
import {Modifier, CORE_MODIFIERS} from './src/modifiers';
import {ScopedVariables} from './src/parser';

interface SQiggLOptions extends LexerOptions, ParserOptions{}

function parse(query: string, variables?: ScopedVariables, options?: SQiggLOptions): string{
    const lexer = new Lexer(options);
    const dsl = lexer.parse(query);
    const parser = new Parser(options);
    return parser.parse(dsl, variables);
}

let SQiggL = {parse: parse};
export default SQiggL;