var modifiers_1 = require('./modifiers');
exports.VALUE = '(v)';
exports.LOCALVARIABLE = '(l)';
exports.JOINER = '(j)';
exports.SPACE = ' ';
exports.Equal = {
    template: [exports.VALUE, exports.SPACE, [{ 1: modifiers_1.Not }], '=', [{ 0: modifiers_1.OrEqual }], exports.SPACE, exports.VALUE],
    rule: function (values) { return values[0] == values[1]; }
};
exports.GreaterThan = {
    template: [exports.VALUE, exports.SPACE, [{ 1: modifiers_1.Not }], '>', [{ 0: modifiers_1.OrEqual }], exports.SPACE, exports.VALUE],
    rule: function (values) { return (+values[0]) > (+values[1]); }
};
exports.LessThan = {
    template: [exports.VALUE, exports.SPACE, [{ 1: modifiers_1.Not }], '<', [{ 0: modifiers_1.OrEqual }], exports.SPACE, exports.VALUE],
    rule: function (values) { return (+values[0]) < (+values[1]); }
};
exports.IsNull = {
    template: [exports.VALUE, exports.SPACE, 'is', exports.SPACE, [{ 0: modifiers_1.Not }], 'null'],
    rule: function (values) { return !values[0]; },
    suppressUndefinedVariableError: true
};
exports.LexicalGreaterThan = {
    template: [exports.VALUE, exports.SPACE, [{ 1: modifiers_1.Not }], 'abc>', [{ 0: modifiers_1.OrEqual }], exports.SPACE, exports.VALUE],
    rule: function (values) { return [values[0], values[1]].sort().indexOf(values[0]) > 0; }
};
exports.LexicalLessThan = {
    template: [exports.VALUE, exports.SPACE, [{ 1: modifiers_1.Not }], 'abc<', [{ 0: modifiers_1.OrEqual }], exports.SPACE, exports.VALUE],
    rule: function (values) { return values[0] === values[1] ? false : [values[0], values[1]].sort().indexOf(values[0]) === 0; }
};
exports.LengthGreaterThan = {
    template: [exports.VALUE, exports.SPACE, [{ 1: modifiers_1.Not }], 'len>', [{ 0: modifiers_1.LengthOrEqual }], exports.SPACE, exports.VALUE],
    rule: function (values) { return values[0].length > +values[1]; }
};
exports.LengthLessThan = {
    template: [exports.VALUE, exports.SPACE, [{ 1: modifiers_1.Not }], 'len<', [{ 0: modifiers_1.LengthOrEqual }], exports.SPACE, exports.VALUE],
    rule: function (values) { return values[0].length < +values[1]; }
};
exports.IsNaN = {
    template: [exports.VALUE, exports.SPACE, 'is', exports.SPACE, [{ 0: modifiers_1.Not }], 'NaN'],
    rule: function (values) { return isNaN(Number(values[0])); }
};
exports.Between = {
    template: [exports.VALUE, exports.SPACE, exports.VALUE, exports.SPACE, '>', [{ 1: modifiers_1.Not }], [{ 0: modifiers_1.BetweenOrEqual }], '<', exports.SPACE, exports.VALUE],
    rule: function (values) { return values[1] < values[0] && values[2] > values[0]; }
};
exports.Coalesce = {
    template: [exports.VALUE, exports.SPACE, '??', exports.SPACE, exports.VALUE],
    rule: function (values) { return (values[0] || values[1]).toString(); },
    suppressUndefinedVariableError: true
};
exports.IterableOfUsing = {
    template: [exports.LOCALVARIABLE, exports.SPACE, 'of', exports.SPACE, exports.VALUE, exports.SPACE, 'using', exports.SPACE, exports.JOINER],
    rule: function (values) { return values[0]; }
};
exports.CORE_EXPRESSIONS = [
    exports.Equal,
    exports.GreaterThan,
    exports.LessThan,
    exports.IsNull,
    exports.LexicalGreaterThan,
    exports.LexicalLessThan,
    exports.LengthGreaterThan,
    exports.LengthLessThan,
    exports.IsNaN,
    exports.Between,
    exports.Coalesce,
    exports.IterableOfUsing
];
