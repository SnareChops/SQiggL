var ActionResult_1 = require('./actions/ActionResult');
var Action_1 = require('./actions/Action');
var Conditions_1 = require('./Conditions');
var EndIfDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: function (command, condition, prev) { return new ActionResult_1.default(command.inner, true); }
};
exports.EndIf = new Action_1.default(EndIfDefinition);
var ElseDefinition = {
    regex: /^\s*else\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: function (command, condition, prev) { return !prev.text ? new ActionResult_1.default(command.inner + command.scope.perform().result.text, true) : new ActionResult_1.default('', false); }
};
exports.Else = new Action_1.default(ElseDefinition);
var IfDefinition = {
    regex: /^\s*if\b/i,
    conditions: [Conditions_1.Equal, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.IsNull, Conditions_1.AlphabeticallyGreaterThan, Conditions_1.AlphabeticallyLessThan, Conditions_1.LengthGreaterThan, Conditions_1.LengthLessThan, Conditions_1.IsNaN, Conditions_1.Between],
    dependents: [exports.Else, exports.EndIf],
    terminator: false,
    rule: function (command, condition) { return condition.perform() ? new ActionResult_1.default(command.inner + command.scope.perform().result.text, true) : new ActionResult_1.default(command.terminate(), false); }
};
exports.If = new Action_1.default(IfDefinition);
var ActionResult_2 = require('./actions/ActionResult');
exports.ActionResult = ActionResult_2.default;
var Action_2 = require('./actions/Action');
exports.Action = Action_2.default;
