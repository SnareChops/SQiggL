import {Lexer, LexerOptions} from './src/lexer';
import {Parser, ParserOptions} from './src/parser';
import {StartingAction, DependentAction, CORE_ACTIONS} from './src/actions';
import {Expression, CORE_EXPRESSIONS} from './src/expressions';
import {Modifier, CORE_MODIFIERS} from './src/modifiers';

interface SQiggLOptions extends LexerOptions, ParserOptions{}

function parse(query: string, options?: SQiggLOptions, actions?: (StartingAction | DependentAction)[], expressions?: Expression[], modifiers?: Modifier[]): string{
    const lexer = new Lexer(options, actions, expressions, modifiers);
    const dsl = lexer.parse(query);
    const parser = new Parser(options);
    return parser.parse(dsl);
}

let SQiggL = {parse: parse};
export default SQiggL;