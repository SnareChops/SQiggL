/// <reference path="../typings/tsd.d.ts" />
import {parse} from '../src/Main';

describe('No commands scenario', () => {
    beforeEach(() => spyOn(console, 'error'));
    it('should succeed and have the expected output', () => {
        let sql = "UPDATE";
        expect(parse(sql, null)).toEqual(sql);
    });
    
    it('should throw a syntax error if a dependent action is found without the needed preceeding action', () => {
        let sql = "UPDATE Students {{% else %}} SET FirstName = 'Scott'";
        expect(parse(sql, null)).toEqual(sql);
        expect(console.error).toHaveBeenCalled();
    });
    
    it('should throw a syntax error if a dependent action is found without the needed preceeding action', () => {
        let sql = "UPDATE Students {{% endif %}} SET FirstName = 'Scott'";
        expect(parse(sql, null)).toEqual(sql);
        expect(console.error).toHaveBeenCalled();
    });
});