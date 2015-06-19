(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var If_1 = require('./actions/If');
exports.If = If_1.default;
var Else_1 = require('./actions/Else');
exports.Else = Else_1.default;
var EndIf_1 = require('./actions/EndIf');
exports.EndIf = EndIf_1.default;

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
        for (var _i = 0, _a = this.action.dependents; _i < _a.length; _i++) {
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
        var actions = action.command.actions.filter(function (x) { return x.dependents.some(function (y) { return action instanceof y; }); }).map(function (x) { return x.constructor['name']; }).join(', ');
        console.error("Incorrect statement found at \"" + statement + "\". " + action.constructor['name'] + " must follow " + actions);
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
        this.dependents = [];
        if (!command)
            Errors_1.default.IncorrectStatement(this, statement);
    }
    Else.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return !prevPassed ? { result: this.inner + this.command.performScope(), passed: true } : { result: '', passed: false };
    };
    Else.regex = /^\s*else\b/;
    return Else;
})();
exports.default = Else;

},{"../Errors":5}],14:[function(require,module,exports){
var EndIf = (function () {
    function EndIf(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = true;
        this.dependents = [];
    }
    EndIf.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return { result: this.inner, passed: true };
    };
    EndIf.regex = /^\s*endif\b/;
    return EndIf;
})();
exports.default = EndIf;

},{}],15:[function(require,module,exports){
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
        this.conditions = [Conditions_1.IsNotNull];
        this.dependents = [Actions_1.Else, Actions_1.EndIf];
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
        for (var _i = 0, _a = this.conditions; _i < _a.length; _i++) {
            var condition = _a[_i];
            var match = statement.match(condition.regex);
            if (match.length > 0)
                return new condition(match[1], variables);
        }
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0Vycm9ycy5qcyIsInNyYy9FeHRlbnNpb25zLmpzIiwic3JjL0lQZXJmb3JtUmVzdWx0LmpzIiwic3JjL01haW4uanMiLCJzcmMvUGFyc2VyLmpzIiwic3JjL1JlcGxhY2Vycy5qcyIsInNyYy9TUWlnZ0wuanMiLCJzcmMvYWN0aW9ucy9FbHNlLmpzIiwic3JjL2FjdGlvbnMvRW5kSWYuanMiLCJzcmMvYWN0aW9ucy9JZi5qcyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC5qcyIsInNyYy9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvSWYnKTtcbmV4cG9ydHMuSWYgPSBJZl8xLmRlZmF1bHQ7XG52YXIgRWxzZV8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0Vsc2UnKTtcbmV4cG9ydHMuRWxzZSA9IEVsc2VfMS5kZWZhdWx0O1xudmFyIEVuZElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvRW5kSWYnKTtcbmV4cG9ydHMuRW5kSWYgPSBFbmRJZl8xLmRlZmF1bHQ7XG4iLCJ2YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi9BY3Rpb25zJyk7XG52YXIgQ29tbWFuZFNjb3BlXzEgPSByZXF1aXJlKCcuL0NvbW1hbmRTY29wZScpO1xudmFyIFJlcGxhY2Vyc18xID0gcmVxdWlyZSgnLi9SZXBsYWNlcnMnKTtcbnZhciBDb21tYW5kID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kKGluZGV4LCBsZW5ndGgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBbQWN0aW9uc18xLklmLCBBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICAgICAgdGhpcy5yZXBsYWNlcnMgPSBbUmVwbGFjZXJzXzEuVmFyaWFibGVSZXBsYWNlcl07XG4gICAgICAgIHRoaXMuc2NvcGUgPSBuZXcgQ29tbWFuZFNjb3BlXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuYWN0aW9uID0gdGhpcy5leHRyYWN0KHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4gICAgfVxuICAgIENvbW1hbmQucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmFjdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5yZWdleC50ZXN0KHRoaXMuc3RhdGVtZW50KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGFjdGlvbih0aGlzLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwYXNzZWQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuYWN0aW9uLnBlcmZvcm0ocGFzc2VkKTtcbiAgICAgICAgcmVzdWx0LnJlc3VsdCArPSB0aGlzLnBlcmZvcm1EZXBlbmRlbnRzKHJlc3VsdC5wYXNzZWQpO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5yZXBsYWNlcnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmVwbGFjZXIgPSBfYVtfaV07XG4gICAgICAgICAgICByZXN1bHQucmVzdWx0ID0gcmVwbGFjZXIucmVwbGFjZShyZXN1bHQucmVzdWx0LCB0aGlzLnNjb3BlLnZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm1TY29wZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJldCA9ICcnLCBwcmV2UGFzc2VkID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnNjb3BlLmNvbW1hbmRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gY29tbWFuZC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuICAgICAgICAgICAgcHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG4gICAgICAgICAgICByZXQgKz0gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucGVyZm9ybURlcGVuZGVudHMgPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICB2YXIgcmV0ID0gJyc7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmRlcGVuZGVudHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVwZW5kZW50ID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGRlcGVuZGVudC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuICAgICAgICAgICAgcHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG4gICAgICAgICAgICByZXQgKz0gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUudGVybWluYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNjb3BlLmNvbW1hbmRzLnNvbWUoZnVuY3Rpb24gKGNvbW1hbmQpIHsgcmV0dXJuIGNvbW1hbmQuYWN0aW9uLnRlcm1pbmF0b3I7IH0pXG4gICAgICAgICAgICA/IHRoaXMuc2NvcGUuY29tbWFuZHMuZmlsdGVyKGZ1bmN0aW9uIChjb21tYW5kKSB7IHJldHVybiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yOyB9KVsxXS5wZXJmb3JtKGZhbHNlKS5yZXN1bHRcbiAgICAgICAgICAgIDogJyc7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5kZXBlbmRlbnQgPSBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmFjdGlvbi5kZXBlbmRlbnRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGRlcGVuZGVudCA9IF9hW19pXTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gaW5zdGFuY2VvZiBkZXBlbmRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgQ29tbWFuZC5yZWdleCA9IC97eyUoLio/KSV9fSguKj8pKD89KD86e3slfCQpKS9nO1xuICAgIHJldHVybiBDb21tYW5kO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvbW1hbmQ7XG4iLCJ2YXIgQ29tbWFuZFNjb3BlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kU2NvcGUoKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0ge307XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5kZXBlbmRhbnRzID0gW107XG4gICAgfVxuICAgIHJldHVybiBDb21tYW5kU2NvcGU7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29tbWFuZFNjb3BlO1xuIiwidmFyIElzTm90TnVsbF8xID0gcmVxdWlyZSgnLi9jb25kaXRpb25zL0lzTm90TnVsbCcpO1xuZXhwb3J0cy5Jc05vdE51bGwgPSBJc05vdE51bGxfMS5kZWZhdWx0O1xuIiwidmFyIEVycm9ycyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXJyb3JzKCkge1xuICAgIH1cbiAgICBFcnJvcnMuSW5jb3JyZWN0U3RhdGVtZW50ID0gZnVuY3Rpb24gKGFjdGlvbiwgc3RhdGVtZW50KSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0gYWN0aW9uLmNvbW1hbmQuYWN0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHguZGVwZW5kZW50cy5zb21lKGZ1bmN0aW9uICh5KSB7IHJldHVybiBhY3Rpb24gaW5zdGFuY2VvZiB5OyB9KTsgfSkubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4LmNvbnN0cnVjdG9yWyduYW1lJ107IH0pLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJJbmNvcnJlY3Qgc3RhdGVtZW50IGZvdW5kIGF0IFxcXCJcIiArIHN0YXRlbWVudCArIFwiXFxcIi4gXCIgKyBhY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXSArIFwiIG11c3QgZm9sbG93IFwiICsgYWN0aW9ucyk7XG4gICAgfTtcbiAgICByZXR1cm4gRXJyb3JzO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVycm9ycztcbiIsIkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xuIiwiXG4iLCJ2YXIgUGFyc2VyXzEgPSByZXF1aXJlKCcuL1BhcnNlcicpO1xuZnVuY3Rpb24gcGFyc2Uoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcl8xLmRlZmF1bHQoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJFeHRlbnNpb25zLnRzXCIgLz5cbnZhciBDb21tYW5kXzEgPSByZXF1aXJlKCcuL0NvbW1hbmQnKTtcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xudmFyIFBhcnNlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFyc2VyKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuc3FsID0gc3FsO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIH1cbiAgICBQYXJzZXIucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdmFyIG1hdGNoLCBjb21tYW5kcyA9IFtdLCBzdGFjayA9IFtdO1xuICAgICAgICBDb21tYW5kXzEuZGVmYXVsdC5yZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gQ29tbWFuZF8xLmRlZmF1bHQucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgZm91bmQgPSBuZXcgQ29tbWFuZF8xLmRlZmF1bHQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmRlcGVuZGVudChmb3VuZC5hY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgc3RhY2subGFzdCgpLmRlcGVuZGVudHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdGFjay5sZW5ndGggPiAwICYmICFzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpIHtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgICAgICBzdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmICh0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNxbDtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuY29tbWFuZHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IF9hW19pXTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0gMSk7XG4gICAgICAgICAgICBxdWVyeSArPSBjb21tYW5kLnBlcmZvcm0oZmFsc2UpLnJlc3VsdDtcbiAgICAgICAgICAgIGluZGV4ICs9IGNvbW1hbmQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeTsgLy9UT0RPXG4gICAgfTtcbiAgICByZXR1cm4gUGFyc2VyO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFBhcnNlcjtcbiIsInZhciBWYXJpYWJsZVJlcGxhY2VyXzEgPSByZXF1aXJlKCcuL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyJyk7XG5leHBvcnRzLlZhcmlhYmxlUmVwbGFjZXIgPSBWYXJpYWJsZVJlcGxhY2VyXzEuZGVmYXVsdDtcbiIsInZhciBNYWluXzEgPSByZXF1aXJlKCcuL01haW4nKTtcbndpbmRvd1snU1FpZ2dMJ10gPSB3aW5kb3dbJ1NRaWdnTCddIHx8IHt9O1xud2luZG93WydTUWlnZ0wnXS5wYXJzZSA9IE1haW5fMS5wYXJzZTtcbndpbmRvd1snU1FpZ2dMJ10udmVyc2lvbiA9ICcwLjEuMCc7XG5leHBvcnRzLmRlZmF1bHQgPSBNYWluXzEucGFyc2U7XG4iLCJ2YXIgRXJyb3JzXzEgPSByZXF1aXJlKCcuLi9FcnJvcnMnKTtcbnZhciBFbHNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbHNlKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVwZW5kZW50cyA9IFtdO1xuICAgICAgICBpZiAoIWNvbW1hbmQpXG4gICAgICAgICAgICBFcnJvcnNfMS5kZWZhdWx0LkluY29ycmVjdFN0YXRlbWVudCh0aGlzLCBzdGF0ZW1lbnQpO1xuICAgIH1cbiAgICBFbHNlLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuICFwcmV2UGFzc2VkID8geyByZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZSB9IDogeyByZXN1bHQ6ICcnLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICBFbHNlLnJlZ2V4ID0gL15cXHMqZWxzZVxcYi87XG4gICAgcmV0dXJuIEVsc2U7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRWxzZTtcbiIsInZhciBFbmRJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5kSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICB9XG4gICAgRW5kSWYucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICBpZiAocHJldlBhc3NlZCA9PT0gdm9pZCAwKSB7IHByZXZQYXNzZWQgPSBmYWxzZTsgfVxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHRoaXMuaW5uZXIsIHBhc3NlZDogdHJ1ZSB9O1xuICAgIH07XG4gICAgRW5kSWYucmVnZXggPSAvXlxccyplbmRpZlxcYi87XG4gICAgcmV0dXJuIEVuZElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVuZElmO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi4vQWN0aW9ucycpO1xudmFyIENvbmRpdGlvbnNfMSA9IHJlcXVpcmUoJy4uL0NvbmRpdGlvbnMnKTtcbi8qKlxuICogVGhlIElmIGFjdGlvblxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIFBhcmVudCBjb21tYW5kIG9mIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gUGFyZW50IGNvbW1hbmQgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG52YXIgSWYgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIElmKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29uZGl0aW9ucyA9IFtDb25kaXRpb25zXzEuSXNOb3ROdWxsXTtcbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzID0gW0FjdGlvbnNfMS5FbHNlLCBBY3Rpb25zXzEuRW5kSWZdO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IHRoaXMucGFyc2VDb25kaXRpb24oc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcnkgYW5kIGxvY2F0ZSBhIG1hdGNoaW5nIGNvbmRpdGlvbiBmcm9tIHRoZSBhdmFpbGFibGUgY29uZGl0aW9ucyBmb3IgdGhpcyBhY3Rpb24uIElmIG5vIG1hdGNoIGlzIGZvdW5kLCByZXR1cm4gbnVsbC5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0LSBTdGF0ZW1lbnQgdG8gY2hlY2sgY29uZGl0aW9ucyBhZ2FpbnN0XG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdC0gTGlzdCBvZiB2YXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtJQ29uZGl0aW9uIHwgbnVsbH1cdFx0LSBDb25kaXRpb24gdGhhdCBtYXRjaGVzIHdpdGhpbiB0aGUgc3RhdGVtZW50XG4gICAgICovXG4gICAgSWYucHJvdG90eXBlLnBhcnNlQ29uZGl0aW9uID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgdmFyaWFibGVzKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmNvbmRpdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29uZGl0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKGNvbmRpdGlvbi5yZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNvbmRpdGlvbihtYXRjaFsxXSwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG4gICAgICogQHJldHVybnMge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKVxuICAgICAgICAgICAgPyB7IHJlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyByZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICBJZi5yZWdleCA9IC9eXFxzKmlmXFxiLztcbiAgICByZXR1cm4gSWY7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSWY7XG4iLCJ2YXIgSXNOb3ROdWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJc05vdE51bGwodmFyaWFibGUsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdmFyaWFibGU7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIH1cbiAgICBJc05vdE51bGwucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSAhPSBudWxsO1xuICAgIH07XG4gICAgSXNOb3ROdWxsLnJlZ2V4ID0gLyhcXHcqKVxccytpc1xccytub3RcXHMrbnVsbFxccyovO1xuICAgIHJldHVybiBJc05vdE51bGw7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSXNOb3ROdWxsO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhcmlhYmxlUmVwbGFjZXIoKSB7XG4gICAgfVxuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVwbGFjZSA9IGZ1bmN0aW9uICh0ZXh0LCB2YXJpYWJsZXMpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gsICQxLCAkMikgeyByZXR1cm4gJDEgKyB2YXJpYWJsZXNbJDJdOyB9KTtcbiAgICB9O1xuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVnZXggPSAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2c7XG4gICAgcmV0dXJuIFZhcmlhYmxlUmVwbGFjZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gVmFyaWFibGVSZXBsYWNlcjtcbiJdfQ==
