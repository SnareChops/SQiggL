(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Note: These are loaded in order, make sure any dependent actions are listed above the action that requires them.
var EndIf_1 = require('./actions/EndIf');
exports.EndIf = EndIf_1.default;
var Else_1 = require('./actions/Else');
exports.Else = Else_1.default;
var If_1 = require('./actions/If');
exports.If = If_1.default;

},{"./actions/Else":14,"./actions/EndIf":15,"./actions/If":17}],2:[function(require,module,exports){
var Actions_1 = require('./Actions');
var CommandScope_1 = require('./CommandScope');
var Replacers_1 = require('./Replacers');
/**
 * Command object responsible for handling all actions, conditions, and variables within it's section of the query
 * @module Command
 * @class
 * @param {number} index                - Beginning index of the command in the original query string
 * @param {number} length               - Length of the section of the original string that this command is responsible for
 * @param {string} statement            - Statement within the '{{% %}}' that this command is responsible for
 * @param {string} inner                - Text that immediately follows the statement until the next command
 * @param {IVariables} variables        - Variables within the scope of this command
 * @property {number} index             - Beginning index of the command in the original query string
 * @property {number} length            - Length of the section of the original string that this command is responsible for
 * @property {string} statement         - Statement within the '{{% %}}' that this command is responsible for
 * @property {string} inner             - Text that immediately follows the statement until the next command
 * @property {IVariables} variables     - Variables within the scope of this command
 * @property {IAction[]} actions        - Array of actions available to SQiggL
 * @property {IReplacer[]} replacers    - Array of replacers available to SQiggL
 * @property {CommandScope} scope       - Holds information about the scope of this command, such as available variables {@see CommandScope}
 * @property {Command[]} dependents     - Array of commands dependent to this command
 */
var Command = (function () {
    function Command(index, length, statement, inner, variables) {
        this.index = index;
        this.length = length;
        this.statement = statement;
        this.inner = inner;
        this.actions = [Actions_1.If, Actions_1.Else, Actions_1.EndIf];
        this.replacers = [Replacers_1.VariableReplacer];
        this.scope = new CommandScope_1["default"]();
        this.dependents = [];
        this.scope.variables = variables;
        this.action = this.extract(statement, inner, variables);
    }
    /**
     * Extract actions from the statement
     * @memberof Command
     * @method
     * @public
     * @param {string} statement        - Statement to extract the actions from
     * @param {string} inner            - Inner text for the command
     * @param {IVariables} variables    - Variables within the scope of this command
     * @returns {IAction | null}        - The matching action or null if no action was found
     */
    Command.prototype.extract = function (statement, inner, variables) {
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.regex.test(this.statement))
                return new action(this, statement, inner, variables);
        }
        return null;
    };
    /**
     * Perform the command and return the result
     * @memberof Command
     * @method
     * @public
     * @param {boolean} passed      - If the command is a dependent then this will reflect if the previous command succeeded or failed
     * @returns {IPerformResult}    - The result of the command execution {@see IPerformResult}
     */
    Command.prototype.perform = function (passed) {
        var result = this.action.perform(passed);
        result.result += this.performDependents(result.passed);
        for (var _i = 0, _a = this.replacers; _i < _a.length; _i++) {
            var replacer = _a[_i];
            result.result = replacer.replace(result.result, this.scope.variables);
        }
        return result;
    };
    /**
     * Perform commands that are within the scope of this command (sub-commands)
     * @memberof Command
     * @method
     * @public
     * @returns {string} The result of the sub-command's execution
     */
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
    /**
     * Perform commands that are dependent on this command
     * @memberof Command
     * @method
     * @public
     * @param {boolean} prevPassed  - If this command is a dependent then this will reflect if the previous command succeeded or failed
     * @returns {string} The result of the dependent executions (collectively)
     */
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
    /**
     * Perform the termination of the command's actions if needed (For example "EndIf" is a terminator of "If", so this essentially means to just print out the string that follows "EndIf")
     * @memberof Command
     * @method
     * @public
     * @returns {string} The result of the action's terminator
     */
    Command.prototype.termination = function () {
        return this.scope.commands.some(function (command) { return command.action.terminator; })
            ? this.scope.commands.filter(function (command) { return command.action.terminator; })[1].perform(false).result
            : '';
    };
    /**
     * Check if the inputted action is a dependent of the action for this command
     * @memberof Command
     * @method
     * @public
     * @param {IAction} action  - The action to check if it is a dependent of this command's action
     * @returns {boolean} Whether the action is a dependent of this command's action
     */
    Command.prototype.dependent = function (action) {
        for (var _i = 0, _a = this.action.constructor['dependents']; _i < _a.length; _i++) {
            var dependent = _a[_i];
            if (action instanceof dependent)
                return true;
        }
        return false;
    };
    /**
     * @memberof Command
     * @static
     * @property {RegExp} The regex matcher
     */
    Command.regex = /{{%(.*?)%}}([\s\S]*?)?(?=(?:{{%|$))/gm;
    return Command;
})();
exports["default"] = Command;

},{"./Actions":1,"./CommandScope":3,"./Replacers":12}],3:[function(require,module,exports){
/**
 * The Command Scope object
 * @module CommandScope
 * @class
 * @property {IVariables} variables - Holds variables for the scope
 * @property {Command[]} commands   - Array of commands within the scope
 * @property {Command[]} commands   - Array of dependent commands
 */
var CommandScope = (function () {
    function CommandScope() {
        this.variables = {};
        this.commands = [];
        this.dependents = [];
    }
    return CommandScope;
})();
exports["default"] = CommandScope;

},{}],4:[function(require,module,exports){
var Condition_1 = require('./conditions/Condition');
exports.Condition = Condition_1.default;
var IsNull_1 = require('./conditions/IsNull');
exports.IsNull = IsNull_1.default;
var GreaterThan_1 = require('./conditions/GreaterThan');
exports.GreaterThan = GreaterThan_1.default;
var LessThan_1 = require('./conditions/LessThan');
exports.LessThan = LessThan_1.default;
// export {default as GreaterThanOrEqual} from './conditions/GreaterThanOrEqual';
// export {default as LessThanOrEqual} from './conditions/LessThanOrEqual';
var Equal_1 = require('./conditions/Equal');
exports.Equal = Equal_1.default;

},{"./conditions/Condition":18,"./conditions/Equal":19,"./conditions/GreaterThan":20,"./conditions/IsNull":22,"./conditions/LessThan":23}],5:[function(require,module,exports){
/**
 * Module of error checkers
 * @module Errors
 * @class
 * @static
 */
var Errors = (function () {
    function Errors() {
    }
    /**
     * @memberof Errors
     * @method
     * @static
     * @param {IAction} action      - Action to check for an Incorrect Statement error
     * @param {string} statement    - Statement to check for a Incorrect Statement error
     * @returns {string | null}     - The error message if any, otherwise null
     */
    Errors.IncorrectStatement = function (action, statement) {
        var actions = action.command.actions.filter(function (x) { return x.dependents.some(function (y) { return action instanceof y; }); }).map(function (x) { return x.name; }).join(', ');
        var error = "Incorrect statement found at \"" + statement + "\". " + action.constructor['name'] + " must follow " + actions;
        console.error(error);
        return error;
    };
    return Errors;
})();
exports["default"] = Errors;

},{}],6:[function(require,module,exports){
Array.prototype.last = function () {
    return this[this.length - 1];
};
Array.prototype.isFull = function () {
    for (var i = 0; i < this.length; i++) {
        if (i == null)
            return false;
    }
};

},{}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){

},{}],9:[function(require,module,exports){
var Parser_1 = require('./Parser');
/**
 * The starting point of the entire SQiggL parser
 * @function
 * @param {string} sql              - The SQL query to run SQiggL against
 * @param {IVariables?} variables   - Optional collection of variables for your SQiggL query
 * @return {string}                 - The fully parsed SQL query
 */
function parse(sql, variables) {
    var parser = new Parser_1["default"](sql, variables);
    return parser.parse();
}
exports.parse = parse;

},{"./Parser":11}],10:[function(require,module,exports){
var Not_1 = require('./modifiers/Not');
exports.Not = Not_1.default;
var OrEqual_1 = require('./modifiers/OrEqual');
exports.OrEqual = OrEqual_1.default;

},{"./modifiers/Not":25,"./modifiers/OrEqual":26}],11:[function(require,module,exports){
/// <reference path="Extensions.ts" />
var Command_1 = require('./Command');
Array.prototype.last = function () {
    return this[this.length - 1];
};
/**
 * The SQiggL parser
 * @module Parser
 * @class
 * @param {string} sql              - The SQiggL query to run the parser against
 * @param {IVariables} variables    - Any variables passed to the SQiggL parser
 * @property {string} sql           - The SQiggL query to run the parser against
 * @property {IVariables} variables - Any variables passed to the SQiggL parser
 * @property {Command[]} commands   - Array of commands found in the SQiggL query
 * @property {Command[]} stack      - Command stack for storing current position in the parsing process
 * @property {string} error         - Error string if any errors are found in the parsing process
 */
var Parser = (function () {
    function Parser(sql, variables) {
        this.sql = sql;
        this.variables = variables;
        this.commands = this.extract(sql, variables);
        this.variables = variables;
    }
    /**
     * Extract any commands out of the SQiggL query and determine their order, nesting, and type
     * @memberof Parser
     * @method
     * @public
     * @param {string} sql              - SQiggL query to extract commands from
     * @param {IVariables} variables    - Any global variables passed in to SQiggL
     * @returns {Command[]}             - Array of fully parsed commands, ready for execution
     */
    Parser.prototype.extract = function (sql, variables) {
        var match, commands = [], stack = [];
        Command_1["default"].regex.lastIndex = 0;
        while ((match = Command_1["default"].regex.exec(sql)) != null) {
            var found = new Command_1["default"](match.index, match.input.length, match[1], match[2], variables);
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
    /**
     * Run the commands against the string and output the end result
     * @memberof Parser
     * @method
     * @public
     * @returns {string} The end result of running all commands against the SQiggL query
     */
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
exports["default"] = Parser;

},{"./Command":2}],12:[function(require,module,exports){
var VariableReplacer_1 = require('./replacers/VariableReplacer');
exports.VariableReplacer = VariableReplacer_1.default;

},{"./replacers/VariableReplacer":28}],13:[function(require,module,exports){
var Main_1 = require('./Main');
var SQiggL = {
    parse: Main_1.parse,
    version: '0.1.0'
};
if (window)
    window['SQiggL'] = SQiggL;
exports["default"] = SQiggL;

},{"./Main":9}],14:[function(require,module,exports){
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
            return Errors_1["default"].IncorrectStatement(this, this.statement);
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
exports["default"] = Else;

},{"../Errors":5}],15:[function(require,module,exports){
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
            return Errors_1["default"].IncorrectStatement(this, this.statement);
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
exports["default"] = EndIf;

},{"../Errors":5}],16:[function(require,module,exports){

},{}],17:[function(require,module,exports){
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
        this.condition = this.extractCondition(statement, variables);
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
    If.prototype.extractCondition = function (statement, variables) {
        for (var _i = 0, _a = If.conditions; _i < _a.length; _i++) {
            var condition = _a[_i];
            var match = condition.extract(statement, variables);
            if (match)
                return match;
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
    If.conditions = [Conditions_1.IsNull, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.Equal];
    /**
     * @memberof If
     * @static
     * @property {IAction[]} Array of dependent actions
     */
    If.dependents = [Actions_1.Else, Actions_1.EndIf];
    return If;
})();
exports["default"] = If;

},{"../Actions":1,"../Conditions":4}],18:[function(require,module,exports){
require('../Extensions');
var Condition = (function () {
    function Condition() {
    }
    Condition.mods = function (klass) {
        return klass.modifiers.map(function (x) { return ("" + x.identifiers.map(function (id) { return id.source; }).join('|')); }).join('|');
    };
    Condition.prototype.extractModifiers = function (klass, mod1, mod2) {
        if (!mod1 && !mod2)
            return [];
        var array = [], count = 0;
        if (mod1)
            count++;
        if (mod2)
            count++;
        for (var _i = 0, _a = klass.modifiers; _i < _a.length; _i++) {
            var mod = _a[_i];
            for (var _b = 0, _c = mod.identifiers; _b < _c.length; _b++) {
                var identifier = _c[_b];
                if (mod1 && identifier.test(mod1))
                    array[0] = mod;
                if (mod2 && identifier.test(mod2)) {
                    array[!mod1 ? 0 : 1] = mod;
                }
                if (array.length === count && array.isFull())
                    return array;
            }
        }
        return array;
    };
    Condition.prototype.performModifiers = function (modifiers, result, variable, variables, comparative) {
        if (modifiers.length === 0)
            return result;
        var i;
        for (i = modifiers.length - 1; i > -1; --i) {
            result = modifiers[i].perform(result, variable, variables, comparative);
        }
        return result;
    };
    return Condition;
})();
exports["default"] = Condition;

},{"../Extensions":6}],19:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Condition_1 = require('./Condition');
var Modifiers_1 = require('../Modifiers');
/**
 * The == condition
 * @module Equal
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var Equal = (function (_super) {
    __extends(Equal, _super);
    function Equal(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = this.extractModifiers(Equal, mod1, mod2);
    }
    Equal.extract = function (statement, variables) {
        var match = statement.match(Equal.regex);
        if (match && match.length > 0)
            return new Equal(match[1], variables, match[4], match[2], match[3]);
        return null;
    };
    /**
     * @memberof Equal
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    Equal.prototype.perform = function () {
        var result = this.variables[this.variable] === this.comparative;
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof Equal
     * @static
     * @property {RegExp} The regex matcher
     */
    Equal.modifiers = [Modifiers_1.Not, Modifiers_1.OrEqual];
    Equal.regex = new RegExp("(\\w+)\\s+((?:" + Equal.mods(Equal) + "|\\s*))=((?:" + Equal.mods(Equal) + "|\\s*))\\s+(\\d+|[\"']\\w+[\"'])", 'i');
    return Equal;
})(Condition_1["default"]);
exports["default"] = Equal;

},{"../Modifiers":10,"./Condition":18}],20:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Condition_1 = require('./Condition');
var Modifiers_1 = require('../Modifiers');
/**
 * The > condition
 * @module GreaterThan
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var GreaterThan = (function (_super) {
    __extends(GreaterThan, _super);
    function GreaterThan(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = _super.prototype.extractModifiers.call(this, GreaterThan, mod1, mod2);
    }
    GreaterThan.extract = function (statement, variables) {
        var match = statement.match(GreaterThan.regex);
        if (match && match.length > 0)
            return new GreaterThan(match[1], variables, match[4], match[2], match[3]);
        return null;
    };
    /**
     * @memberof GreaterThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    GreaterThan.prototype.perform = function () {
        var result = parseInt(this.variables[this.variable]) > parseInt(this.comparative);
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof GreaterThan
     * @static
     * @property {RegExp} The regex matcher
     */
    GreaterThan.modifiers = [Modifiers_1.Not, Modifiers_1.OrEqual];
    GreaterThan.regex = new RegExp("(\\w+)\\s+((?:" + GreaterThan.mods(GreaterThan) + "|\\s*))>((?:" + GreaterThan.mods(GreaterThan) + "|\\s*))\\s+(\\d+)", 'i');
    return GreaterThan;
})(Condition_1["default"]);
exports["default"] = GreaterThan;

},{"../Modifiers":10,"./Condition":18}],21:[function(require,module,exports){

},{}],22:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Modifiers_1 = require('../Modifiers');
var Condition_1 = require('./Condition');
/**
 * The Is Null condition
 * @module IsNull
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var IsNull = (function (_super) {
    __extends(IsNull, _super);
    function IsNull(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = _super.prototype.extractModifiers.call(this, IsNull, mod1, mod2);
    }
    IsNull.extract = function (statement, variables) {
        var match = statement.match(IsNull.regex);
        if (match && match.length > 0)
            return new IsNull(match[1], variables, null, match[2], null);
        return null;
    };
    /**
     * @memberof IsNull
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    IsNull.prototype.perform = function () {
        var result = this.variables[this.variable] == null;
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof IsNull
     * @static
     * @property {RegExp} The regex matcher
     */
    IsNull.modifiers = [Modifiers_1.Not];
    IsNull.regex = new RegExp("(\\w+)\\s+is\\s+((?:" + IsNull.mods(IsNull) + "|\\s*))null\\s*", 'i');
    return IsNull;
})(Condition_1["default"]);
exports["default"] = IsNull;

},{"../Modifiers":10,"./Condition":18}],23:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Condition_1 = require('./Condition');
var Modifiers_1 = require('../Modifiers');
/**
 * The < condition
 * @module LessThan
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var LessThan = (function (_super) {
    __extends(LessThan, _super);
    function LessThan(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = this.extractModifiers(LessThan, mod1, mod2);
    }
    LessThan.extract = function (statement, variables) {
        var match = statement.match(LessThan.regex);
        if (match && match.length > 0)
            return new LessThan(match[1], variables, match[4], match[2], match[3]);
        return null;
    };
    /**
     * @memberof LessThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    LessThan.prototype.perform = function () {
        var result = parseInt(this.variables[this.variable]) < parseInt(this.comparative);
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof LessThan
     * @static
     * @property {RegExp} The regex matcher
     */
    LessThan.modifiers = [Modifiers_1.Not, Modifiers_1.OrEqual];
    LessThan.regex = new RegExp("(\\w+)\\s+((?:" + LessThan.mods(LessThan) + "|\\s*))<((?:" + LessThan.mods(LessThan) + "|\\s*))\\s+(\\d+)", 'i');
    return LessThan;
})(Condition_1["default"]);
exports["default"] = LessThan;

},{"../Modifiers":10,"./Condition":18}],24:[function(require,module,exports){

},{}],25:[function(require,module,exports){
var Not = {
    identifiers: [/!/i, /(?:\b|\s+)not(?:\b|\s+)/i],
    perform: function (result, variable, variables, comparative) { return !result; },
    matches: function (item) {
        for (var _i = 0, _a = Not.identifiers; _i < _a.length; _i++) {
            var identifier = _a[_i];
            if (identifier.test(item))
                return true;
        }
        return false;
    }
};
exports["default"] = Not;

},{}],26:[function(require,module,exports){
var OrEqual = {
    identifiers: [/=/i],
    perform: function (result, variable, variables, comparative) {
        return result || variables[variable] === comparative;
    },
    matches: function (item) {
        for (var _i = 0, _a = OrEqual.identifiers; _i < _a.length; _i++) {
            var identifier = _a[_i];
            if (identifier.test(item))
                return true;
        }
        return false;
    }
};
exports["default"] = OrEqual;

},{}],27:[function(require,module,exports){

},{}],28:[function(require,module,exports){
/**
 * The variable replacer for embedded SQiggL variables
 * @module VariableReplacer
 * @static
 * @class
 * @implements {IReplacer}
 */
var VariableReplacer = (function () {
    function VariableReplacer() {
    }
    /**
     * @memberof VariableReplacer
     * @static
     * @method
     * @param {string} text             - Text to search for replacements
     * @param {IVariables} variables    - Variables within the scope
     * @returns {string}                - The string with variables replaced
     */
    VariableReplacer.replace = function (text, variables) {
        return text.replace(this.regex, function (match, $1, $2) { return $1 + variables[$2]; });
    };
    /**
     * @memberof VariableReplacer
     * @static
     * @property {RegExp} The regex matcher
     */
    VariableReplacer.regex = /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g;
    return VariableReplacer;
})();
exports["default"] = VariableReplacer;

},{}]},{},[1,14,15,16,17,2,3,4,18,19,20,21,22,23,5,6,7,8,9,10,24,25,26,11,12,27,28,13])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRTY29wZS50cyIsInNyYy9Db25kaXRpb25zLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lQZXJmb3JtUmVzdWx0LnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2VyLnRzIiwic3JjL1JlcGxhY2Vycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvYWN0aW9ucy9FbHNlLnRzIiwic3JjL2FjdGlvbnMvRW5kSWYudHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSWYudHMiLCJzcmMvY29uZGl0aW9ucy9Db25kaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9FcXVhbC50cyIsInNyYy9jb25kaXRpb25zL0dyZWF0ZXJUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0lzTnVsbC50cyIsInNyYy9jb25kaXRpb25zL0xlc3NUaGFuLnRzIiwic3JjL21vZGlmaWVycy9JTW9kaWZpZXIudHMiLCJzcmMvbW9kaWZpZXJzL05vdC50cyIsInNyYy9tb2RpZmllcnMvT3JFcXVhbC50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyLnRzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsbUhBQW1IO0FBQ25ILHNCQUErQixpQkFBaUIsQ0FBQztBQUF6QyxnQ0FBeUM7QUFDakQscUJBQThCLGdCQUFnQixDQUFDO0FBQXZDLDhCQUF1QztBQUMvQyxtQkFBNEIsY0FBYyxDQUFDO0FBQW5DLDBCQUFtQzs7O0FDSDNDLHdC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QUN6RCxDQUFDO0lBQ0QsT0FBTyxFQUFFLFVBQUMsSUFBSTtRQUNWLEdBQUcsQ0FBQSxDQUFtQixVQUFtQixFQUFuQixLQUFBLE9BQU8sQ0FBQyxXQUFXLEVBQXJDLGNBQWMsRUFBZCxJQUFxQyxDQUFDO1lBQXRDLElBQUksVUFBVSxTQUFBO1lBQ2QsRUFBRSxDQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ3pDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0osQ0FBQTtBQUNELHFCQUFlLE9BQU8sQ0FBQzs7O0FDUkU7O0FDSHpCOzs7Ozs7R0FNRztBQUNIO0lBQUE7SUFrQkEsQ0FBQztJQVhBOzs7Ozs7O09BT007SUFDUSx3QkFBTyxHQUFyQixVQUFzQixJQUFZLEVBQUUsU0FBcUI7UUFDeEQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFLLE9BQUEsRUFBRSxHQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFoQkU7Ozs7T0FJRztJQUNRLHNCQUFLLEdBQVcsb0NBQW9DLENBQUM7SUFZcEUsdUJBQUM7QUFBRCxDQWxCQSxBQWtCQyxJQUFBO0FBbEJELHFDQWtCQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE5vdGU6IFRoZXNlIGFyZSBsb2FkZWQgaW4gb3JkZXIsIG1ha2Ugc3VyZSBhbnkgZGVwZW5kZW50IGFjdGlvbnMgYXJlIGxpc3RlZCBhYm92ZSB0aGUgYWN0aW9uIHRoYXQgcmVxdWlyZXMgdGhlbS5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBFbmRJZn0gZnJvbSAnLi9hY3Rpb25zL0VuZElmJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBFbHNlfSBmcm9tICcuL2FjdGlvbnMvRWxzZSc7XG5leHBvcnQge2RlZmF1bHQgYXMgSWZ9IGZyb20gJy4vYWN0aW9ucy9JZic7IiwiaW1wb3J0IHtJZiwgRWxzZSwgRW5kSWZ9IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZFNjb3BlIGZyb20gJy4vQ29tbWFuZFNjb3BlJztcbmltcG9ydCB7VmFyaWFibGVSZXBsYWNlcn0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbi8qKlxuICogQ29tbWFuZCBvYmplY3QgcmVzcG9uc2libGUgZm9yIGhhbmRsaW5nIGFsbCBhY3Rpb25zLCBjb25kaXRpb25zLCBhbmQgdmFyaWFibGVzIHdpdGhpbiBpdCdzIHNlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gKiBAbW9kdWxlIENvbW1hbmRcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4ICAgICAgICAgICAgICAgIC0gQmVnaW5uaW5nIGluZGV4IG9mIHRoZSBjb21tYW5kIGluIHRoZSBvcmlnaW5hbCBxdWVyeSBzdHJpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggICAgICAgICAgICAgICAtIExlbmd0aCBvZiB0aGUgc2VjdGlvbiBvZiB0aGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgICAgIC0gU3RhdGVtZW50IHdpdGhpbiB0aGUgJ3t7JSAlfX0nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgICAgIC0gVGV4dCB0aGF0IGltbWVkaWF0ZWx5IGZvbGxvd3MgdGhlIHN0YXRlbWVudCB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBpbmRleCAgICAgICAgICAgICAtIEJlZ2lubmluZyBpbmRleCBvZiB0aGUgY29tbWFuZCBpbiB0aGUgb3JpZ2luYWwgcXVlcnkgc3RyaW5nXG4gKiBAcHJvcGVydHkge251bWJlcn0gbGVuZ3RoICAgICAgICAgICAgLSBMZW5ndGggb2YgdGhlIHNlY3Rpb24gb2YgdGhlIG9yaWdpbmFsIHN0cmluZyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAtIFN0YXRlbWVudCB3aXRoaW4gdGhlICd7eyUgJX19JyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAtIFRleHQgdGhhdCBpbW1lZGlhdGVseSBmb2xsb3dzIHRoZSBzdGF0ZW1lbnQgdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gYWN0aW9ucyAgICAgICAgLSBBcnJheSBvZiBhY3Rpb25zIGF2YWlsYWJsZSB0byBTUWlnZ0xcbiAqIEBwcm9wZXJ0eSB7SVJlcGxhY2VyW119IHJlcGxhY2VycyAgICAtIEFycmF5IG9mIHJlcGxhY2VycyBhdmFpbGFibGUgdG8gU1FpZ2dMXG4gKiBAcHJvcGVydHkge0NvbW1hbmRTY29wZX0gc2NvcGUgICAgICAgLSBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kLCBzdWNoIGFzIGF2YWlsYWJsZSB2YXJpYWJsZXMge0BzZWUgQ29tbWFuZFNjb3BlfVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGRlcGVuZGVudHMgICAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZGVwZW5kZW50IHRvIHRoaXMgY29tbWFuZCAgICAgICAgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmQge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAve3slKC4qPyklfX0oW1xcc1xcU10qPyk/KD89KD86e3slfCQpKS9nbTtcblx0cHVibGljIGFjdGlvbnM6IGFueVtdID0gW0lmLCBFbHNlLCBFbmRJZl07XG5cdHB1YmxpYyByZXBsYWNlcnMgPSBbVmFyaWFibGVSZXBsYWNlcl07XG5cdHB1YmxpYyBhY3Rpb246IElBY3Rpb247XG5cdHB1YmxpYyBzY29wZTogQ29tbWFuZFNjb3BlID0gbmV3IENvbW1hbmRTY29wZSgpO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbGVuZ3RoOm51bWJlciwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHR0aGlzLnNjb3BlLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0XHR0aGlzLmFjdGlvbiA9IHRoaXMuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuXHR9XG5cdC8qKlxuICAgICAqIEV4dHJhY3QgYWN0aW9ucyBmcm9tIHRoZSBzdGF0ZW1lbnRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgLSBTdGF0ZW1lbnQgdG8gZXh0cmFjdCB0aGUgYWN0aW9ucyBmcm9tXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgLSBJbm5lciB0ZXh0IGZvciB0aGUgY29tbWFuZFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gICAgICogQHJldHVybnMge0lBY3Rpb24gfCBudWxsfSAgICAgICAgLSBUaGUgbWF0Y2hpbmcgYWN0aW9uIG9yIG51bGwgaWYgbm8gYWN0aW9uIHdhcyBmb3VuZFxuICAgICAqL1x0XG5cdHB1YmxpYyBleHRyYWN0KHN0YXRlbWVudDogc3RyaW5nLCBpbm5lcjogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBJQWN0aW9ue1xuXHRcdGZvcih2YXIgYWN0aW9uIG9mIHRoaXMuYWN0aW9ucyl7XG5cdFx0XHRpZihhY3Rpb24ucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpIHJldHVybiBuZXcgYWN0aW9uKHRoaXMsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGNvbW1hbmQgYW5kIHJldHVybiB0aGUgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFzc2VkICAgICAgLSBJZiB0aGUgY29tbWFuZCBpcyBhIGRlcGVuZGVudCB0aGVuIHRoaXMgd2lsbCByZWZsZWN0IGlmIHRoZSBwcmV2aW91cyBjb21tYW5kIHN1Y2NlZWRlZCBvciBmYWlsZWRcbiAgICAgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9ICAgIC0gVGhlIHJlc3VsdCBvZiB0aGUgY29tbWFuZCBleGVjdXRpb24ge0BzZWUgSVBlcmZvcm1SZXN1bHR9XG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKHBhc3NlZDogYm9vbGVhbik6IElQZXJmb3JtUmVzdWx0IHtcblx0XHR2YXIgcmVzdWx0OiBJUGVyZm9ybVJlc3VsdCA9IHRoaXMuYWN0aW9uLnBlcmZvcm0ocGFzc2VkKTtcblx0XHRyZXN1bHQucmVzdWx0ICs9IHRoaXMucGVyZm9ybURlcGVuZGVudHMocmVzdWx0LnBhc3NlZCk7XG5cdFx0Zm9yKHZhciByZXBsYWNlciBvZiB0aGlzLnJlcGxhY2Vycyl7XG5cdFx0XHRyZXN1bHQucmVzdWx0ID0gcmVwbGFjZXIucmVwbGFjZShyZXN1bHQucmVzdWx0LCB0aGlzLnNjb3BlLnZhcmlhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZCAoc3ViLWNvbW1hbmRzKVxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBzdWItY29tbWFuZCdzIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybVNjb3BlKCk6IHN0cmluZyB7XG5cdFx0dmFyIHJldDogc3RyaW5nID0gJycsIHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0XHRmb3IodmFyIGNvbW1hbmQgb2YgdGhpcy5zY29wZS5jb21tYW5kcyl7XG5cdFx0XHR2YXIgcmVzdWx0ID0gY29tbWFuZC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuXHRcdFx0cHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG5cdFx0XHRyZXQgKz0gcmVzdWx0LnJlc3VsdDtcblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIGNvbW1hbmRzIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGNvbW1hbmRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkICAtIElmIHRoaXMgY29tbWFuZCBpcyBhIGRlcGVuZGVudCB0aGVuIHRoaXMgd2lsbCByZWZsZWN0IGlmIHRoZSBwcmV2aW91cyBjb21tYW5kIHN1Y2NlZWRlZCBvciBmYWlsZWRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBkZXBlbmRlbnQgZXhlY3V0aW9ucyAoY29sbGVjdGl2ZWx5KVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybURlcGVuZGVudHMocHJldlBhc3NlZDogYm9vbGVhbik6IHN0cmluZyB7XG5cdFx0dmFyIHJldDogc3RyaW5nID0gJyc7XG5cdFx0Zm9yKHZhciBkZXBlbmRlbnQgb2YgdGhpcy5kZXBlbmRlbnRzKXtcblx0XHRcdHZhciByZXN1bHQgPSBkZXBlbmRlbnQucGVyZm9ybShwcmV2UGFzc2VkKTtcblx0XHRcdHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuXHRcdFx0cmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSB0aGUgdGVybWluYXRpb24gb2YgdGhlIGNvbW1hbmQncyBhY3Rpb25zIGlmIG5lZWRlZCAoRm9yIGV4YW1wbGUgXCJFbmRJZlwiIGlzIGEgdGVybWluYXRvciBvZiBcIklmXCIsIHNvIHRoaXMgZXNzZW50aWFsbHkgbWVhbnMgdG8ganVzdCBwcmludCBvdXQgdGhlIHN0cmluZyB0aGF0IGZvbGxvd3MgXCJFbmRJZlwiKVxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBhY3Rpb24ncyB0ZXJtaW5hdG9yXG4gICAgICovXG5cdHB1YmxpYyB0ZXJtaW5hdGlvbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlLmNvbW1hbmRzLnNvbWUoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yKVxuXHRcdD8gdGhpcy5zY29wZS5jb21tYW5kcy5maWx0ZXIoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yKVsxXS5wZXJmb3JtKGZhbHNlKS5yZXN1bHRcblx0XHQ6ICcnO1xuXHR9XG5cdC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBpbnB1dHRlZCBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgdGhlIGFjdGlvbiBmb3IgdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAtIFRoZSBhY3Rpb24gdG8gY2hlY2sgaWYgaXQgaXMgYSBkZXBlbmRlbnQgb2YgdGhpcyBjb21tYW5kJ3MgYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiB0aGlzIGNvbW1hbmQncyBhY3Rpb24gXG4gICAgICovXG5cdHB1YmxpYyBkZXBlbmRlbnQoYWN0aW9uOiBJQWN0aW9uKTogYm9vbGVhbiB7XG5cdFx0Zm9yKHZhciBkZXBlbmRlbnQgb2YgdGhpcy5hY3Rpb24uY29uc3RydWN0b3JbJ2RlcGVuZGVudHMnXSl7XG5cdFx0XHRpZihhY3Rpb24gaW5zdGFuY2VvZiA8YW55PmRlcGVuZGVudCkgcmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuLyoqXG4gKiBUaGUgQ29tbWFuZCBTY29wZSBvYmplY3RcbiAqIEBtb2R1bGUgQ29tbWFuZFNjb3BlXG4gKiBAY2xhc3NcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gSG9sZHMgdmFyaWFibGVzIGZvciB0aGUgc2NvcGVcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgd2l0aGluIHRoZSBzY29wZVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBkZXBlbmRlbnQgY29tbWFuZHMgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRTY29wZSB7XG5cdHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7fTtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBJQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBJc051bGx9IGZyb20gJy4vY29uZGl0aW9ucy9Jc051bGwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIExlc3NUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW4nO1xuLy8gZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFuT3JFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0dyZWF0ZXJUaGFuT3JFcXVhbCc7XG4vLyBleHBvcnQge2RlZmF1bHQgYXMgTGVzc1RoYW5PckVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW5PckVxdWFsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0VxdWFsJztcbiIsImltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vKipcbiAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuICogQG1vZHVsZSBFcnJvcnNcbiAqIEBjbGFzc1xuICogQHN0YXRpY1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICB9XG59IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG4gICAgaXNGdWxsKCk6IGJvb2xlYW47XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuXG5BcnJheS5wcm90b3R5cGUuaXNGdWxsID0gZnVuY3Rpb24oKXtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKGkgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0iLCJpbnRlcmZhY2UgSVBlcmZvcm1SZXN1bHQge1xuXHRyZXN1bHQ6IHN0cmluZztcblx0cGFzc2VkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElQZXJmb3JtUmVzdWx0OyIsImludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGRlZmF1bHQgSVZhcmlhYmxlczsiLCJpbXBvcnQgUGFyc2VyIGZyb20gJy4vUGFyc2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHR2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihzcWwsIHZhcmlhYmxlcyk7XG5cdHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgSU1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9JTW9kaWZpZXInXG5leHBvcnQge2RlZmF1bHQgYXMgTm90fSBmcm9tICcuL21vZGlmaWVycy9Ob3QnOyBcbmV4cG9ydCB7ZGVmYXVsdCBhcyBPckVxdWFsfSBmcm9tICcuL21vZGlmaWVycy9PckVxdWFsJzsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRXh0ZW5zaW9ucy50c1wiIC8+XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG4vKipcbiAqIFRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAbW9kdWxlIFBhcnNlclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNxbCAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZm91bmQgaW4gdGhlIFNRaWdnTCBxdWVyeVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IHN0YWNrICAgICAgLSBDb21tYW5kIHN0YWNrIGZvciBzdG9yaW5nIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGVycm9yICAgICAgICAgLSBFcnJvciBzdHJpbmcgaWYgYW55IGVycm9ycyBhcmUgZm91bmQgaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXTtcblx0cHVibGljIHN0YWNrOiBDb21tYW5kW107XG4gICAgcHVibGljIGVycm9yOiBzdHJpbmc7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBzcWw6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG5cdFx0dGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgZXh0cmFjdChzcWw6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTpDb21tYW5kW117XG5cdFx0dmFyIG1hdGNoLCBjb21tYW5kczogQ29tbWFuZFtdID0gW10sIHN0YWNrOiBDb21tYW5kW10gPSBbXTtcblx0XHRDb21tYW5kLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUoKG1hdGNoID0gQ29tbWFuZC5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpe1xuXHRcdFx0dmFyIGZvdW5kID0gbmV3IENvbW1hbmQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpO1xuXHRcdFx0aWYoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuZGVwZW5kZW50KGZvdW5kLmFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHRzdGFjay5sYXN0KCkuZGVwZW5kZW50cy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgIXN0YWNrLmxhc3QoKS5hY3Rpb24udGVybWluYXRvcikge1xuXHRcdFx0XHRzdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0c3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0c3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdGNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGFyc2UoKTogc3RyaW5nIHtcblx0XHR2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBpZih0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuc3FsO1xuXHRcdGZvcih2YXIgY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcblx0XHRcdHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0xKTtcblx0XHRcdHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgVmFyaWFibGVSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlcic7IiwiaW1wb3J0IHtwYXJzZSBhcyBQYXJzZX0gZnJvbSAnLi9NYWluJztcbmxldCBTUWlnZ0wgPSB7XG4gICAgcGFyc2U6IFBhcnNlLFxuICAgIHZlcnNpb246ICcwLjEuMCcsXG4gICAgLy9leHRlbmQ6IEV4dGVuZFxufTtcbmlmKHdpbmRvdykgd2luZG93WydTUWlnZ0wnXSA9IFNRaWdnTDtcbmV4cG9ydCBkZWZhdWx0IFNRaWdnTDsiLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBJQWN0aW9uIGZyb20gJy4vSUFjdGlvbic7XG5pbXBvcnQgSVBlcmZvcm1SZXN1bHQgZnJvbSAnLi4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgRXJyb3JzIGZyb20gJy4uL0Vycm9ycyc7XG5pbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBFbHNlIGFjdGlvblxuICogQG1vZHVsZSBFbHNlXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kICAgICAgICAgICAgIC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgICAgLSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgICAgIC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCAgICAgICAgICAtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgIC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxzZSBpbXBsZW1lbnRzIElBY3Rpb24ge1xuXHQvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvXlxccyplbHNlXFxiL2k7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjb25kaXRpb25zID0gW107XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQWN0aW9uW119IEFycmF5IG9mIGRlcGVuZGVudCBhY3Rpb25zXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgZGVwZW5kZW50cyA9IFtdO1xuXHRwdWJsaWMgdGVybWluYXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyB2YXJpYWJsZTogYW55O1xuXHRwdWJsaWMgY29uZGl0aW9uOiBJQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBzdXBwb3J0ZXI6IENvbW1hbmQ7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjb21tYW5kOiBDb21tYW5kLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0fVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBmb3IgYW55IGtub3duIHN5bnRheCBlcnJvcnMgcmVnYXJkaW5nIHRoaXMgYWN0aW9uXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICBpZighdGhpcy5zdXBwb3J0ZXIpIHJldHVybiBFcnJvcnMuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9XG5cdC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG5cdCAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0ge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cblx0cHVibGljIHBlcmZvcm0ocHJldlBhc3NlZDogYm9vbGVhbiA9IGZhbHNlKTogSVBlcmZvcm1SZXN1bHR7XG5cdFx0cmV0dXJuICFwcmV2UGFzc2VkID8ge3Jlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlfSA6IHtyZXN1bHQ6ICcnLCBwYXNzZWQ6IGZhbHNlfTtcblx0fVxufSIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi4vRXJyb3JzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIEVuZElmIGFjdGlvblxuICogQG1vZHVsZSBFbmRJZlxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyBJQWN0aW9uIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZElmIGltcGxlbWVudHMgSUFjdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvXlxccyplbmRpZlxcYi9pO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQWN0aW9uW119IEFycmF5IG9mIGRlcGVuZGVudCBhY3Rpb25zXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgZGVwZW5kZW50cyA9IFtdO1xuXHRwdWJsaWMgdGVybWluYXRvcjogYm9vbGVhbiA9IHRydWU7XG4gICAgcHVibGljIHZhcmlhYmxlOiBhbnk7XG4gICAgcHVibGljIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBwdWJsaWMgc3VwcG9ydGVyOiBDb21tYW5kO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY29tbWFuZDogQ29tbWFuZCwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdH1cblx0LyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZSgpOiBzdHJpbmd7XG4gICAgICAgIGlmKCF0aGlzLnN1cHBvcnRlcikgcmV0dXJuIEVycm9ycy5JbmNvcnJlY3RTdGF0ZW1lbnQodGhpcywgdGhpcy5zdGF0ZW1lbnQpO1xuICAgIH1cbiAgICAvKipcblx0ICogUGVyZm9ybSB0aGUgYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdCB7XG5cdFx0cmV0dXJuIHtyZXN1bHQ6IHRoaXMuaW5uZXIsIHBhc3NlZDogdHJ1ZX07XG5cdH0gICAgXG59IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSVBlcmZvcm1SZXN1bHQgZnJvbSAnLi4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBpbnRlcmZhY2UgZm9yIGFsbCBhY3Rpb25zIHRvIGFkaGVyZSB0b1xuICogQGludGVyZmFjZSBJQWN0aW9uXG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgXHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyIFx0XHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuaW50ZXJmYWNlIElBY3Rpb24ge1xuICAgIC8vIHN0YXRpYyByZWdleDogUmVnRXhwO1xuICAgIC8vIHN0YXRpYyBjb25kaXRpb25zOiBJQ29uZGl0aW9uW107XG5cdC8vIHN0YXRpYyBkZXBlbmRlbnRzOiBJQWN0aW9uW107XG5cdHRlcm1pbmF0b3I6IGJvb2xlYW47XG4gICAgdmFyaWFibGU6IGFueTtcbiAgICBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgc3VwcG9ydGVyOiBDb21tYW5kO1xuICAgIGNvbW1hbmQ6IENvbW1hbmQ7XG4gICAgc3RhdGVtZW50OiBzdHJpbmc7XG4gICAgaW5uZXI6IHN0cmluZztcbiAgICB2YXJpYWJsZXM6IElWYXJpYWJsZXM7XG5cdC8qKlxuXHQgKiBAbWV0aG9kXG4gICAgICogQG1lbWJlcm9mIElBY3Rpb25cblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXG5cdCAqIEByZXR1cm5zIElQZXJmb3JtUmVzdWx0IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG4gICAgdmFsaWRhdGUoKTpzdHJpbmc7XG5cdHBlcmZvcm0ocHJldlBhc3NlZD86IGJvb2xlYW4pOiBJUGVyZm9ybVJlc3VsdDtcbn1cbmV4cG9ydCBkZWZhdWx0IElBY3Rpb247IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50c1wiIC8+XG5pbXBvcnQge0Vsc2UsIEVuZElmfSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCB7SXNOdWxsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIEVxdWFsfSBmcm9tICcuLi9Db25kaXRpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIElmIGFjdGlvblxuICogQG1vZHVsZSBJZlxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJZiBpbXBsZW1lbnRzIElBY3Rpb24ge1xuXHQvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL15cXHMqaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgY29uZGl0aW9ucyA9IFtJc051bGwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgRXF1YWxdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW0Vsc2UsIEVuZElmXTtcblx0cHVibGljIHRlcm1pbmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHVibGljIHZhcmlhYmxlOiBhbnk7XG5cdHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdHRoaXMuY29uZGl0aW9uID0gdGhpcy5leHRyYWN0Q29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcblx0fVxuXHQvKipcblx0ICogVHJ5IGFuZCBsb2NhdGUgYSBtYXRjaGluZyBjb25kaXRpb24gZnJvbSB0aGUgYXZhaWxhYmxlIGNvbmRpdGlvbnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgcmV0dXJuIG51bGwuXG4gICAgICogQG1lbWJlcm9mIElmXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50XHRcdC0gU3RhdGVtZW50IHRvIGNoZWNrIGNvbmRpdGlvbnMgYWdhaW5zdFxuXHQgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0LSBMaXN0IG9mIHZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG5cdCAqIEByZXR1cm5zIHtJQ29uZGl0aW9uIHwgbnVsbH1cdFx0LSBDb25kaXRpb24gdGhhdCBtYXRjaGVzIHdpdGhpbiB0aGUgc3RhdGVtZW50XG5cdCAqL1xuXHRwdWJsaWMgZXh0cmFjdENvbmRpdGlvbihzdGF0ZW1lbnQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHRmb3IodmFyIGNvbmRpdGlvbiBvZiBJZi5jb25kaXRpb25zKXtcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IGNvbmRpdGlvbi5leHRyYWN0KHN0YXRlbWVudCwgdmFyaWFibGVzKTtcbiAgICAgICAgICAgIGlmKG1hdGNoKSByZXR1cm4gbWF0Y2g7XG5cdFx0XHQvLyB2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goY29uZGl0aW9uLnJlZ2V4KTtcblx0XHRcdC8vIGlmKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDApIHJldHVybiBuZXcgY29uZGl0aW9uKG1hdGNoWzFdLCB2YXJpYWJsZXMsIG1hdGNoWzRdLCBtYXRjaFsyXSwgbWF0Y2hbM10pO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBmb3IgYW55IGtub3duIHN5bnRheCBlcnJvcnMgcmVnYXJkaW5nIHRoaXMgYWN0aW9uXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsaWRhdGUoKTpzdHJpbmd7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblx0LyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIElmXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG5cdCAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0ge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cblx0cHVibGljIHBlcmZvcm0ocHJldlBhc3NlZDogYm9vbGVhbiA9IGZhbHNlKTogSVBlcmZvcm1SZXN1bHR7XG5cdFx0cmV0dXJuIHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKVx0XG5cdFx0XHRcdD8ge3Jlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlfSBcblx0XHRcdFx0OiB7cmVzdWx0OiB0aGlzLmNvbW1hbmQudGVybWluYXRpb24oKSwgcGFzc2VkOiBmYWxzZX07XG5cdH1cbn0iLCJpbXBvcnQge0lNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0ICcuLi9FeHRlbnNpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZGl0aW9uIHtcbiAgICBwdWJsaWMgc3RhdGljIG1vZHMoa2xhc3Mpe1xuICAgICAgICByZXR1cm4ga2xhc3MubW9kaWZpZXJzLm1hcCh4ID0+IGAke3guaWRlbnRpZmllcnMubWFwKGlkID0+IGlkLnNvdXJjZSkuam9pbignfCcpfWApLmpvaW4oJ3wnKTtcbiAgICB9XG4gICAgcHVibGljIGV4dHJhY3RNb2RpZmllcnMoa2xhc3MsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKTogYW55W117XG4gICAgICAgIGlmKCFtb2QxICYmICFtb2QyKSByZXR1cm4gW107XG4gICAgICAgIGxldCBhcnJheSA9IFtdLCBjb3VudCA9IDA7XG4gICAgICAgIGlmKG1vZDEpIGNvdW50Kys7XG4gICAgICAgIGlmKG1vZDIpIGNvdW50Kys7XG4gICAgICAgIGZvcihsZXQgbW9kIG9mIGtsYXNzLm1vZGlmaWVycyl7XG4gICAgICAgICAgICBmb3IobGV0IGlkZW50aWZpZXIgb2YgbW9kLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgICAgICBpZihtb2QxICYmIGlkZW50aWZpZXIudGVzdChtb2QxKSkgYXJyYXlbMF0gPSBtb2Q7XG4gICAgICAgICAgICAgICAgaWYobW9kMiAmJiBpZGVudGlmaWVyLnRlc3QobW9kMikpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlbIW1vZDEgPyAwIDogMV0gPSBtb2Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGFycmF5Lmxlbmd0aCA9PT0gY291bnQgJiYgYXJyYXkuaXNGdWxsKCkpIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICAgIHB1YmxpYyBwZXJmb3JtTW9kaWZpZXJzKG1vZGlmaWVyczogSU1vZGlmaWVyW10sIHJlc3VsdDogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBjb21wYXJhdGl2ZTogc3RyaW5nKTogYm9vbGVhbntcbiAgICAgICAgaWYobW9kaWZpZXJzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgbGV0IGk7XG4gICAgICAgIGZvcihpPW1vZGlmaWVycy5sZW5ndGggLSAxO2k+LTE7LS1pKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IG1vZGlmaWVyc1tpXS5wZXJmb3JtKHJlc3VsdCwgdmFyaWFibGUsIHZhcmlhYmxlcywgY29tcGFyYXRpdmUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtJTW9kaWZpZXIsIE5vdCwgT3JFcXVhbH0gZnJvbSAnLi4vTW9kaWZpZXJzJztcblxuLyoqXG4gKiBUaGUgPT0gY29uZGl0aW9uXG4gKiBAbW9kdWxlIEVxdWFsXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXF1YWwgZXh0ZW5kcyBDb25kaXRpb24gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRXF1YWxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZmllcnMgPSBbTm90LCBPckVxdWFsXTtcblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cChgKFxcXFx3KylcXFxccysoKD86JHtFcXVhbC5tb2RzKEVxdWFsKX18XFxcXHMqKSk9KCg/OiR7RXF1YWwubW9kcyhFcXVhbCl9fFxcXFxzKikpXFxcXHMrKFxcXFxkK3xbXCInXVxcXFx3K1tcIiddKWAsICdpJyk7XG4gICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gdGhpcy5leHRyYWN0TW9kaWZpZXJzKEVxdWFsLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0KHN0YXRlbWVudDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuICAgICAgICBsZXQgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goRXF1YWwucmVnZXgpO1xuICAgICAgICBpZihtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAwKSByZXR1cm4gbmV3IEVxdWFsKG1hdGNoWzFdLCB2YXJpYWJsZXMsIG1hdGNoWzRdLCBtYXRjaFsyXSwgbWF0Y2hbM10pO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSA9PT0gdGhpcy5jb21wYXJhdGl2ZTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJ1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllciwgTm90LCBPckVxdWFsfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuXG4vKipcbiAqIFRoZSA+IGNvbmRpdGlvblxuICogQG1vZHVsZSBHcmVhdGVyVGhhblxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWF0ZXJUaGFuIGV4dGVuZHMgQ29uZGl0aW9uIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW05vdCwgT3JFcXVhbF07XG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoYChcXFxcdyspXFxcXHMrKCg/OiR7R3JlYXRlclRoYW4ubW9kcyhHcmVhdGVyVGhhbil9fFxcXFxzKikpPigoPzoke0dyZWF0ZXJUaGFuLm1vZHMoR3JlYXRlclRoYW4pfXxcXFxccyopKVxcXFxzKyhcXFxcZCspYCwgJ2knKTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKEdyZWF0ZXJUaGFuLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0KHN0YXRlbWVudDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuICAgICAgICBsZXQgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goR3JlYXRlclRoYW4ucmVnZXgpO1xuICAgICAgICBpZihtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAwKSByZXR1cm4gbmV3IEdyZWF0ZXJUaGFuKG1hdGNoWzFdLCB2YXJpYWJsZXMsIG1hdGNoWzRdLCBtYXRjaFsyXSwgbWF0Y2hbM10pO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgIGxldCByZXN1bHQgPSBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPiBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDsgXG5cdH1cbn0iLCJpbnRlcmZhY2UgSUNvbmRpdGlvbiB7XG4gICAgLy9zdGF0aWMgcmVnZXg6IFJlZ0V4cDtcbiAgICAvL3N0YXRpYyBtb2RpZmllcnM6IElNb2RpZmllcltdO1xuXHQvL3N0YXRpYyBjcmVhdGUoc3RhdGVtZW50OiBzdHJpbmcpOiBJQ29uZGl0aW9uO1xuXHRwZXJmb3JtKCk6Ym9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb247IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtJTW9kaWZpZXIsIE5vdH0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBJcyBOdWxsIGNvbmRpdGlvblxuICogQG1vZHVsZSBJc051bGxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJc051bGwgZXh0ZW5kcyBDb25kaXRpb24gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOdWxsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtOb3RdO1xuICAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzK2lzXFxcXHMrKCg/OiR7SXNOdWxsLm1vZHMoSXNOdWxsKX18XFxcXHMqKSludWxsXFxcXHMqYCwgJ2knKTtcbiAgICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcbiAgICAgY29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgICBzdXBlcigpO1xuICAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKElzTnVsbCwgbW9kMSwgbW9kMik7XG4gICAgIH1cbiAgICAgXG4gICAgIHB1YmxpYyBzdGF0aWMgZXh0cmFjdChzdGF0ZW1lbnQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcbiAgICAgICAgIGxldCBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChJc051bGwucmVnZXgpO1xuICAgICAgICAgaWYobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMCkgcmV0dXJuIG5ldyBJc051bGwobWF0Y2hbMV0sIHZhcmlhYmxlcywgbnVsbCwgbWF0Y2hbMl0sIG51bGwpO1xuICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgIH1cbiAgICAgXG4gICAgIC8qKlxuICAgICAgKiBAbWVtYmVyb2YgSXNOdWxsXG4gICAgICAqIEBtZXRob2RcbiAgICAgICogQHB1YmxpY1xuICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAgKi9cbiAgICAgIHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcbiAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gPT0gbnVsbDtcbiAgICAgICAgICByZXN1bHQgPSB0aGlzLnBlcmZvcm1Nb2RpZmllcnModGhpcy5tb2RpZmllcnMsIHJlc3VsdCwgdGhpcy52YXJpYWJsZSwgdGhpcy52YXJpYWJsZXMsIHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG59IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbic7XG5pbXBvcnQge0lNb2RpZmllciwgTm90LCBPckVxdWFsfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuXG4vKipcbiAqIFRoZSA8IGNvbmRpdGlvblxuICogQG1vZHVsZSBMZXNzVGhhblxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlc3NUaGFuIGV4dGVuZHMgQ29uZGl0aW9uIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIExlc3NUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW05vdCwgT3JFcXVhbF07XG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoYChcXFxcdyspXFxcXHMrKCg/OiR7TGVzc1RoYW4ubW9kcyhMZXNzVGhhbil9fFxcXFxzKikpPCgoPzoke0xlc3NUaGFuLm1vZHMoTGVzc1RoYW4pfXxcXFxccyopKVxcXFxzKyhcXFxcZCspYCwgJ2knKTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSB0aGlzLmV4dHJhY3RNb2RpZmllcnMoTGVzc1RoYW4sIG1vZDEsIG1vZDIpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3Qoc3RhdGVtZW50OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG4gICAgICAgIGxldCBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChMZXNzVGhhbi5yZWdleCk7XG4gICAgICAgIGlmKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDApIHJldHVybiBuZXcgTGVzc1RoYW4obWF0Y2hbMV0sIHZhcmlhYmxlcywgbWF0Y2hbNF0sIG1hdGNoWzJdLCBtYXRjaFszXSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRsZXQgcmVzdWx0ID0gcGFyc2VJbnQodGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0pIDwgcGFyc2VJbnQodGhpcy5jb21wYXJhdGl2ZSk7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMucGVyZm9ybU1vZGlmaWVycyh0aGlzLm1vZGlmaWVycywgcmVzdWx0LCB0aGlzLnZhcmlhYmxlLCB0aGlzLnZhcmlhYmxlcywgdGhpcy5jb21wYXJhdGl2ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cdH1cbn0iLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElNb2RpZmllciB7XG4gICAgaWRlbnRpZmllcnM6IFJlZ0V4cFtdO1xuICAgIHBlcmZvcm0ocmVzdWx0OmJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcywgY29tcGFyYXRpdmU6IHN0cmluZyk6Ym9vbGVhbjtcbiAgICBtYXRjaGVzKGl0ZW06IHN0cmluZyk6Ym9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElNb2RpZmllcjsiLCJpbXBvcnQgSU1vZGlmaWVyIGZyb20gJy4vSU1vZGlmaWVyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuY29uc3QgTm90OklNb2RpZmllciA9IHtcbiAgICBpZGVudGlmaWVyczogWy8hL2ksIC8oPzpcXGJ8XFxzKylub3QoPzpcXGJ8XFxzKykvaV0sXG4gICAgcGVyZm9ybTogKHJlc3VsdDogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBjb21wYXJhdGl2ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7cmV0dXJuICFyZXN1bHQ7fSxcbiAgICBtYXRjaGVzOiAoaXRlbSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBmb3IobGV0IGlkZW50aWZpZXIgb2YgTm90LmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgIGlmKGlkZW50aWZpZXIudGVzdChpdGVtKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IE5vdDsiLCJpbXBvcnQgSU1vZGlmaWVyIGZyb20gJy4vSU1vZGlmaWVyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuY29uc3QgT3JFcXVhbDogSU1vZGlmaWVyID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcGVyZm9ybTogKHJlc3VsdDogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBjb21wYXJhdGl2ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgdmFyaWFibGVzW3ZhcmlhYmxlXSA9PT0gY29tcGFyYXRpdmU7XG4gICAgfSxcbiAgICBtYXRjaGVzOiAoaXRlbSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBmb3IobGV0IGlkZW50aWZpZXIgb2YgT3JFcXVhbC5pZGVudGlmaWVycyl7XG4gICAgICAgICAgICBpZihpZGVudGlmaWVyLnRlc3QoaXRlbSkpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBPckVxdWFsOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5pbnRlcmZhY2UgSVJlcGxhY2VyIHtcbiAgICAvL3N0YXRpYyByZWdleDogUmVnRXhwO1xuICAgIC8vc3RhdGljIHJlcGxhY2UodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJUmVwbGFjZXI7IiwiaW1wb3J0IElSZXBsYWNlciBmcm9tICcuL0lSZXBsYWNlcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuLyoqXG4gKiBUaGUgdmFyaWFibGUgcmVwbGFjZXIgZm9yIGVtYmVkZGVkIFNRaWdnTCB2YXJpYWJsZXNcbiAqIEBtb2R1bGUgVmFyaWFibGVSZXBsYWNlclxuICogQHN0YXRpY1xuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SVJlcGxhY2VyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYXJpYWJsZVJlcGxhY2VyIGltcGxlbWVudHMgSVJlcGxhY2VyIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgVmFyaWFibGVSZXBsYWNlclxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhbXntdfF4pe3soPyF7KVxccyooXFx3KilcXHMqfX0oPyF9KS9nO1xuXHQvKipcbiAgICAgKiBAbWVtYmVyb2YgVmFyaWFibGVSZXBsYWNlclxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgICAgICAgICAgICAgLSBUZXh0IHRvIHNlYXJjaCBmb3IgcmVwbGFjZW1lbnRzXG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgIC0gVGhlIHN0cmluZyB3aXRoIHZhcmlhYmxlcyByZXBsYWNlZCBcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZXBsYWNlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHRcdHJldHVybiB0ZXh0LnJlcGxhY2UodGhpcy5yZWdleCwgKG1hdGNoLCAkMSwgJDIpID0+ICQxK3ZhcmlhYmxlc1skMl0pO1xuXHR9XG59Il19
