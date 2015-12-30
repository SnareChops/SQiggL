var dsl_1 = require('../dsl');
/**
 * The Lexer responsible for all DSL generation of variable statements
 *
 * @internal
 */
var VariableLexer = (function () {
    /**
     * Creates a new instance of the VariableLexer
     *
     * @internal
     * @param options {LexerOptions} - The LexerOptions to use when generating DSL
     */
    function VariableLexer(options) {
        this.options = options;
    }
    /**
     * Walk through a variable declaration and return a variable DSL
     *
     * TODO: Add rules
     *
     * @internal
     * @param input {string}
     * @returns {DSLVariable}
     */
    VariableLexer.prototype.invoke = function (input) {
        var currentType = dsl_1.DSLVariableType.key, idx = 0, startIdx = 0, inString = false, stringChar, dsl = { literal: input };
        while (idx < input.length) {
            switch (input.charAt(idx)) {
                case "'":
                    if (currentType === dsl_1.DSLVariableType.key)
                        throw new Error('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
                    if (!inString) {
                        inString = true;
                        stringChar = "'";
                        idx++;
                        break;
                    }
                    if (input.charAt(idx) === stringChar) {
                        if (input.charAt(idx - 1) === this.options.stringEscapeChar) {
                            input = input.slice(0, idx - 1) + input.slice(idx);
                        }
                    }
                    idx++;
                    break;
                case '"':
                    if (currentType === dsl_1.DSLVariableType.key)
                        throw new Error('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
                    if (!inString) {
                        inString = true;
                        stringChar = '"';
                        idx++;
                        break;
                    }
                    if (input.charAt(idx) === stringChar) {
                        if (input.charAt(idx - 1) === this.options.stringEscapeChar) {
                            input = input.slice(0, idx - 1) + input.slice(idx);
                        }
                    }
                    idx++;
                    break;
                case this.options.variableAssignmentChar:
                    dsl = this.generateDSL(dsl, currentType, input.slice(startIdx, idx));
                    idx++;
                    startIdx = idx;
                    currentType = dsl_1.DSLVariableType.value;
                    break;
                default:
                    idx++;
            }
        }
        if (startIdx !== 0)
            dsl = this.generateDSL(dsl, currentType, input.slice(startIdx));
        return dsl;
    };
    /**
     * Generate the DSL for a variable piece by piece. Building on the definition until complete.
     *
     * @internal
     * @param dsl {DSLVariable}
     * @param type {DSLVariableType}
     * @param value {string}
     * @returns {DSLVariable}
     */
    VariableLexer.prototype.generateDSL = function (dsl, type, value) {
        switch (type) {
            case dsl_1.DSLVariableType.key:
                dsl.key = value;
                break;
            case dsl_1.DSLVariableType.value:
                dsl.value = value;
                break;
            /* istanbul ignore next */
            default:
                throw new Error('SQiggL Lexer Error: Unrecognized DSLVariableType');
        }
        return dsl;
    };
    /**
     * Clean and prepare the input for parsing
     *
     * @internal
     * @param input {string}
     * @returns {string}
     */
    VariableLexer.cleanStringForLexing = function (input) {
        return input.replace('\n', ' ').replace(/ (?=(?:(?:\\.|"(?:\\.|[^"\\])*"|[^\\'"])*'(?:\\.|"(?:\\.|[^"'\\])*"|[^\\'])*')*(?:\\.|"(?:\\.|[^"\\])*"|[^\\'])*$)(?=(?:(?:\\.|'(?:\\.|[^'\\])*'|[^\\'"])*"(?:\\.|'(?:\\.|[^'"\\])*'|[^\\"])*")*(?:\\.|'(?:\\.|[^'\\])*'|[^\\"])*$)/g, '').trim();
    };
    return VariableLexer;
})();
exports.VariableLexer = VariableLexer;
