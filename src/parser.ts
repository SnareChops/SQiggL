import {DSL, DSLVariable, DSLReplacement} from './dsl';

export interface ParserOptions{
    exportComments?: boolean;
    commentBeginning?: string;
    commentEnding?: string;
    stringEscapeChar?: string;
    trueString?: string;
    falseString?: string;
}

export interface ScopedVariables{
    [key: string]: any;
}

export class Parser{
    private options: ParserOptions = <ParserOptions>{};
    constructor(options?: ParserOptions){
        options = options || <ParserOptions>{};
        this.options.exportComments = options.exportComments || false;
        this.options.commentBeginning = options.commentBeginning || '/*';
        this.options.commentEnding = options.commentEnding || '*/';
        this.options.stringEscapeChar = options.stringEscapeChar || '\\';
        this.options.trueString = options.trueString || '1';
        this.options.falseString = options.falseString || '0';
    }

    public parse(dsls: DSL[], variables?: ScopedVariables): string{
        let output: string = '';
        let dsl: DSL;
        for(dsl of dsls){
            if(dsl.variable) variables = this.resolveVariable(dsl.variable, variables);
            //if(dsl.command) output += this.parseCommand(dsl);
            if(dsl.replacement) output += this.parseReplacement(dsl.replacement, variables);
            if(dsl.comment && this.options.exportComments) output += this.parseComment(dsl.comment);
            if(dsl.text) output += dsl.text;
        }
        return output;
    }

    /**
     * Change the comment into a SQL comment using the provided start and ending tokens
     * and output the newly formatted comment
     *
     * @param comment {string}
     * @returns {string}
     */
    private parseComment(comment: string): string{
        return `${this.options.commentBeginning} ${comment} ${this.options.commentEnding}`;
    }

    /**
     * Resolve the known variables within the scope and return the modified collection
     *
     * @param dsl {DSLVariable}
     * @param scopedVariables {ScopedVariables}
     * @returns {ScopedVariables}
     */
    private resolveVariable(dsl: DSLVariable, scopedVariables: ScopedVariables): ScopedVariables{
        if(dsl.value[0] === `'` || dsl.value[0] === `"`){
            scopedVariables[dsl.key] = dsl.value.slice(1, dsl.value.length - 1);
        } else if(isNaN(<any>dsl.value)) {
            if(scopedVariables[dsl.value] == null) throw new Error(`SQiggLVariableResolutionError: Unable to find ${dsl.value} in the current scope`);
            scopedVariables[dsl.key] = scopedVariables[dsl.value];
        } else {
            scopedVariables[dsl.key] = parseFloat(dsl.value);
        }
        return scopedVariables;
    }

    private parseReplacement(dsl: DSLReplacement, variables: ScopedVariables): string{
        let idx: number = 0, result: string | boolean;
        for(idx; idx<dsl.values.length; idx++){
            if(dsl.values[idx].charAt(0) === "'" || dsl.values[idx].charAt('"')) dsl.values[idx] = dsl.values[idx].slice(1, dsl.values[idx].length-1);
            else if(isNaN(+dsl.values[idx])){
                if(variables.hasOwnProperty(dsl.values[idx])) dsl.values[idx] = variables[dsl.values[idx]];
                else throw new Error(`SQiggLParserError: ${dsl.values[idx]} is not a defined variable in this scope`);
            }
        }
        result = dsl.expression.rule(dsl.values, dsl.literal);
        if(result === true) return this.options.trueString;
        if(result === false) return this.options.falseString;
        return <string>result;
    }
}