// /// <reference path="../../typings/tsd.d.ts" />
// import GreaterThan from '../../src/conditions/GreaterThan';
// import {Not, OrEqual} from '../../src/Modifiers';

// describe('GreaterThan', () => {
//     describe('regex', () => {
//         it('should match a statement containing ">"', () => expect(GreaterThan.regex.test('something > 12')).toBe(true));
//         it('should match a statement containing ">" and a spot 1 modifier', () => expect(GreaterThan.regex.test('something !> 12')).toBe(true));
//         it('should match a statement containing ">" and a spot 2 modifier', () => expect(GreaterThan.regex.test('something >= 12')).toBe(true));
//         it('should match a statement containing ">" and 2 modifiers', () => expect(GreaterThan.regex.test('something !>= 12')).toBe(true));
//         it('should not match a statement missing ">"', () => expect(GreaterThan.regex.test('something missing greater than symbol')).toBe(false));
// 		it('should match a statement containing ">" anywhere', () => expect(GreaterThan.regex.test('something is > 12 something')).toBe(true));
// 		it('should not match a statement containing ">" but in the wrong order', () => expect(GreaterThan.regex.test('something 12 >')).toBe(false));
//         it('should not match a statement missing a variable', () => expect(GreaterThan.regex.test('> 12')).toBe(false));
//         it('should not match a statement missing a comparative', () => expect(GreaterThan.regex.test('something >')).toBe(false));
// 		it('should not match a statement containing ">" but with an extra ">"', () => expect(GreaterThan.regex.test('something >> 12')).toBe(false));
// 		it('should capture a variable in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[1]).toEqual('something'));
//         it('should capture the first modifier in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[2]).toEqual('!'));
//         it('should capture the second modifier in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[3]).toEqual('='));
//         it('should capture a comparator in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[4]).toEqual('12'));
// 	});
	
// 	describe('instance', () => {
// 		var gtBare, gtNegated, gtEqualed, gtDouble, gtFalse, gteFalse;
// 		beforeAll(() => {
// 			gtBare = new GreaterThan('something', {something: '14', blah: 'red'}, '12', null, null);
//             gtNegated = new GreaterThan('something', {something: '14', blah: 'red'}, '12', '!', null);
//             gtEqualed = new GreaterThan('something', {something: '14', blah: 'red'}, '14', null, '=');
//             gtDouble = new GreaterThan('something', {something: '14', blah: 'red'}, '14', '!', '=');
//             gtFalse = new GreaterThan('something', {something: '14', blah: 'red'}, '14', null, null);
//             gteFalse = new GreaterThan('something', {something: '14', blah: 'red'}, '20', null, '=');
// 		});
// 		it('should store the variable', () => expect(gtDouble.variable).toEqual('something'));
// 		it('should store the variables object', () => expect(gtDouble.variables).toEqual({something: '14', blah: 'red'}));
//         it('should store the comparative', () => expect(gtDouble.comparative).toEqual('14'));
//         it('should store the first modifier', () => expect(gtDouble.modifiers[0]).toEqual(Not));
//         it('should store the second modifier', () => expect(gtDouble.modifiers[1]).toEqual(OrEqual));
// 		it('should provide a correct result', () => expect(gtBare.perform()).toBe(true));
//         it('should provide a correct negated result', () => expect(gtNegated.perform()).toBe(false));
//         it('should provide a correct or-equal result', () => expect(gtEqualed.perform()).toBe(true));
//         it('should provide a correct double modified result', () => expect(gtDouble.perform()).toBe(false));
// 		it('should also provide a correct result when variable is not greater than', () => expect(gtFalse.perform()).toBe(false));
//         it('should also provide a correct result when variable is not greater than or equal', () => expect(gteFalse.perform()).toBe(false));
// 	});
// });