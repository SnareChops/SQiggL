(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var AppConfig = (function () {
    function AppConfig(markedProvider, $mdThemingProvider) {
        markedProvider.setOptions({ gfm: true, tables: true, breaks: true });
        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('amber');
    }
    return AppConfig;
})();
var Module = angular.module('sqiggl', ['ngMaterial', 'ui.router', 'hc.marked', 'angular.filter', 'firebase']).config(['markedProvider', '$mdThemingProvider', AppConfig]);
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
        })
            .state('srcdocs', {
            url: '/srcdocs/:item?',
            templateUrl: 'www/srcdocs.html',
            controller: 'SrcDocsController',
            controllerAs: 'docs'
        });
    }
    return Router;
})();
app_module_1.default.config(Router);

},{"./app.module":1}],3:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var app_module_1 = require('./app.module');
var DocsController = (function () {
    function DocsController() {
    }
    return DocsController;
})();
exports.default = DocsController;
app_module_1.default.controller('DocsController', [DocsController]);

},{"./app.module":1}],4:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var app_module_1 = require('./app.module');
Array.prototype['remove'] = function (item) {
    this.splice(this.indexOf(item), 1);
};
var HomeController = (function () {
    function HomeController($firebaseArray) {
        var _this = this;
        this.$firebaseArray = $firebaseArray;
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
        this.firebaseArray = $firebaseArray(new Firebase('https://sqiggl.firebaseio.com/queries'));
    }
    HomeController.prototype.parse = function () {
        this.errors = [];
        var variables = {};
        for (var _i = 0, _a = this.variables; _i < _a.length; _i++) {
            var variable = _a[_i];
            variables[variable.key] = variable.value;
        }
        try {
            this.output = SQiggL.parse(this.input, variables);
            this.reportQuery(this.input, this.output, this.errors);
        }
        catch (error) {
            this.reportQuery(this.input, this.output, error);
        }
    };
    HomeController.prototype.addVariable = function () {
        this.variables.push({ key: null, value: null });
    };
    HomeController.prototype.deleteVariable = function (variable) {
        this.variables['remove'](variable);
    };
    HomeController.prototype.reportQuery = function (query, output, errors) {
        this.firebaseArray.$add({ query: query, output: output, errors: errors });
    };
    return HomeController;
})();
app_module_1.default.controller('HomeController', ['$firebaseArray', HomeController]);

},{"./app.module":1}],5:[function(require,module,exports){
/// <reference path ="../typings/tsd.d.ts" />
var app_module_1 = require('./app.module');
var SrcDocsController = (function () {
    function SrcDocsController($http, $stateParams) {
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
                var elements = document.querySelectorAll('.srcdocs a');
                Array.prototype.forEach.call(elements, function (element) {
                    var href = element.getAttribute('href');
                    element.setAttribute('href', href.replace(/#(.*)/, function (match, $1) { return ("#/docs/" + $1); }));
                });
            }, 500);
        });
    }
    return SrcDocsController;
})();
app_module_1.default.controller('SrcDocsController', ['$http', '$stateParams', SrcDocsController]);

},{"./app.module":1}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwLm1vZHVsZS5qcyIsInd3dy9hcHAucm91dGVzLmpzIiwid3d3L2RvY3MuY29udHJvbGxlci5qcyIsInd3dy9ob21lLmNvbnRyb2xsZXIuanMiLCJ3d3cvc3JjZG9jcy5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbnZhciBBcHBDb25maWcgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFwcENvbmZpZyhtYXJrZWRQcm92aWRlciwgJG1kVGhlbWluZ1Byb3ZpZGVyKSB7XG4gICAgICAgIG1hcmtlZFByb3ZpZGVyLnNldE9wdGlvbnMoeyBnZm06IHRydWUsIHRhYmxlczogdHJ1ZSwgYnJlYWtzOiB0cnVlIH0pO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RlZmF1bHQnKVxuICAgICAgICAgICAgLnByaW1hcnlQYWxldHRlKCdpbmRpZ28nKVxuICAgICAgICAgICAgLmFjY2VudFBhbGV0dGUoJ2FtYmVyJyk7XG4gICAgfVxuICAgIHJldHVybiBBcHBDb25maWc7XG59KSgpO1xudmFyIE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdzcWlnZ2wnLCBbJ25nTWF0ZXJpYWwnLCAndWkucm91dGVyJywgJ2hjLm1hcmtlZCcsICdhbmd1bGFyLmZpbHRlcicsICdmaXJlYmFzZSddKS5jb25maWcoWydtYXJrZWRQcm92aWRlcicsICckbWRUaGVtaW5nUHJvdmlkZXInLCBBcHBDb25maWddKTtcbmV4cG9ydHMuZGVmYXVsdCA9IE1vZHVsZTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbnZhciBhcHBfbW9kdWxlXzEgPSByZXF1aXJlKCcuL2FwcC5tb2R1bGUnKTtcbnZhciBSb3V0ZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJvdXRlcigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd3d3cvaG9tZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdob21lJ1xuICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCdkb2NzJywge1xuICAgICAgICAgICAgdXJsOiAnL2RvY3MvOml0ZW0/JyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnd3d3L2RvY3MuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRG9jc0NvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZG9jcydcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnc3JjZG9jcycsIHtcbiAgICAgICAgICAgIHVybDogJy9zcmNkb2NzLzppdGVtPycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9zcmNkb2NzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1NyY0RvY3NDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2RvY3MnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gUm91dGVyO1xufSkoKTtcbmFwcF9tb2R1bGVfMS5kZWZhdWx0LmNvbmZpZyhSb3V0ZXIpO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xudmFyIERvY3NDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEb2NzQ29udHJvbGxlcigpIHtcbiAgICB9XG4gICAgcmV0dXJuIERvY3NDb250cm9sbGVyO1xufSkoKTtcbmV4cG9ydHMuZGVmYXVsdCA9IERvY3NDb250cm9sbGVyO1xuYXBwX21vZHVsZV8xLmRlZmF1bHQuY29udHJvbGxlcignRG9jc0NvbnRyb2xsZXInLCBbRG9jc0NvbnRyb2xsZXJdKTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbnZhciBhcHBfbW9kdWxlXzEgPSByZXF1aXJlKCcuL2FwcC5tb2R1bGUnKTtcbkFycmF5LnByb3RvdHlwZVsncmVtb3ZlJ10gPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgIHRoaXMuc3BsaWNlKHRoaXMuaW5kZXhPZihpdGVtKSwgMSk7XG59O1xudmFyIEhvbWVDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcigkZmlyZWJhc2VBcnJheSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLiRmaXJlYmFzZUFycmF5ID0gJGZpcmViYXNlQXJyYXk7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBcIlVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBpcyBub3QgbnVsbCAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ1wiO1xuICAgICAgICB0aGlzLm91dHB1dCA9ICdFbnRlciB5b3VyIHF1ZXJ5IHRvIHRoZSBsZWZ0IGFuZCBwcmVzcyBFeGVjdXRlJztcbiAgICAgICAgdGhpcy52YXJpYWJsZXMgPSBbeyBrZXk6IFwiZXhhbXBsZVwiLCB2YWx1ZTogXCJkcmFnb25cIiB9XTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgLy9QYXRjaCBjb25zb2xlLmVycm9yIHRvIHNob3cgZXJyb3JzIHRvIHNjcmVlbiBhcyB3ZWxsLlxuICAgICAgICB2YXIgb3JpZ2luYWxDb25zb2xlRXJyb3IgPSBjb25zb2xlLmVycm9yO1xuICAgICAgICBjb25zb2xlLmVycm9yID0gZnVuY3Rpb24gKGVycm9yLCBhcnJheSkge1xuICAgICAgICAgICAgX3RoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgb3JpZ2luYWxDb25zb2xlRXJyb3IuY2FsbChjb25zb2xlLCBlcnJvciwgYXJyYXkpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmZpcmViYXNlQXJyYXkgPSAkZmlyZWJhc2VBcnJheShuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vc3FpZ2dsLmZpcmViYXNlaW8uY29tL3F1ZXJpZXMnKSk7XG4gICAgfVxuICAgIEhvbWVDb250cm9sbGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdmFyIHZhcmlhYmxlcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy52YXJpYWJsZXM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmFyaWFibGUgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXJpYWJsZXNbdmFyaWFibGUua2V5XSA9IHZhcmlhYmxlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLm91dHB1dCA9IFNRaWdnTC5wYXJzZSh0aGlzLmlucHV0LCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgdGhpcy5yZXBvcnRRdWVyeSh0aGlzLmlucHV0LCB0aGlzLm91dHB1dCwgdGhpcy5lcnJvcnMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5yZXBvcnRRdWVyeSh0aGlzLmlucHV0LCB0aGlzLm91dHB1dCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBIb21lQ29udHJvbGxlci5wcm90b3R5cGUuYWRkVmFyaWFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVzLnB1c2goeyBrZXk6IG51bGwsIHZhbHVlOiBudWxsIH0pO1xuICAgIH07XG4gICAgSG9tZUNvbnRyb2xsZXIucHJvdG90eXBlLmRlbGV0ZVZhcmlhYmxlID0gZnVuY3Rpb24gKHZhcmlhYmxlKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVzWydyZW1vdmUnXSh2YXJpYWJsZSk7XG4gICAgfTtcbiAgICBIb21lQ29udHJvbGxlci5wcm90b3R5cGUucmVwb3J0UXVlcnkgPSBmdW5jdGlvbiAocXVlcnksIG91dHB1dCwgZXJyb3JzKSB7XG4gICAgICAgIHRoaXMuZmlyZWJhc2VBcnJheS4kYWRkKHsgcXVlcnk6IHF1ZXJ5LCBvdXRwdXQ6IG91dHB1dCwgZXJyb3JzOiBlcnJvcnMgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gSG9tZUNvbnRyb2xsZXI7XG59KSgpO1xuYXBwX21vZHVsZV8xLmRlZmF1bHQuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRmaXJlYmFzZUFycmF5JywgSG9tZUNvbnRyb2xsZXJdKTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGggPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG52YXIgYXBwX21vZHVsZV8xID0gcmVxdWlyZSgnLi9hcHAubW9kdWxlJyk7XG52YXIgU3JjRG9jc0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNyY0RvY3NDb250cm9sbGVyKCRodHRwLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy4kaHR0cCA9ICRodHRwO1xuICAgICAgICB0aGlzLiRzdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcbiAgICAgICAgdGhpcy5kb2NzID0gW107XG4gICAgICAgICRodHRwLmdldCgnd3d3L2RvY3MuanNvbicpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXNwb25zZS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBpdGVtLm1hdGNoKC8oXFx3KilbXFxcXFxcL10oXFx3KykoPz1cXC5tZCkvKTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gbWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBtYXRjaFsyXTtcbiAgICAgICAgICAgICAgICBfdGhpcy5kb2NzLnB1c2goeyBwYXJlbnQ6IHBhcmVudCA9PT0gJ2RvY3MnID8gJ2NvcmUnIDogcGFyZW50LCBuYW1lOiBuYW1lLCB1cmw6IGl0ZW0sIHNob3c6ICRzdGF0ZVBhcmFtcy5pdGVtID09PSBuYW1lIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3JjZG9jcyBhJyk7XG4gICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbGVtZW50cywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhyZWYgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYucmVwbGFjZSgvIyguKikvLCBmdW5jdGlvbiAobWF0Y2gsICQxKSB7IHJldHVybiAoXCIjL2RvY3MvXCIgKyAkMSk7IH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gU3JjRG9jc0NvbnRyb2xsZXI7XG59KSgpO1xuYXBwX21vZHVsZV8xLmRlZmF1bHQuY29udHJvbGxlcignU3JjRG9jc0NvbnRyb2xsZXInLCBbJyRodHRwJywgJyRzdGF0ZVBhcmFtcycsIFNyY0RvY3NDb250cm9sbGVyXSk7XG4iXX0=
