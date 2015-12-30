var parser_1 = require('../parser');
var expression_parser_1 = require('./expression.parser');
/**
 * The parser responsible for all DSLReplacements.
 *
 * @internal
 */
var ReplacementParser = (function () {
    /**
     * Creates a new instance of ReplacementParser
     *
     * @internal
     * @param options {ParserOptions} - The {@link ParserOptions} for string output.
     */
    function ReplacementParser(options) {
        this.options = options;
    }
    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @internal
     * @param dsl {DSLReplacement} - The DSL to parse.
     * @param variables {ScopedVariables} - The list of known variables for this scope.
     * @returns {string} - The final output string for this replacement.
     */
    ReplacementParser.prototype.parse = function (dsl, variables) {
        var result;
        if (!!dsl.expression) {
            result = new expression_parser_1.ExpressionParser(this.options).parse(dsl, variables);
            if (Array.isArray(result)) {
                result = result.join(parser_1.Parser.resolveValue(dsl.joiner, variables) + " ");
            }
        }
        else {
            result = parser_1.Parser.resolveValue(dsl.literal, variables).toString();
        }
        if (result === true)
            return this.options.trueString;
        if (result === false)
            return this.options.falseString;
        return result;
    };
    return ReplacementParser;
})();
exports.ReplacementParser = ReplacementParser;
