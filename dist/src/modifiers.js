exports.Not = {
    identifiers: ['!', 'not'],
    rule: function (prevResult, values) { return !prevResult; }
};
exports.OrEqual = {
    identifiers: ['='],
    rule: function (prevResult, values) { return prevResult || values[0] === values[1]; }
};
exports.LengthOrEqual = {
    identifiers: ['='],
    rule: function (prevResult, values) { return prevResult || values[0].length === +values[1]; }
};
exports.BetweenOrEqual = {
    identifiers: ['='],
    rule: function (prevResult, values) { return prevResult || +values[0] === +values[1] || +values[0] === +values[2]; }
};
exports.CORE_MODIFIERS = [
    exports.Not,
    exports.OrEqual,
    exports.LengthOrEqual,
    exports.BetweenOrEqual
];
