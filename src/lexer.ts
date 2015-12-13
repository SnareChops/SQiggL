import {DSL, DSLType, DSLText, DSLVariable, DSLVariableType, DSLCommand, DSLReplacement, LeveledDSL} from './dsl';
import {StartingAction, DependentAction, CORE_ACTIONS} from './actions';
import {Expression, CORE_EXPRESSIONS, VALUE, SPACE, OrderedModifier} from './expressions';
import {Modifier, CORE_MODIFIERS} from './modifiers';

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
    private actions: (StartingAction | DependentAction)[] = CORE_ACTIONS;
    private expressions: Expression[] = CORE_EXPRESSIONS;
    private modifiers: Modifier[] = CORE_MODIFIERS;
    private leftWrapperChar: string;
    private rightWrapperChar: string;
    private commandChar: string;
    private variableChar: string;
    private commentChar: string;
    private variableAssignmentChar: string;
    private stringEscapeChar: string;
    constructor(options?: LexerOptions, actions?: (StartingAction | DependentAction)[], expressions?: Expression[], modifiers?: Modifier[]){
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
        if(actions != null) this.actions = this.actions.concat(actions);
        if(expressions != null) this.expressions = this.expressions.concat(expressions);
        if(modifiers != null) this.modifiers = this.modifiers.concat(modifiers);
        this.expressions = this.translateExpressionTemplatesToRegex(this.expressions);
    }

    /**
     * Beginning the parsing process, this method will guide the inputted string
     * through the parsing process and output the full DSL used to then execute
     * by the "Parser"
     *
     * @param input {string}
     * @returns {DSL[]}
     */
    public parse(input: string): DSL[] {
        let dsl = this.identify(input);
        let leveledDSL: LeveledDSL[] = this.levelDSL(dsl);
        dsl = this.scopeDSL(leveledDSL);
        //console.log(JSON.stringify(dsl));
        return dsl;
    }

    /**
     * Identify all special parts found in the SQiggL query. This then routes the found
     * identified statements to the individual DSL parsers to create the appropriate DSL
     * for the query.
     *
     * @param input {string}
     * @returns {DSL[]}
     */
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

    /**
     * Choose the correct DSL representation for the found type and parse/generate it
     * @param type {DSLType}
     * @param value {string}
     * @returns {DSL}
     */
    private generateDSL(type: DSLType, value: string): DSL{
        switch(type){
            case DSLType.text:
                return <DSL>{text: value};
            case DSLType.variable:
                return <DSL>{variable: this.parseVariable(value.replace('\n', ' ').replace(/ (?=(?:(?:\\.|"(?:\\.|[^"\\])*"|[^\\'"])*'(?:\\.|"(?:\\.|[^"'\\])*"|[^\\'])*')*(?:\\.|"(?:\\.|[^"\\])*"|[^\\'])*$)(?=(?:(?:\\.|'(?:\\.|[^'\\])*'|[^\\'"])*"(?:\\.|'(?:\\.|[^'"\\])*'|[^\\"])*")*(?:\\.|'(?:\\.|[^'\\])*'|[^\\"])*$)/g, '').trim())};
            case DSLType.replacement:
                return <DSL>{replacement: this.parseReplacement(value.replace('\n', ' ').trim())};
            case DSLType.command:
                return <DSL>{command: this.parseCommand(value.replace(/\s+/g, ' ').trim())};
            case DSLType.comment:
                return <DSL>{comment: value.trim()};
            default:
                throw new Error('SQiggL Lexer Error: Unrecognized DSLType');
        }
    }

    /**
     * Walk through a variable declaration and return a variable DSL
     * @param input {string}
     * @returns {DSLVariable}
     */
    private parseVariable(input: string): DSLVariable{
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

    /**
     * Generate the DSL for a variable piece by piece. Building on the definition until complete.
     * @param dsl {DSLVariable}
     * @param type {DSLVariableType}
     * @param value {string}
     * @returns {DSLVariable}
     */
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

    private parseReplacement(input: string): DSLReplacement{
        let dsl: DSLReplacement = <DSLReplacement>{literal: input};
        let expression: Expression;
        let match: RegExpExecArray;
        let foundModsOrdered: OrderedModifier[];
        let items: (string | OrderedModifier[])[];
        let idx: number;
        let ordMod: OrderedModifier;
        let ord: string;
        for(expression of this.expressions){
            match = expression.regex.exec(input);
            foundModsOrdered = [];
            if(match !== null){
                items = expression.template.filter(x => x === VALUE || typeof x === 'object');
                for(idx = 0; idx < items.length; idx++) {
                    if(items[idx] === VALUE) {
                        dsl.values = dsl.values || [];
                        dsl.values.push(match[idx+1]);
                    } else {
                        for(ordMod of <OrderedModifier[]>items[idx]) {
                            for(ord in ordMod) {
                                if(ordMod.hasOwnProperty(ord)) {
                                    if(ordMod[ord].identifiers.some((x:string) => x === match[idx + 1])) {
                                        foundModsOrdered.push(ordMod);
                                    }
                                }
                            }
                        }
                    }
                }
                dsl.modifiers = this.sortAndExtractModifiers(foundModsOrdered);
                dsl.expression = expression;
                return dsl;
            }
        }
        if(input.split(' ').length > 1) throw new Error('SQiggL Parser Error: Invalid expression in replacement statement.');
        return dsl;
    }

    /**
     * Search for a matching action in the command and return a DSLCommand
     *
     * As a rule all commands must start with an action as the first "word".
     * If a command is not found, throw a No Action error
     *
     * @param input {string}
     * @returns {DSLCommand}
     */
    private parseCommand(input: string): DSLCommand{
        const first = input.split(' ')[0];
        const potential = this.actions.map(x => x.key.toLowerCase()).indexOf(first.toLowerCase());
        if(potential < 0) throw new Error('SQiggL No Action Error: Commands require the first word to be a known action.');
        return this.generateCommandDSL(this.actions[potential], input);
    }

    /**
     * Create a DSL command from the matching Action definition and
     * @param definition
     * @param value
     * @returns {DSLCommand}
     */
    private generateCommandDSL(definition: StartingAction | DependentAction, value: string): DSLCommand{
        return <DSLCommand>{literal: value, action: definition};
    }

    /**
     * Assigns levels to the current DSL
     *
     * Rules:
     *  - If an action is found check if it's a DependentAction
     *      - If the action is not a dependent, save on current level and increase the level for the next items
     *      - If the action is a dependent, move up a level and save the item
     *          - If `end === false`, move the level back down for more nested items
     *  - If no action is found, save the item on the current level
     *
     * @param dsls - The current DSL array
     * @returns {LeveledDSL[]}
     */
    private levelDSL(dsls: DSL[]): LeveledDSL[]{
        let currentLevel: number = 0,
            levels: LeveledDSL[] = [],
            dsl: DSL;
        for(dsl of dsls){
            if(dsl.command && dsl.command.action){
                if((<DependentAction>dsl.command.action).dependents != null){
                    levels.push({level: --currentLevel, dsl: dsl});
                    if(currentLevel < 0) throw new Error('SQiggL Parser Error: Your SQiggL is incorrectly nested.');
                    if(!(<DependentAction>dsl.command.action).end) currentLevel++;
                } else {
                    levels.push({level: currentLevel++, dsl: dsl});
                }
            } else {
                levels.push({level: currentLevel, dsl: dsl});
            }
        }
        return levels;
    }

    /**
     * Uses the previously defined levels to correctly nest the DSL into scopes
     *
     * *uses a top-down approach*
     *
     * Rules: (`down === level++`) *down means the level has increased*
     *  - If the item is at the same level, move to the next item in the array
     *  - If the item is down a level, cut/paste all direct siblings at or below
     *    the current level onto the previous item and then recursively scope those
     *
     * @param leveledDSL - The leveled DSL returned from levelDSL
     * @returns {DSL[]}
     */
    private scopeDSL(leveledDSL: LeveledDSL[]): DSL[]{
        let currentLevel: number = leveledDSL[0].level;
        let idx: number = 0;
        while(idx < leveledDSL.length){
            if(leveledDSL[idx].level !== currentLevel){
                let numberOfItems: number = leveledDSL.map(x => x.level).indexOf(currentLevel, idx) - idx;
                leveledDSL[idx - 1].dsl.scope = this.scopeDSL(leveledDSL.splice(idx, numberOfItems));
            }
            idx++;
        }
        return leveledDSL.map(x => x.dsl);
    }

    /**
     * Precompilation step for creating the regex statements used to match expressions
     *
     * Takes in an array of core or user defined expressions and then outputs the same
     * collection with the addition of a `regex` property that has the compiled RegExp
     * @param expressions {Expression[]}
     * @returns {Expression[]}
     */
    private translateExpressionTemplatesToRegex(expressions: Expression[]): Expression[]{
        let expression: Expression;
        for(expression of expressions){
            let regexString: string = '^',
                part: string | OrderedModifier[];
            for(part of expression.template){
                if(part === VALUE) regexString += '([\\w\\d]+)';
                else if(part === SPACE) regexString += '\\s{1}';
                else if(typeof part === 'object'){
                    regexString += `(${this.bundleAndFlattenOrderedModifiers(part).join('|')})?`;
                }
                else regexString += part;
            }
            expression.regex = new RegExp(regexString, 'i');
        }
        return expressions;
    }

    /**
     * First concats all of the OrderedModifiers together into a sigle array, then
     * extracts the identifiers for the modifier. This is used to generate the regex
     * for matching expressions.
     *
     * @param items {OrderedModifier[]}
     * @returns {string[]}
     */
    private bundleAndFlattenOrderedModifiers(items: OrderedModifier[]): string[]{
        let bundle: Modifier[] = [];
        let item: OrderedModifier;
        for(item of items){
            let key: string;
            for(key in item){
                if(item.hasOwnProperty(key)) bundle.push(item[key]);
            }
        }
        return bundle.reduce((a, b) => a.concat(b.identifiers), []);
    }

    /**
     * First sorts the modifiers based on the numbered index property, this is
     * the execution order for the modifiers defined in a Modifier template.
     * The now ordered modifiers are now extracted from the list in order
     * and returned. This is used in the parseReplacement function to create
     * the list of *found* modifiers in the expression that is currently being
     * evaluated.
     *
     * @param ordered: {OrderedModifier[]}
     * @returns {Modifier[]}
     */
    private sortAndExtractModifiers(ordered: OrderedModifier[]): Modifier[]{
        ordered = ordered.sort((a, b) => {
            let aKey: number, bKey: number, key: string;
            for(key in a){
                if(a.hasOwnProperty(key)) aKey = parseInt(key);
            }
            for(key in b){
                if(b.hasOwnProperty(key)) bKey = parseInt(key);
            }
            return aKey < bKey ? -1 : 1;
        });
        return <Modifier[]>ordered.map((x: OrderedModifier) => {
            let key: string;
            for(key in x){
                if(x.hasOwnProperty(key)) return x[key];
            }
        });
    }
}