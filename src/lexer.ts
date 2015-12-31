import {DSL, DSLType, DSLText, DSLVariable, DSLVariableType, DSLCommand, DSLReplacement, DSLExpression, LeveledDSL} from './dsl';
import {Action, StartingAction, DependentAction, CORE_ACTIONS} from './actions';
import {Expression, BooleanExpression, ValueExpression, BaseExpression, CORE_EXPRESSIONS, VALUE, SPACE, OrderedModifier} from './expressions';
import {Modifier, CORE_MODIFIERS} from './modifiers';
import {VariableLexer} from './lexers/variable.lexer';
import {ReplacementLexer} from './lexers/replacement.lexer';
import {CommandLexer} from "./lexers/command.lexer";

export interface LexerOptions{
    leftWrapperChar?: string;
    rightWrapperChar?: string;
    commandChar?: string;
    variableChar?: string;
    commentChar?: string;
    variableAssignmentChar?: string;
    stringEscapeChar?: string;
    customActions?: Action[];
    customExpressions?: Expression[];
    customModifiers?: Modifier[];
    includeCoreLibrary?: boolean; //TODO:Implement
}

export const DEFAULT_LEXER_OPTIONS: LexerOptions = {
    leftWrapperChar: '{',
    rightWrapperChar: '}',
    commandChar: '%',
    variableChar: '+',
    commentChar: '#',
    variableAssignmentChar: ':',
    stringEscapeChar: '\\',
    includeCoreLibrary: true
};

/**
 * The parent lexer to all specific lexers.
 *
 * Performs all identification of statements and prepares all text for
 * parsing by the specific lexers.
 *
 * @internal
 */
export class Lexer{
    /**
     * A list of all known Actions (including custom actions defined and imported by plugins)
     *
     * @internal
     */
    private actions: Action[];

    /**
     * A list of all known Expressions (including custom expressions defined and imported by plugins)
     *
     * @internal
     */
    private expressions: Expression[];

    /**
     * A list of all known Modifiers (including custom modifiers defined and imported by plugins)
     *
     * @internal
     */
    private modifiers: Modifier[];

    /**
     * Creates a new instance of Lexer
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation
     */
    constructor(private options: LexerOptions = {}){
        this.setOptions(this.options)
            .validateOptions(this.options)
            .setLibTypes(this.options)
            .setCustomTypes(this.options);
    }

    /**
     * Set the lexer options to either the provided options, or the defaults
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generations
     * @returns {Lexer} - The Lexer (For convenience chaining of startup methods)
     */
    private setOptions(options: LexerOptions): Lexer{
        for(var key of Object.keys(DEFAULT_LEXER_OPTIONS)){
             this.options[key] = options[key] || DEFAULT_LEXER_OPTIONS[key];
        }
        return this;
    }

    /**
     * Validate that the options will not conflict with each other.
     * *All* provided string character options *must* be unique
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation.
     * @returns {Lexer} - The Lexer (For convenience chaining of startup methods)
     */
    private validateOptions(options: LexerOptions): Lexer{
        let array: string[] = [];
        for(var key of Object.keys(DEFAULT_LEXER_OPTIONS)){
            if(typeof options[key] === 'string') array.push(options[key]);
        }
        for(let i=0; i< array.length - 1; i++){
            if(array[i] === array[i + 1]) throw new Error('SQiggL Lexer Options Error: All Lexer Options chars must be unique');
        }
        return this;
    }

    /**
     * Add the core Actions, Expressions, and Modifiers.
     * These will not be set if `options.includeCoreLibrary` is false.
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation.
     * @returns {Lexer} - The Lexer (For convenience chaining of startup methods)
     */
    private setLibTypes(options: LexerOptions): Lexer{
        if(!!options.includeCoreLibrary){
            this.actions = CORE_ACTIONS;
            this.expressions = CORE_EXPRESSIONS;
            this.modifiers = CORE_MODIFIERS;
        }
        return this;
    }

    /**
     * Add any custom Actions, Expressions, or Modifiers provided.
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation.
     * @returns {Lexer} - The Lexer (For convenience chaining of startup methods)
     */
    private setCustomTypes(options: LexerOptions): Lexer{
        if(options.customActions != null) this.actions = this.actions.concat(options.customActions);
        if(options.customExpressions != null) this.expressions = this.expressions.concat(options.customExpressions);
        if(options.customModifiers != null) this.modifiers = this.modifiers.concat(options.customModifiers);
        return this;
    }

    /**
     * Beginning the parsing process, this method will guide the inputted string
     * through the parsing process and output the full DSL used to then execute
     * by the "Parser"
     *
     * @internal
     * @param input {string} - The string to generate DSL for.
     * @returns {DSL[]} - The final DSL to be passed to the Parser.
     */
    public parse(input: string): DSL[] {
        let dsl = this.identify(input);
        let leveledDSL: LeveledDSL[] = this.levelDSL(dsl);
        dsl = this.scopeDSL(leveledDSL);
        return dsl;
    }

    /**
     * Identify all special parts found in the SQiggL query. This then routes the found
     * identified statements to the individual DSL parsers to create the appropriate DSL
     * for the query.
     *
     * @internal
     * @param input {string} - The string to identify different statements and generate DSL for.
     * @returns {DSL[]} - The now identified and fully parsed DSL, ready for leveling and scoping.
     */
    private identify(input: string): DSL[]{
        let currentType: DSLType = DSLType.text,
            idx: number = 0,
            startIdx: number = 0,
            dsl: DSL[] = [];
        while(idx < input.length){
            switch(input.charAt(idx)){
                case this.options.leftWrapperChar:
                    if(currentType !== DSLType.text) throw new Error(`SQiggLLexerError: Unexpected '${this.options.leftWrapperChar}' found in statement. Expected '${this.options.rightWrapperChar}'.`);
                    if(idx !== 0) dsl.push(this.generateDSL(currentType, input.slice(startIdx, idx)));
                    switch(input.charAt(idx + 1)) {
                        case this.options.commandChar:
                            idx += 2;
                            currentType = DSLType.command;
                            break;
                        case this.options.commentChar:
                            idx += 2;
                            currentType = DSLType.comment;
                            break;
                        case this.options.variableChar:
                            idx += 2;
                            currentType = DSLType.variable;
                            break;
                        default:
                            idx++;
                            currentType = DSLType.replacement;
                    }
                    startIdx = idx; // Set start index for next type
                    break;
                case this.options.rightWrapperChar:
                    if(idx !== 0) dsl.push(this.generateDSL(currentType, input.slice(startIdx, idx))); // Append current type
                    idx++;
                    startIdx = idx;
                    currentType = DSLType.text;
                    break;
                default:
                    idx++;
            }
        }
        if(currentType !== DSLType.text) throw new Error(`SQiggLLexerError: Expected statement to complete before end of file.`)
        if(startIdx !== idx) dsl.push(this.generateDSL(currentType, input.slice(startIdx)));
        return dsl;
    }

    /**
     * Choose the correct DSL representation for the found type and parse/generate it
     *
     * @internal
     * @param type {DSLType}
     * @param value {string}
     * @returns {DSL}
     */
    private generateDSL(type: DSLType, value: string): DSL{
        switch(type){
            case DSLType.text:
                return <DSL>{text: value};
            case DSLType.variable:
                value = VariableLexer.cleanStringForLexing(value);
                return <DSL>{variable: new VariableLexer(this.options).invoke(value)};
            case DSLType.replacement:
                value = ReplacementLexer.cleanStringForLexing(value);
                return <DSL>{replacement: new ReplacementLexer(this.options, this.expressions).invoke(value, this.extractParts(value))};
            case DSLType.command:
                value = CommandLexer.cleanStringForLexing(value);
                return <DSL>{command: new CommandLexer(this.options, this.actions, this.expressions).invoke(value, this.extractParts(value))};
            case DSLType.comment:
                return <DSL>{comment: value.trim()};
            /* istabnul ignore next */
            default:
                throw new Error('SQiggL Lexer Error: Unrecognized DSLType');
        }
    }

    /**
     * Assigns levels to the current DSL
     *
     * Rules:
     *  - If an action is found check if it's a DependentAction
     *      - If the action is not a dependent, save on current level and increase the level for the next items
     *      - If the action is a dependent, move up a level and save the item
     *      - If the action is not a TerminatingAction, move the level back down for more nested items
     *  - If no action is found, save the item on the current level
     *
     * @internal
     * @param dsls {DSL[]} - The current DSL array
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
                    if(currentLevel < 0) throw new Error('SQiggLLexerError: Your SQiggL is incorrectly nested.');
                    if(!!(<DependentAction>dsl.command.action).rule) currentLevel++;
                } else {
                    levels.push({level: currentLevel++, dsl: dsl});
                }
            } else {
                levels.push({level: currentLevel, dsl: dsl});
            }
        }
        if(currentLevel > 0) throw new Error('SQiggLLexerError: Your SQiggL query is nested but does not return to the top level before completing. Please check your nesting.')
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
     * @internal
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
     * Split the found string into parts
     * A part is any set of characters, separated by a space.
     * Words within a literal string are *not* split. They are treated as one "Part".
     *
     * @internal
     * @param input {string}
     * @returns {string[]}
     */
    private extractParts(input: string): string[]{
        let idx: number = 0, parts: string[] = [];
        let oops: number = 0;
        while(idx < input.length){
            parts.push(this.extractWord(input, idx));
            idx += parts[parts.length-1].length;
            if(input[idx] === ' '){
                parts.push(SPACE);
                idx++;
            }
        }
        parts = Lexer.removeEscapeCharactersFromStringParts(parts, this.options);
        return parts;
    }

    /**
     * Finds a single "part".
     * If the "part" is a literal string, use the `extractString` method instead.
     *
     * @internal
     * @param input {string}
     * @param start {number} - The starting index to search
     * @returns {string}
     */
    private extractWord(input: string, start: number): string{
        let nextSpace: number;
        if(input[start] === "'" || input[start] === '"'){
            return this.extractString(input, start, input[start]);
        } else {
            nextSpace = input.indexOf(' ', start);
            return input.slice(start, nextSpace > 0 ? nextSpace : input.length);
        }
    }

    /**
     * Finds a single "part" that is a literal string.
     * Honors escaped quotes.
     *
     * @internal
     * @param input {string}
     * @param start {number} - The starting index to search
     * @param stringChar {string} - Which type of quote was used
     * @returns {string}
     */
    private extractString(input: string, start: number, stringChar: string): string{
        let idx: number = start + 1;
        while(idx < input.length){
            switch(input[idx]){
                case this.options.stringEscapeChar:
                    if(input[idx+1] === this.options.stringEscapeChar || input[idx+1] === stringChar){
                        idx+=2;
                    } else {
                        throw new Error(`SQiggLLexerError: Illegal escape character found in string ${input} at index ${idx}`);
                    }
                    break;
                case stringChar:
                    return input.slice(start, idx+1);
                default:
                    idx++;
            }
        }
        throw new Error(`SQiggLLexerError: Invalid string found in ${input}`);
    }

    public static removeEscapeCharactersFromStringParts(parts: string[], options: LexerOptions): string[]{
        for(var idx=0;idx<parts.length;idx++){
            parts[idx] = Lexer.removeEscapeCharactersFromStringPart(parts[idx], options);
        }
        return parts;
    }

    public static removeEscapeCharactersFromStringPart(part: string, options: LexerOptions): string{
        if(part[0] === "'" || part[0] === '"') {
            part = part.replace(`${options.stringEscapeChar}"`, '"')
                .replace(`${options.stringEscapeChar}'`, "'")
                .replace(`${options.stringEscapeChar}${options.stringEscapeChar}`, `${options.stringEscapeChar}`);
        }
        return part;
    }
}