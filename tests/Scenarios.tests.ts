/// <reference path="../typings/tsd.d.ts" />
import {parse} from '../src/Main';

describe('The scenario', () => {
    describe('if action', () => {
        
        describe('is null condition', () => {
            let query = `UPDATE Names {{% if example is null %}} SET Name = 'Cow' {{% else %}} SET Name = '{{example}}' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {penny: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('is not null condition', () => {
            let query = `UPDATE Names {{% if example is not null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {penny: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('is !null condition', () => {
            let query = `UPDATE Names {{% if example is !null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {penny: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('= condition', () => {
            let query = `UPDATE Names {{% if example = 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('== condition', () => {
            let query = `UPDATE Names {{% if example == 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('=== condition', () => {
            let query = `UPDATE Names {{% if example === 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!= condition', () => {
            let query = `UPDATE Names {{% if example != 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!== condition', () => {
            let query = `UPDATE Names {{% if example !== 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('> condition', () => {
            let query = `UPDATE Names {{% if example > 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('>= condition', () => {
            let query = `UPDATE Names {{% if example >= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!> condition', () => {
            let query = `UPDATE Names {{% if example !> 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!>= condition', () => {
            let query = `UPDATE Names {{% if example !>= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('< condition', () => {
            let query = `UPDATE Names {{% if example < 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('<= condition', () => {
            let query = `UPDATE Names {{% if example <= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!< condition', () => {
            let query = `UPDATE Names {{% if example !< 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!<= condition', () => {
            let query = `UPDATE Names {{% if example !<= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('abc> condition', () => {
            let query = `UPDATE Names {{% if example abc> 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('abc>= condition', () => {
            let query = `UPDATE Names {{% if example abc>= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!abc> condition', () => {
            let query = `UPDATE Names {{% if example !abc> 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!abc>= condition', () => {
            let query = `UPDATE Names {{% if example !abc>= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('abc< condition', () => {
            let query = `UPDATE Names {{% if example abc< 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('abc<= condition', () => {
            let query = `UPDATE Names {{% if example abc<= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!abc< condition', () => {
            let query = `UPDATE Names {{% if example !abc< 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!abc<= condition', () => {
            let query = `UPDATE Names {{% if example !abc<= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('len> condition', () => {
            let query = `UPDATE Names {{% if example len> 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('len>= condition', () => {
            let query = `UPDATE Names {{% if example len>= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!len> condition', () => {
            let query = `UPDATE Names {{% if example !len> 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!len>= condition', () => {
            let query = `UPDATE Names {{% if example !len>= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('len< condition', () => {
            let query = `UPDATE Names {{% if example len< 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('len<= condition', () => {
            let query = `UPDATE Names {{% if example len<= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!len< condition', () => {
            let query = `UPDATE Names {{% if example !len< 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('!len<= condition', () => {
            let query = `UPDATE Names {{% if example !len<= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if equal', () => {
                expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('is NaN condition', () => {
            let query = `UPDATE Names {{% if example is NaN %}} SET Name = 'Cow' {{% else %}} SET Name = '{{example}}' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('is not NaN condition', () => {
            let query = `UPDATE Names {{% if example is not NaN %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
        describe('is !NaN condition', () => {
            let query = `UPDATE Names {{% if example is !NaN %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
            it('should provide a correct result if true', () => {
                expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
            });
            it('should provide a correct result if false', () => {
                expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
            });
        });
        
    });
    
    describe('"no commands"', () => {
        it('should succeed and have the expected output', () => {
            let sql = "UPDATE";
            expect(parse(sql, null)).toEqual(sql);
        });
    });
    
    // describe('"missing dependent actions"', () => {
    //     beforeEach(() => spyOn(console, 'error'));
    
    //     it('should throw a syntax error if a dependent action is found without the needed preceeding action', () => {
    //         let sql = "UPDATE Students {{% else %}} SET FirstName = 'Scott'";
    //         expect(parse(sql, null)).toEqual(sql);
    //         expect(console.error).toHaveBeenCalled();
    //     });
        
    //     it('should throw a syntax error if a dependent action is found without the needed preceeding action', () => {
    //         let sql = "UPDATE Students {{% endif %}} SET FirstName = 'Scott'";
    //         expect(parse(sql, null)).toEqual(sql);
    //         expect(console.error).toHaveBeenCalled();
    //     });
    // });
    
    describe('"query with newlines"', () => {     
        it('should accept newlines in queries', () => {
            let sql = `UPDATE Names 
{{% if example is not null %}}
SET Name = '{{example}}'
{{% else %}} SET Name = 'Cow' 
{{% endif %}}
WHERE Name = 'Awesome'`;
            let result = `UPDATE Names 
SET Name = 'Dragon'
WHERE Name = 'Awesome'`;
            expect(parse(sql, {example: 'Dragon'})).toEqual(result);
        });
    });
    
    describe('"upper case commands"', () => {
        it('should succeed dispite letter case', () => {
            const sql = "UPDATE Names {{% IF example is NOT null %}} SET Name = '{{example}}' {{% Else %}} SET Name = 'Cow' {{% endIf %}} WHERE Name = 'Awesome'";
            const result = "UPDATE Names SET Name = 'Dragon'  WHERE Name = 'Awesome'";
            expect(parse(sql, {example: 'Dragon'})).toEqual(result);
        });
    });
    
});