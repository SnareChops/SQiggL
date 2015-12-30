var parser_1 = require('../parser');
var expression_parser_1 = require('./expression.parser');
/**
 * The parser responsible for parsing all DSLCommands
 *
 * @internal
 */
var CommandParser = (function () {
    /**
     * Creates a new instance of CommandParser.
     *
     * @internal
     * @param options {ParserOptions} - The {@link ParserOptions} for string output.
     */
    function CommandParser(options) {
        this.options = options;
    }
    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @internal
     * @param dsl {DSL} - The DSL to parse (This is slightly different to the other parsers as this parser needs access to the underlying scope)
     * @param variables {ScopedVariables} - The list of all known variables for this scope.
     * @returns {string} - The final output string for this command.
     */
    CommandParser.prototype.parse = function (dsl, variables) {
        if (variables === void 0) { variables = {}; }
        var command = dsl.command;
        var action = command.action;
        var expressionResult = null;
        if (!!command.expression)
            expressionResult = new expression_parser_1.ExpressionParser(this.options).parse(command, variables);
        var result;
        if (!!action.rule) {
            if (Array.isArray(expressionResult))
                result = action.rule(expressionResult, variables, dsl.scope, new parser_1.Parser(this.options), command);
            else
                result = action.rule(expressionResult, variables, dsl.scope, new parser_1.Parser(this.options));
        }
        if (result === null)
            dsl.command.failed = true;
        return result || '';
    };
    return CommandParser;
})();
exports.CommandParser = CommandParser;
