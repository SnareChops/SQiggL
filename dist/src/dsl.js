(function (DSLType) {
    DSLType[DSLType["text"] = 0] = "text";
    DSLType[DSLType["variable"] = 1] = "variable";
    DSLType[DSLType["replacement"] = 2] = "replacement";
    DSLType[DSLType["command"] = 3] = "command";
    DSLType[DSLType["comment"] = 4] = "comment";
})(exports.DSLType || (exports.DSLType = {}));
var DSLType = exports.DSLType;
(function (DSLVariableType) {
    DSLVariableType[DSLVariableType["key"] = 0] = "key";
    DSLVariableType[DSLVariableType["value"] = 1] = "value";
})(exports.DSLVariableType || (exports.DSLVariableType = {}));
var DSLVariableType = exports.DSLVariableType;
