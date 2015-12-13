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
        var result = index_1.default.parse('SELECT * FROM Table {# this is the client\'s table}', { exportComments: true });
        result.should.equal('SELECT * FROM Table /* this is the client\'s table */');
    });
});
