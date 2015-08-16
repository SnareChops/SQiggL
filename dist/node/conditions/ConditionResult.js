var Value_1 = require('../Value');
var ConditionResult = (function () {
    function ConditionResult() {
        this.value = [];
        this.modifier = [];
    }
    ConditionResult.prototype.set = function (prop, value, index) {
        if (this[prop] instanceof Array) {
            if (index)
                this[prop][index] = prop === 'value' ? new Value_1.default(value) : value;
            else
                this[prop].push(prop === 'value' ? new Value_1.default(value) : value);
        }
        else
            this[prop] = prop === 'value' ? new Value_1.default(value) : value;
    };
    return ConditionResult;
})();
exports.default = ConditionResult;
