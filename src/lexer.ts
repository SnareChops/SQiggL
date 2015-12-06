import {DSL, DSLType, DSLVariable, DSLVariableType, DSLCommand, DSLReplacement} from './dsl';
import {Action, CORE_ACTIONS} from './actions';
import {Expression, CORE_EXPRESSIONS} from './expressions';

export interface LexerOptions{
    leftWrapperChar?: string;
    rightWrapperChar?: string;
    commandChar?: string;
    variableChar?: string;
    commentChar?: string;
    variableAssignmentChar?: string;
    stringEscapeChar?: string;
}

export class Lexer{
    private leftWrapperChar: string;
    private rightWrapperChar: string;
    private commandChar: string;
    private variableChar: string;
    private commentChar: string;
    private variableAssignmentChar: string;
    private stringEscapeChar: string;
    constructor(private actions: Action[] = CORE_ACTIONS, options?: LexerOptions){
        options = options || {};
        this.leftWrapperChar = options.leftWrapperChar || '{';
        this.rightWrapperChar = options.rightWrapperChar || '}';
        this.commandChar = options.commandChar || '%';
        this.variableChar = options.variableChar || '+';
        this.commentChar = options.commentChar || '#';
        this.variableAssignmentChar = options.variableAssignmentChar || ':';
        this.stringEscapeChar = options.stringEscapeChar || '\\';
        let array = [this.leftWrapperChar, this.rightWrapperChar, this.commandChar, this.variableChar, this.commentChar, this.variableAssignmentChar, this.stringEscapeChar].sort();
        for(let i=0; i< array.length - 1; i++){
            if(array[i] === array[i + 1]) throw new Error('SQiggL Lexer Options Error: All Lexer Options chars must be unique');
        }
    }

    public parse(input: string): DSL[] {
        let dsl = this.identify(input);
        return dsl;
    }

    private identify(input: string): DSL[]{
        let currentType: DSLType = DSLType.text,
            idx: number = 0,
            startIdx: number = 0,
            dsl: DSL[] = [];
        while(idx < input.length){
            switch(input.charAt(idx)){
                case this.leftWrapperChar:
                    if(idx !== 0) dsl.push(this.generateDSL(currentType, input.slice(startIdx, idx)));
                    switch(input.charAt(idx + 1)) {
                        case this.commandChar:
                            idx += 2;
                            currentType = DSLType.command;
                            break;
                        case this.commentChar:
                            idx += 2;
                            currentType = DSLType.comment;
                            break;
                        case this.variableChar:
                            idx += 2;
                            currentType = DSLType.variable;
                            break;
                        default:
                            idx++;
                            currentType = DSLType.replacement;
                    }
                    startIdx = idx; // Set start index for next type
                    break;
                case this.rightWrapperChar:
                    if(idx !== 0) dsl.push(this.generateDSL(currentType, input.slice(startIdx, idx))); // Append current type
                    idx++;
                    startIdx = idx;
                    currentType = DSLType.text;
                    break;
                default:
                    idx++;
            }
        }
        if(startIdx !== idx) dsl.push(this.generateDSL(currentType, input.slice(startIdx)));
        //console.log(dsl); //TODO
        return dsl;
    }

    private generateDSL(type: DSLType, value: string): DSL{
        switch(type){
            case DSLType.text:
                return {text: value};
            case DSLType.variable:
                return {variable: this.parseVariable(value.replace('\n', ' ').trim())};
            case DSLType.replacement:
                return {replacement: {literal: value.replace('\n', ' ').trim()}};
            case DSLType.command:
                return {command: this.parseCommand(value.replace(/\s+/g, ' ').trim())};
            case DSLType.comment:
                return {comment: value.trim()};
            default:
                throw new Error('SQiggL Lexer Error: Unrecognized DSLType');
        }
    }

    private parseVariable(input: string): DSLVariable{
        console.log('input', input);
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
                        if(input.charAt(idx - 1) === this.stringEscapeChar){
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
                        if(input.charAt(idx - 1) === this.stringEscapeChar){
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
                case this.variableAssignmentChar:
                    dsl = this.generateVariableDSL(dsl, currentType, input.slice(startIdx, idx));
                    idx++;
                    startIdx = idx;
                    currentType = DSLVariableType.value;
                    break;
                default:
                    idx++;
            }
        }
        if(startIdx !== 0) dsl = this.generateVariableDSL(dsl, currentType, input.slice(startIdx));
        return dsl;
    }

    private generateVariableDSL(dsl: DSLVariable, type: DSLVariableType, value: string): DSLVariable{
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

    private parseCommand(input: string): DSLCommand{
        const first = input.split(' ')[0];
        const potential = this.actions.map(x => x.key.toLowerCase()).indexOf(first.toLowerCase());
        if(potential < 0) throw new Error('SQiggL No Action Error: Commands require the first word to be a known action.');
        return this.generateCommandDSL(this.actions[potential], input);
    }

    private generateCommandDSL(definition: Action, value: string): DSLCommand{
        return {literal: value, action: definition};
    }
}