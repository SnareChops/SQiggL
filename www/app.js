(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var AppConfig = (function () {
    function AppConfig(markedProvider) {
        markedProvider.setOptions({ gfm: true, tables: true, breaks: true });
    }
    return AppConfig;
})();
var Module = angular.module('sqiggl', ['ngMaterial', 'ui.router', 'hc.marked', 'angular.filter']).config(['markedProvider', AppConfig]);
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
        })
            .state('docs', {
            url: '/docs/:item?',
            templateUrl: 'www/docs.html',
            controller: 'DocsController',
            controllerAs: 'docs'
        });
    }
    return Router;
})();
app_module_1.default.config(Router);

},{"./app.module":1}],3:[function(require,module,exports){
/// <reference path ="../typings/tsd.d.ts" />
var app_module_1 = require('./app.module');
var DocsController = (function () {
    function DocsController($http, $stateParams) {
        var _this = this;
        this.$http = $http;
        this.$stateParams = $stateParams;
        this.docs = [];
        $http.get('www/docs.json').then(function (response) {
            response.data.forEach(function (item) {
                var match = item.match(/(\w*)[\\\/](\w+)(?=\.md)/);
                var parent = match[1];
                var name = match[2];
                _this.docs.push({ parent: parent === 'docs' ? 'core' : parent, name: name, url: item, show: $stateParams.item === name });
            });
            setTimeout(function () {
                var elements = document.querySelectorAll('.docs a');
                Array.prototype.forEach.call(elements, function (element) {
                    var href = element.getAttribute('href');
                    element.setAttribute('href', href.replace(/#(.*)/, function (match, $1) { return ("#/docs/" + $1); }));
                });
            }, 500);
        });
    }
    return DocsController;
})();
app_module_1.default.controller('DocsController', ['$http', '$stateParams', DocsController]);

},{"./app.module":1}],4:[function(require,module,exports){
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

},{"./app.module":1}]},{},[1,2,3,4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwLm1vZHVsZS5qcyIsInd3dy9hcHAucm91dGVzLmpzIiwid3d3L2RvY3MuY29udHJvbGxlci5qcyIsInd3dy9ob21lLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG52YXIgQXBwQ29uZmlnID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBcHBDb25maWcobWFya2VkUHJvdmlkZXIpIHtcbiAgICAgICAgbWFya2VkUHJvdmlkZXIuc2V0T3B0aW9ucyh7IGdmbTogdHJ1ZSwgdGFibGVzOiB0cnVlLCBicmVha3M6IHRydWUgfSk7XG4gICAgfVxuICAgIHJldHVybiBBcHBDb25maWc7XG59KSgpO1xudmFyIE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdzcWlnZ2wnLCBbJ25nTWF0ZXJpYWwnLCAndWkucm91dGVyJywgJ2hjLm1hcmtlZCcsICdhbmd1bGFyLmZpbHRlciddKS5jb25maWcoWydtYXJrZWRQcm92aWRlcicsIEFwcENvbmZpZ10pO1xuZXhwb3J0cy5kZWZhdWx0ID0gTW9kdWxlO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xudmFyIFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUm91dGVyKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgICAgICB1cmw6ICcvZG9jcy86aXRlbT8nLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd3d3cvZG9jcy5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEb2NzQ29udHJvbGxlcicsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdkb2NzJ1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIFJvdXRlcjtcbn0pKCk7XG5hcHBfbW9kdWxlXzEuZGVmYXVsdC5jb25maWcoUm91dGVyKTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGggPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG52YXIgYXBwX21vZHVsZV8xID0gcmVxdWlyZSgnLi9hcHAubW9kdWxlJyk7XG52YXIgRG9jc0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERvY3NDb250cm9sbGVyKCRodHRwLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy4kaHR0cCA9ICRodHRwO1xuICAgICAgICB0aGlzLiRzdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcbiAgICAgICAgdGhpcy5kb2NzID0gW107XG4gICAgICAgICRodHRwLmdldCgnd3d3L2RvY3MuanNvbicpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXNwb25zZS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBpdGVtLm1hdGNoKC8oXFx3KilbXFxcXFxcL10oXFx3KykoPz1cXC5tZCkvKTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gbWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBtYXRjaFsyXTtcbiAgICAgICAgICAgICAgICBfdGhpcy5kb2NzLnB1c2goeyBwYXJlbnQ6IHBhcmVudCA9PT0gJ2RvY3MnID8gJ2NvcmUnIDogcGFyZW50LCBuYW1lOiBuYW1lLCB1cmw6IGl0ZW0sIHNob3c6ICRzdGF0ZVBhcmFtcy5pdGVtID09PSBuYW1lIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZG9jcyBhJyk7XG4gICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbGVtZW50cywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhyZWYgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYucmVwbGFjZSgvIyguKikvLCBmdW5jdGlvbiAobWF0Y2gsICQxKSB7IHJldHVybiAoXCIjL2RvY3MvXCIgKyAkMSk7IH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gRG9jc0NvbnRyb2xsZXI7XG59KSgpO1xuYXBwX21vZHVsZV8xLmRlZmF1bHQuY29udHJvbGxlcignRG9jc0NvbnRyb2xsZXInLCBbJyRodHRwJywgJyRzdGF0ZVBhcmFtcycsIERvY3NDb250cm9sbGVyXSk7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG52YXIgYXBwX21vZHVsZV8xID0gcmVxdWlyZSgnLi9hcHAubW9kdWxlJyk7XG5BcnJheS5wcm90b3R5cGVbJ3JlbW92ZSddID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB0aGlzLnNwbGljZSh0aGlzLmluZGV4T2YoaXRlbSksIDEpO1xufTtcbnZhciBIb21lQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBcIlVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBpcyBub3QgbnVsbCAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ1wiO1xuICAgICAgICB0aGlzLm91dHB1dCA9ICdFbnRlciB5b3VyIHF1ZXJ5IHRvIHRoZSBsZWZ0IGFuZCBwcmVzcyBFeGVjdXRlJztcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSBbeyBrZXk6IFwiZXhhbXBsZVwiLCB2YWx1ZTogXCJkcmFnb25cIiB9XTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgLy9QYXRjaCBjb25zb2xlLmVycm9yIHRvIHNob3cgZXJyb3JzIHRvIHNjcmVlbiBhcyB3ZWxsLlxuICAgICAgICB2YXIgb3JpZ2luYWxDb25zb2xlRXJyb3IgPSBjb25zb2xlLmVycm9yO1xuICAgICAgICBjb25zb2xlLmVycm9yID0gZnVuY3Rpb24gKGVycm9yLCBhcnJheSkge1xuICAgICAgICAgICAgX3RoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgb3JpZ2luYWxDb25zb2xlRXJyb3IuY2FsbChjb25zb2xlLCBlcnJvciwgYXJyYXkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBIb21lQ29udHJvbGxlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHZhciB2YXJpYWJsZXMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMudmFyaWFibGVzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gX2FbX2ldO1xuICAgICAgICAgICAgdmFyaWFibGVzW3ZhcmlhYmxlLmtleV0gPSB2YXJpYWJsZS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm91dHB1dCA9IFNRaWdnTC5wYXJzZSh0aGlzLmlucHV0LCB2YXJpYWJsZXMpO1xuICAgIH07XG4gICAgSG9tZUNvbnRyb2xsZXIucHJvdG90eXBlLmFkZFZhcmlhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlcy5wdXNoKHsga2V5OiBudWxsLCB2YWx1ZTogbnVsbCB9KTtcbiAgICB9O1xuICAgIEhvbWVDb250cm9sbGVyLnByb3RvdHlwZS5kZWxldGVWYXJpYWJsZSA9IGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlc1sncmVtb3ZlJ10odmFyaWFibGUpO1xuICAgIH07XG4gICAgcmV0dXJuIEhvbWVDb250cm9sbGVyO1xufSkoKTtcbmFwcF9tb2R1bGVfMS5kZWZhdWx0LmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgW0hvbWVDb250cm9sbGVyXSk7XG4iXX0=
