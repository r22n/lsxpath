import { lsxpath } from ".";


describe('test', () => {
    it('empty xml shows empty list', () => {
        expect(lsxpath('').length).toEqual(0);
        expect(lsxpath('<sample/>').length).toEqual(0);
    });

    it('text shows single path to text', () => {
        expect(lsxpath('<sample>text</sample>')).toEqual([
            { value: 'text', xpath: '/sample' },
        ]);
        expect(lsxpath('<sample attr="text"></sample>')).toEqual([
            { value: 'text', xpath: '/sample/@attr' },
        ]);
        expect(lsxpath('<sample attr="text">www</sample>')).toEqual([
            { value: 'www', xpath: '/sample' },
            { value: 'text', xpath: '/sample/@attr' },
        ]);
    });


    it('keybind el shows simple filter', () => {
        expect(lsxpath(`
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
        ])
    });
    
});