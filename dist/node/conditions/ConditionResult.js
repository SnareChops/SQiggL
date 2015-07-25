var ConditionResult = (function () {
    function ConditionResult() {
        this.modifier = [];
    }
    ConditionResult.prototype.set = function (prop, value) {
        if (this[prop] instanceof Array)
            this[prop].push(value);
        else
            this[prop] = value;
    };
    return ConditionResult;
})();
exports.default = ConditionResult;
