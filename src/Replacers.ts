import IReplacerDefinition from './replacers/IReplacerDefinition';
import Replacer from './replacers/Replacer';
import IVariables from './IVariables';

let VariableDefinition: IReplacerDefinition = {
    regex: /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g,
    rule: (definition: IReplacerDefinition, text: string, variables: IVariables): string => text.replace(definition.regex, (match, $1, $2) => $1+variables[$2])
}
export let Variable = new Replacer(VariableDefinition);

export {default as IReplacerDefinition} from './replacers/IReplacerDefinition';
export {default as Replacer} from './replacers/Replacer';