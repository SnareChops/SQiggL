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
var IsNotNull_1 = require('./conditions/IsNotNull');
exports.IsNotNull = IsNotNull_1.default;
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

},{"./conditions/Condition":18,"./conditions/Equal":19,"./conditions/GreaterThan":20,"./conditions/IsNotNull":22,"./conditions/IsNull":23,"./conditions/LessThan":24}],5:[function(require,module,exports){
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
                return new condition(match[1], variables, match[4], match[2], match[3]);
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
    If.conditions = [Conditions_1.IsNotNull, Conditions_1.IsNull, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.Equal];
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
var Condition = (function () {
    function Condition() {
    }
    Condition.mods = function (klass) {
        return klass.modifiers.map(function (x) { return ("" + x.identifiers.map(function (id) { return id.source; }).join('|')); }).join('|');
    };
    Condition.prototype.extractModifiers = function (klass, mod1, mod2) {
        if (mod1 == null && mod2 == null)
            return [];
        var array = [], count = 0;
        if (mod1 != null)
            count++;
        if (mod2 != null)
            count++;
        for (var _i = 0, _a = klass.modifiers; _i < _a.length; _i++) {
            var mod = _a[_i];
            for (var _b = 0, _c = mod.identifiers; _b < _c.length; _b++) {
                var identifier = _c[_b];
                if (mod1 != null && identifier.test(mod1))
                    array[0] = mod;
                if (mod2 != null && identifier.test(mod2)) {
                    array[mod1 == null ? 0 : 1] = mod;
                }
                if (array.length === count)
                    return array;
            }
        }
        return array;
    };
    Condition.prototype.performModifiers = function (modifiers, result, variable, variables, comparative) {
        if (modifiers.length === 0)
            return result;
        var i;
        for (i = modifiers.length - 1; i > -1; i--) {
            result = modifiers[i].perform(result, variable, variables, comparative);
        }
        return result;
    };
    return Condition;
})();
exports["default"] = Condition;

},{}],19:[function(require,module,exports){
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
    Equal.regex = new RegExp("(\\w+)\\s+((?:" + Equal.mods(Equal) + "|\\s*))=((?:" + Equal.mods(Equal) + "|\\s*))\\s+(\\d+)", 'i');
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
var Condition_1 = require('./Condition');
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
var IsNotNull = (function (_super) {
    __extends(IsNotNull, _super);
    function IsNotNull(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = _super.prototype.extractModifiers.call(this, IsNotNull, mod1, mod2);
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
    IsNotNull.modifiers = [];
    IsNotNull.regex = /(\w+)\s+is\s+not\s+null\s*/i;
    return IsNotNull;
})(Condition_1["default"]);
exports["default"] = IsNotNull;

},{"./Condition":18}],23:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
    IsNull.modifiers = [];
    IsNull.regex = /(\w*)\s+is\s+null\s*/i;
    return IsNull;
})(Condition_1["default"]);
exports["default"] = IsNull;

},{"./Condition":18}],24:[function(require,module,exports){
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
    identifiers: [/!/i, /not\s+/i, /is\s+not\s+/i],
    perform: function (result, variable, variables, comparative) { return !result; }
};
exports["default"] = Not;

},{}],27:[function(require,module,exports){
var OrEqual = {
    identifiers: [/=/i, /or\s+equal\s+to\s+/i],
    perform: function (result, variable, variables, comparative) {
        return result || variables[variable] === comparative;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRTY29wZS50cyIsInNyYy9Db25kaXRpb25zLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lQZXJmb3JtUmVzdWx0LnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2VyLnRzIiwic3JjL1JlcGxhY2Vycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvYWN0aW9ucy9FbHNlLnRzIiwic3JjL2FjdGlvbnMvRW5kSWYudHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSWYudHMiLCJzcmMvY29uZGl0aW9ucy9Db25kaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9FcXVhbC50cyIsInNyYy9jb25kaXRpb25zL0dyZWF0ZXJUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC50cyIsInNyYy9jb25kaXRpb25zL0lzTnVsbC50cyIsInNyYy9jb25kaXRpb25zL0xlc3NUaGFuLnRzIiwic3JjL21vZGlmaWVycy9JTW9kaWZpZXIudHMiLCJzcmMvbW9kaWZpZXJzL05vdC50cyIsInNyYy9tb2RpZmllcnMvT3JFcXVhbC50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyLnRzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsbUhBQW1IO0FBQ25ILHNCQUErQixpQkFBaUIsQ0FBQztBQUF6QyxnQ0FBeUM7QUFDakQscUJBQThCLGdCQUFnQixDQUFDO0FBQXZDLDhCQUF1QztBQUMvQyxtQkFBNEIsY0FB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QUFrQkMsSUFBQTtBQWxCRCxxQ0FrQkMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBOb3RlOiBUaGVzZSBhcmUgbG9hZGVkIGluIG9yZGVyLCBtYWtlIHN1cmUgYW55IGRlcGVuZGVudCBhY3Rpb25zIGFyZSBsaXN0ZWQgYWJvdmUgdGhlIGFjdGlvbiB0aGF0IHJlcXVpcmVzIHRoZW0uXG5leHBvcnQge2RlZmF1bHQgYXMgRW5kSWZ9IGZyb20gJy4vYWN0aW9ucy9FbmRJZic7XG5leHBvcnQge2RlZmF1bHQgYXMgRWxzZX0gZnJvbSAnLi9hY3Rpb25zL0Vsc2UnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIElmfSBmcm9tICcuL2FjdGlvbnMvSWYnOyIsImltcG9ydCB7SWYsIEVsc2UsIEVuZElmfSBmcm9tICcuL0FjdGlvbnMnO1xuaW1wb3J0IENvbW1hbmRTY29wZSBmcm9tICcuL0NvbW1hbmRTY29wZSc7XG5pbXBvcnQge1ZhcmlhYmxlUmVwbGFjZXJ9IGZyb20gJy4vUmVwbGFjZXJzJztcbmltcG9ydCBJQWN0aW9uIGZyb20gJy4vYWN0aW9ucy9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIENvbW1hbmQgb2JqZWN0IHJlc3BvbnNpYmxlIGZvciBoYW5kbGluZyBhbGwgYWN0aW9ucywgY29uZGl0aW9ucywgYW5kIHZhcmlhYmxlcyB3aXRoaW4gaXQncyBzZWN0aW9uIG9mIHRoZSBxdWVyeVxuICogQG1vZHVsZSBDb21tYW5kXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAgICAgICAgICAgICAgICAtIEJlZ2lubmluZyBpbmRleCBvZiB0aGUgY29tbWFuZCBpbiB0aGUgb3JpZ2luYWwgcXVlcnkgc3RyaW5nXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoICAgICAgICAgICAgICAgLSBMZW5ndGggb2YgdGhlIHNlY3Rpb24gb2YgdGhlIG9yaWdpbmFsIHN0cmluZyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAgICAtIFN0YXRlbWVudCB3aXRoaW4gdGhlICd7eyUgJX19JyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAgICAtIFRleHQgdGhhdCBpbW1lZGlhdGVseSBmb2xsb3dzIHRoZSBzdGF0ZW1lbnQgdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gKiBAcHJvcGVydHkge251bWJlcn0gaW5kZXggICAgICAgICAgICAgLSBCZWdpbm5pbmcgaW5kZXggb2YgdGhlIGNvbW1hbmQgaW4gdGhlIG9yaWdpbmFsIHF1ZXJ5IHN0cmluZ1xuICogQHByb3BlcnR5IHtudW1iZXJ9IGxlbmd0aCAgICAgICAgICAgIC0gTGVuZ3RoIG9mIHRoZSBzZWN0aW9uIG9mIHRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgLSBTdGF0ZW1lbnQgd2l0aGluIHRoZSAne3slICV9fScgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgLSBUZXh0IHRoYXQgaW1tZWRpYXRlbHkgZm9sbG93cyB0aGUgc3RhdGVtZW50IHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGFjdGlvbnMgICAgICAgIC0gQXJyYXkgb2YgYWN0aW9ucyBhdmFpbGFibGUgdG8gU1FpZ2dMXG4gKiBAcHJvcGVydHkge0lSZXBsYWNlcltdfSByZXBsYWNlcnMgICAgLSBBcnJheSBvZiByZXBsYWNlcnMgYXZhaWxhYmxlIHRvIFNRaWdnTFxuICogQHByb3BlcnR5IHtDb21tYW5kU2NvcGV9IHNjb3BlICAgICAgIC0gSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZCwgc3VjaCBhcyBhdmFpbGFibGUgdmFyaWFibGVzIHtAc2VlIENvbW1hbmRTY29wZX1cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBkZXBlbmRlbnRzICAgICAtIEFycmF5IG9mIGNvbW1hbmRzIGRlcGVuZGVudCB0byB0aGlzIGNvbW1hbmQgICAgICAgIFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvZ207XG5cdHB1YmxpYyBhY3Rpb25zOiBhbnlbXSA9IFtJZiwgRWxzZSwgRW5kSWZdO1xuXHRwdWJsaWMgcmVwbGFjZXJzID0gW1ZhcmlhYmxlUmVwbGFjZXJdO1xuXHRwdWJsaWMgYWN0aW9uOiBJQWN0aW9uO1xuXHRwdWJsaWMgc2NvcGU6IENvbW1hbmRTY29wZSA9IG5ldyBDb21tYW5kU2NvcGUoKTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGxlbmd0aDpudW1iZXIsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdFx0dGhpcy5hY3Rpb24gPSB0aGlzLmV4dHJhY3Qoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcblx0fVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFjdGlvbnMgZnJvbSB0aGUgc3RhdGVtZW50XG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgIC0gU3RhdGVtZW50IHRvIGV4dHJhY3QgdGhlIGFjdGlvbnMgZnJvbVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgIC0gSW5uZXIgdGV4dCBmb3IgdGhlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtJQWN0aW9uIHwgbnVsbH0gICAgICAgIC0gVGhlIG1hdGNoaW5nIGFjdGlvbiBvciBudWxsIGlmIG5vIGFjdGlvbiB3YXMgZm91bmRcbiAgICAgKi9cdFxuXHRwdWJsaWMgZXh0cmFjdChzdGF0ZW1lbnQ6IHN0cmluZywgaW5uZXI6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogSUFjdGlvbntcblx0XHRmb3IodmFyIGFjdGlvbiBvZiB0aGlzLmFjdGlvbnMpe1xuXHRcdFx0aWYoYWN0aW9uLnJlZ2V4LnRlc3QodGhpcy5zdGF0ZW1lbnQpKSByZXR1cm4gbmV3IGFjdGlvbih0aGlzLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21tYW5kIGFuZCByZXR1cm4gdGhlIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhc3NlZCAgICAgIC0gSWYgdGhlIGNvbW1hbmQgaXMgYSBkZXBlbmRlbnQgdGhlbiB0aGlzIHdpbGwgcmVmbGVjdCBpZiB0aGUgcHJldmlvdXMgY29tbWFuZCBzdWNjZWVkZWQgb3IgZmFpbGVkXG4gICAgICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSAgICAtIFRoZSByZXN1bHQgb2YgdGhlIGNvbW1hbmQgZXhlY3V0aW9uIHtAc2VlIElQZXJmb3JtUmVzdWx0fVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybShwYXNzZWQ6IGJvb2xlYW4pOiBJUGVyZm9ybVJlc3VsdCB7XG5cdFx0dmFyIHJlc3VsdDogSVBlcmZvcm1SZXN1bHQgPSB0aGlzLmFjdGlvbi5wZXJmb3JtKHBhc3NlZCk7XG5cdFx0cmVzdWx0LnJlc3VsdCArPSB0aGlzLnBlcmZvcm1EZXBlbmRlbnRzKHJlc3VsdC5wYXNzZWQpO1xuXHRcdGZvcih2YXIgcmVwbGFjZXIgb2YgdGhpcy5yZXBsYWNlcnMpe1xuXHRcdFx0cmVzdWx0LnJlc3VsdCA9IHJlcGxhY2VyLnJlcGxhY2UocmVzdWx0LnJlc3VsdCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gY29tbWFuZHMgdGhhdCBhcmUgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmQgKHN1Yi1jb21tYW5kcylcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgc3ViLWNvbW1hbmQncyBleGVjdXRpb25cbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm1TY29wZSgpOiBzdHJpbmcge1xuXHRcdHZhciByZXQ6IHN0cmluZyA9ICcnLCBwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2U7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuc2NvcGUuY29tbWFuZHMpe1xuXHRcdFx0dmFyIHJlc3VsdCA9IGNvbW1hbmQucGVyZm9ybShwcmV2UGFzc2VkKTtcblx0XHRcdHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuXHRcdFx0cmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZCAgLSBJZiB0aGlzIGNvbW1hbmQgaXMgYSBkZXBlbmRlbnQgdGhlbiB0aGlzIHdpbGwgcmVmbGVjdCBpZiB0aGUgcHJldmlvdXMgY29tbWFuZCBzdWNjZWVkZWQgb3IgZmFpbGVkXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgZGVwZW5kZW50IGV4ZWN1dGlvbnMgKGNvbGxlY3RpdmVseSlcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm1EZXBlbmRlbnRzKHByZXZQYXNzZWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuXHRcdHZhciByZXQ6IHN0cmluZyA9ICcnO1xuXHRcdGZvcih2YXIgZGVwZW5kZW50IG9mIHRoaXMuZGVwZW5kZW50cyl7XG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVwZW5kZW50LnBlcmZvcm0ocHJldlBhc3NlZCk7XG5cdFx0XHRwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcblx0XHRcdHJldCArPSByZXN1bHQucmVzdWx0O1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIHRlcm1pbmF0aW9uIG9mIHRoZSBjb21tYW5kJ3MgYWN0aW9ucyBpZiBuZWVkZWQgKEZvciBleGFtcGxlIFwiRW5kSWZcIiBpcyBhIHRlcm1pbmF0b3Igb2YgXCJJZlwiLCBzbyB0aGlzIGVzc2VudGlhbGx5IG1lYW5zIHRvIGp1c3QgcHJpbnQgb3V0IHRoZSBzdHJpbmcgdGhhdCBmb2xsb3dzIFwiRW5kSWZcIilcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJlc3VsdCBvZiB0aGUgYWN0aW9uJ3MgdGVybWluYXRvclxuICAgICAqL1xuXHRwdWJsaWMgdGVybWluYXRpb24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZS5jb21tYW5kcy5zb21lKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcilcblx0XHQ/IHRoaXMuc2NvcGUuY29tbWFuZHMuZmlsdGVyKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcilbMV0ucGVyZm9ybShmYWxzZSkucmVzdWx0XG5cdFx0OiAnJztcblx0fVxuXHQvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgaW5wdXR0ZWQgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIHRoZSBhY3Rpb24gZm9yIHRoaXMgY29tbWFuZFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgLSBUaGUgYWN0aW9uIHRvIGNoZWNrIGlmIGl0IGlzIGEgZGVwZW5kZW50IG9mIHRoaXMgY29tbWFuZCdzIGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgdGhpcyBjb21tYW5kJ3MgYWN0aW9uIFxuICAgICAqL1xuXHRwdWJsaWMgZGVwZW5kZW50KGFjdGlvbjogSUFjdGlvbik6IGJvb2xlYW4ge1xuXHRcdGZvcih2YXIgZGVwZW5kZW50IG9mIHRoaXMuYWN0aW9uLmNvbnN0cnVjdG9yWydkZXBlbmRlbnRzJ10pe1xuXHRcdFx0aWYoYWN0aW9uIGluc3RhbmNlb2YgPGFueT5kZXBlbmRlbnQpIHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn0iLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcbi8qKlxuICogVGhlIENvbW1hbmQgU2NvcGUgb2JqZWN0XG4gKiBAbW9kdWxlIENvbW1hbmRTY29wZVxuICogQGNsYXNzXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIEhvbGRzIHZhcmlhYmxlcyBmb3IgdGhlIHNjb3BlXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGNvbW1hbmRzIHdpdGhpbiB0aGUgc2NvcGVcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgZGVwZW5kZW50IGNvbW1hbmRzIFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kU2NvcGUge1xuXHRwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzID0ge307XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cdHB1YmxpYyBkZXBlbmRlbnRzOiBDb21tYW5kW10gPSBbXTtcbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgSUNvbmRpdGlvbn0gZnJvbSAnLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIENvbmRpdGlvbn0gZnJvbSAnLi9jb25kaXRpb25zL0NvbmRpdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgSXNOb3ROdWxsfSBmcm9tICcuL2NvbmRpdGlvbnMvSXNOb3ROdWxsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBJc051bGx9IGZyb20gJy4vY29uZGl0aW9ucy9Jc051bGwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIExlc3NUaGFufSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW4nO1xuLy8gZXhwb3J0IHtkZWZhdWx0IGFzIEdyZWF0ZXJUaGFuT3JFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0dyZWF0ZXJUaGFuT3JFcXVhbCc7XG4vLyBleHBvcnQge2RlZmF1bHQgYXMgTGVzc1RoYW5PckVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvTGVzc1RoYW5PckVxdWFsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0VxdWFsJztcbiIsImltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vKipcbiAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuICogQG1vZHVsZSBFcnJvcnNcbiAqIEBjbGFzc1xuICogQHN0YXRpY1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3JcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICB9XG59IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufSIsImludGVyZmFjZSBJUGVyZm9ybVJlc3VsdCB7XG5cdHJlc3VsdDogc3RyaW5nO1xuXHRwYXNzZWQ/OiBib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSVBlcmZvcm1SZXN1bHQ7IiwiaW50ZXJmYWNlIElWYXJpYWJsZXMge1xuXHRba2V5OiBzdHJpbmddOiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJVmFyaWFibGVzOyIsImltcG9ydCBQYXJzZXIgZnJvbSAnLi9QYXJzZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbi8qKlxuICogVGhlIHN0YXJ0aW5nIHBvaW50IG9mIHRoZSBlbnRpcmUgU1FpZ2dMIHBhcnNlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUUwgcXVlcnkgdG8gcnVuIFNRaWdnTCBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXM/fSB2YXJpYWJsZXMgICAtIE9wdGlvbmFsIGNvbGxlY3Rpb24gb2YgdmFyaWFibGVzIGZvciB5b3VyIFNRaWdnTCBxdWVyeVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgICAgICAgLSBUaGUgZnVsbHkgcGFyc2VkIFNRTCBxdWVyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc3FsOiBzdHJpbmcsIHZhcmlhYmxlcz86IElWYXJpYWJsZXMpOiBzdHJpbmd7XG5cdHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKHNxbCwgdmFyaWFibGVzKTtcblx0cmV0dXJuIHBhcnNlci5wYXJzZSgpO1xufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBJTW9kaWZpZXJ9IGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllcidcbmV4cG9ydCB7ZGVmYXVsdCBhcyBOb3R9IGZyb20gJy4vbW9kaWZpZXJzL05vdCc7IFxuZXhwb3J0IHtkZWZhdWx0IGFzIE9yRXF1YWx9IGZyb20gJy4vbW9kaWZpZXJzL09yRXF1YWwnOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJFeHRlbnNpb25zLnRzXCIgLz5cbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cbi8qKlxuICogVGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBtb2R1bGUgUGFyc2VyXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3FsICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyBmb3VuZCBpbiB0aGUgU1FpZ2dMIHF1ZXJ5XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gc3RhY2sgICAgICAtIENvbW1hbmQgc3RhY2sgZm9yIHN0b3JpbmcgY3VycmVudCBwb3NpdGlvbiBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXJyb3IgICAgICAgICAtIEVycm9yIHN0cmluZyBpZiBhbnkgZXJyb3JzIGFyZSBmb3VuZCBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdO1xuXHRwdWJsaWMgc3RhY2s6IENvbW1hbmRbXTtcbiAgICBwdWJsaWMgZXJyb3I6IHN0cmluZztcblx0Y29uc3RydWN0b3IocHVibGljIHNxbDogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHR0aGlzLmNvbW1hbmRzID0gdGhpcy5leHRyYWN0KHNxbCwgdmFyaWFibGVzKTtcblx0XHR0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0fVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFueSBjb21tYW5kcyBvdXQgb2YgdGhlIFNRaWdnTCBxdWVyeSBhbmQgZGV0ZXJtaW5lIHRoZWlyIG9yZGVyLCBuZXN0aW5nLCBhbmQgdHlwZVxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gU1FpZ2dMIHF1ZXJ5IHRvIGV4dHJhY3QgY29tbWFuZHMgZnJvbVxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IGdsb2JhbCB2YXJpYWJsZXMgcGFzc2VkIGluIHRvIFNRaWdnTFxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kW119ICAgICAgICAgICAgIC0gQXJyYXkgb2YgZnVsbHkgcGFyc2VkIGNvbW1hbmRzLCByZWFkeSBmb3IgZXhlY3V0aW9uXG4gICAgICovXG5cdHB1YmxpYyBleHRyYWN0KHNxbDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOkNvbW1hbmRbXXtcblx0XHR2YXIgbWF0Y2gsIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXSwgc3RhY2s6IENvbW1hbmRbXSA9IFtdO1xuXHRcdENvbW1hbmQucmVnZXgubGFzdEluZGV4ID0gMDtcblx0XHR3aGlsZSgobWF0Y2ggPSBDb21tYW5kLnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCl7XG5cdFx0XHR2YXIgZm91bmQgPSBuZXcgQ29tbWFuZChtYXRjaC5pbmRleCwgbWF0Y2guaW5wdXQubGVuZ3RoLCBtYXRjaFsxXSwgbWF0Y2hbMl0sIHZhcmlhYmxlcyk7XG5cdFx0XHRpZihzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnQoZm91bmQuYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGZvdW5kLmFjdGlvbi5zdXBwb3J0ZXIgPSBzdGFjay5sYXN0KCk7XG5cdFx0XHRcdHN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiAhc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSB7XG5cdFx0XHRcdHN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHRzdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRzdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0Y29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG4gICAgICAgICAgICBsZXQgZXJyb3IgPSBmb3VuZC5hY3Rpb24udmFsaWRhdGUoKTtcbiAgICAgICAgICAgIGlmKGVycm9yKSByZXR1cm4gW107XG5cdFx0fVxuXHRcdHJldHVybiBjb21tYW5kcztcblx0fVxuXHQvKipcbiAgICAgKiBSdW4gdGhlIGNvbW1hbmRzIGFnYWluc3QgdGhlIHN0cmluZyBhbmQgb3V0cHV0IHRoZSBlbmQgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGVuZCByZXN1bHQgb2YgcnVubmluZyBhbGwgY29tbWFuZHMgYWdhaW5zdCB0aGUgU1FpZ2dMIHF1ZXJ5XG4gICAgICovXG5cdHB1YmxpYyBwYXJzZSgpOiBzdHJpbmcge1xuXHRcdHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zcWw7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuXHRcdFx0cXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLTEpO1xuXHRcdFx0cXVlcnkgKz0gY29tbWFuZC5wZXJmb3JtKGZhbHNlKS5yZXN1bHQ7XG5cdFx0XHRpbmRleCArPSBjb21tYW5kLmxlbmd0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHF1ZXJ5OyAvL1RPRE9cblx0fVxufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBWYXJpYWJsZVJlcGxhY2VyfSBmcm9tICcuL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyJzsiLCJpbXBvcnQge3BhcnNlIGFzIFBhcnNlfSBmcm9tICcuL01haW4nO1xubGV0IFNRaWdnTCA9IHtcbiAgICBwYXJzZTogUGFyc2UsXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcbiAgICAvL2V4dGVuZDogRXh0ZW5kXG59O1xuaWYod2luZG93KSB3aW5kb3dbJ1NRaWdnTCddID0gU1FpZ2dMO1xuZXhwb3J0IGRlZmF1bHQgU1FpZ2dMOyIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi4vRXJyb3JzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIEVsc2UgYWN0aW9uXG4gKiBAbW9kdWxlIEVsc2VcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgICAgICAgICAgICAgLSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAgICAtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgICAgLSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kICAgICAgICAgIC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgLSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbHNlIGltcGxlbWVudHMgSUFjdGlvbiB7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmVsc2VcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW107XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHVibGljIHZhcmlhYmxlOiBhbnk7XG5cdHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHR9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIGlmKCF0aGlzLnN1cHBvcnRlcikgcmV0dXJuIEVycm9ycy5JbmNvcnJlY3RTdGF0ZW1lbnQodGhpcywgdGhpcy5zdGF0ZW1lbnQpO1xuICAgIH1cblx0LyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVsc2Vcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdHtcblx0XHRyZXR1cm4gIXByZXZQYXNzZWQgPyB7cmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWV9IDoge3Jlc3VsdDogJycsIHBhc3NlZDogZmFsc2V9O1xuXHR9XG59IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IEVycm9ycyBmcm9tICcuLi9FcnJvcnMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgRW5kSWYgYWN0aW9uXG4gKiBAbW9kdWxlIEVuZElmXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIElBY3Rpb24ge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgXHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyIFx0XHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5kSWYgaW1wbGVtZW50cyBJQWN0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmVuZGlmXFxiL2k7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBBcnJheSBvZiBjb25kaXRpb25zIGF2YWlsYWJsZSB0byB0aGlzIGFjdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY29uZGl0aW9ucyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW107XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwdWJsaWMgdmFyaWFibGU6IGFueTtcbiAgICBwdWJsaWMgY29uZGl0aW9uOiBJQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBzdXBwb3J0ZXI6IENvbW1hbmQ7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjb21tYW5kOiBDb21tYW5kLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0fVxuXHQvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IHN0cmluZ3tcbiAgICAgICAgaWYoIXRoaXMuc3VwcG9ydGVyKSByZXR1cm4gRXJyb3JzLkluY29ycmVjdFN0YXRlbWVudCh0aGlzLCB0aGlzLnN0YXRlbWVudCk7XG4gICAgfVxuICAgIC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuXHQgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG5cdHB1YmxpYyBwZXJmb3JtKHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IElQZXJmb3JtUmVzdWx0IHtcblx0XHRyZXR1cm4ge3Jlc3VsdDogdGhpcy5pbm5lciwgcGFzc2VkOiB0cnVlfTtcblx0fSAgICBcbn0iLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIGludGVyZmFjZSBmb3IgYWxsIGFjdGlvbnMgdG8gYWRoZXJlIHRvXG4gKiBAaW50ZXJmYWNlIElBY3Rpb25cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5pbnRlcmZhY2UgSUFjdGlvbiB7XG4gICAgLy8gc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy8gc3RhdGljIGNvbmRpdGlvbnM6IElDb25kaXRpb25bXTtcblx0Ly8gc3RhdGljIGRlcGVuZGVudHM6IElBY3Rpb25bXTtcblx0dGVybWluYXRvcjogYm9vbGVhbjtcbiAgICB2YXJpYWJsZTogYW55O1xuICAgIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBzdXBwb3J0ZXI6IENvbW1hbmQ7XG4gICAgY29tbWFuZDogQ29tbWFuZDtcbiAgICBzdGF0ZW1lbnQ6IHN0cmluZztcbiAgICBpbm5lcjogc3RyaW5nO1xuICAgIHZhcmlhYmxlczogSVZhcmlhYmxlcztcblx0LyoqXG5cdCAqIEBtZXRob2RcbiAgICAgKiBAbWVtYmVyb2YgSUFjdGlvblxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcblx0ICogQHJldHVybnMgSVBlcmZvcm1SZXN1bHQge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cbiAgICB2YWxpZGF0ZSgpOnN0cmluZztcblx0cGVyZm9ybShwcmV2UGFzc2VkPzogYm9vbGVhbik6IElQZXJmb3JtUmVzdWx0O1xufVxuZXhwb3J0IGRlZmF1bHQgSUFjdGlvbjsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbmltcG9ydCB7RWxzZSwgRW5kSWZ9IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IHtJc05vdE51bGwsIElzTnVsbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBFcXVhbH0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBJQWN0aW9uIGZyb20gJy4vSUFjdGlvbic7XG5pbXBvcnQgSVBlcmZvcm1SZXN1bHQgZnJvbSAnLi4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBJZiBhY3Rpb25cbiAqIEBtb2R1bGUgSWZcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgXHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyIFx0XHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWYgaW1wbGVtZW50cyBJQWN0aW9uIHtcblx0LyoqXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC9eXFxzKmlmXFxiL2k7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBBcnJheSBvZiBjb25kaXRpb25zIGF2YWlsYWJsZSB0byB0aGlzIGFjdGlvblxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIGNvbmRpdGlvbnMgPSBbSXNOb3ROdWxsLCBJc051bGwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgRXF1YWxdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gQXJyYXkgb2YgZGVwZW5kZW50IGFjdGlvbnNcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBkZXBlbmRlbnRzID0gW0Vsc2UsIEVuZElmXTtcblx0cHVibGljIHRlcm1pbmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHVibGljIHZhcmlhYmxlOiBhbnk7XG5cdHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdHRoaXMuY29uZGl0aW9uID0gdGhpcy5wYXJzZUNvbmRpdGlvbihzdGF0ZW1lbnQsIHZhcmlhYmxlcyk7XG5cdH1cblx0LyoqXG5cdCAqIFRyeSBhbmQgbG9jYXRlIGEgbWF0Y2hpbmcgY29uZGl0aW9uIGZyb20gdGhlIGF2YWlsYWJsZSBjb25kaXRpb25zIGZvciB0aGlzIGFjdGlvbi4gSWYgbm8gbWF0Y2ggaXMgZm91bmQsIHJldHVybiBudWxsLlxuICAgICAqIEBtZW1iZXJvZiBJZlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudFx0XHQtIFN0YXRlbWVudCB0byBjaGVjayBjb25kaXRpb25zIGFnYWluc3Rcblx0ICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdC0gTGlzdCBvZiB2YXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuXHQgKiBAcmV0dXJucyB7SUNvbmRpdGlvbiB8IG51bGx9XHRcdC0gQ29uZGl0aW9uIHRoYXQgbWF0Y2hlcyB3aXRoaW4gdGhlIHN0YXRlbWVudFxuXHQgKi9cblx0cHVibGljIHBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdGZvcih2YXIgY29uZGl0aW9uIG9mIElmLmNvbmRpdGlvbnMpe1xuXHRcdFx0dmFyIG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKGNvbmRpdGlvbi5yZWdleCk7XG5cdFx0XHRpZihtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAwKSByZXR1cm4gbmV3IGNvbmRpdGlvbihtYXRjaFsxXSwgdmFyaWFibGVzLCBtYXRjaFs0XSwgbWF0Y2hbMl0sIG1hdGNoWzNdKTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9IFRoZSBjYXVnaHQgZXJyb3IgaWYgYW55XG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlKCk6c3RyaW5ne1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cdC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBJZlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuXHQgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG5cdHB1YmxpYyBwZXJmb3JtKHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IElQZXJmb3JtUmVzdWx0e1xuXHRcdHJldHVybiB0aGlzLmNvbmRpdGlvbi5wZXJmb3JtKClcdFxuXHRcdFx0XHQ/IHtyZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZX0gXG5cdFx0XHRcdDoge3Jlc3VsdDogdGhpcy5jb21tYW5kLnRlcm1pbmF0aW9uKCksIHBhc3NlZDogZmFsc2V9O1xuXHR9XG59IiwiaW1wb3J0IHtJTW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZGl0aW9uIHtcbiAgICBwdWJsaWMgc3RhdGljIG1vZHMoa2xhc3Mpe1xuICAgICAgICByZXR1cm4ga2xhc3MubW9kaWZpZXJzLm1hcCh4ID0+IGAke3guaWRlbnRpZmllcnMubWFwKGlkID0+IGlkLnNvdXJjZSkuam9pbignfCcpfWApLmpvaW4oJ3wnKTtcbiAgICB9XG4gICAgcHVibGljIGV4dHJhY3RNb2RpZmllcnMoa2xhc3MsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKTogYW55W117XG4gICAgICAgIGlmKG1vZDEgPT0gbnVsbCAmJiBtb2QyID09IG51bGwpIHJldHVybiBbXTtcbiAgICAgICAgbGV0IGFycmF5ID0gW10sIGNvdW50ID0gMDtcbiAgICAgICAgaWYobW9kMSAhPSBudWxsKSBjb3VudCsrO1xuICAgICAgICBpZihtb2QyICE9IG51bGwpIGNvdW50Kys7XG4gICAgICAgIGZvcihsZXQgbW9kIG9mIGtsYXNzLm1vZGlmaWVycyl7XG4gICAgICAgICAgICBmb3IobGV0IGlkZW50aWZpZXIgb2YgbW9kLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgICAgICBpZihtb2QxICE9IG51bGwgJiYgaWRlbnRpZmllci50ZXN0KG1vZDEpKSBhcnJheVswXSA9IG1vZDtcbiAgICAgICAgICAgICAgICBpZihtb2QyICE9IG51bGwgJiYgaWRlbnRpZmllci50ZXN0KG1vZDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5W21vZDEgPT0gbnVsbCA/IDAgOiAxXSA9IG1vZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoYXJyYXkubGVuZ3RoID09PSBjb3VudCkgcmV0dXJuIGFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgcHVibGljIHBlcmZvcm1Nb2RpZmllcnMobW9kaWZpZXJzOiBJTW9kaWZpZXJbXSwgcmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFue1xuICAgICAgICBpZihtb2RpZmllcnMubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgZm9yKGk9bW9kaWZpZXJzLmxlbmd0aCAtIDE7aT4tMTtpLS0pe1xuICAgICAgICAgICAgcmVzdWx0ID0gbW9kaWZpZXJzW2ldLnBlcmZvcm0ocmVzdWx0LCB2YXJpYWJsZSwgdmFyaWFibGVzLCBjb21wYXJhdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllciwgTm90LCBPckVxdWFsfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuXG4vKipcbiAqIFRoZSA9PSBjb25kaXRpb25cbiAqIEBtb2R1bGUgRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcXVhbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcXVhbFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtOb3QsIE9yRXF1YWxdO1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzKygoPzoke0VxdWFsLm1vZHMoRXF1YWwpfXxcXFxccyopKT0oKD86JHtFcXVhbC5tb2RzKEVxdWFsKX18XFxcXHMqKSlcXFxccysoXFxcXGQrKWAsICdpJyk7XG4gICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gdGhpcy5leHRyYWN0TW9kaWZpZXJzKEVxdWFsLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSA9PT0gdGhpcy5jb21wYXJhdGl2ZTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJ1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllciwgTm90LCBPckVxdWFsfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuXG4vKipcbiAqIFRoZSA+IGNvbmRpdGlvblxuICogQG1vZHVsZSBHcmVhdGVyVGhhblxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWF0ZXJUaGFuIGV4dGVuZHMgQ29uZGl0aW9uIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW05vdCwgT3JFcXVhbF07XG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoYChcXFxcdyspXFxcXHMrKCg/OiR7R3JlYXRlclRoYW4ubW9kcyhHcmVhdGVyVGhhbil9fFxcXFxzKikpPigoPzoke0dyZWF0ZXJUaGFuLm1vZHMoR3JlYXRlclRoYW4pfXxcXFxccyopKVxcXFxzKyhcXFxcZCspYCwgJ2knKTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKEdyZWF0ZXJUaGFuLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgIGxldCByZXN1bHQgPSBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPiBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDsgXG5cdH1cbn0iLCJpbnRlcmZhY2UgSUNvbmRpdGlvbiB7XG4gICAgLy9zdGF0aWMgcmVnZXg6IFJlZ0V4cDtcbiAgICAvL3N0YXRpYyBtb2RpZmllcnM6IElNb2RpZmllcltdO1xuXHQvL3N0YXRpYyBjcmVhdGUoc3RhdGVtZW50OiBzdHJpbmcpOiBJQ29uZGl0aW9uO1xuXHRwZXJmb3JtKCk6Ym9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb247IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtJTW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgSXMgTm90IE51bGwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIElzTm90TnVsbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElzTm90TnVsbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc05vdE51bGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZmllcnMgPSBbXTtcblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhcXHcrKVxccytpc1xccytub3RcXHMrbnVsbFxccyovaTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKElzTm90TnVsbCwgbW9kMSwgbW9kMik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc05vdE51bGxcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcblx0fVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7SU1vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIElzIE51bGwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIElzTnVsbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElzTnVsbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc051bGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW107XG4gICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC8oXFx3KilcXHMraXNcXHMrbnVsbFxccyovaTtcbiAgICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcbiAgICAgY29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgICBzdXBlcigpO1xuICAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKElzTnVsbCwgbW9kMSwgbW9kMik7XG4gICAgIH1cbiAgICAgLyoqXG4gICAgICAqIEBtZW1iZXJvZiBJc051bGxcbiAgICAgICogQG1ldGhvZFxuICAgICAgKiBAcHVibGljXG4gICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICAqL1xuICAgICAgcHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuICAgICAgICAgIHJldHVybiB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSA9PSBudWxsO1xuICAgICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nO1xuaW1wb3J0IHtJTW9kaWZpZXIsIE5vdCwgT3JFcXVhbH0gZnJvbSAnLi4vTW9kaWZpZXJzJztcblxuLyoqXG4gKiBUaGUgPCBjb25kaXRpb25cbiAqIEBtb2R1bGUgTGVzc1RoYW5cbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXNzVGhhbiBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhblxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtOb3QsIE9yRXF1YWxdO1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzKygoPzoke0xlc3NUaGFuLm1vZHMoTGVzc1RoYW4pfXxcXFxccyopKTwoKD86JHtMZXNzVGhhbi5tb2RzKExlc3NUaGFuKX18XFxcXHMqKSlcXFxccysoXFxcXGQrKWAsICdpJyk7XG4gICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gdGhpcy5leHRyYWN0TW9kaWZpZXJzKExlc3NUaGFuLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIExlc3NUaGFuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG5cdFx0bGV0IHJlc3VsdCA9IHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA8IHBhcnNlSW50KHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICByZXN1bHQgPSB0aGlzLnBlcmZvcm1Nb2RpZmllcnModGhpcy5tb2RpZmllcnMsIHJlc3VsdCwgdGhpcy52YXJpYWJsZSwgdGhpcy52YXJpYWJsZXMsIHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXHR9XG59IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJTW9kaWZpZXIge1xuICAgIGlkZW50aWZpZXJzOiBSZWdFeHBbXTtcbiAgICBwZXJmb3JtKHJlc3VsdDpib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOmJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJTW9kaWZpZXI7IiwiaW1wb3J0IElNb2RpZmllciBmcm9tICcuL0lNb2RpZmllcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmNvbnN0IE5vdDpJTW9kaWZpZXIgPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvIS9pLCAvbm90XFxzKy9pLCAvaXNcXHMrbm90XFxzKy9pXSxcbiAgICBwZXJmb3JtOiAocmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFuID0+IHtyZXR1cm4gIXJlc3VsdDt9XG59XG5leHBvcnQgZGVmYXVsdCBOb3Q7IiwiaW1wb3J0IElNb2RpZmllciBmcm9tICcuL0lNb2RpZmllcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmNvbnN0IE9yRXF1YWw6IElNb2RpZmllciA9IHtcbiAgICBpZGVudGlmaWVyczogWy89L2ksIC9vclxccytlcXVhbFxccyt0b1xccysvaV0sXG4gICAgcGVyZm9ybTogKHJlc3VsdDogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBjb21wYXJhdGl2ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgdmFyaWFibGVzW3ZhcmlhYmxlXSA9PT0gY29tcGFyYXRpdmU7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgT3JFcXVhbDsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElSZXBsYWNlciB7XG4gICAgLy9zdGF0aWMgcmVnZXg6IFJlZ0V4cDtcbiAgICAvL3N0YXRpYyByZXBsYWNlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgSVJlcGxhY2VyOyIsImltcG9ydCBJUmVwbGFjZXIgZnJvbSAnLi9JUmVwbGFjZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbi8qKlxuICogVGhlIHZhcmlhYmxlIHJlcGxhY2VyIGZvciBlbWJlZGRlZCBTUWlnZ0wgdmFyaWFibGVzXG4gKiBAbW9kdWxlIFZhcmlhYmxlUmVwbGFjZXJcbiAqIEBzdGF0aWNcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lSZXBsYWNlcn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFyaWFibGVSZXBsYWNlciBpbXBsZW1lbnRzIElSZXBsYWNlciB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIFZhcmlhYmxlUmVwbGFjZXJcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC8oW157XXxeKXt7KD8heylcXHMqKFxcdyopXFxzKn19KD8hfSkvZztcblx0LyoqXG4gICAgICogQG1lbWJlcm9mIFZhcmlhYmxlUmVwbGFjZXJcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0ICAgICAgICAgICAgIC0gVGV4dCB0byBzZWFyY2ggZm9yIHJlcGxhY2VtZW50c1xuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgICAtIFRoZSBzdHJpbmcgd2l0aCB2YXJpYWJsZXMgcmVwbGFjZWQgXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZ3tcblx0XHRyZXR1cm4gdGV4dC5yZXBsYWNlKHRoaXMucmVnZXgsIChtYXRjaCwgJDEsICQyKSA9PiAkMSt2YXJpYWJsZXNbJDJdKTtcblx0fVxufSJdfQ==
