function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/// <reference path="IVariable.ts" />
__export(require('./Actions'));
__export(require('./Conditions'));
var Command_1 = require('./Command');
exports.variables = [];
function parse(sql, variables) {
    variables = variables;
    console.log(extractCommands(sql));
}
exports.parse = parse;
function extractCommands(sql) {
    var match, commands = [];
    while ((match = Command_1.default.regex.exec(sql)) != null) {
        commands.push(new Command_1.default(match[1], match[2]));
    }
    return commands;
}
exports.extractCommands = extractCommands;
