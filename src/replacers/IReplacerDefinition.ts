import IVariables from '../IVariables';

interface IReplacerDefinition {
    regex: RegExp;
    rule: (definition: IReplacerDefinition, text: string, variables: IVariables) => string;
}
export default IReplacerDefinition;