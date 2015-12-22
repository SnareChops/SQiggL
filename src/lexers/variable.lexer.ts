import {LexerOptions} from '../lexer';
import {DSLVariable, DSLVariableType} from '../dsl';

export class VariableLexer{

    constructor(private options: LexerOptions){}

    /**
     * Walk through a variable declaration and return a variable DSL
     * @param input {string}
     * @returns {DSLVariable}
     */
    public invoke(input: string): DSLVariable{
        input = this.cleanInput(input);
        let currentType: DSLVariableType = DSLVariableType.key,
            idx: number = 0,
            startIdx: number = 0,
            inString: boolean = false,
            stringChar: string,
            dsl: DSLVariable = {literal: input};
        while(idx < input.length){
            switch(input.charAt(idx)){
                case "'":
                    if(currentType === DSLVariableType.key) throw new Error('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
                    if(!inString){
                        inString = true;
                        stringChar = "'";
                        idx++;
                        break;
                    }
                    if(input.charAt(idx) === stringChar){
                        if(input.charAt(idx - 1) === this.options.stringEscapeChar){
                            input = input.slice(0, idx) + input.slice(idx + 1);
                            // DO NOT increment the idx here as a character has been removed
                        }
                    }
                    idx++;
                    break;
                case '"':
                    if(currentType === DSLVariableType.key) throw new Error('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
                    if(!inString){
                        inString = true;
                        stringChar = '"';
                        idx++;
                        break;
                    }
                    if(input.charAt(idx) === stringChar){
                        if(input.charAt(idx - 1) === this.options.stringEscapeChar){
                            input = input.slice(0, idx) + input.slice(idx + 1);
                            // DO NOT increment the idx here as a character has been removed
                        }
                    }
                    idx++;
                    break;
                case ' ':
                    if(!inString){
                        input = input.slice(0, idx) + input.slice(idx + 1);
                        // DO NOT increment the idx here as a character has been removed
                        break;
                    }
                    idx++;
                    break;
                case this.options.variableAssignmentChar:
                    dsl = this.generateDSL(dsl, currentType, input.slice(startIdx, idx));
                    idx++;
                    startIdx = idx;
                    currentType = DSLVariableType.value;
                    break;
                default:
                    idx++;
            }
        }
        if(startIdx !== 0) dsl = this.generateDSL(dsl, currentType, input.slice(startIdx));
        return dsl;
    }

    /**
     * Generate the DSL for a variable piece by piece. Building on the definition until complete.
     * @param dsl {DSLVariable}
     * @param type {DSLVariableType}
     * @param value {string}
     * @returns {DSLVariable}
     */
    private generateDSL(dsl: DSLVariable, type: DSLVariableType, value: string): DSLVariable{
        switch(type){
            case DSLVariableType.key:
                dsl.key = value;
                break;
            case DSLVariableType.value:
                dsl.value = value;
                break;
            default:
                throw new Error('SQiggL Lexer Error: Unrecognized DSLVariableType');
        }
        return dsl;
    }

    /**
     * Clean and prepare the input for parsing
     * @param input {string}
     * @returns {string}
     */
    private cleanInput(input: string): string{
        return input.replace('\n', ' ').replace(/ (?=(?:(?:\\.|"(?:\\.|[^"\\])*"|[^\\'"])*'(?:\\.|"(?:\\.|[^"'\\])*"|[^\\'])*')*(?:\\.|"(?:\\.|[^"\\])*"|[^\\'])*$)(?=(?:(?:\\.|'(?:\\.|[^'\\])*'|[^\\'"])*"(?:\\.|'(?:\\.|[^'"\\])*'|[^\\"])*")*(?:\\.|'(?:\\.|[^'\\])*'|[^\\"])*$)/g, '').trim();
    }
}