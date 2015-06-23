/// <reference path ="../typings/tsd.d.ts" />
import Module from './app.module';

interface IDocs {
    parent: string;
    name: string;
    url: string;
    show: boolean;
}
class DocsController {
    public docs: IDocs[] = [];
    constructor(public $http, public $stateParams){
        $http.get('www/docs.json').then(response => {
            response.data.forEach(item => {
                let match = item.match(/(\w*)[\\\/](\w+)(?=\.md)/);
                let parent = match[1];
                let name = match[2];
                this.docs.push({parent: parent === 'docs' ? 'core' : parent, name: name, url: item, show: $stateParams.item === name});
            });
            setTimeout(() => {
                let elements = document.querySelectorAll('.docs a');
                Array.prototype.forEach.call(elements, (element) => {
                    let href = element.getAttribute('href');
                    element.setAttribute('href', href.replace(/#(.*)/, (match, $1) => `#/docs/${$1}`));
                });
            }, 500);
        });
    }
    
    public openDoc(doc, $event){
        $event.target.next().slideToggle(1000);
        doc.slideToggle(1000);
    }
}
Module.controller('DocsController', ['$http', '$stateParams', DocsController]);