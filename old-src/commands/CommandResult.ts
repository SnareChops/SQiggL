
export default class CommandResult {
    public dependent: CommandResult;
    constructor(public text: string, public passed?: boolean){}
}