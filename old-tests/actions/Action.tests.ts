/// <reference path="../../typings/tsd.d.ts" />
// import {Action, IActionDefinition, CommandResult} from '../../src/Actions';

// let testActionDefinition: IActionDefinition = {
//     regex: /^this\s+is\s+a\s+test/i,
//     conditions: [],
//     dependents: [],
//     terminator: false,
//     rule: (command, condition, prev): ActionResult => {
//         return new ActionResult(command.inner, true);
//     }
// }
// let testAction: Action = new Action(testActionDefinition);

// describe('An Action', () => {
//     it('should store it\'s definition', () => expect(testAction.definition).toEqual(testActionDefinition));
//     it('should match a statement with the correct text', () => expect(testAction.matches('this is a test')).toBe(true));
//     it('should not matcha a statement with the wrong text', () => expect(testAction.matches('something else')).toBe(false));
// });