import {Parser} from './parser';
import {DSL} from './dsl';

describe('Parser', () => {

    describe('comments', () => {
        it('should not output comments by default', () => {
            const parser = new Parser();
            const dsl: DSL[] = [
                {text: 'This is some text'},
                {comment: 'This is a comment'},
            ];
            const result = parser.parse(dsl);
            result.should.equal('This is some text');
        });

        it('should output comments if exportComments option is true', () => {
            const parser = new Parser({exportComments: true});
            const dsl: DSL[] = [
                {text: 'This is some text'},
                {comment: 'This is a comment'}
            ];
            const result = parser.parse(dsl);
            result.should.equal('This is some text/* This is a comment */')
        });
    });

    describe('text', () => {
        it('should output a text untouched', () => {
            const parser = new Parser();
            const result = parser.parse([{text: 'this is a test string'}]);
            result.should.equal('this is a test string');
        });
    });

    describe('variable', () => {
        it('should output ')
    });
});