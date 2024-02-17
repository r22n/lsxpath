"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('test', () => {
    it('empty xml shows empty list', () => {
        expect((0, _1.lsxpath)('').length).toEqual(0);
        expect((0, _1.lsxpath)('<sample/>').length).toEqual(0);
    });
    it('text shows single path to text', () => {
        expect((0, _1.lsxpath)('<sample>text</sample>')).toEqual([
            { value: 'text', xpath: '/sample' },
        ]);
        expect((0, _1.lsxpath)('<sample attr="text"></sample>')).toEqual([
            { value: 'text', xpath: '/sample/@attr' },
        ]);
        expect((0, _1.lsxpath)('<sample attr="text">www</sample>')).toEqual([
            { value: 'www', xpath: '/sample' },
            { value: 'text', xpath: '/sample/@attr' },
        ]);
    });
    it('keybind el shows simple filter', () => {
        expect((0, _1.lsxpath)(`
<sample name="bob">
    <field key="name" value="bob"/>
    <field key="age" value="34"/>
hello!
</sample>
        `)).toEqual([
            { value: '\nhello!\n', xpath: '/sample[@name="bob"]' },
            { value: '34', xpath: '/sample[@name="bob"]/field[@key="age"]/@value' },
            { value: 'age', xpath: '/sample[@name="bob"]/field[@key="age"]/@key' },
            { value: 'bob', xpath: '/sample[@name="bob"]/field[@key="name"]/@value' },
            { value: 'name', xpath: '/sample[@name="bob"]/field[@key="name"]/@key' },
            { value: 'bob', xpath: '/sample[@name="bob"]/@name' },
        ]);
    });
    it('tests options', () => {
        expect((0, _1.lsxpath)('<sample><test key="test">hoge</test></sample>', {
            at: '#'
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test[#key="test"]' },
            { value: 'test', xpath: '/sample/test[#key="test"]/#key' },
        ]);
        expect((0, _1.lsxpath)('<sample><test key="test">hoge</test></sample>', {
            eq: '#'
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test[@key#"test"]' },
            { value: 'test', xpath: '/sample/test[@key#"test"]/@key' },
        ]);
        expect((0, _1.lsxpath)('<sample><test key="test0">hoge</test><test key="test1">fuga</test></sample>', {
            filterspec: [],
        })).toEqual([
            { value: 'fuga', xpath: '/sample/test' },
            { value: 'test1', xpath: '/sample/test/@key' },
            { value: 'hoge', xpath: '/sample/test' },
            { value: 'test0', xpath: '/sample/test/@key' },
        ]);
        expect((0, _1.lsxpath)('<sample><test key="test">hoge</test></sample>', {
            filterspec: void 0,
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test' },
            { value: 'test', xpath: '/sample/test/@key' },
        ]);
        expect((0, _1.lsxpath)('<sample><test myfilterspec="test" key="aaa">hoge</test></sample>', {
            filterspec: ['myfilterspec'],
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test[@myfilterspec="test"]' },
            { value: 'aaa', xpath: '/sample/test[@myfilterspec="test"]/@key' },
            { value: 'test', xpath: '/sample/test[@myfilterspec="test"]/@myfilterspec' },
        ]);
        expect((0, _1.lsxpath)('<sample><test key="test">hoge</test></sample>', {
            lbrace: '<',
            rbrace: '>',
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test<@key="test">' },
            { value: 'test', xpath: '/sample/test<@key="test">/@key' },
        ]);
        expect((0, _1.lsxpath)('<sample><test key="test">hoge</test></sample>', {
            sep: '#'
        })).toEqual([
            { value: 'hoge', xpath: '#sample#test[@key="test"]' },
            { value: 'test', xpath: '#sample#test[@key="test"]#@key' },
        ]);
    });
});
