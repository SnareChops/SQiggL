import {ParserOptions, ScopedVariables} from '../parser';
import {DSLCommand, DSL} from '../dsl';
import {ExpressionParser} from './expression.parser';

export class CommandParser {
    constructor(private options:ParserOptions) {}

    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @param dsl {DSLReplacement}
     * @param variables {ScopedVariables}
     * @returns {string}
     */
    public parse(dsl:DSL, variables?:ScopedVariables):string {
        let command: DSLCommand = dsl.command;
        let expressionResult: boolean = <boolean>new ExpressionParser(this.options).parse(command);
        return '';
    }
}