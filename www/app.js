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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwLm1vZHVsZS50cyIsInd3dy9hcHAucm91dGVzLnRzIiwid3d3L2RvY3MuY29udHJvbGxlci50cyIsInd3dy9ob21lLmNvbnRyb2xsZXIudHMiLCJ3d3cvc3JjZG9jcy5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsQUFDQSw0Q0FENEM7O0lBRXhDLG1CQUFZLGNBQWMsRUFBRSxrQkFBa0I7UUFDMUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUVuRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO2FBQ2xDLGNBQWMsQ0FBQyxRQUFRLENBQUM7YUFDeEIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDTCxnQkFBQztBQUFELENBUkEsQUFRQyxJQUFBO0FBRUQsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZKLGVBQU8sVUFEaUo7QUFDL0k7O0FDWjNCLEFBQ0EsNENBRDRDO0FBQzVDLDJCQUFtQixjQUFjLENBQUMsQ0FBQTtBQUNsQztJQUNJLGdCQUFZLGNBQWMsRUFBRSxrQkFBa0I7UUFDMUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLGNBQWM7YUFDYixLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1gsR0FBRyxFQUFFLEdBQUc7WUFDUixX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anMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG5jbGFzcyBBcHBDb25maWcge1xuICAgIGNvbnN0cnVjdG9yKG1hcmtlZFByb3ZpZGVyLCAkbWRUaGVtaW5nUHJvdmlkZXIpe1xuICAgICAgICBtYXJrZWRQcm92aWRlci5zZXRPcHRpb25zKHtnZm06IHRydWUsIHRhYmxlczogdHJ1ZSwgYnJlYWtzOiB0cnVlfSk7XG4gICAgICAgIFxuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RlZmF1bHQnKVxuICAgICAgICAucHJpbWFyeVBhbGV0dGUoJ2luZGlnbycpXG4gICAgICAgIC5hY2NlbnRQYWxldHRlKCdhbWJlcicpO1xuICAgIH1cbn1cblxubGV0IE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdzcWlnZ2wnLCBbJ25nTWF0ZXJpYWwnLCAndWkucm91dGVyJywgJ2hjLm1hcmtlZCcsICdhbmd1bGFyLmZpbHRlcicsICdmaXJlYmFzZSddKS5jb25maWcoWydtYXJrZWRQcm92aWRlcicsICckbWRUaGVtaW5nUHJvdmlkZXInLCBBcHBDb25maWddKTtcbmV4cG9ydCB7TW9kdWxlIGFzIGRlZmF1bHR9OyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbmltcG9ydCBNb2R1bGUgZnJvbSAnLi9hcHAubW9kdWxlJztcbmNsYXNzIFJvdXRlciB7XG4gICAgY29uc3RydWN0b3IoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnZG9jcycsIHtcbiAgICAgICAgICAgIHVybDogJy9kb2NzLzppdGVtPycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9kb2NzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0RvY3NDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2RvY3MnXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3JjZG9jcycsIHtcbiAgICAgICAgICAgIHVybDogJy9zcmNkb2NzLzppdGVtPycsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3d3dy9zcmNkb2NzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1NyY0RvY3NDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2RvY3MnXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbk1vZHVsZS5jb25maWcoUm91dGVyKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG5pbXBvcnQgTW9kdWxlIGZyb20gJy4vYXBwLm1vZHVsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY3NDb250cm9sbGVyIHtcbiAgICBcbn1cbk1vZHVsZS5jb250cm9sbGVyKCdEb2NzQ29udHJvbGxlcicsIFtEb2NzQ29udHJvbGxlcl0pOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbmltcG9ydCBNb2R1bGUgZnJvbSAnLi9hcHAubW9kdWxlJztcbmRlY2xhcmUgdmFyIFNRaWdnTDogYW55O1xuaW50ZXJmYWNlIEFycmF5PFQ+IHtcbiAgICByZW1vdmUoVCk7XG59XG5BcnJheS5wcm90b3R5cGVbJ3JlbW92ZSddID0gZnVuY3Rpb24oaXRlbSl7XG4gICAgdGhpcy5zcGxpY2UodGhpcy5pbmRleE9mKGl0ZW0pLCAxKTtcbn1cbmludGVyZmFjZSBJVmFyaWFibGUge1xuICAgIGtleTogc3RyaW5nO1xuICAgIHZhbHVlOiBzdHJpbmc7XG59XG5jbGFzcyBIb21lQ29udHJvbGxlciB7XG4gICAgcHVibGljIGlucHV0OnN0cmluZyA9IFwiVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGlzIG5vdCBudWxsICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnXCI7XG4gICAgcHVibGljIG91dHB1dDogc3RyaW5nID0gJ0VudGVyIHlvdXIgcXVlcnkgdG8gdGhlIGxlZnQgYW5kIHByZXNzIEV4ZWN1dGUnO1xuICAgIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZVtdID0gW3trZXk6IFwiZXhhbXBsZVwiLCB2YWx1ZTogXCJkcmFnb25cIn1dO1xuICAgIHB1YmxpYyBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gICAgcHVibGljIGZpcmViYXNlQXJyYXk6IEFuZ3VsYXJGaXJlQXJyYXk7XG4gICAgY29uc3RydWN0b3IocHVibGljICRmaXJlYmFzZUFycmF5KXtcbiAgICAgICAgLy9QYXRjaCBjb25zb2xlLmVycm9yIHRvIHNob3cgZXJyb3JzIHRvIHNjcmVlbiBhcyB3ZWxsLlxuICAgICAgICBsZXQgb3JpZ2luYWxDb25zb2xlRXJyb3IgPSBjb25zb2xlLmVycm9yO1xuICAgICAgICBjb25zb2xlLmVycm9yID0gKGVycm9yLCBhcnJheSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICBvcmlnaW5hbENvbnNvbGVFcnJvci5jYWxsKGNvbnNvbGUsIGVycm9yLCBhcnJheSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB0aGlzLmZpcmViYXNlQXJyYXkgPSAkZmlyZWJhc2VBcnJheShuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vc3FpZ2dsLmZpcmViYXNlaW8uY29tL3F1ZXJpZXMnKSk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZSgpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgbGV0IHZhcmlhYmxlcyA9IHt9O1xuICAgICAgICBmb3IobGV0IHZhcmlhYmxlIG9mIHRoaXMudmFyaWFibGVzKXtcbiAgICAgICAgICAgIHZhcmlhYmxlc1t2YXJpYWJsZS5rZXldID0gdmFyaWFibGUudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdGhpcy5vdXRwdXQgPSBTUWlnZ0wucGFyc2UodGhpcy5pbnB1dCwgdmFyaWFibGVzKTtcbiAgICAgICAgICAgIHRoaXMucmVwb3J0UXVlcnkodGhpcy5pbnB1dCwgdGhpcy5vdXRwdXQsIHRoaXMuZXJyb3JzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3J0UXVlcnkodGhpcy5pbnB1dCwgdGhpcy5vdXRwdXQsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBhZGRWYXJpYWJsZSgpe1xuICAgICAgICB0aGlzLnZhcmlhYmxlcy5wdXNoKHtrZXk6bnVsbCwgdmFsdWU6IG51bGx9KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGRlbGV0ZVZhcmlhYmxlKHZhcmlhYmxlOiBJVmFyaWFibGUpe1xuICAgICAgICB0aGlzLnZhcmlhYmxlc1sncmVtb3ZlJ10odmFyaWFibGUpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwb3J0UXVlcnkocXVlcnksIG91dHB1dCwgZXJyb3JzKXtcbiAgICAgICAgdGhpcy5maXJlYmFzZUFycmF5LiRhZGQoe3F1ZXJ5OiBxdWVyeSwgb3V0cHV0OiBvdXRwdXQsIGVycm9yczogZXJyb3JzfSk7XG4gICAgfVxuICAgIFxufVxuTW9kdWxlLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckZmlyZWJhc2VBcnJheScsIEhvbWVDb250cm9sbGVyXSk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aCA9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbmltcG9ydCBNb2R1bGUgZnJvbSAnLi9hcHAubW9kdWxlJztcblxuaW50ZXJmYWNlIElEb2NzIHtcbiAgICBwYXJlbnQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgc2hvdzogYm9vbGVhbjtcbn1cbmNsYXNzIFNyY0RvY3NDb250cm9sbGVyIHtcbiAgICBwdWJsaWMgZG9jczogSURvY3NbXSA9IFtdO1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyAkaHR0cCwgcHVibGljICRzdGF0ZVBhcmFtcyl7XG4gICAgICAgICRodHRwLmdldCgnd3d3L2RvY3MuanNvbicpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGl0ZW0ubWF0Y2goLyhcXHcqKVtcXFxcXFwvXShcXHcrKSg/PVxcLm1kKS8pO1xuICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgICAgIHRoaXMuZG9jcy5wdXNoKHtwYXJlbnQ6IHBhcmVudCA9PT0gJ2RvY3MnID8gJ2NvcmUnIDogcGFyZW50LCBuYW1lOiBuYW1lLCB1cmw6IGl0ZW0sIHNob3c6ICRzdGF0ZVBhcmFtcy5pdGVtID09PSBuYW1lfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zcmNkb2NzIGEnKTtcbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsZW1lbnRzLCAoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaHJlZiA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZi5yZXBsYWNlKC8jKC4qKS8sIChtYXRjaCwgJDEpID0+IGAjL2RvY3MvJHskMX1gKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5Nb2R1bGUuY29udHJvbGxlcignU3JjRG9jc0NvbnRyb2xsZXInLCBbJyRodHRwJywgJyRzdGF0ZVBhcmFtcycsIFNyY0RvY3NDb250cm9sbGVyXSk7Il19
