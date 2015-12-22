var index_1 = require('./index');
describe('Scenarios', function () {
    it('should correctly output a completely non-special query untouched', function () {
        var result = index_1.default.parse('SELECT * FROM Table');
        result.should.equal('SELECT * FROM Table');
    });
    it('should correctly output a SQiggL query containing a comment (default)', function () {
        var result = index_1.default.parse('SELECT * FROM Table {# this is the client\'s table}');
        result.should.equal('SELECT * FROM Table ');
    });
    it('should correctly output a SQiggL query containing a comment (export true)', function () {
        var result = index_1.default.parse('SELECT * FROM Table {# this is the client\'s table}', null, { exportComments: true });
        result.should.equal('SELECT * FROM Table /* this is the client\'s table */');
    });
    it('should correctly output a SQiggL query containing a string literal replacement', function () {
        var result = index_1.default.parse('SELECT * FROM {\'Table\'}');
        result.should.equal('SELECT * FROM Table');
    });
    it('should correctly output a SQiggL query containing a number literal replacement', function () {
        var result = index_1.default.parse('SELECT * FROM Table WHERE ID = {12}');
        result.should.equal('SELECT * FROM Table WHERE ID = 12');
    });
    it('should correctly output a SQiggL query containing a variable replacement', function () {
        var result = index_1.default.parse('SELECT * FROM Table WHERE ID = {id}', { id: 12 });
        result.should.equal('SELECT * FROM Table WHERE ID = 12');
    });
    it('should correctly output a SQiggL query containing a boolean expression with numbers', function () {
        var result = index_1.default.parse('SELECT * FROM Table WHERE status = {12 > 13}');
        result.should.equal('SELECT * FROM Table WHERE status = 0');
    });
    it('should correctly output a SQiggL query containing a boolean expression with strings', function () {
        var result = index_1.default.parse('SELECT * FROM Table WHERE status = {\'yes\' abc> \'no\'}');
        result.should.equal('SELECT * FROM Table WHERE status = 1');
    });
});
