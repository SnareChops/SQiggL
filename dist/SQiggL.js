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

},{"./Actions":1,"./CommandScope":3,"./Replacers":11}],3:[function(require,module,exports){
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

},{"./conditions/Equal":17,"./conditions/GreaterThan":18,"./conditions/GreaterThanOrEqual":19,"./conditions/IsNotNull":21,"./conditions/IsNull":22,"./conditions/LessThan":23,"./conditions/LessThanOrEqual":24}],5:[function(require,module,exports){
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

},{"./Parser":10}],10:[function(require,module,exports){
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

},{"./Command":2}],11:[function(require,module,exports){
var VariableReplacer_1 = require('./replacers/VariableReplacer');
exports.VariableReplacer = VariableReplacer_1.default;

},{"./replacers/VariableReplacer":26}],12:[function(require,module,exports){
var Main_1 = require('./Main');
window['SQiggL'] = window['SQiggL'] || {};
window['SQiggL'].parse = Main_1.parse;
window['SQiggL'].version = '0.1.0';
exports["default"] = Main_1.parse;

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

},{"../Errors":5}],15:[function(require,module,exports){

},{}],16:[function(require,module,exports){
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

},{"../Actions":1,"../Conditions":4}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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
    /**
     * @memberof GreaterThan
     * @static
     * @property {RegExp} The regex matcher
     */
    GreaterThan.regex = /(\w+)\s+>\s+(\d+)/i;
    return GreaterThan;
})();
exports["default"] = GreaterThan;

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){

},{}],26:[function(require,module,exports){
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

},{}]},{},[1,13,14,15,16,2,3,4,17,18,19,20,21,22,23,24,5,6,7,8,9,10,11,25,26,12])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRTY29wZS50cyIsInNyYy9Db25kaXRpb25zLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lQZXJmb3JtUmVzdWx0LnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9QYXJzZXIudHMiLCJzcmMvUmVwbGFjZXJzLnRzIiwic3JjL1NRaWdnTC50cyIsInNyYy9hY3Rpb25zL0Vsc2UudHMiLCJzcmMvYWN0aW9ucy9FbmRJZi50cyIsInNyYy9hY3Rpb25zL0lBY3Rpb24udHMiLCJzcmMvYWN0aW9ucy9JZi50cyIsInNyYy9jb25kaXRpb25zL0VxdWFsLnRzIiwic3JjL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4udHMiLCJzcmMvY29uZGl0aW9ucy9HcmVhdGVyVGhhbk9yRXF1YWwudHMiLCJzcmMvY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvSXNOb3ROdWxsLnRzIiwic3JjL2NvbmRpdGlvbnMvSXNOdWxsLnRzIiwic3JjL2NvbmRpdGlvbnMvTGVzc1RoYW4udHMiLCJzcmMvY29uZGl0aW9ucy9MZXNzVGhhbk9yRXF1YWwudHMiLCJzcmMvcmVwbGFjZXJzL0lSZXBsYWNlci50cyIsInNyYy9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLG1IQUFtSDtBQUNuSCxzQkFBK0IsaUJBQWlCLENBQUM7QUFBekMsZ0NBQXlDO0FBQ2pELHFCQUE4QixnQkFBZ0IsQ0FBQztBQUF2Qyw4QkFBdUM7QUFDL0MsbUJBQTRCLGNBQWMsQ0FBQztBQUFuQywwQkFBbUM7OztBQ0gzQyx3QkFBOEIsV0FBVyxDQUFDLENBQUE7QUFD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QUFDO0FBQUQsQ0FsQkEsQUFrQkMsSUFBQTtBQWxCRCxxQ0FrQkMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBOb3RlOiBUaGVzZSBhcmUgbG9hZGVkIGluIG9yZGVyLCBtYWtlIHN1cmUgYW55IGRlcGVuZGVudCBhY3Rpb25zIGFyZSBsaXN0ZWQgYWJvdmUgdGhlIGFjdGlvbiB0aGF0IHJlcXVpcmVzIHRoZW0uXG5leHBvcnQge2RlZmF1bHQgYXMgRW5kSWZ9IGZyb20gJy4vYWN0aW9ucy9FbmRJZic7XG5leHBvcnQge2RlZmF1bHQgYXMgRWxzZX0gZnJvbSAnLi9hY3Rpb25zL0Vsc2UnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIElmfSBmcm9tICcuL2FjdGlvbnMvSWYnOyIsImltcG9ydCB7SWYsIEVsc2UsIEVuZElmfSBmcm9tICcuL0FjdGlvbnMnO1xuaW1wb3J0IENvbW1hbmRTY29wZSBmcm9tICcuL0NvbW1hbmRTY29wZSc7XG5pbXBvcnQge1ZhcmlhYmxlUmVwbGFjZXJ9IGZyb20gJy4vUmVwbGFjZXJzJztcbmltcG9ydCB7SUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb24nO1xuaW1wb3J0IHtJUGVyZm9ybVJlc3VsdH0gZnJvbSAnLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIENvbW1hbmQgb2JqZWN0IHJlc3BvbnNpYmxlIGZvciBoYW5kbGluZyBhbGwgYWN0aW9ucywgY29uZGl0aW9ucywgYW5kIHZhcmlhYmxlcyB3aXRoaW4gaXQncyBzZWN0aW9uIG9mIHRoZSBxdWVyeVxuICogQG1vZHVsZSBDb21tYW5kXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAgICAgICAgICAgICAgICAtIEJlZ2lubmluZyBpbmRleCBvZiB0aGUgY29tbWFuZCBpbiB0aGUgb3JpZ2luYWwgcXVlcnkgc3RyaW5nXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoICAgICAgICAgICAgICAgLSBMZW5ndGggb2YgdGhlIHNlY3Rpb24gb2YgdGhlIG9yaWdpbmFsIHN0cmluZyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAgICAtIFN0YXRlbWVudCB3aXRoaW4gdGhlICd7eyUgJX19JyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAgICAtIFRleHQgdGhhdCBpbW1lZGlhdGVseSBmb2xsb3dzIHRoZSBzdGF0ZW1lbnQgdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gKiBAcHJvcGVydHkge251bWJlcn0gaW5kZXggICAgICAgICAgICAgLSBCZWdpbm5pbmcgaW5kZXggb2YgdGhlIGNvbW1hbmQgaW4gdGhlIG9yaWdpbmFsIHF1ZXJ5IHN0cmluZ1xuICogQHByb3BlcnR5IHtudW1iZXJ9IGxlbmd0aCAgICAgICAgICAgIC0gTGVuZ3RoIG9mIHRoZSBzZWN0aW9uIG9mIHRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgLSBTdGF0ZW1lbnQgd2l0aGluIHRoZSAne3slICV9fScgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgLSBUZXh0IHRoYXQgaW1tZWRpYXRlbHkgZm9sbG93cyB0aGUgc3RhdGVtZW50IHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGFjdGlvbnMgICAgICAgIC0gQXJyYXkgb2YgYWN0aW9ucyBhdmFpbGFibGUgdG8gU1FpZ2dMXG4gKiBAcHJvcGVydHkge0lSZXBsYWNlcltdfSByZXBsYWNlcnMgICAgLSBBcnJheSBvZiByZXBsYWNlcnMgYXZhaWxhYmxlIHRvIFNRaWdnTFxuICogQHByb3BlcnR5IHtDb21tYW5kU2NvcGV9IHNjb3BlICAgICAgIC0gSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZCwgc3VjaCBhcyBhdmFpbGFibGUgdmFyaWFibGVzIHtAc2VlIENvbW1hbmRTY29wZX1cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBkZXBlbmRlbnRzICAgICAtIEFycmF5IG9mIGNvbW1hbmRzIGRlcGVuZGVudCB0byB0aGlzIGNvbW1hbmQgICAgICAgIFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvZ207XG5cdHB1YmxpYyBhY3Rpb25zOiBhbnlbXSA9IFtJZiwgRWxzZSwgRW5kSWZdO1xuXHRwdWJsaWMgcmVwbGFjZXJzID0gW1ZhcmlhYmxlUmVwbGFjZXJdO1xuXHRwdWJsaWMgYWN0aW9uOiBJQWN0aW9uO1xuXHRwdWJsaWMgc2NvcGU6IENvbW1hbmRTY29wZSA9IG5ldyBDb21tYW5kU2NvcGUoKTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGxlbmd0aDpudW1iZXIsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdFx0dGhpcy5hY3Rpb24gPSB0aGlzLmV4dHJhY3Qoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcblx0fVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFjdGlvbnMgZnJvbSB0aGUgc3RhdGVtZW50XG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgIC0gU3RhdGVtZW50IHRvIGV4dHJhY3QgdGhlIGFjdGlvbnMgZnJvbVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgIC0gSW5uZXIgdGV4dCBmb3IgdGhlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtJQWN0aW9uIHwgbnVsbH0gICAgICAgIC0gVGhlIG1hdGNoaW5nIGFjdGlvbiBvciBudWxsIGlmIG5vIGFjdGlvbiB3YXMgZm91bmRcbiAgICAgKi9cdFxuXHRwdWJsaWMgZXh0cmFjdChzdGF0ZW1lbnQ6IHN0cmluZywgaW5uZXI6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogSUFjdGlvbntcblx0XHRmb3IodmFyIGFjdGlvbiBvZiB0aGlzLmFjdGlvbnMpe1xuXHRcdFx0aWYoYWN0aW9uLnJlZ2V4LnRlc3QodGhpcy5zdGF0ZW1lbnQpKSByZXR1cm4gbmV3IGFjdGlvbih0aGlzLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21tYW5kIGFuZCByZXR1cm4gdGhlIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhc3NlZCAgICAgIC0gSWYgdGhlIGNvbW1hbmQgaXMgYSBkZXBlbmRlbnQgdGhlbiB0aGlzIHdpbGwgcmVmbGVjdCBpZiB0aGUgcHJldmlvdXMgY29tbWFuZCBzdWNjZWVkZWQgb3IgZmFpbGVkXG4gICAgICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSAgICAtIFRoZSByZXN1bHQgb2YgdGhlIGNvbW1hbmQgZXhlY3V0aW9uIHtAc2VlIElQZXJmb3JtUmVzdWx0fVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybShwYXNzZWQ6IGJvb2xlYW4pOiBJUGVyZm9ybVJlc3VsdCB7XG5cdFx0dmFyIHJlc3VsdDogSVBlcmZvcm1SZXN1bHQgPSB0aGlzLmFjdGlvbi5wZXJmb3JtKHBhc3NlZCk7XG5cdFx0cmVzdWx0LnJlc3VsdCArPSB0aGlzLnBlcmZvcm1EZXBlbmRlbnRzKHJlc3VsdC5wYXNzZWQpO1xuXHRcdGZvcih2YXIgcmVwbGFjZXIgb2YgdGhpcy5yZXBsYWNlcnMpe1xuXHRcdFx0cmVzdWx0LnJlc3VsdCA9IHJlcGxhY2VyLnJlcGxhY2UocmVzdWx0LnJlc3VsdCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gY29tbWFuZHMgdGhhdCBhcmUgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmQgKHN1Yi1jb21tYW5kcylcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgc3ViLWNvbW1hbmQncyBleGVjdXRpb25cbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm1TY29wZSgpOiBzdHJpbmcge1xuXHRcdHZhciByZXQ6IHN0cmluZyA9ICcnLCBwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2U7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuc2NvcGUuY29tbWFuZHMpe1xuXHRcdFx0dmFyIHJlc3VsdCA9IGNvbW1hbmQucGVyZm9ybShwcmV2UGFzc2VkKTtcblx0XHRcdHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuXHRcdFx0cmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZCAgLSBJZiB0aGlzIGNvbW1hbmQgaXMgYSBkZXBlbmRlbnQgdGhlbiB0aGlzIHdpbGwgcmVmbGVjdCBpZiB0aGUgcHJldmlvdXMgY29tbWFuZCBzdWNjZWVkZWQgb3IgZmFpbGVkXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgZGVwZW5kZW50IGV4ZWN1dGlvbnMgKGNvbGxlY3RpdmVseSlcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm1EZXBlbmRlbnRzKHByZXZQYXNzZWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuXHRcdHZhciByZXQ6IHN0cmluZyA9ICcnO1xuXHRcdGZvcih2YXIgZGVwZW5kZW50IG9mIHRoaXMuZGVwZW5kZW50cyl7XG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVwZW5kZW50LnBlcmZvcm0ocHJldlBhc3NlZCk7XG5cdFx0XHRwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcblx0XHRcdHJldCArPSByZXN1bHQucmVzdWx0O1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIHRlcm1pbmF0aW9uIG9mIHRoZSBjb21tYW5kJ3MgYWN0aW9ucyBpZiBuZWVkZWQgKEZvciBleGFtcGxlIFwiRW5kSWZcIiBpcyBhIHRlcm1pbmF0b3Igb2YgXCJJZlwiLCBzbyB0aGlzIGVzc2VudGlhbGx5IG1lYW5zIHRvIGp1c3QgcHJpbnQgb3V0IHRoZSBzdHJpbmcgdGhhdCBmb2xsb3dzIFwiRW5kSWZcIilcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgYWN0aW9uJ3MgdGVybWluYXRvclxuICAgICAqL1xuXHRwdWJsaWMgdGVybWluYXRpb24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZS5jb21tYW5kcy5zb21lKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcilcblx0XHQ/IHRoaXMuc2NvcGUuY29tbWFuZHMuZmlsdGVyKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcilbMV0ucGVyZm9ybShmYWxzZSkucmVzdWx0XG5cdFx0OiAnJztcblx0fVxuXHQvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgaW5wdXR0ZWQgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIHRoZSBhY3Rpb24gZm9yIHRoaXMgY29tbWFuZFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgLSBUaGUgYWN0aW9uIHRvIGNoZWNrIGlmIGl0IGlzIGEgZGVwZW5kZW50IG9mIHRoaXMgY29tbWFuZCdzIGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgdGhpcyBjb21tYW5kJ3MgYWN0aW9uIFxuICAgICAqL1xuXHRwdWJsaWMgZGVwZW5kZW50KGFjdGlvbjogSUFjdGlvbik6IGJvb2xlYW4ge1xuXHRcdGZvcih2YXIgZGVwZW5kZW50IG9mIHRoaXMuYWN0aW9uLmNvbnN0cnVjdG9yWydkZXBlbmRlbnRzJ10pe1xuXHRcdFx0aWYoYWN0aW9uIGluc3RhbmNlb2YgPGFueT5kZXBlbmRlbnQpIHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn0iLCJpbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuLyoqXG4gKiBUaGUgQ29tbWFuZCBTY29wZSBvYmplY3RcbiAqIEBtb2R1bGUgQ29tbWFuZFNjb3BlXG4gKiBAY2xhc3NcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gSG9sZHMgdmFyaWFibGVzIGZvciB0aGUgc2NvcGVcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgd2l0aGluIHRoZSBzY29wZVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBkZXBlbmRlbnQgY29tbWFuZHMgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRTY29wZSB7XG5cdHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7fTtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBJc05vdE51bGx9IGZyb20gJy4vY29uZGl0aW9ucy9Jc05vdE51bGwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIElzTnVsbH0gZnJvbSAnLi9jb25kaXRpb25zL0lzTnVsbCc7XG5leHBvcnQge2RlZmF1bHQgYXMgR3JlYXRlclRoYW59IGZyb20gJy4vY29uZGl0aW9ucy9HcmVhdGVyVGhhbic7XG5leHBvcnQge2RlZmF1bHQgYXMgTGVzc1RoYW59IGZyb20gJy4vY29uZGl0aW9ucy9MZXNzVGhhbic7XG5leHBvcnQge2RlZmF1bHQgYXMgR3JlYXRlclRoYW5PckVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvR3JlYXRlclRoYW5PckVxdWFsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBMZXNzVGhhbk9yRXF1YWx9IGZyb20gJy4vY29uZGl0aW9ucy9MZXNzVGhhbk9yRXF1YWwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvRXF1YWwnO1xuIiwiaW1wb3J0IHtJQWN0aW9ufSBmcm9tICdhY3Rpb25zL0lBY3Rpb24nO1xuLyoqXG4gKiBNb2R1bGUgb2YgZXJyb3IgY2hlY2tlcnNcbiAqIEBtb2R1bGUgRXJyb3JzXG4gKiBAY2xhc3NcbiAqIEBzdGF0aWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JzIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRXJyb3JzXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgICAgIC0gQWN0aW9uIHRvIGNoZWNrIGZvciBhbiBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAtIFN0YXRlbWVudCB0byBjaGVjayBmb3IgYSBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9ICAgICAtIFRoZSBlcnJvciBtZXNzYWdlIGlmIGFueSwgb3RoZXJ3aXNlIG51bGwgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBJbmNvcnJlY3RTdGF0ZW1lbnQoYWN0aW9uOiBJQWN0aW9uLCBzdGF0ZW1lbnQ6IHN0cmluZyk6IHN0cmluZ3tcbiAgICAgICAgY29uc3QgYWN0aW9uczpzdHJpbmcgPSBhY3Rpb24uY29tbWFuZC5hY3Rpb25zLmZpbHRlcih4ID0+IHguZGVwZW5kZW50cy5zb21lKHkgPT4gYWN0aW9uIGluc3RhbmNlb2YgeSkpLm1hcCh4ID0+IHgubmFtZSkuam9pbignLCAnKTtcbiAgICAgICAgY29uc3QgZXJyb3I6IHN0cmluZyA9IGBJbmNvcnJlY3Qgc3RhdGVtZW50IGZvdW5kIGF0IFwiJHtzdGF0ZW1lbnR9XCIuICR7YWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ119IG11c3QgZm9sbG93ICR7YWN0aW9uc31gXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgfVxufSIsImludGVyZmFjZSBBcnJheTxUPntcblx0bGFzdCgpOiBUO1xufVxuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn0iLCJleHBvcnQgaW50ZXJmYWNlIElQZXJmb3JtUmVzdWx0IHtcblx0cmVzdWx0OiBzdHJpbmc7XG5cdHBhc3NlZD86IGJvb2xlYW47XG59IiwiZXhwb3J0IGludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogc3RyaW5nO1xufSIsImltcG9ydCBQYXJzZXIgZnJvbSAnLi9QYXJzZXInO1xuaW1wb3J0IHtJVmFyaWFibGVzfSBmcm9tICcuL0lWYXJpYWJsZXMnO1xuLyoqXG4gKiBUaGUgc3RhcnRpbmcgcG9pbnQgb2YgdGhlIGVudGlyZSBTUWlnZ0wgcGFyc2VyXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRTCBxdWVyeSB0byBydW4gU1FpZ2dMIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlcz99IHZhcmlhYmxlcyAgIC0gT3B0aW9uYWwgY29sbGVjdGlvbiBvZiB2YXJpYWJsZXMgZm9yIHlvdXIgU1FpZ2dMIHF1ZXJ5XG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAtIFRoZSBmdWxseSBwYXJzZWQgU1FMIHF1ZXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcyk6IHN0cmluZ3tcblx0dmFyIHBhcnNlciA9IG5ldyBQYXJzZXIoc3FsLCB2YXJpYWJsZXMpO1xuXHRyZXR1cm4gcGFyc2VyLnBhcnNlKCk7XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkV4dGVuc2lvbnMudHNcIiAvPlxuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcbmltcG9ydCB7SVZhcmlhYmxlc30gZnJvbSAnLi9JVmFyaWFibGVzJztcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG4vKipcbiAqIFRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAbW9kdWxlIFBhcnNlclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNxbCAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZm91bmQgaW4gdGhlIFNRaWdnTCBxdWVyeVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IHN0YWNrICAgICAgLSBDb21tYW5kIHN0YWNrIGZvciBzdG9yaW5nIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGVycm9yICAgICAgICAgLSBFcnJvciBzdHJpbmcgaWYgYW55IGVycm9ycyBhcmUgZm91bmQgaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXTtcblx0cHVibGljIHN0YWNrOiBDb21tYW5kW107XG4gICAgcHVibGljIGVycm9yOiBzdHJpbmc7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBzcWw6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG5cdFx0dGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgZXh0cmFjdChzcWw6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTpDb21tYW5kW117XG5cdFx0dmFyIG1hdGNoLCBjb21tYW5kczogQ29tbWFuZFtdID0gW10sIHN0YWNrOiBDb21tYW5kW10gPSBbXTtcblx0XHRDb21tYW5kLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUoKG1hdGNoID0gQ29tbWFuZC5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpe1xuXHRcdFx0dmFyIGZvdW5kID0gbmV3IENvbW1hbmQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpO1xuXHRcdFx0aWYoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuZGVwZW5kZW50KGZvdW5kLmFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHRzdGFjay5sYXN0KCkuZGVwZW5kZW50cy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgIXN0YWNrLmxhc3QoKS5hY3Rpb24udGVybWluYXRvcikge1xuXHRcdFx0XHRzdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0c3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0c3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdGNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGFyc2UoKTogc3RyaW5nIHtcblx0XHR2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBpZih0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuc3FsO1xuXHRcdGZvcih2YXIgY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcblx0XHRcdHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0xKTtcblx0XHRcdHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgVmFyaWFibGVSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlcic7IiwiaW1wb3J0IHtwYXJzZSBhcyBQYXJzZX0gZnJvbSAnLi9NYWluJzsgXG53aW5kb3dbJ1NRaWdnTCddID0gd2luZG93WydTUWlnZ0wnXSB8fCB7fTtcbndpbmRvd1snU1FpZ2dMJ10ucGFyc2UgPSBQYXJzZTtcbndpbmRvd1snU1FpZ2dMJ10udmVyc2lvbiA9ICcwLjEuMCc7XG5leHBvcnQgZGVmYXVsdCBQYXJzZTsiLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7SUFjdGlvbn0gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCB7SVBlcmZvcm1SZXN1bHR9IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCB7SVZhcmlhYmxlc30gZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgRXJyb3JzIGZyb20gJy4uL0Vycm9ycyc7XG5pbXBvcnQge0lDb25kaXRpb259IGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIEVsc2UgYWN0aW9uXG4gKiBAbW9kdWxlIEVsc2VcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgICAgICAgICAgICAgLSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAgICAtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgICAgLSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kICAgICAgICAgIC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgLSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbHNlIGltcGxlbWVudHMgSUFjdGlvbiB7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmVsc2VcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW107XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHVibGljIHZhcmlhYmxlOiBhbnk7XG5cdHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHR9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIGlmKCF0aGlzLnN1cHBvcnRlcikgcmV0dXJuIEVycm9ycy5JbmNvcnJlY3RTdGF0ZW1lbnQodGhpcywgdGhpcy5zdGF0ZW1lbnQpO1xuICAgIH1cblx0LyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVsc2Vcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdHtcblx0XHRyZXR1cm4gIXByZXZQYXNzZWQgPyB7cmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWV9IDoge3Jlc3VsdDogJycsIHBhc3NlZDogZmFsc2V9O1xuXHR9XG59IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQge0lBY3Rpb259IGZyb20gJy4vSUFjdGlvbic7XG5pbXBvcnQge0lQZXJmb3JtUmVzdWx0fSBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IEVycm9ycyBmcm9tICcuLi9FcnJvcnMnO1xuaW1wb3J0IHtJQ29uZGl0aW9ufSBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBFbmRJZiBhY3Rpb25cbiAqIEBtb2R1bGUgRW5kSWZcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMgSUFjdGlvbiB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmRJZiBpbXBsZW1lbnRzIElBY3Rpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL15cXHMqZW5kaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjb25kaXRpb25zID0gW107XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBBcnJheSBvZiBkZXBlbmRlbnQgYWN0aW9uc1xuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIGRlcGVuZGVudHMgPSBbXTtcblx0cHVibGljIHRlcm1pbmF0b3I6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHB1YmxpYyB2YXJpYWJsZTogYW55O1xuICAgIHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHR9XG5cdC8qKlxuICAgICAqIENoZWNrcyBmb3IgYW55IGtub3duIHN5bnRheCBlcnJvcnMgcmVnYXJkaW5nIHRoaXMgYWN0aW9uXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsaWRhdGUoKTogc3RyaW5ne1xuICAgICAgICBpZighdGhpcy5zdXBwb3J0ZXIpIHJldHVybiBFcnJvcnMuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9XG4gICAgLyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG5cdCAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0ge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cblx0cHVibGljIHBlcmZvcm0ocHJldlBhc3NlZDogYm9vbGVhbiA9IGZhbHNlKTogSVBlcmZvcm1SZXN1bHQge1xuXHRcdHJldHVybiB7cmVzdWx0OiB0aGlzLmlubmVyLCBwYXNzZWQ6IHRydWV9O1xuXHR9ICAgIFxufSIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtJUGVyZm9ybVJlc3VsdH0gZnJvbSAnLi4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IHtJVmFyaWFibGVzfSBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7SUNvbmRpdGlvbn0gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgaW50ZXJmYWNlIGZvciBhbGwgYWN0aW9ucyB0byBhZGhlcmUgdG9cbiAqIEBpbnRlcmZhY2UgSUFjdGlvblxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSUFjdGlvbiB7XG4gICAgLy8gc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy8gc3RhdGljIGNvbmRpdGlvbnM6IElDb25kaXRpb25bXTtcblx0Ly8gc3RhdGljIGRlcGVuZGVudHM6IElBY3Rpb25bXTtcblx0dGVybWluYXRvcjogYm9vbGVhbjtcbiAgICB2YXJpYWJsZTogYW55O1xuICAgIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBzdXBwb3J0ZXI6IENvbW1hbmQ7XG4gICAgY29tbWFuZDogQ29tbWFuZDtcbiAgICBzdGF0ZW1lbnQ6IHN0cmluZztcbiAgICBpbm5lcjogc3RyaW5nO1xuICAgIHZhcmlhYmxlczogSVZhcmlhYmxlcztcblx0LyoqXG5cdCAqIEBtZXRob2RcbiAgICAgKiBAbWVtYmVyb2YgSUFjdGlvblxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcblx0ICogQHJldHVybnMgSVBlcmZvcm1SZXN1bHQge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cbiAgICB2YWxpZGF0ZSgpOnN0cmluZztcblx0cGVyZm9ybShwcmV2UGFzc2VkPzogYm9vbGVhbik6IElQZXJmb3JtUmVzdWx0O1xufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb25kaXRpb25zL0lDb25kaXRpb24udHNcIiAvPlxuaW1wb3J0IHtFbHNlLCBFbmRJZn0gZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQge0lzTm90TnVsbCwgSXNOdWxsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIEdyZWF0ZXJUaGFuT3JFcXVhbCwgTGVzc1RoYW5PckVxdWFsLCBFcXVhbH0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7SUFjdGlvbn0gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCB7SVBlcmZvcm1SZXN1bHR9IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCB7SVZhcmlhYmxlc30gZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lDb25kaXRpb259IGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIElmIGFjdGlvblxuICogQG1vZHVsZSBJZlxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJZiBpbXBsZW1lbnRzIElBY3Rpb24ge1xuXHQvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL15cXHMqaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgY29uZGl0aW9ucyA9IFtJc05vdE51bGwsIElzTnVsbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBHcmVhdGVyVGhhbk9yRXF1YWwsIExlc3NUaGFuT3JFcXVhbCwgRXF1YWxdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW0Vsc2UsIEVuZElmXTtcblx0cHVibGljIHRlcm1pbmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHVibGljIHZhcmlhYmxlOiBhbnk7XG5cdHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdHRoaXMuY29uZGl0aW9uID0gdGhpcy5wYXJzZUNvbmRpdGlvbihzdGF0ZW1lbnQsIHZhcmlhYmxlcyk7XG5cdH1cblx0LyoqXG5cdCAqIFRyeSBhbmQgbG9jYXRlIGEgbWF0Y2hpbmcgY29uZGl0aW9uIGZyb20gdGhlIGF2YWlsYWJsZSBjb25kaXRpb25zIGZvciB0aGlzIGFjdGlvbi4gSWYgbm8gbWF0Y2ggaXMgZm91bmQsIHJldHVybiBudWxsLlxuICAgICAqIEBtZW1iZXJvZiBJZlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudFx0XHQtIFN0YXRlbWVudCB0byBjaGVjayBjb25kaXRpb25zIGFnYWluc3Rcblx0ICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdC0gTGlzdCBvZiB2YXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuXHQgKiBAcmV0dXJucyB7SUNvbmRpdGlvbiB8IG51bGx9XHRcdC0gQ29uZGl0aW9uIHRoYXQgbWF0Y2hlcyB3aXRoaW4gdGhlIHN0YXRlbWVudFxuXHQgKi9cblx0cHVibGljIHBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdGZvcih2YXIgY29uZGl0aW9uIG9mIElmLmNvbmRpdGlvbnMpe1xuXHRcdFx0dmFyIG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKGNvbmRpdGlvbi5yZWdleCk7XG5cdFx0XHRpZihtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAwKSByZXR1cm4gbmV3IGNvbmRpdGlvbihtYXRjaFsxXSwgdmFyaWFibGVzLCBtYXRjaFsyXSk7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZSgpOnN0cmluZ3tcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXHQvKipcblx0ICogUGVyZm9ybSB0aGUgYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgKiBAbWVtYmVyb2YgSWZcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdHtcblx0XHRyZXR1cm4gdGhpcy5jb25kaXRpb24ucGVyZm9ybSgpXHRcblx0XHRcdFx0PyB7cmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWV9IFxuXHRcdFx0XHQ6IHtyZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlfTtcblx0fVxufSIsImltcG9ydCB7SUNvbmRpdGlvbn0gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcbmltcG9ydCB7SVZhcmlhYmxlc30gZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbi8qKlxuICogVGhlID09IGNvbmRpdGlvblxuICogQG1vZHVsZSBFcXVhbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWFsIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVxdWFsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFxcdyspXFxzKz09XFxzKyhcXGQrKS9pO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcpe31cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRXF1YWxcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gPT09IHRoaXMuY29tcGFyYXRpdmU7XG5cdH1cbn0iLCJpbXBvcnQge0lDb25kaXRpb259IGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5pbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSA+IGNvbmRpdGlvblxuICogQG1vZHVsZSBHcmVhdGVyVGhhblxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWF0ZXJUaGFuIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFxcdyspXFxzKz5cXHMrKFxcZCspL2k7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZyl7fVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhblxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuXHRcdHJldHVybiBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPiBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcblx0fVxufSIsImltcG9ydCB7SUNvbmRpdGlvbn0gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcbmltcG9ydCB7SVZhcmlhYmxlc30gZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbi8qKlxuICogVGhlID49IGNvbmRpdGlvblxuICogQG1vZHVsZSBHcmVhdGVyVGhhbk9yRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmVhdGVyVGhhbk9yRXF1YWwgaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgR3JlYXRlclRoYW5PckVxdWFsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFxcdyspXFxzKz49XFxzKyhcXGQrKS9pO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcpe31cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgR3JlYXRlclRoYW5PckVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA+PSBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcblx0fVxufSIsImV4cG9ydCBpbnRlcmZhY2UgSUNvbmRpdGlvbiB7XG5cdC8vc3RhdGljIGNyZWF0ZShzdGF0ZW1lbnQ6IHN0cmluZyk6IElDb25kaXRpb247XG5cdHBlcmZvcm0oKTpib29sZWFuO1xufSIsImltcG9ydCB7SUNvbmRpdGlvbn0gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcbmltcG9ydCB7SVZhcmlhYmxlc30gZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbi8qKlxuICogVGhlIElzIE5vdCBOdWxsIGNvbmRpdGlvblxuICogQG1vZHVsZSBJc05vdE51bGxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJc05vdE51bGwgaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOb3ROdWxsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFxcdyspXFxzK2lzXFxzK25vdFxccytudWxsXFxzKi9pO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcpe31cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOb3ROdWxsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGw7XG5cdH1cbn0iLCJpbXBvcnQge0lDb25kaXRpb259IGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5pbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSBJcyBOdWxsIGNvbmRpdGlvblxuICogQG1vZHVsZSBJc051bGxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJc051bGwgaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOdWxsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFxcdyopXFxzK2lzXFxzK251bGxcXHMqL2k7XG4gICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZyl7fVxuICAgICAvKipcbiAgICAgICogQG1lbWJlcm9mIElzTnVsbFxuICAgICAgKiBAbWV0aG9kXG4gICAgICAqIEBwdWJsaWNcbiAgICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgICovXG4gICAgICBwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdID09IG51bGw7XG4gICAgICB9XG59IiwiaW1wb3J0IHtJQ29uZGl0aW9ufSBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuaW1wb3J0IHtJVmFyaWFibGVzfSBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuLyoqXG4gKiBUaGUgPCBjb25kaXRpb25cbiAqIEBtb2R1bGUgTGVzc1RoYW5cbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXNzVGhhbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhblxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhcXHcrKVxccys8XFxzKyhcXGQrKS9pO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcpe31cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gcGFyc2VJbnQodGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0pIDwgcGFyc2VJbnQodGhpcy5jb21wYXJhdGl2ZSk7XG5cdH1cbn0iLCJpbXBvcnQge0lDb25kaXRpb259IGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5pbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSA8PSBjb25kaXRpb25cbiAqIEBtb2R1bGUgTGVzc1RoYW5PckVxdWFsXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVzc1RoYW5PckVxdWFsIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIExlc3NUaGFuT3JFcXVhbFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhcXHcrKVxccys8PVxccysoXFxkKykvaTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nKXt9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIExlc3NUaGFuT3JFcXVhbFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuXHRcdHJldHVybiBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPD0gcGFyc2VJbnQodGhpcy5jb21wYXJhdGl2ZSk7XG5cdH1cbn0iLCJpbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIElSZXBsYWNlciB7XG4gICAgLy9zdGF0aWMgcmVnZXg6IFJlZ0V4cDtcbiAgICAvL3N0YXRpYyByZXBsYWNlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5nO1xufSIsImltcG9ydCB7SVJlcGxhY2VyfSBmcm9tICcuL0lSZXBsYWNlcic7XG5pbXBvcnQge0lWYXJpYWJsZXN9IGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSB2YXJpYWJsZSByZXBsYWNlciBmb3IgZW1iZWRkZWQgU1FpZ2dMIHZhcmlhYmxlc1xuICogQG1vZHVsZSBWYXJpYWJsZVJlcGxhY2VyXG4gKiBAc3RhdGljXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJUmVwbGFjZXJ9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhcmlhYmxlUmVwbGFjZXIgaW1wbGVtZW50cyBJUmVwbGFjZXIge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2c7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAgICAgICAgICAgICAtIFRleHQgdG8gc2VhcmNoIGZvciByZXBsYWNlbWVudHNcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICAgLSBUaGUgc3RyaW5nIHdpdGggdmFyaWFibGVzIHJlcGxhY2VkIFxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlcGxhY2UodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmd7XG5cdFx0cmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCAobWF0Y2gsICQxLCAkMikgPT4gJDErdmFyaWFibGVzWyQyXSk7XG5cdH1cbn0iXX0=
