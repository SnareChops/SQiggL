var _this = this;
var Condition_1 = require('./conditions/Condition');
var Modifiers_1 = require('./Modifiers');
var EqualDefinition = {
    template: '(v) (m)=(m) (c)',
    items: ['variable', [Modifiers_1.Not, Modifiers_1.OrEqual], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return variables[variable] === comparative; }
};
exports.Equal = new Condition_1.default(EqualDefinition);
var GreaterThanDefinition = {
    template: '(v) (m)>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return parseFloat(variables[variable]) > parseFloat(comparative); }
};
exports.GreaterThan = new Condition_1.default(GreaterThanDefinition);
var LessThanDefinition = {
    template: '(v) (m)<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return parseFloat(variables[variable]) < parseFloat(comparative); }
};
exports.LessThan = new Condition_1.default(LessThanDefinition);
var IsNullDefinition = {
    template: '(v) is (m) null',
    items: ['variable', [Modifiers_1.Not]],
    rule: function (variable, comparative, variables) { return variables[variable] == null; }
};
exports.IsNull = new Condition_1.default(exports.IsNull);
var AlphabeticallyGreaterThanDefinition = {
    template: '(v) (m)abc>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return [variables[variable], _this.comparative].sort().indexOf(comparative) > 0; }
};
exports.AlphabeticallyGreaterThan = new Condition_1.default(AlphabeticallyGreaterThanDefinition);
var AlphabeticallyLessThanDefinition = {
    template: '(v) (m)abc<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return [variables[variable], comparative].sort().indexOf(comparative) === 0; }
};
exports.AlphabeticallyLessThan = new Condition_1.default(AlphabeticallyLessThanDefinition);
var LengthGreaterThanDefinition = {
    template: '(v) (m)len>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return variables[variable].length > parseInt(comparative); }
};
exports.LengthGreaterThan = new Condition_1.default(LengthGreaterThanDefinition);
var LengthLessThanDefinition = {
    template: '(v) (m)len<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return variables[variable].length < parseInt(comparative); }
};
exports.LengthLessThan = new Condition_1.default(LengthLessThanDefinition);
var IsNaNDefinition = {
    template: '(v) is (m) NaN',
    items: ['variable', [Modifiers_1.Not]],
    rule: function (variable, comparative, variables) { return isNaN(variables[variable]); }
};
exports.IsNaN = new Condition_1.default(IsNaNDefinition);
var BetweenDefinition = {
    template: '(v) (c)>(m)<(c)',
    items: ['variable', 'comparative', [Modifiers_1.Not, Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return parseFloat(comparative[0]) > parseFloat(variables[variable]) && parseFloat(comparative[1]) < parseFloat(variables[variable]); }
};
exports.Between = new Condition_1.default(BetweenDefinition);
var Condition_2 = require('./conditions/Condition');
exports.Condition = Condition_2.default;
