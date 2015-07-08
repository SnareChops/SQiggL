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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRTY29wZS50cyIsInNyYy9Db25kaXRpb25zLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lQZXJmb3JtUmVzdWx0LnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2VyLnRzIiwic3JjL1JlcGxhY2Vycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvYWN0aW9ucy9FbHNlLnRzIiwic3JjL2FjdGlvbnMvRW5kSWYudHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSWYudHMiLCJzcmMvY29uZGl0aW9ucy9Db25kaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9FcXVhbC50cyIsInNyYy9jb25kaXRpb25zL0dyZWF0ZXJUaGFuLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC50cyIsInNyYy9jb25kaXRpb25zL0lzTnVsbC50cyIsInNyYy9jb25kaXRpb25zL0xlc3NUaGFuLnRzIiwic3JjL21vZGlmaWVycy9JTW9kaWZpZXIudHMiLCJzcmMvbW9kaWZpZXJzL05vdC50cyIsInNyYy9tb2RpZmllcnMvT3JFcXVhbC50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyLnRzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsbUhBQW1IO0FBQ25ILHNCQUErQixpQkFBaUIsQ0FBQztBQUF6QyxnQ0FBeUM7QUFDakQscUJBQThCLGdCQUFnQixDQUFDO0FBQXZDLDhCQUF1QztBQUMvQyxtQkFBNEIsY0FB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dXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE5vdGU6IFRoZXNlIGFyZSBsb2FkZWQgaW4gb3JkZXIsIG1ha2Ugc3VyZSBhbnkgZGVwZW5kZW50IGFjdGlvbnMgYXJlIGxpc3RlZCBhYm92ZSB0aGUgYWN0aW9uIHRoYXQgcmVxdWlyZXMgdGhlbS5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBFbmRJZn0gZnJvbSAnLi9hY3Rpb25zL0VuZElmJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBFbHNlfSBmcm9tICcuL2FjdGlvbnMvRWxzZSc7XG5leHBvcnQge2RlZmF1bHQgYXMgSWZ9IGZyb20gJy4vYWN0aW9ucy9JZic7IiwiaW1wb3J0IHtJZiwgRWxzZSwgRW5kSWZ9IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZFNjb3BlIGZyb20gJy4vQ29tbWFuZFNjb3BlJztcbmltcG9ydCB7VmFyaWFibGVSZXBsYWNlcn0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbi8qKlxuICogQ29tbWFuZCBvYmplY3QgcmVzcG9uc2libGUgZm9yIGhhbmRsaW5nIGFsbCBhY3Rpb25zLCBjb25kaXRpb25zLCBhbmQgdmFyaWFibGVzIHdpdGhpbiBpdCdzIHNlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gKiBAbW9kdWxlIENvbW1hbmRcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4ICAgICAgICAgICAgICAgIC0gQmVnaW5uaW5nIGluZGV4IG9mIHRoZSBjb21tYW5kIGluIHRoZSBvcmlnaW5hbCBxdWVyeSBzdHJpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggICAgICAgICAgICAgICAtIExlbmd0aCBvZiB0aGUgc2VjdGlvbiBvZiB0aGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgICAgIC0gU3RhdGVtZW50IHdpdGhpbiB0aGUgJ3t7JSAlfX0nIHRoYXQgdGhpcyBjb21tYW5kIGlzIHJlc3BvbnNpYmxlIGZvclxuICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgICAgIC0gVGV4dCB0aGF0IGltbWVkaWF0ZWx5IGZvbGxvd3MgdGhlIHN0YXRlbWVudCB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbW1hbmRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBpbmRleCAgICAgICAgICAgICAtIEJlZ2lubmluZyBpbmRleCBvZiB0aGUgY29tbWFuZCBpbiB0aGUgb3JpZ2luYWwgcXVlcnkgc3RyaW5nXG4gKiBAcHJvcGVydHkge251bWJlcn0gbGVuZ3RoICAgICAgICAgICAgLSBMZW5ndGggb2YgdGhlIHNlY3Rpb24gb2YgdGhlIG9yaWdpbmFsIHN0cmluZyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAtIFN0YXRlbWVudCB3aXRoaW4gdGhlICd7eyUgJX19JyB0aGF0IHRoaXMgY29tbWFuZCBpcyByZXNwb25zaWJsZSBmb3JcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAtIFRleHQgdGhhdCBpbW1lZGlhdGVseSBmb2xsb3dzIHRoZSBzdGF0ZW1lbnQgdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gYWN0aW9ucyAgICAgICAgLSBBcnJheSBvZiBhY3Rpb25zIGF2YWlsYWJsZSB0byBTUWlnZ0xcbiAqIEBwcm9wZXJ0eSB7SVJlcGxhY2VyW119IHJlcGxhY2VycyAgICAtIEFycmF5IG9mIHJlcGxhY2VycyBhdmFpbGFibGUgdG8gU1FpZ2dMXG4gKiBAcHJvcGVydHkge0NvbW1hbmRTY29wZX0gc2NvcGUgICAgICAgLSBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kLCBzdWNoIGFzIGF2YWlsYWJsZSB2YXJpYWJsZXMge0BzZWUgQ29tbWFuZFNjb3BlfVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGRlcGVuZGVudHMgICAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZGVwZW5kZW50IHRvIHRoaXMgY29tbWFuZCAgICAgICAgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmQge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSAve3slKC4qPyklfX0oW1xcc1xcU10qPyk/KD89KD86e3slfCQpKS9nbTtcblx0cHVibGljIGFjdGlvbnM6IGFueVtdID0gW0lmLCBFbHNlLCBFbmRJZl07XG5cdHB1YmxpYyByZXBsYWNlcnMgPSBbVmFyaWFibGVSZXBsYWNlcl07XG5cdHB1YmxpYyBhY3Rpb246IElBY3Rpb247XG5cdHB1YmxpYyBzY29wZTogQ29tbWFuZFNjb3BlID0gbmV3IENvbW1hbmRTY29wZSgpO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG5cdGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbGVuZ3RoOm51bWJlciwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHR0aGlzLnNjb3BlLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0XHR0aGlzLmFjdGlvbiA9IHRoaXMuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuXHR9XG5cdC8qKlxuICAgICAqIEV4dHJhY3QgYWN0aW9ucyBmcm9tIHRoZSBzdGF0ZW1lbnRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgLSBTdGF0ZW1lbnQgdG8gZXh0cmFjdCB0aGUgYWN0aW9ucyBmcm9tXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlubmVyICAgICAgICAgICAgLSBJbm5lciB0ZXh0IGZvciB0aGUgY29tbWFuZFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb21tYW5kXG4gICAgICogQHJldHVybnMge0lBY3Rpb24gfCBudWxsfSAgICAgICAgLSBUaGUgbWF0Y2hpbmcgYWN0aW9uIG9yIG51bGwgaWYgbm8gYWN0aW9uIHdhcyBmb3VuZFxuICAgICAqL1x0XG5cdHB1YmxpYyBleHRyYWN0KHN0YXRlbWVudDogc3RyaW5nLCBpbm5lcjogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBJQWN0aW9ue1xuXHRcdGZvcih2YXIgYWN0aW9uIG9mIHRoaXMuYWN0aW9ucyl7XG5cdFx0XHRpZihhY3Rpb24ucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpIHJldHVybiBuZXcgYWN0aW9uKHRoaXMsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGNvbW1hbmQgYW5kIHJldHVybiB0aGUgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFzc2VkICAgICAgLSBJZiB0aGUgY29tbWFuZCBpcyBhIGRlcGVuZGVudCB0aGVuIHRoaXMgd2lsbCByZWZsZWN0IGlmIHRoZSBwcmV2aW91cyBjb21tYW5kIHN1Y2NlZWRlZCBvciBmYWlsZWRcbiAgICAgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9ICAgIC0gVGhlIHJlc3VsdCBvZiB0aGUgY29tbWFuZCBleGVjdXRpb24ge0BzZWUgSVBlcmZvcm1SZXN1bHR9XG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKHBhc3NlZDogYm9vbGVhbik6IElQZXJmb3JtUmVzdWx0IHtcblx0XHR2YXIgcmVzdWx0OiBJUGVyZm9ybVJlc3VsdCA9IHRoaXMuYWN0aW9uLnBlcmZvcm0ocGFzc2VkKTtcblx0XHRyZXN1bHQucmVzdWx0ICs9IHRoaXMucGVyZm9ybURlcGVuZGVudHMocmVzdWx0LnBhc3NlZCk7XG5cdFx0Zm9yKHZhciByZXBsYWNlciBvZiB0aGlzLnJlcGxhY2Vycyl7XG5cdFx0XHRyZXN1bHQucmVzdWx0ID0gcmVwbGFjZXIucmVwbGFjZShyZXN1bHQucmVzdWx0LCB0aGlzLnNjb3BlLnZhcmlhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSBjb21tYW5kcyB0aGF0IGFyZSB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tbWFuZCAoc3ViLWNvbW1hbmRzKVxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBzdWItY29tbWFuZCdzIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybVNjb3BlKCk6IHN0cmluZyB7XG5cdFx0dmFyIHJldDogc3RyaW5nID0gJycsIHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0XHRmb3IodmFyIGNvbW1hbmQgb2YgdGhpcy5zY29wZS5jb21tYW5kcyl7XG5cdFx0XHR2YXIgcmVzdWx0ID0gY29tbWFuZC5wZXJmb3JtKHByZXZQYXNzZWQpO1xuXHRcdFx0cHJldlBhc3NlZCA9IHJlc3VsdC5wYXNzZWQ7XG5cdFx0XHRyZXQgKz0gcmVzdWx0LnJlc3VsdDtcblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXHQvKipcbiAgICAgKiBQZXJmb3JtIGNvbW1hbmRzIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGNvbW1hbmRcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWFuZFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkICAtIElmIHRoaXMgY29tbWFuZCBpcyBhIGRlcGVuZGVudCB0aGVuIHRoaXMgd2lsbCByZWZsZWN0IGlmIHRoZSBwcmV2aW91cyBjb21tYW5kIHN1Y2NlZWRlZCBvciBmYWlsZWRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBkZXBlbmRlbnQgZXhlY3V0aW9ucyAoY29sbGVjdGl2ZWx5KVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybURlcGVuZGVudHMocHJldlBhc3NlZDogYm9vbGVhbik6IHN0cmluZyB7XG5cdFx0dmFyIHJldDogc3RyaW5nID0gJyc7XG5cdFx0Zm9yKHZhciBkZXBlbmRlbnQgb2YgdGhpcy5kZXBlbmRlbnRzKXtcblx0XHRcdHZhciByZXN1bHQgPSBkZXBlbmRlbnQucGVyZm9ybShwcmV2UGFzc2VkKTtcblx0XHRcdHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuXHRcdFx0cmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblx0LyoqXG4gICAgICogUGVyZm9ybSB0aGUgdGVybWluYXRpb24gb2YgdGhlIGNvbW1hbmQncyBhY3Rpb25zIGlmIG5lZWRlZCAoRm9yIGV4YW1wbGUgXCJFbmRJZlwiIGlzIGEgdGVybWluYXRvciBvZiBcIklmXCIsIHNvIHRoaXMgZXNzZW50aWFsbHkgbWVhbnMgdG8ganVzdCBwcmludCBvdXQgdGhlIHN0cmluZyB0aGF0IGZvbGxvd3MgXCJFbmRJZlwiKVxuICAgICAqIEBtZW1iZXJvZiBDb21tYW5kXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcmVzdWx0IG9mIHRoZSBhY3Rpb24ncyB0ZXJtaW5hdG9yXG4gICAgICovXG5cdHB1YmxpYyB0ZXJtaW5hdGlvbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlLmNvbW1hbmRzLnNvbWUoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yKVxuXHRcdD8gdGhpcy5zY29wZS5jb21tYW5kcy5maWx0ZXIoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yKVsxXS5wZXJmb3JtKGZhbHNlKS5yZXN1bHRcblx0XHQ6ICcnO1xuXHR9XG5cdC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBpbnB1dHRlZCBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgdGhlIGFjdGlvbiBmb3IgdGhpcyBjb21tYW5kXG4gICAgICogQG1lbWJlcm9mIENvbW1hbmRcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAtIFRoZSBhY3Rpb24gdG8gY2hlY2sgaWYgaXQgaXMgYSBkZXBlbmRlbnQgb2YgdGhpcyBjb21tYW5kJ3MgYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGFjdGlvbiBpcyBhIGRlcGVuZGVudCBvZiB0aGlzIGNvbW1hbmQncyBhY3Rpb24gXG4gICAgICovXG5cdHB1YmxpYyBkZXBlbmRlbnQoYWN0aW9uOiBJQWN0aW9uKTogYm9vbGVhbiB7XG5cdFx0Zm9yKHZhciBkZXBlbmRlbnQgb2YgdGhpcy5hY3Rpb24uY29uc3RydWN0b3JbJ2RlcGVuZGVudHMnXSl7XG5cdFx0XHRpZihhY3Rpb24gaW5zdGFuY2VvZiA8YW55PmRlcGVuZGVudCkgcmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuLyoqXG4gKiBUaGUgQ29tbWFuZCBTY29wZSBvYmplY3RcbiAqIEBtb2R1bGUgQ29tbWFuZFNjb3BlXG4gKiBAY2xhc3NcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gSG9sZHMgdmFyaWFibGVzIGZvciB0aGUgc2NvcGVcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgd2l0aGluIHRoZSBzY29wZVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBkZXBlbmRlbnQgY29tbWFuZHMgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRTY29wZSB7XG5cdHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7fTtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBJQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBJc05vdE51bGx9IGZyb20gJy4vY29uZGl0aW9ucy9Jc05vdE51bGwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIElzTnVsbH0gZnJvbSAnLi9jb25kaXRpb25zL0lzTnVsbCc7XG5leHBvcnQge2RlZmF1bHQgYXMgR3JlYXRlclRoYW59IGZyb20gJy4vY29uZGl0aW9ucy9HcmVhdGVyVGhhbic7XG5leHBvcnQge2RlZmF1bHQgYXMgTGVzc1RoYW59IGZyb20gJy4vY29uZGl0aW9ucy9MZXNzVGhhbic7XG4vLyBleHBvcnQge2RlZmF1bHQgYXMgR3JlYXRlclRoYW5PckVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvR3JlYXRlclRoYW5PckVxdWFsJztcbi8vIGV4cG9ydCB7ZGVmYXVsdCBhcyBMZXNzVGhhbk9yRXF1YWx9IGZyb20gJy4vY29uZGl0aW9ucy9MZXNzVGhhbk9yRXF1YWwnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEVxdWFsfSBmcm9tICcuL2NvbmRpdGlvbnMvRXF1YWwnO1xuIiwiaW1wb3J0IElBY3Rpb24gZnJvbSAnYWN0aW9ucy9JQWN0aW9uJztcbi8qKlxuICogTW9kdWxlIG9mIGVycm9yIGNoZWNrZXJzXG4gKiBAbW9kdWxlIEVycm9yc1xuICogQGNsYXNzXG4gKiBAc3RhdGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9ycyB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVycm9yc1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHBhcmFtIHtJQWN0aW9ufSBhY3Rpb24gICAgICAtIEFjdGlvbiB0byBjaGVjayBmb3IgYW4gSW5jb3JyZWN0IFN0YXRlbWVudCBlcnJvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgLSBTdGF0ZW1lbnQgdG8gY2hlY2sgZm9yIGEgSW5jb3JyZWN0IFN0YXRlbWVudCBlcnJvclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSAgICAgLSBUaGUgZXJyb3IgbWVzc2FnZSBpZiBhbnksIG90aGVyd2lzZSBudWxsIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgSW5jb3JyZWN0U3RhdGVtZW50KGFjdGlvbjogSUFjdGlvbiwgc3RhdGVtZW50OiBzdHJpbmcpOiBzdHJpbmd7XG4gICAgICAgIGNvbnN0IGFjdGlvbnM6c3RyaW5nID0gYWN0aW9uLmNvbW1hbmQuYWN0aW9ucy5maWx0ZXIoeCA9PiB4LmRlcGVuZGVudHMuc29tZSh5ID0+IGFjdGlvbiBpbnN0YW5jZW9mIHkpKS5tYXAoeCA9PiB4Lm5hbWUpLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnN0IGVycm9yOiBzdHJpbmcgPSBgSW5jb3JyZWN0IHN0YXRlbWVudCBmb3VuZCBhdCBcIiR7c3RhdGVtZW50fVwiLiAke2FjdGlvbi5jb25zdHJ1Y3RvclsnbmFtZSddfSBtdXN0IGZvbGxvdyAke2FjdGlvbnN9YFxuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgIH1cbn0iLCJpbnRlcmZhY2UgQXJyYXk8VD57XG5cdGxhc3QoKTogVDtcbn1cbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59IiwiaW50ZXJmYWNlIElQZXJmb3JtUmVzdWx0IHtcblx0cmVzdWx0OiBzdHJpbmc7XG5cdHBhc3NlZD86IGJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJUGVyZm9ybVJlc3VsdDsiLCJpbnRlcmZhY2UgSVZhcmlhYmxlcyB7XG5cdFtrZXk6IHN0cmluZ106IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElWYXJpYWJsZXM7IiwiaW1wb3J0IFBhcnNlciBmcm9tICcuL1BhcnNlcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuLyoqXG4gKiBUaGUgc3RhcnRpbmcgcG9pbnQgb2YgdGhlIGVudGlyZSBTUWlnZ0wgcGFyc2VyXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRTCBxdWVyeSB0byBydW4gU1FpZ2dMIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlcz99IHZhcmlhYmxlcyAgIC0gT3B0aW9uYWwgY29sbGVjdGlvbiBvZiB2YXJpYWJsZXMgZm9yIHlvdXIgU1FpZ2dMIHF1ZXJ5XG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAtIFRoZSBmdWxseSBwYXJzZWQgU1FMIHF1ZXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcyk6IHN0cmluZ3tcblx0dmFyIHBhcnNlciA9IG5ldyBQYXJzZXIoc3FsLCB2YXJpYWJsZXMpO1xuXHRyZXR1cm4gcGFyc2VyLnBhcnNlKCk7XG59IiwiZXhwb3J0IHtkZWZhdWx0IGFzIElNb2RpZmllcn0gZnJvbSAnLi9tb2RpZmllcnMvSU1vZGlmaWVyJ1xuZXhwb3J0IHtkZWZhdWx0IGFzIE5vdH0gZnJvbSAnLi9tb2RpZmllcnMvTm90JzsgXG5leHBvcnQge2RlZmF1bHQgYXMgT3JFcXVhbH0gZnJvbSAnLi9tb2RpZmllcnMvT3JFcXVhbCc7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkV4dGVuc2lvbnMudHNcIiAvPlxuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuLyoqXG4gKiBUaGUgU1FpZ2dMIHBhcnNlclxuICogQG1vZHVsZSBQYXJzZXJcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzcWwgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGNvbW1hbmRzIGZvdW5kIGluIHRoZSBTUWlnZ0wgcXVlcnlcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBzdGFjayAgICAgIC0gQ29tbWFuZCBzdGFjayBmb3Igc3RvcmluZyBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBlcnJvciAgICAgICAgIC0gRXJyb3Igc3RyaW5nIGlmIGFueSBlcnJvcnMgYXJlIGZvdW5kIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIHtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW107XG5cdHB1YmxpYyBzdGFjazogQ29tbWFuZFtdO1xuICAgIHB1YmxpYyBlcnJvcjogc3RyaW5nO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgc3FsOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuXHRcdHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuXHR9XG5cdC8qKlxuICAgICAqIEV4dHJhY3QgYW55IGNvbW1hbmRzIG91dCBvZiB0aGUgU1FpZ2dMIHF1ZXJ5IGFuZCBkZXRlcm1pbmUgdGhlaXIgb3JkZXIsIG5lc3RpbmcsIGFuZCB0eXBlXG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBTUWlnZ0wgcXVlcnkgdG8gZXh0cmFjdCBjb21tYW5kcyBmcm9tXG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgZ2xvYmFsIHZhcmlhYmxlcyBwYXNzZWQgaW4gdG8gU1FpZ2dMXG4gICAgICogQHJldHVybnMge0NvbW1hbmRbXX0gICAgICAgICAgICAgLSBBcnJheSBvZiBmdWxseSBwYXJzZWQgY29tbWFuZHMsIHJlYWR5IGZvciBleGVjdXRpb25cbiAgICAgKi9cblx0cHVibGljIGV4dHJhY3Qoc3FsOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6Q29tbWFuZFtde1xuXHRcdHZhciBtYXRjaCwgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdLCBzdGFjazogQ29tbWFuZFtdID0gW107XG5cdFx0Q29tbWFuZC5yZWdleC5sYXN0SW5kZXggPSAwO1xuXHRcdHdoaWxlKChtYXRjaCA9IENvbW1hbmQucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKXtcblx0XHRcdHZhciBmb3VuZCA9IG5ldyBDb21tYW5kKG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgdmFyaWFibGVzKTtcblx0XHRcdGlmKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmRlcGVuZGVudChmb3VuZC5hY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgZm91bmQuYWN0aW9uLnN1cHBvcnRlciA9IHN0YWNrLmxhc3QoKTtcblx0XHRcdFx0c3RhY2subGFzdCgpLmRlcGVuZGVudHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChzdGFjay5sZW5ndGggPiAwICYmICFzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpIHtcblx0XHRcdFx0c3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHN0YWNrLmxhc3QoKS5zY29wZS5jb21tYW5kcy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZihzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5hY3Rpb24udGVybWluYXRvcikgc3RhY2sucG9wKCk7XG5cdFx0XHRcdHN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHRjb21tYW5kcy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cbiAgICAgICAgICAgIGxldCBlcnJvciA9IGZvdW5kLmFjdGlvbi52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgaWYoZXJyb3IpIHJldHVybiBbXTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbW1hbmRzO1xuXHR9XG5cdC8qKlxuICAgICAqIFJ1biB0aGUgY29tbWFuZHMgYWdhaW5zdCB0aGUgc3RyaW5nIGFuZCBvdXRwdXQgdGhlIGVuZCByZXN1bHRcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZW5kIHJlc3VsdCBvZiBydW5uaW5nIGFsbCBjb21tYW5kcyBhZ2FpbnN0IHRoZSBTUWlnZ0wgcXVlcnlcbiAgICAgKi9cblx0cHVibGljIHBhcnNlKCk6IHN0cmluZyB7XG5cdFx0dmFyIHF1ZXJ5ID0gJycsIGluZGV4ID0gMDtcbiAgICAgICAgaWYodGhpcy5jb21tYW5kcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLnNxbDtcblx0XHRmb3IodmFyIGNvbW1hbmQgb2YgdGhpcy5jb21tYW5kcyl7XG5cdFx0XHRxdWVyeSArPSB0aGlzLnNxbC5zbGljZShpbmRleCwgY29tbWFuZC5pbmRleCAtMSk7XG5cdFx0XHRxdWVyeSArPSBjb21tYW5kLnBlcmZvcm0oZmFsc2UpLnJlc3VsdDtcblx0XHRcdGluZGV4ICs9IGNvbW1hbmQubGVuZ3RoO1xuXHRcdH1cblx0XHRyZXR1cm4gcXVlcnk7IC8vVE9ET1xuXHR9XG59IiwiZXhwb3J0IHtkZWZhdWx0IGFzIFZhcmlhYmxlUmVwbGFjZXJ9IGZyb20gJy4vcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXInOyIsImltcG9ydCB7cGFyc2UgYXMgUGFyc2V9IGZyb20gJy4vTWFpbic7XG5sZXQgU1FpZ2dMID0ge1xuICAgIHBhcnNlOiBQYXJzZSxcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxuICAgIC8vZXh0ZW5kOiBFeHRlbmRcbn07XG5pZih3aW5kb3cpIHdpbmRvd1snU1FpZ2dMJ10gPSBTUWlnZ0w7XG5leHBvcnQgZGVmYXVsdCBTUWlnZ0w7IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSUFjdGlvbiBmcm9tICcuL0lBY3Rpb24nO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IEVycm9ycyBmcm9tICcuLi9FcnJvcnMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgRWxzZSBhY3Rpb25cbiAqIEBtb2R1bGUgRWxzZVxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAgICAgICAgICAgICAtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAgICAgICAgIC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciAgICAgICAgICAgICAgICAtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgICAgICAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgICAgICAgICAgLSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgICAgICAtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsc2UgaW1wbGVtZW50cyBJQWN0aW9uIHtcblx0LyoqXG4gICAgICogQG1lbWJlcm9mIEVsc2VcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL15cXHMqZWxzZVxcYi9pO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBBcnJheSBvZiBjb25kaXRpb25zIGF2YWlsYWJsZSB0byB0aGlzIGFjdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY29uZGl0aW9ucyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBBcnJheSBvZiBkZXBlbmRlbnQgYWN0aW9uc1xuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIGRlcGVuZGVudHMgPSBbXTtcblx0cHVibGljIHRlcm1pbmF0b3I6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwdWJsaWMgdmFyaWFibGU6IGFueTtcblx0cHVibGljIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBwdWJsaWMgc3VwcG9ydGVyOiBDb21tYW5kO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY29tbWFuZDogQ29tbWFuZCwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGFueSBrbm93biBzeW50YXggZXJyb3JzIHJlZ2FyZGluZyB0aGlzIGFjdGlvblxuICAgICAqIEBtZW1iZXJvZiBFbHNlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsaWRhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgaWYoIXRoaXMuc3VwcG9ydGVyKSByZXR1cm4gRXJyb3JzLkluY29ycmVjdFN0YXRlbWVudCh0aGlzLCB0aGlzLnN0YXRlbWVudCk7XG4gICAgfVxuXHQvKipcblx0ICogUGVyZm9ybSB0aGUgYWN0aW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgKiBAbWVtYmVyb2YgRWxzZVxuXHQgKiBAbWV0aG9kXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuXHQgKiBAcmV0dXJucyB7SVBlcmZvcm1SZXN1bHR9IHtAbGluayBJUGVyZm9ybVJlc3VsdH1cblx0ICovXG5cdHB1YmxpYyBwZXJmb3JtKHByZXZQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IElQZXJmb3JtUmVzdWx0e1xuXHRcdHJldHVybiAhcHJldlBhc3NlZCA/IHtyZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZX0gOiB7cmVzdWx0OiAnJywgcGFzc2VkOiBmYWxzZX07XG5cdH1cbn0iLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBJQWN0aW9uIGZyb20gJy4vSUFjdGlvbic7XG5pbXBvcnQgSVBlcmZvcm1SZXN1bHQgZnJvbSAnLi4vSVBlcmZvcm1SZXN1bHQnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgRXJyb3JzIGZyb20gJy4uL0Vycm9ycyc7XG5pbXBvcnQgSUNvbmRpdGlvbiBmcm9tICcuLi9jb25kaXRpb25zL0lDb25kaXRpb24nO1xuXG4vKipcbiAqIFRoZSBFbmRJZiBhY3Rpb25cbiAqIEBtb2R1bGUgRW5kSWZcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMgSUFjdGlvbiB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmRJZiBpbXBsZW1lbnRzIElBY3Rpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFbmRJZlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL15cXHMqZW5kaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgRW5kSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjb25kaXRpb25zID0gW107XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBBcnJheSBvZiBkZXBlbmRlbnQgYWN0aW9uc1xuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIGRlcGVuZGVudHMgPSBbXTtcblx0cHVibGljIHRlcm1pbmF0b3I6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHB1YmxpYyB2YXJpYWJsZTogYW55O1xuICAgIHB1YmxpYyBjb25kaXRpb246IElDb25kaXRpb247XG4gICAgcHVibGljIHN1cHBvcnRlcjogQ29tbWFuZDtcblx0Y29uc3RydWN0b3IocHVibGljIGNvbW1hbmQ6IENvbW1hbmQsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHR9XG5cdC8qKlxuICAgICAqIENoZWNrcyBmb3IgYW55IGtub3duIHN5bnRheCBlcnJvcnMgcmVnYXJkaW5nIHRoaXMgYWN0aW9uXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsaWRhdGUoKTogc3RyaW5ne1xuICAgICAgICBpZighdGhpcy5zdXBwb3J0ZXIpIHJldHVybiBFcnJvcnMuSW5jb3JyZWN0U3RhdGVtZW50KHRoaXMsIHRoaXMuc3RhdGVtZW50KTtcbiAgICB9XG4gICAgLyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIEVuZElmXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG5cdCAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0ge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cblx0cHVibGljIHBlcmZvcm0ocHJldlBhc3NlZDogYm9vbGVhbiA9IGZhbHNlKTogSVBlcmZvcm1SZXN1bHQge1xuXHRcdHJldHVybiB7cmVzdWx0OiB0aGlzLmlubmVyLCBwYXNzZWQ6IHRydWV9O1xuXHR9ICAgIFxufSIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElQZXJmb3JtUmVzdWx0IGZyb20gJy4uL0lQZXJmb3JtUmVzdWx0JztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgaW50ZXJmYWNlIGZvciBhbGwgYWN0aW9ucyB0byBhZGhlcmUgdG9cbiAqIEBpbnRlcmZhY2UgSUFjdGlvblxuICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50IFx0XHRcdC0gU3RhdGVtZW50IHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lciBcdFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBDb21tYW5kIHRoYXQgY29udGFpbnMgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGF0ZW1lbnRcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW5uZXIgXHRcdFx0LSBUZXh0IHRoYXQgZm9sbG93cyBhZnRlciB0aGlzIGFjdGlvbiB1bnRpbCB0aGUgbmV4dCBjb21tYW5kXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0XHQtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uICBcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdGVybWluYXRvciBcdFx0LSBEZWZpbmVzIGlmIHRoaXMgYWN0aW9uIGlzIGEgdGVybWluYXRvclxuICogQHByb3BlcnR5IHtJVmFyaWFibGV9IHZhcmlhYmxlXHRcdC0gVmFyaWFibGUgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvbiBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB0aGUgY29uZGl0aW9uXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb25bXX0gY29uZGl0aW9uc1x0LSBBcnJheSBvZiBjb25kaXRpb25zIHRoYXQgdGhpcyBhY3Rpb24gc3VwcG9ydHMgKGlmIGFueSlcbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbn0gY29uZGl0aW9uXHRcdC0gQ29uZGl0aW9uIHRoYXQgd2FzIGZvdW5kIGFzIGEgbWF0Y2ggZm9yIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge0lBY3Rpb25bXX0gZGVwZW5kZW50c1x0XHQtIEFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgZGVwZW5kZW50IG9uIHRoaXMgYWN0aW9uJ3MgcmVzdWx0XG4gKi9cbmludGVyZmFjZSBJQWN0aW9uIHtcbiAgICAvLyBzdGF0aWMgcmVnZXg6IFJlZ0V4cDtcbiAgICAvLyBzdGF0aWMgY29uZGl0aW9uczogSUNvbmRpdGlvbltdO1xuXHQvLyBzdGF0aWMgZGVwZW5kZW50czogSUFjdGlvbltdO1xuXHR0ZXJtaW5hdG9yOiBib29sZWFuO1xuICAgIHZhcmlhYmxlOiBhbnk7XG4gICAgY29uZGl0aW9uOiBJQ29uZGl0aW9uO1xuICAgIHN1cHBvcnRlcjogQ29tbWFuZDtcbiAgICBjb21tYW5kOiBDb21tYW5kO1xuICAgIHN0YXRlbWVudDogc3RyaW5nO1xuICAgIGlubmVyOiBzdHJpbmc7XG4gICAgdmFyaWFibGVzOiBJVmFyaWFibGVzO1xuXHQvKipcblx0ICogQG1ldGhvZFxuICAgICAqIEBtZW1iZXJvZiBJQWN0aW9uXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJldlBhc3NlZFxuXHQgKiBAcmV0dXJucyBJUGVyZm9ybVJlc3VsdCB7QGxpbmsgSVBlcmZvcm1SZXN1bHR9XG5cdCAqL1xuICAgIHZhbGlkYXRlKCk6c3RyaW5nO1xuXHRwZXJmb3JtKHByZXZQYXNzZWQ/OiBib29sZWFuKTogSVBlcmZvcm1SZXN1bHQ7XG59XG5leHBvcnQgZGVmYXVsdCBJQWN0aW9uOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb25kaXRpb25zL0lDb25kaXRpb24udHNcIiAvPlxuaW1wb3J0IHtFbHNlLCBFbmRJZn0gZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQge0lzTm90TnVsbCwgSXNOdWxsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIEVxdWFsfSBmcm9tICcuLi9Db25kaXRpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IElBY3Rpb24gZnJvbSAnLi9JQWN0aW9uJztcbmltcG9ydCBJUGVyZm9ybVJlc3VsdCBmcm9tICcuLi9JUGVyZm9ybVJlc3VsdCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIElmIGFjdGlvblxuICogQG1vZHVsZSBJZlxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7QGxpbmsgSUFjdGlvbn1cbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIENvbW1hbmQgdGhhdCBjb250YWlucyB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb24gIFxuICogQHByb3BlcnR5IHtDb21tYW5kfSBjb21tYW5kIFx0XHRcdC0gQ29tbWFuZCB0aGF0IGNvbnRhaW5zIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvbiAgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHRlcm1pbmF0b3IgXHRcdC0gRGVmaW5lcyBpZiB0aGlzIGFjdGlvbiBpcyBhIHRlcm1pbmF0b3JcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlfSB2YXJpYWJsZVx0XHQtIFZhcmlhYmxlIHRoYXQgdGhpcyBzaG91bGQgdGFrZSBhY3Rpb24gb24gZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IGNvbmRpdGlvbnNcdC0gQXJyYXkgb2YgY29uZGl0aW9ucyB0aGF0IHRoaXMgYWN0aW9uIHN1cHBvcnRzIChpZiBhbnkpXG4gKiBAcHJvcGVydHkge0lDb25kaXRpb259IGNvbmRpdGlvblx0XHQtIENvbmRpdGlvbiB0aGF0IHdhcyBmb3VuZCBhcyBhIG1hdGNoIGZvciB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtJQWN0aW9uW119IGRlcGVuZGVudHNcdFx0LSBBcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIGRlcGVuZGVudCBvbiB0aGlzIGFjdGlvbidzIHJlc3VsdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJZiBpbXBsZW1lbnRzIElBY3Rpb24ge1xuXHQvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gL15cXHMqaWZcXGIvaTtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgSWZcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtJQ29uZGl0aW9uW119IEFycmF5IG9mIGNvbmRpdGlvbnMgYXZhaWxhYmxlIHRvIHRoaXMgYWN0aW9uXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgY29uZGl0aW9ucyA9IFtJc05vdE51bGwsIElzTnVsbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBFcXVhbF07XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBBcnJheSBvZiBkZXBlbmRlbnQgYWN0aW9uc1xuICAgICAqL1xuXHRwdWJsaWMgc3RhdGljIGRlcGVuZGVudHMgPSBbRWxzZSwgRW5kSWZdO1xuXHRwdWJsaWMgdGVybWluYXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuXHRwdWJsaWMgdmFyaWFibGU6IGFueTtcblx0cHVibGljIGNvbmRpdGlvbjogSUNvbmRpdGlvbjtcbiAgICBwdWJsaWMgc3VwcG9ydGVyOiBDb21tYW5kO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgY29tbWFuZDogQ29tbWFuZCwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0dGhpcy5jb25kaXRpb24gPSB0aGlzLnBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcblx0fVxuXHQvKipcblx0ICogVHJ5IGFuZCBsb2NhdGUgYSBtYXRjaGluZyBjb25kaXRpb24gZnJvbSB0aGUgYXZhaWxhYmxlIGNvbmRpdGlvbnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgcmV0dXJuIG51bGwuXG4gICAgICogQG1lbWJlcm9mIElmXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50XHRcdC0gU3RhdGVtZW50IHRvIGNoZWNrIGNvbmRpdGlvbnMgYWdhaW5zdFxuXHQgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlc1x0LSBMaXN0IG9mIHZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgYWN0aW9uXG5cdCAqIEByZXR1cm5zIHtJQ29uZGl0aW9uIHwgbnVsbH1cdFx0LSBDb25kaXRpb24gdGhhdCBtYXRjaGVzIHdpdGhpbiB0aGUgc3RhdGVtZW50XG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VDb25kaXRpb24oc3RhdGVtZW50OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0Zm9yKHZhciBjb25kaXRpb24gb2YgSWYuY29uZGl0aW9ucyl7XG5cdFx0XHR2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goY29uZGl0aW9uLnJlZ2V4KTtcblx0XHRcdGlmKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDApIHJldHVybiBuZXcgY29uZGl0aW9uKG1hdGNoWzFdLCB2YXJpYWJsZXMsIG1hdGNoWzRdLCBtYXRjaFsyXSwgbWF0Y2hbM10pO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBmb3IgYW55IGtub3duIHN5bnRheCBlcnJvcnMgcmVnYXJkaW5nIHRoaXMgYWN0aW9uXG4gICAgICogQG1lbWJlcm9mIElmXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gVGhlIGNhdWdodCBlcnJvciBpZiBhbnlcbiAgICAgKi9cbiAgICBwdWJsaWMgdmFsaWRhdGUoKTpzdHJpbmd7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblx0LyoqXG5cdCAqIFBlcmZvcm0gdGhlIGFjdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gICAgICogQG1lbWJlcm9mIElmXG5cdCAqIEBtZXRob2Rcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHByZXZQYXNzZWRcdC0gSWYgdGhpcyBhY3Rpb24gaXMgYSBkZXBlbmRlbnQgb2YgYW5vdGhlciBhY3Rpb24sIGRpZCB0aGUgcHJldmlvdXMgYWN0aW9uIHJhbiBwYXNzIG9yIGZhaWwuXG5cdCAqIEByZXR1cm5zIHtJUGVyZm9ybVJlc3VsdH0ge0BsaW5rIElQZXJmb3JtUmVzdWx0fVxuXHQgKi9cblx0cHVibGljIHBlcmZvcm0ocHJldlBhc3NlZDogYm9vbGVhbiA9IGZhbHNlKTogSVBlcmZvcm1SZXN1bHR7XG5cdFx0cmV0dXJuIHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKVx0XG5cdFx0XHRcdD8ge3Jlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlfSBcblx0XHRcdFx0OiB7cmVzdWx0OiB0aGlzLmNvbW1hbmQudGVybWluYXRpb24oKSwgcGFzc2VkOiBmYWxzZX07XG5cdH1cbn0iLCJpbXBvcnQge0lNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb24ge1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kcyhrbGFzcyl7XG4gICAgICAgIHJldHVybiBrbGFzcy5tb2RpZmllcnMubWFwKHggPT4gYCR7eC5pZGVudGlmaWVycy5tYXAoaWQgPT4gaWQuc291cmNlKS5qb2luKCd8Jyl9YCkuam9pbignfCcpO1xuICAgIH1cbiAgICBwdWJsaWMgZXh0cmFjdE1vZGlmaWVycyhrbGFzcywgbW9kMTogc3RyaW5nLCBtb2QyOiBzdHJpbmcpOiBhbnlbXXtcbiAgICAgICAgaWYoIW1vZDEgJiYgIW1vZDIpIHJldHVybiBbXTtcbiAgICAgICAgbGV0IGFycmF5ID0gW10sIGNvdW50ID0gMDtcbiAgICAgICAgaWYobW9kMSkgY291bnQrKztcbiAgICAgICAgaWYobW9kMikgY291bnQrKztcbiAgICAgICAgZm9yKGxldCBtb2Qgb2Yga2xhc3MubW9kaWZpZXJzKXtcbiAgICAgICAgICAgIGZvcihsZXQgaWRlbnRpZmllciBvZiBtb2QuaWRlbnRpZmllcnMpe1xuICAgICAgICAgICAgICAgIGlmKG1vZDEgJiYgaWRlbnRpZmllci50ZXN0KG1vZDEpKSBhcnJheVswXSA9IG1vZDtcbiAgICAgICAgICAgICAgICBpZihtb2QyICYmIGlkZW50aWZpZXIudGVzdChtb2QyKSkge1xuICAgICAgICAgICAgICAgICAgICBhcnJheVshbW9kMSA/IDAgOiAxXSA9IG1vZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoYXJyYXkubGVuZ3RoID09PSBjb3VudCkgcmV0dXJuIGFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgcHVibGljIHBlcmZvcm1Nb2RpZmllcnMobW9kaWZpZXJzOiBJTW9kaWZpZXJbXSwgcmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFue1xuICAgICAgICBpZihtb2RpZmllcnMubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgZm9yKGk9bW9kaWZpZXJzLmxlbmd0aCAtIDE7aT4tMTstLWkpe1xuICAgICAgICAgICAgcmVzdWx0ID0gbW9kaWZpZXJzW2ldLnBlcmZvcm0ocmVzdWx0LCB2YXJpYWJsZSwgdmFyaWFibGVzLCBjb21wYXJhdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllciwgTm90LCBPckVxdWFsfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuXG4vKipcbiAqIFRoZSA9PSBjb25kaXRpb25cbiAqIEBtb2R1bGUgRXF1YWxcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcXVhbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBFcXVhbFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtOb3QsIE9yRXF1YWxdO1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzKygoPzoke0VxdWFsLm1vZHMoRXF1YWwpfXxcXFxccyopKT0oKD86JHtFcXVhbC5tb2RzKEVxdWFsKX18XFxcXHMqKSlcXFxccysoXFxcXGQrKWAsICdpJyk7XG4gICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gdGhpcy5leHRyYWN0TW9kaWZpZXJzKEVxdWFsLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEVxdWFsXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSA9PT0gdGhpcy5jb21wYXJhdGl2ZTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJ1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge0lNb2RpZmllciwgTm90LCBPckVxdWFsfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuXG4vKipcbiAqIFRoZSA+IGNvbmRpdGlvblxuICogQG1vZHVsZSBHcmVhdGVyVGhhblxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyZWF0ZXJUaGFuIGV4dGVuZHMgQ29uZGl0aW9uIGltcGxlbWVudHMgSUNvbmRpdGlvbiB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBUaGUgcmVnZXggbWF0Y2hlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW05vdCwgT3JFcXVhbF07XG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAoYChcXFxcdyspXFxcXHMrKCg/OiR7R3JlYXRlclRoYW4ubW9kcyhHcmVhdGVyVGhhbil9fFxcXFxzKikpPigoPzoke0dyZWF0ZXJUaGFuLm1vZHMoR3JlYXRlclRoYW4pfXxcXFxccyopKVxcXFxzKyhcXFxcZCspYCwgJ2knKTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKEdyZWF0ZXJUaGFuLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIEdyZWF0ZXJUaGFuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG4gICAgICAgIGxldCByZXN1bHQgPSBwYXJzZUludCh0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSkgPiBwYXJzZUludCh0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wZXJmb3JtTW9kaWZpZXJzKHRoaXMubW9kaWZpZXJzLCByZXN1bHQsIHRoaXMudmFyaWFibGUsIHRoaXMudmFyaWFibGVzLCB0aGlzLmNvbXBhcmF0aXZlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDsgXG5cdH1cbn0iLCJpbnRlcmZhY2UgSUNvbmRpdGlvbiB7XG4gICAgLy9zdGF0aWMgcmVnZXg6IFJlZ0V4cDtcbiAgICAvL3N0YXRpYyBtb2RpZmllcnM6IElNb2RpZmllcltdO1xuXHQvL3N0YXRpYyBjcmVhdGUoc3RhdGVtZW50OiBzdHJpbmcpOiBJQ29uZGl0aW9uO1xuXHRwZXJmb3JtKCk6Ym9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb247IiwiaW1wb3J0IElDb25kaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtJTW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vQ29uZGl0aW9uJztcblxuLyoqXG4gKiBUaGUgSXMgTm90IE51bGwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIElzTm90TnVsbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElzTm90TnVsbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc05vdE51bGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtb2RpZmllcnMgPSBbXTtcblx0cHVibGljIHN0YXRpYyByZWdleDogUmVnRXhwID0gLyhcXHcrKVxccytpc1xccytub3RcXHMrbnVsbFxccyovaTtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBJTW9kaWZpZXJbXSA9IFtdO1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgdmFyaWFibGU6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcywgcHVibGljIGNvbXBhcmF0aXZlOiBzdHJpbmcsIG1vZDE6IHN0cmluZywgbW9kMjogc3RyaW5nKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKElzTm90TnVsbCwgbW9kMSwgbW9kMik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc05vdE51bGxcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcblx0fVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7SU1vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL0NvbmRpdGlvbic7XG5cbi8qKlxuICogVGhlIElzIE51bGwgY29uZGl0aW9uXG4gKiBAbW9kdWxlIElzTnVsbFxuICogQGNsYXNzXG4gKiBAaW1wbGVtZW50cyB7SUNvbmRpdGlvbn1cbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZhcmlhYmxlICAgICAgLSBWYXJpYWJsZSB0byB0ZXN0IGNvbmRpdGlvbiBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIFZhcmlhYmxlcyB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29uZGl0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElzTnVsbCBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBJc051bGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG4gICAgIHB1YmxpYyBzdGF0aWMgbW9kaWZpZXJzID0gW107XG4gICAgIHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC8oXFx3KilcXHMraXNcXHMrbnVsbFxccyovaTtcbiAgICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcbiAgICAgY29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgICBzdXBlcigpO1xuICAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBzdXBlci5leHRyYWN0TW9kaWZpZXJzKElzTnVsbCwgbW9kMSwgbW9kMik7XG4gICAgIH1cbiAgICAgLyoqXG4gICAgICAqIEBtZW1iZXJvZiBJc051bGxcbiAgICAgICogQG1ldGhvZFxuICAgICAgKiBAcHVibGljXG4gICAgICAqIEByZXR1cm5zIHtib29sZWFufSBPdXRjb21lIG9mIGFwcGx5aW5nIHRoZSBjb25kaXRpb24gdG8gdGhlIHZhcmlhYmxlXG4gICAgICAqL1xuICAgICAgcHVibGljIHBlcmZvcm0oKTpib29sZWFue1xuICAgICAgICAgIHJldHVybiB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSA9PSBudWxsO1xuICAgICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uIGZyb20gJy4vSUNvbmRpdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9Db25kaXRpb24nO1xuaW1wb3J0IHtJTW9kaWZpZXIsIE5vdCwgT3JFcXVhbH0gZnJvbSAnLi4vTW9kaWZpZXJzJztcblxuLyoqXG4gKiBUaGUgPCBjb25kaXRpb25cbiAqIEBtb2R1bGUgTGVzc1RoYW5cbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lDb25kaXRpb259XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGUgICAgICAgICAtIFZhcmlhYmxlIHRvIHRlc3QgY29uZGl0aW9uIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YXJpYWJsZSAgICAgIC0gVmFyaWFibGUgdG8gdGVzdCBjb25kaXRpb24gYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGNvbmRpdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXNzVGhhbiBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIElDb25kaXRpb24ge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBMZXNzVGhhblxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJvcGVydHkge1JlZ0V4cH0gVGhlIHJlZ2V4IG1hdGNoZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vZGlmaWVycyA9IFtOb3QsIE9yRXF1YWxdO1xuXHRwdWJsaWMgc3RhdGljIHJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKGAoXFxcXHcrKVxcXFxzKygoPzoke0xlc3NUaGFuLm1vZHMoTGVzc1RoYW4pfXxcXFxccyopKTwoKD86JHtMZXNzVGhhbi5tb2RzKExlc3NUaGFuKX18XFxcXHMqKSlcXFxccysoXFxcXGQrKWAsICdpJyk7XG4gICAgcHVibGljIG1vZGlmaWVyczogSU1vZGlmaWVyW10gPSBbXTtcblx0Y29uc3RydWN0b3IocHVibGljIHZhcmlhYmxlOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIHB1YmxpYyBjb21wYXJhdGl2ZTogc3RyaW5nLCBtb2QxOiBzdHJpbmcsIG1vZDI6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gdGhpcy5leHRyYWN0TW9kaWZpZXJzKExlc3NUaGFuLCBtb2QxLCBtb2QyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIExlc3NUaGFuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gT3V0Y29tZSBvZiBhcHBseWluZyB0aGUgY29uZGl0aW9uIHRvIHRoZSB2YXJpYWJsZVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOmJvb2xlYW57XG5cdFx0bGV0IHJlc3VsdCA9IHBhcnNlSW50KHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKSA8IHBhcnNlSW50KHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICByZXN1bHQgPSB0aGlzLnBlcmZvcm1Nb2RpZmllcnModGhpcy5tb2RpZmllcnMsIHJlc3VsdCwgdGhpcy52YXJpYWJsZSwgdGhpcy52YXJpYWJsZXMsIHRoaXMuY29tcGFyYXRpdmUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXHR9XG59IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJTW9kaWZpZXIge1xuICAgIGlkZW50aWZpZXJzOiBSZWdFeHBbXTtcbiAgICBwZXJmb3JtKHJlc3VsdDpib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOmJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJTW9kaWZpZXI7IiwiaW1wb3J0IElNb2RpZmllciBmcm9tICcuL0lNb2RpZmllcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmNvbnN0IE5vdDpJTW9kaWZpZXIgPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvIS9pLCAvbm90XFxzKy9pLCAvaXNcXHMrbm90XFxzKy9pXSxcbiAgICBwZXJmb3JtOiAocmVzdWx0OiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMsIGNvbXBhcmF0aXZlOiBzdHJpbmcpOiBib29sZWFuID0+IHtyZXR1cm4gIXJlc3VsdDt9XG59XG5leHBvcnQgZGVmYXVsdCBOb3Q7IiwiaW1wb3J0IElNb2RpZmllciBmcm9tICcuL0lNb2RpZmllcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmNvbnN0IE9yRXF1YWw6IElNb2RpZmllciA9IHtcbiAgICBpZGVudGlmaWVyczogWy89L2ksIC9vclxccytlcXVhbFxccyt0b1xccysvaV0sXG4gICAgcGVyZm9ybTogKHJlc3VsdDogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCBjb21wYXJhdGl2ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgdmFyaWFibGVzW3ZhcmlhYmxlXSA9PT0gY29tcGFyYXRpdmU7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgT3JFcXVhbDsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElSZXBsYWNlciB7XG4gICAgLy9zdGF0aWMgcmVnZXg6IFJlZ0V4cDtcbiAgICAvL3N0YXRpYyByZXBsYWNlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgSVJlcGxhY2VyOyIsImltcG9ydCBJUmVwbGFjZXIgZnJvbSAnLi9JUmVwbGFjZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbi8qKlxuICogVGhlIHZhcmlhYmxlIHJlcGxhY2VyIGZvciBlbWJlZGRlZCBTUWlnZ0wgdmFyaWFibGVzXG4gKiBAbW9kdWxlIFZhcmlhYmxlUmVwbGFjZXJcbiAqIEBzdGF0aWNcbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0lSZXBsYWNlcn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFyaWFibGVSZXBsYWNlciBpbXBsZW1lbnRzIElSZXBsYWNlciB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIFZhcmlhYmxlUmVwbGFjZXJcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB9IFRoZSByZWdleCBtYXRjaGVyXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVnZXg6IFJlZ0V4cCA9IC8oW157XXxeKXt7KD8heylcXHMqKFxcdyopXFxzKn19KD8hfSkvZztcblx0LyoqXG4gICAgICogQG1lbWJlcm9mIFZhcmlhYmxlUmVwbGFjZXJcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0ICAgICAgICAgICAgIC0gVGV4dCB0byBzZWFyY2ggZm9yIHJlcGxhY2VtZW50c1xuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgICAtIFRoZSBzdHJpbmcgd2l0aCB2YXJpYWJsZXMgcmVwbGFjZWQgXG4gICAgICovXG5cdHB1YmxpYyBzdGF0aWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZ3tcblx0XHRyZXR1cm4gdGV4dC5yZXBsYWNlKHRoaXMucmVnZXgsIChtYXRjaCwgJDEsICQyKSA9PiAkMSt2YXJpYWJsZXNbJDJdKTtcblx0fVxufSJdfQ==
