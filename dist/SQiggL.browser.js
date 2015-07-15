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

},{"./conditions/Condition":18,"./conditions/Equal":19,"./conditions/GreaterThan":20,"./conditions/IsNull":22,"./conditions/LessThan":24}],5:[function(require,module,exports){
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

},{"./modifiers/Not":26,"./modifiers/OrEqual":27}],11:[function(require,module,exports){
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

},{"./replacers/VariableReplacer":29}],13:[function(require,module,exports){
var Main_1 = require('./Main');
var SQiggL = {
    parse: Main_1.parse,
    version: '0.1.0'
};
if (typeof window !== 'undefined')
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
 * The len> condition
 * @module LengthGreaterThan
 * @class
 * @extends {Condition}
 * @implements {ICondition}
 * @param {string} variable             - Variable to test condition against
 * @param {IVariables} variables        - Variables within the scope of this condition
 * @param {string} comparative          - Value to compare variable against
 * @param {string} mod1                 - Identifier of first modifier, or null
 * @param {string} mod2                 - Identifier of second modifier, or null
 * @property {string} variable          - Variable to test condition against
 * @property {IVariables} variables     - Variables within the scope of this condition
 * @property {string} comparative       - Value to compare variable against
 * @property {string} mod1              - Identifier of first modifier, or null
 * @property {string} mod2              - Identifier of second modifier, or null
 * @property {IModifier[]} modifiers    - Array of modifiers found in condition, in order
 */
var LengthGreaterThan = (function (_super) {
    __extends(LengthGreaterThan, _super);
    function LengthGreaterThan(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = _super.prototype.extractModifiers.call(this, LengthGreaterThan, mod1, mod2);
    }
    /**
     * Extracts the variable, comparative, and any modifiers in the condition
     * @memberof LengthGreaterThan
     * @static
     * @method
     * @returns {LengthGreaterThan | null} Instance of LengthGreaterThan ready for execution
     */
    LengthGreaterThan.extract = function (statement, variables) {
        var match = statement.match(LengthGreaterThan.regex);
        if (match && match.length > 0)
            return new LengthGreaterThan(match[1], variables, match[4], match[2], match[3]);
        return null;
    };
    /**
     * @memberof LengthGreaterThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    LengthGreaterThan.prototype.perform = function () {
        var result = this.variables[this.variable].length > parseInt(this.comparative);
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof LengthGreaterThan
     * @static
     * @property {IModifier[]} Array of possible modifiers to check against
     */
    LengthGreaterThan.modifiers = [Modifiers_1.Not, Modifiers_1.OrEqual];
    /**
     * @memberof LengthGreaterThan
     * @static
     * @property {RegExp} The regex matcher
     */
    LengthGreaterThan.regex = new RegExp("(\\w+)\\s+((?:" + LengthGreaterThan.mods(LengthGreaterThan) + "|\\s*))len>((?:" + LengthGreaterThan.mods(LengthGreaterThan) + "|\\s*))\\s+(\\d+)", 'i');
    return LengthGreaterThan;
})(Condition_1["default"]);
exports["default"] = LengthGreaterThan;

},{"../Modifiers":10,"./Condition":18}],24:[function(require,module,exports){
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

},{"../Modifiers":10,"./Condition":18}],25:[function(require,module,exports){

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){

},{}],29:[function(require,module,exports){
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

},{}]},{},[1,14,15,16,17,2,3,4,18,19,20,21,22,23,24,5,6,7,8,9,10,25,26,27,11,12,28,29,13])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRTY29wZS50cyIsInNyYy9Db25kaXRpb25zLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lQZXJmb3JtUmVzdWx0LnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2VyLnRzIiwic3JjL1JlcGxhY2Vycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvYWN0aW9ucy9FbHNlLnRzIiwic3JjL2FjdGlvbnMvRW5kSWYudHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSWYudHMiLCJzcmMvY29uZGl0aW9ucy9Db25kaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9FcXVhbC50cyIsInNyYy9jb25kaXRpb25zL0dyZWF0ZXJUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0lzTnVsbC50cyIsInNyYy9jb25kaXRpb25zL0xlbmd0aEdyZWF0ZXJUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvTGVzc1RoYW4udHMiLCJzcmMvbW9kaWZpZXJzL0lNb2RpZmllci50cyIsInNyYy9tb2RpZmllcnMvTm90LnRzIiwic3JjL21vZGlmaWVycy9PckVxdWFsLnRzIiwic3JjL3JlcGxhY2Vycy9JUmVwbGFjZXIudHMiLCJzcmMvcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxtSEFBbUg7QUFDbkgsc0JBQStCLGlCQUFpQixDQUFDO0FBQXpDLGdDQUF5QztBQUNqRCxxQkFBOEIsZ0JBQWdCLENBQUM7QUFBdkMsOEJBQXVDO0FBQy9DLG1C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TUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFLLE9BQUEsRUFBRSxHQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFoQkU7Ozs7T0FJRztJQUNRLHNCQUFLLEdBQVcsb0NBQW9DLENBQUM7SUFZcEUsdUJBQUM7QUFBRCxDQWxCQSxBQWtCQyxJQUFBO0FBbEJELHFDQWtCQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE5vdGU6IFRoZXNlIGFyZSBsb2FkZWQgaW4gb3JkZXIsIG1ha2Ugc3VyZSBhbnkgZGVwZW5kZW50IGFjdGlvbnMgYXJlIGxpc3RlZCBhYm92ZSB0aGUgYWN0aW9uIHRoYXQgcmVxdWlyZXMgdGhlbS5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBFbmRJZn0gZnJvbSAnLi9hY3Rpb25zL0VuZElmJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBFbHNlfSBmcm9tICcuL2FjdGlvbnMvRWxzZSc7XG5leHBvcnQge2RlZmF1bHQgYXMgSWZ9IGZyb20gJy4vYWN0aW9ucy9JZic7IiwiaW1wb3J0IHtJZiwgRWxzZSwgRW5kSWZ9IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZFNjb3BlIGZyb20gJy4vQ29tbWFuZFNjb3BlJztcbmltcG9ydCB7VmFyaWFibGVSZXBsYWNlcn0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbi8qKlxuICogQ29tbWFuZCBvYmplY3QgcmVzcG9uc2libGUgZm9yIGhhbmRsaW5nIGFsbCBhY3Rpb25zLCBjb25kaXRpb25zLCBhbmQgdmFyaWFibGVzIHdpdGhpbiBpdCdzIHNlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gKiBAbW9kdWxlIENvbW1hbmRcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4ICAgICAgICAgICAgICAgIC0gQmVnaW5uaW5nIGluZGV4IG9mIHRoZSBjb21tYW5kIGluIHRoZSBvcmlnaW5hbCBxdWVyeSBzdHJpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggICAgICAgICAgICAgICAtIExlbmd0aCBvZiB0aGUgc2VjdGlvbiBvZiB0aGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgICAgIC0gU3RhdGVtZW50IHdpdGhpbiB0aGUgJ3t7JSAlfX0nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgICAgIC0gVGV4dCB0aGF0IGltbWVkaWF0ZWx5IGZvbGxvd3MgdGhlIHN0YXRlbWVudCB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBpbmRleCAgICAgICAgICAgICAtIEJlZ2lubmluZyBpbmRleCBvZiB0aGUgY29tbWFuZCBpbiB0aGUgb3JpZ2luYWwgcXVlcnkgc3RyaW5nXG4gKiBAcHJvcGVydHkge251bWJlcn0gbGVuZ3RoICAgICAgICAgICAgLSBMZW5ndGggb2YgdGhlIHNlY3Rpb24gb2YgdGhlIG9yaWdpbmFsIHN0cmluZyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAtIFN0YXRlbWVudCB3aXRoaW4gdGhlICd7eyUgJX19JyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAtIFRleHQgdGhhdCBpbW1lZGlhdGVseSBmb2xsb3dzIHRoZSBzdGF0ZW1lbnQgdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gYWN0aW9ucyAgICAgICAgLSBBcnJheSBvZiBhY3Rpb25zIGF2YWlsYWJsZSB0byBTUWlnZ0xcbiAqIEBwcm9wZXJ0eSB7SVJlcGxhY2VyW119IHJlcGxhY2VycyAgICAtIEFycmF5IG9mIHJlcGxhY2VycyBhdmFpbGFibGUgdG8gU1FpZ2dMXG4gKiBAcHJvcGVydHkge0NvbW1hbmRTY29wZX0gc2NvcGUgICAgICAgLSBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kLCBzdWNoIGFzIGF2YWlsYWJsZSB2YXJpYWJsZXMge0BzZWUgQ29tbWFuZFNjb3BlfVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGRlcGVuZGVudHMgICAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZGVwZW5kZW50IHRvIHRoaXMgY29tbWFuZCAgICAgICAgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmQge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAve3slKC4qPyklfX0oW1xcc1xcU10qPyk/KD89KD86e3slfCQpKS9nbTtcblx0cHVibGljIGFjdGlvbnM6IGFueVtdID0gW0lmLCBFbHNlLCBFbmRJZl07XG5cdHB1YmxpYyByZXBsYWNlcnMgPSBbVmFyaWFibGVSZXBsYWNlcl07XG5cdHB1YmxpYyBhY3Rpb246IElBY3Rpb247XG5cdHB1YmxpYyBzY29wZTogQ29tbWFuZFNjb3BlID0gbmV3IENvbW1hbmRTY29wZSgpO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbGVuZ3RoOm51bWJlciwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHR0aGlzLnNjb3BlLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0XHR0aGlzLmFjdGlvbiA9IHRoaXMuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuXHR9XG5cdC8qKlxuICAgICAqIEV4dHJhY3QgYWN0aW9ucyBmcm9tIHRoZSBzdGF0ZW1lbnRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgLSBTdGF0ZW1lbnQgdG8gZXh0cmFjdCB0aGUgYWN0aW9ucyBmcm9tXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgLSBJbm5lciB0ZXh0IGZvciB0aGUgY29tbWFuZFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gICAgICogQHJldHVybnMge0lBY3Rpb24gfCBudWxsfSAgICAgICAgLSBUaGUgbWF0Y2hpbmcgYWN0aW9uIG9yIG51bGwgaWYgbm8gYWN0aW9uIHdhcyBmb3VuZFxuICAgICAqL1x0XG5cdHB1YmxpYyBleHRyYWN0KHN0YXRlbWVudDogc3RyaW5nLCBpbm5lcjogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBJQWN0aW9ue1xuXHRcdGZvcih2YXIgYWN0aW9uIG9mIHRoaXMuYWN0aW9ucyl7XG5cdFx0XHRpZihhY3Rpb24ucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpIHJldHVybiBuZXcgYWN0aW9uKHRoaXMsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGNvbW1hbmQgYW5kIHJldHVybiB0aGUgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFzc2VkICAgICAgLSBJZiB0aGUgY29tbWFuZCBpcyBhIGRlcGVuZGVudCB0aGVuIHRoaXMgd2lsbCByZWZsZWN0IGlmIHRoZSBwcmV2aW91cyBjb21tYW5kIHN1Y2NlZWRlZCBvciBmYWlsZWRcbiAgICAgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9ICAgIC0gVGhlIHJlc3VsdCBvZiB0aGUgY29tbWFuZCBleGVjdXRpb24ge0BzZWUgSVBlcmZvcm1SZXN1bHR9XG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKHBhc3NlZDogYm9vbGVhbik6IElQZXJmb3JtUmVzdWx0IHtcblx0XHR2YXIgcmVzdWx0OiBJUGVyZm9ybVJlc3VsdCA9IHRoaXMuYWN0aW9uLnBlcmZvcm0ocGFzc2VkKTtcblx0XHRyZXN1bHQucmVzdWx0ICs9IHRoaXMucGVyZm9ybURlcGVuZGVudHMocmVzdWx0LnBhc3NlZCk7XG5cdFx0Zm9yKHZhciByZXBsYWNlciBvZiB0aGlzLnJlcGxhY2Vycyl7XG5cdFx0XHRyZXN1bHQucmVzdWx0ID0gcmVwbGFjZXIucmVwbGFjZShyZXN1bHQucmVzdWx0LCB0aGlzLnNjb3BlLnZhcmlhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZCAoc3ViLWNvbW1hbmRzKVxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBzdWItY29tbWFuZCdzIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybVNjb3BlKCk6IHN0cmluZyB7XG5cdFx0dmFyIHJldDogc3RyaW5nID0gJycsIHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0XHRmb3IodmFyIGNvbW1hbmQgb2YgdGhpcy5zY29wZS5jb21tYW5kcyl7XG5cdFx0XHR2YXIgcmVzdWx0ID0gY29tbWFuZC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuXHRcdFx0cHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG5cdFx0XHRyZXQgKz0gcmVzdWx0LnJlc3VsdDtcblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIGNvbW1hbmRzIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGNvbW1hbmRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkICAtIElmIHRoaXMgY29tbWFuZCBpcyBhIGRlcGVuZGVudCB0aGVuIHRoaXMgd2lsbCByZWZsZWN0IGlmIHRoZSBwcmV2aW91cyBjb21tYW5kIHN1Y2NlZWRlZCBvciBmYWlsZWRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBkZXBlbmRlbnQgZXhlY3V0aW9ucyAoY29sbGVjdGl2ZWx5KVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybURlcGVuZGVudHMocHJldlBhc3NlZDogYm9vbGVhbik6IHN0cmluZyB7XG5cdFx0dmFyIHJldDogc3RyaW5nID0gJyc7XG5cdFx0Zm9yKHZhciBkZXBlbmRlbnQgb2YgdGhpcy5kZXBlbmRlbnRzKXtcblx0XHRcdHZhciByZXN1bHQgPSBkZXBlbmRlbnQucGVyZm9ybShwcmV2UGFzc2VkKTtcblx0XHRcdHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuXHRcdFx0cmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSB0aGUgdGVybWluYXRpb24gb2YgdGhlIGNvbW1hbmQncyBhY3Rpb25zIGlmIG5lZWRlZCAoRm9yIGV4YW1wbGUgXCJFbmRJZlwiIGlzIGEgdGVybWluYXRvciBvZiBcIklmXCIsIHNvIHRoaXMgZXNzZW50aWFsbHkgbWVhbnMgdG8ganVzdCBwcmludCBvdXQgdGhlIHN0cmluZyB0aGF0IGZvbGxvd3MgXCJFbmRJZlwiKVxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBhY3Rpb24ncyB0ZXJtaW5hdG9yXG4gICAgICovXG5cdHB1YmxpYyB0ZXJtaW5hdGlvbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlLmNvbW1hbmRzLnNvbWUoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yKVxuXHRcdD8gdGhpcy5zY29wZS5jb21tYW5kcy5maWx0ZXIoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yKVsxXS5wZXJmb3JtKGZhbHNlKS5yZXN1bHRcblx0XHQ6ICcnO1xuXHR9XG5cdC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBpbnB1dHRlZCBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgdGhlIGFjdGlvbiBmb3IgdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAtIFRoZSBhY3Rpb24gdG8gY2hlY2sgaWYgaXQgaXMgYSBkZXBlbmRlbnQgb2YgdGhpcyBjb21tYW5kJ3MgYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiB0aGlzIGNvbW1hbmQncyBhY3Rpb24gXG4gICAgICovXG5cdHB1YmxpYyBkZXBlbmRlbnQoYWN0aW9uOiBJQWN0aW9uKTogYm9vbGVhbiB7XG5cdFx0Zm9yKHZhciBkZXBlbmRlbnQgb2YgdGhpcy5hY3Rpb24uY29uc3RydWN0b3JbJ2RlcGVuZGVudHMnXSl7XG5cdFx0XHRpZihhY3Rpb24gaW5zdGFuY2VvZiA8YW55PmRlcGVuZGVudCkgcmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuLyoqXG4gKiBUaGUgQ29tbWFuZCBTY29wZSBvYmplY3RcbiAqIEBtb2R1bGUgQ29tbWFuZFNjb3BlXG4gKiBAY2xhc3NcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gSG9sZHMgdmFyaWFibGVzIGZvciB0aGUgc2NvcGVcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgd2l0aGluIHRoZSBzY29wZVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBkZXBlbmRlbnQgY29tbWFuZHMgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRTY29wZSB7XG5cdHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7fTtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBJQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBJc051bGx9IGZyb20gJy4vY29uZGl0aW9ucy9Jc051bGwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIExlc3NUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW4nO1xuLy8gZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFuT3JFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0dyZWF0ZXJUaGFuT3JFcXVhbCc7XG4vLyBleHBvcnQge2RlZmF1bHQgYXMgTGVzc1RoYW5PckVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW5PckVxdWFsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0VxdWFsJztcbiIsImltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vKipcbiAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuICogQG1vZHVsZSBFcnJvcnNcbiAqIEBjbGFzc1xuICogQHN0YXRpY1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICB9XG59IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG4gICAgaXNGdWxsKCk6IGJvb2xlYW47XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuXG5BcnJheS5wcm90b3R5cGUuaXNGdWxsID0gZnVuY3Rpb24oKXtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKGkgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0iLCJpbnRlcmZhY2UgSVBlcmZvcm1SZXN1bHQge1xuXHRyZXN1bHQ6IHN0cmluZztcblx0cGFzc2VkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElQZXJmb3JtUmVzdWx0OyIsImludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGRlZmF1bHQgSVZhcmlhYmxlczsiLCJpbXBvcnQgUGFyc2VyIGZyb20gJy4vUGFyc2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHR2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihzcWwsIHZhcmlhYmxlcyk7XG5cdHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgSU1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9JTW9kaWZpZXInXG5leHBvcnQge2RlZmF1bHQgYXMgTm90fSBmcm9tICcuL21vZGlmaWVycy9Ob3QnOyBcbmV4cG9ydCB7ZGVmYXVsdCBhcyBPckVxdWFsfSBmcm9tICcuL21vZGlmaWVycy9PckVxdWFsJzsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRXh0ZW5zaW9ucy50c1wiIC8+XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG4vKipcbiAqIFRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAbW9kdWxlIFBhcnNlclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNxbCAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZm91bmQgaW4gdGhlIFNRaWdnTCBxdWVyeVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IHN0YWNrICAgICAgLSBDb21tYW5kIHN0YWNrIGZvciBzdG9yaW5nIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGVycm9yICAgICAgICAgLSBFcnJvciBzdHJpbmcgaWYgYW55IGVycm9ycyBhcmUgZm91bmQgaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXTtcblx0cHVibGljIHN0YWNrOiBDb21tYW5kW107XG4gICAgcHVibGljIGVycm9yOiBzdHJpbmc7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBzcWw6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG5cdFx0dGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgZXh0cmFjdChzcWw6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTpDb21tYW5kW117XG5cdFx0dmFyIG1hdGNoLCBjb21tYW5kczogQ29tbWFuZFtdID0gW10sIHN0YWNrOiBDb21tYW5kW10gPSBbXTtcblx0XHRDb21tYW5kLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUoKG1hdGNoID0gQ29tbWFuZC5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpe1xuXHRcdFx0dmFyIGZvdW5kID0gbmV3IENvbW1hbmQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpO1xuXHRcdFx0aWYoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuZGVwZW5kZW50KGZvdW5kLmFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHRzdGFjay5sYXN0KCkuZGVwZW5kZW50cy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgIXN0YWNrLmxhc3QoKS5hY3Rpb24udGVybWluYXRvcikge1xuXHRcdFx0XHRzdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0c3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0c3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdGNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGFyc2UoKTogc3RyaW5nIHtcblx0XHR2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBpZih0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuc3FsO1xuXHRcdGZvcih2YXIgY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcblx0XHRcdHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0xKTtcblx0XHRcdHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgVmFyaWFibGVSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlcic7IiwiaW1wb3J0IHtwYXJzZSBhcyBQYXJzZX0gZnJvbSAnLi9NYWluJztcbmxldCBTUWlnZ0wgPSB7XG4gICAgcGFyc2U6IFBhcnNlLFxuICAgIHZlcnNpb246ICcwLjEuMCcsXG4gICAgLy9leHRlbmQ6IEV4dGVuZFxufTtcbmlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB3aW5kb3dbJ1NRaWdnTCddID0gU1FpZ2dMO1xuZXhwb3J0IGRlZmF1bHQgU1FpZ2dMOyIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi4vRXJyb3JzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIEVsc2UgYWN0aW9uXG4gKiBAbW9kdWxlIEVsc2VcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgICAgICAgICAgICAgLSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAgICAtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgICAgLSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kICAgICAgICAgIC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgLSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbHNlIGltcGxlbWVudHMgSUFjdGlvbiB7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmVsc2VcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW107XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHVibGljIHZhcmlhYmxlOiBhbnk7XG5cdHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHR9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIGlmKCF0aGlzLnN1cHBvcnRlcikgcmV0dXJuIEVycm9ycy5JbmNvcnJlY3RTdGF0ZW1lbnQodGhpcywgdGhpcy5zdGF0ZW1lbnQpO1xuICAgIH1cblx0LyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVsc2Vcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdHtcblx0XHRyZXR1cm4gIXByZXZQYXNzZWQgPyB7cmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWV9IDoge3Jlc3VsdDogJycsIHBhc3NlZDogZmFsc2V9O1xuXHR9XG59IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IEVycm9ycyBmcm9tICcuLi9FcnJvcnMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgRW5kSWYgYWN0aW9uXG4gKiBAbW9kdWxlIEVuZElmXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIElBY3Rpb24ge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgXHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyIFx0XHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5kSWYgaW1wbGVtZW50cyBJQWN0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmVuZGlmXFxiL2k7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBBcnJheSBvZiBjb25kaXRpb25zIGF2YWlsYWJsZSB0byB0aGlzIGFjdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY29uZGl0aW9ucyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW107XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwdWJsaWMgdmFyaWFibGU6IGFueTtcbiAgICBwdWJsaWMgY29uZGl0aW9uOiBJQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBzdXBwb3J0ZXI6IENvbW1hbmQ7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjb21tYW5kOiBDb21tYW5kLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0fVxuXHQvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IHN0cmluZ3tcbiAgICAgICAgaWYoIXRoaXMuc3VwcG9ydGVyKSByZXR1cm4gRXJyb3JzLkluY29ycmVjdFN0YXRlbWVudCh0aGlzLCB0aGlzLnN0YXRlbWVudCk7XG4gICAgfVxuICAgIC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuXHQgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG5cdHB1YmxpYyBwZXJmb3JtKHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IElQZXJmb3JtUmVzdWx0IHtcblx0XHRyZXR1cm4ge3Jlc3VsdDogdGhpcy5pbm5lciwgcGFzc2VkOiB0cnVlfTtcblx0fSAgICBcbn0iLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIGludGVyZmFjZSBmb3IgYWxsIGFjdGlvbnMgdG8gYWRoZXJlIHRvXG4gKiBAaW50ZXJmYWNlIElBY3Rpb25cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5pbnRlcmZhY2UgSUFjdGlvbiB7XG4gICAgLy8gc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy8gc3RhdGljIGNvbmRpdGlvbnM6IElDb25kaXRpb25bXTtcblx0Ly8gc3RhdGljIGRlcGVuZGVudHM6IElBY3Rpb25bXTtcblx0dGVybWluYXRvcjogYm9vbGVhbjtcbiAgICB2YXJpYWJsZTogYW55O1xuICAgIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBzdXBwb3J0ZXI6IENvbW1hbmQ7XG4gICAgY29tbWFuZDogQ29tbWFuZDtcbiAgICBzdGF0ZW1lbnQ6IHN0cmluZztcbiAgICBpbm5lcjogc3RyaW5nO1xuICAgIHZhcmlhYmxlczogSVZhcmlhYmxlcztcblx0LyoqXG5cdCAqIEBtZXRob2RcbiAgICAgKiBAbWVtYmVyb2YgSUFjdGlvblxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcblx0ICogQHJldHVybnMgSVBlcmZvcm1SZXN1bHQge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cbiAgICB2YWxpZGF0ZSgpOnN0cmluZztcblx0cGVyZm9ybShwcmV2UGFzc2VkPzogYm9vbGVhbik6IElQZXJmb3JtUmVzdWx0O1xufVxuZXhwb3J0IGRlZmF1bHQgSUFjdGlvbjsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbmltcG9ydCB7RWxzZSwgRW5kSWZ9IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IHtJc051bGwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgRXF1YWx9IGZyb20gJy4uL0NvbmRpdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgSWYgYWN0aW9uXG4gKiBAbW9kdWxlIElmXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElmIGltcGxlbWVudHMgSUFjdGlvbiB7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvXlxccyppZlxcYi9pO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBjb25kaXRpb25zID0gW0lzTnVsbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBFcXVhbF07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBBcnJheSBvZiBkZXBlbmRlbnQgYWN0aW9uc1xuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIGRlcGVuZGVudHMgPSBbRWxzZSwgRW5kSWZdO1xuXHRwdWJsaWMgdGVybWluYXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuXHRwdWJsaWMgdmFyaWFibGU6IGFueTtcblx0cHVibGljIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBwdWJsaWMgc3VwcG9ydGVyOiBDb21tYW5kO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY29tbWFuZDogQ29tbWFuZCwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5jb25kaXRpb24gPSB0aGlzLmV4dHJhY3RDb25kaXRpb24oc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuXHR9XG5cdC8qKlxuXHQgKiBUcnkgYW5kIGxvY2F0ZSBhIG1hdGNoaW5nIGNvbmRpdGlvbiBmcm9tIHRoZSBhdmFpbGFibGUgY29uZGl0aW9ucyBmb3IgdGhpcyBhY3Rpb24uIElmIG5vIG1hdGNoIGlzIGZvdW5kLCByZXR1cm4gbnVsbC5cbiAgICAgKiBAbWVtYmVyb2YgSWZcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0LSBTdGF0ZW1lbnQgdG8gY2hlY2sgY29uZGl0aW9ucyBhZ2FpbnN0XG5cdCAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHQtIExpc3Qgb2YgdmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cblx0ICogQHJldHVybnMge0lDb25kaXRpb24gfCBudWxsfVx0XHQtIENvbmRpdGlvbiB0aGF0IG1hdGNoZXMgd2l0aGluIHRoZSBzdGF0ZW1lbnRcblx0ICovXG5cdHB1YmxpYyBleHRyYWN0Q29uZGl0aW9uKHN0YXRlbWVudDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdGZvcih2YXIgY29uZGl0aW9uIG9mIElmLmNvbmRpdGlvbnMpe1xuICAgICAgICAgICAgbGV0IG1hdGNoID0gY29uZGl0aW9uLmV4dHJhY3Qoc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgaWYobWF0Y2gpIHJldHVybiBtYXRjaDtcblx0XHRcdC8vIHZhciBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChjb25kaXRpb24ucmVnZXgpO1xuXHRcdFx0Ly8gaWYobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMCkgcmV0dXJuIG5ldyBjb25kaXRpb24obWF0Y2hbMV0sIHZhcmlhYmxlcywgbWF0Y2hbNF0sIG1hdGNoWzJdLCBtYXRjaFszXSk7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZSgpOnN0cmluZ3tcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXHQvKipcblx0ICogUGVyZm9ybSB0aGUgYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgKiBAbWVtYmVyb2YgSWZcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdHtcblx0XHRyZXR1cm4gdGhpcy5jb25kaXRpb24ucGVyZm9ybSgpXHRcblx0XHRcdFx0PyB7cmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWV9IFxuXHRcdFx0XHQ6IHtyZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlfTtcblx0fVxufSIsImltcG9ydCB7SU1vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgJy4uL0V4dGVuc2lvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb24ge1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kcyhrbGFzcyl7XG4gICAgICAgIHJldHVybiBrbGFzcy5tb2RpZmllcnMubWFwKHggPT4gYCR7eC5pZGVudGlmaWVycy5tYXAoaWQgPT4gaWQuc291cmNlKS5qb2luKCd8Jyl9YCkuam9pbignfCcpO1xuICAgIH1cbiAgICBwdWJsaWMgZXh0cmFjdE1vZGlmaWVycyhrbGFzcywgbW9kMTogc3RyaW5nLCBtb2QyOiBzdHJpbmcpOiBhbnlbXXtcbiAgICAgICAgaWYoIW1vZDEgJiYgIW1vZDIpIHJldHVybiBbXTtcbiAgICAgICAgbGV0IGFycmF5ID0gW10sIGNvdW50ID0gMDtcbiAgICAgICAgaWYobW9kMSkgY291bnQrKztcbiAgICAgICAgaWYobW9kMikgY291bnQrKztcbiAgICAgICAgZm9yKGxldCBtb2Qgb2Yga2xhc3MubW9kaWZpZXJzKXtcbiAgICAgICAgICAgIGZvcihsZXQgaWRlbnRpZmllciBvZiBtb2QuaWRlbnRpZmllcnMpe1xuICAgICAgICAgICAgICAgIGlmKG1vZDEgJiYgaWRlbnRpZmllci50ZXN0KG1vZDEpKSBhcnJheVswXSA9IG1vZDtcbiAgICAgICAgICAgICAgICBpZihtb2QyICYmIGlkZW50aWZpZXIudGVzdChtb2QyKSkge1xuICAgICAgICAgICAgICAgICAgICBhcnJheVshbW9kMSA/IDAgOiAxXSA9IG1vZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoYXJyYXkubGVuZ3RoID09PSBjb3VudCAmJiBhcnJheS5pc0Z1bGwoKSkgcmV0dXJuIGFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgcHVibGljIHBlcmZvcm1Nb2RpZmllcnMobW9kaWZpZXJzOiBJTW9kaWZpZXJbXSwgcmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFue1xuICAgICAgICBpZihtb2RpZmllcnMubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgZm9yKGk9bW9kaWZpZXJzLmxlbmd0aCAtIDE7aT4tMTstLWkpe1xuICAgICAgICAgICAgcmVzdWx0ID0gbW9kaWZpZXJzW2ldLnBlcmZvcm0ocmVzdWx0LCB2YXJpYWJsZSwgdmFyaWFibGVzLCBjb21wYXJhdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllciwgTm90LCBPckVxdWFsfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuXG4vKipcbiAqIFRoZSA9PSBjb25kaXRpb25cbiAqIEBtb2R1bGUgRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcXVhbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcXVhbFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtOb3QsIE9yRXF1YWxdO1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzKygoPzoke0VxdWFsLm1vZHMoRXF1YWwpfXxcXFxccyopKT0oKD86JHtFcXVhbC5tb2RzKEVxdWFsKX18XFxcXHMqKSlcXFxccysoXFxcXGQrfFtcIiddXFxcXHcrW1wiJ10pYCwgJ2knKTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSB0aGlzLmV4dHJhY3RNb2RpZmllcnMoRXF1YWwsIG1vZDEsIG1vZDIpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3Qoc3RhdGVtZW50OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG4gICAgICAgIGxldCBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChFcXVhbC5yZWdleCk7XG4gICAgICAgIGlmKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDApIHJldHVybiBuZXcgRXF1YWwobWF0Y2hbMV0sIHZhcmlhYmxlcywgbWF0Y2hbNF0sIG1hdGNoWzJdLCBtYXRjaFszXSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRXF1YWxcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdID09PSB0aGlzLmNvbXBhcmF0aXZlO1xuICAgICAgICByZXN1bHQgPSB0aGlzLnBlcmZvcm1Nb2RpZmllcnModGhpcy5tb2RpZmllcnMsIHJlc3VsdCwgdGhpcy52YXJpYWJsZSwgdGhpcy52YXJpYWJsZXMsIHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXHR9XG59IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nXG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7SU1vZGlmaWVyLCBOb3QsIE9yRXF1YWx9IGZyb20gJy4uL01vZGlmaWVycyc7XG5cbi8qKlxuICogVGhlID4gY29uZGl0aW9uXG4gKiBAbW9kdWxlIEdyZWF0ZXJUaGFuXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlYXRlclRoYW4gZXh0ZW5kcyBDb25kaXRpb24gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgR3JlYXRlclRoYW5cbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZmllcnMgPSBbTm90LCBPckVxdWFsXTtcblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cChgKFxcXFx3KylcXFxccysoKD86JHtHcmVhdGVyVGhhbi5tb2RzKEdyZWF0ZXJUaGFuKX18XFxcXHMqKSk+KCg/OiR7R3JlYXRlclRoYW4ubW9kcyhHcmVhdGVyVGhhbil9fFxcXFxzKikpXFxcXHMrKFxcXFxkKylgLCAnaScpO1xuICAgIHB1YmxpYyBtb2RpZmllcnM6IElNb2RpZmllcltdID0gW107XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZywgbW9kMTogc3RyaW5nLCBtb2QyOiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm1vZGlmaWVycyA9IHN1cGVyLmV4dHJhY3RNb2RpZmllcnMoR3JlYXRlclRoYW4sIG1vZDEsIG1vZDIpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3Qoc3RhdGVtZW50OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG4gICAgICAgIGxldCBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChHcmVhdGVyVGhhbi5yZWdleCk7XG4gICAgICAgIGlmKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDApIHJldHVybiBuZXcgR3JlYXRlclRoYW4obWF0Y2hbMV0sIHZhcmlhYmxlcywgbWF0Y2hbNF0sIG1hdGNoWzJdLCBtYXRjaFszXSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgR3JlYXRlclRoYW5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcbiAgICAgICAgbGV0IHJlc3VsdCA9IHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA+IHBhcnNlSW50KHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICByZXN1bHQgPSB0aGlzLnBlcmZvcm1Nb2RpZmllcnModGhpcy5tb2RpZmllcnMsIHJlc3VsdCwgdGhpcy52YXJpYWJsZSwgdGhpcy52YXJpYWJsZXMsIHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0OyBcblx0fVxufSIsImludGVyZmFjZSBJQ29uZGl0aW9uIHtcbiAgICAvL3N0YXRpYyByZWdleDogUmVnRXhwO1xuICAgIC8vc3RhdGljIG1vZGlmaWVyczogSU1vZGlmaWVyW107XG5cdC8vc3RhdGljIGNyZWF0ZShzdGF0ZW1lbnQ6IHN0cmluZyk6IElDb25kaXRpb247XG5cdHBlcmZvcm0oKTpib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSUNvbmRpdGlvbjsiLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuL0lDb25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllciwgTm90fSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIElzIE51bGwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIElzTnVsbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElzTnVsbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc051bGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW05vdF07XG4gICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoYChcXFxcdyspXFxcXHMraXNcXFxccysoKD86JHtJc051bGwubW9kcyhJc051bGwpfXxcXFxccyopKW51bGxcXFxccypgLCAnaScpO1xuICAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICB0aGlzLm1vZGlmaWVycyA9IHN1cGVyLmV4dHJhY3RNb2RpZmllcnMoSXNOdWxsLCBtb2QxLCBtb2QyKTtcbiAgICAgfVxuICAgICBcbiAgICAgcHVibGljIHN0YXRpYyBleHRyYWN0KHN0YXRlbWVudDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuICAgICAgICAgbGV0IG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKElzTnVsbC5yZWdleCk7XG4gICAgICAgICBpZihtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAwKSByZXR1cm4gbmV3IElzTnVsbChtYXRjaFsxXSwgdmFyaWFibGVzLCBudWxsLCBtYXRjaFsyXSwgbnVsbCk7XG4gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgfVxuICAgICBcbiAgICAgLyoqXG4gICAgICAqIEBtZW1iZXJvZiBJc051bGxcbiAgICAgICogQG1ldGhvZFxuICAgICAgKiBAcHVibGljXG4gICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICAqL1xuICAgICAgcHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuICAgICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSA9PSBudWxsO1xuICAgICAgICAgIHJlc3VsdCA9IHRoaXMucGVyZm9ybU1vZGlmaWVycyh0aGlzLm1vZGlmaWVycywgcmVzdWx0LCB0aGlzLnZhcmlhYmxlLCB0aGlzLnZhcmlhYmxlcywgdGhpcy5jb21wYXJhdGl2ZSk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuL0lDb25kaXRpb24nO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbidcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtJTW9kaWZpZXIsIE5vdCwgT3JFcXVhbH0gZnJvbSAnLi4vTW9kaWZpZXJzJztcblxuLyoqXG4gKiBUaGUgbGVuPiBjb25kaXRpb25cbiAqIEBtb2R1bGUgTGVuZ3RoR3JlYXRlclRoYW5cbiAqIEBjbGFzc1xuICogQGV4dGVuZHMge0NvbmRpdGlvbn1cbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21wYXJhdGl2ZSAgICAgICAgICAtIFZhbHVlIHRvIGNvbXBhcmUgdmFyaWFibGUgYWdhaW5zdFxuICogQHBhcmFtIHtzdHJpbmd9IG1vZDEgICAgICAgICAgICAgICAgIC0gSWRlbnRpZmllciBvZiBmaXJzdCBtb2RpZmllciwgb3IgbnVsbFxuICogQHBhcmFtIHtzdHJpbmd9IG1vZDIgICAgICAgICAgICAgICAgIC0gSWRlbnRpZmllciBvZiBzZWNvbmQgbW9kaWZpZXIsIG9yIG51bGxcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gY29tcGFyYXRpdmUgICAgICAgLSBWYWx1ZSB0byBjb21wYXJlIHZhcmlhYmxlIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtb2QxICAgICAgICAgICAgICAtIElkZW50aWZpZXIgb2YgZmlyc3QgbW9kaWZpZXIsIG9yIG51bGxcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtb2QyICAgICAgICAgICAgICAtIElkZW50aWZpZXIgb2Ygc2Vjb25kIG1vZGlmaWVyLCBvciBudWxsXG4gKiBAcHJvcGVydHkge0lNb2RpZmllcltdfSBtb2RpZmllcnMgICAgLSBBcnJheSBvZiBtb2RpZmllcnMgZm91bmQgaW4gY29uZGl0aW9uLCBpbiBvcmRlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZW5ndGhHcmVhdGVyVGhhbiBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKiBcbiAgICAgKiBAbWVtYmVyb2YgTGVuZ3RoR3JlYXRlclRoYW5cbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJTW9kaWZpZXJbXX0gQXJyYXkgb2YgcG9zc2libGUgbW9kaWZpZXJzIHRvIGNoZWNrIGFnYWluc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbTm90LCBPckVxdWFsXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVuZ3RoR3JlYXRlclRoYW5cbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoYChcXFxcdyspXFxcXHMrKCg/OiR7TGVuZ3RoR3JlYXRlclRoYW4ubW9kcyhMZW5ndGhHcmVhdGVyVGhhbil9fFxcXFxzKikpbGVuPigoPzoke0xlbmd0aEdyZWF0ZXJUaGFuLm1vZHMoTGVuZ3RoR3JlYXRlclRoYW4pfXxcXFxccyopKVxcXFxzKyhcXFxcZCspYCwgJ2knKTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE/OiBzdHJpbmcsIG1vZDI/OiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm1vZGlmaWVycyA9IHN1cGVyLmV4dHJhY3RNb2RpZmllcnMoTGVuZ3RoR3JlYXRlclRoYW4sIG1vZDEsIG1vZDIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0cyB0aGUgdmFyaWFibGUsIGNvbXBhcmF0aXZlLCBhbmQgYW55IG1vZGlmaWVycyBpbiB0aGUgY29uZGl0aW9uXG4gICAgICogQG1lbWJlcm9mIExlbmd0aEdyZWF0ZXJUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcmV0dXJucyB7TGVuZ3RoR3JlYXRlclRoYW4gfCBudWxsfSBJbnN0YW5jZSBvZiBMZW5ndGhHcmVhdGVyVGhhbiByZWFkeSBmb3IgZXhlY3V0aW9uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0KHN0YXRlbWVudDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuICAgICAgICBsZXQgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goTGVuZ3RoR3JlYXRlclRoYW4ucmVnZXgpO1xuICAgICAgICBpZihtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAwKSByZXR1cm4gbmV3IExlbmd0aEdyZWF0ZXJUaGFuKG1hdGNoWzFdLCB2YXJpYWJsZXMsIG1hdGNoWzRdLCBtYXRjaFsyXSwgbWF0Y2hbM10pO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIExlbmd0aEdyZWF0ZXJUaGFuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXS5sZW5ndGggPiBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDsgXG5cdH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuL0lDb25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJztcbmltcG9ydCB7SU1vZGlmaWVyLCBOb3QsIE9yRXF1YWx9IGZyb20gJy4uL01vZGlmaWVycyc7XG5cbi8qKlxuICogVGhlIDwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIExlc3NUaGFuXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVzc1RoYW4gZXh0ZW5kcyBDb25kaXRpb24gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5cbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZmllcnMgPSBbTm90LCBPckVxdWFsXTtcblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cChgKFxcXFx3KylcXFxccysoKD86JHtMZXNzVGhhbi5tb2RzKExlc3NUaGFuKX18XFxcXHMqKSk8KCg/OiR7TGVzc1RoYW4ubW9kcyhMZXNzVGhhbil9fFxcXFxzKikpXFxcXHMrKFxcXFxkKylgLCAnaScpO1xuICAgIHB1YmxpYyBtb2RpZmllcnM6IElNb2RpZmllcltdID0gW107XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZywgbW9kMTogc3RyaW5nLCBtb2QyOiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm1vZGlmaWVycyA9IHRoaXMuZXh0cmFjdE1vZGlmaWVycyhMZXNzVGhhbiwgbW9kMSwgbW9kMik7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzdGF0aWMgZXh0cmFjdChzdGF0ZW1lbnQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcbiAgICAgICAgbGV0IG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKExlc3NUaGFuLnJlZ2V4KTtcbiAgICAgICAgaWYobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMCkgcmV0dXJuIG5ldyBMZXNzVGhhbihtYXRjaFsxXSwgdmFyaWFibGVzLCBtYXRjaFs0XSwgbWF0Y2hbMl0sIG1hdGNoWzNdKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhblxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuXHRcdGxldCByZXN1bHQgPSBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPCBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5pbnRlcmZhY2UgSU1vZGlmaWVyIHtcbiAgICBpZGVudGlmaWVyczogUmVnRXhwW107XG4gICAgcGVyZm9ybShyZXN1bHQ6Ym9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBjb21wYXJhdGl2ZTogc3RyaW5nKTpib29sZWFuO1xuICAgIG1hdGNoZXMoaXRlbTogc3RyaW5nKTpib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSU1vZGlmaWVyOyIsImltcG9ydCBJTW9kaWZpZXIgZnJvbSAnLi9JTW9kaWZpZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5jb25zdCBOb3Q6SU1vZGlmaWVyID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLyEvaSwgLyg/OlxcYnxcXHMrKW5vdCg/OlxcYnxcXHMrKS9pXSxcbiAgICBwZXJmb3JtOiAocmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFuID0+IHtyZXR1cm4gIXJlc3VsdDt9LFxuICAgIG1hdGNoZXM6IChpdGVtKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGZvcihsZXQgaWRlbnRpZmllciBvZiBOb3QuaWRlbnRpZmllcnMpe1xuICAgICAgICAgICAgaWYoaWRlbnRpZmllci50ZXN0KGl0ZW0pKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgTm90OyIsImltcG9ydCBJTW9kaWZpZXIgZnJvbSAnLi9JTW9kaWZpZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5jb25zdCBPckVxdWFsOiBJTW9kaWZpZXIgPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvPS9pXSxcbiAgICBwZXJmb3JtOiAocmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCB2YXJpYWJsZXNbdmFyaWFibGVdID09PSBjb21wYXJhdGl2ZTtcbiAgICB9LFxuICAgIG1hdGNoZXM6IChpdGVtKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGZvcihsZXQgaWRlbnRpZmllciBvZiBPckVxdWFsLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgIGlmKGlkZW50aWZpZXIudGVzdChpdGVtKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IE9yRXF1YWw7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJUmVwbGFjZXIge1xuICAgIC8vc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy9zdGF0aWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElSZXBsYWNlcjsiLCJpbXBvcnQgSVJlcGxhY2VyIGZyb20gJy4vSVJlcGxhY2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSB2YXJpYWJsZSByZXBsYWNlciBmb3IgZW1iZWRkZWQgU1FpZ2dMIHZhcmlhYmxlc1xuICogQG1vZHVsZSBWYXJpYWJsZVJlcGxhY2VyXG4gKiBAc3RhdGljXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJUmVwbGFjZXJ9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhcmlhYmxlUmVwbGFjZXIgaW1wbGVtZW50cyBJUmVwbGFjZXIge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2c7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAgICAgICAgICAgICAtIFRleHQgdG8gc2VhcmNoIGZvciByZXBsYWNlbWVudHNcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICAgLSBUaGUgc3RyaW5nIHdpdGggdmFyaWFibGVzIHJlcGxhY2VkIFxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlcGxhY2UodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmd7XG5cdFx0cmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCAobWF0Y2gsICQxLCAkMikgPT4gJDErdmFyaWFibGVzWyQyXSk7XG5cdH1cbn0iXX0=
