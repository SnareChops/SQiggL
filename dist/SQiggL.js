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
        this.scope = new CommandScope_1.default();
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
exports.default = Command;

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
exports.default = CommandScope;

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
/**
 * The starting point of the entire SQiggL parser
 * @function
 * @param {string} sql              - The SQL query to run SQiggL against
 * @param {IVariables?} variables   - Optional collection of variables for your SQiggL query
 * @return {string}                 - The fully parsed SQL query
 */
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
exports.default = Parser;

},{"./Command":2}],11:[function(require,module,exports){
var VariableReplacer_1 = require('./replacers/VariableReplacer');
exports.VariableReplacer = VariableReplacer_1.default;

},{"./replacers/VariableReplacer":26}],12:[function(require,module,exports){
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
exports.default = If;

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
exports.default = Equal;

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
exports.default = GreaterThan;

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
exports.default = GreaterThanOrEqual;

},{}],20:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],21:[function(require,module,exports){
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
exports.default = IsNotNull;

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
exports.default = IsNull;

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
exports.default = LessThan;

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
exports.default = LessThanOrEqual;

},{}],25:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],26:[function(require,module,exports){
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
exports.default = VariableReplacer;

},{}]},{},[1,13,14,15,16,2,3,4,17,18,19,20,21,22,23,24,5,6,7,8,9,10,11,25,26,12])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0Vycm9ycy5qcyIsInNyYy9FeHRlbnNpb25zLmpzIiwic3JjL0lQZXJmb3JtUmVzdWx0LmpzIiwic3JjL01haW4uanMiLCJzcmMvUGFyc2VyLmpzIiwic3JjL1JlcGxhY2Vycy5qcyIsInNyYy9TUWlnZ0wuanMiLCJzcmMvYWN0aW9ucy9FbHNlLmpzIiwic3JjL2FjdGlvbnMvRW5kSWYuanMiLCJzcmMvYWN0aW9ucy9JZi5qcyIsInNyYy9jb25kaXRpb25zL0VxdWFsLmpzIiwic3JjL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4uanMiLCJzcmMvY29uZGl0aW9ucy9HcmVhdGVyVGhhbk9yRXF1YWwuanMiLCJzcmMvY29uZGl0aW9ucy9Jc05vdE51bGwuanMiLCJzcmMvY29uZGl0aW9ucy9Jc051bGwuanMiLCJzcmMvY29uZGl0aW9ucy9MZXNzVGhhbi5qcyIsInNyYy9jb25kaXRpb25zL0xlc3NUaGFuT3JFcXVhbC5qcyIsInNyYy9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOzs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBOb3RlOiBUaGVzZSBhcmUgbG9hZGVkIGluIG9yZGVyLCBtYWtlIHN1cmUgYW55IGRlcGVuZGVudCBhY3Rpb25zIGFyZSBsaXN0ZWQgYWJvdmUgdGhlIGFjdGlvbiB0aGF0IHJlcXVpcmVzIHRoZW0uXG52YXIgRW5kSWZfMSA9IHJlcXVpcmUoJy4vYWN0aW9ucy9FbmRJZicpO1xuZXhwb3J0cy5FbmRJZiA9IEVuZElmXzEuZGVmYXVsdDtcbnZhciBFbHNlXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvRWxzZScpO1xuZXhwb3J0cy5FbHNlID0gRWxzZV8xLmRlZmF1bHQ7XG52YXIgSWZfMSA9IHJlcXVpcmUoJy4vYWN0aW9ucy9JZicpO1xuZXhwb3J0cy5JZiA9IElmXzEuZGVmYXVsdDtcbiIsInZhciBBY3Rpb25zXzEgPSByZXF1aXJlKCcuL0FjdGlvbnMnKTtcbnZhciBDb21tYW5kU2NvcGVfMSA9IHJlcXVpcmUoJy4vQ29tbWFuZFNjb3BlJyk7XG52YXIgUmVwbGFjZXJzXzEgPSByZXF1aXJlKCcuL1JlcGxhY2VycycpO1xuLyoqXG4gKiBDb21tYW5kIG9iamVjdCByZXNwb25zaWJsZSBmb3IgaGFuZGxpbmcgYWxsIGFjdGlvbnMsIGNvbmRpdGlvbnMsIGFuZCB2YXJpYWJsZXMgd2l0aGluIGl0J3Mgc2VjdGlvbiBvZiB0aGUgcXVlcnlcbiAqIEBtb2R1bGUgQ29tbWFuZFxuICogQGNsYXNzXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggICAgICAgICAgICAgICAgLSBCZWdpbm5pbmcgaW5kZXggb2YgdGhlIGNvbW1hbmQgaW4gdGhlIG9yaWdpbmFsIHF1ZXJ5IHN0cmluZ1xuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAgICAgICAgICAgICAgIC0gTGVuZ3RoIG9mIHRoZSBzZWN0aW9uIG9mIHRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgICAgLSBTdGF0ZW1lbnQgd2l0aGluIHRoZSAne3slICV9fScgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgICAgLSBUZXh0IHRoYXQgaW1tZWRpYXRlbHkgZm9sbG93cyB0aGUgc3RhdGVtZW50IHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICogQHByb3BlcnR5IHtudW1iZXJ9IGluZGV4ICAgICAgICAgICAgIC0gQmVnaW5uaW5nIGluZGV4IG9mIHRoZSBjb21tYW5kIGluIHRoZSBvcmlnaW5hbCBxdWVyeSBzdHJpbmdcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBsZW5ndGggICAgICAgICAgICAtIExlbmd0aCBvZiB0aGUgc2VjdGlvbiBvZiB0aGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgIC0gU3RhdGVtZW50IHdpdGhpbiB0aGUgJ3t7JSAlfX0nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgIC0gVGV4dCB0aGF0IGltbWVkaWF0ZWx5IGZvbGxvd3MgdGhlIHN0YXRlbWVudCB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBhY3Rpb25zICAgICAgICAtIEFycmF5IG9mIGFjdGlvbnMgYXZhaWxhYmxlIHRvIFNRaWdnTFxuICogQHByb3BlcnR5IHtJUmVwbGFjZXJbXX0gcmVwbGFjZXJzICAgIC0gQXJyYXkgb2YgcmVwbGFjZXJzIGF2YWlsYWJsZSB0byBTUWlnZ0xcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFNjb3BlfSBzY29wZSAgICAgICAtIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmQsIHN1Y2ggYXMgYXZhaWxhYmxlIHZhcmlhYmxlcyB7QHNlZSBDb21tYW5kU2NvcGV9XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gZGVwZW5kZW50cyAgICAgLSBBcnJheSBvZiBjb21tYW5kcyBkZXBlbmRlbnQgdG8gdGhpcyBjb21tYW5kXG4gKi9cbnZhciBDb21tYW5kID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kKGluZGV4LCBsZW5ndGgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBbQWN0aW9uc18xLklmLCBBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICAgICAgdGhpcy5yZXBsYWNlcnMgPSBbUmVwbGFjZXJzXzEuVmFyaWFibGVSZXBsYWNlcl07XG4gICAgICAgIHRoaXMuc2NvcGUgPSBuZXcgQ29tbWFuZFNjb3BlXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuYWN0aW9uID0gdGhpcy5leHRyYWN0KHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgYWN0aW9ucyBmcm9tIHRoZSBzdGF0ZW1lbnRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgLSBTdGF0ZW1lbnQgdG8gZXh0cmFjdCB0aGUgYWN0aW9ucyBmcm9tXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgLSBJbm5lciB0ZXh0IGZvciB0aGUgY29tbWFuZFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gICAgICogQHJldHVybnMge0lBY3Rpb24gfCBudWxsfSAgICAgICAgLSBUaGUgbWF0Y2hpbmcgYWN0aW9uIG9yIG51bGwgaWYgbm8gYWN0aW9uIHdhcyBmb3VuZFxuICAgICAqL1xuICAgIENvbW1hbmQucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmFjdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5yZWdleC50ZXN0KHRoaXMuc3RhdGVtZW50KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGFjdGlvbih0aGlzLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUGVyZm9ybSB0aGUgY29tbWFuZCBhbmQgcmV0dXJuIHRoZSByZXN1bHRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwYXNzZWQgICAgICAtIElmIHRoZSBjb21tYW5kIGlzIGEgZGVwZW5kZW50IHRoZW4gdGhpcyB3aWxsIHJlZmxlY3QgaWYgdGhlIHByZXZpb3VzIGNvbW1hbmQgc3VjY2VlZGVkIG9yIGZhaWxlZFxuICAgICAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0gICAgLSBUaGUgcmVzdWx0IG9mIHRoZSBjb21tYW5kIGV4ZWN1dGlvbiB7QHNlZSBJUGVyZm9ybVJlc3VsdH1cbiAgICAgKi9cbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHBhc3NlZCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5hY3Rpb24ucGVyZm9ybShwYXNzZWQpO1xuICAgICAgICByZXN1bHQucmVzdWx0ICs9IHRoaXMucGVyZm9ybURlcGVuZGVudHMocmVzdWx0LnBhc3NlZCk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnJlcGxhY2VyczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciByZXBsYWNlciA9IF9hW19pXTtcbiAgICAgICAgICAgIHJlc3VsdC5yZXN1bHQgPSByZXBsYWNlci5yZXBsYWNlKHJlc3VsdC5yZXN1bHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZCAoc3ViLWNvbW1hbmRzKVxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBzdWItY29tbWFuZCdzIGV4ZWN1dGlvblxuICAgICAqL1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm1TY29wZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJldCA9ICcnLCBwcmV2UGFzc2VkID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnNjb3BlLmNvbW1hbmRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gY29tbWFuZC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuICAgICAgICAgICAgcHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG4gICAgICAgICAgICByZXQgKz0gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZCAgLSBJZiB0aGlzIGNvbW1hbmQgaXMgYSBkZXBlbmRlbnQgdGhlbiB0aGlzIHdpbGwgcmVmbGVjdCBpZiB0aGUgcHJldmlvdXMgY29tbWFuZCBzdWNjZWVkZWQgb3IgZmFpbGVkXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgZGVwZW5kZW50IGV4ZWN1dGlvbnMgKGNvbGxlY3RpdmVseSlcbiAgICAgKi9cbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtRGVwZW5kZW50cyA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIHZhciByZXQgPSAnJztcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuZGVwZW5kZW50czsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBkZXBlbmRlbnQgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZGVwZW5kZW50LnBlcmZvcm0ocHJldlBhc3NlZCk7XG4gICAgICAgICAgICBwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcbiAgICAgICAgICAgIHJldCArPSByZXN1bHQucmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSB0ZXJtaW5hdGlvbiBvZiB0aGUgY29tbWFuZCdzIGFjdGlvbnMgaWYgbmVlZGVkIChGb3IgZXhhbXBsZSBcIkVuZElmXCIgaXMgYSB0ZXJtaW5hdG9yIG9mIFwiSWZcIiwgc28gdGhpcyBlc3NlbnRpYWxseSBtZWFucyB0byBqdXN0IHByaW50IG91dCB0aGUgc3RyaW5nIHRoYXQgZm9sbG93cyBcIkVuZElmXCIpXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSByZXN1bHQgb2YgdGhlIGFjdGlvbidzIHRlcm1pbmF0b3JcbiAgICAgKi9cbiAgICBDb21tYW5kLnByb3RvdHlwZS50ZXJtaW5hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGUuY29tbWFuZHMuc29tZShmdW5jdGlvbiAoY29tbWFuZCkgeyByZXR1cm4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcjsgfSlcbiAgICAgICAgICAgID8gdGhpcy5zY29wZS5jb21tYW5kcy5maWx0ZXIoZnVuY3Rpb24gKGNvbW1hbmQpIHsgcmV0dXJuIGNvbW1hbmQuYWN0aW9uLnRlcm1pbmF0b3I7IH0pWzFdLnBlcmZvcm0oZmFsc2UpLnJlc3VsdFxuICAgICAgICAgICAgOiAnJztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBpbnB1dHRlZCBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgdGhlIGFjdGlvbiBmb3IgdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAtIFRoZSBhY3Rpb24gdG8gY2hlY2sgaWYgaXQgaXMgYSBkZXBlbmRlbnQgb2YgdGhpcyBjb21tYW5kJ3MgYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiB0aGlzIGNvbW1hbmQncyBhY3Rpb25cbiAgICAgKi9cbiAgICBDb21tYW5kLnByb3RvdHlwZS5kZXBlbmRlbnQgPSBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmFjdGlvbi5jb25zdHJ1Y3RvclsnZGVwZW5kZW50cyddOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGRlcGVuZGVudCA9IF9hW19pXTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gaW5zdGFuY2VvZiBkZXBlbmRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgQ29tbWFuZC5yZWdleCA9IC97eyUoLio/KSV9fShbXFxzXFxTXSo/KT8oPz0oPzp7eyV8JCkpL2dtO1xuICAgIHJldHVybiBDb21tYW5kO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvbW1hbmQ7XG4iLCIvKipcbiAqIFRoZSBDb21tYW5kIFNjb3BlIG9iamVjdFxuICogQG1vZHVsZSBDb21tYW5kU2NvcGVcbiAqIEBjbGFzc1xuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBIb2xkcyB2YXJpYWJsZXMgZm9yIHRoZSBzY29wZVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyB3aXRoaW4gdGhlIHNjb3BlXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGRlcGVuZGVudCBjb21tYW5kc1xuICovXG52YXIgQ29tbWFuZFNjb3BlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kU2NvcGUoKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0ge307XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzID0gW107XG4gICAgfVxuICAgIHJldHVybiBDb21tYW5kU2NvcGU7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29tbWFuZFNjb3BlO1xuIiwidmFyIElzTm90TnVsbF8xID0gcmVxdWlyZSgnLi9jb25kaXRpb25zL0lzTm90TnVsbCcpO1xuZXhwb3J0cy5Jc05vdE51bGwgPSBJc05vdE51bGxfMS5kZWZhdWx0O1xudmFyIElzTnVsbF8xID0gcmVxdWlyZSgnLi9jb25kaXRpb25zL0lzTnVsbCcpO1xuZXhwb3J0cy5Jc051bGwgPSBJc051bGxfMS5kZWZhdWx0O1xudmFyIEdyZWF0ZXJUaGFuXzEgPSByZXF1aXJlKCcuL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4nKTtcbmV4cG9ydHMuR3JlYXRlclRoYW4gPSBHcmVhdGVyVGhhbl8xLmRlZmF1bHQ7XG52YXIgTGVzc1RoYW5fMSA9IHJlcXVpcmUoJy4vY29uZGl0aW9ucy9MZXNzVGhhbicpO1xuZXhwb3J0cy5MZXNzVGhhbiA9IExlc3NUaGFuXzEuZGVmYXVsdDtcbnZhciBHcmVhdGVyVGhhbk9yRXF1YWxfMSA9IHJlcXVpcmUoJy4vY29uZGl0aW9ucy9HcmVhdGVyVGhhbk9yRXF1YWwnKTtcbmV4cG9ydHMuR3JlYXRlclRoYW5PckVxdWFsID0gR3JlYXRlclRoYW5PckVxdWFsXzEuZGVmYXVsdDtcbnZhciBMZXNzVGhhbk9yRXF1YWxfMSA9IHJlcXVpcmUoJy4vY29uZGl0aW9ucy9MZXNzVGhhbk9yRXF1YWwnKTtcbmV4cG9ydHMuTGVzc1RoYW5PckVxdWFsID0gTGVzc1RoYW5PckVxdWFsXzEuZGVmYXVsdDtcbnZhciBFcXVhbF8xID0gcmVxdWlyZSgnLi9jb25kaXRpb25zL0VxdWFsJyk7XG5leHBvcnRzLkVxdWFsID0gRXF1YWxfMS5kZWZhdWx0O1xuIiwiLyoqXG4gKiBNb2R1bGUgb2YgZXJyb3IgY2hlY2tlcnNcbiAqIEBtb2R1bGUgRXJyb3JzXG4gKiBAY2xhc3NcbiAqIEBzdGF0aWNcbiAqL1xudmFyIEVycm9ycyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXJyb3JzKCkge1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRXJyb3JzXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgICAgIC0gQWN0aW9uIHRvIGNoZWNrIGZvciBhbiBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAtIFN0YXRlbWVudCB0byBjaGVjayBmb3IgYSBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9ICAgICAtIFRoZSBlcnJvciBtZXNzYWdlIGlmIGFueSwgb3RoZXJ3aXNlIG51bGxcbiAgICAgKi9cbiAgICBFcnJvcnMuSW5jb3JyZWN0U3RhdGVtZW50ID0gZnVuY3Rpb24gKGFjdGlvbiwgc3RhdGVtZW50KSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0gYWN0aW9uLmNvbW1hbmQuYWN0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHguZGVwZW5kZW50cy5zb21lKGZ1bmN0aW9uICh5KSB7IHJldHVybiBhY3Rpb24gaW5zdGFuY2VvZiB5OyB9KTsgfSkubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Lm5hbWU7IH0pLmpvaW4oJywgJyk7XG4gICAgICAgIHZhciBlcnJvciA9IFwiSW5jb3JyZWN0IHN0YXRlbWVudCBmb3VuZCBhdCBcXFwiXCIgKyBzdGF0ZW1lbnQgKyBcIlxcXCIuIFwiICsgYWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ10gKyBcIiBtdXN0IGZvbGxvdyBcIiArIGFjdGlvbnM7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgfTtcbiAgICByZXR1cm4gRXJyb3JzO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVycm9ycztcbiIsIkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xuIiwiXG4iLCJ2YXIgUGFyc2VyXzEgPSByZXF1aXJlKCcuL1BhcnNlcicpO1xuLyoqXG4gKiBUaGUgc3RhcnRpbmcgcG9pbnQgb2YgdGhlIGVudGlyZSBTUWlnZ0wgcGFyc2VyXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRTCBxdWVyeSB0byBydW4gU1FpZ2dMIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlcz99IHZhcmlhYmxlcyAgIC0gT3B0aW9uYWwgY29sbGVjdGlvbiBvZiB2YXJpYWJsZXMgZm9yIHlvdXIgU1FpZ2dMIHF1ZXJ5XG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAtIFRoZSBmdWxseSBwYXJzZWQgU1FMIHF1ZXJ5XG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXJfMS5kZWZhdWx0KHNxbCwgdmFyaWFibGVzKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlKCk7XG59XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRXh0ZW5zaW9ucy50c1wiIC8+XG52YXIgQ29tbWFuZF8xID0gcmVxdWlyZSgnLi9Db21tYW5kJyk7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xufTtcbi8qKlxuICogVGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBtb2R1bGUgUGFyc2VyXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3FsICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyBmb3VuZCBpbiB0aGUgU1FpZ2dMIHF1ZXJ5XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gc3RhY2sgICAgICAtIENvbW1hbmQgc3RhY2sgZm9yIHN0b3JpbmcgY3VycmVudCBwb3NpdGlvbiBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXJyb3IgICAgICAgICAtIEVycm9yIHN0cmluZyBpZiBhbnkgZXJyb3JzIGFyZSBmb3VuZCBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKi9cbnZhciBQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnNlcihzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuICAgIFBhcnNlci5wcm90b3R5cGUuZXh0cmFjdCA9IGZ1bmN0aW9uIChzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB2YXIgbWF0Y2gsIGNvbW1hbmRzID0gW10sIHN0YWNrID0gW107XG4gICAgICAgIENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHdoaWxlICgobWF0Y2ggPSBDb21tYW5kXzEuZGVmYXVsdC5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBmb3VuZCA9IG5ldyBDb21tYW5kXzEuZGVmYXVsdChtYXRjaC5pbmRleCwgbWF0Y2guaW5wdXQubGVuZ3RoLCBtYXRjaFsxXSwgbWF0Y2hbMl0sIHZhcmlhYmxlcyk7XG4gICAgICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuZGVwZW5kZW50KGZvdW5kLmFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuICAgICAgICAgICAgICAgIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiAhc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSB7XG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChmb3VuZCk7XG4gICAgICAgICAgICAgICAgc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKVxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgICAgICBjb21tYW5kcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBlcnJvciA9IGZvdW5kLmFjdGlvbi52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSdW4gdGhlIGNvbW1hbmRzIGFnYWluc3QgdGhlIHN0cmluZyBhbmQgb3V0cHV0IHRoZSBlbmQgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGVuZCByZXN1bHQgb2YgcnVubmluZyBhbGwgY29tbWFuZHMgYWdhaW5zdCB0aGUgU1FpZ2dMIHF1ZXJ5XG4gICAgICovXG4gICAgUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gJycsIGluZGV4ID0gMDtcbiAgICAgICAgaWYgKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3FsO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgcXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLSAxKTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuICAgICAgICAgICAgaW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXJ5OyAvL1RPRE9cbiAgICB9O1xuICAgIHJldHVybiBQYXJzZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gUGFyc2VyO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXJfMSA9IHJlcXVpcmUoJy4vcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXInKTtcbmV4cG9ydHMuVmFyaWFibGVSZXBsYWNlciA9IFZhcmlhYmxlUmVwbGFjZXJfMS5kZWZhdWx0O1xuIiwidmFyIE1haW5fMSA9IHJlcXVpcmUoJy4vTWFpbicpO1xud2luZG93WydTUWlnZ0wnXSA9IHdpbmRvd1snU1FpZ2dMJ10gfHwge307XG53aW5kb3dbJ1NRaWdnTCddLnBhcnNlID0gTWFpbl8xLnBhcnNlO1xud2luZG93WydTUWlnZ0wnXS52ZXJzaW9uID0gJzAuMS4wJztcbmV4cG9ydHMuZGVmYXVsdCA9IE1haW5fMS5wYXJzZTtcbiIsInZhciBFcnJvcnNfMSA9IHJlcXVpcmUoJy4uL0Vycm9ycycpO1xuLyoqXG4gKiBUaGUgRWxzZSBhY3Rpb25cbiAqIEBtb2R1bGUgRWxzZVxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAgICAgICAgICAgICAtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgICAgIC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAgICAtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgICAgICAgICAgLSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG52YXIgRWxzZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRWxzZShjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMudGVybWluYXRvciA9IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBFbHNlLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlcilcbiAgICAgICAgICAgIHJldHVybiBFcnJvcnNfMS5kZWZhdWx0LkluY29ycmVjdFN0YXRlbWVudCh0aGlzLCB0aGlzLnN0YXRlbWVudCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG4gICAgICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG4gICAgICovXG4gICAgRWxzZS5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIGlmIChwcmV2UGFzc2VkID09PSB2b2lkIDApIHsgcHJldlBhc3NlZCA9IGZhbHNlOyB9XG4gICAgICAgIHJldHVybiAhcHJldlBhc3NlZCA/IHsgcmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWUgfSA6IHsgcmVzdWx0OiAnJywgcGFzc2VkOiBmYWxzZSB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgRWxzZS5yZWdleCA9IC9eXFxzKmVsc2VcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBFbHNlLmNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cbiAgICBFbHNlLmRlcGVuZGVudHMgPSBbXTtcbiAgICByZXR1cm4gRWxzZTtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBFbHNlO1xuIiwidmFyIEVycm9yc18xID0gcmVxdWlyZSgnLi4vRXJyb3JzJyk7XG4vKipcbiAqIFRoZSBFbmRJZiBhY3Rpb25cbiAqIEBtb2R1bGUgRW5kSWZcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMgSUFjdGlvbiB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbnZhciBFbmRJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5kSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgRW5kSWYucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVyKVxuICAgICAgICAgICAgcmV0dXJuIEVycm9yc18xLmRlZmF1bHQuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG4gICAgICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG4gICAgICovXG4gICAgRW5kSWYucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICBpZiAocHJldlBhc3NlZCA9PT0gdm9pZCAwKSB7IHByZXZQYXNzZWQgPSBmYWxzZTsgfVxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHRoaXMuaW5uZXIsIHBhc3NlZDogdHJ1ZSB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIEVuZElmLnJlZ2V4ID0gL15cXHMqZW5kaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG4gICAgRW5kSWYuY29uZGl0aW9ucyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cbiAgICBFbmRJZi5kZXBlbmRlbnRzID0gW107XG4gICAgcmV0dXJuIEVuZElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVuZElmO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi4vQWN0aW9ucycpO1xudmFyIENvbmRpdGlvbnNfMSA9IHJlcXVpcmUoJy4uL0NvbmRpdGlvbnMnKTtcbi8qKlxuICogVGhlIElmIGFjdGlvblxuICogQG1vZHVsZSBJZlxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbnZhciBJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSB0aGlzLnBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJ5IGFuZCBsb2NhdGUgYSBtYXRjaGluZyBjb25kaXRpb24gZnJvbSB0aGUgYXZhaWxhYmxlIGNvbmRpdGlvbnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgcmV0dXJuIG51bGwuXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50XHRcdC0gU3RhdGVtZW50IHRvIGNoZWNrIGNvbmRpdGlvbnMgYWdhaW5zdFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHQtIExpc3Qgb2YgdmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7SUNvbmRpdGlvbiB8IG51bGx9XHRcdC0gQ29uZGl0aW9uIHRoYXQgbWF0Y2hlcyB3aXRoaW4gdGhlIHN0YXRlbWVudFxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wYXJzZUNvbmRpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gSWYuY29uZGl0aW9uczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb25kaXRpb24gPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goY29uZGl0aW9uLnJlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY29uZGl0aW9uKG1hdGNoWzFdLCB2YXJpYWJsZXMsIG1hdGNoWzJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyBmb3IgYW55IGtub3duIHN5bnRheCBlcnJvcnMgcmVnYXJkaW5nIHRoaXMgYWN0aW9uXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBJZi5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUGVyZm9ybSB0aGUgYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cbiAgICAgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cbiAgICAgKi9cbiAgICBJZi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIGlmIChwcmV2UGFzc2VkID09PSB2b2lkIDApIHsgcHJldlBhc3NlZCA9IGZhbHNlOyB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbi5wZXJmb3JtKClcbiAgICAgICAgICAgID8geyByZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZSB9XG4gICAgICAgICAgICA6IHsgcmVzdWx0OiB0aGlzLmNvbW1hbmQudGVybWluYXRpb24oKSwgcGFzc2VkOiBmYWxzZSB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIElmLnJlZ2V4ID0gL15cXHMqaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG4gICAgSWYuY29uZGl0aW9ucyA9IFtDb25kaXRpb25zXzEuSXNOb3ROdWxsLCBDb25kaXRpb25zXzEuSXNOdWxsLCBDb25kaXRpb25zXzEuR3JlYXRlclRoYW4sIENvbmRpdGlvbnNfMS5MZXNzVGhhbiwgQ29uZGl0aW9uc18xLkdyZWF0ZXJUaGFuT3JFcXVhbCwgQ29uZGl0aW9uc18xLkxlc3NUaGFuT3JFcXVhbCwgQ29uZGl0aW9uc18xLkVxdWFsXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQWN0aW9uW119IEFycmF5IG9mIGRlcGVuZGVudCBhY3Rpb25zXG4gICAgICovXG4gICAgSWYuZGVwZW5kZW50cyA9IFtBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICByZXR1cm4gSWY7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSWY7XG4iLCIvKipcbiAqIFRoZSA9PSBjb25kaXRpb25cbiAqIEBtb2R1bGUgRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG52YXIgRXF1YWwgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVxdWFsKHZhcmlhYmxlLCB2YXJpYWJsZXMsIGNvbXBhcmF0aXZlKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB2YXJpYWJsZTtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tcGFyYXRpdmUgPSBjb21wYXJhdGl2ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuICAgIEVxdWFsLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gPT09IHRoaXMuY29tcGFyYXRpdmU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRXF1YWxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgRXF1YWwucmVnZXggPSAvKFxcdyspXFxzKz09XFxzKyhcXGQrKS9pO1xuICAgIHJldHVybiBFcXVhbDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBFcXVhbDtcbiIsIi8qKlxuICogVGhlID4gY29uZGl0aW9uXG4gKiBAbW9kdWxlIEdyZWF0ZXJUaGFuXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xudmFyIEdyZWF0ZXJUaGFuID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBHcmVhdGVyVGhhbih2YXJpYWJsZSwgdmFyaWFibGVzLCBjb21wYXJhdGl2ZSkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdmFyaWFibGU7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLmNvbXBhcmF0aXZlID0gY29tcGFyYXRpdmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhblxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cbiAgICBHcmVhdGVyVGhhbi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA+IHBhcnNlSW50KHRoaXMuY29tcGFyYXRpdmUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIEdyZWF0ZXJUaGFuLnJlZ2V4ID0gLyhcXHcrKVxccys+XFxzKyhcXGQrKS9pO1xuICAgIHJldHVybiBHcmVhdGVyVGhhbjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBHcmVhdGVyVGhhbjtcbiIsIi8qKlxuICogVGhlID49IGNvbmRpdGlvblxuICogQG1vZHVsZSBHcmVhdGVyVGhhbk9yRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG52YXIgR3JlYXRlclRoYW5PckVxdWFsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBHcmVhdGVyVGhhbk9yRXF1YWwodmFyaWFibGUsIHZhcmlhYmxlcywgY29tcGFyYXRpdmUpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21wYXJhdGl2ZSA9IGNvbXBhcmF0aXZlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgR3JlYXRlclRoYW5PckVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuICAgIEdyZWF0ZXJUaGFuT3JFcXVhbC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA+PSBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhbk9yRXF1YWxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgR3JlYXRlclRoYW5PckVxdWFsLnJlZ2V4ID0gLyhcXHcrKVxccys+PVxccysoXFxkKykvaTtcbiAgICByZXR1cm4gR3JlYXRlclRoYW5PckVxdWFsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEdyZWF0ZXJUaGFuT3JFcXVhbDtcbiIsIi8qKlxuICogVGhlIElzIE5vdCBOdWxsIGNvbmRpdGlvblxuICogQG1vZHVsZSBJc05vdE51bGxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG52YXIgSXNOb3ROdWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJc05vdE51bGwodmFyaWFibGUsIHZhcmlhYmxlcywgY29tcGFyYXRpdmUpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21wYXJhdGl2ZSA9IGNvbXBhcmF0aXZlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOb3ROdWxsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuICAgIElzTm90TnVsbC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGw7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOb3ROdWxsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIElzTm90TnVsbC5yZWdleCA9IC8oXFx3KylcXHMraXNcXHMrbm90XFxzK251bGxcXHMqL2k7XG4gICAgcmV0dXJuIElzTm90TnVsbDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBJc05vdE51bGw7XG4iLCIvKipcbiAqIFRoZSBJcyBOdWxsIGNvbmRpdGlvblxuICogQG1vZHVsZSBJc051bGxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG52YXIgSXNOdWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJc051bGwodmFyaWFibGUsIHZhcmlhYmxlcywgY29tcGFyYXRpdmUpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21wYXJhdGl2ZSA9IGNvbXBhcmF0aXZlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOdWxsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuICAgIElzTnVsbC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdID09IG51bGw7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOdWxsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIElzTnVsbC5yZWdleCA9IC8oXFx3KilcXHMraXNcXHMrbnVsbFxccyovaTtcbiAgICByZXR1cm4gSXNOdWxsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElzTnVsbDtcbiIsIi8qKlxuICogVGhlIDwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIExlc3NUaGFuXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xudmFyIExlc3NUaGFuID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMZXNzVGhhbih2YXJpYWJsZSwgdmFyaWFibGVzLCBjb21wYXJhdGl2ZSkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdmFyaWFibGU7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLmNvbXBhcmF0aXZlID0gY29tcGFyYXRpdmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhblxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cbiAgICBMZXNzVGhhbi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA8IHBhcnNlSW50KHRoaXMuY29tcGFyYXRpdmUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIExlc3NUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIExlc3NUaGFuLnJlZ2V4ID0gLyhcXHcrKVxccys8XFxzKyhcXGQrKS9pO1xuICAgIHJldHVybiBMZXNzVGhhbjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBMZXNzVGhhbjtcbiIsIi8qKlxuICogVGhlIDw9IGNvbmRpdGlvblxuICogQG1vZHVsZSBMZXNzVGhhbk9yRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG52YXIgTGVzc1RoYW5PckVxdWFsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMZXNzVGhhbk9yRXF1YWwodmFyaWFibGUsIHZhcmlhYmxlcywgY29tcGFyYXRpdmUpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21wYXJhdGl2ZSA9IGNvbXBhcmF0aXZlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5PckVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuICAgIExlc3NUaGFuT3JFcXVhbC5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA8PSBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhbk9yRXF1YWxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgTGVzc1RoYW5PckVxdWFsLnJlZ2V4ID0gLyhcXHcrKVxccys8PVxccysoXFxkKykvaTtcbiAgICByZXR1cm4gTGVzc1RoYW5PckVxdWFsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IExlc3NUaGFuT3JFcXVhbDtcbiIsIi8qKlxuICogVGhlIHZhcmlhYmxlIHJlcGxhY2VyIGZvciBlbWJlZGRlZCBTUWlnZ0wgdmFyaWFibGVzXG4gKiBAbW9kdWxlIFZhcmlhYmxlUmVwbGFjZXJcbiAqIEBzdGF0aWNcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lSZXBsYWNlcn1cbiAqL1xudmFyIFZhcmlhYmxlUmVwbGFjZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhcmlhYmxlUmVwbGFjZXIoKSB7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAgICAgICAgICAgICAtIFRleHQgdG8gc2VhcmNoIGZvciByZXBsYWNlbWVudHNcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICAgLSBUaGUgc3RyaW5nIHdpdGggdmFyaWFibGVzIHJlcGxhY2VkXG4gICAgICovXG4gICAgVmFyaWFibGVSZXBsYWNlci5yZXBsYWNlID0gZnVuY3Rpb24gKHRleHQsIHZhcmlhYmxlcykge1xuICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHRoaXMucmVnZXgsIGZ1bmN0aW9uIChtYXRjaCwgJDEsICQyKSB7IHJldHVybiAkMSArIHZhcmlhYmxlc1skMl07IH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIFZhcmlhYmxlUmVwbGFjZXJcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgVmFyaWFibGVSZXBsYWNlci5yZWdleCA9IC8oW157XXxeKXt7KD8heylcXHMqKFxcdyopXFxzKn19KD8hfSkvZztcbiAgICByZXR1cm4gVmFyaWFibGVSZXBsYWNlcjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBWYXJpYWJsZVJlcGxhY2VyO1xuIl19
