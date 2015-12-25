import {ParserOptions, ScopedVariables} from '../parser';
import {DSLExpression} from '../dsl';

export class ExpressionParser {
    constructor(private options:ParserOptions) {}

    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @param dsl {DSLReplacement}
     * @param variables {ScopedVariables}
     * @returns {string}
     */
    public parse(dsl:DSLExpression, variables?:ScopedVariables):string | boolean{
        let idx: number;
        for (idx; idx < dsl.values.length; idx++) {
            if (dsl.values[idx][0] === "'" || dsl.values[idx][0] === '"') dsl.values[idx] = dsl.values[idx].slice(1, dsl.values[idx].length - 1);
            else if (isNaN(+dsl.values[idx])) {
                if (variables.hasOwnProperty(dsl.values[idx])) dsl.values[idx] = variables[dsl.values[idx]];
                else throw new Error(`SQiggLParserError: ${dsl.values[idx]} is not a defined variable in this scope`);
            }
        }
        return dsl.expression.rule(dsl.values, dsl.literal);
    }
}