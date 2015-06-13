(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var If_1 = require('./actions/If');
exports.If = If_1.default;

},{"./actions/If":8}],2:[function(require,module,exports){
/// <reference path="actions/IAction.ts" />
var Actions_1 = require('./Actions');
var Command = (function () {
    function Command(statement, inner) {
        this.statement = statement;
        this.inner = inner;
        this.parse();
    }
    Command.prototype.parse = function () {
        if (Actions_1.If.regex.test(this.statement))
            this.action = new Actions_1.If(this.statement, this.inner);
    };
    Command.regex = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
    return Command;
})();
exports.default = Command;

},{"./Actions":1}],3:[function(require,module,exports){
var IsNotNull_1 = require('./conditions/IsNotNull');
exports.IsNotNull = IsNotNull_1.default;

},{"./conditions/IsNotNull":10}],4:[function(require,module,exports){


},{}],5:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/// <reference path="IVariable.ts" />
__export(require('./Actions'));
__export(require('./Conditions'));
var Command_1 = require('./Command');
exports.variables = [];
function parse(sql, variables) {
    variables = variables;
    console.log(extractCommands(sql));
}
exports.parse = parse;
function extractCommands(sql) {
    var match, commands = [];
    while ((match = Command_1.default.regex.exec(sql)) != null) {
        commands.push(new Command_1.default(match[1], match[2]));
    }
    return commands;
}
exports.extractCommands = extractCommands;

},{"./Actions":1,"./Command":2,"./Conditions":3}],6:[function(require,module,exports){
var Main_1 = require('./Main');
window['SQiggL'] = window['SQiggL'] || {};
window['SQiggL'].parse = Main_1.parse;

},{"./Main":5}],7:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],8:[function(require,module,exports){
/// <reference path="IAction.ts" />
/// <reference path="../conditions/ICondition.ts" />
var Conditions_1 = require('../Conditions');
var If = (function () {
    function If(statement, inner) {
        this.statement = statement;
        this.inner = inner;
        this.conditions = [Conditions_1.IsNotNull];
        this.condition = this.parseCondition(statement);
        console.log(this.condition.result());
    }
    If.prototype.parseCondition = function (statement) {
        for (var i = 0; i < this.conditions.length; i++) {
            var x = this.conditions[i].create(statement);
            if (x)
                return x;
        }
    };
    If.prototype.perform = function () {
        return '';
    };
    If.regex = /^\s*if\b/g;
    return If;
})();
exports.default = If;

},{"../Conditions":3}],9:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],10:[function(require,module,exports){
/// <reference path="ICondition.ts" />
var Main_1 = require('../Main');
var IsNotNull = (function () {
    function IsNotNull(variable) {
        this.variable = variable;
    }
    IsNotNull.create = function (statement) {
        var result = statement.match(IsNotNull.regex);
        if (!result)
            return null;
        return new IsNotNull(result[1]);
    };
    IsNotNull.prototype.result = function () {
        console.log(Main_1.variables);
        return Main_1.variables[this.variable] != null;
    };
    IsNotNull.regex = /is\s+not\s+null\s*$/;
    return IsNotNull;
})();
exports.default = IsNotNull;

},{"../Main":5}]},{},[1,7,8,2,3,9,10,4,5,6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy5qcyIsInNyYy9Db21tYW5kLmpzIiwic3JjL0NvbmRpdGlvbnMuanMiLCJzcmMvSVZhcmlhYmxlLmpzIiwic3JjL01haW4uanMiLCJzcmMvU1FpZ2dMLmpzIiwic3JjL2FjdGlvbnMvSWYuanMiLCJzcmMvY29uZGl0aW9ucy9Jc05vdE51bGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIElmXzEgPSByZXF1aXJlKCcuL2FjdGlvbnMvSWYnKTtcbmV4cG9ydHMuSWYgPSBJZl8xLmRlZmF1bHQ7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiYWN0aW9ucy9JQWN0aW9uLnRzXCIgLz5cbnZhciBBY3Rpb25zXzEgPSByZXF1aXJlKCcuL0FjdGlvbnMnKTtcbnZhciBDb21tYW5kID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb21tYW5kKHN0YXRlbWVudCwgaW5uZXIpIHtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy5wYXJzZSgpO1xuICAgIH1cbiAgICBDb21tYW5kLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKEFjdGlvbnNfMS5JZi5yZWdleC50ZXN0KHRoaXMuc3RhdGVtZW50KSlcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uID0gbmV3IEFjdGlvbnNfMS5JZih0aGlzLnN0YXRlbWVudCwgdGhpcy5pbm5lcik7XG4gICAgfTtcbiAgICBDb21tYW5kLnJlZ2V4ID0gL3t7JSguKj8pJX19KC4qPykoPz0oPzp7eyV8JCkpL2c7XG4gICAgcmV0dXJuIENvbW1hbmQ7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gQ29tbWFuZDtcbiIsInZhciBJc05vdE51bGxfMSA9IHJlcXVpcmUoJy4vY29uZGl0aW9ucy9Jc05vdE51bGwnKTtcbmV4cG9ydHMuSXNOb3ROdWxsID0gSXNOb3ROdWxsXzEuZGVmYXVsdDtcbiIsIlxuIiwiZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmFyaWFibGUudHNcIiAvPlxuX19leHBvcnQocmVxdWlyZSgnLi9BY3Rpb25zJykpO1xuX19leHBvcnQocmVxdWlyZSgnLi9Db25kaXRpb25zJykpO1xudmFyIENvbW1hbmRfMSA9IHJlcXVpcmUoJy4vQ29tbWFuZCcpO1xuZXhwb3J0cy52YXJpYWJsZXMgPSBbXTtcbmZ1bmN0aW9uIHBhcnNlKHNxbCwgdmFyaWFibGVzKSB7XG4gICAgdmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIGNvbnNvbGUubG9nKGV4dHJhY3RDb21tYW5kcyhzcWwpKTtcbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmZ1bmN0aW9uIGV4dHJhY3RDb21tYW5kcyhzcWwpIHtcbiAgICB2YXIgbWF0Y2gsIGNvbW1hbmRzID0gW107XG4gICAgd2hpbGUgKChtYXRjaCA9IENvbW1hbmRfMS5kZWZhdWx0LnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKG5ldyBDb21tYW5kXzEuZGVmYXVsdChtYXRjaFsxXSwgbWF0Y2hbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbW1hbmRzO1xufVxuZXhwb3J0cy5leHRyYWN0Q29tbWFuZHMgPSBleHRyYWN0Q29tbWFuZHM7XG4iLCJ2YXIgTWFpbl8xID0gcmVxdWlyZSgnLi9NYWluJyk7XG53aW5kb3dbJ1NRaWdnTCddID0gd2luZG93WydTUWlnZ0wnXSB8fCB7fTtcbndpbmRvd1snU1FpZ2dMJ10ucGFyc2UgPSBNYWluXzEucGFyc2U7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSUFjdGlvbi50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29uZGl0aW9ucy9JQ29uZGl0aW9uLnRzXCIgLz5cbnZhciBDb25kaXRpb25zXzEgPSByZXF1aXJlKCcuLi9Db25kaXRpb25zJyk7XG52YXIgSWYgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIElmKHN0YXRlbWVudCwgaW5uZXIpIHtcbiAgICAgICAgdGhpcy5zdGF0ZW1lbnQgPSBzdGF0ZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lcjtcbiAgICAgICAgdGhpcy5jb25kaXRpb25zID0gW0NvbmRpdGlvbnNfMS5Jc05vdE51bGxdO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IHRoaXMucGFyc2VDb25kaXRpb24oc3RhdGVtZW50KTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb25kaXRpb24ucmVzdWx0KCkpO1xuICAgIH1cbiAgICBJZi5wcm90b3R5cGUucGFyc2VDb25kaXRpb24gPSBmdW5jdGlvbiAoc3RhdGVtZW50KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb25kaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMuY29uZGl0aW9uc1tpXS5jcmVhdGUoc3RhdGVtZW50KTtcbiAgICAgICAgICAgIGlmICh4KVxuICAgICAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBJZi5wcm90b3R5cGUucGVyZm9ybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH07XG4gICAgSWYucmVnZXggPSAvXlxccyppZlxcYi9nO1xuICAgIHJldHVybiBJZjtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBJZjtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJQ29uZGl0aW9uLnRzXCIgLz5cbnZhciBNYWluXzEgPSByZXF1aXJlKCcuLi9NYWluJyk7XG52YXIgSXNOb3ROdWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJc05vdE51bGwodmFyaWFibGUpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IHZhcmlhYmxlO1xuICAgIH1cbiAgICBJc05vdE51bGwuY3JlYXRlID0gZnVuY3Rpb24gKHN0YXRlbWVudCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gc3RhdGVtZW50Lm1hdGNoKElzTm90TnVsbC5yZWdleCk7XG4gICAgICAgIGlmICghcmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBuZXcgSXNOb3ROdWxsKHJlc3VsdFsxXSk7XG4gICAgfTtcbiAgICBJc05vdE51bGwucHJvdG90eXBlLnJlc3VsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coTWFpbl8xLnZhcmlhYmxlcyk7XG4gICAgICAgIHJldHVybiBNYWluXzEudmFyaWFibGVzW3RoaXMudmFyaWFibGVdICE9IG51bGw7XG4gICAgfTtcbiAgICBJc05vdE51bGwucmVnZXggPSAvaXNcXHMrbm90XFxzK251bGxcXHMqJC87XG4gICAgcmV0dXJuIElzTm90TnVsbDtcbn0pKCk7XG5leHBvcnRzLmRlZmF1bHQgPSBJc05vdE51bGw7XG4iXX0=
