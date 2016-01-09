import {Lexer, LexerOptions} from '../lexer';
import {DSLVariable, DSLVariableType} from '../dsl';
import {SQiggLError} from "../error";

/**
 * The Lexer responsible for all DSL generation of variable statements
 *
 * @internal
 */
export class VariableLexer{

    /**
     * Creates a new instance of the VariableLexer
     *
     * @internal
     * @param options {LexerOptions} - The LexerOptions to use when generating DSL
     */
    constructor(private options: LexerOptions){}

    /**
     * Walk through a variable declaration and return a variable DSL
     *
     * TODO: Add rules
     *
     * @internal
     * @param input {string}
     * @returns {DSLVariable}
     */
    public invoke(input: string): DSLVariable{
        let currentType: DSLVariableType = DSLVariableType.key,
            original: string = input,
            idx: number = 0,
            startIdx: number = 0,
            inString: boolean = false,
            isArray: boolean = false,
            stringChar: string,
            dsl: DSLVariable = {literal: input};
        while(idx < input.length){
            switch(input.charAt(idx)){
                case "'":
                    if(currentType === DSLVariableType.key) throw SQiggLError('LV2000', 'Variable keys should not be wrapped in quotes.');
                    if(!inString){
                        inString = true;
                        stringChar = "'";
                        idx++;
                        break;
                    }
                    if(input[idx] === stringChar){
                        if(input[idx - 1] === this.options.stringEscapeChar){
                            input = input.slice(0, idx - 1) + input.slice(idx);
                            break;
                        } else inString = false;
                    }
                    idx++;
                    break;
                case '"':
                    if(currentType === DSLVariableType.key) throw SQiggLError('LV2000', 'Variable keys should not be wrapped in quotes.');
                    if(!inString){
                        inString = true;
                        stringChar = '"';
                        idx++;
                        break;
                    }
                    if(input[idx] === stringChar){
                        if(input[idx - 1] === this.options.stringEscapeChar){
                            input = input.slice(0, idx -1) + input.slice(idx);
                            break;
                        }
                        else inString = false;
                    }
                    idx++;
                    break;
                case '[':
                    if(currentType === DSLVariableType.key) throw SQiggLError('LV2001', `Invalid character '[' found in variable key: '${original}'.`);
                    if(!inString){
                        if (idx !== startIdx) throw SQiggLError('LV2002', `Arrays in variables cannot be nested. At '${original}'.`);
                        input = input.slice(0, idx) + input.slice(idx + 1);
                        isArray = true;
                    }
                    break;
                case ']':
                    if(currentType === DSLVariableType.key) throw SQiggLError('LV2001', `Invalid character ']' found in variable key: '${original}.`);
                    if(!inString){
                        if(idx !== input.length - 1) throw SQiggLError('LV2003', `Variables that define arrays must not include other values: '${original}'.`);
                        input = input.slice(0, idx) + input.slice(idx+1);
                    }
                    console.log(input);
                    idx++;
                    break;
                case this.options.variableAssignmentChar:
                    dsl = this.generateDSL(dsl, currentType, input.slice(startIdx, idx), isArray);
                    idx++;
                    startIdx = idx;
                    currentType = DSLVariableType.value;
                    break;
                default:
                    idx++;
            }
        }
        if(startIdx !== 0) dsl = this.generateDSL(dsl, currentType, input.slice(startIdx), isArray);
        return dsl;
    }

    /**
     * Generate the DSL for a variable piece by piece. Building on the definition until complete.
     *
     * @internal
     * @param dsl {DSLVariable}
     * @param type {DSLVariableType}
     * @param value {string}
     * @param isArray {boolean}
     * @returns {DSLVariable}
     */
    private generateDSL(dsl: DSLVariable, type: DSLVariableType, value: string, isArray: boolean): DSLVariable{
        switch(type){
            case DSLVariableType.key:
                dsl.key = value;
                break;
            case DSLVariableType.value:
                dsl.value = isArray ? this.convertCSVToArray(value) : value;
                break;
            /* istanbul ignore next */
            default:
                /* istanbul ignore next */
                throw SQiggLError('LV100', 'Unrecognized DSLVariableType');
        }
        return dsl;
    }

    private convertCSVToArray(input: string): string[]{
        let items = input.split(','),
            result: string[] = [];
        for(var item of items){
            item = item.trim();
            result.push(Lexer.removeEscapeCharactersFromStringPart(item, this.options));
        }
        return result;
    }

    /**
     * Clean and prepare the input for parsing
     *
     * @internal
     * @param input {string}
     * @returns {string}
     */
    public static cleanStringForLexing(input: string): string{
        return input.replace('\n', ' ').replace(/ (?=(?:(?:\\.|"(?:\\.|[^"\\])*"|[^\\'"])*'(?:\\.|"(?:\\.|[^"'\\])*"|[^\\'])*')*(?:\\.|"(?:\\.|[^"\\])*"|[^\\'])*$)(?=(?:(?:\\.|'(?:\\.|[^'\\])*'|[^\\'"])*"(?:\\.|'(?:\\.|[^'"\\])*'|[^\\"])*")*(?:\\.|'(?:\\.|[^'\\])*'|[^\\"])*$)/g, '').trim();
    }
}