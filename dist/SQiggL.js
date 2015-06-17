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
        return query;
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
        return text.replace(this.regex, function (match, $1) { return variables[$1]; });
    };
    VariableReplacer.regex = /{{\s*(\w*)\s*}}/g;
    return VariableReplacer;
})();
exports.default = VariableReplacer;

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbW1hbmRTY29wZS5qcyIsInNyYy9Db25kaXRpb25zLmpzIiwic3JjL0V4dGVuc2lvbnMuanMiLCJzcmMvSVBlcmZvcm1SZXN1bHQuanMiLCJzcmMvTWFpbi5qcyIsInNyYy9QYXJzZXIuanMiLCJzcmMvUmVwbGFjZXJzLmpzIiwic3JjL1NRaWdnTC5qcyIsInNyYy9hY3Rpb25zL0Vsc2UuanMiLCJzcmMvYWN0aW9ucy9FbmRJZi5qcyIsInNyYy9hY3Rpb25zL0lmLmpzIiwic3JjL2NvbmRpdGlvbnMvSXNOb3ROdWxsLmpzIiwic3JjL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvSWYnKTtcbmV4cG9ydHMuSWYgPSBJZl8xLmRlZmF1bHQ7XG52YXIgRWxzZV8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0Vsc2UnKTtcbmV4cG9ydHMuRWxzZSA9IEVsc2VfMS5kZWZhdWx0O1xudmFyIEVuZElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvRW5kSWYnKTtcbmV4cG9ydHMuRW5kSWYgPSBFbmRJZl8xLmRlZmF1bHQ7XG4iLCJ2YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi9BY3Rpb25zJyk7XG52YXIgQ29tbWFuZFNjb3BlXzEgPSByZXF1aXJlKCcuL0NvbW1hbmRTY29wZScpO1xudmFyIFJlcGxhY2Vyc18xID0gcmVxdWlyZSgnLi9SZXBsYWNlcnMnKTtcbnZhciBDb21tYW5kID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kKGluZGV4LCBsZW5ndGgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBbQWN0aW9uc18xLklmLCBBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICAgICAgdGhpcy5yZXBsYWNlcnMgPSBbUmVwbGFjZXJzXzEuVmFyaWFibGVSZXBsYWNlcl07XG4gICAgICAgIHRoaXMuc2NvcGUgPSBuZXcgQ29tbWFuZFNjb3BlXzEuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIHN0YXRlbWVudDogJyArIHN0YXRlbWVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIGlubmVyOiAnICsgaW5uZXIpO1xuICAgICAgICB0aGlzLmFjdGlvbiA9IHRoaXMuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgIH1cbiAgICBDb21tYW5kLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5hY3Rpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24ucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBhY3Rpb24odGhpcywgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocGFzc2VkKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmFjdGlvbi5wZXJmb3JtKHBhc3NlZCk7XG4gICAgICAgIHJlc3VsdC5yZXN1bHQgKz0gdGhpcy5wZXJmb3JtRGVwZW5kZW50cyhyZXN1bHQucGFzc2VkKTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMucmVwbGFjZXJzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHJlcGxhY2VyID0gX2FbX2ldO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgICAgICAgICAgcmVzdWx0LnJlc3VsdCA9IHJlcGxhY2VyLnJlcGxhY2UocmVzdWx0LnJlc3VsdCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBDb21tYW5kLnByb3RvdHlwZS5wZXJmb3JtU2NvcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXQgPSAnJywgcHJldlBhc3NlZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5zY29wZS5jb21tYW5kczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbW1hbmQucGVyZm9ybShwcmV2UGFzc2VkKTtcbiAgICAgICAgICAgIHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgcmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm1EZXBlbmRlbnRzID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgdmFyIHJldCA9ICcnO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5kZXBlbmRlbnRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGRlcGVuZGVudCA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBkZXBlbmRlbnQucGVyZm9ybShwcmV2UGFzc2VkKTtcbiAgICAgICAgICAgIHByZXZQYXNzZWQgPSByZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgcmV0ICs9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnRlcm1pbmF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY29wZS5jb21tYW5kcy5zb21lKGZ1bmN0aW9uIChjb21tYW5kKSB7IHJldHVybiBjb21tYW5kLmFjdGlvbi50ZXJtaW5hdG9yOyB9KVxuICAgICAgICAgICAgPyB0aGlzLnNjb3BlLmNvbW1hbmRzLmZpbHRlcihmdW5jdGlvbiAoY29tbWFuZCkgeyByZXR1cm4gY29tbWFuZC5hY3Rpb24udGVybWluYXRvcjsgfSlbMV0ucGVyZm9ybShmYWxzZSkucmVzdWx0XG4gICAgICAgICAgICA6ICcnO1xuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUuZGVwZW5kZW50ID0gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5hY3Rpb24uZGVwZW5kZW50czsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBkZXBlbmRlbnQgPSBfYVtfaV07XG4gICAgICAgICAgICBpZiAoYWN0aW9uIGluc3RhbmNlb2YgZGVwZW5kZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIENvbW1hbmQucmVnZXggPSAve3slKC4qPyklfX0oLio/KSg/PSg/Ont7JXwkKSkvZztcbiAgICByZXR1cm4gQ29tbWFuZDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBDb21tYW5kO1xuIiwidmFyIENvbW1hbmRTY29wZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZFNjb3BlKCkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHt9O1xuICAgICAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuZGVwZW5kYW50cyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gQ29tbWFuZFNjb3BlO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvbW1hbmRTY29wZTtcbiIsInZhciBJc05vdE51bGxfMSA9IHJlcXVpcmUoJy4vY29uZGl0aW9ucy9Jc05vdE51bGwnKTtcbmV4cG9ydHMuSXNOb3ROdWxsID0gSXNOb3ROdWxsXzEuZGVmYXVsdDtcbiIsIkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xuIiwiXG4iLCJ2YXIgUGFyc2VyXzEgPSByZXF1aXJlKCcuL1BhcnNlcicpO1xuZnVuY3Rpb24gcGFyc2Uoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcl8xLmRlZmF1bHQoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJFeHRlbnNpb25zLnRzXCIgLz5cbnZhciBDb21tYW5kXzEgPSByZXF1aXJlKCcuL0NvbW1hbmQnKTtcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG59O1xudmFyIFBhcnNlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFyc2VyKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuc3FsID0gc3FsO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHZhcmlhYmxlcyk7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIH1cbiAgICBQYXJzZXIucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdmFyIG1hdGNoLCBjb21tYW5kcyA9IFtdLCBzdGFjayA9IFtdO1xuICAgICAgICBDb21tYW5kXzEuZGVmYXVsdC5yZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gQ29tbWFuZF8xLmRlZmF1bHQucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgZm91bmQgPSBuZXcgQ29tbWFuZF8xLmRlZmF1bHQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2subGFzdCgpLmRlcGVuZGVudChmb3VuZC5hY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGEgZGVwZW5kZW50IGNvbW1hbmQ6ICcgKyBmb3VuZC5hY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXSk7XG4gICAgICAgICAgICAgICAgc3RhY2subGFzdCgpLmRlcGVuZGVudHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdGFjay5sZW5ndGggPiAwICYmICFzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgYSBzdWIgY29tbWFuZDogJyArIGZvdW5kLmFjdGlvbi5jb25zdHJ1Y3RvclsnbmFtZSddKTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGZvdW5kKTtcbiAgICAgICAgICAgICAgICBzdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMCAmJiBzdGFjay5sYXN0KCkuYWN0aW9uLnRlcm1pbmF0b3IpXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmNvbW1hbmRzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSBfYVtfaV07XG4gICAgICAgICAgICBxdWVyeSArPSB0aGlzLnNxbC5zbGljZShpbmRleCwgY29tbWFuZC5pbmRleCAtIDEpO1xuICAgICAgICAgICAgcXVlcnkgKz0gY29tbWFuZC5wZXJmb3JtKGZhbHNlKS5yZXN1bHQ7XG4gICAgICAgICAgICBpbmRleCArPSBjb21tYW5kLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcXVlcnk7XG4gICAgfTtcbiAgICByZXR1cm4gUGFyc2VyO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFBhcnNlcjtcbiIsInZhciBWYXJpYWJsZVJlcGxhY2VyXzEgPSByZXF1aXJlKCcuL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyJyk7XG5leHBvcnRzLlZhcmlhYmxlUmVwbGFjZXIgPSBWYXJpYWJsZVJlcGxhY2VyXzEuZGVmYXVsdDtcbiIsInZhciBNYWluXzEgPSByZXF1aXJlKCcuL01haW4nKTtcbndpbmRvd1snU1FpZ2dMJ10gPSB3aW5kb3dbJ1NRaWdnTCddIHx8IHt9O1xud2luZG93WydTUWlnZ0wnXS5wYXJzZSA9IE1haW5fMS5wYXJzZTtcbndpbmRvd1snU1FpZ2dMJ10udmVyc2lvbiA9ICcwLjEuMCc7XG5leHBvcnRzLmRlZmF1bHQgPSBNYWluXzEucGFyc2U7XG4iLCJ2YXIgRWxzZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRWxzZShjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMudGVybWluYXRvciA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlcGVuZGVudHMgPSBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vsc2Ugc3RhdGVtZW50OiAnICsgc3RhdGVtZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vsc2UgaW5uZXI6ICcgKyBpbm5lcik7XG4gICAgfVxuICAgIEVsc2UucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAocHJldlBhc3NlZCkge1xuICAgICAgICBpZiAocHJldlBhc3NlZCA9PT0gdm9pZCAwKSB7IHByZXZQYXNzZWQgPSBmYWxzZTsgfVxuICAgICAgICByZXR1cm4gIXByZXZQYXNzZWQgPyB7IHJlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlIH0gOiB7IHJlc3VsdDogJycsIHBhc3NlZDogZmFsc2UgfTtcbiAgICB9O1xuICAgIEVsc2UucmVnZXggPSAvXlxccyplbHNlXFxiLztcbiAgICByZXR1cm4gRWxzZTtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBFbHNlO1xuIiwidmFyIEVuZElmID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbmRJZihjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMudGVybWluYXRvciA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVwZW5kZW50cyA9IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnRW5kSWYgc3RhdGVtZW50OiAnICsgc3RhdGVtZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coJ0VuZElmIGlubmVyOiAnICsgaW5uZXIpO1xuICAgIH1cbiAgICBFbmRJZi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uIChwcmV2UGFzc2VkKSB7XG4gICAgICAgIGlmIChwcmV2UGFzc2VkID09PSB2b2lkIDApIHsgcHJldlBhc3NlZCA9IGZhbHNlOyB9XG4gICAgICAgIHJldHVybiB7IHJlc3VsdDogdGhpcy5pbm5lciwgcGFzc2VkOiB0cnVlIH07XG4gICAgfTtcbiAgICBFbmRJZi5yZWdleCA9IC9eXFxzKmVuZGlmXFxiLztcbiAgICByZXR1cm4gRW5kSWY7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRW5kSWY7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbnZhciBBY3Rpb25zXzEgPSByZXF1aXJlKCcuLi9BY3Rpb25zJyk7XG52YXIgQ29uZGl0aW9uc18xID0gcmVxdWlyZSgnLi4vQ29uZGl0aW9ucycpO1xudmFyIElmID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJZihjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMudGVybWluYXRvciA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbnMgPSBbQ29uZGl0aW9uc18xLklzTm90TnVsbF07XG4gICAgICAgIHRoaXMuZGVwZW5kZW50cyA9IFtBY3Rpb25zXzEuRWxzZSwgQWN0aW9uc18xLkVuZElmXTtcbiAgICAgICAgY29uc29sZS5sb2coJ0lmIHN0YXRlbWVudDogJyArIHN0YXRlbWVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJZiBpbm5lcjogJyArIGlubmVyKTtcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSB0aGlzLnBhcnNlQ29uZGl0aW9uKHN0YXRlbWVudCwgdmFyaWFibGVzKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb25kaXRpb24ucGVyZm9ybSgpKTtcbiAgICB9XG4gICAgSWYucHJvdG90eXBlLnBhcnNlQ29uZGl0aW9uID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgdmFyaWFibGVzKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmNvbmRpdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29uZGl0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKGNvbmRpdGlvbi5yZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNvbmRpdGlvbihtYXRjaFsxXSwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIElmLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKHByZXZQYXNzZWQpIHtcbiAgICAgICAgaWYgKHByZXZQYXNzZWQgPT09IHZvaWQgMCkgeyBwcmV2UGFzc2VkID0gZmFsc2U7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uLnBlcmZvcm0oKVxuICAgICAgICAgICAgPyB7IHJlc3VsdDogdGhpcy5pbm5lciArIHRoaXMuY29tbWFuZC5wZXJmb3JtU2NvcGUoKSwgcGFzc2VkOiB0cnVlIH1cbiAgICAgICAgICAgIDogeyByZXN1bHQ6IHRoaXMuY29tbWFuZC50ZXJtaW5hdGlvbigpLCBwYXNzZWQ6IGZhbHNlIH07XG4gICAgfTtcbiAgICBJZi5yZWdleCA9IC9eXFxzKmlmXFxiLztcbiAgICByZXR1cm4gSWY7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSWY7XG4iLCJ2YXIgSXNOb3ROdWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJc05vdE51bGwodmFyaWFibGUsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdmFyaWFibGU7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHZhcmlhYmxlOiAnICsgdmFyaWFibGUpO1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHZhcmlhYmxlIHZhbHVlOiAnICsgdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0pO1xuICAgIH1cbiAgICBJc05vdE51bGwucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJc05vdE51bGwgcmVzdWx0OiAnICsgdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbCk7XG4gICAgICAgIHJldHVybiB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSAhPSBudWxsO1xuICAgIH07XG4gICAgSXNOb3ROdWxsLnJlZ2V4ID0gLyhcXHcqKVxccytpc1xccytub3RcXHMrbnVsbFxccyovO1xuICAgIHJldHVybiBJc05vdE51bGw7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSXNOb3ROdWxsO1xuIiwidmFyIFZhcmlhYmxlUmVwbGFjZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhcmlhYmxlUmVwbGFjZXIoKSB7XG4gICAgfVxuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVwbGFjZSA9IGZ1bmN0aW9uICh0ZXh0LCB2YXJpYWJsZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2codmFyaWFibGVzKTtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gsICQxKSB7IHJldHVybiB2YXJpYWJsZXNbJDFdOyB9KTtcbiAgICB9O1xuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVnZXggPSAve3tcXHMqKFxcdyopXFxzKn19L2c7XG4gICAgcmV0dXJuIFZhcmlhYmxlUmVwbGFjZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gVmFyaWFibGVSZXBsYWNlcjtcbiJdfQ==
