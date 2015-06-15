(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var If_1 = require('./actions/If');
exports.If = If_1.default;

},{"./actions/If":10}],2:[function(require,module,exports){
/// <reference path="actions/IAction.ts" />
/// <reference path="IVariables.ts" />
var Actions_1 = require('./Actions');
var Command = (function () {
    function Command(statement, inner, variables) {
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        console.log('Command statement: ' + statement);
        console.log('Command inner: ' + inner);
        this.extract(statement, inner, variables);
    }
    Command.prototype.extract = function (statement, inner, variables) {
        if (Actions_1.If.regex.test(this.statement))
            this.action = new Actions_1.If(statement, inner, variables);
    };
    Command.regex = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
    return Command;
})();
exports.default = Command;

},{"./Actions":1}],3:[function(require,module,exports){
var IsNotNull_1 = require('./conditions/IsNotNull');
exports.IsNotNull = IsNotNull_1.default;

},{"./conditions/IsNotNull":12}],4:[function(require,module,exports){


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
            commands.push(new Command_1.default(match[1], match[2], variables));
        }
        return commands;
    };
    Parser.prototype.parse = function () {
        return '';
    };
    return Parser;
})();
exports.default = Parser;

},{"./Command":2}],8:[function(require,module,exports){
var Main_1 = require('./Main');
window['SQiggL'] = window['SQiggL'] || {};
window['SQiggL'].parse = Main_1.parse;
window['SQiggL'].version = '0.1.0';
exports.default = Main_1.parse;

},{"./Main":6}],9:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],10:[function(require,module,exports){
/// <reference path="IAction.ts" />
/// <reference path="../conditions/ICondition.ts" />
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
        console.log(this.condition.result());
    }
    If.prototype.parseCondition = function (statement, variables) {
        for (var i = 0; i < this.conditions.length; i++) {
            var match = statement.match(this.conditions[i].regex);
            if (match.length > 0)
                return new this.conditions[i](match[1], variables);
        }
    };
    If.prototype.perform = function () {
        return '';
    };
    If.regex = /^\s*if\b/g;
    return If;
})();
exports.default = If;

},{"../Conditions":3}],11:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],12:[function(require,module,exports){
/// <reference path="ICondition.ts" />
var IsNotNull = (function () {
    function IsNotNull(variable, variables) {
        this.variable = variable;
        this.variables = variables;
        console.log('IsNotNull variable: ' + variable);
        console.log('IsNotNull variable value: ' + this.variables[this.variable]);
    }
    IsNotNull.prototype.result = function () {
        console.log('IsNotNull result: ' + this.variables[this.variable] != null);
        return this.variables[this.variable] != null;
    };
    IsNotNull.regex = /(\w*)\s+is\s+not\s+null\s*/;
    return IsNotNull;
})();
exports.default = IsNotNull;

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbmRpdGlvbnMuanMiLCJzcmMvSVZhcmlhYmxlLmpzIiwic3JjL01haW4uanMiLCJzcmMvUGFyc2VyLmpzIiwic3JjL1NRaWdnTC5qcyIsInNyYy9hY3Rpb25zL0lmLmpzIiwic3JjL2NvbmRpdGlvbnMvSXNOb3ROdWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBJZl8xID0gcmVxdWlyZSgnLi9hY3Rpb25zL0lmJyk7XG5leHBvcnRzLklmID0gSWZfMS5kZWZhdWx0O1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFjdGlvbnMvSUFjdGlvbi50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgQWN0aW9uc18xID0gcmVxdWlyZSgnLi9BY3Rpb25zJyk7XG52YXIgQ29tbWFuZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIHN0YXRlbWVudDogJyArIHN0YXRlbWVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21tYW5kIGlubmVyOiAnICsgaW5uZXIpO1xuICAgICAgICB0aGlzLmV4dHJhY3Qoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICB9XG4gICAgQ29tbWFuZC5wcm90b3R5cGUuZXh0cmFjdCA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgaWYgKEFjdGlvbnNfMS5JZi5yZWdleC50ZXN0KHRoaXMuc3RhdGVtZW50KSlcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uID0gbmV3IEFjdGlvbnNfMS5JZihzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuICAgIH07XG4gICAgQ29tbWFuZC5yZWdleCA9IC97eyUoLio/KSV9fSguKj8pKD89KD86e3slfCQpKS9nO1xuICAgIHJldHVybiBDb21tYW5kO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IENvbW1hbmQ7XG4iLCJ2YXIgSXNOb3ROdWxsXzEgPSByZXF1aXJlKCcuL2NvbmRpdGlvbnMvSXNOb3ROdWxsJyk7XG5leHBvcnRzLklzTm90TnVsbCA9IElzTm90TnVsbF8xLmRlZmF1bHQ7XG4iLCJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmFyaWFibGVzLnRzXCIgLz5cbnZhciBQYXJzZXJfMSA9IHJlcXVpcmUoJy4vUGFyc2VyJyk7XG5mdW5jdGlvbiBwYXJzZShzcWwsIHZhcmlhYmxlcykge1xuICAgIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyXzEuZGVmYXVsdChzcWwsIHZhcmlhYmxlcyk7XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZSgpO1xufVxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklWYXJpYWJsZXMudHNcIiAvPlxudmFyIENvbW1hbmRfMSA9IHJlcXVpcmUoJy4vQ29tbWFuZCcpO1xudmFyIFBhcnNlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFyc2VyKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuc3FsID0gc3FsO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHZhcmlhYmxlcyk7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIH1cbiAgICBQYXJzZXIucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICAgICAgdmFyIG1hdGNoLCBjb21tYW5kcyA9IFtdO1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gQ29tbWFuZF8xLmRlZmF1bHQucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb21tYW5kcy5wdXNoKG5ldyBDb21tYW5kXzEuZGVmYXVsdChtYXRjaFsxXSwgbWF0Y2hbMl0sIHZhcmlhYmxlcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9O1xuICAgIFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9O1xuICAgIHJldHVybiBQYXJzZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gUGFyc2VyO1xuIiwidmFyIE1haW5fMSA9IHJlcXVpcmUoJy4vTWFpbicpO1xud2luZG93WydTUWlnZ0wnXSA9IHdpbmRvd1snU1FpZ2dMJ10gfHwge307XG53aW5kb3dbJ1NRaWdnTCddLnBhcnNlID0gTWFpbl8xLnBhcnNlO1xud2luZG93WydTUWlnZ0wnXS52ZXJzaW9uID0gJzAuMS4wJztcbmV4cG9ydHMuZGVmYXVsdCA9IE1haW5fMS5wYXJzZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJQWN0aW9uLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb25kaXRpb25zL0lDb25kaXRpb24udHNcIiAvPlxudmFyIENvbmRpdGlvbnNfMSA9IHJlcXVpcmUoJy4uL0NvbmRpdGlvbnMnKTtcbnZhciBJZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSWYoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbnMgPSBbQ29uZGl0aW9uc18xLklzTm90TnVsbF07XG4gICAgICAgIGNvbnNvbGUubG9nKCdJZiBzdGF0ZW1lbnQ6ICcgKyBzdGF0ZW1lbnQpO1xuICAgICAgICBjb25zb2xlLmxvZygnSWYgaW5uZXI6ICcgKyBpbm5lcik7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uID0gdGhpcy5wYXJzZUNvbmRpdGlvbihzdGF0ZW1lbnQsIHZhcmlhYmxlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29uZGl0aW9uLnJlc3VsdCgpKTtcbiAgICB9XG4gICAgSWYucHJvdG90eXBlLnBhcnNlQ29uZGl0aW9uID0gZnVuY3Rpb24gKHN0YXRlbWVudCwgdmFyaWFibGVzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb25kaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2godGhpcy5jb25kaXRpb25zW2ldLnJlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcy5jb25kaXRpb25zW2ldKG1hdGNoWzFdLCB2YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBJZi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH07XG4gICAgSWYucmVnZXggPSAvXlxccyppZlxcYi9nO1xuICAgIHJldHVybiBJZjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBJZjtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJQ29uZGl0aW9uLnRzXCIgLz5cbnZhciBJc05vdE51bGwgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIElzTm90TnVsbCh2YXJpYWJsZSwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGUgPSB2YXJpYWJsZTtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJc05vdE51bGwgdmFyaWFibGU6ICcgKyB2YXJpYWJsZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJc05vdE51bGwgdmFyaWFibGUgdmFsdWU6ICcgKyB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSk7XG4gICAgfVxuICAgIElzTm90TnVsbC5wcm90b3R5cGUucmVzdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHJlc3VsdDogJyArIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGwpO1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0gIT0gbnVsbDtcbiAgICB9O1xuICAgIElzTm90TnVsbC5yZWdleCA9IC8oXFx3KilcXHMraXNcXHMrbm90XFxzK251bGxcXHMqLztcbiAgICByZXR1cm4gSXNOb3ROdWxsO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IElzTm90TnVsbDtcbiJdfQ==
