/// <reference path="IVariables.ts" />

import Command from './Command';

export default class CommandScope {
	public variables: IVariables;
	public commands: Command[];
	public dependants: Command[];
}