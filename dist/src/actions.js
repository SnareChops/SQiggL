var parser_1 = require('./parser');
exports.If = {
    key: 'if',
    rule: function (expressionResult, variables, scope, parser) { return expressionResult ? parser.parse(scope, variables) : null; }
};
exports.EndIf = {
    key: 'endif',
    dependents: [exports.If],
};
exports.Unless = {
    key: 'unless',
    rule: function (expressionResult, variables, scope, parser) { return !expressionResult ? parser.parse(scope, variables) : null; }
};
exports.EndUnless = {
    key: 'endunless',
    dependents: [exports.Unless],
};
exports.Else = {
    key: 'else',
    dependents: [exports.If, exports.Unless],
    rule: function (expressionResult, variables, scope, parser) { return parser.parse(scope, variables); }
};
exports.For = {
    key: 'for',
    rule: function (expressionResult, variables, scope, parser, commandDSL) {
        if (variables === void 0) { variables = {}; }
        var result = [];
        for (var _i = 0; _i < expressionResult.length; _i++) {
            var value = expressionResult[_i];
            variables[commandDSL.local] = value;
            result.push(parser.parse(scope, variables));
        }
        return result.join(parser_1.Parser.resolveValue(commandDSL.joiner, variables) + " ");
    }
};
exports.EndFor = {
    key: 'endfor',
    dependents: [exports.For]
};
exports.CORE_ACTIONS = [
    exports.If,
    exports.Else,
    exports.EndIf,
    exports.Unless,
    exports.EndUnless,
    exports.For,
    exports.EndFor
];
