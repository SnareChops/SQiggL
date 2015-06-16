(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var If_1 = require('./actions/If');
exports.If = If_1.default;
var Else_1 = require('./actions/Else');
exports.Else = Else_1.default;
var EndIf_1 = require('./actions/EndIf');
exports.EndIf = EndIf_1.default;

},{"./actions/Else":13,"./actions/EndIf":14,"./actions/If":16}],2:[function(require,module,exports){
/// <reference path="IVariables.ts" />
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

},{"./Actions":1,"./CommandScope":3,"./Replacers":11}],3:[function(require,module,exports){
/// <reference path="IVariables.ts" />
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
Array.prototype.last = function () {
    return this[this.length - 1];
};

},{}],6:[function(require,module,exports){


},{}],7:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],8:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],9:[function(require,module,exports){
/// <reference path="IVariables.ts" />
var Parser_1 = require('./Parser');
function parse(sql, variables) {
    var parser = new Parser_1.default(sql, variables);
    return parser.parse();
}
exports.parse = parse;

},{"./Parser":10}],10:[function(require,module,exports){
/// <reference path="IVariables.ts" />
/// <reference path="Extensions.ts" />
var Command_1 = require('./Command');
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
        return query;
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],16:[function(require,module,exports){
/// <reference path="../conditions/ICondition.ts" />
/// <reference path="../IVariables.ts" />
var Actions_1 = require('../Actions');
var Conditions_1 = require('../Conditions');
var If = (function () {
    function If(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = false;
        this.conditions = [Conditions_1.IsNotNull];
        this.dependents = [Actions_1.Else, Actions_1.EndIf];
        console.log('If statement: ' + statement);
        console.log('If inner: ' + inner);
        this.condition = this.parseCondition(statement, variables);
        console.log(this.condition.perform());
    }
    If.prototype.parseCondition = function (statement, variables) {
        for (var _i = 0, _a = this.conditions; _i < _a.length; _i++) {
            var condition = _a[_i];
            var match = statement.match(condition.regex);
            if (match.length > 0)
                return new condition(match[1], variables);
        }
        return null;
    };
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

},{"../Actions":1,"../Conditions":4}],17:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],18:[function(require,module,exports){
/// <reference path="ICondition.ts" />
/// <reference path="../IVariables.ts" />
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

},{}],19:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],20:[function(require,module,exports){
/// <reference path="IReplacer.ts" />
/// <reference path="../IVariables.ts" />
var VariableReplacer = (function () {
    function VariableReplacer() {
    }
    VariableReplacer.replace = function (text, variables) {
        console.log(variables);
        return text.replace(this.regex, function (match, $1) { return variables[$1]; });
    };
    VariableReplacer.regex = /{{\s*(\w*)\s*}}/g;
    return VariableReplacer;
})();
exports.default = VariableReplacer;

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0V4dGVuc2lvbnMuanMiLCJzcmMvSVBlcmZvcm1SZXN1bHQuanMiLCJzcmMvTWFpbi5qcyIsInNyYy9QYXJzZXIuanMiLCJzcmMvUmVwbGFjZXJzLmpzIiwic3JjL1NRaWdnTC5qcyIsInNyYy9hY3Rpb25zL0Vsc2UuanMiLCJzcmMvYWN0aW9ucy9FbmRJZi5qcyIsInNyYy9hY3Rpb25zL0lmLmpzIiwic3JjL2NvbmRpdGlvbnMvSXNOb3ROdWxsLmpzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOzs7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvSWYnKTtcbmV4cG9ydHMuSWYgPSBJZl8xLmRlZmF1bHQ7XG52YXIgRWxzZV8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0Vsc2UnKTtcbmV4cG9ydHMuRWxzZSA9IEVsc2VfMS5kZWZhdWx0O1xudmFyIEVuZElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvRW5kSWYnKTtcbmV4cG9ydHMuRW5kSWYgPSBFbmRJZl8xLmRlZmF1bHQ7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi9BY3Rpb25zJyk7XG52YXIgQ29tbWFuZFNjb3BlXzEgPSByZXF1aXJlKCcuL0NvbW1hbmRTY29wZScpO1xudmFyIFJlcGxhY2Vyc18xID0gcmVxdWlyZSgnLi9SZXBsYWNlcnMnKTtcbnZhciBDb21tYW5kID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kKGluZGV4LCBsZW5ndGgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBbQWN0aW9uc18xLklmLCBBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICAgICAgdGhpcy5yZXBsYWNlcnMgPSBbUmVwbGFjZXJzXzEuVmFyaWFibGVSZXBsYWNlcl07XG4gICAgICAgIHRoaXMuc2NvcGUgPSBuZXcgQ29tbWFuZFNjb3BlXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIHN0YXRlbWVudDogJyArIHN0YXRlbWVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIGlubmVyOiAnICsgaW5uZXIpO1xuICAgICAgICB0aGlzLmFjdGlvbiA9IHRoaXMuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgIH1cbiAgICBDb21tYW5kLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5hY3Rpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24ucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBhY3Rpb24odGhpcywgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocGFzc2VkKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmFjdGlvbi5wZXJmb3JtKHBhc3NlZCk7XG4gICAgICAgIHJlc3VsdC5yZXN1bHQgKz0gdGhpcy5wZXJmb3JtRGVwZW5kZW50cyhyZXN1bHQucGFzc2VkKTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMucmVwbGFjZXJzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHJlcGxhY2VyID0gX2FbX2ldO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgICAgICAgICAgcmVzdWx0LnJlc3VsdCA9IHJlcGxhY2VyLnJlcGxhY2UocmVzdWx0LnJlc3VsdCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtU2NvcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXQgPSAnJywgcHJldlBhc3NlZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5zY29wZS5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbW1hbmQucGVyZm9ybShwcmV2UGFzc2VkKTtcbiAgICAgICAgICAgIHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgcmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm1EZXBlbmRlbnRzID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgdmFyIHJldCA9ICcnO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5kZXBlbmRlbnRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGRlcGVuZGVudCA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBkZXBlbmRlbnQucGVyZm9ybShwcmV2UGFzc2VkKTtcbiAgICAgICAgICAgIHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgcmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnRlcm1pbmF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY29wZS5jb21tYW5kcy5zb21lKGZ1bmN0aW9uIChjb21tYW5kKSB7IHJldHVybiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yOyB9KVxuICAgICAgICAgICAgPyB0aGlzLnNjb3BlLmNvbW1hbmRzLmZpbHRlcihmdW5jdGlvbiAoY29tbWFuZCkgeyByZXR1cm4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcjsgfSlbMV0ucGVyZm9ybShmYWxzZSkucmVzdWx0XG4gICAgICAgICAgICA6ICcnO1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUuZGVwZW5kZW50ID0gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5hY3Rpb24uZGVwZW5kZW50czsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBkZXBlbmRlbnQgPSBfYVtfaV07XG4gICAgICAgICAgICBpZiAoYWN0aW9uIGluc3RhbmNlb2YgZGVwZW5kZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIENvbW1hbmQucmVnZXggPSAve3slKC4qPyklfX0oLio/KSg/PSg/Ont7JXwkKSkvZztcbiAgICByZXR1cm4gQ29tbWFuZDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBDb21tYW5kO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklWYXJpYWJsZXMudHNcIiAvPlxudmFyIENvbW1hbmRTY29wZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZFNjb3BlKCkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHt9O1xuICAgICAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuZGVwZW5kYW50cyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gQ29tbWFuZFNjb3BlO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvbW1hbmRTY29wZTtcbiIsInZhciBJc05vdE51bGxfMSA9IHJlcXVpcmUoJy4vY29uZGl0aW9ucy9Jc05vdE51bGwnKTtcbmV4cG9ydHMuSXNOb3ROdWxsID0gSXNOb3ROdWxsXzEuZGVmYXVsdDtcbiIsIkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xuIiwiXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgUGFyc2VyXzEgPSByZXF1aXJlKCcuL1BhcnNlcicpO1xuZnVuY3Rpb24gcGFyc2Uoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcl8xLmRlZmF1bHQoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmFyaWFibGVzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJFeHRlbnNpb25zLnRzXCIgLz5cbnZhciBDb21tYW5kXzEgPSByZXF1aXJlKCcuL0NvbW1hbmQnKTtcbnZhciBQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnNlcihzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuICAgICAgICBjb25zb2xlLmxvZyh2YXJpYWJsZXMpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgUGFyc2VyLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHZhciBtYXRjaCwgY29tbWFuZHMgPSBbXSwgc3RhY2sgPSBbXTtcbiAgICAgICAgQ29tbWFuZF8xLmRlZmF1bHQucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGZvdW5kID0gbmV3IENvbW1hbmRfMS5kZWZhdWx0KG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgdmFyaWFibGVzKTtcbiAgICAgICAgICAgIGlmIChzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnQoZm91bmQuYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBhIGRlcGVuZGVudCBjb21tYW5kOiAnICsgZm91bmQuYWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ10pO1xuICAgICAgICAgICAgICAgIHN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiAhc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGEgc3ViIGNvbW1hbmQ6ICcgKyBmb3VuZC5hY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXSk7XG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChmb3VuZCk7XG4gICAgICAgICAgICAgICAgc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmFjdGlvbi50ZXJtaW5hdG9yKVxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgICAgICBjb21tYW5kcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgcXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLSAxKTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShmYWxzZSkucmVzdWx0O1xuICAgICAgICAgICAgaW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgIH07XG4gICAgcmV0dXJuIFBhcnNlcjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBQYXJzZXI7XG4iLCJ2YXIgVmFyaWFibGVSZXBsYWNlcl8xID0gcmVxdWlyZSgnLi9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlcicpO1xuZXhwb3J0cy5WYXJpYWJsZVJlcGxhY2VyID0gVmFyaWFibGVSZXBsYWNlcl8xLmRlZmF1bHQ7XG4iLCJ2YXIgTWFpbl8xID0gcmVxdWlyZSgnLi9NYWluJyk7XG53aW5kb3dbJ1NRaWdnTCddID0gd2luZG93WydTUWlnZ0wnXSB8fCB7fTtcbndpbmRvd1snU1FpZ2dMJ10ucGFyc2UgPSBNYWluXzEucGFyc2U7XG53aW5kb3dbJ1NRaWdnTCddLnZlcnNpb24gPSAnMC4xLjAnO1xuZXhwb3J0cy5kZWZhdWx0ID0gTWFpbl8xLnBhcnNlO1xuIiwidmFyIEVsc2UgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVsc2UoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzID0gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdFbHNlIHN0YXRlbWVudDogJyArIHN0YXRlbWVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFbHNlIGlubmVyOiAnICsgaW5uZXIpO1xuICAgIH1cbiAgICBFbHNlLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuICFwcmV2UGFzc2VkID8geyByZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZSB9IDogeyByZXN1bHQ6ICcnLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICBFbHNlLnJlZ2V4ID0gL15cXHMqZWxzZVxcYi87XG4gICAgcmV0dXJuIEVsc2U7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRWxzZTtcbiIsInZhciBFbmRJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5kSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ0VuZElmIHN0YXRlbWVudDogJyArIHN0YXRlbWVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFbmRJZiBpbm5lcjogJyArIGlubmVyKTtcbiAgICB9XG4gICAgRW5kSWYucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICBpZiAocHJldlBhc3NlZCA9PT0gdm9pZCAwKSB7IHByZXZQYXNzZWQgPSBmYWxzZTsgfVxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHRoaXMuaW5uZXIsIHBhc3NlZDogdHJ1ZSB9O1xuICAgIH07XG4gICAgRW5kSWYucmVnZXggPSAvXlxccyplbmRpZlxcYi87XG4gICAgcmV0dXJuIEVuZElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVuZElmO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbmRpdGlvbnMvSUNvbmRpdGlvbi50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi4vQWN0aW9ucycpO1xudmFyIENvbmRpdGlvbnNfMSA9IHJlcXVpcmUoJy4uL0NvbmRpdGlvbnMnKTtcbnZhciBJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSWYoY29tbWFuZCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLnRlcm1pbmF0b3IgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb25kaXRpb25zID0gW0NvbmRpdGlvbnNfMS5Jc05vdE51bGxdO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbQWN0aW9uc18xLkVsc2UsIEFjdGlvbnNfMS5FbmRJZl07XG4gICAgICAgIGNvbnNvbGUubG9nKCdJZiBzdGF0ZW1lbnQ6ICcgKyBzdGF0ZW1lbnQpO1xuICAgICAgICBjb25zb2xlLmxvZygnSWYgaW5uZXI6ICcgKyBpbm5lcik7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uID0gdGhpcy5wYXJzZUNvbmRpdGlvbihzdGF0ZW1lbnQsIHZhcmlhYmxlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKSk7XG4gICAgfVxuICAgIElmLnByb3RvdHlwZS5wYXJzZUNvbmRpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb25kaXRpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGNvbmRpdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IHN0YXRlbWVudC5tYXRjaChjb25kaXRpb24ucmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjb25kaXRpb24obWF0Y2hbMV0sIHZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICBJZi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIGlmIChwcmV2UGFzc2VkID09PSB2b2lkIDApIHsgcHJldlBhc3NlZCA9IGZhbHNlOyB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbi5wZXJmb3JtKClcbiAgICAgICAgICAgID8geyByZXN1bHQ6IHRoaXMuaW5uZXIgKyB0aGlzLmNvbW1hbmQucGVyZm9ybVNjb3BlKCksIHBhc3NlZDogdHJ1ZSB9XG4gICAgICAgICAgICA6IHsgcmVzdWx0OiB0aGlzLmNvbW1hbmQudGVybWluYXRpb24oKSwgcGFzc2VkOiBmYWxzZSB9O1xuICAgIH07XG4gICAgSWYucmVnZXggPSAvXlxccyppZlxcYi87XG4gICAgcmV0dXJuIElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElmO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklDb25kaXRpb24udHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0lWYXJpYWJsZXMudHNcIiAvPlxudmFyIElzTm90TnVsbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSXNOb3ROdWxsKHZhcmlhYmxlLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgY29uc29sZS5sb2coJ0lzTm90TnVsbCB2YXJpYWJsZTogJyArIHZhcmlhYmxlKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0lzTm90TnVsbCB2YXJpYWJsZSB2YWx1ZTogJyArIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKTtcbiAgICB9XG4gICAgSXNOb3ROdWxsLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHJlc3VsdDogJyArIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGwpO1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcbiAgICB9O1xuICAgIElzTm90TnVsbC5yZWdleCA9IC8oXFx3KilcXHMraXNcXHMrbm90XFxzK251bGxcXHMqLztcbiAgICByZXR1cm4gSXNOb3ROdWxsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElzTm90TnVsbDtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJUmVwbGFjZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0lWYXJpYWJsZXMudHNcIiAvPlxudmFyIFZhcmlhYmxlUmVwbGFjZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhcmlhYmxlUmVwbGFjZXIoKSB7XG4gICAgfVxuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVwbGFjZSA9IGZ1bmN0aW9uICh0ZXh0LCB2YXJpYWJsZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2codmFyaWFibGVzKTtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gsICQxKSB7IHJldHVybiB2YXJpYWJsZXNbJDFdOyB9KTtcbiAgICB9O1xuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVnZXggPSAve3tcXHMqKFxcdyopXFxzKn19L2c7XG4gICAgcmV0dXJuIFZhcmlhYmxlUmVwbGFjZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gVmFyaWFibGVSZXBsYWNlcjtcbiJdfQ==
