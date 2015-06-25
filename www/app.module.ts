/// <reference path="../typings/tsd.d.ts" />
class AppConfig {
    constructor(markedProvider, $mdThemingProvider){
        markedProvider.setOptions({gfm: true, tables: true, breaks: true});
        
        $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('amber');
    }
}

let Module = angular.module('sqiggl', ['ngMaterial', 'ui.router', 'hc.marked', 'angular.filter', 'firebase']).config(['markedProvider', '$mdThemingProvider', AppConfig]);
export {Module as default};