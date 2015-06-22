(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var Module = angular.module('sqiggl', ['ngMaterial', 'ui.router']);
exports.default = Module;

},{}],2:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var app_module_1 = require('./app.module');
var Router = (function () {
    function Router($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
            url: '/',
            templateUrl: 'www/home.html',
            controller: 'HomeController',
            controllerAs: 'home'
        });
    }
    return Router;
})();
app_module_1.default.config(Router);

},{"./app.module":1}],3:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var app_module_1 = require('./app.module');
Array.prototype['remove'] = function (item) {
    this.splice(this.indexOf(item), 1);
};
var HomeController = (function () {
    function HomeController() {
        var _this = this;
        this.input = "UPDATE Names {{% if example is not null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
        this.output = 'Enter your query to the left and press Execute';
        this.variables = [{ key: "example", value: "dragon" }];
        this.errors = [];
        //Patch console.error to show errors to screen as well.
        var originalConsoleError = console.error;
        console.error = function (error, array) {
            _this.errors.push(error);
            originalConsoleError.call(console, error, array);
        };
    }
    HomeController.prototype.parse = function () {
        this.errors = [];
        var variables = {};
        for (var _i = 0, _a = this.variables; _i < _a.length; _i++) {
            var variable = _a[_i];
            variables[variable.key] = variable.value;
        }
        this.output = SQiggL.parse(this.input, variables);
    };
    HomeController.prototype.addVariable = function () {
        this.variables.push({ key: null, value: null });
    };
    HomeController.prototype.deleteVariable = function (variable) {
        this.variables['remove'](variable);
    };
    return HomeController;
})();
app_module_1.default.controller('HomeController', [HomeController]);

},{"./app.module":1}]},{},[1,2,3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwLm1vZHVsZS5qcyIsInd3dy9hcHAucm91dGVzLmpzIiwid3d3L2hvbWUuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdzcWlnZ2wnLCBbJ25nTWF0ZXJpYWwnLCAndWkucm91dGVyJ10pO1xuZXhwb3J0cy5kZWZhdWx0ID0gTW9kdWxlO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xudmFyIFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUm91dGVyKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gUm91dGVyO1xufSkoKTtcbmFwcF9tb2R1bGVfMS5kZWZhdWx0LmNvbmZpZyhSb3V0ZXIpO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xuQXJyYXkucHJvdG90eXBlWydyZW1vdmUnXSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdGhpcy5zcGxpY2UodGhpcy5pbmRleE9mKGl0ZW0pLCAxKTtcbn07XG52YXIgSG9tZUNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmlucHV0ID0gXCJVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgaXMgbm90IG51bGwgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdcIjtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSAnRW50ZXIgeW91ciBxdWVyeSB0byB0aGUgbGVmdCBhbmQgcHJlc3MgRXhlY3V0ZSc7XG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gW3sga2V5OiBcImV4YW1wbGVcIiwgdmFsdWU6IFwiZHJhZ29uXCIgfV07XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIC8vUGF0Y2ggY29uc29sZS5lcnJvciB0byBzaG93IGVycm9ycyB0byBzY3JlZW4gYXMgd2VsbC5cbiAgICAgICAgdmFyIG9yaWdpbmFsQ29uc29sZUVycm9yID0gY29uc29sZS5lcnJvcjtcbiAgICAgICAgY29uc29sZS5lcnJvciA9IGZ1bmN0aW9uIChlcnJvciwgYXJyYXkpIHtcbiAgICAgICAgICAgIF90aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgIG9yaWdpbmFsQ29uc29sZUVycm9yLmNhbGwoY29uc29sZSwgZXJyb3IsIGFycmF5KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgSG9tZUNvbnRyb2xsZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICB2YXIgdmFyaWFibGVzID0ge307XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnZhcmlhYmxlczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciB2YXJpYWJsZSA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhcmlhYmxlc1t2YXJpYWJsZS5rZXldID0gdmFyaWFibGUudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vdXRwdXQgPSBTUWlnZ0wucGFyc2UodGhpcy5pbnB1dCwgdmFyaWFibGVzKTtcbiAgICB9O1xuICAgIEhvbWVDb250cm9sbGVyLnByb3RvdHlwZS5hZGRWYXJpYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZXMucHVzaCh7IGtleTogbnVsbCwgdmFsdWU6IG51bGwgfSk7XG4gICAgfTtcbiAgICBIb21lQ29udHJvbGxlci5wcm90b3R5cGUuZGVsZXRlVmFyaWFibGUgPSBmdW5jdGlvbiAodmFyaWFibGUpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZXNbJ3JlbW92ZSddKHZhcmlhYmxlKTtcbiAgICB9O1xuICAgIHJldHVybiBIb21lQ29udHJvbGxlcjtcbn0pKCk7XG5hcHBfbW9kdWxlXzEuZGVmYXVsdC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIFtIb21lQ29udHJvbGxlcl0pO1xuIl19
