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
        console.log('Command statement: ' + statement);
        console.log('Command inner: ' + inner);
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
            console.log(this.scope.variables);
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
        console.log(variables);
        this.variables = variables;
    }
    Parser.prototype.extract = function (sql, variables) {
        var match, commands = [], stack = [];
        Command_1.default.regex.lastIndex = 0;
        while ((match = Command_1.default.regex.exec(sql)) != null) {
            var found = new Command_1.default(match.index, match.input.length, match[1], match[2], variables);
            if (stack.length > 0 && stack.last().dependent(found.action)) {
                console.log('Creating a dependent command: ' + found.action.constructor['name']);
                stack.last().dependents.push(found);
            }
            else if (stack.length > 0 && !stack.last().action.terminator) {
                console.log('Creating a sub command: ' + found.action.constructor['name']);
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
        console.log('Else statement: ' + statement);
        console.log('Else inner: ' + inner);
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
        console.log('EndIf statement: ' + statement);
        console.log('EndIf inner: ' + inner);
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
        console.log('IsNotNull variable: ' + variable);
        console.log('IsNotNull variable value: ' + this.variables[this.variable]);
    }
    IsNotNull.prototype.perform = function () {
        console.log('IsNotNull result: ' + this.variables[this.variable] != null);
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
        console.log(variables);
        console.log(text.replace(this.regex, function (match, $1, $2) {
            console.log($1);
            console.log($2);
            return $1 + variables[$2];
        }));
        return text.replace(this.regex, function (match, $1, $2) { return $1 + variables[$2]; });
    };
    VariableReplacer.regex = /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g;
    return VariableReplacer;
})();
exports.default = VariableReplacer;

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0V4dGVuc2lvbnMuanMiLCJzcmMvSVBlcmZvcm1SZXN1bHQuanMiLCJzcmMvTWFpbi5qcyIsInNyYy9QYXJzZXIuanMiLCJzcmMvUmVwbGFjZXJzLmpzIiwic3JjL1NRaWdnTC5qcyIsInNyYy9hY3Rpb25zL0Vsc2UuanMiLCJzcmMvYWN0aW9ucy9FbmRJZi5qcyIsInNyYy9hY3Rpb25zL0lmLmpzIiwic3JjL2NvbmRpdGlvbnMvSXNOb3ROdWxsLmpzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBJZl8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0lmJyk7XG5leHBvcnRzLklmID0gSWZfMS5kZWZhdWx0O1xudmFyIEVsc2VfMSA9IHJlcXVpcmUoJy4vYWN0aW9ucy9FbHNlJyk7XG5leHBvcnRzLkVsc2UgPSBFbHNlXzEuZGVmYXVsdDtcbnZhciBFbmRJZl8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0VuZElmJyk7XG5leHBvcnRzLkVuZElmID0gRW5kSWZfMS5kZWZhdWx0O1xuIiwidmFyIEFjdGlvbnNfMSA9IHJlcXVpcmUoJy4vQWN0aW9ucycpO1xudmFyIENvbW1hbmRTY29wZV8xID0gcmVxdWlyZSgnLi9Db21tYW5kU2NvcGUnKTtcbnZhciBSZXBsYWNlcnNfMSA9IHJlcXVpcmUoJy4vUmVwbGFjZXJzJyk7XG52YXIgQ29tbWFuZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZChpbmRleCwgbGVuZ3RoLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy5hY3Rpb25zID0gW0FjdGlvbnNfMS5JZiwgQWN0aW9uc18xLkVsc2UsIEFjdGlvbnNfMS5FbmRJZl07XG4gICAgICAgIHRoaXMucmVwbGFjZXJzID0gW1JlcGxhY2Vyc18xLlZhcmlhYmxlUmVwbGFjZXJdO1xuICAgICAgICB0aGlzLnNjb3BlID0gbmV3IENvbW1hbmRTY29wZV8xLmRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzID0gW107XG4gICAgICAgIHRoaXMuc2NvcGUudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICBjb25zb2xlLmxvZygnQ29tbWFuZCBzdGF0ZW1lbnQ6ICcgKyBzdGF0ZW1lbnQpO1xuICAgICAgICBjb25zb2xlLmxvZygnQ29tbWFuZCBpbm5lcjogJyArIGlubmVyKTtcbiAgICAgICAgdGhpcy5hY3Rpb24gPSB0aGlzLmV4dHJhY3Qoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICB9XG4gICAgQ29tbWFuZC5wcm90b3R5cGUuZXh0cmFjdCA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuYWN0aW9uczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfYVtfaV07XG4gICAgICAgICAgICBpZiAoYWN0aW9uLnJlZ2V4LnRlc3QodGhpcy5zdGF0ZW1lbnQpKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYWN0aW9uKHRoaXMsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHBhc3NlZCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5hY3Rpb24ucGVyZm9ybShwYXNzZWQpO1xuICAgICAgICByZXN1bHQucmVzdWx0ICs9IHRoaXMucGVyZm9ybURlcGVuZGVudHMocmVzdWx0LnBhc3NlZCk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnJlcGxhY2VyczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciByZXBsYWNlciA9IF9hW19pXTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICAgICAgICAgIHJlc3VsdC5yZXN1bHQgPSByZXBsYWNlci5yZXBsYWNlKHJlc3VsdC5yZXN1bHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucGVyZm9ybVNjb3BlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmV0ID0gJycsIHByZXZQYXNzZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuc2NvcGUuY29tbWFuZHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBjb21tYW5kLnBlcmZvcm0ocHJldlBhc3NlZCk7XG4gICAgICAgICAgICBwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcbiAgICAgICAgICAgIHJldCArPSByZXN1bHQucmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtRGVwZW5kZW50cyA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIHZhciByZXQgPSAnJztcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuZGVwZW5kZW50czsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBkZXBlbmRlbnQgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZGVwZW5kZW50LnBlcmZvcm0ocHJldlBhc3NlZCk7XG4gICAgICAgICAgICBwcmV2UGFzc2VkID0gcmVzdWx0LnBhc3NlZDtcbiAgICAgICAgICAgIHJldCArPSByZXN1bHQucmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS50ZXJtaW5hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGUuY29tbWFuZHMuc29tZShmdW5jdGlvbiAoY29tbWFuZCkgeyByZXR1cm4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcjsgfSlcbiAgICAgICAgICAgID8gdGhpcy5zY29wZS5jb21tYW5kcy5maWx0ZXIoZnVuY3Rpb24gKGNvbW1hbmQpIHsgcmV0dXJuIGNvbW1hbmQuYWN0aW9uLnRlcm1pbmF0b3I7IH0pWzFdLnBlcmZvcm0oZmFsc2UpLnJlc3VsdFxuICAgICAgICAgICAgOiAnJztcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLmRlcGVuZGVudCA9IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuYWN0aW9uLmRlcGVuZGVudHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVwZW5kZW50ID0gX2FbX2ldO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiBpbnN0YW5jZW9mIGRlcGVuZGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBDb21tYW5kLnJlZ2V4ID0gL3t7JSguKj8pJX19KC4qPykoPz0oPzp7eyV8JCkpL2c7XG4gICAgcmV0dXJuIENvbW1hbmQ7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29tbWFuZDtcbiIsInZhciBDb21tYW5kU2NvcGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENvbW1hbmRTY29wZSgpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB7fTtcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IFtdO1xuICAgICAgICB0aGlzLmRlcGVuZGFudHMgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIENvbW1hbmRTY29wZTtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBDb21tYW5kU2NvcGU7XG4iLCJ2YXIgSXNOb3ROdWxsXzEgPSByZXF1aXJlKCcuL2NvbmRpdGlvbnMvSXNOb3ROdWxsJyk7XG5leHBvcnRzLklzTm90TnVsbCA9IElzTm90TnVsbF8xLmRlZmF1bHQ7XG4iLCJBcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xufTtcbiIsIlxuIiwidmFyIFBhcnNlcl8xID0gcmVxdWlyZSgnLi9QYXJzZXInKTtcbmZ1bmN0aW9uIHBhcnNlKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXJfMS5kZWZhdWx0KHNxbCwgdmFyaWFibGVzKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlKCk7XG59XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRXh0ZW5zaW9ucy50c1wiIC8+XG52YXIgQ29tbWFuZF8xID0gcmVxdWlyZSgnLi9Db21tYW5kJyk7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xufTtcbnZhciBQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnNlcihzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuICAgICAgICBjb25zb2xlLmxvZyh2YXJpYWJsZXMpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgUGFyc2VyLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHZhciBtYXRjaCwgY29tbWFuZHMgPSBbXSwgc3RhY2sgPSBbXTtcbiAgICAgICAgQ29tbWFuZF8xLmRlZmF1bHQucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGZvdW5kID0gbmV3IENvbW1hbmRfMS5kZWZhdWx0KG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgdmFyaWFibGVzKTtcbiAgICAgICAgICAgIGlmIChzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnQoZm91bmQuYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBhIGRlcGVuZGVudCBjb21tYW5kOiAnICsgZm91bmQuYWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ10pO1xuICAgICAgICAgICAgICAgIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiAhc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGEgc3ViIGNvbW1hbmQ6ICcgKyBmb3VuZC5hY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXSk7XG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChmb3VuZCk7XG4gICAgICAgICAgICAgICAgc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKVxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgICAgICBjb21tYW5kcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgcXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLSAxKTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuICAgICAgICAgICAgaW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXJ5OyAvL1RPRE9cbiAgICB9O1xuICAgIHJldHVybiBQYXJzZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gUGFyc2VyO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXJfMSA9IHJlcXVpcmUoJy4vcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXInKTtcbmV4cG9ydHMuVmFyaWFibGVSZXBsYWNlciA9IFZhcmlhYmxlUmVwbGFjZXJfMS5kZWZhdWx0O1xuIiwidmFyIE1haW5fMSA9IHJlcXVpcmUoJy4vTWFpbicpO1xud2luZG93WydTUWlnZ0wnXSA9IHdpbmRvd1snU1FpZ2dMJ10gfHwge307XG53aW5kb3dbJ1NRaWdnTCddLnBhcnNlID0gTWFpbl8xLnBhcnNlO1xud2luZG93WydTUWlnZ0wnXS52ZXJzaW9uID0gJzAuMS4wJztcbmV4cG9ydHMuZGVmYXVsdCA9IE1haW5fMS5wYXJzZTtcbiIsInZhciBFbHNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbHNlKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVwZW5kZW50cyA9IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnRWxzZSBzdGF0ZW1lbnQ6ICcgKyBzdGF0ZW1lbnQpO1xuICAgICAgICBjb25zb2xlLmxvZygnRWxzZSBpbm5lcjogJyArIGlubmVyKTtcbiAgICB9XG4gICAgRWxzZS5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIGlmIChwcmV2UGFzc2VkID09PSB2b2lkIDApIHsgcHJldlBhc3NlZCA9IGZhbHNlOyB9XG4gICAgICAgIHJldHVybiAhcHJldlBhc3NlZCA/IHsgcmVzdWx0OiB0aGlzLmlubmVyICsgdGhpcy5jb21tYW5kLnBlcmZvcm1TY29wZSgpLCBwYXNzZWQ6IHRydWUgfSA6IHsgcmVzdWx0OiAnJywgcGFzc2VkOiBmYWxzZSB9O1xuICAgIH07XG4gICAgRWxzZS5yZWdleCA9IC9eXFxzKmVsc2VcXGIvO1xuICAgIHJldHVybiBFbHNlO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVsc2U7XG4iLCJ2YXIgRW5kSWYgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVuZElmKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy50ZXJtaW5hdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzID0gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdFbmRJZiBzdGF0ZW1lbnQ6ICcgKyBzdGF0ZW1lbnQpO1xuICAgICAgICBjb25zb2xlLmxvZygnRW5kSWYgaW5uZXI6ICcgKyBpbm5lcik7XG4gICAgfVxuICAgIEVuZElmLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0OiB0aGlzLmlubmVyLCBwYXNzZWQ6IHRydWUgfTtcbiAgICB9O1xuICAgIEVuZElmLnJlZ2V4ID0gL15cXHMqZW5kaWZcXGIvO1xuICAgIHJldHVybiBFbmRJZjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBFbmRJZjtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb25kaXRpb25zL0lDb25kaXRpb24udHNcIiAvPlxudmFyIEFjdGlvbnNfMSA9IHJlcXVpcmUoJy4uL0FjdGlvbnMnKTtcbnZhciBDb25kaXRpb25zXzEgPSByZXF1aXJlKCcuLi9Db25kaXRpb25zJyk7XG4vKipcbiAqIFRoZSBJZiBhY3Rpb25cbiAqIEBjbGFzc1xuICogQGltcGxlbWVudHMge0BsaW5rIElBY3Rpb259XG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgXHRcdFx0LSBQYXJlbnQgY29tbWFuZCBvZiB0aGlzIGFjdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCBcdFx0XHQtIFN0YXRlbWVudCB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5uZXIgXHRcdFx0XHQtIFRleHQgdGhhdCBmb2xsb3dzIGFmdGVyIHRoaXMgYWN0aW9uIHVudGlsIHRoZSBuZXh0IGNvbW1hbmRcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHRcdC0gVmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZH0gY29tbWFuZCBcdFx0XHQtIFBhcmVudCBjb21tYW5kIG9mIHRoaXMgYWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdGVtZW50XHRcdFx0LSBTdGF0ZW1lbnQgdGhhdCB0aGlzIHNob3VsZCB0YWtlIGFjdGlvbiBvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlubmVyIFx0XHRcdC0gVGV4dCB0aGF0IGZvbGxvd3MgYWZ0ZXIgdGhpcyBhY3Rpb24gdW50aWwgdGhlIG5leHQgY29tbWFuZFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXNcdFx0LSBWYXJpYWJsZXMgd2l0aGluIHRoZSBzY29wZSBvZiB0aGlzIGFjdGlvblxuICogQHByb3BlcnR5IHtib29sZWFufSB0ZXJtaW5hdG9yIFx0XHQtIERlZmluZXMgaWYgdGhpcyBhY3Rpb24gaXMgYSB0ZXJtaW5hdG9yXG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZX0gdmFyaWFibGVcdFx0LSBWYXJpYWJsZSB0aGF0IHRoaXMgc2hvdWxkIHRha2UgYWN0aW9uIG9uIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb25cbiAqIEBwcm9wZXJ0eSB7SUNvbmRpdGlvbltdfSBjb25kaXRpb25zXHQtIEFycmF5IG9mIGNvbmRpdGlvbnMgdGhhdCB0aGlzIGFjdGlvbiBzdXBwb3J0cyAoaWYgYW55KVxuICogQHByb3BlcnR5IHtJQ29uZGl0aW9ufSBjb25kaXRpb25cdFx0LSBDb25kaXRpb24gdGhhdCB3YXMgZm91bmQgYXMgYSBtYXRjaCBmb3IgdGhpcyBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7SUFjdGlvbltdfSBkZXBlbmRlbnRzXHRcdC0gQXJyYXkgb2YgYWN0aW9ucyB0aGF0IGFyZSBkZXBlbmRlbnQgb24gdGhpcyBhY3Rpb24ncyByZXN1bHRcbiAqL1xudmFyIElmID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJZihjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMudGVybWluYXRvciA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbnMgPSBbQ29uZGl0aW9uc18xLklzTm90TnVsbF07XG4gICAgICAgIHRoaXMuZGVwZW5kZW50cyA9IFtBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSB0aGlzLnBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJ5IGFuZCBsb2NhdGUgYSBtYXRjaGluZyBjb25kaXRpb24gZnJvbSB0aGUgYXZhaWxhYmxlIGNvbmRpdGlvbnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgcmV0dXJuIG51bGwuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50XHRcdC0gU3RhdGVtZW50IHRvIGNoZWNrIGNvbmRpdGlvbnMgYWdhaW5zdFxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzXHQtIExpc3Qgb2YgdmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhpcyBhY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7SUNvbmRpdGlvbiB8IG51bGx9XHRcdC0gQ29uZGl0aW9uIHRoYXQgbWF0Y2hlcyB3aXRoaW4gdGhlIHN0YXRlbWVudFxuICAgICAqL1xuICAgIElmLnByb3RvdHlwZS5wYXJzZUNvbmRpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb25kaXRpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGNvbmRpdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChjb25kaXRpb24ucmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjb25kaXRpb24obWF0Y2hbMV0sIHZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBhY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcmV2UGFzc2VkXHQtIElmIHRoaXMgYWN0aW9uIGlzIGEgZGVwZW5kZW50IG9mIGFub3RoZXIgYWN0aW9uLCBkaWQgdGhlIHByZXZpb3VzIGFjdGlvbiByYW4gcGFzcyBvciBmYWlsLlxuICAgICAqIEByZXR1cm5zIHtAbGluayBJUGVyZm9ybVJlc3VsdH1cbiAgICAgKi9cbiAgICBJZi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIGlmIChwcmV2UGFzc2VkID09PSB2b2lkIDApIHsgcHJldlBhc3NlZCA9IGZhbHNlOyB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbi5wZXJmb3JtKClcbiAgICAgICAgICAgID8geyByZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZSB9XG4gICAgICAgICAgICA6IHsgcmVzdWx0OiB0aGlzLmNvbW1hbmQudGVybWluYXRpb24oKSwgcGFzc2VkOiBmYWxzZSB9O1xuICAgIH07XG4gICAgSWYucmVnZXggPSAvXlxccyppZlxcYi87XG4gICAgcmV0dXJuIElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElmO1xuIiwidmFyIElzTm90TnVsbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSXNOb3ROdWxsKHZhcmlhYmxlLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgY29uc29sZS5sb2coJ0lzTm90TnVsbCB2YXJpYWJsZTogJyArIHZhcmlhYmxlKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0lzTm90TnVsbCB2YXJpYWJsZSB2YWx1ZTogJyArIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKTtcbiAgICB9XG4gICAgSXNOb3ROdWxsLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHJlc3VsdDogJyArIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGwpO1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcbiAgICB9O1xuICAgIElzTm90TnVsbC5yZWdleCA9IC8oXFx3KilcXHMraXNcXHMrbm90XFxzK251bGxcXHMqLztcbiAgICByZXR1cm4gSXNOb3ROdWxsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElzTm90TnVsbDtcbiIsInZhciBWYXJpYWJsZVJlcGxhY2VyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBWYXJpYWJsZVJlcGxhY2VyKCkge1xuICAgIH1cbiAgICBWYXJpYWJsZVJlcGxhY2VyLnJlcGxhY2UgPSBmdW5jdGlvbiAodGV4dCwgdmFyaWFibGVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHZhcmlhYmxlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gsICQxLCAkMikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJDEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJDIpO1xuICAgICAgICAgICAgcmV0dXJuICQxICsgdmFyaWFibGVzWyQyXTtcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHRoaXMucmVnZXgsIGZ1bmN0aW9uIChtYXRjaCwgJDEsICQyKSB7IHJldHVybiAkMSArIHZhcmlhYmxlc1skMl07IH0pO1xuICAgIH07XG4gICAgVmFyaWFibGVSZXBsYWNlci5yZWdleCA9IC8oW157XXxeKXt7KD8heylcXHMqKFxcdyopXFxzKn19KD8hfSkvZztcbiAgICByZXR1cm4gVmFyaWFibGVSZXBsYWNlcjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBWYXJpYWJsZVJlcGxhY2VyO1xuIl19
