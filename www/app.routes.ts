/// <reference path="../typings/tsd.d.ts" />
import Module from './app.module';
class Router {
    constructor($stateProvider, $urlRouterProvider){
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
            controllerAs: 'docs',
            
        });
    }
}
Module.config(Router);