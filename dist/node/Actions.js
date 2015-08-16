var CommandResult_1 = require('./commands/CommandResult');
var Action_1 = require('./actions/Action');
var Conditions_1 = require('./Conditions');
var EndIfDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
    dependents: [],
    terminator: true,
    rule: function (command, prev) {
        command.result = new CommandResult_1.default(command.inner, true);
        return command;
    }
};
exports.EndIf = new Action_1.default(EndIfDefinition);
var ElseDefinition = {
    regex: /^\s*else\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: function (command, prev) {
        if (!prev.result.passed)
            command.result = new CommandResult_1.default(command.inner + command.scope.perform(), true);
        else
            command.result = new CommandResult_1.default('', false);
        return command;
    }
};
exports.Else = new Action_1.default(ElseDefinition);
var IfDefinition = {
    regex: /^\s*if\b/i,
    conditions: [Conditions_1.Equal, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.IsNull, Conditions_1.AlphabeticallyGreaterThan, Conditions_1.AlphabeticallyLessThan, Conditions_1.LengthGreaterThan, Conditions_1.LengthLessThan, Conditions_1.IsNaN, Conditions_1.Between],
    dependents: [exports.Else, exports.EndIf],
    terminator: false,
    rule: function (command, prev) {
        if (command.condition.perform(command)) {
            command.result = new CommandResult_1.default(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else
            command.result = new CommandResult_1.default(command.defer(false), false);
        return command;
    }
};
exports.If = new Action_1.default(IfDefinition);
var EndUnlessDefinition = {
    regex: /^\s*endunless\b/i,
    conditions: [],
    dependents: [],
    terminator: true,
    rule: function (command, prev) {
        command.result = new CommandResult_1.default(command.inner, true);
        return command;
    }
};
exports.EndUnless = new Action_1.default(EndUnlessDefinition);
var UnlessDefinition = {
    regex: /^\s*unless\b/i,
    conditions: [Conditions_1.Equal, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.IsNull, Conditions_1.AlphabeticallyGreaterThan, Conditions_1.AlphabeticallyLessThan, Conditions_1.LengthGreaterThan, Conditions_1.LengthLessThan, Conditions_1.IsNaN, Conditions_1.Between],
    dependents: [exports.Else, exports.EndUnless],
    terminator: false,
    rule: function (command, prev) {
        if (!command.condition.perform(command)) {
            command.result = new CommandResult_1.default(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else
            command.result = new CommandResult_1.default(command.defer(false), false);
        return command;
    }
};
exports.Unless = new Action_1.default(UnlessDefinition);
var Action_2 = require('./actions/Action');
exports.Action = Action_2.default;
