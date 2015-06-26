/// <reference path="../typings/tsd.d.ts" />
import Module from './app.module';
declare var SQiggL: any;
interface Array<T> {
    remove(T);
}
Array.prototype['remove'] = function(item){
    this.splice(this.indexOf(item), 1);
}
interface IVariable {
    key: string;
    value: string;
}
class HomeController {
    public input:string = "UPDATE Names {{% if example is not null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
    public output: string = 'Enter your query to the left and press Execute';
    public variables: IVariable[] = [{key: "example", value: "dragon"}];
    public errors: string[] = [];
    public firebaseArray: AngularFireArray;
    constructor(public $firebaseArray){
        //Patch console.error to show errors to screen as well.
        let originalConsoleError = console.error;
        console.error = (error, array) => {
            this.errors.push(error);
            originalConsoleError.call(console, error, array);
        };
        
        this.firebaseArray = $firebaseArray(new Firebase('https://sqiggl.firebaseio.com/queries'));
    }
    
    public parse() {
        this.errors = [];
        let variables = {};
        for(let variable of this.variables){
            variables[variable.key] = variable.value;
        }
        try{
            this.output = SQiggL.parse(this.input, variables);
            this.reportQuery(this.input, this.output, this.errors);
        }
        catch (error) {
            this.reportQuery(this.input, this.output, error);
            throw error;
        }
    }
    
    public addVariable(){
        this.variables.push({key:null, value: null});
    }
    
    public deleteVariable(variable: IVariable){
        this.variables['remove'](variable);
    }
    
    public reportQuery(query, output, errors){
        this.firebaseArray.$add({query: query, output: output, errors: errors});
    }
    
}
Module.controller('HomeController', ['$firebaseArray', HomeController]);