interface ICondition {
    //static regex: RegExp;
    //static modifiers: IModifier[];
	//static create(statement: string): ICondition;
	perform():boolean;
}
export default ICondition;