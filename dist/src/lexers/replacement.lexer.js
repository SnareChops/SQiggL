var expression_lexer_1 = require('./expression.lexer');
/**
 * The lexer responsible for DSL generation of all Replacement statements
 *
 * @internal
 */
var ReplacementLexer = (function () {
    /**
     * Creates a new instance of the Replacement Lexer
     *
     * @internal
     * @param options {LexerOptions} - The LexerOptions to use for all DSL generation.
     * @param expressions {Expression[]} - A list of all known expressions to use when generating DSL.
     */
    function ReplacementLexer(options, expressions) {
        this.options = options;
        this.expressions = expressions;
    }
    /**
     * Split the input into it's respective parts then compare them against expressions
     * or return the input if the contents are literal.
     *
     * TODO: Add Rules
     *
     * @internal
     * @param input {string}
     * @param parts {string[]} - The "Parts" of the input. {@see Lexer.extractParts} for more details on the definition of a "Part".
     * @returns {DSLReplacement}
     */
    ReplacementLexer.prototype.invoke = function (input, parts) {
        var dsl = { literal: input };
        if (parts.length > 1)
            dsl = new expression_lexer_1.ExpressionLexer(this.options, this.expressions).invoke(dsl, parts);
        else
            dsl.literal = parts[0];
        return dsl;
    };
    /**
     * Clean and prepare the input for parsing
     *
     * @internal
     * @param input {string}
     * @returns {string}
     */
    ReplacementLexer.cleanStringForLexing = function (input) {
        return input.replace('\n', ' ').trim();
    };
    return ReplacementLexer;
})();
exports.ReplacementLexer = ReplacementLexer;
