export interface ICondition {
	//static create(statement: string): ICondition;
	perform():boolean;
}