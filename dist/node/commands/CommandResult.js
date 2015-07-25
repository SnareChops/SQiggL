var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Runners_1 = require('../Runners');
var CommandResult = (function (_super) {
    __extends(CommandResult, _super);
    function CommandResult() {
        _super.apply(this, arguments);
    }
    return CommandResult;
})(Runners_1.RunnerResult);
exports.default = CommandResult;
