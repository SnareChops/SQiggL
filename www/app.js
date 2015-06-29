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
app_module_1["default"].config(Router);

},{"./app.module":1}],3:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var app_module_1 = require('./app.module');
var DocsController = (function () {
    function DocsController() {
    }
    return DocsController;
})();
exports["default"] = DocsController;
app_module_1["default"].controller('DocsController', [DocsController]);

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
app_module_1["default"].controller('HomeController', ['$firebaseArray', HomeController]);

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
app_module_1["default"].controller('SrcDocsController', ['$http', '$stateParams', SrcDocsController]);

},{"./app.module":1}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwLm1vZHVsZS50cyIsInd3dy9hcHAucm91dGVzLnRzIiwid3d3L2RvY3MuY29udHJvbGxlci50cyIsInd3dy9ob21lLmNvbnRyb2xsZXIudHMiLCJ3d3cvc3JjZG9jcy5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsNENBQTRDO0FBQzVDO0lBQ0ksbUJBQVksY0FBYyxFQUFFLGtCQUFrQjtRQUMxQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRW5FLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7YUFDbEMsY0FBYyxDQUFDLFFBQVEsQ0FBQzthQUN4QixhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUNMLGdCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUE7QUFFRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDdkosZUFBTyxVQURpSjtBQUMvSTs7QUNaM0IsQUFDQSw0Q0FENEM7QUFDNUMsMkJBQW1CLGNBQWMsQ0FBQyxDQUFBO0FBQ2xDO0lBQ0ksZ0JBQVksY0FBYyxFQUFFLGtCQUFrQjtRQUMxQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsY0FBYzthQUNiLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDWCxHQUFHLEVBQUUsR0FBRztZQUNSLFdB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cyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbmNsYXNzIEFwcENvbmZpZyB7XG4gICAgY29uc3RydWN0b3IobWFya2VkUHJvdmlkZXIsICRtZFRoZW1pbmdQcm92aWRlcil7XG4gICAgICAgIG1hcmtlZFByb3ZpZGVyLnNldE9wdGlvbnMoe2dmbTogdHJ1ZSwgdGFibGVzOiB0cnVlLCBicmVha3M6IHRydWV9KTtcbiAgICAgICAgXG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGVmYXVsdCcpXG4gICAgICAgIC5wcmltYXJ5UGFsZXR0ZSgnaW5kaWdvJylcbiAgICAgICAgLmFjY2VudFBhbGV0dGUoJ2FtYmVyJyk7XG4gICAgfVxufVxuXG5sZXQgTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3NxaWdnbCcsIFsnbmdNYXRlcmlhbCcsICd1aS5yb3V0ZXInLCAnaGMubWFya2VkJywgJ2FuZ3VsYXIuZmlsdGVyJywgJ2ZpcmViYXNlJ10pLmNvbmZpZyhbJ21hcmtlZFByb3ZpZGVyJywgJyRtZFRoZW1pbmdQcm92aWRlcicsIEFwcENvbmZpZ10pO1xuZXhwb3J0IHtNb2R1bGUgYXMgZGVmYXVsdH07IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxuaW1wb3J0IE1vZHVsZSBmcm9tICcuL2FwcC5tb2R1bGUnO1xuY2xhc3MgUm91dGVyIHtcbiAgICBjb25zdHJ1Y3Rvcigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnd3d3L2hvbWUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdkb2NzJywge1xuICAgICAgICAgICAgdXJsOiAnL2RvY3MvOml0ZW0/JyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnd3d3L2RvY3MuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRG9jc0NvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZG9jcydcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdzcmNkb2NzJywge1xuICAgICAgICAgICAgdXJsOiAnL3NyY2RvY3MvOml0ZW0/JyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnd3d3L3NyY2RvY3MuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU3JjRG9jc0NvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZG9jcydcbiAgICAgICAgfSk7XG4gICAgfVxufVxuTW9kdWxlLmNvbmZpZyhSb3V0ZXIpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbmltcG9ydCBNb2R1bGUgZnJvbSAnLi9hcHAubW9kdWxlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jc0NvbnRyb2xsZXIge1xuICAgIFxufVxuTW9kdWxlLmNvbnRyb2xsZXIoJ0RvY3NDb250cm9sbGVyJywgW0RvY3NDb250cm9sbGVyXSk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxuaW1wb3J0IE1vZHVsZSBmcm9tICcuL2FwcC5tb2R1bGUnO1xuZGVjbGFyZSB2YXIgU1FpZ2dMOiBhbnk7XG5pbnRlcmZhY2UgQXJyYXk8VD4ge1xuICAgIHJlbW92ZShUKTtcbn1cbkFycmF5LnByb3RvdHlwZVsncmVtb3ZlJ10gPSBmdW5jdGlvbihpdGVtKXtcbiAgICB0aGlzLnNwbGljZSh0aGlzLmluZGV4T2YoaXRlbSksIDEpO1xufVxuaW50ZXJmYWNlIElWYXJpYWJsZSB7XG4gICAga2V5OiBzdHJpbmc7XG4gICAgdmFsdWU6IHN0cmluZztcbn1cbmNsYXNzIEhvbWVDb250cm9sbGVyIHtcbiAgICBwdWJsaWMgaW5wdXQ6c3RyaW5nID0gXCJVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgaXMgbm90IG51bGwgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdcIjtcbiAgICBwdWJsaWMgb3V0cHV0OiBzdHJpbmcgPSAnRW50ZXIgeW91ciBxdWVyeSB0byB0aGUgbGVmdCBhbmQgcHJlc3MgRXhlY3V0ZSc7XG4gICAgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlW10gPSBbe2tleTogXCJleGFtcGxlXCIsIHZhbHVlOiBcImRyYWdvblwifV07XG4gICAgcHVibGljIGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgICBwdWJsaWMgZmlyZWJhc2VBcnJheTogQW5ndWxhckZpcmVBcnJheTtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgJGZpcmViYXNlQXJyYXkpe1xuICAgICAgICAvL1BhdGNoIGNvbnNvbGUuZXJyb3IgdG8gc2hvdyBlcnJvcnMgdG8gc2NyZWVuIGFzIHdlbGwuXG4gICAgICAgIGxldCBvcmlnaW5hbENvbnNvbGVFcnJvciA9IGNvbnNvbGUuZXJyb3I7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IgPSAoZXJyb3IsIGFycmF5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgIG9yaWdpbmFsQ29uc29sZUVycm9yLmNhbGwoY29uc29sZSwgZXJyb3IsIGFycmF5KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZmlyZWJhc2VBcnJheSA9ICRmaXJlYmFzZUFycmF5KG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9zcWlnZ2wuZmlyZWJhc2Vpby5jb20vcXVlcmllcycpKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBhcnNlKCkge1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICBsZXQgdmFyaWFibGVzID0ge307XG4gICAgICAgIGZvcihsZXQgdmFyaWFibGUgb2YgdGhpcy52YXJpYWJsZXMpe1xuICAgICAgICAgICAgdmFyaWFibGVzW3ZhcmlhYmxlLmtleV0gPSB2YXJpYWJsZS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgICB0aGlzLm91dHB1dCA9IFNRaWdnTC5wYXJzZSh0aGlzLmlucHV0LCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgdGhpcy5yZXBvcnRRdWVyeSh0aGlzLmlucHV0LCB0aGlzLm91dHB1dCwgdGhpcy5lcnJvcnMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5yZXBvcnRRdWVyeSh0aGlzLmlucHV0LCB0aGlzLm91dHB1dCwgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGFkZFZhcmlhYmxlKCl7XG4gICAgICAgIHRoaXMudmFyaWFibGVzLnB1c2goe2tleTpudWxsLCB2YWx1ZTogbnVsbH0pO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZGVsZXRlVmFyaWFibGUodmFyaWFibGU6IElWYXJpYWJsZSl7XG4gICAgICAgIHRoaXMudmFyaWFibGVzWydyZW1vdmUnXSh2YXJpYWJsZSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZXBvcnRRdWVyeShxdWVyeSwgb3V0cHV0LCBlcnJvcnMpe1xuICAgICAgICB0aGlzLmZpcmViYXNlQXJyYXkuJGFkZCh7cXVlcnk6IHF1ZXJ5LCBvdXRwdXQ6IG91dHB1dCwgZXJyb3JzOiBlcnJvcnN9KTtcbiAgICB9XG4gICAgXG59XG5Nb2R1bGUuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRmaXJlYmFzZUFycmF5JywgSG9tZUNvbnRyb2xsZXJdKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoID1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxuaW1wb3J0IE1vZHVsZSBmcm9tICcuL2FwcC5tb2R1bGUnO1xuXG5pbnRlcmZhY2UgSURvY3Mge1xuICAgIHBhcmVudDogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB1cmw6IHN0cmluZztcbiAgICBzaG93OiBib29sZWFuO1xufVxuY2xhc3MgU3JjRG9jc0NvbnRyb2xsZXIge1xuICAgIHB1YmxpYyBkb2NzOiBJRG9jc1tdID0gW107XG4gICAgY29uc3RydWN0b3IocHVibGljICRodHRwLCBwdWJsaWMgJHN0YXRlUGFyYW1zKXtcbiAgICAgICAgJGh0dHAuZ2V0KCd3d3cvZG9jcy5qc29uJykudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICByZXNwb25zZS5kYXRhLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gaXRlbS5tYXRjaCgvKFxcdyopW1xcXFxcXC9dKFxcdyspKD89XFwubWQpLyk7XG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gbWF0Y2hbMl07XG4gICAgICAgICAgICAgICAgdGhpcy5kb2NzLnB1c2goe3BhcmVudDogcGFyZW50ID09PSAnZG9jcycgPyAnY29yZScgOiBwYXJlbnQsIG5hbWU6IG5hbWUsIHVybDogaXRlbSwgc2hvdzogJHN0YXRlUGFyYW1zLml0ZW0gPT09IG5hbWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNyY2RvY3MgYScpO1xuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZWxlbWVudHMsIChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBocmVmID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmLnJlcGxhY2UoLyMoLiopLywgKG1hdGNoLCAkMSkgPT4gYCMvZG9jcy8keyQxfWApKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbk1vZHVsZS5jb250cm9sbGVyKCdTcmNEb2NzQ29udHJvbGxlcicsIFsnJGh0dHAnLCAnJHN0YXRlUGFyYW1zJywgU3JjRG9jc0NvbnRyb2xsZXJdKTsiXX0=
