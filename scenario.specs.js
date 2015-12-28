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
    it('should correctly output a SQiggL query containing a StartingAction/TerminatingAction pair', function () {
        var result = index_1.default.parse('SELECT * FROM Table {% if 13 > 12 } WHERE status = 1 {% endif }');
        result.should.equal('SELECT * FROM Table  WHERE status = 1 ');
    });
    it('should correctly output a SQiggL query containing a StartingAction, DependentAction, and TerminatingAction chain', function () {
        var result = index_1.default.parse('SELECT * FROM Table {% if 12 > 13 } WHERE status = 1 {% else } WHERE status = 0 {% endif }');
        result.should.equal('SELECT * FROM Table  WHERE status = 0 ');
    });
});
describe('Full feature sweep: ', function () {
    describe('if', function () {
        describe('is null', function () {
            var query = "UPDATE Names {% if example is null } SET Name = 'Cow' {% else } SET Name = '{example}' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { penny: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
        });
        describe('is not null', function () {
            var query = "UPDATE Names {% if example is not null } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { penny: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('is !null', function () {
            var query = "UPDATE Names {% if example is !null } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { penny: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('=', function () {
            var query = "UPDATE Names {% if example = 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('==', function () {
            var query = "UPDATE Names {% if example == 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!=', function () {
            var query = "UPDATE Names {% if example != 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('!==', function () {
            var query = "UPDATE Names {% if example !== 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('>', function () {
            var query = "UPDATE Names {% if example > 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('>=', function () {
            var query = "UPDATE Names {% if example >= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!>', function () {
            var query = "UPDATE Names {% if example !> 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
        });
        describe('!>=', function () {
            var query = "UPDATE Names {% if example !>= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
        });
        describe('<', function () {
            var query = "UPDATE Names {% if example < 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('<=', function () {
            var query = "UPDATE Names {% if example <= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!<', function () {
            var query = "UPDATE Names {% if example !< 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('!<=', function () {
            var query = "UPDATE Names {% if example !<= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc>', function () {
            var query = "UPDATE Names {% if example abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc>=', function () {
            var query = "UPDATE Names {% if example abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc>', function () {
            var query = "UPDATE Names {% if example !abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc>=', function () {
            var query = "UPDATE Names {% if example !abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc<', function () {
            var query = "UPDATE Names {% if example abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc<=', function () {
            var query = "UPDATE Names {% if example abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc<', function () {
            var query = "UPDATE Names {% if example !abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc<=', function () {
            var query = "UPDATE Names {% if example !abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
        });
        describe('len>', function () {
            var query = "UPDATE Names {% if example len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('len>=', function () {
            var query = "UPDATE Names {% if example len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len>', function () {
            var query = "UPDATE Names {% if example !len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len>=', function () {
            var query = "UPDATE Names {% if example !len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
        });
        describe('len<', function () {
            var query = "UPDATE Names {% if example len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('len<=', function () {
            var query = "UPDATE Names {% if example len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len<', function () {
            var query = "UPDATE Names {% if example !len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len<=', function () {
            var query = "UPDATE Names {% if example !len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
        });
        describe('is NaN', function () {
            var query = "UPDATE Names {% if example is NaN } SET Name = 'Cow' {% else } SET Name = '{example}' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
        });
        describe('is not NaN', function () {
            var query = "UPDATE Names {% if example is not NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('is !NaN', function () {
            var query = "UPDATE Names {% if example is !NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('><', function () {
            var query = "UPDATE Names {% if example 10 >< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 15 });
                result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                var result = index_1.default.parse(query, { example: 10 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                var result = index_1.default.parse(query, { example: 20 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                var result = index_1.default.parse(query, { example: 5 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                var result = index_1.default.parse(query, { example: 25 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('>!<', function () {
            var query = "UPDATE Names {% if example 10 >!< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 15 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                var result = index_1.default.parse(query, { example: 10 });
                result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                var result = index_1.default.parse(query, { example: 20 });
                result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                var result = index_1.default.parse(query, { example: 5 });
                result.should.equal("UPDATE Names  SET Name = '5'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                var result = index_1.default.parse(query, { example: 25 });
                result.should.equal("UPDATE Names  SET Name = '25'  WHERE Name = 'Awesome'");
            });
        });
        describe('>=<', function () {
            var query = "UPDATE Names {% if example 10 >=< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 15 });
                result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                var result = index_1.default.parse(query, { example: 10 });
                result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                var result = index_1.default.parse(query, { example: 20 });
                result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                var result = index_1.default.parse(query, { example: 5 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                var result = index_1.default.parse(query, { example: 25 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
    });
    describe('unless', function () {
        describe('is null', function () {
            var query = "UPDATE Names {% unless example is null } SET Name = '{example}' {% else } SET Name = 'Cow' {% endunless } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { penny: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
        });
        describe('is not null', function () {
            var query = "UPDATE Names {% unless example is not null } SET Name = 'Cow' {% else } SET Name = '{example}' {% endunless } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { penny: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('is !null', function () {
            var query = "UPDATE Names {% unless example is !null } SET Name = 'Cow' {% else } SET Name = '{example}' {% endunless } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { penny: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('=', function () {
            var query = "UPDATE Names {% if example = 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('==', function () {
            var query = "UPDATE Names {% if example == 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!=', function () {
            var query = "UPDATE Names {% if example != 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('!==', function () {
            var query = "UPDATE Names {% if example !== 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('>', function () {
            var query = "UPDATE Names {% if example > 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('>=', function () {
            var query = "UPDATE Names {% if example >= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!>', function () {
            var query = "UPDATE Names {% if example !> 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
        });
        describe('!>=', function () {
            var query = "UPDATE Names {% if example !>= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
        });
        describe('<', function () {
            var query = "UPDATE Names {% if example < 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('<=', function () {
            var query = "UPDATE Names {% if example <= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!<', function () {
            var query = "UPDATE Names {% if example !< 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('!<=', function () {
            var query = "UPDATE Names {% if example !<= 12 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '9' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '14' });
                result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc>', function () {
            var query = "UPDATE Names {% if example abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc>=', function () {
            var query = "UPDATE Names {% if example abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc>', function () {
            var query = "UPDATE Names {% if example !abc> 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc>=', function () {
            var query = "UPDATE Names {% if example !abc>= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc<', function () {
            var query = "UPDATE Names {% if example abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc<=', function () {
            var query = "UPDATE Names {% if example abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc<', function () {
            var query = "UPDATE Names {% if example !abc< 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc<=', function () {
            var query = "UPDATE Names {% if example !abc<= 'dragon' } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'awkward' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'hello' });
                result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
        });
        describe('len>', function () {
            var query = "UPDATE Names {% if example len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('len>=', function () {
            var query = "UPDATE Names {% if example len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len>', function () {
            var query = "UPDATE Names {% if example !len> 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len>=', function () {
            var query = "UPDATE Names {% if example !len>= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
        });
        describe('len<', function () {
            var query = "UPDATE Names {% if example len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('len<=', function () {
            var query = "UPDATE Names {% if example len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len<', function () {
            var query = "UPDATE Names {% if example !len< 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len<=', function () {
            var query = "UPDATE Names {% if example !len<= 6 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'fun' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                var result = index_1.default.parse(query, { example: 'sqiggl' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'palooza' });
                result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
        });
        describe('is NaN', function () {
            var query = "UPDATE Names {% if example is NaN } SET Name = 'Cow' {% else } SET Name = '{example}' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
        });
        describe('is not NaN', function () {
            var query = "UPDATE Names {% if example is not NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('is !NaN', function () {
            var query = "UPDATE Names {% if example is !NaN } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: '12' });
                result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                var result = index_1.default.parse(query, { example: 'dragon' });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('between condition', function () {
            var query = "UPDATE Names {% if example 10 >< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 15 });
                result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                var result = index_1.default.parse(query, { example: 10 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                var result = index_1.default.parse(query, { example: 20 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                var result = index_1.default.parse(query, { example: 5 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                var result = index_1.default.parse(query, { example: 25 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!between', function () {
            var query = "UPDATE Names {% if example 10 >!< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 15 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                var result = index_1.default.parse(query, { example: 10 });
                result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                var result = index_1.default.parse(query, { example: 20 });
                result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                var result = index_1.default.parse(query, { example: 5 });
                result.should.equal("UPDATE Names  SET Name = '5'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                var result = index_1.default.parse(query, { example: 25 });
                result.should.equal("UPDATE Names  SET Name = '25'  WHERE Name = 'Awesome'");
            });
        });
        describe('between= condition', function () {
            var query = "UPDATE Names {% if example 10 >=< 20 } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                var result = index_1.default.parse(query, { example: 15 });
                result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                var result = index_1.default.parse(query, { example: 10 });
                result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                var result = index_1.default.parse(query, { example: 20 });
                result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                var result = index_1.default.parse(query, { example: 5 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                var result = index_1.default.parse(query, { example: 25 });
                result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
    });
    describe('"query with newlines"', function () {
        it('should accept newlines in queries', function () {
            var sql = "UPDATE Names\n{% if example is not null }\nSET Name = '{example}'\n{% else } SET Name = 'Cow'\n{% endif }\nWHERE Name = 'Awesome'";
            var result = "UPDATE Names\n\nSET Name = 'Dragon'\n\nWHERE Name = 'Awesome'";
            var actual = index_1.default.parse(sql, { example: 'Dragon' });
            actual.should.equal(result);
        });
    });
});
