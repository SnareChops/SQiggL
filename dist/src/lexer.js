var dsl_1 = require('./dsl');
var actions_1 = require('./actions');
var expressions_1 = require('./expressions');
var modifiers_1 = require('./modifiers');
var variable_lexer_1 = require('./lexers/variable.lexer');
var replacement_lexer_1 = require('./lexers/replacement.lexer');
var command_lexer_1 = require("./lexers/command.lexer");
exports.DEFAULT_LEXER_OPTIONS = {
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
var Lexer = (function () {
    /**
     * Creates a new instance of Lexer
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation
     */
    function Lexer(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
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
    Lexer.prototype.setOptions = function (options) {
        for (var _i = 0, _a = Object.keys(exports.DEFAULT_LEXER_OPTIONS); _i < _a.length; _i++) {
            var key = _a[_i];
            this.options[key] = options[key] || exports.DEFAULT_LEXER_OPTIONS[key];
        }
        return this;
    };
    /**
     * Validate that the options will not conflict with each other.
     * *All* provided string character options *must* be unique
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation.
     * @returns {Lexer} - The Lexer (For convenience chaining of startup methods)
     */
    Lexer.prototype.validateOptions = function (options) {
        var array = [];
        for (var _i = 0, _a = Object.keys(exports.DEFAULT_LEXER_OPTIONS); _i < _a.length; _i++) {
            var key = _a[_i];
            if (typeof options[key] === 'string')
                array.push(options[key]);
        }
        for (var i = 0; i < array.length - 1; i++) {
            if (array[i] === array[i + 1])
                throw new Error('SQiggL Lexer Options Error: All Lexer Options chars must be unique');
        }
        return this;
    };
    /**
     * Add the core Actions, Expressions, and Modifiers.
     * These will not be set if `options.includeCoreLibrary` is false.
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation.
     * @returns {Lexer} - The Lexer (For convenience chaining of startup methods)
     */
    Lexer.prototype.setLibTypes = function (options) {
        if (!!options.includeCoreLibrary) {
            this.actions = actions_1.CORE_ACTIONS;
            this.expressions = expressions_1.CORE_EXPRESSIONS;
            this.modifiers = modifiers_1.CORE_MODIFIERS;
        }
        return this;
    };
    /**
     * Add any custom Actions, Expressions, or Modifiers provided.
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation.
     * @returns {Lexer} - The Lexer (For convenience chaining of startup methods)
     */
    Lexer.prototype.setCustomTypes = function (options) {
        if (options.customActions != null)
            this.actions = this.actions.concat(options.customActions);
        if (options.customExpressions != null)
            this.expressions = this.expressions.concat(options.customExpressions);
        if (options.customModifiers != null)
            this.modifiers = this.modifiers.concat(options.customModifiers);
        return this;
    };
    /**
     * Beginning the parsing process, this method will guide the inputted string
     * through the parsing process and output the full DSL used to then execute
     * by the "Parser"
     *
     * @internal
     * @param input {string} - The string to generate DSL for.
     * @returns {DSL[]} - The final DSL to be passed to the Parser.
     */
    Lexer.prototype.parse = function (input) {
        var dsl = this.identify(input);
        var leveledDSL = this.levelDSL(dsl);
        dsl = this.scopeDSL(leveledDSL);
        return dsl;
    };
    /**
     * Identify all special parts found in the SQiggL query. This then routes the found
     * identified statements to the individual DSL parsers to create the appropriate DSL
     * for the query.
     *
     * @internal
     * @param input {string} - The string to identify different statements and generate DSL for.
     * @returns {DSL[]} - The now identified and fully parsed DSL, ready for leveling and scoping.
     */
    Lexer.prototype.identify = function (input) {
        var currentType = dsl_1.DSLType.text, idx = 0, startIdx = 0, dsl = [];
        while (idx < input.length) {
            switch (input.charAt(idx)) {
                case this.options.leftWrapperChar:
                    if (currentType !== dsl_1.DSLType.text)
                        throw new Error("SQiggLLexerError: Unexpected '" + this.options.leftWrapperChar + "' found in statement. Expected '" + this.options.rightWrapperChar + "'.");
                    if (idx !== 0)
                        dsl.push(this.generateDSL(currentType, input.slice(startIdx, idx)));
                    switch (input.charAt(idx + 1)) {
                        case this.options.commandChar:
                            idx += 2;
                            currentType = dsl_1.DSLType.command;
                            break;
                        case this.options.commentChar:
                            idx += 2;
                            currentType = dsl_1.DSLType.comment;
                            break;
                        case this.options.variableChar:
                            idx += 2;
                            currentType = dsl_1.DSLType.variable;
                            break;
                        default:
                            idx++;
                            currentType = dsl_1.DSLType.replacement;
                    }
                    startIdx = idx; // Set start index for next type
                    break;
                case this.options.rightWrapperChar:
                    if (idx !== 0)
                        dsl.push(this.generateDSL(currentType, input.slice(startIdx, idx))); // Append current type
                    idx++;
                    startIdx = idx;
                    currentType = dsl_1.DSLType.text;
                    break;
                default:
                    idx++;
            }
        }
        if (currentType !== dsl_1.DSLType.text)
            throw new Error("SQiggLLexerError: Expected statement to complete before end of file.");
        if (startIdx !== idx)
            dsl.push(this.generateDSL(currentType, input.slice(startIdx)));
        return dsl;
    };
    /**
     * Choose the correct DSL representation for the found type and parse/generate it
     * @param type {DSLType}
     * @param value {string}
     * @returns {DSL}
     */
    Lexer.prototype.generateDSL = function (type, value) {
        switch (type) {
            case dsl_1.DSLType.text:
                return { text: value };
            case dsl_1.DSLType.variable:
                value = variable_lexer_1.VariableLexer.cleanStringForLexing(value);
                return { variable: new variable_lexer_1.VariableLexer(this.options).invoke(value) };
            case dsl_1.DSLType.replacement:
                value = replacement_lexer_1.ReplacementLexer.cleanStringForLexing(value);
                return { replacement: new replacement_lexer_1.ReplacementLexer(this.options, this.expressions).invoke(value, this.extractParts(value)) };
            case dsl_1.DSLType.command:
                value = command_lexer_1.CommandLexer.cleanStringForLexing(value);
                return { command: new command_lexer_1.CommandLexer(this.options, this.actions, this.expressions).invoke(value, this.extractParts(value)) };
            case dsl_1.DSLType.comment:
                return { comment: value.trim() };
            /* istabnul ignore next */
            default:
                throw new Error('SQiggL Lexer Error: Unrecognized DSLType');
        }
    };
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
     * @param dsls {DSL[]} - The current DSL array
     * @returns {LeveledDSL[]}
     */
    Lexer.prototype.levelDSL = function (dsls) {
        var currentLevel = 0, levels = [], dsl;
        for (var _i = 0; _i < dsls.length; _i++) {
            dsl = dsls[_i];
            if (dsl.command && dsl.command.action) {
                if (dsl.command.action.dependents != null) {
                    levels.push({ level: --currentLevel, dsl: dsl });
                    if (currentLevel < 0)
                        throw new Error('SQiggLLexerError: Your SQiggL is incorrectly nested.');
                    if (!!dsl.command.action.rule)
                        currentLevel++;
                }
                else {
                    levels.push({ level: currentLevel++, dsl: dsl });
                }
            }
            else {
                levels.push({ level: currentLevel, dsl: dsl });
            }
        }
        if (currentLevel > 0)
            throw new Error('SQiggLLexerError: Your SQiggL query is nested but does not return to the top level before completing. Please check your nesting.');
        return levels;
    };
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
    Lexer.prototype.scopeDSL = function (leveledDSL) {
        var currentLevel = leveledDSL[0].level;
        var idx = 0;
        while (idx < leveledDSL.length) {
            if (leveledDSL[idx].level !== currentLevel) {
                var numberOfItems = leveledDSL.map(function (x) { return x.level; }).indexOf(currentLevel, idx) - idx;
                leveledDSL[idx - 1].dsl.scope = this.scopeDSL(leveledDSL.splice(idx, numberOfItems));
            }
            idx++;
        }
        return leveledDSL.map(function (x) { return x.dsl; });
    };
    /**
     * Split the found string into parts
     * A part is any set of characters, separated by a space.
     * Words within a literal string are *not* split. They are treated as one "Part"
     * @param input {string}
     * @returns {string[]}
     */
    Lexer.prototype.extractParts = function (input) {
        var idx = 0, parts = [];
        var oops = 0;
        while (idx < input.length) {
            parts.push(this.extractWord(input, idx));
            idx += parts[parts.length - 1].length;
            if (input[idx] === ' ') {
                parts.push(expressions_1.SPACE);
                idx++;
            }
        }
        parts = this.removeEscapeCharactersFromStringParts(parts);
        return parts;
    };
    /**
     * Finds a single "part".
     * If the "part" is a literal string, use the `extractString` method instead.
     * @param input {string}
     * @param start {number} - The starting index to search
     * @returns {string}
     */
    Lexer.prototype.extractWord = function (input, start) {
        var nextSpace;
        if (input[start] === "'" || input[start] === '"') {
            return this.extractString(input, start, input[start]);
        }
        else {
            nextSpace = input.indexOf(' ', start);
            return input.slice(start, nextSpace > 0 ? nextSpace : input.length);
        }
    };
    /**
     * Finds a single "part" that is a literal string.
     * Honors escaped quotes.
     * @param input {string}
     * @param start {number} - The starting index to search
     * @param stringChar {string} - Which type of quote was used
     * @returns {string}
     */
    Lexer.prototype.extractString = function (input, start, stringChar) {
        var idx = start + 1;
        while (idx < input.length) {
            switch (input[idx]) {
                case this.options.stringEscapeChar:
                    if (input[idx + 1] === this.options.stringEscapeChar || input[idx + 1] === stringChar) {
                        idx += 2;
                    }
                    else {
                        throw new Error("SQiggLLexerError: Illegal escape character found in string " + input + " at index " + idx);
                    }
                    break;
                case stringChar:
                    return input.slice(start, idx + 1);
                default:
                    idx++;
            }
        }
        throw new Error("SQiggLLexerError: Invalid string found in " + input);
    };
    Lexer.prototype.removeEscapeCharactersFromStringParts = function (parts) {
        for (var idx = 0; idx < parts.length; idx++) {
            if (parts[idx][0] === "'" || parts[idx][0] === '"') {
                parts[idx] = parts[idx].replace(this.options.stringEscapeChar + "\"", '"')
                    .replace(this.options.stringEscapeChar + "'", "'")
                    .replace("" + this.options.stringEscapeChar + this.options.stringEscapeChar, "" + this.options.stringEscapeChar);
            }
        }
        return parts;
    };
    return Lexer;
})();
exports.Lexer = Lexer;
