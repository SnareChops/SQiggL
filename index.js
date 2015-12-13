var lexer_1 = require('./src/lexer');
var parser_1 = require('./src/parser');
function parse(query, options, actions, expressions, modifiers) {
    var lexer = new lexer_1.Lexer(options, actions, expressions, modifiers);
    var dsl = lexer.parse(query);
    var parser = new parser_1.Parser(options);
    return parser.parse(dsl);
}
var SQiggL = { parse: parse };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SQiggL;
