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
/// <reference path="../IVariables.ts" />
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

},{}]},{},[1,9,10,2,3,11,12,4,5,6,7,8])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbmRpdGlvbnMuanMiLCJzcmMvSVZhcmlhYmxlLmpzIiwic3JjL01haW4uanMiLCJzcmMvUGFyc2VyLmpzIiwic3JjL1NRaWdnTC5qcyIsInNyYy9hY3Rpb25zL0lmLmpzIiwic3JjL2NvbmRpdGlvbnMvSXNOb3ROdWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSWZfMSA9IHJlcXVpcmUoJy4vYWN0aW9ucy9JZicpO1xuZXhwb3J0cy5JZiA9IElmXzEuZGVmYXVsdDtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhY3Rpb25zL0lBY3Rpb24udHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklWYXJpYWJsZXMudHNcIiAvPlxudmFyIEFjdGlvbnNfMSA9IHJlcXVpcmUoJy4vQWN0aW9ucycpO1xudmFyIENvbW1hbmQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENvbW1hbmQoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICBjb25zb2xlLmxvZygnQ29tbWFuZCBzdGF0ZW1lbnQ6ICcgKyBzdGF0ZW1lbnQpO1xuICAgICAgICBjb25zb2xlLmxvZygnQ29tbWFuZCBpbm5lcjogJyArIGlubmVyKTtcbiAgICAgICAgdGhpcy5leHRyYWN0KHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4gICAgfVxuICAgIENvbW1hbmQucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSB7XG4gICAgICAgIGlmIChBY3Rpb25zXzEuSWYucmVnZXgudGVzdCh0aGlzLnN0YXRlbWVudCkpXG4gICAgICAgICAgICB0aGlzLmFjdGlvbiA9IG5ldyBBY3Rpb25zXzEuSWYoc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKTtcbiAgICB9O1xuICAgIENvbW1hbmQucmVnZXggPSAve3slKC4qPyklfX0oLio/KSg/PSg/Ont7JXwkKSkvZztcbiAgICByZXR1cm4gQ29tbWFuZDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBDb21tYW5kO1xuIiwidmFyIElzTm90TnVsbF8xID0gcmVxdWlyZSgnLi9jb25kaXRpb25zL0lzTm90TnVsbCcpO1xuZXhwb3J0cy5Jc05vdE51bGwgPSBJc05vdE51bGxfMS5kZWZhdWx0O1xuIiwiXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgUGFyc2VyXzEgPSByZXF1aXJlKCcuL1BhcnNlcicpO1xuZnVuY3Rpb24gcGFyc2Uoc3FsLCB2YXJpYWJsZXMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcl8xLmRlZmF1bHQoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UoKTtcbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmFyaWFibGVzLnRzXCIgLz5cbnZhciBDb21tYW5kXzEgPSByZXF1aXJlKCcuL0NvbW1hbmQnKTtcbnZhciBQYXJzZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnNlcihzcWwsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuICAgICAgICBjb25zb2xlLmxvZyh2YXJpYWJsZXMpO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICB9XG4gICAgUGFyc2VyLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24gKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgICAgIHZhciBtYXRjaCwgY29tbWFuZHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29tbWFuZHMucHVzaChuZXcgQ29tbWFuZF8xLmRlZmF1bHQobWF0Y2hbMV0sIG1hdGNoWzJdLCB2YXJpYWJsZXMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfTtcbiAgICBQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfTtcbiAgICByZXR1cm4gUGFyc2VyO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFBhcnNlcjtcbiIsInZhciBNYWluXzEgPSByZXF1aXJlKCcuL01haW4nKTtcbndpbmRvd1snU1FpZ2dMJ10gPSB3aW5kb3dbJ1NRaWdnTCddIHx8IHt9O1xud2luZG93WydTUWlnZ0wnXS5wYXJzZSA9IE1haW5fMS5wYXJzZTtcbndpbmRvd1snU1FpZ2dMJ10udmVyc2lvbiA9ICcwLjEuMCc7XG5leHBvcnRzLmRlZmF1bHQgPSBNYWluXzEucGFyc2U7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSUFjdGlvbi50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9JVmFyaWFibGVzLnRzXCIgLz5cbnZhciBDb25kaXRpb25zXzEgPSByZXF1aXJlKCcuLi9Db25kaXRpb25zJyk7XG52YXIgSWYgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIElmKHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9IHN0YXRlbWVudDtcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb25kaXRpb25zID0gW0NvbmRpdGlvbnNfMS5Jc05vdE51bGxdO1xuICAgICAgICBjb25zb2xlLmxvZygnSWYgc3RhdGVtZW50OiAnICsgc3RhdGVtZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coJ0lmIGlubmVyOiAnICsgaW5uZXIpO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IHRoaXMucGFyc2VDb25kaXRpb24oc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbmRpdGlvbi5yZXN1bHQoKSk7XG4gICAgfVxuICAgIElmLnByb3RvdHlwZS5wYXJzZUNvbmRpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIHZhcmlhYmxlcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29uZGl0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKHRoaXMuY29uZGl0aW9uc1tpXS5yZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMuY29uZGl0aW9uc1tpXShtYXRjaFsxXSwgdmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSWYucHJvdG90eXBlLnBlcmZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9O1xuICAgIElmLnJlZ2V4ID0gL15cXHMqaWZcXGIvZztcbiAgICByZXR1cm4gSWY7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gSWY7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSUNvbmRpdGlvbi50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vSVZhcmlhYmxlcy50c1wiIC8+XG52YXIgSXNOb3ROdWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJc05vdE51bGwodmFyaWFibGUsIHZhcmlhYmxlcykge1xuICAgICAgICB0aGlzLnZhcmlhYmxlID0gdmFyaWFibGU7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHZhcmlhYmxlOiAnICsgdmFyaWFibGUpO1xuICAgICAgICBjb25zb2xlLmxvZygnSXNOb3ROdWxsIHZhcmlhYmxlIHZhbHVlOiAnICsgdGhpcy52YXJpYWJsZXNbdGhpcy52YXJpYWJsZV0pO1xuICAgIH1cbiAgICBJc05vdE51bGwucHJvdG90eXBlLnJlc3VsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0lzTm90TnVsbCByZXN1bHQ6ICcgKyB0aGlzLnZhcmlhYmxlc1t0aGlzLnZhcmlhYmxlXSAhPSBudWxsKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGw7XG4gICAgfTtcbiAgICBJc05vdE51bGwucmVnZXggPSAvKFxcdyopXFxzK2lzXFxzK25vdFxccytudWxsXFxzKi87XG4gICAgcmV0dXJuIElzTm90TnVsbDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBJc05vdE51bGw7XG4iXX0=
