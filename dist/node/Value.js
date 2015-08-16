var ValueType_1 = require('./ValueType');
var Value = (function () {
    function Value(item) {
        if (/("|')[\w\d]+(\1)/.test(item)) {
            this.type = ValueType_1.default.string;
            this.value = item.substr(1, item.length - 2);
        }
        else if (!isNaN(item)) {
            this.type = ValueType_1.default.number;
            this.value = parseFloat(item);
        }
        else {
            this.type = ValueType_1.default.variable;
            this.value = item;
        }
    }
    Value.prototype.evaluate = function (variables) {
        return this.type === ValueType_1.default.variable ? isNaN(variables[this.value]) ? variables[this.value] : parseFloat(variables[this.value]) : this.value;
    };
    return Value;
})();
exports.default = Value;
