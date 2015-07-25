import IRunnerDefinition from './runners/IRunnerDefinition';
import Runner from './runners/Runner';
import {Action, If, Else, EndIf} from './Actions';
import {Replacer, Variable} from './Replacers';

let ActionRunnerDefinition: IRunnerDefinition = {
    regex: /{{%(.*?)%}}([\s\S]*?)?(?=(?:{{%|$))/gm,
    actions: [If, Else, EndIf],
    replacers: [Variable]
}
export let ActionRunner = new Runner(ActionRunnerDefinition);

export {default as IRunnerDefinition} from './runners/IRunnerDefinition';
export {default as RunnerResult} from './runners/RunnerResult';
export {default as Runner} from './runners/Runner';