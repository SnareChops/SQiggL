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

    it('should correctly output a SQiggL query containing a string literal replacement', () => {
        const result = SQiggL.parse('SELECT * FROM {\'Table\'}');
        result.should.equal('SELECT * FROM Table');
    });

    it('should correctly output a SQiggL query containing a number literal replacement', () => {
        const result = SQiggL.parse('SELECT * FROM Table WHERE ID = {12}');
        result.should.equal('SELECT * FROM Table WHERE ID = 12');
    });

    it('should correctly output a SQiggL query containing a variable replacement', () => {
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

    it('should correctly output a SQiggL query containing a value expression', () => {
        const result = SQiggL.parse('SELECT * FROM {dev ?? prod}', {dev: 'DevTable'});
        result.should.equal('SELECT * FROM DevTable');
    });

    it('should correctly output a SQiggL query containing a coalesce', () => {
        const result = SQiggL.parse('SELECT * FROM {dev ?? prod}', {prod: 'ProdTable'});
        result.should.equal('SELECT * FROM ProdTable');
    });

    it('should correctly output a SQiggL query containing a StartingAction/TerminatingAction pair', () => {
        const result = SQiggL.parse('SELECT * FROM Table {% if 13 > 12 } WHERE status = 1 {% endif }');
        result.should.equal('SELECT * FROM Table  WHERE status = 1 ');
    });

    it('should correctly output a SQiggL query containing a StartingAction, DependentAction, and TerminatingAction chain', () => {
        const result = SQiggL.parse('SELECT * FROM Table {% if 12 > 13 } WHERE status = 1 {% else } WHERE status = 0 {% endif }');
        result.should.equal('SELECT * FROM Table  WHERE status = 0 ');
    });
});

describe('Full feature sweep: ', () => {
    describe('if', () => {
        describe('is null', () => {
            const query = `UPDATE Names {% if example is null } SET Name = 'Cow' {% else } SET Name = '{example}' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {penny: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is not null', () => {
            const query = `UPDATE Names {% if example is not null } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {penny: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is !null', () => {
            const query = `UPDATE Names {% if example is !null } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {penny: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('=', () => {
            const query = `UPDATE Names {% if example = 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('==', () => {
            const query = `UPDATE Names {% if example == 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!=', () => {
            const query = `UPDATE Names {% if example != 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!==', () => {
            const query = `UPDATE Names {% if example !== 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>', () => {
            const query = `UPDATE Names {% if example > 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>=', () => {
            const query = `UPDATE Names {% if example >= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!>', () => {
            const query = `UPDATE Names {% if example !> 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!>=', () => {
            const query = `UPDATE Names {% if example !>= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
        });

        describe('<', () => {
            const query = `UPDATE Names {% if example < 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('<=', () => {
            const query = `UPDATE Names {% if example <= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!<', () => {
            const query = `UPDATE Names {% if example !< 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!<=', () => {
            let query = `UPDATE Names {% if example !<= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc>', () => {
            let query = `UPDATE Names {% if example abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc>=', () => {
            let query = `UPDATE Names {% if example abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc>', () => {
            let query = `UPDATE Names {% if example !abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc>=', () => {
            let query = `UPDATE Names {% if example !abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc<', () => {
            let query = `UPDATE Names {% if example abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc<=', () => {
            let query = `UPDATE Names {% if example abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc<', () => {
            let query = `UPDATE Names {% if example !abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc<=', () => {
            let query = `UPDATE Names {% if example !abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len>', () => {
            let query = `UPDATE Names {% if example len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len>=', () => {
            let query = `UPDATE Names {% if example len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len>', () => {
            let query = `UPDATE Names {% if example !len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len>=', () => {
            let query = `UPDATE Names {% if example !len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len<', () => {
            let query = `UPDATE Names {% if example len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len<=', () => {
            let query = `UPDATE Names {% if example len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len<', () => {
            let query = `UPDATE Names {% if example !len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len<=', () => {
            let query = `UPDATE Names {% if example !len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is NaN', () => {
            let query = `UPDATE Names {% if example is NaN } SET Name = 'Cow' {% else } SET Name = '{example}' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is not NaN', () => {
            let query = `UPDATE Names {% if example is not NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is !NaN', () => {
            let query = `UPDATE Names {% if example is !NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('><', () => {
            let query = `UPDATE Names {% if example 10 >< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 15});
                result.should.equal(`UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the low number', () => {
                const result = SQiggL.parse(query, {example: 10});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the high number', () => {
                const result = SQiggL.parse(query, {example: 20});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if below the low number', () => {
                const result = SQiggL.parse(query, {example: 5});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if above the high number', () => {
                const result = SQiggL.parse(query, {example: 25});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>!<', () => {
            let query = `UPDATE Names {% if example 10 >!< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 15});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the low number', () => {
                const result = SQiggL.parse(query, {example: 10});
                result.should.equal(`UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the high number', () => {
                const result = SQiggL.parse(query, {example: 20});
                result.should.equal(`UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if below the low number', () => {
                const result = SQiggL.parse(query, {example: 5});
                result.should.equal(`UPDATE Names  SET Name = '5'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if above the high number', () => {
                const result = SQiggL.parse(query, {example: 25});
                result.should.equal(`UPDATE Names  SET Name = '25'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>=<', () => {
            let query = `UPDATE Names {% if example 10 >=< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 15});
                result.should.equal(`UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the low number', () => {
                const result = SQiggL.parse(query, {example: 10});
                result.should.equal(`UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the high number', () => {
                const result = SQiggL.parse(query, {example: 20});
                result.should.equal(`UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if below the low number', () => {
                const result = SQiggL.parse(query, {example: 5});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if above the high number', () => {
                const result = SQiggL.parse(query, {example: 25});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

    });

    describe('unless', () => {

        describe('is null', () => {
            let query = `UPDATE Names {% unless example is null } SET Name = '{example}' {% else } SET Name = 'Cow' {% endunless } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {penny: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is not null', () => {
            let query = `UPDATE Names {% unless example is not null } SET Name = 'Cow' {% else } SET Name = '{example}' {% endunless } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {penny: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is !null', () => {
            let query = `UPDATE Names {% unless example is !null } SET Name = 'Cow' {% else } SET Name = '{example}' {% endunless } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {penny: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('=', () => {
            let query = `UPDATE Names {% if example = 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('==', () => {
            let query = `UPDATE Names {% if example == 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!=', () => {
            let query = `UPDATE Names {% if example != 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!==', () => {
            let query = `UPDATE Names {% if example !== 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>', () => {
            let query = `UPDATE Names {% if example > 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>=', () => {
            let query = `UPDATE Names {% if example >= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!>', () => {
            let query = `UPDATE Names {% if example !> 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!>=', () => {
            let query = `UPDATE Names {% if example !>= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
        });

        describe('<', () => {
            let query = `UPDATE Names {% if example < 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('<=', () => {
            let query = `UPDATE Names {% if example <= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!<', () => {
            let query = `UPDATE Names {% if example !< 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!<=', () => {
            let query = `UPDATE Names {% if example !<= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '9'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '14'});
                result.should.equal(`UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc>', () => {
            let query = `UPDATE Names {% if example abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc>=', () => {
            let query = `UPDATE Names {% if example abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc>', () => {
            let query = `UPDATE Names {% if example !abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc>=', () => {
            let query = `UPDATE Names {% if example !abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc<', () => {
            let query = `UPDATE Names {% if example abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('abc<=', () => {
            let query = `UPDATE Names {% if example abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc<', () => {
            let query = `UPDATE Names {% if example !abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!abc<=', () => {
            let query = `UPDATE Names {% if example !abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'awkward'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'hello'});
                result.should.equal(`UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len>', () => {
            let query = `UPDATE Names {% if example len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len>=', () => {
            let query = `UPDATE Names {% if example len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len>', () => {
            let query = `UPDATE Names {% if example !len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len>=', () => {
            let query = `UPDATE Names {% if example !len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len<', () => {
            let query = `UPDATE Names {% if example len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('len<=', () => {
            let query = `UPDATE Names {% if example len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len<', () => {
            let query = `UPDATE Names {% if example !len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
        });

        describe('!len<=', () => {
            let query = `UPDATE Names {% if example !len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'fun'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                const result = SQiggL.parse(query, {example: 'sqiggl'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'palooza'});
                result.should.equal(`UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is NaN', () => {
            let query = `UPDATE Names {% if example is NaN } SET Name = 'Cow' {% else } SET Name = '{example}' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is not NaN', () => {
            let query = `UPDATE Names {% if example is not NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('is !NaN', () => {
            let query = `UPDATE Names {% if example is !NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: '12'});
                result.should.equal(`UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                const result = SQiggL.parse(query, {example: 'dragon'});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('><', () => {
            let query = `UPDATE Names {% if example 10 >< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 15});
                result.should.equal(`UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the low number', () => {
                const result = SQiggL.parse(query, {example: 10});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the high number', () => {
                const result = SQiggL.parse(query, {example: 20});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if below the low number', () => {
                const result = SQiggL.parse(query, {example: 5});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if above the high number', () => {
                const result = SQiggL.parse(query, {example: 25});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>!<', () => {
            let query = `UPDATE Names {% if example 10 >!< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 15});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the low number', () => {
                const result = SQiggL.parse(query, {example: 10});
                result.should.equal(`UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the high number', () => {
                const result = SQiggL.parse(query, {example: 20});
                result.should.equal(`UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if below the low number', () => {
                const result = SQiggL.parse(query, {example: 5});
                result.should.equal(`UPDATE Names  SET Name = '5'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if above the high number', () => {
                const result = SQiggL.parse(query, {example: 25});
                result.should.equal(`UPDATE Names  SET Name = '25'  WHERE Name = 'Awesome'`);
            });
        });

        describe('>=<', () => {
            let query = `UPDATE Names {% if example 10 >=< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                const result = SQiggL.parse(query, {example: 15});
                result.should.equal(`UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the low number', () => {
                const result = SQiggL.parse(query, {example: 10});
                result.should.equal(`UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal to the high number', () => {
                const result = SQiggL.parse(query, {example: 20});
                result.should.equal(`UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if below the low number', () => {
                const result = SQiggL.parse(query, {example: 5});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if above the high number', () => {
                const result = SQiggL.parse(query, {example: 25});
                result.should.equal(`UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
    });

    describe('"query with newlines"', () => {
        it('should accept newlines in queries', () => {
            const sql = `UPDATE Names
{% if example is not null }
SET Name = '{example}'
{% else } SET Name = 'Cow'
{% endif }
WHERE Name = 'Awesome'`;
            const result = `UPDATE Names

SET Name = 'Dragon'

WHERE Name = 'Awesome'`;
            const actual = SQiggL.parse(sql, {example: 'Dragon'});
            actual.should.equal(result);
        });
    });
});