import { fromxpath, lsxpath } from ".";


describe('test', () => {
    it('empty xml shows empty list', () => {
        expect(lsxpath('').length).toEqual(0);
    });

    it('text shows single path to text', () => {
        expect(lsxpath('<sample/>')).toEqual([
            { value: '', xpath: '/sample' },
        ]);
        expect(lsxpath('<sample></sample>')).toEqual([
            { value: '', xpath: '/sample' },
        ]);
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

    it('keybind el shows simple filter even empty key', () => {
        expect(lsxpath('<sample><el id=""/></sample>')).toEqual([
            { value: '', xpath: '/sample/el[@id=""]/@id'},
        ]);

        expect(lsxpath('<sample><el id="w"/><el id=""/></sample>')).toEqual([
            { value: '', xpath: '/sample/el[@id=""]/@id'},
            { value: 'w', xpath: '/sample/el[@id="w"]/@id'},
        ]);

        expect(lsxpath('<sample><el id=""><a key=""/></el></sample>')).toEqual([
            { value: '', xpath: '/sample/el[@id=""]/a[@key=""]/@key'},
            { value: '', xpath: '/sample/el[@id=""]/@id'},
        ]);
    });

    it('tests options', () => {
        expect(lsxpath('<sample><test key="test">hoge</test></sample>', {
            at: '#'
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test[#key="test"]'},
            { value: 'test', xpath: '/sample/test[#key="test"]/#key'},
        ]);

        expect(lsxpath('<sample><test key="test">hoge</test></sample>', {
            quot: '#',
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test[@key=#test#]'},
            { value: 'test', xpath: '/sample/test[@key=#test#]/@key'},
        ]);

        expect(lsxpath('<sample><test key="test">hoge</test></sample>', {
            eq: '#'
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test[@key#"test"]'},
            { value: 'test', xpath: '/sample/test[@key#"test"]/@key'},
        ]);

        expect(lsxpath('<sample><test key="test0">hoge</test><test key="test1">fuga</test></sample>', {
            filterspec: [],
        })).toEqual([
            { value: 'fuga', xpath: '/sample/test'},
            { value: 'test1', xpath: '/sample/test/@key'},
            { value: 'hoge', xpath: '/sample/test'},
            { value: 'test0', xpath: '/sample/test/@key'},
        ]);

        expect(lsxpath('<sample><test key="test">hoge</test></sample>', {
            filterspec: void 0,
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test'},
            { value: 'test', xpath: '/sample/test/@key'},
        ]);

        expect(lsxpath('<sample><test myfilterspec="test" key="aaa">hoge</test></sample>', {
            filterspec: ['myfilterspec'],
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test[@myfilterspec="test"]'},
            { value: 'aaa', xpath: '/sample/test[@myfilterspec="test"]/@key'},
            { value: 'test', xpath: '/sample/test[@myfilterspec="test"]/@myfilterspec'},
        ]);

        expect(lsxpath('<sample><test key="test">hoge</test></sample>', {
            lbrace: '<',
            rbrace: '>',
        })).toEqual([
            { value: 'hoge', xpath: '/sample/test<@key="test">'},
            { value: 'test', xpath: '/sample/test<@key="test">/@key'},
        ]);

        expect(lsxpath('<sample><test key="test">hoge</test></sample>', {
            sep: '#'
        })).toEqual([
            { value: 'hoge', xpath: '#sample#test[@key="test"]'},
            { value: 'test', xpath: '#sample#test[@key="test"]#@key'},
        ]);
    });

    it('single value from single entry',()=>{
        expect(fromxpath([
            { value: 'hoge', xpath: '/sample'},
        ])).toEqual('<sample>hoge</sample>');

        expect(fromxpath([
            { value: 'a', xpath: '/sample'},
        ])).toEqual('<sample>a</sample>');

        expect(fromxpath([
            { value: ' ', xpath: '/sample'},
        ])).toEqual('<sample> </sample>');

        expect(fromxpath([
            { value: 'hoge', xpath: '/sample/@attr'},
        ])).toEqual('<sample attr="hoge"/>');

        expect(fromxpath([
            { value: 'hoge', xpath: '/sample/@vvv'},
        ])).toEqual('<sample vvv="hoge"/>');

        expect(fromxpath([
            { value: 'a', xpath: '/sample/@vvv'},
        ])).toEqual('<sample vvv="a"/>');

        expect(fromxpath([
            { value: 'a', xpath: '/sample/_comment'},
        ])).toEqual('<sample><!--a--></sample>');

        expect(fromxpath([
            { value: 'a', xpath: '/sample/hoge/@vvv'},
        ])).toEqual('<sample><hoge vvv="a"/></sample>');

        expect(fromxpath([
            { value: 'a', xpath: '/sample/hoge'},
        ])).toEqual('<sample><hoge>a</hoge></sample>');

        expect(fromxpath([
            { value: 'a', xpath: '/sample/_comment'},
        ])).toEqual('<sample><!--a--></sample>');

        expect(fromxpath([
            { value: 'a', xpath: '/sample/hoge/_comment'},
        ])).toEqual('<sample><hoge><!--a--></hoge></sample>');
    });

    it('filter spec do or dont shows container', () => {
        expect(fromxpath([
            { value: 'A', xpath: '/sample/w[@a="A"]/@a'},
            { value: 'a', xpath: '/sample/w[@a="A"]'},
            { value: 'B', xpath: '/sample/w[@a="B"]/@a'},
            { value: 'b', xpath: '/sample/w[@a="B"]'},
            { value: 'comment', xpath: '/sample/w[@a="B"]/_comment'},
        ])).toEqual('<sample><w a="A">a</w><w a="B">b<!--comment--></w></sample>');

        expect(fromxpath([
            { value: 'B', xpath: '/sample/w/@a'},
            { value: 'b', xpath: '/sample/w'},
            { value: 'comment', xpath: '/sample/w/_comment'},
        ])).toEqual('<sample><w a="B">b<!--comment--></w></sample>');

        expect(fromxpath([
            { value: 'A', xpath: '/sample/w[@a="A"]/@a'},
            { value: 'X', xpath: '/sample/w[@a="A"]/x[@b="X"]/@b'},
            { value: 'Z', xpath: '/sample/w[@a="A"]/x[@b="X"]'},
            { value: 'B', xpath: '/sample/w[@a="B"]/@a'},
            { value: '1', xpath: '/sample/w[@a="B"]/z[@c="1"]/@c'},
            { value: '2', xpath: '/sample/w[@a="B"]/z[@c="1"]/@d'},
            { value: '3', xpath: '/sample/w[@a="B"]/z[@c="1"]'},
            { value: 'comment', xpath: '/sample/w[@a="B"]/_comment'},
        ])).toEqual('<sample><w a="A"><x b="X">Z</x></w><w a="B"><z c="1" d="2">3</z><!--comment--></w></sample>');

        expect(fromxpath([
            { value: 'B', xpath: '/sample/w/@a'},
            { value: 'b', xpath: '/sample/w'},
            { value: 'comment', xpath: '/sample/w/_comment'},
        ])).toEqual('<sample><w a="B">b<!--comment--></w></sample>');

        expect(fromxpath([
            { value: 'B', xpath: '/sample/w/@a'},
        ])).toEqual('<sample><w a="B"/></sample>');

        expect(fromxpath([
            { value: 'B', xpath: '/sample/w[@a="B"]/@a'},
        ])).toEqual('<sample><w a="B"/></sample>');

        expect(fromxpath([
            { value: 'A/B', xpath: '/sample/w[@a="A/B"]/@a'},
        ])).toEqual('<sample><w a="A/B"/></sample>');

        expect(fromxpath([
            { value: '<>="!--/', xpath: '/sample/w[@a="<>="!--/"]/@a'},
        ])).toEqual('<sample><w a="<>=&quot;!--/"/></sample>');
    });

    it('complex structures of xpath', () => {
        expect(fromxpath([
            { value: 'A', xpath: '/path/to[@attr="DDD"]/very/complex[@thatis="complex"]/value/@w'},
            { value: 'DDD', xpath: '/path/to[@attr="DDD"]/@attr'},
            { value: 'complex', xpath: '/path/to[@attr="DDD"]/very/complex[@thatis="complex"]/@thatis'},
        ])).toEqual('<path><to attr="DDD"><very><complex thatis="complex"><value w="A"/></complex></very></to></path>');

    });

    it('the xml shows same xml', () => {
        // same meanings
        expect(fromxpath(lsxpath('<sample attr="hoge"></sample>'))).toEqual('<sample attr="hoge"/>');
        expect(fromxpath(lsxpath('<sample attr="hoge"/>'))).toEqual('<sample attr="hoge"/>');

        expect(fromxpath(lsxpath('<sample w="W"><hoge a="B"/></sample>'))).toEqual('<sample w="W"><hoge a="B"/></sample>');
        expect(fromxpath(lsxpath('<sample w="W"><hoge a="B"></hoge></sample>'))).toEqual('<sample w="W"><hoge a="B"/></sample>');

        expect(fromxpath(lsxpath('<sample><hoge a="B"/></sample>'))).toEqual('<sample><hoge a="B"/></sample>');
        expect(fromxpath(lsxpath('<sample><hoge a="B"></hoge></sample>'))).toEqual('<sample><hoge a="B"/></sample>');

        expect(fromxpath(lsxpath('<sample/>'))).toEqual('<sample></sample>');
        expect(fromxpath(lsxpath('<sample></sample>'))).toEqual('<sample></sample>');
        expect(fromxpath(lsxpath('<sample><a/></sample>'))).toEqual('<sample><a></a></sample>');
        expect(fromxpath(lsxpath('<sample><a></a></sample>'))).toEqual('<sample><a></a></sample>');

        // same notations
        let xml = '<sample>hoge</sample>';
        expect(fromxpath(lsxpath(xml))).toEqual(xml);
        xml = '<path><to attr="DDD"><very><complex thatis="complex"><value w="A"/></complex></very></to></path>';
        expect(fromxpath(lsxpath(xml))).toEqual(xml);
        xml = '<sample><el id=""><a key=""/></el></sample>';
        expect(fromxpath(lsxpath(xml))).toEqual(xml);
        xml = '<sample><el id=""><a key=""/><a key="2"/></el><el id="1"><a key=""/><a key="2"/></el></sample>';
        expect(fromxpath(lsxpath(xml))).toEqual(xml);

    });
});