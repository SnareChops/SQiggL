var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Actions_1 = require('../Actions');
var RunnerResult = (function (_super) {
    __extends(RunnerResult, _super);
    function RunnerResult() {
        _super.apply(this, arguments);
    }
    return RunnerResult;
})(Actions_1.ActionResult);
exports.default = RunnerResult;
