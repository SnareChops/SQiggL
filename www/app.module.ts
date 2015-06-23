/// <reference path="../typings/tsd.d.ts" />
class AppConfig {
    constructor(markedProvider){
        markedProvider.setOptions({gfm: true, tables: true, breaks: true});
    }
}

let Module = angular.module('sqiggl', ['ngMaterial', 'ui.router', 'hc.marked']).config(['markedProvider', AppConfig]);
export {Module as default};