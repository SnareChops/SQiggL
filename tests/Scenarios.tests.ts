/// <reference path="../typings/tsd.d.ts" />
import {parse} from '../src/Main';

describe('This command scenario', () => {
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
    
    it('should succeed dispite letter case', () => {
        const sql = "UPDATE Names {{% IF example is NOT null %}} SET Name = '{{example}}' {{% Else %}} SET Name = 'Cow' {{% endIf %}} WHERE Name = 'Awesome'";
        const result = "UPDATE Names SET Name = 'Dragon'  WHERE Name = 'Awesome'";
        expect(parse(sql, {example: 'Dragon'})).toEqual(result);
    });
});