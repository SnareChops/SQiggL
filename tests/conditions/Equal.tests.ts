/// <reference path="../../typings/tsd.d.ts" />
import Equal from '../../src/conditions/Equal';

describe('Equal', () => {
    describe('regex', () => {
        it('should match a statement containing "=="', () => expect(Equal.regex.test('something == 12')).toBe(true));
        it('should not match a statement missing "=="', () => expect(Equal.regex.test('something missing equal symbol')).toBe(false));
		it('should match a statement containing "==" anywhere', () => expect(Equal.regex.test('something is == 12 something')).toBe(true));
		it('should not match a statement containing "==" but in the wrong order', () => expect(Equal.regex.test('something 12 ==')).toBe(false));
        it('should not match a statement missing a variable', () => expect(Equal.regex.test('== 12')).toBe(false));
        it('should not match a statement missing a comparative', () => expect(Equal.regex.test('something ==')).toBe(false));
		it('should not match a statement containing "==" but with an extra "="', () => expect(Equal.regex.test('something === 12')).toBe(false));
		it('should capture a variable in the statement', () => expect('something == 12'.match(Equal.regex)[1]).toEqual('something'));
        it('should capture a comparative in the statement', () => expect('something == 12'.match(Equal.regex)[2]).toEqual('12'));
	});
	
	describe('instance', () => {
		var eq;
		beforeAll(() => {
			eq = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Dragon');
		});
		it('should store the variable', () => expect(eq.variable).toEqual('something'));
		it('should store the variables object', () => expect(eq.variables).toEqual({something: 'Dragon', blah: 'red'}));
        it('should store the comparative', () => expect(eq.comparative).toEqual('Dragon'));
		it('should provide a correct result', () => expect(eq.perform()).toBe(true));
		it('should also provide a correct result when variable is not greater then', () => {
			var othereq = new Equal('something', {something: 'Elephant', blah: 'red'}, '12');
			expect(othereq.perform()).toBe(false);
		});
	});
});