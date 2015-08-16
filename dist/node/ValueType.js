var ValueType;
(function (ValueType) {
    ValueType[ValueType["string"] = 0] = "string";
    ValueType[ValueType["number"] = 1] = "number";
    ValueType[ValueType["variable"] = 2] = "variable";
})(ValueType || (ValueType = {}));
exports.default = ValueType;
