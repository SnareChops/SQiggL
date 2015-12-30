var parser_1 = require('../parser');
/**
 * The parser responsible for parsing all DSLExpressions.
 *
 * @internal
 */
var ExpressionParser = (function () {
    /**
     * Creates a new instance of ExpressionParser.
     *
     * @internal
     * @param options {ParserOptions} - The {@link ParserOptions} for string output.
     */
    function ExpressionParser(options) {
        this.options = options;
    }
    /**
     * Take a DSLExpression and output the final string or boolean.
     *
     * @internal
     * @param dsl {DSLExpression} - The DSL to parse.
     * @param variables {ScopedVariables} - The list of known variables for this scope.
     * @returns {ExpressionResult} - A string | boolean | string[]
     */
    ExpressionParser.prototype.parse = function (dsl, variables) {
        if (variables === void 0) { variables = {}; }
        var idx;
        for (idx = 0; idx < dsl.values.length; idx++) {
            dsl.values[idx] = parser_1.Parser.resolveValue(dsl.values[idx], variables, !!dsl.expression.suppressUndefinedVariableError);
        }
        var result = dsl.expression.rule(dsl.values, dsl.literal);
        if (!!dsl.modifiers) {
            for (var _i = 0, _a = dsl.modifiers; _i < _a.length; _i++) {
                var modifier = _a[_i];
                result = modifier.rule(result, dsl.values);
            }
        }
        return result;
    };
    return ExpressionParser;
})();
exports.ExpressionParser = ExpressionParser;
