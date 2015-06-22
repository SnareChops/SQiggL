(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var Module = angular.module('sqiggl', ['ngMaterial', 'ui.router', 'markdown']);
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
            url: '/docs',
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
    function DocsController($http) {
        var _this = this;
        this.$http = $http;
        $http.get('www/docs.json').then(function (response) { return _this.docs = response.data; });
    }
    return DocsController;
})();
app_module_1.default.controller('DocsController', ['$http', DocsController]);

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

},{"./app.module":1}],5:[function(require,module,exports){
/*!
   angular-markdown-text v0.0.1
   (c) 2014 (null) McNull https://github.com/McNull/angular-markdown-text
   License: MIT
*/
!function(n,e){var t=n.module("markdown",[]);t.constant("markdownConfig",{outline:!0,escapeHtml:!1,sanitize:!0,showdown:{extensions:[]}}),t.directive("markdown",["markdown","markdownConfig","$http","$templateCache",function(e,t,r,a){function o(n,e,t){return n[e]?"true"==n[e]:t}return{restrict:"AE",terminal:!0,compile:function(i,c){var m=n.copy(t);m.escapeHtml=o(c,"markdownEscapeHtml",m.escapeHtml),m.outline=o(c,"markdownOutline",m.outline),m.sanitize=o(c,"markdownSanitize",m.sanitize);var l=c.markdown||c.markdownModel,u=c.markdownSrc;return{pre:function(n,e){e.data("markdown",!0)},post:function(n,t){if(!t.parent().inheritedData("markdown"))if(u){var o=0;n.$watch(u,function(n){var i=++o;n?r.get(n,{cache:a}).success(function(n){if(i==o){var r=n?e.makeHtml(n,m):"";void 0!=r&&t.html(r)}}).error(function(){i==o&&t.html("")}):t.html("")})}else if(l)n.$watch(l,function(n){var r=n?e.makeHtml(n,m):"";void 0!=r&&t.html(r)});else{var i=e.makeHtml(t.html(),m);void 0!=i&&t.html(i)}}}}}}]),t.factory("markdown",["markdownConfig","$injector",function(n,t){function r(){return c=c||new e.converter(n.showdown)}function a(e,t){t=t||n,t.outline&&(e=i(e)),t.escapeHtml&&(e=o(e));var a=r().makeHtml(e);if(t.sanitize){if(!m)throw new Error("Missing dependency angular-sanitize.");try{a=m(a)}catch(c){console.log(c),a=void 0}}return a}function o(n){return n.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function i(n){if(n){n=n.replace(/^\s*\n/,"");var e=n.match(/^[ \t]+/);if(e&&e.length){var t="^[ 	]{"+e[0].length+"}",r=new RegExp(t,"gm");n=n.replace(r,"")}}return n}var c,m;return t.has("$sanitize")&&(m=t.get("$sanitize")),{_converter:r,makeHtml:a,outline:i,escapeHtml:o}}])}(angular,Showdown);

},{}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwLm1vZHVsZS5qcyIsInd3dy9hcHAucm91dGVzLmpzIiwid3d3L2RvY3MuY29udHJvbGxlci5qcyIsInd3dy9ob21lLmNvbnRyb2xsZXIuanMiLCJ3d3cvbGliL2FuZ3VsYXItbWFya2Rvd24tdGV4dC5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdzcWlnZ2wnLCBbJ25nTWF0ZXJpYWwnLCAndWkucm91dGVyJywgJ21hcmtkb3duJ10pO1xuZXhwb3J0cy5kZWZhdWx0ID0gTW9kdWxlO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxudmFyIGFwcF9tb2R1bGVfMSA9IHJlcXVpcmUoJy4vYXBwLm1vZHVsZScpO1xudmFyIFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUm91dGVyKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9kb2NzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0RvY3NDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2RvY3MnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gUm91dGVyO1xufSkoKTtcbmFwcF9tb2R1bGVfMS5kZWZhdWx0LmNvbmZpZyhSb3V0ZXIpO1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aCA9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbnZhciBhcHBfbW9kdWxlXzEgPSByZXF1aXJlKCcuL2FwcC5tb2R1bGUnKTtcbnZhciBEb2NzQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRG9jc0NvbnRyb2xsZXIoJGh0dHApIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy4kaHR0cCA9ICRodHRwO1xuICAgICAgICAkaHR0cC5nZXQoJ3d3dy9kb2NzLmpzb24nKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyByZXR1cm4gX3RoaXMuZG9jcyA9IHJlc3BvbnNlLmRhdGE7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gRG9jc0NvbnRyb2xsZXI7XG59KSgpO1xuYXBwX21vZHVsZV8xLmRlZmF1bHQuY29udHJvbGxlcignRG9jc0NvbnRyb2xsZXInLCBbJyRodHRwJywgRG9jc0NvbnRyb2xsZXJdKTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbnZhciBhcHBfbW9kdWxlXzEgPSByZXF1aXJlKCcuL2FwcC5tb2R1bGUnKTtcbkFycmF5LnByb3RvdHlwZVsncmVtb3ZlJ10gPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgIHRoaXMuc3BsaWNlKHRoaXMuaW5kZXhPZihpdGVtKSwgMSk7XG59O1xudmFyIEhvbWVDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pbnB1dCA9IFwiVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGlzIG5vdCBudWxsICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnXCI7XG4gICAgICAgIHRoaXMub3V0cHV0ID0gJ0VudGVyIHlvdXIgcXVlcnkgdG8gdGhlIGxlZnQgYW5kIHByZXNzIEV4ZWN1dGUnO1xuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IFt7IGtleTogXCJleGFtcGxlXCIsIHZhbHVlOiBcImRyYWdvblwiIH1dO1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICAvL1BhdGNoIGNvbnNvbGUuZXJyb3IgdG8gc2hvdyBlcnJvcnMgdG8gc2NyZWVuIGFzIHdlbGwuXG4gICAgICAgIHZhciBvcmlnaW5hbENvbnNvbGVFcnJvciA9IGNvbnNvbGUuZXJyb3I7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IsIGFycmF5KSB7XG4gICAgICAgICAgICBfdGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICBvcmlnaW5hbENvbnNvbGVFcnJvci5jYWxsKGNvbnNvbGUsIGVycm9yLCBhcnJheSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIEhvbWVDb250cm9sbGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdmFyIHZhcmlhYmxlcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy52YXJpYWJsZXM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmFyaWFibGUgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXJpYWJsZXNbdmFyaWFibGUua2V5XSA9IHZhcmlhYmxlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3V0cHV0ID0gU1FpZ2dMLnBhcnNlKHRoaXMuaW5wdXQsIHZhcmlhYmxlcyk7XG4gICAgfTtcbiAgICBIb21lQ29udHJvbGxlci5wcm90b3R5cGUuYWRkVmFyaWFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVzLnB1c2goeyBrZXk6IG51bGwsIHZhbHVlOiBudWxsIH0pO1xuICAgIH07XG4gICAgSG9tZUNvbnRyb2xsZXIucHJvdG90eXBlLmRlbGV0ZVZhcmlhYmxlID0gZnVuY3Rpb24gKHZhcmlhYmxlKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVzWydyZW1vdmUnXSh2YXJpYWJsZSk7XG4gICAgfTtcbiAgICByZXR1cm4gSG9tZUNvbnRyb2xsZXI7XG59KSgpO1xuYXBwX21vZHVsZV8xLmRlZmF1bHQuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbSG9tZUNvbnRyb2xsZXJdKTtcbiIsIi8qIVxyXG4gICBhbmd1bGFyLW1hcmtkb3duLXRleHQgdjAuMC4xXHJcbiAgIChjKSAyMDE0IChudWxsKSBNY051bGwgaHR0cHM6Ly9naXRodWIuY29tL01jTnVsbC9hbmd1bGFyLW1hcmtkb3duLXRleHRcclxuICAgTGljZW5zZTogTUlUXHJcbiovXHJcbiFmdW5jdGlvbihuLGUpe3ZhciB0PW4ubW9kdWxlKFwibWFya2Rvd25cIixbXSk7dC5jb25zdGFudChcIm1hcmtkb3duQ29uZmlnXCIse291dGxpbmU6ITAsZXNjYXBlSHRtbDohMSxzYW5pdGl6ZTohMCxzaG93ZG93bjp7ZXh0ZW5zaW9uczpbXX19KSx0LmRpcmVjdGl2ZShcIm1hcmtkb3duXCIsW1wibWFya2Rvd25cIixcIm1hcmtkb3duQ29uZmlnXCIsXCIkaHR0cFwiLFwiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihlLHQscixhKXtmdW5jdGlvbiBvKG4sZSx0KXtyZXR1cm4gbltlXT9cInRydWVcIj09bltlXTp0fXJldHVybntyZXN0cmljdDpcIkFFXCIsdGVybWluYWw6ITAsY29tcGlsZTpmdW5jdGlvbihpLGMpe3ZhciBtPW4uY29weSh0KTttLmVzY2FwZUh0bWw9byhjLFwibWFya2Rvd25Fc2NhcGVIdG1sXCIsbS5lc2NhcGVIdG1sKSxtLm91dGxpbmU9byhjLFwibWFya2Rvd25PdXRsaW5lXCIsbS5vdXRsaW5lKSxtLnNhbml0aXplPW8oYyxcIm1hcmtkb3duU2FuaXRpemVcIixtLnNhbml0aXplKTt2YXIgbD1jLm1hcmtkb3dufHxjLm1hcmtkb3duTW9kZWwsdT1jLm1hcmtkb3duU3JjO3JldHVybntwcmU6ZnVuY3Rpb24obixlKXtlLmRhdGEoXCJtYXJrZG93blwiLCEwKX0scG9zdDpmdW5jdGlvbihuLHQpe2lmKCF0LnBhcmVudCgpLmluaGVyaXRlZERhdGEoXCJtYXJrZG93blwiKSlpZih1KXt2YXIgbz0wO24uJHdhdGNoKHUsZnVuY3Rpb24obil7dmFyIGk9KytvO24/ci5nZXQobix7Y2FjaGU6YX0pLnN1Y2Nlc3MoZnVuY3Rpb24obil7aWYoaT09byl7dmFyIHI9bj9lLm1ha2VIdG1sKG4sbSk6XCJcIjt2b2lkIDAhPXImJnQuaHRtbChyKX19KS5lcnJvcihmdW5jdGlvbigpe2k9PW8mJnQuaHRtbChcIlwiKX0pOnQuaHRtbChcIlwiKX0pfWVsc2UgaWYobCluLiR3YXRjaChsLGZ1bmN0aW9uKG4pe3ZhciByPW4/ZS5tYWtlSHRtbChuLG0pOlwiXCI7dm9pZCAwIT1yJiZ0Lmh0bWwocil9KTtlbHNle3ZhciBpPWUubWFrZUh0bWwodC5odG1sKCksbSk7dm9pZCAwIT1pJiZ0Lmh0bWwoaSl9fX19fX1dKSx0LmZhY3RvcnkoXCJtYXJrZG93blwiLFtcIm1hcmtkb3duQ29uZmlnXCIsXCIkaW5qZWN0b3JcIixmdW5jdGlvbihuLHQpe2Z1bmN0aW9uIHIoKXtyZXR1cm4gYz1jfHxuZXcgZS5jb252ZXJ0ZXIobi5zaG93ZG93bil9ZnVuY3Rpb24gYShlLHQpe3Q9dHx8bix0Lm91dGxpbmUmJihlPWkoZSkpLHQuZXNjYXBlSHRtbCYmKGU9byhlKSk7dmFyIGE9cigpLm1ha2VIdG1sKGUpO2lmKHQuc2FuaXRpemUpe2lmKCFtKXRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgZGVwZW5kZW5jeSBhbmd1bGFyLXNhbml0aXplLlwiKTt0cnl7YT1tKGEpfWNhdGNoKGMpe2NvbnNvbGUubG9nKGMpLGE9dm9pZCAwfX1yZXR1cm4gYX1mdW5jdGlvbiBvKG4pe3JldHVybiBuLnJlcGxhY2UoLyYvZyxcIiZhbXA7XCIpLnJlcGxhY2UoL1wiL2csXCImcXVvdDtcIikucmVwbGFjZSgvPC9nLFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csXCImZ3Q7XCIpfWZ1bmN0aW9uIGkobil7aWYobil7bj1uLnJlcGxhY2UoL15cXHMqXFxuLyxcIlwiKTt2YXIgZT1uLm1hdGNoKC9eWyBcXHRdKy8pO2lmKGUmJmUubGVuZ3RoKXt2YXIgdD1cIl5bIFx0XXtcIitlWzBdLmxlbmd0aCtcIn1cIixyPW5ldyBSZWdFeHAodCxcImdtXCIpO249bi5yZXBsYWNlKHIsXCJcIil9fXJldHVybiBufXZhciBjLG07cmV0dXJuIHQuaGFzKFwiJHNhbml0aXplXCIpJiYobT10LmdldChcIiRzYW5pdGl6ZVwiKSkse19jb252ZXJ0ZXI6cixtYWtlSHRtbDphLG91dGxpbmU6aSxlc2NhcGVIdG1sOm99fV0pfShhbmd1bGFyLFNob3dkb3duKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YW5ndWxhci1tYXJrZG93bi10ZXh0Lm1pbi5qcy5tYXAiXX0=
