import { xml2json } from "xml-js";

export function lsxpath(xml: string, opt?: Opt) {
    opt = { ...defopt, ...opt };

    const cursors: Cursor[] = [{ xpath: '', see: JSON.parse(xml2json(xml, { compact: true })) }];
    const r: XPath[] = [];
    while (cursors.length) {
        const cursor = cursors.pop()!;
        if (!container(cursor, cursors, opt)) {
            r.push({
                xpath: cursor.xpath,
                value: `${cursor.see}`,
            });
        }
    }
    return r;
}

export type XPath = {
    xpath: string;
    value: string;
}

type Cursor = {
    xpath: string;
    see: unknown;
    inattr?: boolean;
}

export type Opt = {
    sep?: string;
    at?: string;
    lbrace?: string;
    rbrace?: string;
    eq?: string;
    quot?: string;
    filterspec?: string[];
}

const defopt: Opt = {
    sep: '/',
    at: '@',
    lbrace: '[',
    rbrace: ']',
    eq: '=',
    quot: '"',
    filterspec: ['id', 'key', 'name']
};

function container(cursor: Cursor, cursors: Cursor[], opt: Opt) {
    const { see, xpath, inattr } = cursor;
    if (Array.isArray(see)) {
        see.forEach(x => {
            cursors.push({
                xpath,
                see: x,
            })
        });
        return true;
    } else if (typeof see === 'object') {

        // /path/to/el
        let cwp = xpath;

        // /path/to/el[@spec="id"]
        const filter = keybind(see, opt);
        if (filter) {
            cwp = `${cwp}${opt.lbrace}${opt.at}${filter.spec}${opt.eq}${opt.quot}${filter.id}${opt.quot}${opt.rbrace}`
        }

        Object.entries(see!).forEach(([el, x]) => {
            let next = cwp;
            if (inattr) {
                // /path/to/el/@attr
                next = `${next}${opt.sep}${opt.at}${el}`;
            } else if (!(el === '_attributes' || el === '_text' || el === '_cdata')) {
                // dump 'el' into xpath if 'el' was container
                // /path/to/el/child
                next = `${next}${opt.sep}${el}`;
            }

            cursors.push({
                see: x,
                xpath: next,
                inattr: el === '_attributes',
            });
        });

        return true;
    }
}

function keybind(xml: any, opt: Opt): ID | undefined {
    const a = xml._attributes;
    if (!a) {
        return;
    }

    const spec = opt.filterspec?.find(spec => a[spec]);
    if (!spec) {
        return;
    }

    const id = a[spec];
    return { spec, id };
}

type ID = {
    id: string;
    spec: string;
}

