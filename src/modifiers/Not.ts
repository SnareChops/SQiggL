import IVariables from '../IVariables';
export default class Not {
    public static identifiers: string[] = ['!', 'not\\s*', 'is\\s+not\\s*'];
    constructor(){
        
    }
    
    public perform(result: boolean, variable: string, variables: IVariables, comparative: string): boolean{
        return !result;
    }
}