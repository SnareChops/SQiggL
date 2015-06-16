(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var If_1 = require('./actions/If');
exports.If = If_1.default;

},{"./actions/If":11}],2:[function(require,module,exports){
/// <reference path="actions/IAction.ts" />
/// <reference path="IVariables.ts" />
var Actions_1 = require('./Actions');
var Replacers_1 = require('./Replacers');
var Command = (function () {
    function Command(index, statement, inner, variables) {
        this.index = index;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.actions = [Actions_1.If];
        this.replacers = [Replacers_1.VariableReplacer];
        console.log('Command statement: ' + statement);
        console.log('Command inner: ' + inner);
        this.action = this.extract(statement, inner, variables);
    }
    Command.prototype.extract = function (statement, inner, variables) {
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.regex.test(this.statement))
                return new action(statement, inner, variables);
        }
        return null;
    };
    Command.prototype.perform = function () {
        var result = this.action.perform();
        for (var _i = 0, _a = this.replacers; _i < _a.length; _i++) {
            var replacer = _a[_i];
            result = replacer.replace(result, this.variables);
        }
        return result;
    };
    Command.regex = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
    return Command;
})();
exports.default = Command;

},{"./Actions":1,"./Replacers":8}],3:[function(require,module,exports){
var IsNotNull_1 = require('./conditions/IsNotNull');
exports.IsNotNull = IsNotNull_1.default;

},{"./conditions/IsNotNull":13}],4:[function(require,module,exports){


},{}],5:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],6:[function(require,module,exports){
/// <reference path="IVariables.ts" />
var Parser_1 = require('./Parser');
function parse(sql, variables) {
    var parser = new Parser_1.default(sql, variables);
    return parser.parse();
}
exports.parse = parse;

},{"./Parser":7}],7:[function(require,module,exports){
/// <reference path="IVariables.ts" />
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
        var match, commands = [];
        while ((match = Command_1.default.regex.exec(sql)) != null) {
            commands.push(new Command_1.default(match.index, match[1], match[2], variables));
        }
        return commands;
    };
    Parser.prototype.parse = function () {
        var query = '', index = 0;
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            query += this.sql.slice(index, command.index - 1);
            query += command.perform();
        }
        return query;
    };
    return Parser;
})();
exports.default = Parser;

},{"./Command":2}],8:[function(require,module,exports){
var VariableReplacer_1 = require('./replacers/VariableReplacer');
exports.VariableReplacer = VariableReplacer_1.default;

},{"./replacers/VariableReplacer":15}],9:[function(require,module,exports){
var Main_1 = require('./Main');
window['SQiggL'] = window['SQiggL'] || {};
window['SQiggL'].parse = Main_1.parse;
window['SQiggL'].version = '0.1.0';
exports.default = Main_1.parse;

},{"./Main":6}],10:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],11:[function(require,module,exports){
/// <reference path="IAction.ts" />
/// <reference path="../conditions/ICondition.ts" />
/// <reference path="../IVariables.ts" />
var Conditions_1 = require('../Conditions');
var If = (function () {
    function If(statement, inner, variables) {
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.conditions = [Conditions_1.IsNotNull];
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
    If.prototype.perform = function () {
        return this.condition.perform() ? this.inner : '';
    };
    If.regex = /^\s*if\b/g;
    return If;
})();
exports.default = If;

},{"../Conditions":3}],12:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],15:[function(require,module,exports){
/// <reference path="IReplacer.ts" />
/// <reference path="../IVariables.ts" />
var VariableReplacer = (function () {
    function VariableReplacer() {
    }
    VariableReplacer.replace = function (text, variables) {
        return text.replace(this.regex, function (match, $1) { return variables[$1]; });
    };
    VariableReplacer.regex = /{{\s*(\w*)\s*}}/g;
    return VariableReplacer;
})();
exports.default = VariableReplacer;

},{}]},{},[1,10,11,2,3,12,13,4,5,6,7,8,14,15,9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbmRpdGlvbnMuanMiLCJzcmMvSVZhcmlhYmxlLmpzIiwic3JjL01haW4uanMiLCJzcmMvUGFyc2VyLmpzIiwic3JjL1JlcGxhY2Vycy5qcyIsInNyYy9TUWlnZ0wuanMiLCJzcmMvYWN0aW9ucy9JZi5qcyIsInNyYy9jb25kaXRpb25zL0lzTm90TnVsbC5qcyIsInNyYy9yZXBsYWNlcnMvVmFyaWFibGVSZXBsYWNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBJZl8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0lmJyk7XG5leHBvcnRzLklmID0gSWZfMS5kZWZhdWx0O1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFjdGlvbnMvSUFjdGlvbi50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi9BY3Rpb25zJyk7XG52YXIgUmVwbGFjZXJzXzEgPSByZXF1aXJlKCcuL1JlcGxhY2VycycpO1xudmFyIENvbW1hbmQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENvbW1hbmQoaW5kZXgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBbQWN0aW9uc18xLklmXTtcbiAgICAgICAgdGhpcy5yZXBsYWNlcnMgPSBbUmVwbGFjZXJzXzEuVmFyaWFibGVSZXBsYWNlcl07XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIHN0YXRlbWVudDogJyArIHN0YXRlbWVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIGlubmVyOiAnICsgaW5uZXIpO1xuICAgICAgICB0aGlzLmFjdGlvbiA9IHRoaXMuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgIH1cbiAgICBDb21tYW5kLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5hY3Rpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24ucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBhY3Rpb24oc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIENvbW1hbmQucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmFjdGlvbi5wZXJmb3JtKCk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnJlcGxhY2VyczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciByZXBsYWNlciA9IF9hW19pXTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlcGxhY2VyLnJlcGxhY2UocmVzdWx0LCB0aGlzLnZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIENvbW1hbmQucmVnZXggPSAve3slKC4qPyklfX0oLio/KSg/PSg/Ont7JXwkKSkvZztcbiAgICByZXR1cm4gQ29tbWFuZDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBDb21tYW5kO1xuIiwidmFyIElzTm90TnVsbF8xID0gcmVxdWlyZSgnLi9jb25kaXRpb25zL0lzTm90TnVsbCcpO1xuZXhwb3J0cy5Jc05vdE51bGwgPSBJc05vdE51bGxfMS5kZWZhdWx0O1xuIiwiXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgUGFyc2VyXzEgPSByZXF1aXJlKCcuL1BhcnNlcicpO1xuZnVuY3Rpb24gcGFyc2Uoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcl8xLmRlZmF1bHQoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmFyaWFibGVzLnRzXCIgLz5cbnZhciBDb21tYW5kXzEgPSByZXF1aXJlKCcuL0NvbW1hbmQnKTtcbnZhciBQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnNlcihzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuICAgICAgICBjb25zb2xlLmxvZyh2YXJpYWJsZXMpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgUGFyc2VyLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHZhciBtYXRjaCwgY29tbWFuZHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29tbWFuZHMucHVzaChuZXcgQ29tbWFuZF8xLmRlZmF1bHQobWF0Y2guaW5kZXgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgdmFyaWFibGVzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1hbmRzO1xuICAgIH07XG4gICAgUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gJycsIGluZGV4ID0gMDtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuY29tbWFuZHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IF9hW19pXTtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0gMSk7XG4gICAgICAgICAgICBxdWVyeSArPSBjb21tYW5kLnBlcmZvcm0oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcXVlcnk7XG4gICAgfTtcbiAgICByZXR1cm4gUGFyc2VyO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFBhcnNlcjtcbiIsInZhciBWYXJpYWJsZVJlcGxhY2VyXzEgPSByZXF1aXJlKCcuL3JlcGxhY2Vycy9WYXJpYWJsZVJlcGxhY2VyJyk7XG5leHBvcnRzLlZhcmlhYmxlUmVwbGFjZXIgPSBWYXJpYWJsZVJlcGxhY2VyXzEuZGVmYXVsdDtcbiIsInZhciBNYWluXzEgPSByZXF1aXJlKCcuL01haW4nKTtcbndpbmRvd1snU1FpZ2dMJ10gPSB3aW5kb3dbJ1NRaWdnTCddIHx8IHt9O1xud2luZG93WydTUWlnZ0wnXS5wYXJzZSA9IE1haW5fMS5wYXJzZTtcbndpbmRvd1snU1FpZ2dMJ10udmVyc2lvbiA9ICcwLjEuMCc7XG5leHBvcnRzLmRlZmF1bHQgPSBNYWluXzEucGFyc2U7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSUFjdGlvbi50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9JVmFyaWFibGVzLnRzXCIgLz5cbnZhciBDb25kaXRpb25zXzEgPSByZXF1aXJlKCcuLi9Db25kaXRpb25zJyk7XG52YXIgSWYgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIElmKHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb25kaXRpb25zID0gW0NvbmRpdGlvbnNfMS5Jc05vdE51bGxdO1xuICAgICAgICBjb25zb2xlLmxvZygnSWYgc3RhdGVtZW50OiAnICsgc3RhdGVtZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coJ0lmIGlubmVyOiAnICsgaW5uZXIpO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IHRoaXMucGFyc2VDb25kaXRpb24oc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbmRpdGlvbi5wZXJmb3JtKCkpO1xuICAgIH1cbiAgICBJZi5wcm90b3R5cGUucGFyc2VDb25kaXRpb24gPSBmdW5jdGlvbiAoc3RhdGVtZW50LCB2YXJpYWJsZXMpIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuY29uZGl0aW9uczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBjb25kaXRpb24gPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goY29uZGl0aW9uLnJlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY29uZGl0aW9uKG1hdGNoWzFdLCB2YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgSWYucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbi5wZXJmb3JtKCkgPyB0aGlzLmlubmVyIDogJyc7XG4gICAgfTtcbiAgICBJZi5yZWdleCA9IC9eXFxzKmlmXFxiL2c7XG4gICAgcmV0dXJuIElmO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElmO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklDb25kaXRpb24udHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0lWYXJpYWJsZXMudHNcIiAvPlxudmFyIElzTm90TnVsbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSXNOb3ROdWxsKHZhcmlhYmxlLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgY29uc29sZS5sb2coJ0lzTm90TnVsbCB2YXJpYWJsZTogJyArIHZhcmlhYmxlKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0lzTm90TnVsbCB2YXJpYWJsZSB2YWx1ZTogJyArIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdKTtcbiAgICB9XG4gICAgSXNOb3ROdWxsLnByb3RvdHlwZS5wZXJmb3JtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHJlc3VsdDogJyArIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGwpO1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcbiAgICB9O1xuICAgIElzTm90TnVsbC5yZWdleCA9IC8oXFx3KilcXHMraXNcXHMrbm90XFxzK251bGxcXHMqLztcbiAgICByZXR1cm4gSXNOb3ROdWxsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElzTm90TnVsbDtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJUmVwbGFjZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0lWYXJpYWJsZXMudHNcIiAvPlxudmFyIFZhcmlhYmxlUmVwbGFjZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhcmlhYmxlUmVwbGFjZXIoKSB7XG4gICAgfVxuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVwbGFjZSA9IGZ1bmN0aW9uICh0ZXh0LCB2YXJpYWJsZXMpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSh0aGlzLnJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gsICQxKSB7IHJldHVybiB2YXJpYWJsZXNbJDFdOyB9KTtcbiAgICB9O1xuICAgIFZhcmlhYmxlUmVwbGFjZXIucmVnZXggPSAve3tcXHMqKFxcdyopXFxzKn19L2c7XG4gICAgcmV0dXJuIFZhcmlhYmxlUmVwbGFjZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gVmFyaWFibGVSZXBsYWNlcjtcbiJdfQ==
