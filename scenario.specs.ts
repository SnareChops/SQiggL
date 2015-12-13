import SQiggL from './index';

describe('Scenarios', () => {
    it('should correctly output a completely non-special query untouched', () => {
        const result = SQiggL.parse('SELECT * FROM Table');
        result.should.equal('SELECT * FROM Table');
    });

    it('should correctly output a SQiggL query containing a comment (default)', () => {
        const result = SQiggL.parse('SELECT * FROM Table {# this is the client\'s table}');
        result.should.equal('SELECT * FROM Table ');
    });

    it('should correctly output a SQiggL query containing a comment (export true)', () => {
        const result = SQiggL.parse('SELECT * FROM Table {# this is the client\'s table}', {exportComments: true});
        result.should.equal('SELECT * FROM Table /* this is the client\'s table */');
    });
});