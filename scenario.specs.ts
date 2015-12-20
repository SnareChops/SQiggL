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
        const result = SQiggL.parse('SELECT * FROM Table {# this is the client\'s table}', null, {exportComments: true});
        result.should.equal('SELECT * FROM Table /* this is the client\'s table */');
    });

    xit('should correctly output a SQiggL query containing a string literal replacement', () => {
        const result = SQiggL.parse('SELECT * FROM {\'Table\'}');
        result.should.equal('SELECT * FROM Table');
    });

    xit('should correctly output a SQiggL query containing a number literal replacement', () => {
        const result = SQiggL.parse('SELECT * FROM Table WHERE ID = {12}');
        result.should.equal('SELECT * FROM Table WHERE ID = 12');
    });

    xit('should correctly output a SQiggL query containing a variable replacement', () => {
        const result = SQiggL.parse('SELECT * FROM Table WHERE ID = {id}', {id: 12});
        result.should.equal('SELECT * FROM Table WHERE ID = 12');
    });

    it('should correctly output a SQiggL query containing a boolean expression with numbers', () => {
        const result = SQiggL.parse('SELECT * FROM Table WHERE status = {12 > 13}');
        result.should.equal('SELECT * FROM Table WHERE status = 0');
    });

    it('should correctly output a SQiggL query containing a boolean expression with strings', () => {
        const result = SQiggL.parse('SELECT * FROM Table WHERE status = {\'yes\' abc> \'no\'}');
        result.should.equal('SELECT * FROM Table WHERE status = 1');
    });
});