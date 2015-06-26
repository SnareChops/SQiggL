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
            throw error;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwLm1vZHVsZS5qcyIsInd3dy9hcHAucm91dGVzLmpzIiwid3d3L2RvY3MuY29udHJvbGxlci5qcyIsInd3dy9ob21lLmNvbnRyb2xsZXIuanMiLCJ3d3cvc3JjZG9jcy5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIEFwcENvbmZpZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXBwQ29uZmlnKG1hcmtlZFByb3ZpZGVyLCAkbWRUaGVtaW5nUHJvdmlkZXIpIHtcbiAgICAgICAgbWFya2VkUHJvdmlkZXIuc2V0T3B0aW9ucyh7IGdmbTogdHJ1ZSwgdGFibGVzOiB0cnVlLCBicmVha3M6IHRydWUgfSk7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGVmYXVsdCcpXG4gICAgICAgICAgICAucHJpbWFyeVBhbGV0dGUoJ2luZGlnbycpXG4gICAgICAgICAgICAuYWNjZW50UGFsZXR0ZSgnYW1iZXInKTtcbiAgICB9XG4gICAgcmV0dXJuIEFwcENvbmZpZztcbn0pKCk7XG52YXIgTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3NxaWdnbCcsIFsnbmdNYXRlcmlhbCcsICd1aS5yb3V0ZXInLCAnaGMubWFya2VkJywgJ2FuZ3VsYXIuZmlsdGVyJywgJ2ZpcmViYXNlJ10pLmNvbmZpZyhbJ21hcmtlZFByb3ZpZGVyJywgJyRtZFRoZW1pbmdQcm92aWRlcicsIEFwcENvbmZpZ10pO1xuZXhwb3J0cy5kZWZhdWx0ID0gTW9kdWxlO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xudmFyIFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUm91dGVyKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgICAgICB1cmw6ICcvZG9jcy86aXRlbT8nLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd3d3cvZG9jcy5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEb2NzQ29udHJvbGxlcicsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdkb2NzJ1xuICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCdzcmNkb2NzJywge1xuICAgICAgICAgICAgdXJsOiAnL3NyY2RvY3MvOml0ZW0/JyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnd3d3L3NyY2RvY3MuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU3JjRG9jc0NvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZG9jcydcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBSb3V0ZXI7XG59KSgpO1xuYXBwX21vZHVsZV8xLmRlZmF1bHQuY29uZmlnKFJvdXRlcik7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG52YXIgYXBwX21vZHVsZV8xID0gcmVxdWlyZSgnLi9hcHAubW9kdWxlJyk7XG52YXIgRG9jc0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERvY3NDb250cm9sbGVyKCkge1xuICAgIH1cbiAgICByZXR1cm4gRG9jc0NvbnRyb2xsZXI7XG59KSgpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRG9jc0NvbnRyb2xsZXI7XG5hcHBfbW9kdWxlXzEuZGVmYXVsdC5jb250cm9sbGVyKCdEb2NzQ29udHJvbGxlcicsIFtEb2NzQ29udHJvbGxlcl0pO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xuQXJyYXkucHJvdG90eXBlWydyZW1vdmUnXSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdGhpcy5zcGxpY2UodGhpcy5pbmRleE9mKGl0ZW0pLCAxKTtcbn07XG52YXIgSG9tZUNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKCRmaXJlYmFzZUFycmF5KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGZpcmViYXNlQXJyYXkgPSAkZmlyZWJhc2VBcnJheTtcbiAgICAgICAgdGhpcy5pbnB1dCA9IFwiVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGlzIG5vdCBudWxsICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnXCI7XG4gICAgICAgIHRoaXMub3V0cHV0ID0gJ0VudGVyIHlvdXIgcXVlcnkgdG8gdGhlIGxlZnQgYW5kIHByZXNzIEV4ZWN1dGUnO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IFt7IGtleTogXCJleGFtcGxlXCIsIHZhbHVlOiBcImRyYWdvblwiIH1dO1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICAvL1BhdGNoIGNvbnNvbGUuZXJyb3IgdG8gc2hvdyBlcnJvcnMgdG8gc2NyZWVuIGFzIHdlbGwuXG4gICAgICAgIHZhciBvcmlnaW5hbENvbnNvbGVFcnJvciA9IGNvbnNvbGUuZXJyb3I7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IsIGFycmF5KSB7XG4gICAgICAgICAgICBfdGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICBvcmlnaW5hbENvbnNvbGVFcnJvci5jYWxsKGNvbnNvbGUsIGVycm9yLCBhcnJheSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZmlyZWJhc2VBcnJheSA9ICRmaXJlYmFzZUFycmF5KG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9zcWlnZ2wuZmlyZWJhc2Vpby5jb20vcXVlcmllcycpKTtcbiAgICB9XG4gICAgSG9tZUNvbnRyb2xsZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICB2YXIgdmFyaWFibGVzID0ge307XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnZhcmlhYmxlczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciB2YXJpYWJsZSA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhcmlhYmxlc1t2YXJpYWJsZS5rZXldID0gdmFyaWFibGUudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0ID0gU1FpZ2dMLnBhcnNlKHRoaXMuaW5wdXQsIHZhcmlhYmxlcyk7XG4gICAgICAgICAgICB0aGlzLnJlcG9ydFF1ZXJ5KHRoaXMuaW5wdXQsIHRoaXMub3V0cHV0LCB0aGlzLmVycm9ycyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLnJlcG9ydFF1ZXJ5KHRoaXMuaW5wdXQsIHRoaXMub3V0cHV0LCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSG9tZUNvbnRyb2xsZXIucHJvdG90eXBlLmFkZFZhcmlhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlcy5wdXNoKHsga2V5OiBudWxsLCB2YWx1ZTogbnVsbCB9KTtcbiAgICB9O1xuICAgIEhvbWVDb250cm9sbGVyLnByb3RvdHlwZS5kZWxldGVWYXJpYWJsZSA9IGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlc1sncmVtb3ZlJ10odmFyaWFibGUpO1xuICAgIH07XG4gICAgSG9tZUNvbnRyb2xsZXIucHJvdG90eXBlLnJlcG9ydFF1ZXJ5ID0gZnVuY3Rpb24gKHF1ZXJ5LCBvdXRwdXQsIGVycm9ycykge1xuICAgICAgICB0aGlzLmZpcmViYXNlQXJyYXkuJGFkZCh7IHF1ZXJ5OiBxdWVyeSwgb3V0cHV0OiBvdXRwdXQsIGVycm9yczogZXJyb3JzIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIEhvbWVDb250cm9sbGVyO1xufSkoKTtcbmFwcF9tb2R1bGVfMS5kZWZhdWx0LmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckZmlyZWJhc2VBcnJheScsIEhvbWVDb250cm9sbGVyXSk7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoID1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xudmFyIFNyY0RvY3NDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcmNEb2NzQ29udHJvbGxlcigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGh0dHAgPSAkaHR0cDtcbiAgICAgICAgdGhpcy4kc3RhdGVQYXJhbXMgPSAkc3RhdGVQYXJhbXM7XG4gICAgICAgIHRoaXMuZG9jcyA9IFtdO1xuICAgICAgICAkaHR0cC5nZXQoJ3d3dy9kb2NzLmpzb24nKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gaXRlbS5tYXRjaCgvKFxcdyopW1xcXFxcXC9dKFxcdyspKD89XFwubWQpLyk7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgICAgIHZhciBuYW1lID0gbWF0Y2hbMl07XG4gICAgICAgICAgICAgICAgX3RoaXMuZG9jcy5wdXNoKHsgcGFyZW50OiBwYXJlbnQgPT09ICdkb2NzJyA/ICdjb3JlJyA6IHBhcmVudCwgbmFtZTogbmFtZSwgdXJsOiBpdGVtLCBzaG93OiAkc3RhdGVQYXJhbXMuaXRlbSA9PT0gbmFtZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNyY2RvY3MgYScpO1xuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZWxlbWVudHMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBocmVmID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmLnJlcGxhY2UoLyMoLiopLywgZnVuY3Rpb24gKG1hdGNoLCAkMSkgeyByZXR1cm4gKFwiIy9kb2NzL1wiICsgJDEpOyB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIFNyY0RvY3NDb250cm9sbGVyO1xufSkoKTtcbmFwcF9tb2R1bGVfMS5kZWZhdWx0LmNvbnRyb2xsZXIoJ1NyY0RvY3NDb250cm9sbGVyJywgWyckaHR0cCcsICckc3RhdGVQYXJhbXMnLCBTcmNEb2NzQ29udHJvbGxlcl0pO1xuIl19
