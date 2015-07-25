// /// <reference path="../../typings/tsd.d.ts" />
// import Not from '../../src/modifiers/Not';

// describe('Not', () => {
//     describe('identifiers', () => {
//         it('should match "!"', () => expect(Not.matches('!')).toBe(true));
//         it('should match "not"', () => expect(Not.matches('not')).toBe(true));
//         it('should match " not"', () => expect(Not.matches(' not')).toBe(true));
//         it('should match "not "', () => expect(Not.matches('not ')).toBe(true));
//         it('should match " not "', () => expect(Not.matches(' not ')).toBe(true));
//         it('should match "NOT"', () => expect(Not.matches('NOT')).toBe(true));
//         it('should match "Not"', () => expect(Not.matches('Not')).toBe(true));
// 	});
    
//     describe('perfom', () => {
//         it('should negate the provided (true) result', () => expect(Not.perform(true, 'something', null, null)).toBe(false));
//         it('should negate the provided (false) result', () => expect(Not.perform(false, 'something', null, null)).toBe(true));
//     });
// });