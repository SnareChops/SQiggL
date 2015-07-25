export default class ActionResult {
    public dependent: ActionResult;
    constructor(public text: string, public passed?: boolean){}
}