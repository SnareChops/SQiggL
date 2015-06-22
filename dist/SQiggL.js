(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Note: These are loaded in order, make sure any dependent actions are listed above the action that requires them.
var EndIf_1 = require('./actions/EndIf');
exports.EndIf = EndIf_1.default;
var Else_1 = require('./actions/Else');
exports.Else = Else_1.default;
var If_1 = require('./actions/If');
exports.If = If_1.default;

},{"./actions/Else":13,"./actions/EndIf":14,"./actions/If":16}],2:[function(require,module,exports){
var Actions_1 = require('./Actions');
var CommandScope_1 = require('./CommandScope');
var Replacers_1 = require('./Replacers');
var Command = (function () {
    function Command(index, length, statement, inner, variables) {
        this.index = index;
        this.length = length;
        this.statement = statement;
        this.inner = inner;
        this.actions = [Actions_1.If, Actions_1.Else, Actions_1.EndIf];
        this.replacers = [Replacers_1.VariableReplacer];
        this.scope = new CommandScope_1.default();
        this.dependents = [];
        this.scope.variables = variables;
        this.action = this.extract(statement, inner, variables);
    }
    Command.prototype.extract = function (statement, inner, variables) {
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.regex.test(this.statement))
                return new action(this, statement, inner, variables);
        }
        return null;
    };
    Command.prototype.perform = function (passed) {
        var result = this.action.perform(passed);
        result.result += this.performDependents(result.passed);
        for (var _i = 0, _a = this.replacers; _i < _a.length; _i++) {
            var replacer = _a[_i];
            result.result = replacer.replace(result.result, this.scope.variables);
        }
        return result;
    };
    Command.prototype.performScope = function () {
        var ret = '', prevPassed = false;
        for (var _i = 0, _a = this.scope.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            var result = command.perform(prevPassed);
            prevPassed = result.passed;
            ret += result.result;
        }
        return ret;
    };
    Command.prototype.performDependents = function (prevPassed) {
        var ret = '';
        for (var _i = 0, _a = this.dependents; _i < _a.length; _i++) {
            var dependent = _a[_i];
            var result = dependent.perform(prevPassed);
            prevPassed = result.passed;
            ret += result.result;
        }
        return ret;
    };
    Command.prototype.termination = function () {
        return this.scope.commands.some(function (command) { return command.action.terminator; })
            ? this.scope.commands.filter(function (command) { return command.action.terminator; })[1].perform(false).result
            : '';
    };
    Command.prototype.dependent = function (action) {
        window['action'] = this.action.constructor['dependents'];
        for (var _i = 0, _a = this.action.constructor['dependents']; _i < _a.length; _i++) {
            var dependent = _a[_i];
            if (action instanceof dependent)
                return true;
        }
        return false;
    };
    Command.regex = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
    return Command;
})();
exports.default = Command;

},{"./Actions":1,"./CommandScope":3,"./Replacers":11}],3:[function(require,module,exports){
var CommandScope = (function () {
    function CommandScope() {
        this.variables = {};
        this.commands = [];
        this.dependants = [];
    }
    return CommandScope;
})();
exports.default = CommandScope;

},{}],4:[function(require,module,exports){
var IsNotNull_1 = require('./conditions/IsNotNull');
exports.IsNotNull = IsNotNull_1.default;

},{"./conditions/IsNotNull":18}],5:[function(require,module,exports){
var Errors = (function () {
    function Errors() {
    }
    Errors.IncorrectStatement = function (action, statement) {
        var actions = action.command.actions.filter(function (x) { return x.dependents.some(function (y) { return action instanceof y; }); }).map(function (x) { return x.name; }).join(', ');
        var error = "Incorrect statement found at \"" + statement + "\". " + action.constructor['name'] + " must follow " + actions;
        console.error(error);
        return error;
    };
    return Errors;
})();
exports.default = Errors;

},{}],6:[function(require,module,exports){
Array.prototype.last = function () {
    return this[this.length - 1];
};

},{}],7:[function(require,module,exports){


},{}],8:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],9:[function(require,module,exports){
var Parser_1 = require('./Parser');
function parse(sql, variables) {
    var parser = new Parser_1.default(sql, variables);
    return parser.parse();
}
exports.parse = parse;

},{"./Parser":10}],10:[function(require,module,exports){
/// <reference path="Extensions.ts" />
var Command_1 = require('./Command');
Array.prototype.last = function () {
    return this[this.length - 1];
};
var Parser = (function () {
    function Parser(sql, variables) {
        this.sql = sql;
        this.variables = variables;
        this.commands = this.extract(sql, variables);
        this.variables = variables;
    }
    Parser.prototype.extract = function (sql, variables) {
        var match, commands = [], stack = [];
        Command_1.default.regex.lastIndex = 0;
        while ((match = Command_1.default.regex.exec(sql)) != null) {
            var found = new Command_1.default(match.index, match.input.length, match[1], match[2], variables);
            if (stack.length > 0 && stack.last().dependent(found.action)) {
                found.action.supporter = stack.last();
                stack.last().dependents.push(found);
            }
            else if (stack.length > 0 && !stack.last().action.terminator) {
                stack.push(found);
                stack.last().scope.commands.push(found);
            }
            else {
                if (stack.length > 0 && stack.last().action.terminator)
                    stack.pop();
                stack.push(found);
                commands.push(found);
            }
            var error = found.action.validate();
            if (error)
                return [];
        }
        return commands;
    };
    Parser.prototype.parse = function () {
        var query = '', index = 0;
        if (this.commands.length === 0)
            return this.sql;
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            query += this.sql.slice(index, command.index - 1);
            query += command.perform(false).result;
            index += command.length;
        }
        return query; //TODO
    };
    return Parser;
})();
exports.default = Parser;

},{"./Command":2}],11:[function(require,module,exports){
var VariableReplacer_1 = require('./replacers/VariableReplacer');
exports.VariableReplacer = VariableReplacer_1.default;

},{"./replacers/VariableReplacer":20}],12:[function(require,module,exports){
var Main_1 = require('./Main');
window['SQiggL'] = window['SQiggL'] || {};
window['SQiggL'].parse = Main_1.parse;
window['SQiggL'].version = '0.1.0';
exports.default = Main_1.parse;

},{"./Main":9}],13:[function(require,module,exports){
var Errors_1 = require('../Errors');
var Else = (function () {
    function Else(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = false;
    }
    Else.prototype.validate = function () {
        if (!this.supporter)
            return Errors_1.default.IncorrectStatement(this, this.statement);
    };
    Else.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return !prevPassed ? { result: this.inner + this.command.performScope(), passed: true } : { result: '', passed: false };
    };
    Else.regex = /^\s*else\b/;
    Else.dependents = [];
    return Else;
})();
exports.default = Else;

},{"../Errors":5}],14:[function(require,module,exports){
var Errors_1 = require('../Errors');
var EndIf = (function () {
    function EndIf(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = true;
    }
    EndIf.prototype.validate = function () {
        if (!this.supporter)
            return Errors_1.default.IncorrectStatement(this, this.statement);
    };
    EndIf.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return { result: this.inner, passed: true };
    };
    EndIf.regex = /^\s*endif\b/;
    EndIf.dependents = [];
    return EndIf;
})();
exports.default = EndIf;

},{"../Errors":5}],15:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],16:[function(require,module,exports){
/// <reference path="../conditions/ICondition.ts" />
var Actions_1 = require('../Actions');
var Conditions_1 = require('../Conditions');
/**
 * The If action
 * @class
 * @implements {@link IAction}
 * @param {Command} command 			- Parent command of this action
 * @param {string} statement 			- Statement that this should take action on
 * @param {string} inner 				- Text that follows after this action until the next command
 * @param {IVariables} variables		- Variables within the scope of this action
 * @property {Command} command 			- Parent command of this action
 * @property {string} statement			- Statement that this should take action on
 * @property {string} inner 			- Text that follows after this action until the next command
 * @property {IVariables} variables		- Variables within the scope of this action
 * @property {boolean} terminator 		- Defines if this action is a terminator
 * @property {IVariable} variable		- Variable that this should take action on depending on the result of the condition
 * @property {ICondition[]} conditions	- Array of conditions that this action supports (if any)
 * @property {ICondition} condition		- Condition that was found as a match for this action
 * @property {IAction[]} dependents		- Array of actions that are dependent on this action's result
 */
var If = (function () {
    function If(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = false;
        this.condition = this.parseCondition(statement, variables);
    }
    /**
     * Try and locate a matching condition from the available conditions for this action. If no match is found, return null.
     * @method
     * @public
     * @param {string} statement		- Statement to check conditions against
     * @param {IVariables} variables	- List of variables within the scope of this action
     * @returns {ICondition | null}		- Condition that matches within the statement
     */
    If.prototype.parseCondition = function (statement, variables) {
        for (var _i = 0, _a = If.conditions; _i < _a.length; _i++) {
            var condition = _a[_i];
            var match = statement.match(condition.regex);
            if (match.length > 0)
                return new condition(match[1], variables);
        }
        return null;
    };
    If.prototype.validate = function () {
        return null;
    };
    /**
     * Perform the action and return the result.
     * @method
     * @public
     * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
     * @returns {@link IPerformResult}
     */
    If.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return this.condition.perform()
            ? { result: this.inner + this.command.performScope(), passed: true }
            : { result: this.command.termination(), passed: false };
    };
    If.regex = /^\s*if\b/;
    If.conditions = [Conditions_1.IsNotNull];
    If.dependents = [Actions_1.Else, Actions_1.EndIf];
    return If;
})();
exports.default = If;

},{"../Actions":1,"../Conditions":4}],17:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],18:[function(require,module,exports){
var IsNotNull = (function () {
    function IsNotNull(variable, variables) {
        this.variable = variable;
        this.variables = variables;
    }
    IsNotNull.prototype.perform = function () {
        return this.variables[this.variable] != null;
    };
    IsNotNull.regex = /(\w*)\s+is\s+not\s+null\s*/;
    return IsNotNull;
})();
exports.default = IsNotNull;

},{}],19:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],20:[function(require,module,exports){
var VariableReplacer = (function () {
    function VariableReplacer() {
    }
    VariableReplacer.replace = function (text, variables) {
        return text.replace(this.regex, function (match, $1, $2) { return $1 + variables[$2]; });
    };
    VariableReplacer.regex = /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g;
    return VariableReplacer;
})();
exports.default = VariableReplacer;

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0Vycm9ycy5qcyIsInNyYy9FeHRlbnNpb25zLmpzIiwic3JjL0lQZXJmb3JtUmVzdWx0LmpzIiwic3JjL01haW4uanMiLCJzcmMvUGFyc2VyLmpzIiwic3JjL1JlcGxhY2Vycy5qcyIsInNyYy9TUWlnZ0wuanMiLCJzcmMvYWN0aW9ucy9FbHNlLmpzIiwic3JjL2FjdGlvbnMvRW5kSWYuanMiLCJzcmMvYWN0aW9ucy9JZi5qcyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC5qcyIsInNyYy9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTs7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gTm90ZTogVGhlc2UgYXJlIGxvYWRlZCBpbiBvcmRlciwgbWFrZSBzdXJlIGFueSBkZXBlbmRlbnQgYWN0aW9ucyBhcmUgbGlzdGVkIGFib3ZlIHRoZSBhY3Rpb24gdGhhdCByZXF1aXJlcyB0aGVtLlxudmFyIEVuZElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvRW5kSWYnKTtcbmV4cG9ydHMuRW5kSWYgPSBFbmRJZl8xLmRlZmF1bHQ7XG52YXIgRWxzZV8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0Vsc2UnKTtcbmV4cG9ydHMuRWxzZSA9IEVsc2VfMS5kZWZhdWx0O1xudmFyIElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvSWYnKTtcbmV4cG9ydHMuSWYgPSBJZl8xLmRlZmF1bHQ7XG4iLCJ2YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi9BY3Rpb25zJyk7XG52YXIgQ29tbWFuZFNjb3BlXzEgPSByZXF1aXJlKCcuL0NvbW1hbmRTY29wZScpO1xudmFyIFJlcGxhY2Vyc18xID0gcmVxdWlyZSgnLi9SZXBsYWNlcnMnKTtcbnZhciBDb21tYW5kID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kKGluZGV4LCBsZW5ndGgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBbQWN0aW9uc18xLklmLCBBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICAgICAgdGhpcy5yZXBsYWNlcnMgPSBbUmVwbGFjZXJzXzEuVmFyaWFibGVSZXBsYWNlcl07XG4gICAgICAgIHRoaXMuc2NvcGUgPSBuZXcgQ29tbWFuZFNjb3BlXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuYWN0aW9uID0gdGhpcy5leHRyYWN0KHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4gICAgfVxuICAgIENvbW1hbmQucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmFjdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5yZWdleC50ZXN0KHRoaXMuc3RhdGVtZW50KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGFjdGlvbih0aGlzLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwYXNzZWQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuYWN0aW9uLnBlcmZvcm0ocGFzc2VkKTtcbiAgICAgICAgcmVzdWx0LnJlc3VsdCArPSB0aGlzLnBlcmZvcm1EZXBlbmRlbnRzKHJlc3VsdC5wYXNzZWQpO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5yZXBsYWNlcnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmVwbGFjZXIgPSBfYVtfaV07XG4gICAgICAgICAgICByZXN1bHQucmVzdWx0ID0gcmVwbGFjZXIucmVwbGFjZShyZXN1bHQucmVzdWx0LCB0aGlzLnNjb3BlLnZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm1TY29wZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJldCA9ICcnLCBwcmV2UGFzc2VkID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnNjb3BlLmNvbW1hbmRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gY29tbWFuZC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuICAgICAgICAgICAgcHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG4gICAgICAgICAgICByZXQgKz0gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucGVyZm9ybURlcGVuZGVudHMgPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICB2YXIgcmV0ID0gJyc7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmRlcGVuZGVudHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVwZW5kZW50ID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGRlcGVuZGVudC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuICAgICAgICAgICAgcHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG4gICAgICAgICAgICByZXQgKz0gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUudGVybWluYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNjb3BlLmNvbW1hbmRzLnNvbWUoZnVuY3Rpb24gKGNvbW1hbmQpIHsgcmV0dXJuIGNvbW1hbmQuYWN0aW9uLnRlcm1pbmF0b3I7IH0pXG4gICAgICAgICAgICA/IHRoaXMuc2NvcGUuY29tbWFuZHMuZmlsdGVyKGZ1bmN0aW9uIChjb21tYW5kKSB7IHJldHVybiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yOyB9KVsxXS5wZXJmb3JtKGZhbHNlKS5yZXN1bHRcbiAgICAgICAgICAgIDogJyc7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5kZXBlbmRlbnQgPSBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIHdpbmRvd1snYWN0aW9uJ10gPSB0aGlzLmFjdGlvbi5jb25zdHJ1Y3RvclsnZGVwZW5kZW50cyddO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5hY3Rpb24uY29uc3RydWN0b3JbJ2RlcGVuZGVudHMnXTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBkZXBlbmRlbnQgPSBfYVtfaV07XG4gICAgICAgICAgICBpZiAoYWN0aW9uIGluc3RhbmNlb2YgZGVwZW5kZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIENvbW1hbmQucmVnZXggPSAve3slKC4qPyklfX0oLio/KSg/PSg/Ont7JXwkKSkvZztcbiAgICByZXR1cm4gQ29tbWFuZDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBDb21tYW5kO1xuIiwidmFyIENvbW1hbmRTY29wZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZFNjb3BlKCkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHt9O1xuICAgICAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuZGVwZW5kYW50cyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gQ29tbWFuZFNjb3BlO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvbW1hbmRTY29wZTtcbiIsInZhciBJc05vdE51bGxfMSA9IHJlcXVpcmUoJy4vY29uZGl0aW9ucy9Jc05vdE51bGwnKTtcbmV4cG9ydHMuSXNOb3ROdWxsID0gSXNOb3ROdWxsXzEuZGVmYXVsdDtcbiIsInZhciBFcnJvcnMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVycm9ycygpIHtcbiAgICB9XG4gICAgRXJyb3JzLkluY29ycmVjdFN0YXRlbWVudCA9IGZ1bmN0aW9uIChhY3Rpb24sIHN0YXRlbWVudCkge1xuICAgICAgICB2YXIgYWN0aW9ucyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4LmRlcGVuZGVudHMuc29tZShmdW5jdGlvbiAoeSkgeyByZXR1cm4gYWN0aW9uIGluc3RhbmNlb2YgeTsgfSk7IH0pLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geC5uYW1lOyB9KS5qb2luKCcsICcpO1xuICAgICAgICB2YXIgZXJyb3IgPSBcIkluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXFxcIlwiICsgc3RhdGVtZW50ICsgXCJcXFwiLiBcIiArIGFjdGlvbi5jb25zdHJ1Y3RvclsnbmFtZSddICsgXCIgbXVzdCBmb2xsb3cgXCIgKyBhY3Rpb25zO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgIH07XG4gICAgcmV0dXJuIEVycm9ycztcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBFcnJvcnM7XG4iLCJBcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xufTtcbiIsIlxuIiwidmFyIFBhcnNlcl8xID0gcmVxdWlyZSgnLi9QYXJzZXInKTtcbmZ1bmN0aW9uIHBhcnNlKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXJfMS5kZWZhdWx0KHNxbCwgdmFyaWFibGVzKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlKCk7XG59XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRXh0ZW5zaW9ucy50c1wiIC8+XG52YXIgQ29tbWFuZF8xID0gcmVxdWlyZSgnLi9Db21tYW5kJyk7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xufTtcbnZhciBQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnNlcihzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgUGFyc2VyLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHZhciBtYXRjaCwgY29tbWFuZHMgPSBbXSwgc3RhY2sgPSBbXTtcbiAgICAgICAgQ29tbWFuZF8xLmRlZmF1bHQucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGZvdW5kID0gbmV3IENvbW1hbmRfMS5kZWZhdWx0KG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgdmFyaWFibGVzKTtcbiAgICAgICAgICAgIGlmIChzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnQoZm91bmQuYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGZvdW5kLmFjdGlvbi5zdXBwb3J0ZXIgPSBzdGFjay5sYXN0KCk7XG4gICAgICAgICAgICAgICAgc3RhY2subGFzdCgpLmRlcGVuZGVudHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdGFjay5sZW5ndGggPiAwICYmICFzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpIHtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgICAgICBzdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmICh0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNxbDtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuY29tbWFuZHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IF9hW19pXTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0gMSk7XG4gICAgICAgICAgICBxdWVyeSArPSBjb21tYW5kLnBlcmZvcm0oZmFsc2UpLnJlc3VsdDtcbiAgICAgICAgICAgIGluZGV4ICs9IGNvbW1hbmQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeTsgLy9UT0RPXG4gICAgfTtcbiAgICByZXR1cm4gUGFyc2VyO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFBhcnNlcjtcbiIsInZhciBWYXJpYWJsZVJlcGxhY2VyXzEgPSByZXF1aXJlKCcuL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyJyk7XG5leHBvcnRzLlZhcmlhYmxlUmVwbGFjZXIgPSBWYXJpYWJsZVJlcGxhY2VyXzEuZGVmYXVsdDtcbiIsInZhciBNYWluXzEgPSByZXF1aXJlKCcuL01haW4nKTtcbndpbmRvd1snU1FpZ2dMJ10gPSB3aW5kb3dbJ1NRaWdnTCddIHx8IHt9O1xud2luZG93WydTUWlnZ0wnXS5wYXJzZSA9IE1haW5fMS5wYXJzZTtcbndpbmRvd1snU1FpZ2dMJ10udmVyc2lvbiA9ICcwLjEuMCc7XG5leHBvcnRzLmRlZmF1bHQgPSBNYWluXzEucGFyc2U7XG4iLCJ2YXIgRXJyb3JzXzEgPSByZXF1aXJlKCcuLi9FcnJvcnMnKTtcbnZhciBFbHNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbHNlKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gZmFsc2U7XG4gICAgfVxuICAgIEVsc2UucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVyKVxuICAgICAgICAgICAgcmV0dXJuIEVycm9yc18xLmRlZmF1bHQuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9O1xuICAgIEVsc2UucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICBpZiAocHJldlBhc3NlZCA9PT0gdm9pZCAwKSB7IHByZXZQYXNzZWQgPSBmYWxzZTsgfVxuICAgICAgICByZXR1cm4gIXByZXZQYXNzZWQgPyB7IHJlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlIH0gOiB7IHJlc3VsdDogJycsIHBhc3NlZDogZmFsc2UgfTtcbiAgICB9O1xuICAgIEVsc2UucmVnZXggPSAvXlxccyplbHNlXFxiLztcbiAgICBFbHNlLmRlcGVuZGVudHMgPSBbXTtcbiAgICByZXR1cm4gRWxzZTtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBFbHNlO1xuIiwidmFyIEVycm9yc18xID0gcmVxdWlyZSgnLi4vRXJyb3JzJyk7XG52YXIgRW5kSWYgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVuZElmKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gdHJ1ZTtcbiAgICB9XG4gICAgRW5kSWYucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVyKVxuICAgICAgICAgICAgcmV0dXJuIEVycm9yc18xLmRlZmF1bHQuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9O1xuICAgIEVuZElmLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0OiB0aGlzLmlubmVyLCBwYXNzZWQ6IHRydWUgfTtcbiAgICB9O1xuICAgIEVuZElmLnJlZ2V4ID0gL15cXHMqZW5kaWZcXGIvO1xuICAgIEVuZElmLmRlcGVuZGVudHMgPSBbXTtcbiAgICByZXR1cm4gRW5kSWY7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRW5kSWY7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbnZhciBBY3Rpb25zXzEgPSByZXF1aXJlKCcuLi9BY3Rpb25zJyk7XG52YXIgQ29uZGl0aW9uc18xID0gcmVxdWlyZSgnLi4vQ29uZGl0aW9ucycpO1xuLyoqXG4gKiBUaGUgSWYgYWN0aW9uXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gUGFyZW50IGNvbW1hbmQgb2YgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgXHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyIFx0XHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBQYXJlbnQgY29tbWFuZCBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbnZhciBJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSB0aGlzLnBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJ5IGFuZCBsb2NhdGUgYSBtYXRjaGluZyBjb25kaXRpb24gZnJvbSB0aGUgYXZhaWxhYmxlIGNvbmRpdGlvbnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgcmV0dXJuIG51bGwuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50XHRcdC0gU3RhdGVtZW50IHRvIGNoZWNrIGNvbmRpdGlvbnMgYWdhaW5zdFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHQtIExpc3Qgb2YgdmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7SUNvbmRpdGlvbiB8IG51bGx9XHRcdC0gQ29uZGl0aW9uIHRoYXQgbWF0Y2hlcyB3aXRoaW4gdGhlIHN0YXRlbWVudFxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wYXJzZUNvbmRpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gSWYuY29uZGl0aW9uczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb25kaXRpb24gPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goY29uZGl0aW9uLnJlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY29uZGl0aW9uKG1hdGNoWzFdLCB2YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgSWYucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG4gICAgICogQHJldHVybnMge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKVxuICAgICAgICAgICAgPyB7IHJlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyByZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICBJZi5yZWdleCA9IC9eXFxzKmlmXFxiLztcbiAgICBJZi5jb25kaXRpb25zID0gW0NvbmRpdGlvbnNfMS5Jc05vdE51bGxdO1xuICAgIElmLmRlcGVuZGVudHMgPSBbQWN0aW9uc18xLkVsc2UsIEFjdGlvbnNfMS5FbmRJZl07XG4gICAgcmV0dXJuIElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElmO1xuIiwidmFyIElzTm90TnVsbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSXNOb3ROdWxsKHZhcmlhYmxlLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgSXNOb3ROdWxsLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcbiAgICB9O1xuICAgIElzTm90TnVsbC5yZWdleCA9IC8oXFx3KilcXHMraXNcXHMrbm90XFxzK251bGxcXHMqLztcbiAgICByZXR1cm4gSXNOb3ROdWxsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElzTm90TnVsbDtcbiIsInZhciBWYXJpYWJsZVJlcGxhY2VyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBWYXJpYWJsZVJlcGxhY2VyKCkge1xuICAgIH1cbiAgICBWYXJpYWJsZVJlcGxhY2VyLnJlcGxhY2UgPSBmdW5jdGlvbiAodGV4dCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UodGhpcy5yZWdleCwgZnVuY3Rpb24gKG1hdGNoLCAkMSwgJDIpIHsgcmV0dXJuICQxICsgdmFyaWFibGVzWyQyXTsgfSk7XG4gICAgfTtcbiAgICBWYXJpYWJsZVJlcGxhY2VyLnJlZ2V4ID0gLyhbXntdfF4pe3soPyF7KVxccyooXFx3KilcXHMqfX0oPyF9KS9nO1xuICAgIHJldHVybiBWYXJpYWJsZVJlcGxhY2VyO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFZhcmlhYmxlUmVwbGFjZXI7XG4iXX0=
