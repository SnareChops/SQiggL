import {ParserOptions, ScopedVariables} from '../parser';
import {DSLReplacement} from '../dsl';

export class ReplacementParser{
    constructor(private options: ParserOptions){}

    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @param dsl {DSLReplacement}
     * @param variables {ScopedVariables}
     * @returns {string}
     */
    public parse(dsl: DSLReplacement, variables: ScopedVariables): string{
        let idx: number = 0, result: string | boolean;
        if(!!dsl.expression) {
            for (idx; idx < dsl.values.length; idx++) {
                if (dsl.values[idx].charAt(0) === "'" || dsl.values[idx].charAt('"')) dsl.values[idx] = dsl.values[idx].slice(1, dsl.values[idx].length - 1);
                else if (isNaN(+dsl.values[idx])) {
                    if (variables.hasOwnProperty(dsl.values[idx])) dsl.values[idx] = variables[dsl.values[idx]];
                    else throw new Error(`SQiggLParserError: ${dsl.values[idx]} is not a defined variable in this scope`);
                }
            }
            result = dsl.expression.rule(dsl.values, dsl.literal);
        } else {
            if(dsl.literal[0] === "'" || dsl.literal[0] === "'") return dsl.literal.slice(1, dsl.literal.length - 1);
            else if(!isNaN(+dsl.literal)) return dsl.literal;
            else if(variables.hasOwnProperty(dsl.literal)) return variables[dsl.literal];
            else throw new Error(`SQiggLParserError: ${dsl.literal} is not a defined variable in this scope`);
        }
        if(result === true) return this.options.trueString;
        if(result === false) return this.options.falseString;
        return <string>result;
    }
}