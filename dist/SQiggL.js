(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var If_1 = require('./actions/If');
exports.If = If_1.default;
var Else_1 = require('./actions/Else');
exports.Else = Else_1.default;
var EndIf_1 = require('./actions/EndIf');
exports.EndIf = EndIf_1.default;

},{"./actions/Else":12,"./actions/EndIf":13,"./actions/If":15}],2:[function(require,module,exports){
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

},{"./Actions":1,"./CommandScope":3,"./Replacers":10}],3:[function(require,module,exports){
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

},{"./conditions/IsNotNull":17}],5:[function(require,module,exports){
Array.prototype.last = function () {
    return this[this.length - 1];
};

},{}],6:[function(require,module,exports){


},{}],7:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],8:[function(require,module,exports){
var Parser_1 = require('./Parser');
function parse(sql, variables) {
    var parser = new Parser_1.default(sql, variables);
    return parser.parse();
}
exports.parse = parse;

},{"./Parser":9}],9:[function(require,module,exports){
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

},{"./Command":2}],10:[function(require,module,exports){
var VariableReplacer_1 = require('./replacers/VariableReplacer');
exports.VariableReplacer = VariableReplacer_1.default;

},{"./replacers/VariableReplacer":19}],11:[function(require,module,exports){
var Main_1 = require('./Main');
window['SQiggL'] = window['SQiggL'] || {};
window['SQiggL'].parse = Main_1.parse;
window['SQiggL'].version = '0.1.0';
exports.default = Main_1.parse;

},{"./Main":8}],12:[function(require,module,exports){
var Else = (function () {
    function Else(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = false;
        this.dependents = [];
    }
    Else.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return !prevPassed ? { result: this.inner + this.command.performScope(), passed: true } : { result: '', passed: false };
    };
    Else.regex = /^\s*else\b/;
    return Else;
})();
exports.default = Else;

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],15:[function(require,module,exports){
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

},{"../Actions":1,"../Conditions":4}],16:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],19:[function(require,module,exports){
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

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0V4dGVuc2lvbnMuanMiLCJzcmMvSVBlcmZvcm1SZXN1bHQuanMiLCJzcmMvTWFpbi5qcyIsInNyYy9QYXJzZXIuanMiLCJzcmMvUmVwbGFjZXJzLmpzIiwic3JjL1NRaWdnTC5qcyIsInNyYy9hY3Rpb25zL0Vsc2UuanMiLCJzcmMvYWN0aW9ucy9FbmRJZi5qcyIsInNyYy9hY3Rpb25zL0lmLmpzIiwic3JjL2NvbmRpdGlvbnMvSXNOb3ROdWxsLmpzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSWZfMSA9IHJlcXVpcmUoJy4vYWN0aW9ucy9JZicpO1xuZXhwb3J0cy5JZiA9IElmXzEuZGVmYXVsdDtcbnZhciBFbHNlXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvRWxzZScpO1xuZXhwb3J0cy5FbHNlID0gRWxzZV8xLmRlZmF1bHQ7XG52YXIgRW5kSWZfMSA9IHJlcXVpcmUoJy4vYWN0aW9ucy9FbmRJZicpO1xuZXhwb3J0cy5FbmRJZiA9IEVuZElmXzEuZGVmYXVsdDtcbiIsInZhciBBY3Rpb25zXzEgPSByZXF1aXJlKCcuL0FjdGlvbnMnKTtcbnZhciBDb21tYW5kU2NvcGVfMSA9IHJlcXVpcmUoJy4vQ29tbWFuZFNjb3BlJyk7XG52YXIgUmVwbGFjZXJzXzEgPSByZXF1aXJlKCcuL1JlcGxhY2VycycpO1xudmFyIENvbW1hbmQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENvbW1hbmQoaW5kZXgsIGxlbmd0aCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IFtBY3Rpb25zXzEuSWYsIEFjdGlvbnNfMS5FbHNlLCBBY3Rpb25zXzEuRW5kSWZdO1xuICAgICAgICB0aGlzLnJlcGxhY2VycyA9IFtSZXBsYWNlcnNfMS5WYXJpYWJsZVJlcGxhY2VyXTtcbiAgICAgICAgdGhpcy5zY29wZSA9IG5ldyBDb21tYW5kU2NvcGVfMS5kZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZGVwZW5kZW50cyA9IFtdO1xuICAgICAgICB0aGlzLnNjb3BlLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5hY3Rpb24gPSB0aGlzLmV4dHJhY3Qoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICB9XG4gICAgQ29tbWFuZC5wcm90b3R5cGUuZXh0cmFjdCA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuYWN0aW9uczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfYVtfaV07XG4gICAgICAgICAgICBpZiAoYWN0aW9uLnJlZ2V4LnRlc3QodGhpcy5zdGF0ZW1lbnQpKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYWN0aW9uKHRoaXMsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHBhc3NlZCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5hY3Rpb24ucGVyZm9ybShwYXNzZWQpO1xuICAgICAgICByZXN1bHQucmVzdWx0ICs9IHRoaXMucGVyZm9ybURlcGVuZGVudHMocmVzdWx0LnBhc3NlZCk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnJlcGxhY2VyczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciByZXBsYWNlciA9IF9hW19pXTtcbiAgICAgICAgICAgIHJlc3VsdC5yZXN1bHQgPSByZXBsYWNlci5yZXBsYWNlKHJlc3VsdC5yZXN1bHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucGVyZm9ybVNjb3BlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmV0ID0gJycsIHByZXZQYXNzZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuc2NvcGUuY29tbWFuZHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBjb21tYW5kLnBlcmZvcm0ocHJldlBhc3NlZCk7XG4gICAgICAgICAgICBwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcbiAgICAgICAgICAgIHJldCArPSByZXN1bHQucmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtRGVwZW5kZW50cyA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIHZhciByZXQgPSAnJztcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuZGVwZW5kZW50czsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBkZXBlbmRlbnQgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZGVwZW5kZW50LnBlcmZvcm0ocHJldlBhc3NlZCk7XG4gICAgICAgICAgICBwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcbiAgICAgICAgICAgIHJldCArPSByZXN1bHQucmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS50ZXJtaW5hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGUuY29tbWFuZHMuc29tZShmdW5jdGlvbiAoY29tbWFuZCkgeyByZXR1cm4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcjsgfSlcbiAgICAgICAgICAgID8gdGhpcy5zY29wZS5jb21tYW5kcy5maWx0ZXIoZnVuY3Rpb24gKGNvbW1hbmQpIHsgcmV0dXJuIGNvbW1hbmQuYWN0aW9uLnRlcm1pbmF0b3I7IH0pWzFdLnBlcmZvcm0oZmFsc2UpLnJlc3VsdFxuICAgICAgICAgICAgOiAnJztcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLmRlcGVuZGVudCA9IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuYWN0aW9uLmRlcGVuZGVudHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVwZW5kZW50ID0gX2FbX2ldO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiBpbnN0YW5jZW9mIGRlcGVuZGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBDb21tYW5kLnJlZ2V4ID0gL3t7JSguKj8pJX19KC4qPykoPz0oPzp7eyV8JCkpL2c7XG4gICAgcmV0dXJuIENvbW1hbmQ7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29tbWFuZDtcbiIsInZhciBDb21tYW5kU2NvcGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENvbW1hbmRTY29wZSgpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB7fTtcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IFtdO1xuICAgICAgICB0aGlzLmRlcGVuZGFudHMgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIENvbW1hbmRTY29wZTtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBDb21tYW5kU2NvcGU7XG4iLCJ2YXIgSXNOb3ROdWxsXzEgPSByZXF1aXJlKCcuL2NvbmRpdGlvbnMvSXNOb3ROdWxsJyk7XG5leHBvcnRzLklzTm90TnVsbCA9IElzTm90TnVsbF8xLmRlZmF1bHQ7XG4iLCJBcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xufTtcbiIsIlxuIiwidmFyIFBhcnNlcl8xID0gcmVxdWlyZSgnLi9QYXJzZXInKTtcbmZ1bmN0aW9uIHBhcnNlKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXJfMS5kZWZhdWx0KHNxbCwgdmFyaWFibGVzKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlKCk7XG59XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRXh0ZW5zaW9ucy50c1wiIC8+XG52YXIgQ29tbWFuZF8xID0gcmVxdWlyZSgnLi9Db21tYW5kJyk7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xufTtcbnZhciBQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnNlcihzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgUGFyc2VyLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHZhciBtYXRjaCwgY29tbWFuZHMgPSBbXSwgc3RhY2sgPSBbXTtcbiAgICAgICAgQ29tbWFuZF8xLmRlZmF1bHQucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGZvdW5kID0gbmV3IENvbW1hbmRfMS5kZWZhdWx0KG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgdmFyaWFibGVzKTtcbiAgICAgICAgICAgIGlmIChzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnQoZm91bmQuYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiAhc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSB7XG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChmb3VuZCk7XG4gICAgICAgICAgICAgICAgc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKVxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgICAgICBjb21tYW5kcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgcXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLSAxKTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuICAgICAgICAgICAgaW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXJ5OyAvL1RPRE9cbiAgICB9O1xuICAgIHJldHVybiBQYXJzZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gUGFyc2VyO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXJfMSA9IHJlcXVpcmUoJy4vcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXInKTtcbmV4cG9ydHMuVmFyaWFibGVSZXBsYWNlciA9IFZhcmlhYmxlUmVwbGFjZXJfMS5kZWZhdWx0O1xuIiwidmFyIE1haW5fMSA9IHJlcXVpcmUoJy4vTWFpbicpO1xud2luZG93WydTUWlnZ0wnXSA9IHdpbmRvd1snU1FpZ2dMJ10gfHwge307XG53aW5kb3dbJ1NRaWdnTCddLnBhcnNlID0gTWFpbl8xLnBhcnNlO1xud2luZG93WydTUWlnZ0wnXS52ZXJzaW9uID0gJzAuMS4wJztcbmV4cG9ydHMuZGVmYXVsdCA9IE1haW5fMS5wYXJzZTtcbiIsInZhciBFbHNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbHNlKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVwZW5kZW50cyA9IFtdO1xuICAgIH1cbiAgICBFbHNlLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuICFwcmV2UGFzc2VkID8geyByZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZSB9IDogeyByZXN1bHQ6ICcnLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICBFbHNlLnJlZ2V4ID0gL15cXHMqZWxzZVxcYi87XG4gICAgcmV0dXJuIEVsc2U7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRWxzZTtcbiIsInZhciBFbmRJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5kSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICB9XG4gICAgRW5kSWYucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICBpZiAocHJldlBhc3NlZCA9PT0gdm9pZCAwKSB7IHByZXZQYXNzZWQgPSBmYWxzZTsgfVxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHRoaXMuaW5uZXIsIHBhc3NlZDogdHJ1ZSB9O1xuICAgIH07XG4gICAgRW5kSWYucmVnZXggPSAvXlxccyplbmRpZlxcYi87XG4gICAgcmV0dXJuIEVuZElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVuZElmO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi4vQWN0aW9ucycpO1xudmFyIENvbmRpdGlvbnNfMSA9IHJlcXVpcmUoJy4uL0NvbmRpdGlvbnMnKTtcbi8qKlxuICogVGhlIElmIGFjdGlvblxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIFBhcmVudCBjb21tYW5kIG9mIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gUGFyZW50IGNvbW1hbmQgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG52YXIgSWYgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIElmKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29uZGl0aW9ucyA9IFtDb25kaXRpb25zXzEuSXNOb3ROdWxsXTtcbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzID0gW0FjdGlvbnNfMS5FbHNlLCBBY3Rpb25zXzEuRW5kSWZdO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IHRoaXMucGFyc2VDb25kaXRpb24oc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcnkgYW5kIGxvY2F0ZSBhIG1hdGNoaW5nIGNvbmRpdGlvbiBmcm9tIHRoZSBhdmFpbGFibGUgY29uZGl0aW9ucyBmb3IgdGhpcyBhY3Rpb24uIElmIG5vIG1hdGNoIGlzIGZvdW5kLCByZXR1cm4gbnVsbC5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0LSBTdGF0ZW1lbnQgdG8gY2hlY2sgY29uZGl0aW9ucyBhZ2FpbnN0XG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdC0gTGlzdCBvZiB2YXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtJQ29uZGl0aW9uIHwgbnVsbH1cdFx0LSBDb25kaXRpb24gdGhhdCBtYXRjaGVzIHdpdGhpbiB0aGUgc3RhdGVtZW50XG4gICAgICovXG4gICAgSWYucHJvdG90eXBlLnBhcnNlQ29uZGl0aW9uID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgdmFyaWFibGVzKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmNvbmRpdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29uZGl0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKGNvbmRpdGlvbi5yZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNvbmRpdGlvbihtYXRjaFsxXSwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG4gICAgICogQHJldHVybnMge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKVxuICAgICAgICAgICAgPyB7IHJlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyByZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICBJZi5yZWdleCA9IC9eXFxzKmlmXFxiLztcbiAgICByZXR1cm4gSWY7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSWY7XG4iLCJ2YXIgSXNOb3ROdWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJc05vdE51bGwodmFyaWFibGUsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdmFyaWFibGU7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIH1cbiAgICBJc05vdE51bGwucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSAhPSBudWxsO1xuICAgIH07XG4gICAgSXNOb3ROdWxsLnJlZ2V4ID0gLyhcXHcqKVxccytpc1xccytub3RcXHMrbnVsbFxccyovO1xuICAgIHJldHVybiBJc05vdE51bGw7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSXNOb3ROdWxsO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhcmlhYmxlUmVwbGFjZXIoKSB7XG4gICAgfVxuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVwbGFjZSA9IGZ1bmN0aW9uICh0ZXh0LCB2YXJpYWJsZXMpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gsICQxLCAkMikgeyByZXR1cm4gJDEgKyB2YXJpYWJsZXNbJDJdOyB9KTtcbiAgICB9O1xuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVnZXggPSAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2c7XG4gICAgcmV0dXJuIFZhcmlhYmxlUmVwbGFjZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gVmFyaWFibGVSZXBsYWNlcjtcbiJdfQ==
