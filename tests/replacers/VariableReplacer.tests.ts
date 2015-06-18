/// <reference path="../../typings/tsd.d.ts" />
import VariableReplacer from '../../src/replacers/VariableReplacer';
import {IVariables} from '../../src/IVariables';

describe('VariableReplacer', () => {
	describe('regex', () => {
		beforeEach(() => VariableReplacer.regex.lastIndex = 0);
		it('should match a double curly replacement', () => expect(VariableReplacer.regex.test('{{ something }}')).toBe(true));
		it('should not match a triple curly replacement', () => expect(VariableReplacer.regex.test('{{{ something }}}')).toBe(false));
		it('should not match something without curly brackets', () => expect(VariableReplacer.regex.test('(( something ))')).toBe(false));
	});
	
	const variables: IVariables = {something: 'Dragon', goblin: 'Chief'};
	describe('replace', () => {
		it('should replace a variable', () => expect(VariableReplacer.replace('{{ something }}', variables)).toEqual('Dragon'));
		it('should replace a variable in a string', () => expect(VariableReplacer.replace('this is a {{ something }}', variables)).toEqual('this is a Dragon'));
		it('should replace more than one variable in a string', () => expect(VariableReplacer.replace('this is a {{ something }} and this is a {{something}}', variables)).toEqual('this is a Dragon and this is a Dragon'));
		it('should replace more than one variable in a string', () => expect(VariableReplacer.replace('this is a {{ something }} and this is a {{something}}', variables)).toEqual('this is a Dragon and this is a Dragon'));
		it('should replace different variables in a string', () => expect(VariableReplacer.replace('this is a {{ something }} and this is a {{goblin}}', variables)).toEqual('this is a Dragon and this is a Chief'));
	});
});