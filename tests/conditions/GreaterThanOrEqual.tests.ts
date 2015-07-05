// /// <reference path="../../typings/tsd.d.ts" />
// import GreaterThanOrEqual from '../../src/conditions/GreaterThanOrEqual';

// describe('GreaterThanOrEqual', () => {
//     describe('regex', () => {
//         it('should match a statement containing ">="', () => expect(GreaterThanOrEqual.regex.test('something >= 12')).toBe(true));
//         it('should not match a statement missing ">="', () => expect(GreaterThanOrEqual.regex.test('something missing greater than symbol')).toBe(false));
// 		it('should match a statement containing ">=" anywhere', () => expect(GreaterThanOrEqual.regex.test('something is >= 12 something')).toBe(true));
// 		it('should not match a statement containing ">=" but in the wrong order', () => expect(GreaterThanOrEqual.regex.test('something 12 >=')).toBe(false));
//         it('should not match a statement missing a variable', () => expect(GreaterThanOrEqual.regex.test('>= 12')).toBe(false));
//         it('should not match a statement missing a comparative', () => expect(GreaterThanOrEqual.regex.test('something >')).toBe(false));
// 		it('should capture a variable in the statement', () => expect('something >= 12'.match(GreaterThanOrEqual.regex)[1]).toEqual('something'));
//         it('should capture a comparator in the statement', () => expect('something >= 12'.match(GreaterThanOrEqual.regex)[2]).toEqual('12'));
// 	});
	
// 	describe('instance', () => {
// 		let gte;
// 		beforeAll(() => {
// 			gte = new GreaterThanOrEqual('something', {something: '14', blah: 'red'}, '12');
// 		});
// 		it('should store the variable', () => expect(gte.variable).toEqual('something'));
// 		it('should store the variables object', () => expect(gte.variables).toEqual({something: '14', blah: 'red'}));
//         it('should store the comparative', () => expect(gte.comparative).toEqual('12'));
// 		it('should provide a correct result', () => expect(gte.perform()).toBe(true));
//         it('should also provide a correct result when variable is equal to the comparative', () => {
// 			let othergte = new GreaterThanOrEqual('something', {something: '12', blah: 'red'}, '12');
// 			expect(othergte.perform()).toBe(true);
// 		});
// 		it('should also provide a correct result when variable is not greater than the comparative', () => {
// 			let othergte = new GreaterThanOrEqual('something', {something: '9', blah: 'red'}, '12');
// 			expect(othergte.perform()).toBe(false);
// 		});
// 	});
// });