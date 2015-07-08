/// <reference path="../../typings/tsd.d.ts" />
import Equal from '../../src/conditions/Equal';
import {Not, OrEqual} from '../../src/Modifiers';

describe('Equal', () => {
    describe('regex', () => {
        it('should match a statement containing "="', () => expect(Equal.regex.test('something = 12')).toBe(true));
        it('should match a statement containing "=" and a spot 1 modifier', () => expect(Equal.regex.test('something != 12')).toBe(true));
        it('should match a statement containing "=" and a spot 2 modifier', () => expect(Equal.regex.test('something =! 12')).toBe(true));
        it('should match a statement containing "=" and 2 modifiers', () => expect(Equal.regex.test('something !=! 12')).toBe(true));
        it('should not match a statement missing "="', () => expect(Equal.regex.test('something missing equal symbol')).toBe(false));
		it('should match a statement containing "=" anywhere', () => expect(Equal.regex.test('something is = 12 something')).toBe(true));
		it('should not match a statement containing "=" but in the wrong order', () => expect(Equal.regex.test('something 12 =')).toBe(false));
        it('should not match a statement missing a variable', () => expect(Equal.regex.test('= 12')).toBe(false));
        it('should not match a statement missing a comparative', () => expect(Equal.regex.test('something =')).toBe(false));
		it('should capture a variable in the statement', () => expect('something !== 12'.match(Equal.regex)[1]).toEqual('something'));
        it('should capture the first modifier in the statement', () => expect('something !== 12'.match(Equal.regex)[2]).toEqual('!'));
        it('should capture the second modifier in the statement', () => expect('something !== 12'.match(Equal.regex)[3]).toEqual('='));
        it('should capture a comparative in the statement', () => expect('something !== 12'.match(Equal.regex)[4]).toEqual('12'));
        
	});
	
	describe('instance', () => {
		let eqBare, eqNegated, eqDouble, eqFalse;
		beforeAll(() => {
            eqBare = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Dragon', null, null);
			eqNegated = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Dragon', '!', null);
            eqDouble = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Dragon', '!', '=');
            eqFalse = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Spice', null, null);
		});
		it('should store the variable', () => expect(eqDouble.variable).toEqual('something'));
		it('should store the variables object', () => expect(eqDouble.variables).toEqual({something: 'Dragon', blah: 'red'}));
        it('should store the comparative', () => expect(eqDouble.comparative).toEqual('Dragon'));
        it('should store the first modifier', () => expect(eqDouble.modifiers[0]).toEqual(Not));
        it('should store the second modifier', () => expect(eqDouble.modifiers[1]).toEqual(OrEqual));
		it('should provide a correct result', () => expect(eqBare.perform()).toBe(true));
        it('should provide a correct modified result', () => expect(eqNegated.perform()).toBe(false));
        it('should provide a correct double modified result', () => expect(eqDouble.perform()).toBe(false));
        it('should also provide a correct result when variable is not equal', () => expect(eqFalse.perform()).toBe(false));
	});
});