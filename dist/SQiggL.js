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
        for (i = modifiers.length - 1; i > -1; --i) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRTY29wZS50cyIsInNyYy9Db25kaXRpb25zLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lQZXJmb3JtUmVzdWx0LnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2VyLnRzIiwic3JjL1JlcGxhY2Vycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvYWN0aW9ucy9FbHNlLnRzIiwic3JjL2FjdGlvbnMvRW5kSWYudHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSWYudHMiLCJzcmMvY29uZGl0aW9ucy9Db25kaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9FcXVhbC50cyIsInNyYy9jb25kaXRpb25zL0dyZWF0ZXJUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC50cyIsInNyYy9jb25kaXRpb25zL0lzTnVsbC50cyIsInNyYy9jb25kaXRpb25zL0xlc3NUaGFuLnRzIiwic3JjL21vZGlmaWVycy9JTW9kaWZpZXIudHMiLCJzcmMvbW9kaWZpZXJzL05vdC50cyIsInNyYy9tb2RpZmllcnMvT3JFcXVhbC50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyLnRzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsbUhBQW1IO0FBQ25ILHNCQUErQixpQkFBaUIsQ0FBQztBQUF6QyxnQ0FBeUM7QUFDakQscUJBQThCLGdCQUFnQixDQUFDO0FBQXZDLDhCQUF1QztBQUMvQyxtQkFBNEIsY0FB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QUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDekM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSixDQUFBO0FBQ0QscUJBQWUsT0FBTyxDQUFDOzs7QUNSRTs7QUNIekI7Ozs7OztHQU1HO0FBQ0g7SUFBQTtJQWtCQSxDQUFDO0lBWEE7Ozs7Ozs7T0FPTTtJQUNRLHdCQUFPLEdBQXJCLFVBQXNCLElBQVksRUFBRSxTQUFxQjtRQUN4RCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUssT0FBQSxFQUFFLEdBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7SUFDdEUsQ0FBQztJQWhCRTs7OztPQUlHO0lBQ1Esc0JBQUssR0FBVyxvQ0FBb0MsQ0FBQztJQVlwRSx1QkFBQztBQUFELENBbEJBLEFBa0JDLElBQUE7QUFsQkQscUNBa0JDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gTm90ZTogVGhlc2UgYXJlIGxvYWRlZCBpbiBvcmRlciwgbWFrZSBzdXJlIGFueSBkZXBlbmRlbnQgYWN0aW9ucyBhcmUgbGlzdGVkIGFib3ZlIHRoZSBhY3Rpb24gdGhhdCByZXF1aXJlcyB0aGVtLlxuZXhwb3J0IHtkZWZhdWx0IGFzIEVuZElmfSBmcm9tICcuL2FjdGlvbnMvRW5kSWYnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEVsc2V9IGZyb20gJy4vYWN0aW9ucy9FbHNlJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBJZn0gZnJvbSAnLi9hY3Rpb25zL0lmJzsiLCJpbXBvcnQge0lmLCBFbHNlLCBFbmRJZn0gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCBDb21tYW5kU2NvcGUgZnJvbSAnLi9Db21tYW5kU2NvcGUnO1xuaW1wb3J0IHtWYXJpYWJsZVJlcGxhY2VyfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbic7XG5pbXBvcnQgSVBlcmZvcm1SZXN1bHQgZnJvbSAnLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuLyoqXG4gKiBDb21tYW5kIG9iamVjdCByZXNwb25zaWJsZSBmb3IgaGFuZGxpbmcgYWxsIGFjdGlvbnMsIGNvbmRpdGlvbnMsIGFuZCB2YXJpYWJsZXMgd2l0aGluIGl0J3Mgc2VjdGlvbiBvZiB0aGUgcXVlcnlcbiAqIEBtb2R1bGUgQ29tbWFuZFxuICogQGNsYXNzXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXggICAgICAgICAgICAgICAgLSBCZWdpbm5pbmcgaW5kZXggb2YgdGhlIGNvbW1hbmQgaW4gdGhlIG9yaWdpbmFsIHF1ZXJ5IHN0cmluZ1xuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAgICAgICAgICAgICAgIC0gTGVuZ3RoIG9mIHRoZSBzZWN0aW9uIG9mIHRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgICAgLSBTdGF0ZW1lbnQgd2l0aGluIHRoZSAne3slICV9fScgdGhhdCB0aGlzIGNvbW1hbmQgaXMgcmVzcG9uc2libGUgZm9yXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAgICAgLSBUZXh0IHRoYXQgaW1tZWRpYXRlbHkgZm9sbG93cyB0aGUgc3RhdGVtZW50IHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZFxuICogQHByb3BlcnR5IHtudW1iZXJ9IGluZGV4ICAgICAgICAgICAgIC0gQmVnaW5uaW5nIGluZGV4IG9mIHRoZSBjb21tYW5kIGluIHRoZSBvcmlnaW5hbCBxdWVyeSBzdHJpbmdcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBsZW5ndGggICAgICAgICAgICAtIExlbmd0aCBvZiB0aGUgc2VjdGlvbiBvZiB0aGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgIC0gU3RhdGVtZW50IHdpdGhpbiB0aGUgJ3t7JSAlfX0nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgIC0gVGV4dCB0aGF0IGltbWVkaWF0ZWx5IGZvbGxvd3MgdGhlIHN0YXRlbWVudCB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBhY3Rpb25zICAgICAgICAtIEFycmF5IG9mIGFjdGlvbnMgYXZhaWxhYmxlIHRvIFNRaWdnTFxuICogQHByb3BlcnR5IHtJUmVwbGFjZXJbXX0gcmVwbGFjZXJzICAgIC0gQXJyYXkgb2YgcmVwbGFjZXJzIGF2YWlsYWJsZSB0byBTUWlnZ0xcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFNjb3BlfSBzY29wZSAgICAgICAtIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmQsIHN1Y2ggYXMgYXZhaWxhYmxlIHZhcmlhYmxlcyB7QHNlZSBDb21tYW5kU2NvcGV9XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gZGVwZW5kZW50cyAgICAgLSBBcnJheSBvZiBjb21tYW5kcyBkZXBlbmRlbnQgdG8gdGhpcyBjb21tYW5kICAgICAgICBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZCB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC97eyUoLio/KSV9fShbXFxzXFxTXSo/KT8oPz0oPzp7eyV8JCkpL2dtO1xuXHRwdWJsaWMgYWN0aW9uczogYW55W10gPSBbSWYsIEVsc2UsIEVuZElmXTtcblx0cHVibGljIHJlcGxhY2VycyA9IFtWYXJpYWJsZVJlcGxhY2VyXTtcblx0cHVibGljIGFjdGlvbjogSUFjdGlvbjtcblx0cHVibGljIHNjb3BlOiBDb21tYW5kU2NvcGUgPSBuZXcgQ29tbWFuZFNjb3BlKCk7XG5cdHB1YmxpYyBkZXBlbmRlbnRzOiBDb21tYW5kW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBsZW5ndGg6bnVtYmVyLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdHRoaXMuc2NvcGUudmFyaWFibGVzID0gdmFyaWFibGVzO1xuXHRcdHRoaXMuYWN0aW9uID0gdGhpcy5leHRyYWN0KHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG5cdH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhY3Rpb25zIGZyb20gdGhlIHN0YXRlbWVudFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAtIFN0YXRlbWVudCB0byBleHRyYWN0IHRoZSBhY3Rpb25zIGZyb21cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgICAgICAgICAgICAtIElubmVyIHRleHQgZm9yIHRoZSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7SUFjdGlvbiB8IG51bGx9ICAgICAgICAtIFRoZSBtYXRjaGluZyBhY3Rpb24gb3IgbnVsbCBpZiBubyBhY3Rpb24gd2FzIGZvdW5kXG4gICAgICovXHRcblx0cHVibGljIGV4dHJhY3Qoc3RhdGVtZW50OiBzdHJpbmcsIGlubmVyOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IElBY3Rpb257XG5cdFx0Zm9yKHZhciBhY3Rpb24gb2YgdGhpcy5hY3Rpb25zKXtcblx0XHRcdGlmKGFjdGlvbi5yZWdleC50ZXN0KHRoaXMuc3RhdGVtZW50KSkgcmV0dXJuIG5ldyBhY3Rpb24odGhpcywgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSB0aGUgY29tbWFuZCBhbmQgcmV0dXJuIHRoZSByZXN1bHRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwYXNzZWQgICAgICAtIElmIHRoZSBjb21tYW5kIGlzIGEgZGVwZW5kZW50IHRoZW4gdGhpcyB3aWxsIHJlZmxlY3QgaWYgdGhlIHByZXZpb3VzIGNvbW1hbmQgc3VjY2VlZGVkIG9yIGZhaWxlZFxuICAgICAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0gICAgLSBUaGUgcmVzdWx0IG9mIHRoZSBjb21tYW5kIGV4ZWN1dGlvbiB7QHNlZSBJUGVyZm9ybVJlc3VsdH1cbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0ocGFzc2VkOiBib29sZWFuKTogSVBlcmZvcm1SZXN1bHQge1xuXHRcdHZhciByZXN1bHQ6IElQZXJmb3JtUmVzdWx0ID0gdGhpcy5hY3Rpb24ucGVyZm9ybShwYXNzZWQpO1xuXHRcdHJlc3VsdC5yZXN1bHQgKz0gdGhpcy5wZXJmb3JtRGVwZW5kZW50cyhyZXN1bHQucGFzc2VkKTtcblx0XHRmb3IodmFyIHJlcGxhY2VyIG9mIHRoaXMucmVwbGFjZXJzKXtcblx0XHRcdHJlc3VsdC5yZXN1bHQgPSByZXBsYWNlci5yZXBsYWNlKHJlc3VsdC5yZXN1bHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIGNvbW1hbmRzIHRoYXQgYXJlIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kIChzdWItY29tbWFuZHMpXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSByZXN1bHQgb2YgdGhlIHN1Yi1jb21tYW5kJ3MgZXhlY3V0aW9uXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtU2NvcGUoKTogc3RyaW5nIHtcblx0XHR2YXIgcmV0OiBzdHJpbmcgPSAnJywgcHJldlBhc3NlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRcdGZvcih2YXIgY29tbWFuZCBvZiB0aGlzLnNjb3BlLmNvbW1hbmRzKXtcblx0XHRcdHZhciByZXN1bHQgPSBjb21tYW5kLnBlcmZvcm0ocHJldlBhc3NlZCk7XG5cdFx0XHRwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcblx0XHRcdHJldCArPSByZXN1bHQucmVzdWx0O1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gY29tbWFuZHMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgY29tbWFuZFxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWQgIC0gSWYgdGhpcyBjb21tYW5kIGlzIGEgZGVwZW5kZW50IHRoZW4gdGhpcyB3aWxsIHJlZmxlY3QgaWYgdGhlIHByZXZpb3VzIGNvbW1hbmQgc3VjY2VlZGVkIG9yIGZhaWxlZFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSByZXN1bHQgb2YgdGhlIGRlcGVuZGVudCBleGVjdXRpb25zIChjb2xsZWN0aXZlbHkpXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtRGVwZW5kZW50cyhwcmV2UGFzc2VkOiBib29sZWFuKTogc3RyaW5nIHtcblx0XHR2YXIgcmV0OiBzdHJpbmcgPSAnJztcblx0XHRmb3IodmFyIGRlcGVuZGVudCBvZiB0aGlzLmRlcGVuZGVudHMpe1xuXHRcdFx0dmFyIHJlc3VsdCA9IGRlcGVuZGVudC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuXHRcdFx0cHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG5cdFx0XHRyZXQgKz0gcmVzdWx0LnJlc3VsdDtcblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIHRoZSB0ZXJtaW5hdGlvbiBvZiB0aGUgY29tbWFuZCdzIGFjdGlvbnMgaWYgbmVlZGVkIChGb3IgZXhhbXBsZSBcIkVuZElmXCIgaXMgYSB0ZXJtaW5hdG9yIG9mIFwiSWZcIiwgc28gdGhpcyBlc3NlbnRpYWxseSBtZWFucyB0byBqdXN0IHByaW50IG91dCB0aGUgc3RyaW5nIHRoYXQgZm9sbG93cyBcIkVuZElmXCIpXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSByZXN1bHQgb2YgdGhlIGFjdGlvbidzIHRlcm1pbmF0b3JcbiAgICAgKi9cblx0cHVibGljIHRlcm1pbmF0aW9uKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGUuY29tbWFuZHMuc29tZShjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLnRlcm1pbmF0b3IpXG5cdFx0PyB0aGlzLnNjb3BlLmNvbW1hbmRzLmZpbHRlcihjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLnRlcm1pbmF0b3IpWzFdLnBlcmZvcm0oZmFsc2UpLnJlc3VsdFxuXHRcdDogJyc7XG5cdH1cblx0LyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIGlucHV0dGVkIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiB0aGUgYWN0aW9uIGZvciB0aGlzIGNvbW1hbmRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtJQWN0aW9ufSBhY3Rpb24gIC0gVGhlIGFjdGlvbiB0byBjaGVjayBpZiBpdCBpcyBhIGRlcGVuZGVudCBvZiB0aGlzIGNvbW1hbmQncyBhY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciB0aGUgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIHRoaXMgY29tbWFuZCdzIGFjdGlvbiBcbiAgICAgKi9cblx0cHVibGljIGRlcGVuZGVudChhY3Rpb246IElBY3Rpb24pOiBib29sZWFuIHtcblx0XHRmb3IodmFyIGRlcGVuZGVudCBvZiB0aGlzLmFjdGlvbi5jb25zdHJ1Y3RvclsnZGVwZW5kZW50cyddKXtcblx0XHRcdGlmKGFjdGlvbiBpbnN0YW5jZW9mIDxhbnk+ZGVwZW5kZW50KSByZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG4vKipcbiAqIFRoZSBDb21tYW5kIFNjb3BlIG9iamVjdFxuICogQG1vZHVsZSBDb21tYW5kU2NvcGVcbiAqIEBjbGFzc1xuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBIb2xkcyB2YXJpYWJsZXMgZm9yIHRoZSBzY29wZVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyB3aXRoaW4gdGhlIHNjb3BlXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGRlcGVuZGVudCBjb21tYW5kcyBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFNjb3BlIHtcblx0cHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHt9O1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG59IiwiZXhwb3J0IHtkZWZhdWx0IGFzIElDb25kaXRpb259IGZyb20gJy4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBDb25kaXRpb259IGZyb20gJy4vY29uZGl0aW9ucy9Db25kaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIElzTm90TnVsbH0gZnJvbSAnLi9jb25kaXRpb25zL0lzTm90TnVsbCc7XG5leHBvcnQge2RlZmF1bHQgYXMgSXNOdWxsfSBmcm9tICcuL2NvbmRpdGlvbnMvSXNOdWxsJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBHcmVhdGVyVGhhbn0gZnJvbSAnLi9jb25kaXRpb25zL0dyZWF0ZXJUaGFuJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBMZXNzVGhhbn0gZnJvbSAnLi9jb25kaXRpb25zL0xlc3NUaGFuJztcbi8vIGV4cG9ydCB7ZGVmYXVsdCBhcyBHcmVhdGVyVGhhbk9yRXF1YWx9IGZyb20gJy4vY29uZGl0aW9ucy9HcmVhdGVyVGhhbk9yRXF1YWwnO1xuLy8gZXhwb3J0IHtkZWZhdWx0IGFzIExlc3NUaGFuT3JFcXVhbH0gZnJvbSAnLi9jb25kaXRpb25zL0xlc3NUaGFuT3JFcXVhbCc7XG5leHBvcnQge2RlZmF1bHQgYXMgRXF1YWx9IGZyb20gJy4vY29uZGl0aW9ucy9FcXVhbCc7XG4iLCJpbXBvcnQgSUFjdGlvbiBmcm9tICdhY3Rpb25zL0lBY3Rpb24nO1xuLyoqXG4gKiBNb2R1bGUgb2YgZXJyb3IgY2hlY2tlcnNcbiAqIEBtb2R1bGUgRXJyb3JzXG4gKiBAY2xhc3NcbiAqIEBzdGF0aWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JzIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRXJyb3JzXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgICAgIC0gQWN0aW9uIHRvIGNoZWNrIGZvciBhbiBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAtIFN0YXRlbWVudCB0byBjaGVjayBmb3IgYSBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4gICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9ICAgICAtIFRoZSBlcnJvciBtZXNzYWdlIGlmIGFueSwgb3RoZXJ3aXNlIG51bGwgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBJbmNvcnJlY3RTdGF0ZW1lbnQoYWN0aW9uOiBJQWN0aW9uLCBzdGF0ZW1lbnQ6IHN0cmluZyk6IHN0cmluZ3tcbiAgICAgICAgY29uc3QgYWN0aW9uczpzdHJpbmcgPSBhY3Rpb24uY29tbWFuZC5hY3Rpb25zLmZpbHRlcih4ID0+IHguZGVwZW5kZW50cy5zb21lKHkgPT4gYWN0aW9uIGluc3RhbmNlb2YgeSkpLm1hcCh4ID0+IHgubmFtZSkuam9pbignLCAnKTtcbiAgICAgICAgY29uc3QgZXJyb3I6IHN0cmluZyA9IGBJbmNvcnJlY3Qgc3RhdGVtZW50IGZvdW5kIGF0IFwiJHtzdGF0ZW1lbnR9XCIuICR7YWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ119IG11c3QgZm9sbG93ICR7YWN0aW9uc31gXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgfVxufSIsImludGVyZmFjZSBBcnJheTxUPntcblx0bGFzdCgpOiBUO1xufVxuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn0iLCJpbnRlcmZhY2UgSVBlcmZvcm1SZXN1bHQge1xuXHRyZXN1bHQ6IHN0cmluZztcblx0cGFzc2VkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElQZXJmb3JtUmVzdWx0OyIsImludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgSVZhcmlhYmxlczsiLCJpbXBvcnQgUGFyc2VyIGZyb20gJy4vUGFyc2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHR2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihzcWwsIHZhcmlhYmxlcyk7XG5cdHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgSU1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9JTW9kaWZpZXInXG5leHBvcnQge2RlZmF1bHQgYXMgTm90fSBmcm9tICcuL21vZGlmaWVycy9Ob3QnOyBcbmV4cG9ydCB7ZGVmYXVsdCBhcyBPckVxdWFsfSBmcm9tICcuL21vZGlmaWVycy9PckVxdWFsJzsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRXh0ZW5zaW9ucy50c1wiIC8+XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG4vKipcbiAqIFRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAbW9kdWxlIFBhcnNlclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNxbCAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZm91bmQgaW4gdGhlIFNRaWdnTCBxdWVyeVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IHN0YWNrICAgICAgLSBDb21tYW5kIHN0YWNrIGZvciBzdG9yaW5nIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGVycm9yICAgICAgICAgLSBFcnJvciBzdHJpbmcgaWYgYW55IGVycm9ycyBhcmUgZm91bmQgaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXTtcblx0cHVibGljIHN0YWNrOiBDb21tYW5kW107XG4gICAgcHVibGljIGVycm9yOiBzdHJpbmc7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBzcWw6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG5cdFx0dGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgZXh0cmFjdChzcWw6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTpDb21tYW5kW117XG5cdFx0dmFyIG1hdGNoLCBjb21tYW5kczogQ29tbWFuZFtdID0gW10sIHN0YWNrOiBDb21tYW5kW10gPSBbXTtcblx0XHRDb21tYW5kLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUoKG1hdGNoID0gQ29tbWFuZC5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpe1xuXHRcdFx0dmFyIGZvdW5kID0gbmV3IENvbW1hbmQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpO1xuXHRcdFx0aWYoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuZGVwZW5kZW50KGZvdW5kLmFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHRzdGFjay5sYXN0KCkuZGVwZW5kZW50cy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgIXN0YWNrLmxhc3QoKS5hY3Rpb24udGVybWluYXRvcikge1xuXHRcdFx0XHRzdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0c3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0c3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdGNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGFyc2UoKTogc3RyaW5nIHtcblx0XHR2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBpZih0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuc3FsO1xuXHRcdGZvcih2YXIgY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcblx0XHRcdHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0xKTtcblx0XHRcdHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgVmFyaWFibGVSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlcic7IiwiaW1wb3J0IHtwYXJzZSBhcyBQYXJzZX0gZnJvbSAnLi9NYWluJztcbmxldCBTUWlnZ0wgPSB7XG4gICAgcGFyc2U6IFBhcnNlLFxuICAgIHZlcnNpb246ICcwLjEuMCcsXG4gICAgLy9leHRlbmQ6IEV4dGVuZFxufTtcbmlmKHdpbmRvdykgd2luZG93WydTUWlnZ0wnXSA9IFNRaWdnTDtcbmV4cG9ydCBkZWZhdWx0IFNRaWdnTDsiLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBJQWN0aW9uIGZyb20gJy4vSUFjdGlvbic7XG5pbXBvcnQgSVBlcmZvcm1SZXN1bHQgZnJvbSAnLi4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgRXJyb3JzIGZyb20gJy4uL0Vycm9ycyc7XG5pbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBFbHNlIGFjdGlvblxuICogQG1vZHVsZSBFbHNlXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kICAgICAgICAgICAgIC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgICAgICAgICAgLSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgICAgIC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCAgICAgICAgICAtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgIC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxzZSBpbXBsZW1lbnRzIElBY3Rpb24ge1xuXHQvKipcbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvXlxccyplbHNlXFxiL2k7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjb25kaXRpb25zID0gW107XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQWN0aW9uW119IEFycmF5IG9mIGRlcGVuZGVudCBhY3Rpb25zXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgZGVwZW5kZW50cyA9IFtdO1xuXHRwdWJsaWMgdGVybWluYXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyB2YXJpYWJsZTogYW55O1xuXHRwdWJsaWMgY29uZGl0aW9uOiBJQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBzdXBwb3J0ZXI6IENvbW1hbmQ7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjb21tYW5kOiBDb21tYW5kLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0fVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBmb3IgYW55IGtub3duIHN5bnRheCBlcnJvcnMgcmVnYXJkaW5nIHRoaXMgYWN0aW9uXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICBpZighdGhpcy5zdXBwb3J0ZXIpIHJldHVybiBFcnJvcnMuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9XG5cdC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG5cdCAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0ge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cblx0cHVibGljIHBlcmZvcm0ocHJldlBhc3NlZDogYm9vbGVhbiA9IGZhbHNlKTogSVBlcmZvcm1SZXN1bHR7XG5cdFx0cmV0dXJuICFwcmV2UGFzc2VkID8ge3Jlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlfSA6IHtyZXN1bHQ6ICcnLCBwYXNzZWQ6IGZhbHNlfTtcblx0fVxufSIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi4vRXJyb3JzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIEVuZElmIGFjdGlvblxuICogQG1vZHVsZSBFbmRJZlxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyBJQWN0aW9uIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZElmIGltcGxlbWVudHMgSUFjdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvXlxccyplbmRpZlxcYi9pO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbmRpdGlvbnMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQWN0aW9uW119IEFycmF5IG9mIGRlcGVuZGVudCBhY3Rpb25zXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgZGVwZW5kZW50cyA9IFtdO1xuXHRwdWJsaWMgdGVybWluYXRvcjogYm9vbGVhbiA9IHRydWU7XG4gICAgcHVibGljIHZhcmlhYmxlOiBhbnk7XG4gICAgcHVibGljIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBwdWJsaWMgc3VwcG9ydGVyOiBDb21tYW5kO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY29tbWFuZDogQ29tbWFuZCwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdH1cblx0LyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZSgpOiBzdHJpbmd7XG4gICAgICAgIGlmKCF0aGlzLnN1cHBvcnRlcikgcmV0dXJuIEVycm9ycy5JbmNvcnJlY3RTdGF0ZW1lbnQodGhpcywgdGhpcy5zdGF0ZW1lbnQpO1xuICAgIH1cbiAgICAvKipcblx0ICogUGVyZm9ybSB0aGUgYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdCB7XG5cdFx0cmV0dXJuIHtyZXN1bHQ6IHRoaXMuaW5uZXIsIHBhc3NlZDogdHJ1ZX07XG5cdH0gICAgXG59IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSVBlcmZvcm1SZXN1bHQgZnJvbSAnLi4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBpbnRlcmZhY2UgZm9yIGFsbCBhY3Rpb25zIHRvIGFkaGVyZSB0b1xuICogQGludGVyZmFjZSBJQWN0aW9uXG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgXHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyIFx0XHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXRlbWVudFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciBcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xuaW50ZXJmYWNlIElBY3Rpb24ge1xuICAgIC8vIHN0YXRpYyByZWdleDogUmVnRXhwO1xuICAgIC8vIHN0YXRpYyBjb25kaXRpb25zOiBJQ29uZGl0aW9uW107XG5cdC8vIHN0YXRpYyBkZXBlbmRlbnRzOiBJQWN0aW9uW107XG5cdHRlcm1pbmF0b3I6IGJvb2xlYW47XG4gICAgdmFyaWFibGU6IGFueTtcbiAgICBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgc3VwcG9ydGVyOiBDb21tYW5kO1xuICAgIGNvbW1hbmQ6IENvbW1hbmQ7XG4gICAgc3RhdGVtZW50OiBzdHJpbmc7XG4gICAgaW5uZXI6IHN0cmluZztcbiAgICB2YXJpYWJsZXM6IElWYXJpYWJsZXM7XG5cdC8qKlxuXHQgKiBAbWV0aG9kXG4gICAgICogQG1lbWJlcm9mIElBY3Rpb25cblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXG5cdCAqIEByZXR1cm5zIElQZXJmb3JtUmVzdWx0IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG4gICAgdmFsaWRhdGUoKTpzdHJpbmc7XG5cdHBlcmZvcm0ocHJldlBhc3NlZD86IGJvb2xlYW4pOiBJUGVyZm9ybVJlc3VsdDtcbn1cbmV4cG9ydCBkZWZhdWx0IElBY3Rpb247IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50c1wiIC8+XG5pbXBvcnQge0Vsc2UsIEVuZElmfSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCB7SXNOb3ROdWxsLCBJc051bGwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgRXF1YWx9IGZyb20gJy4uL0NvbmRpdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgSWYgYWN0aW9uXG4gKiBAbW9kdWxlIElmXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtAbGluayBJQWN0aW9ufVxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElmIGltcGxlbWVudHMgSUFjdGlvbiB7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvXlxccyppZlxcYi9pO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gQXJyYXkgb2YgY29uZGl0aW9ucyBhdmFpbGFibGUgdG8gdGhpcyBhY3Rpb25cbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyBjb25kaXRpb25zID0gW0lzTm90TnVsbCwgSXNOdWxsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIEVxdWFsXTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQWN0aW9uW119IEFycmF5IG9mIGRlcGVuZGVudCBhY3Rpb25zXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgZGVwZW5kZW50cyA9IFtFbHNlLCBFbmRJZl07XG5cdHB1YmxpYyB0ZXJtaW5hdG9yOiBib29sZWFuID0gZmFsc2U7XG5cdHB1YmxpYyB2YXJpYWJsZTogYW55O1xuXHRwdWJsaWMgY29uZGl0aW9uOiBJQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBzdXBwb3J0ZXI6IENvbW1hbmQ7XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBjb21tYW5kOiBDb21tYW5kLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHR0aGlzLmNvbmRpdGlvbiA9IHRoaXMucGFyc2VDb25kaXRpb24oc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuXHR9XG5cdC8qKlxuXHQgKiBUcnkgYW5kIGxvY2F0ZSBhIG1hdGNoaW5nIGNvbmRpdGlvbiBmcm9tIHRoZSBhdmFpbGFibGUgY29uZGl0aW9ucyBmb3IgdGhpcyBhY3Rpb24uIElmIG5vIG1hdGNoIGlzIGZvdW5kLCByZXR1cm4gbnVsbC5cbiAgICAgKiBAbWVtYmVyb2YgSWZcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0LSBTdGF0ZW1lbnQgdG8gY2hlY2sgY29uZGl0aW9ucyBhZ2FpbnN0XG5cdCAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHQtIExpc3Qgb2YgdmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cblx0ICogQHJldHVybnMge0lDb25kaXRpb24gfCBudWxsfVx0XHQtIENvbmRpdGlvbiB0aGF0IG1hdGNoZXMgd2l0aGluIHRoZSBzdGF0ZW1lbnRcblx0ICovXG5cdHB1YmxpYyBwYXJzZUNvbmRpdGlvbihzdGF0ZW1lbnQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHRmb3IodmFyIGNvbmRpdGlvbiBvZiBJZi5jb25kaXRpb25zKXtcblx0XHRcdHZhciBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChjb25kaXRpb24ucmVnZXgpO1xuXHRcdFx0aWYobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMCkgcmV0dXJuIG5ldyBjb25kaXRpb24obWF0Y2hbMV0sIHZhcmlhYmxlcywgbWF0Y2hbNF0sIG1hdGNoWzJdLCBtYXRjaFszXSk7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGZvciBhbnkga25vd24gc3ludGF4IGVycm9ycyByZWdhcmRpbmcgdGhpcyBhY3Rpb25cbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSBUaGUgY2F1Z2h0IGVycm9yIGlmIGFueVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZSgpOnN0cmluZ3tcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXHQvKipcblx0ICogUGVyZm9ybSB0aGUgYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgKiBAbWVtYmVyb2YgSWZcblx0ICogQG1ldGhvZFxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFx0LSBJZiB0aGlzIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiBhbm90aGVyIGFjdGlvbiwgZGlkIHRoZSBwcmV2aW91cyBhY3Rpb24gcmFuIHBhc3Mgb3IgZmFpbC5cblx0ICogQHJldHVybnMge0lQZXJmb3JtUmVzdWx0fSB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuXHRwdWJsaWMgcGVyZm9ybShwcmV2UGFzc2VkOiBib29sZWFuID0gZmFsc2UpOiBJUGVyZm9ybVJlc3VsdHtcblx0XHRyZXR1cm4gdGhpcy5jb25kaXRpb24ucGVyZm9ybSgpXHRcblx0XHRcdFx0PyB7cmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWV9IFxuXHRcdFx0XHQ6IHtyZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlfTtcblx0fVxufSIsImltcG9ydCB7SU1vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvbiB7XG4gICAgcHVibGljIHN0YXRpYyBtb2RzKGtsYXNzKXtcbiAgICAgICAgcmV0dXJuIGtsYXNzLm1vZGlmaWVycy5tYXAoeCA9PiBgJHt4LmlkZW50aWZpZXJzLm1hcChpZCA9PiBpZC5zb3VyY2UpLmpvaW4oJ3wnKX1gKS5qb2luKCd8Jyk7XG4gICAgfVxuICAgIHB1YmxpYyBleHRyYWN0TW9kaWZpZXJzKGtsYXNzLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyk6IGFueVtde1xuICAgICAgICBpZighbW9kMSAmJiAhbW9kMikgcmV0dXJuIFtdO1xuICAgICAgICBsZXQgYXJyYXkgPSBbXSwgY291bnQgPSAwO1xuICAgICAgICBpZihtb2QxKSBjb3VudCsrO1xuICAgICAgICBpZihtb2QyKSBjb3VudCsrO1xuICAgICAgICBmb3IobGV0IG1vZCBvZiBrbGFzcy5tb2RpZmllcnMpe1xuICAgICAgICAgICAgZm9yKGxldCBpZGVudGlmaWVyIG9mIG1vZC5pZGVudGlmaWVycyl7XG4gICAgICAgICAgICAgICAgaWYobW9kMSAmJiBpZGVudGlmaWVyLnRlc3QobW9kMSkpIGFycmF5WzBdID0gbW9kO1xuICAgICAgICAgICAgICAgIGlmKG1vZDIgJiYgaWRlbnRpZmllci50ZXN0KG1vZDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5WyFtb2QxID8gMCA6IDFdID0gbW9kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihhcnJheS5sZW5ndGggPT09IGNvdW50KSByZXR1cm4gYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbiAgICBwdWJsaWMgcGVyZm9ybU1vZGlmaWVycyhtb2RpZmllcnM6IElNb2RpZmllcltdLCByZXN1bHQ6IGJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcywgY29tcGFyYXRpdmU6IHN0cmluZyk6IGJvb2xlYW57XG4gICAgICAgIGlmKG1vZGlmaWVycy5sZW5ndGggPT09IDApIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGxldCBpO1xuICAgICAgICBmb3IoaT1tb2RpZmllcnMubGVuZ3RoIC0gMTtpPi0xOy0taSl7XG4gICAgICAgICAgICByZXN1bHQgPSBtb2RpZmllcnNbaV0ucGVyZm9ybShyZXN1bHQsIHZhcmlhYmxlLCB2YXJpYWJsZXMsIGNvbXBhcmF0aXZlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuL0lDb25kaXRpb24nO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7SU1vZGlmaWVyLCBOb3QsIE9yRXF1YWx9IGZyb20gJy4uL01vZGlmaWVycyc7XG5cbi8qKlxuICogVGhlID09IGNvbmRpdGlvblxuICogQG1vZHVsZSBFcXVhbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWFsIGV4dGVuZHMgQ29uZGl0aW9uIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVxdWFsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW05vdCwgT3JFcXVhbF07XG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoYChcXFxcdyspXFxcXHMrKCg/OiR7RXF1YWwubW9kcyhFcXVhbCl9fFxcXFxzKikpPSgoPzoke0VxdWFsLm1vZHMoRXF1YWwpfXxcXFxccyopKVxcXFxzKyhcXFxcZCt8W1wiJ11cXFxcdytbXCInXSlgLCAnaScpO1xuICAgIHB1YmxpYyBtb2RpZmllcnM6IElNb2RpZmllcltdID0gW107XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZywgbW9kMTogc3RyaW5nLCBtb2QyOiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm1vZGlmaWVycyA9IHRoaXMuZXh0cmFjdE1vZGlmaWVycyhFcXVhbCwgbW9kMSwgbW9kMik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcXVhbFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gPT09IHRoaXMuY29tcGFyYXRpdmU7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMucGVyZm9ybU1vZGlmaWVycyh0aGlzLm1vZGlmaWVycywgcmVzdWx0LCB0aGlzLnZhcmlhYmxlLCB0aGlzLnZhcmlhYmxlcywgdGhpcy5jb21wYXJhdGl2ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cdH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuL0lDb25kaXRpb24nO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbidcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtJTW9kaWZpZXIsIE5vdCwgT3JFcXVhbH0gZnJvbSAnLi4vTW9kaWZpZXJzJztcblxuLyoqXG4gKiBUaGUgPiBjb25kaXRpb25cbiAqIEBtb2R1bGUgR3JlYXRlclRoYW5cbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmVhdGVyVGhhbiBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhblxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtOb3QsIE9yRXF1YWxdO1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzKygoPzoke0dyZWF0ZXJUaGFuLm1vZHMoR3JlYXRlclRoYW4pfXxcXFxccyopKT4oKD86JHtHcmVhdGVyVGhhbi5tb2RzKEdyZWF0ZXJUaGFuKX18XFxcXHMqKSlcXFxccysoXFxcXGQrKWAsICdpJyk7XG4gICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gc3VwZXIuZXh0cmFjdE1vZGlmaWVycyhHcmVhdGVyVGhhbiwgbW9kMSwgbW9kMik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBHcmVhdGVyVGhhblxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuICAgICAgICBsZXQgcmVzdWx0ID0gcGFyc2VJbnQodGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0pID4gcGFyc2VJbnQodGhpcy5jb21wYXJhdGl2ZSk7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMucGVyZm9ybU1vZGlmaWVycyh0aGlzLm1vZGlmaWVycywgcmVzdWx0LCB0aGlzLnZhcmlhYmxlLCB0aGlzLnZhcmlhYmxlcywgdGhpcy5jb21wYXJhdGl2ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7IFxuXHR9XG59IiwiaW50ZXJmYWNlIElDb25kaXRpb24ge1xuICAgIC8vc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy9zdGF0aWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXTtcblx0Ly9zdGF0aWMgY3JlYXRlKHN0YXRlbWVudDogc3RyaW5nKTogSUNvbmRpdGlvbjtcblx0cGVyZm9ybSgpOmJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJQ29uZGl0aW9uOyIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7SU1vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIElzIE5vdCBOdWxsIGNvbmRpdGlvblxuICogQG1vZHVsZSBJc05vdE51bGxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJc05vdE51bGwgZXh0ZW5kcyBDb25kaXRpb24gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOb3ROdWxsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW107XG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC8oXFx3KylcXHMraXNcXHMrbm90XFxzK251bGxcXHMqL2k7XG4gICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gc3VwZXIuZXh0cmFjdE1vZGlmaWVycyhJc05vdE51bGwsIG1vZDEsIG1vZDIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOb3ROdWxsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGw7XG5cdH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuL0lDb25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBJcyBOdWxsIGNvbmRpdGlvblxuICogQG1vZHVsZSBJc051bGxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJc051bGwgZXh0ZW5kcyBDb25kaXRpb24gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSXNOdWxsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtdO1xuICAgICBwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFxcdyopXFxzK2lzXFxzK251bGxcXHMqL2k7XG4gICAgIHB1YmxpYyBtb2RpZmllcnM6IElNb2RpZmllcltdID0gW107XG4gICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZywgbW9kMTogc3RyaW5nLCBtb2QyOiBzdHJpbmcpe1xuICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgIHRoaXMubW9kaWZpZXJzID0gc3VwZXIuZXh0cmFjdE1vZGlmaWVycyhJc051bGwsIG1vZDEsIG1vZDIpO1xuICAgICB9XG4gICAgIC8qKlxuICAgICAgKiBAbWVtYmVyb2YgSXNOdWxsXG4gICAgICAqIEBtZXRob2RcbiAgICAgICogQHB1YmxpY1xuICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAgKi9cbiAgICAgIHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcbiAgICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gPT0gbnVsbDtcbiAgICAgIH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuL0lDb25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJztcbmltcG9ydCB7SU1vZGlmaWVyLCBOb3QsIE9yRXF1YWx9IGZyb20gJy4uL01vZGlmaWVycyc7XG5cbi8qKlxuICogVGhlIDwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIExlc3NUaGFuXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJQ29uZGl0aW9ufVxuICogQHBhcmFtIHtzdHJpbmd9IHZhcmlhYmxlICAgICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFyaWFibGUgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVzc1RoYW4gZXh0ZW5kcyBDb25kaXRpb24gaW1wbGVtZW50cyBJQ29uZGl0aW9uIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgTGVzc1RoYW5cbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZmllcnMgPSBbTm90LCBPckVxdWFsXTtcblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cChgKFxcXFx3KylcXFxccysoKD86JHtMZXNzVGhhbi5tb2RzKExlc3NUaGFuKX18XFxcXHMqKSk8KCg/OiR7TGVzc1RoYW4ubW9kcyhMZXNzVGhhbil9fFxcXFxzKikpXFxcXHMrKFxcXFxkKylgLCAnaScpO1xuICAgIHB1YmxpYyBtb2RpZmllcnM6IElNb2RpZmllcltdID0gW107XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBwdWJsaWMgY29tcGFyYXRpdmU6IHN0cmluZywgbW9kMTogc3RyaW5nLCBtb2QyOiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm1vZGlmaWVycyA9IHRoaXMuZXh0cmFjdE1vZGlmaWVycyhMZXNzVGhhbiwgbW9kMSwgbW9kMik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhblxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IE91dGNvbWUgb2YgYXBwbHlpbmcgdGhlIGNvbmRpdGlvbiB0byB0aGUgdmFyaWFibGVcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuXHRcdGxldCByZXN1bHQgPSBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPCBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5pbnRlcmZhY2UgSU1vZGlmaWVyIHtcbiAgICBpZGVudGlmaWVyczogUmVnRXhwW107XG4gICAgcGVyZm9ybShyZXN1bHQ6Ym9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBjb21wYXJhdGl2ZTogc3RyaW5nKTpib29sZWFuO1xuICAgIG1hdGNoZXMoaXRlbTogc3RyaW5nKTpib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSU1vZGlmaWVyOyIsImltcG9ydCBJTW9kaWZpZXIgZnJvbSAnLi9JTW9kaWZpZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5jb25zdCBOb3Q6SU1vZGlmaWVyID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLyEvaSwgLyg/OlxcYnxcXHMrKW5vdCg/OlxcYnxcXHMrKS9pXSxcbiAgICBwZXJmb3JtOiAocmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFuID0+IHtyZXR1cm4gIXJlc3VsdDt9LFxuICAgIG1hdGNoZXM6IChpdGVtKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGZvcihsZXQgaWRlbnRpZmllciBvZiBOb3QuaWRlbnRpZmllcnMpe1xuICAgICAgICAgICAgaWYoaWRlbnRpZmllci50ZXN0KGl0ZW0pKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgTm90OyIsImltcG9ydCBJTW9kaWZpZXIgZnJvbSAnLi9JTW9kaWZpZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5jb25zdCBPckVxdWFsOiBJTW9kaWZpZXIgPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvPS9pXSxcbiAgICBwZXJmb3JtOiAocmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCB2YXJpYWJsZXNbdmFyaWFibGVdID09PSBjb21wYXJhdGl2ZTtcbiAgICB9LFxuICAgIG1hdGNoZXM6IChpdGVtKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGZvcihsZXQgaWRlbnRpZmllciBvZiBPckVxdWFsLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgIGlmKGlkZW50aWZpZXIudGVzdChpdGVtKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IE9yRXF1YWw7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJUmVwbGFjZXIge1xuICAgIC8vc3RhdGljIHJlZ2V4OiBSZWdFeHA7XG4gICAgLy9zdGF0aWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElSZXBsYWNlcjsiLCJpbXBvcnQgSVJlcGxhY2VyIGZyb20gJy4vSVJlcGxhY2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG4vKipcbiAqIFRoZSB2YXJpYWJsZSByZXBsYWNlciBmb3IgZW1iZWRkZWQgU1FpZ2dMIHZhcmlhYmxlc1xuICogQG1vZHVsZSBWYXJpYWJsZVJlcGxhY2VyXG4gKiBAc3RhdGljXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIHtJUmVwbGFjZXJ9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhcmlhYmxlUmVwbGFjZXIgaW1wbGVtZW50cyBJUmVwbGFjZXIge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2c7XG5cdC8qKlxuICAgICAqIEBtZW1iZXJvZiBWYXJpYWJsZVJlcGxhY2VyXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAgICAgICAgICAgICAtIFRleHQgdG8gc2VhcmNoIGZvciByZXBsYWNlbWVudHNcbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlXG4gICAgICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICAgLSBUaGUgc3RyaW5nIHdpdGggdmFyaWFibGVzIHJlcGxhY2VkIFxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlcGxhY2UodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmd7XG5cdFx0cmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCAobWF0Y2gsICQxLCAkMikgPT4gJDErdmFyaWFibGVzWyQyXSk7XG5cdH1cbn0iXX0=
