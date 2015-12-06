// /// <reference path="../../typings/tsd.d.ts" />
// import OrEqual from '../../src/modifiers/OrEqual';

// describe('OrEqual', () => {
//     describe('identifiers', () => {
//         it('should match "="', () => expect(OrEqual.matches('=')).toBe(true));
// 	});
    
//     describe('perfom', () => {
//         it('should recompare the variable and provide the correct result (true)', () => expect(OrEqual.perform(false, 'something', {something: '12'}, '12')).toBe(true));
//         it('should recompare the variable and provide the correct result (false)', () => expect(OrEqual.perform(false, 'something', {something: '12'}, '14')).toBe(false));
//         it('should not make the comparison if the provided result is true', () => expect(OrEqual.perform(true, 'something', {something: '14'}, '12')).toBe(true));
//     });
// });