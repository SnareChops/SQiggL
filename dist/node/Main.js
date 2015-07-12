var Parser_1 = require('./Parser');
/**
 * The starting point of the entire SQiggL parser
 * @function
 * @param {string} sql              - The SQL query to run SQiggL against
 * @param {IVariables?} variables   - Optional collection of variables for your SQiggL query
 * @return {string}                 - The fully parsed SQL query
 */
function parse(sql, variables) {
    var parser = new Parser_1.default(sql, variables);
    return parser.parse();
}
exports.parse = parse;
