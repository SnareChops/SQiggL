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
    Command.regex = /{{%(.*?)%}}([\s\S]*?)?(?=(?:{{%|$))/igm;
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
/**
 * The Else action
 * @module Else
 * @class
 * @implements {@link IAction}
 * @param {Command} command             - Command that contains this action
 * @param {string} statement            - Statement that this should take action on
 * @param {string} inner                - Text that follows after this action until the next command
 * @param {IVariables} variables        - Variables within the scope of this action
 * @property {Command} command          - Command that contains this action
 * @property {string} statement         - Statement that this should take action on
 * @property {string} inner 			- Text that follows after this action until the next command
 * @property {IVariables} variables		- Variables within the scope of this action
 * @property {boolean} terminator 		- Defines if this action is a terminator
 * @property {IVariable} variable		- Variable that this should take action on depending on the result of the condition
 * @property {ICondition[]} conditions	- Array of conditions that this action supports (if any)
 * @property {ICondition} condition		- Condition that was found as a match for this action
 * @property {IAction[]} dependents		- Array of actions that are dependent on this action's result
 */
var Else = (function () {
    function Else(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = false;
    }
    /**
     * Checks for any known syntax errors regarding this action
     * @memberof Else
     * @method
     * @public
     * @returns {string | null} The caught error if any
     */
    Else.prototype.validate = function () {
        if (!this.supporter)
            return Errors_1.default.IncorrectStatement(this, this.statement);
    };
    /**
     * Perform the action and return the result.
     * @memberof Else
     * @method
     * @public
     * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
     * @returns {IPerformResult} {@link IPerformResult}
     */
    Else.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return !prevPassed ? { result: this.inner + this.command.performScope(), passed: true } : { result: '', passed: false };
    };
    /**
     * @memberof Else
     * @static
     * @property {RegExp} The regex matcher
     */
    Else.regex = /^\s*else\b/i;
    /**
     * @memberof Else
     * @static
     * @property {ICondition[]} Array of conditions available to this action
     */
    Else.conditions = [];
    /**
     * @memberof Else
     * @static
     * @property {IAction[]} Array of dependent actions
     */
    Else.dependents = [];
    return Else;
})();
exports.default = Else;

},{"../Errors":5}],14:[function(require,module,exports){
var Errors_1 = require('../Errors');
/**
 * The EndIf action
 * @module EndIf
 * @class
 * @implements IAction {@link IAction}
 * @param {Command} command 			- Command that contains this action
 * @param {string} statement 			- Statement that this should take action on
 * @param {string} inner 				- Text that follows after this action until the next command
 * @param {IVariables} variables		- Variables within the scope of this action
 * @property {Command} command 			- Command that contains this action
 * @property {string} statement			- Statement that this should take action on
 * @property {string} inner 			- Text that follows after this action until the next command
 * @property {IVariables} variables		- Variables within the scope of this action
 * @property {boolean} terminator 		- Defines if this action is a terminator
 * @property {IVariable} variable		- Variable that this should take action on depending on the result of the condition
 * @property {ICondition[]} conditions	- Array of conditions that this action supports (if any)
 * @property {ICondition} condition		- Condition that was found as a match for this action
 * @property {IAction[]} dependents		- Array of actions that are dependent on this action's result
 */
var EndIf = (function () {
    function EndIf(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = true;
    }
    /**
     * Checks for any known syntax errors regarding this action
     * @memberof EndIf
     * @method
     * @public
     * @returns {string | null} The caught error if any
     */
    EndIf.prototype.validate = function () {
        if (!this.supporter)
            return Errors_1.default.IncorrectStatement(this, this.statement);
    };
    /**
     * Perform the action and return the result.
     * @memberof EndIf
     * @method
     * @public
     * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
     * @returns {IPerformResult} {@link IPerformResult}
     */
    EndIf.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return { result: this.inner, passed: true };
    };
    /**
     * @memberof EndIf
     * @static
     * @property {RegExp} The regex matcher
     */
    EndIf.regex = /^\s*endif\b/i;
    /**
     * @memberof EndIf
     * @static
     * @property {ICondition[]} Array of conditions available to this action
     */
    EndIf.conditions = [];
    /**
     * @memberof EndIf
     * @static
     * @property {IAction[]} Array of dependent actions
     */
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
 * @module If
 * @class
 * @implements {@link IAction}
 * @param {Command} command 			- Command that contains this action
 * @param {string} statement 			- Statement that this should take action on
 * @param {string} inner 				- Text that follows after this action until the next command
 * @param {IVariables} variables		- Variables within the scope of this action
 * @property {Command} command 			- Command that contains this action
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
     * @memberof If
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
    /**
     * Checks for any known syntax errors regarding this action
     * @memberof If
     * @method
     * @public
     * @returns {string | null} The caught error if any
     */
    If.prototype.validate = function () {
        return null;
    };
    /**
     * Perform the action and return the result.
     * @memberof If
     * @method
     * @public
     * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
     * @returns {IPerformResult} {@link IPerformResult}
     */
    If.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return this.condition.perform()
            ? { result: this.inner + this.command.performScope(), passed: true }
            : { result: this.command.termination(), passed: false };
    };
    /**
     * @memberof If
     * @static
     * @property {RegExp} The regex matcher
     */
    If.regex = /^\s*if\b/i;
    /**
     * @memberof If
     * @static
     * @property {ICondition[]} Array of conditions available to this action
     */
    If.conditions = [Conditions_1.IsNotNull];
    /**
     * @memberof If
     * @static
     * @property {IAction[]} Array of dependent actions
     */
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
    IsNotNull.regex = /(\w*)\s+is\s+not\s+null\s*/i;
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

},{}]},{},[1,13,14,15,16,2,3,4,17,18,5,6,7,8,9,10,11,19,20,12])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0Vycm9ycy5qcyIsInNyYy9FeHRlbnNpb25zLmpzIiwic3JjL0lQZXJmb3JtUmVzdWx0LmpzIiwic3JjL01haW4uanMiLCJzcmMvUGFyc2VyLmpzIiwic3JjL1JlcGxhY2Vycy5qcyIsInNyYy9TUWlnZ0wuanMiLCJzcmMvYWN0aW9ucy9FbHNlLmpzIiwic3JjL2FjdGlvbnMvRW5kSWYuanMiLCJzcmMvYWN0aW9ucy9JZi5qcyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC5qcyIsInNyYy9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTs7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE5vdGU6IFRoZXNlIGFyZSBsb2FkZWQgaW4gb3JkZXIsIG1ha2Ugc3VyZSBhbnkgZGVwZW5kZW50IGFjdGlvbnMgYXJlIGxpc3RlZCBhYm92ZSB0aGUgYWN0aW9uIHRoYXQgcmVxdWlyZXMgdGhlbS5cbnZhciBFbmRJZl8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0VuZElmJyk7XG5leHBvcnRzLkVuZElmID0gRW5kSWZfMS5kZWZhdWx0O1xudmFyIEVsc2VfMSA9IHJlcXVpcmUoJy4vYWN0aW9ucy9FbHNlJyk7XG5leHBvcnRzLkVsc2UgPSBFbHNlXzEuZGVmYXVsdDtcbnZhciBJZl8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0lmJyk7XG5leHBvcnRzLklmID0gSWZfMS5kZWZhdWx0O1xuIiwidmFyIEFjdGlvbnNfMSA9IHJlcXVpcmUoJy4vQWN0aW9ucycpO1xudmFyIENvbW1hbmRTY29wZV8xID0gcmVxdWlyZSgnLi9Db21tYW5kU2NvcGUnKTtcbnZhciBSZXBsYWNlcnNfMSA9IHJlcXVpcmUoJy4vUmVwbGFjZXJzJyk7XG52YXIgQ29tbWFuZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZChpbmRleCwgbGVuZ3RoLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy5hY3Rpb25zID0gW0FjdGlvbnNfMS5JZiwgQWN0aW9uc18xLkVsc2UsIEFjdGlvbnNfMS5FbmRJZl07XG4gICAgICAgIHRoaXMucmVwbGFjZXJzID0gW1JlcGxhY2Vyc18xLlZhcmlhYmxlUmVwbGFjZXJdO1xuICAgICAgICB0aGlzLnNjb3BlID0gbmV3IENvbW1hbmRTY29wZV8xLmRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzID0gW107XG4gICAgICAgIHRoaXMuc2NvcGUudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLmFjdGlvbiA9IHRoaXMuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgIH1cbiAgICBDb21tYW5kLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5hY3Rpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24ucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBhY3Rpb24odGhpcywgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocGFzc2VkKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmFjdGlvbi5wZXJmb3JtKHBhc3NlZCk7XG4gICAgICAgIHJlc3VsdC5yZXN1bHQgKz0gdGhpcy5wZXJmb3JtRGVwZW5kZW50cyhyZXN1bHQucGFzc2VkKTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMucmVwbGFjZXJzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHJlcGxhY2VyID0gX2FbX2ldO1xuICAgICAgICAgICAgcmVzdWx0LnJlc3VsdCA9IHJlcGxhY2VyLnJlcGxhY2UocmVzdWx0LnJlc3VsdCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtU2NvcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXQgPSAnJywgcHJldlBhc3NlZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5zY29wZS5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbW1hbmQucGVyZm9ybShwcmV2UGFzc2VkKTtcbiAgICAgICAgICAgIHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgcmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm1EZXBlbmRlbnRzID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgdmFyIHJldCA9ICcnO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5kZXBlbmRlbnRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGRlcGVuZGVudCA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBkZXBlbmRlbnQucGVyZm9ybShwcmV2UGFzc2VkKTtcbiAgICAgICAgICAgIHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgcmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnRlcm1pbmF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY29wZS5jb21tYW5kcy5zb21lKGZ1bmN0aW9uIChjb21tYW5kKSB7IHJldHVybiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yOyB9KVxuICAgICAgICAgICAgPyB0aGlzLnNjb3BlLmNvbW1hbmRzLmZpbHRlcihmdW5jdGlvbiAoY29tbWFuZCkgeyByZXR1cm4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcjsgfSlbMV0ucGVyZm9ybShmYWxzZSkucmVzdWx0XG4gICAgICAgICAgICA6ICcnO1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUuZGVwZW5kZW50ID0gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICB3aW5kb3dbJ2FjdGlvbiddID0gdGhpcy5hY3Rpb24uY29uc3RydWN0b3JbJ2RlcGVuZGVudHMnXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuYWN0aW9uLmNvbnN0cnVjdG9yWydkZXBlbmRlbnRzJ107IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVwZW5kZW50ID0gX2FbX2ldO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiBpbnN0YW5jZW9mIGRlcGVuZGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBDb21tYW5kLnJlZ2V4ID0gL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvaWdtO1xuICAgIHJldHVybiBDb21tYW5kO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvbW1hbmQ7XG4iLCJ2YXIgQ29tbWFuZFNjb3BlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kU2NvcGUoKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0ge307XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5kZXBlbmRhbnRzID0gW107XG4gICAgfVxuICAgIHJldHVybiBDb21tYW5kU2NvcGU7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29tbWFuZFNjb3BlO1xuIiwidmFyIElzTm90TnVsbF8xID0gcmVxdWlyZSgnLi9jb25kaXRpb25zL0lzTm90TnVsbCcpO1xuZXhwb3J0cy5Jc05vdE51bGwgPSBJc05vdE51bGxfMS5kZWZhdWx0O1xuIiwidmFyIEVycm9ycyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXJyb3JzKCkge1xuICAgIH1cbiAgICBFcnJvcnMuSW5jb3JyZWN0U3RhdGVtZW50ID0gZnVuY3Rpb24gKGFjdGlvbiwgc3RhdGVtZW50KSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0gYWN0aW9uLmNvbW1hbmQuYWN0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHguZGVwZW5kZW50cy5zb21lKGZ1bmN0aW9uICh5KSB7IHJldHVybiBhY3Rpb24gaW5zdGFuY2VvZiB5OyB9KTsgfSkubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Lm5hbWU7IH0pLmpvaW4oJywgJyk7XG4gICAgICAgIHZhciBlcnJvciA9IFwiSW5jb3JyZWN0IHN0YXRlbWVudCBmb3VuZCBhdCBcXFwiXCIgKyBzdGF0ZW1lbnQgKyBcIlxcXCIuIFwiICsgYWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ10gKyBcIiBtdXN0IGZvbGxvdyBcIiArIGFjdGlvbnM7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgfTtcbiAgICByZXR1cm4gRXJyb3JzO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVycm9ycztcbiIsIkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xuIiwiXG4iLCJ2YXIgUGFyc2VyXzEgPSByZXF1aXJlKCcuL1BhcnNlcicpO1xuZnVuY3Rpb24gcGFyc2Uoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcl8xLmRlZmF1bHQoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJFeHRlbnNpb25zLnRzXCIgLz5cbnZhciBDb21tYW5kXzEgPSByZXF1aXJlKCcuL0NvbW1hbmQnKTtcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xudmFyIFBhcnNlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFyc2VyKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuc3FsID0gc3FsO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIH1cbiAgICBQYXJzZXIucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdmFyIG1hdGNoLCBjb21tYW5kcyA9IFtdLCBzdGFjayA9IFtdO1xuICAgICAgICBDb21tYW5kXzEuZGVmYXVsdC5yZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gQ29tbWFuZF8xLmRlZmF1bHQucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgZm91bmQgPSBuZXcgQ29tbWFuZF8xLmRlZmF1bHQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmRlcGVuZGVudChmb3VuZC5hY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgZm91bmQuYWN0aW9uLnN1cHBvcnRlciA9IHN0YWNrLmxhc3QoKTtcbiAgICAgICAgICAgICAgICBzdGFjay5sYXN0KCkuZGVwZW5kZW50cy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgIXN0YWNrLmxhc3QoKS5hY3Rpb24udGVybWluYXRvcikge1xuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgICAgIHN0YWNrLmxhc3QoKS5zY29wZS5jb21tYW5kcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5hY3Rpb24udGVybWluYXRvcilcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChmb3VuZCk7XG4gICAgICAgICAgICAgICAgY29tbWFuZHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBmb3VuZC5hY3Rpb24udmFsaWRhdGUoKTtcbiAgICAgICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1hbmRzO1xuICAgIH07XG4gICAgUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gJycsIGluZGV4ID0gMDtcbiAgICAgICAgaWYgKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3FsO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgcXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLSAxKTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuICAgICAgICAgICAgaW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXJ5OyAvL1RPRE9cbiAgICB9O1xuICAgIHJldHVybiBQYXJzZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gUGFyc2VyO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXJfMSA9IHJlcXVpcmUoJy4vcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXInKTtcbmV4cG9ydHMuVmFyaWFibGVSZXBsYWNlciA9IFZhcmlhYmxlUmVwbGFjZXJfMS5kZWZhdWx0O1xuIiwidmFyIE1haW5fMSA9IHJlcXVpcmUoJy4vTWFpbicpO1xud2luZG93WydTUWlnZ0wnXSA9IHdpbmRvd1snU1FpZ2dMJ10gfHwge307XG53aW5kb3dbJ1NRaWdnTCddLnBhcnNlID0gTWFpbl8xLnBhcnNlO1xud2luZG93WydTUWlnZ0wnXS52ZXJzaW9uID0gJzAuMS4wJztcbmV4cG9ydHMuZGVmYXVsdCA9IE1haW5fMS5wYXJzZTtcbiIsInZhciBFcnJvcnNfMSA9IHJlcXVpcmUoJy4uL0Vycm9ycycpO1xuLyoqXG4gKiBUaGUgRWxzZSBhY3Rpb25cbiAqIEBtb2R1bGUgRWxzZVxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAgICAgICAgICAgICAtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgICAgIC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAgICAtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgICAgICAgICAgLSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG52YXIgRWxzZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRWxzZShjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMudGVybWluYXRvciA9IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBFbHNlLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlcilcbiAgICAgICAgICAgIHJldHVybiBFcnJvcnNfMS5kZWZhdWx0LkluY29ycmVjdFN0YXRlbWVudCh0aGlzLCB0aGlzLnN0YXRlbWVudCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG4gICAgICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG4gICAgICovXG4gICAgRWxzZS5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIGlmIChwcmV2UGFzc2VkID09PSB2b2lkIDApIHsgcHJldlBhc3NlZCA9IGZhbHNlOyB9XG4gICAgICAgIHJldHVybiAhcHJldlBhc3NlZCA/IHsgcmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWUgfSA6IHsgcmVzdWx0OiAnJywgcGFzc2VkOiBmYWxzZSB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgRWxzZS5yZWdleCA9IC9eXFxzKmVsc2VcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBFbHNlLmNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cbiAgICBFbHNlLmRlcGVuZGVudHMgPSBbXTtcbiAgICByZXR1cm4gRWxzZTtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBFbHNlO1xuIiwidmFyIEVycm9yc18xID0gcmVxdWlyZSgnLi4vRXJyb3JzJyk7XG4vKipcbiAqIFRoZSBFbmRJZiBhY3Rpb25cbiAqIEBtb2R1bGUgRW5kSWZcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMgSUFjdGlvbiB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbnZhciBFbmRJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5kSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgRW5kSWYucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVyKVxuICAgICAgICAgICAgcmV0dXJuIEVycm9yc18xLmRlZmF1bHQuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG4gICAgICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG4gICAgICovXG4gICAgRW5kSWYucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICBpZiAocHJldlBhc3NlZCA9PT0gdm9pZCAwKSB7IHByZXZQYXNzZWQgPSBmYWxzZTsgfVxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHRoaXMuaW5uZXIsIHBhc3NlZDogdHJ1ZSB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIEVuZElmLnJlZ2V4ID0gL15cXHMqZW5kaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG4gICAgRW5kSWYuY29uZGl0aW9ucyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cbiAgICBFbmRJZi5kZXBlbmRlbnRzID0gW107XG4gICAgcmV0dXJuIEVuZElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVuZElmO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi4vQWN0aW9ucycpO1xudmFyIENvbmRpdGlvbnNfMSA9IHJlcXVpcmUoJy4uL0NvbmRpdGlvbnMnKTtcbi8qKlxuICogVGhlIElmIGFjdGlvblxuICogQG1vZHVsZSBJZlxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbnZhciBJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSB0aGlzLnBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJ5IGFuZCBsb2NhdGUgYSBtYXRjaGluZyBjb25kaXRpb24gZnJvbSB0aGUgYXZhaWxhYmxlIGNvbmRpdGlvbnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgcmV0dXJuIG51bGwuXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50XHRcdC0gU3RhdGVtZW50IHRvIGNoZWNrIGNvbmRpdGlvbnMgYWdhaW5zdFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHQtIExpc3Qgb2YgdmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7SUNvbmRpdGlvbiB8IG51bGx9XHRcdC0gQ29uZGl0aW9uIHRoYXQgbWF0Y2hlcyB3aXRoaW4gdGhlIHN0YXRlbWVudFxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wYXJzZUNvbmRpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gSWYuY29uZGl0aW9uczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb25kaXRpb24gPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goY29uZGl0aW9uLnJlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY29uZGl0aW9uKG1hdGNoWzFdLCB2YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuICAgICAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0ge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKVxuICAgICAgICAgICAgPyB7IHJlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyByZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgSWYucmVnZXggPSAvXlxccyppZlxcYi9pO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBJZi5jb25kaXRpb25zID0gW0NvbmRpdGlvbnNfMS5Jc05vdE51bGxdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cbiAgICBJZi5kZXBlbmRlbnRzID0gW0FjdGlvbnNfMS5FbHNlLCBBY3Rpb25zXzEuRW5kSWZdO1xuICAgIHJldHVybiBJZjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBJZjtcbiIsInZhciBJc05vdE51bGwgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIElzTm90TnVsbCh2YXJpYWJsZSwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB2YXJpYWJsZTtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgfVxuICAgIElzTm90TnVsbC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGw7XG4gICAgfTtcbiAgICBJc05vdE51bGwucmVnZXggPSAvKFxcdyopXFxzK2lzXFxzK25vdFxccytudWxsXFxzKi9pO1xuICAgIHJldHVybiBJc05vdE51bGw7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSXNOb3ROdWxsO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhcmlhYmxlUmVwbGFjZXIoKSB7XG4gICAgfVxuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVwbGFjZSA9IGZ1bmN0aW9uICh0ZXh0LCB2YXJpYWJsZXMpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gsICQxLCAkMikgeyByZXR1cm4gJDEgKyB2YXJpYWJsZXNbJDJdOyB9KTtcbiAgICB9O1xuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVnZXggPSAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2c7XG4gICAgcmV0dXJuIFZhcmlhYmxlUmVwbGFjZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gVmFyaWFibGVSZXBsYWNlcjtcbiJdfQ==
