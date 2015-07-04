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
var IsNotNull_1 = require('./conditions/IsNotNull');
exports.IsNotNull = IsNotNull_1.default;
var IsNull_1 = require('./conditions/IsNull');
exports.IsNull = IsNull_1.default;
var GreaterThan_1 = require('./conditions/GreaterThan');
exports.GreaterThan = GreaterThan_1.default;
var LessThan_1 = require('./conditions/LessThan');
exports.LessThan = LessThan_1.default;
var GreaterThanOrEqual_1 = require('./conditions/GreaterThanOrEqual');
exports.GreaterThanOrEqual = GreaterThanOrEqual_1.default;
var LessThanOrEqual_1 = require('./conditions/LessThanOrEqual');
exports.LessThanOrEqual = LessThanOrEqual_1.default;
var Equal_1 = require('./conditions/Equal');
exports.Equal = Equal_1.default;

},{"./conditions/Equal":18,"./conditions/GreaterThan":19,"./conditions/GreaterThanOrEqual":20,"./conditions/IsNotNull":22,"./conditions/IsNull":23,"./conditions/LessThan":24,"./conditions/LessThanOrEqual":25}],5:[function(require,module,exports){
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

},{"./modifiers/Not":27}],11:[function(require,module,exports){
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
            if (match && match.length > 0)
                return new condition(match[1], variables, match[2]);
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
    If.conditions = [Conditions_1.IsNotNull, Conditions_1.IsNull, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.GreaterThanOrEqual, Conditions_1.LessThanOrEqual, Conditions_1.Equal];
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
var Equal = (function () {
    function Equal(variable, variables, comparative) {
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
    }
    /**
     * @memberof Equal
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    Equal.prototype.perform = function () {
        return this.variables[this.variable] === this.comparative;
    };
    /**
     * @memberof Equal
     * @static
     * @property {RegExp} The regex matcher
     */
    Equal.regex = /(\w+)\s+==\s+(\d+)/i;
    return Equal;
})();
exports["default"] = Equal;

},{}],19:[function(require,module,exports){
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
var GreaterThan = (function () {
    function GreaterThan(variable, variables, comparative) {
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
    }
    /**
     * @memberof GreaterThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    GreaterThan.prototype.perform = function () {
        return parseInt(this.variables[this.variable]) > parseInt(this.comparative);
    };
    GreaterThan.modregex = function (klass) {
    };
    /**
     * @memberof GreaterThan
     * @static
     * @property {RegExp} The regex matcher
     */
    GreaterThan.modifiers = [Modifiers_1.Not];
    GreaterThan.regex = new RegExp("(\\w+)\\s+((?:" + GreaterThan.modifiers.map(function (x) { return ("" + x.identifiers.join('|')); }) + "|\\s*))>(\\w*)\\s+(\\d+)", 'i');
    return GreaterThan;
})();
exports["default"] = GreaterThan;

},{"../Modifiers":10}],20:[function(require,module,exports){
/**
 * The >= condition
 * @module GreaterThanOrEqual
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var GreaterThanOrEqual = (function () {
    function GreaterThanOrEqual(variable, variables, comparative) {
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
    }
    /**
     * @memberof GreaterThanOrEqual
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    GreaterThanOrEqual.prototype.perform = function () {
        return parseInt(this.variables[this.variable]) >= parseInt(this.comparative);
    };
    /**
     * @memberof GreaterThanOrEqual
     * @static
     * @property {RegExp} The regex matcher
     */
    GreaterThanOrEqual.regex = /(\w+)\s+>=\s+(\d+)/i;
    return GreaterThanOrEqual;
})();
exports["default"] = GreaterThanOrEqual;

},{}],21:[function(require,module,exports){

},{}],22:[function(require,module,exports){
/**
 * The Is Not Null condition
 * @module IsNotNull
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var IsNotNull = (function () {
    function IsNotNull(variable, variables, comparative) {
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
    }
    /**
     * @memberof IsNotNull
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    IsNotNull.prototype.perform = function () {
        return this.variables[this.variable] != null;
    };
    /**
     * @memberof IsNotNull
     * @static
     * @property {RegExp} The regex matcher
     */
    IsNotNull.regex = /(\w+)\s+is\s+not\s+null\s*/i;
    return IsNotNull;
})();
exports["default"] = IsNotNull;

},{}],23:[function(require,module,exports){
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
var IsNull = (function () {
    function IsNull(variable, variables, comparative) {
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
    }
    /**
     * @memberof IsNull
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    IsNull.prototype.perform = function () {
        return this.variables[this.variable] == null;
    };
    /**
     * @memberof IsNull
     * @static
     * @property {RegExp} The regex matcher
     */
    IsNull.regex = /(\w*)\s+is\s+null\s*/i;
    return IsNull;
})();
exports["default"] = IsNull;

},{}],24:[function(require,module,exports){
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
var LessThan = (function () {
    function LessThan(variable, variables, comparative) {
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
    }
    /**
     * @memberof LessThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    LessThan.prototype.perform = function () {
        return parseInt(this.variables[this.variable]) < parseInt(this.comparative);
    };
    /**
     * @memberof LessThan
     * @static
     * @property {RegExp} The regex matcher
     */
    LessThan.regex = /(\w+)\s+<\s+(\d+)/i;
    return LessThan;
})();
exports["default"] = LessThan;

},{}],25:[function(require,module,exports){
/**
 * The <= condition
 * @module LessThanOrEqual
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var LessThanOrEqual = (function () {
    function LessThanOrEqual(variable, variables, comparative) {
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
    }
    /**
     * @memberof LessThanOrEqual
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    LessThanOrEqual.prototype.perform = function () {
        return parseInt(this.variables[this.variable]) <= parseInt(this.comparative);
    };
    /**
     * @memberof LessThanOrEqual
     * @static
     * @property {RegExp} The regex matcher
     */
    LessThanOrEqual.regex = /(\w+)\s+<=\s+(\d+)/i;
    return LessThanOrEqual;
})();
exports["default"] = LessThanOrEqual;

},{}],26:[function(require,module,exports){

},{}],27:[function(require,module,exports){
var Not = (function () {
    function Not() {
    }
    Not.identifiers = ['!', 'not\\s'];
    return Not;
})();
exports["default"] = Not;

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

},{}]},{},[1,14,15,16,17,2,3,4,18,19,20,21,22,23,24,25,5,6,7,8,9,10,26,27,11,12,28,29,13])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRTY29wZS50cyIsInNyYy9Db25kaXRpb25zLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lQZXJmb3JtUmVzdWx0LnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2VyLnRzIiwic3JjL1JlcGxhY2Vycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvYWN0aW9ucy9FbHNlLnRzIiwic3JjL2FjdGlvbnMvRW5kSWYudHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSWYudHMiLCJzcmMvY29uZGl0aW9ucy9FcXVhbC50cyIsInNyYy9jb25kaXRpb25zL0dyZWF0ZXJUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvR3JlYXRlclRoYW5PckVxdWFsLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC50cyIsInNyYy9jb25kaXRpb25zL0lzTnVsbC50cyIsInNyYy9jb25kaXRpb25zL0xlc3NUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvTGVzc1RoYW5PckVxdWFsLnRzIiwic3JjL21vZGlmaWVycy9JTW9kaWZpZXIudHMiLCJzcmMvbW9kaWZpZXJzL05vdC50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyLnRzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsbUhBQW1IO0FBQ25ILHNCQUErQixpQkFBaUIsQ0FBQztBQUF6QyxnQ0FBeUM7QUFDakQscUJBQThCLGdCQUFnQixDQUFDO0FBQXZDLDhCQUF1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QUM7QUFBRCxDQWpCQSxBQWlCQyxJQUFBO0FBakJELG9DQWlCQyxDQUFBOzs7QUM5QkQ7O0FDQ0E7SUFFSTtJQUVBLENBQUM7SUFIYSxlQUFXLEdBQWEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFJMUQsVUFBQztBQUFELENBTEEsQUFLQyxJQUFBO0FBTEQsd0JBS0MsQ0FBQTs7O0FDQXdCOztBQ0h6Qjs7Ozs7O0dBTUc7QUFDSDtJQUFBO0lBa0JBLENBQUM7SUFYQTs7Ozs7OztPQU9NO0lBQ1Esd0JBQU8sR0FBckIsVUFBc0IsSUFBWSxFQUFFLFNBQXFCO1FBQ3hELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSyxPQUFBLEVBQUUsR0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBaEJFOzs7O09BSUc7SUFDUSxzQkFBSyxHQUFXLG9DQUFvQyxDQUFDO0lBWXBFLHVCQUFDO0FBQUQsQ0FsQkEsQUFrQkMsSUFBQTtBQWxCRCxxQ0FrQkMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBOb3RlOiBUaGVzZSBhcmUgbG9hZGVkIGluIG9yZGVyLCBtYWtlIHN1cmUgYW55IGRlcGVuZGVudCBhY3Rpb25zIGFyZSBsaXN0ZWQgYWJvdmUgdGhlIGFjdGlvbiB0aGF0IHJlcXVpcmVzIHRoZW0uXG5leHBvcnQge2RlZmF1bHQgYXMgRW5kSWZ9IGZyb20gJy4vYWN0aW9ucy9FbmRJZic7XG5leHBvcnQge2RlZmF1bHQgYXMgRWxzZX0gZnJvbSAnLi9hY3Rpb25zL0Vsc2UnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIElmfSBmcm9tICcuL2FjdGlvbnMvSWYnOyIsImltcG9ydCB7SWYsIEVsc2UsIEVuZElmfSBmcm9tICcuL0FjdGlvbnMnO1xuaW1wb3J0IENvbW1hbmRTY29wZSBmcm9tICcuL0NvbW1hbmRTY29wZSc7XG5pbXBvcnQge1ZhcmlhYmxlUmVwbGFjZXJ9IGZyb20gJy4vUmVwbGFjZXJzJztcbmltcG9ydCBJQWN0aW9uIGZyb20gJy4vYWN0aW9ucy9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIENvbW1hbmQgb2JqZWN0IHJlc3BvbnNpYmxlIGZvciBoYW5kbGluZyBhbGwgYWN0aW9ucywgY29uZGl0aW9ucywgYW5kIHZhcmlhYmxlcyB3aXRoaW4gaXQncyBzZWN0aW9uIG9mIHRoZSBxdWVyeVxuICogQG1vZHVsZSBDb21tYW5kXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAgICAgICAgICAgICAgICAtIEJlZ2lubmluZyBpbmRleCBvZiB0aGUgY29tbWFuZCBpbiB0aGUgb3JpZ2luYWwgcXVlcnkgc3RyaW5nXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoICAgICAgICAgICAgICAgLSBMZW5ndGggb2YgdGhlIHNlY3Rpb24gb2YgdGhlIG9yaWdpbmFsIHN0cmluZyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAgICAtIFN0YXRlbWVudCB3aXRoaW4gdGhlICd7eyUgJX19JyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAgICAtIFRleHQgdGhhdCBpbW1lZGlhdGVseSBmb2xsb3dzIHRoZSBzdGF0ZW1lbnQgdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gKiBAcHJvcGVydHkge251bWJlcn0gaW5kZXggICAgICAgICAgICAgLSBCZWdpbm5pbmcgaW5kZXggb2YgdGhlIGNvbW1hbmQgaW4gdGhlIG9yaWdpbmFsIHF1ZXJ5IHN0cmluZ1xuICogQHByb3BlcnR5IHtudW1iZXJ9IGxlbmd0aCAgICAgICAgICAgIC0gTGVuZ3RoIG9mIHRoZSBzZWN0aW9uIG9mIHRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgLSBTdGF0ZW1lbnQgd2l0aGluIHRoZSAne3slICV9fScgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgLSBUZXh0IHRoYXQgaW1tZWRpYXRlbHkgZm9sbG93cyB0aGUgc3RhdGVtZW50IHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGFjdGlvbnMgICAgICAgIC0gQXJyYXkgb2YgYWN0aW9ucyBhdmFpbGFibGUgdG8gU1FpZ2dMXG4gKiBAcHJvcGVydHkge0lSZXBsYWNlcltdfSByZXBsYWNlcnMgICAgLSBBcnJheSBvZiByZXBsYWNlcnMgYXZhaWxhYmxlIHRvIFNRaWdnTFxuICogQHByb3BlcnR5IHtDb21tYW5kU2NvcGV9IHNjb3BlICAgICAgIC0gSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZCwgc3VjaCBhcyBhdmFpbGFibGUgdmFyaWFibGVzIHtAc2VlIENvbW1hbmRTY29wZX1cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBkZXBlbmRlbnRzICAgICAtIEFycmF5IG9mIGNvbW1hbmRzIGRlcGVuZGVudCB0byB0aGlzIGNvbW1hbmQgICAgICAgIFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvZ207XG5cdHB1YmxpYyBhY3Rpb25zOiBhbnlbXSA9IFtJZiwgRWxzZSwgRW5kSWZdO1xuXHRwdWJsaWMgcmVwbGFjZXJzID0gW1ZhcmlhYmxlUmVwbGFjZXJdO1xuXHRwdWJsaWMgYWN0aW9uOiBJQWN0aW9uO1xuXHRwdWJsaWMgc2NvcGU6IENvbW1hbmRTY29wZSA9IG5ldyBDb21tYW5kU2NvcGUoKTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGxlbmd0aDpudW1iZXIsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdFx0dGhpcy5hY3Rpb24gPSB0aGlzLmV4dHJhY3Qoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcblx0fVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFjdGlvbnMgZnJvbSB0aGUgc3RhdGVtZW50XG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgIC0gU3RhdGVtZW50IHRvIGV4dHJhY3QgdGhlIGFjdGlvbnMgZnJvbVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgIC0gSW5uZXIgdGV4dCBmb3IgdGhlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtJQWN0aW9uIHwgbnVsbH0gICAgICAgIC0gVGhlIG1hdGNoaW5nIGFjdGlvbiBvciBudWxsIGlmIG5vIGFjdGlvbiB3YXMgZm91bmRcbiAgICAgKi9cdFxuXHRwdWJsaWMgZXh0cmFjdChzdGF0ZW1lbnQ6IHN0cmluZywgaW5uZXI6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogSUFjdGlvbntcblx0XHRmb3IodmFyIGFjdGlvbiBvZiB0aGlzLmFjdGlvbnMpe1xuXHRcdFx0aWYoYWN0aW9uLnJlZ2V4LnRlc3QodGhpcy5zdGF0ZW1lbnQpKSByZXR1cm4gbmV3IGFjdGlvbih0aGlzLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21tYW5kIGFuZCByZXR1cm4gdGhlIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhc3NlZCAgICAgIC0gSWYgdGhlIGNvbW1hbmQgaXMgYSBkZXBlbmRlbnQgdGhlbiB0aGlzIHdpbGwgcmVmbGVjdCBpZiB0aGUgcHJldmlvdXMgY29tbWFuZCBzdWNjZWVkZWQgb3IgZmFpbGVkXG4gICAgICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSAgICAtIFRoZSByZXN1bHQgb2YgdGhlIGNvbW1hbmQgZXhlY3V0aW9uIHtAc2VlIElQZXJmb3JtUmVzdWx0fVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybShwYXNzZWQ6IGJvb2xlYW4pOiBJUGVyZm9ybVJlc3VsdCB7XG5cdFx0dmFyIHJlc3VsdDogSVBlcmZvcm1SZXN1bHQgPSB0aGlzLmFjdGlvbi5wZXJmb3JtKHBhc3NlZCk7XG5cdFx0cmVzdWx0LnJlc3VsdCArPSB0aGlzLnBlcmZvcm1EZXBlbmRlbnRzKHJlc3VsdC5wYXNzZWQpO1xuXHRcdGZvcih2YXIgcmVwbGFjZXIgb2YgdGhpcy5yZXBsYWNlcnMpe1xuXHRcdFx0cmVzdWx0LnJlc3VsdCA9IHJlcGxhY2VyLnJlcGxhY2UocmVzdWx0LnJlc3VsdCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gY29tbWFuZHMgdGhhdCBhcmUgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmQgKHN1Yi1jb21tYW5kcylcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgc3ViLWNvbW1hbmQncyBleGVjdXRpb25cbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm1TY29wZSgpOiBzdHJpbmcge1xuXHRcdHZhciByZXQ6IHN0cmluZyA9ICcnLCBwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2U7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuc2NvcGUuY29tbWFuZHMpe1xuXHRcdFx0dmFyIHJlc3VsdCA9IGNvbW1hbmQucGVyZm9ybShwcmV2UGFzc2VkKTtcblx0XHRcdHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuXHRcdFx0cmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZCAgLSBJZiB0aGlzIGNvbW1hbmQgaXMgYSBkZXBlbmRlbnQgdGhlbiB0aGlzIHdpbGwgcmVmbGVjdCBpZiB0aGUgcHJldmlvdXMgY29tbWFuZCBzdWNjZWVkZWQgb3IgZmFpbGVkXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgZGVwZW5kZW50IGV4ZWN1dGlvbnMgKGNvbGxlY3RpdmVseSlcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm1EZXBlbmRlbnRzKHByZXZQYXNzZWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuXHRcdHZhciByZXQ6IHN0cmluZyA9ICcnO1xuXHRcdGZvcih2YXIgZGVwZW5kZW50IG9mIHRoaXMuZGVwZW5kZW50cyl7XG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVwZW5kZW50LnBlcmZvcm0ocHJldlBhc3NlZCk7XG5cdFx0XHRwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcblx0XHRcdHJldCArPSByZXN1bHQucmVzdWx0O1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIHRlcm1pbmF0aW9uIG9mIHRoZSBjb21tYW5kJ3MgYWN0aW9ucyBpZiBuZWVkZWQgKEZvciBleGFtcGxlIFwiRW5kSWZcIiBpcyBhIHRlcm1pbmF0b3Igb2YgXCJJZlwiLCBzbyB0aGlzIGVzc2VudGlhbGx5IG1lYW5zIHRvIGp1c3QgcHJpbnQgb3V0IHRoZSBzdHJpbmcgdGhhdCBmb2xsb3dzIFwiRW5kSWZcIilcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgYWN0aW9uJ3MgdGVybWluYXRvclxuICAgICAqL1xuXHRwdWJsaWMgdGVybWluYXRpb24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZS5jb21tYW5kcy5zb21lKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcilcblx0XHQ/IHRoaXMuc2NvcGUuY29tbWFuZHMuZmlsdGVyKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcilbMV0ucGVyZm9ybShmYWxzZSkucmVzdWx0XG5cdFx0OiAnJztcblx0fVxuXHQvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgaW5wdXR0ZWQgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIHRoZSBhY3Rpb24gZm9yIHRoaXMgY29tbWFuZFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgLSBUaGUgYWN0aW9uIHRvIGNoZWNrIGlmIGl0IGlzIGEgZGVwZW5kZW50IG9mIHRoaXMgY29tbWFuZCdzIGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgdGhpcyBjb21tYW5kJ3MgYWN0aW9uIFxuICAgICAqL1xuXHRwdWJsaWMgZGVwZW5kZW50KGFjdGlvbjogSUFjdGlvbik6IGJvb2xlYW4ge1xuXHRcdGZvcih2YXIgZGVwZW5kZW50IG9mIHRoaXMuYWN0aW9uLmNvbnN0cnVjdG9yWydkZXBlbmRlbnRzJ10pe1xuXHRcdFx0aWYoYWN0aW9uIGluc3RhbmNlb2YgPGFueT5kZXBlbmRlbnQpIHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn0iLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcbi8qKlxuICogVGhlIENvbW1hbmQgU2NvcGUgb2JqZWN0XG4gKiBAbW9kdWxlIENvbW1hbmRTY29wZVxuICogQGNsYXNzXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIEhvbGRzIHZhcmlhYmxlcyBmb3IgdGhlIHNjb3BlXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGNvbW1hbmRzIHdpdGhpbiB0aGUgc2NvcGVcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgZGVwZW5kZW50IGNvbW1hbmRzIFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kU2NvcGUge1xuXHRwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzID0ge307XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cdHB1YmxpYyBkZXBlbmRlbnRzOiBDb21tYW5kW10gPSBbXTtcbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgSXNOb3ROdWxsfSBmcm9tICcuL2NvbmRpdGlvbnMvSXNOb3ROdWxsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBJc051bGx9IGZyb20gJy4vY29uZGl0aW9ucy9Jc051bGwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIExlc3NUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW4nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFuT3JFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0dyZWF0ZXJUaGFuT3JFcXVhbCc7XG5leHBvcnQge2RlZmF1bHQgYXMgTGVzc1RoYW5PckVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW5PckVxdWFsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0VxdWFsJztcbiIsImltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vKipcbiAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuICogQG1vZHVsZSBFcnJvcnNcbiAqIEBjbGFzc1xuICogQHN0YXRpY1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICB9XG59IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufSIsImludGVyZmFjZSBJUGVyZm9ybVJlc3VsdCB7XG5cdHJlc3VsdDogc3RyaW5nO1xuXHRwYXNzZWQ/OiBib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSVBlcmZvcm1SZXN1bHQ7IiwiaW50ZXJmYWNlIElWYXJpYWJsZXMge1xuXHRba2V5OiBzdHJpbmddOiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJVmFyaWFibGVzOyIsImltcG9ydCBQYXJzZXIgZnJvbSAnLi9QYXJzZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbi8qKlxuICogVGhlIHN0YXJ0aW5nIHBvaW50IG9mIHRoZSBlbnRpcmUgU1FpZ2dMIHBhcnNlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUUwgcXVlcnkgdG8gcnVuIFNRaWdnTCBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXM/fSB2YXJpYWJsZXMgICAtIE9wdGlvbmFsIGNvbGxlY3Rpb24gb2YgdmFyaWFibGVzIGZvciB5b3VyIFNRaWdnTCBxdWVyeVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgICAgICAgLSBUaGUgZnVsbHkgcGFyc2VkIFNRTCBxdWVyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc3FsOiBzdHJpbmcsIHZhcmlhYmxlcz86IElWYXJpYWJsZXMpOiBzdHJpbmd7XG5cdHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKHNxbCwgdmFyaWFibGVzKTtcblx0cmV0dXJuIHBhcnNlci5wYXJzZSgpO1xufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBOb3R9IGZyb20gJy4vbW9kaWZpZXJzL05vdCc7ICIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJFeHRlbnNpb25zLnRzXCIgLz5cbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cbi8qKlxuICogVGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBtb2R1bGUgUGFyc2VyXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3FsICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyBmb3VuZCBpbiB0aGUgU1FpZ2dMIHF1ZXJ5XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gc3RhY2sgICAgICAtIENvbW1hbmQgc3RhY2sgZm9yIHN0b3JpbmcgY3VycmVudCBwb3NpdGlvbiBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXJyb3IgICAgICAgICAtIEVycm9yIHN0cmluZyBpZiBhbnkgZXJyb3JzIGFyZSBmb3VuZCBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdO1xuXHRwdWJsaWMgc3RhY2s6IENvbW1hbmRbXTtcbiAgICBwdWJsaWMgZXJyb3I6IHN0cmluZztcblx0Y29uc3RydWN0b3IocHVibGljIHNxbDogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHR0aGlzLmNvbW1hbmRzID0gdGhpcy5leHRyYWN0KHNxbCwgdmFyaWFibGVzKTtcblx0XHR0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0fVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFueSBjb21tYW5kcyBvdXQgb2YgdGhlIFNRaWdnTCBxdWVyeSBhbmQgZGV0ZXJtaW5lIHRoZWlyIG9yZGVyLCBuZXN0aW5nLCBhbmQgdHlwZVxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gU1FpZ2dMIHF1ZXJ5IHRvIGV4dHJhY3QgY29tbWFuZHMgZnJvbVxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IGdsb2JhbCB2YXJpYWJsZXMgcGFzc2VkIGluIHRvIFNRaWdnTFxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kW119ICAgICAgICAgICAgIC0gQXJyYXkgb2YgZnVsbHkgcGFyc2VkIGNvbW1hbmRzLCByZWFkeSBmb3IgZXhlY3V0aW9uXG4gICAgICovXG5cdHB1YmxpYyBleHRyYWN0KHNxbDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOkNvbW1hbmRbXXtcblx0XHR2YXIgbWF0Y2gsIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXSwgc3RhY2s6IENvbW1hbmRbXSA9IFtdO1xuXHRcdENvbW1hbmQucmVnZXgubGFzdEluZGV4ID0gMDtcblx0XHR3aGlsZSgobWF0Y2ggPSBDb21tYW5kLnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCl7XG5cdFx0XHR2YXIgZm91bmQgPSBuZXcgQ29tbWFuZChtYXRjaC5pbmRleCwgbWF0Y2guaW5wdXQubGVuZ3RoLCBtYXRjaFsxXSwgbWF0Y2hbMl0sIHZhcmlhYmxlcyk7XG5cdFx0XHRpZihzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnQoZm91bmQuYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGZvdW5kLmFjdGlvbi5zdXBwb3J0ZXIgPSBzdGFjay5sYXN0KCk7XG5cdFx0XHRcdHN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiAhc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSB7XG5cdFx0XHRcdHN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHRzdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRzdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0Y29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG4gICAgICAgICAgICBsZXQgZXJyb3IgPSBmb3VuZC5hY3Rpb24udmFsaWRhdGUoKTtcbiAgICAgICAgICAgIGlmKGVycm9yKSByZXR1cm4gW107XG5cdFx0fVxuXHRcdHJldHVybiBjb21tYW5kcztcblx0fVxuXHQvKipcbiAgICAgKiBSdW4gdGhlIGNvbW1hbmRzIGFnYWluc3QgdGhlIHN0cmluZyBhbmQgb3V0cHV0IHRoZSBlbmQgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGVuZCByZXN1bHQgb2YgcnVubmluZyBhbGwgY29tbWFuZHMgYWdhaW5zdCB0aGUgU1FpZ2dMIHF1ZXJ5XG4gICAgICovXG5cdHB1YmxpYyBwYXJzZSgpOiBzdHJpbmcge1xuXHRcdHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zcWw7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuXHRcdFx0cXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLTEpO1xuXHRcdFx0cXVlcnkgKz0gY29tbWFuZC5wZXJmb3JtKGZhbHNlKS5yZXN1bHQ7XG5cdFx0XHRpbmRleCArPSBjb21tYW5kLmxlbmd0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHF1ZXJ5OyAvL1RPRE9cblx0fVxufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBWYXJpYWJsZVJlcGxhY2VyfSBmcm9tICcuL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyJzsiLCJpbXBvcnQge3BhcnNlIGFzIFBhcnNlfSBmcm9tICcuL01haW4nO1xubGV0IFNRaWdnTCA9IHtcbiAgICBwYXJzZTogUGFyc2UsXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcbiAgICAvL2V4dGVuZDogRXh0ZW5kXG59O1xuaWYod2luZG93KSB3aW5kb3dbJ1NRaWdnTCddID0gU1FpZ2dMO1xuZXhwb3J0IGRlZmF1bHQgU1FpZ2dMOyIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi4vRXJyb3JzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIEVsc2UgYWN0aW9uXG4gKiBAbW9kdWxlIEVsc2VcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgICAgICAgICAgICAgLSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAgICAtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgICAgLSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kICAgICAgICAgIC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgLSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbHNlIGltcGxlbWVudHMgSUFjdGlvbiB7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmVsc2VcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW107XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHVibGljIHZhcmlhYmxlOiBhbnk7XG5cdHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHR9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIGlmKCF0aGlzLnN1cHBvcnRlcikgcmV0dXJuIEVycm9ycy5JbmNvcnJlY3RTdGF0ZW1lbnQodGhpcywgdGhpcy5zdGF0ZW1lbnQpO1xuICAgIH1cblx0LyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVsc2Vcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdHtcblx0XHRyZXR1cm4gIXByZXZQYXNzZWQgPyB7cmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWV9IDoge3Jlc3VsdDogJycsIHBhc3NlZDogZmFsc2V9O1xuXHR9XG59IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IEVycm9ycyBmcm9tICcuLi9FcnJvcnMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgRW5kSWYgYWN0aW9uXG4gKiBAbW9kdWxlIEVuZElmXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIElBY3Rpb24ge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgXHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyIFx0XHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5kSWYgaW1wbGVtZW50cyBJQWN0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmVuZGlmXFxiL2k7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBBcnJheSBvZiBjb25kaXRpb25zIGF2YWlsYWJsZSB0byB0aGlzIGFjdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY29uZGl0aW9ucyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW107XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwdWJsaWMgdmFyaWFibGU6IGFueTtcbiAgICBwdWJsaWMgY29uZGl0aW9uOiBJQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBzdXBwb3J0ZXI6IENvbW1hbmQ7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjb21tYW5kOiBDb21tYW5kLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0fVxuXHQvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IHN0cmluZ3tcbiAgICAgICAgaWYoIXRoaXMuc3VwcG9ydGVyKSByZXR1cm4gRXJyb3JzLkluY29ycmVjdFN0YXRlbWVudCh0aGlzLCB0aGlzLnN0YXRlbWVudCk7XG4gICAgfVxuICAgIC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuXHQgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG5cdHB1YmxpYyBwZXJmb3JtKHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IElQZXJmb3JtUmVzdWx0IHtcblx0XHRyZXR1cm4ge3Jlc3VsdDogdGhpcy5pbm5lciwgcGFzc2VkOiB0cnVlfTtcblx0fSAgICBcbn0iLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIGludGVyZmFjZSBmb3IgYWxsIGFjdGlvbnMgdG8gYWRoZXJlIHRvXG4gKiBAaW50ZXJmYWNlIElBY3Rpb25cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5pbnRlcmZhY2UgSUFjdGlvbiB7XG4gICAgLy8gc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy8gc3RhdGljIGNvbmRpdGlvbnM6IElDb25kaXRpb25bXTtcblx0Ly8gc3RhdGljIGRlcGVuZGVudHM6IElBY3Rpb25bXTtcblx0dGVybWluYXRvcjogYm9vbGVhbjtcbiAgICB2YXJpYWJsZTogYW55O1xuICAgIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBzdXBwb3J0ZXI6IENvbW1hbmQ7XG4gICAgY29tbWFuZDogQ29tbWFuZDtcbiAgICBzdGF0ZW1lbnQ6IHN0cmluZztcbiAgICBpbm5lcjogc3RyaW5nO1xuICAgIHZhcmlhYmxlczogSVZhcmlhYmxlcztcblx0LyoqXG5cdCAqIEBtZXRob2RcbiAgICAgKiBAbWVtYmVyb2YgSUFjdGlvblxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcblx0ICogQHJldHVybnMgSVBlcmZvcm1SZXN1bHQge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cbiAgICB2YWxpZGF0ZSgpOnN0cmluZztcblx0cGVyZm9ybShwcmV2UGFzc2VkPzogYm9vbGVhbik6IElQZXJmb3JtUmVzdWx0O1xufVxuZXhwb3J0IGRlZmF1bHQgSUFjdGlvbjsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbmltcG9ydCB7RWxzZSwgRW5kSWZ9IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IHtJc05vdE51bGwsIElzTnVsbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBHcmVhdGVyVGhhbk9yRXF1YWwsIExlc3NUaGFuT3JFcXVhbCwgRXF1YWx9IGZyb20gJy4uL0NvbmRpdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgSWYgYWN0aW9uXG4gKiBAbW9kdWxlIElmXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElmIGltcGxlbWVudHMgSUFjdGlvbiB7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvXlxccyppZlxcYi9pO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBjb25kaXRpb25zID0gW0lzTm90TnVsbCwgSXNOdWxsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIEdyZWF0ZXJUaGFuT3JFcXVhbCwgTGVzc1RoYW5PckVxdWFsLCBFcXVhbF07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBBcnJheSBvZiBkZXBlbmRlbnQgYWN0aW9uc1xuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIGRlcGVuZGVudHMgPSBbRWxzZSwgRW5kSWZdO1xuXHRwdWJsaWMgdGVybWluYXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuXHRwdWJsaWMgdmFyaWFibGU6IGFueTtcblx0cHVibGljIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBwdWJsaWMgc3VwcG9ydGVyOiBDb21tYW5kO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY29tbWFuZDogQ29tbWFuZCwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5jb25kaXRpb24gPSB0aGlzLnBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcblx0fVxuXHQvKipcblx0ICogVHJ5IGFuZCBsb2NhdGUgYSBtYXRjaGluZyBjb25kaXRpb24gZnJvbSB0aGUgYXZhaWxhYmxlIGNvbmRpdGlvbnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgcmV0dXJuIG51bGwuXG4gICAgICogQG1lbWJlcm9mIElmXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50XHRcdC0gU3RhdGVtZW50IHRvIGNoZWNrIGNvbmRpdGlvbnMgYWdhaW5zdFxuXHQgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0LSBMaXN0IG9mIHZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG5cdCAqIEByZXR1cm5zIHtJQ29uZGl0aW9uIHwgbnVsbH1cdFx0LSBDb25kaXRpb24gdGhhdCBtYXRjaGVzIHdpdGhpbiB0aGUgc3RhdGVtZW50XG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VDb25kaXRpb24oc3RhdGVtZW50OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0Zm9yKHZhciBjb25kaXRpb24gb2YgSWYuY29uZGl0aW9ucyl7XG5cdFx0XHR2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goY29uZGl0aW9uLnJlZ2V4KTtcblx0XHRcdGlmKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDApIHJldHVybiBuZXcgY29uZGl0aW9uKG1hdGNoWzFdLCB2YXJpYWJsZXMsIG1hdGNoWzJdKTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6c3RyaW5ne1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cdC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBJZlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuXHQgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG5cdHB1YmxpYyBwZXJmb3JtKHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IElQZXJmb3JtUmVzdWx0e1xuXHRcdHJldHVybiB0aGlzLmNvbmRpdGlvbi5wZXJmb3JtKClcdFxuXHRcdFx0XHQ/IHtyZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZX0gXG5cdFx0XHRcdDoge3Jlc3VsdDogdGhpcy5jb21tYW5kLnRlcm1pbmF0aW9uKCksIHBhc3NlZDogZmFsc2V9O1xuXHR9XG59IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSA9PSBjb25kaXRpb25cbiAqIEBtb2R1bGUgRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcXVhbCBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcXVhbFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhcXHcrKVxccys9PVxccysoXFxkKykvaTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nKXt9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdID09PSB0aGlzLmNvbXBhcmF0aXZlO1xuXHR9XG59IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtOb3R9IGZyb20gJy4uL01vZGlmaWVycyc7XG5cbi8qKlxuICogVGhlID4gY29uZGl0aW9uXG4gKiBAbW9kdWxlIEdyZWF0ZXJUaGFuXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlYXRlclRoYW4gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgR3JlYXRlclRoYW5cbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZmllcnMgPSBbTm90XVxuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzKygoPzoke0dyZWF0ZXJUaGFuLm1vZGlmaWVycy5tYXAoeCA9PiBgJHt4LmlkZW50aWZpZXJzLmpvaW4oJ3wnKX1gKX18XFxcXHMqKSk+KFxcXFx3KilcXFxccysoXFxcXGQrKWAsICdpJyk7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZyl7fVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhblxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuXHRcdHJldHVybiBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPiBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcblx0fVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIG1vZHJlZ2V4KGtsYXNzOiBJQ29uZGl0aW9uKXtcbiAgICAgICAgXG4gICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuLyoqXG4gKiBUaGUgPj0gY29uZGl0aW9uXG4gKiBAbW9kdWxlIEdyZWF0ZXJUaGFuT3JFcXVhbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWF0ZXJUaGFuT3JFcXVhbCBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhbk9yRXF1YWxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC8oXFx3KylcXHMrPj1cXHMrKFxcZCspL2k7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZyl7fVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhbk9yRXF1YWxcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gcGFyc2VJbnQodGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0pID49IHBhcnNlSW50KHRoaXMuY29tcGFyYXRpdmUpO1xuXHR9XG59IiwiaW50ZXJmYWNlIElDb25kaXRpb24ge1xuICAgIC8vc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy9zdGF0aWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXTtcblx0Ly9zdGF0aWMgY3JlYXRlKHN0YXRlbWVudDogc3RyaW5nKTogSUNvbmRpdGlvbjtcblx0cGVyZm9ybSgpOmJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJQ29uZGl0aW9uOyIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuLyoqXG4gKiBUaGUgSXMgTm90IE51bGwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIElzTm90TnVsbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElzTm90TnVsbCBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc05vdE51bGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC8oXFx3KylcXHMraXNcXHMrbm90XFxzK251bGxcXHMqL2k7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZyl7fVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc05vdE51bGxcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcblx0fVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuLyoqXG4gKiBUaGUgSXMgTnVsbCBjb25kaXRpb25cbiAqIEBtb2R1bGUgSXNOdWxsXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSXNOdWxsIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIElzTnVsbFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICAgcHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhcXHcqKVxccytpc1xccytudWxsXFxzKi9pO1xuICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcpe31cbiAgICAgLyoqXG4gICAgICAqIEBtZW1iZXJvZiBJc051bGxcbiAgICAgICogQG1ldGhvZFxuICAgICAgKiBAcHVibGljXG4gICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICAqL1xuICAgICAgcHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuICAgICAgICAgIHJldHVybiB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSA9PSBudWxsO1xuICAgICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuLyoqXG4gKiBUaGUgPCBjb25kaXRpb25cbiAqIEBtb2R1bGUgTGVzc1RoYW5cbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXNzVGhhbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhblxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhcXHcrKVxccys8XFxzKyhcXGQrKS9pO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcpe31cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gcGFyc2VJbnQodGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0pIDwgcGFyc2VJbnQodGhpcy5jb21wYXJhdGl2ZSk7XG5cdH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbi8qKlxuICogVGhlIDw9IGNvbmRpdGlvblxuICogQG1vZHVsZSBMZXNzVGhhbk9yRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXNzVGhhbk9yRXF1YWwgaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5PckVxdWFsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFxcdyspXFxzKzw9XFxzKyhcXGQrKS9pO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcpe31cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5PckVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA8PSBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcblx0fVxufSIsIi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNVMXZaR2xtYVdWeUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpYzNKakwyMXZaR2xtYVdWeWN5OUpUVzlrYVdacFpYSXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWlKZGZRPT0iLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vdCB7XG4gICAgcHVibGljIHN0YXRpYyBpZGVudGlmaWVyczogc3RyaW5nW10gPSBbJyEnLCAnbm90XFxcXHMnXTtcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBcbiAgICB9XG59IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJUmVwbGFjZXIge1xuICAgIC8vc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy9zdGF0aWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElSZXBsYWNlcjsiLCJpbXBvcnQgSVJlcGxhY2VyIGZyb20gJy4vSVJlcGxhY2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSB2YXJpYWJsZSByZXBsYWNlciBmb3IgZW1iZWRkZWQgU1FpZ2dMIHZhcmlhYmxlc1xuICogQG1vZHVsZSBWYXJpYWJsZVJlcGxhY2VyXG4gKiBAc3RhdGljXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJUmVwbGFjZXJ9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhcmlhYmxlUmVwbGFjZXIgaW1wbGVtZW50cyBJUmVwbGFjZXIge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2c7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAgICAgICAgICAgICAtIFRleHQgdG8gc2VhcmNoIGZvciByZXBsYWNlbWVudHNcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICAgLSBUaGUgc3RyaW5nIHdpdGggdmFyaWFibGVzIHJlcGxhY2VkIFxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlcGxhY2UodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmd7XG5cdFx0cmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCAobWF0Y2gsICQxLCAkMikgPT4gJDErdmFyaWFibGVzWyQyXSk7XG5cdH1cbn0iXX0=
