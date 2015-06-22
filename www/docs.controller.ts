/// <reference path ="../typings/tsd.d.ts" />
import Module from './app.module';

class DocsController {
    public docs: string[];
    constructor(public $http){
        $http.get('www/docs.json').then(response => this.docs = response.data);
    }
}
Module.controller('DocsController', ['$http', DocsController]);