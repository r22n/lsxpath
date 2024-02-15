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
    filterspec?:string[];
}

const defopt: Opt = {
    sep: '/',
    at: '@',
    lbrace: '[',
    rbrace: ']',
    eq: '=',
    filterspec:['id','key','name']
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
        if (keybind(see, opt)) {
            const id = aid(see, opt)!;
            Object.entries(see!).forEach(([el, x]) => {

                // e.g. path[@id="hoge"], path[@id="hoge"]/el
                let next = `${opt.lbrace}${opt.at}${id.spec}${opt.eq}"${id.id}"${opt.rbrace}`;
                if (!(el === '_attributes' || el === '_text' || el === '_cdata')) {
                    next = `${next}/${el}`
                }

                cursors.push({
                    xpath: `${xpath}${next}`,
                    see: x,
                    inattr: el === '_attributes',
                });
            });
        } else {
            Object.entries(see!).forEach(([el, x]) => {
                // e.g. path/@id, path/id
                const next = `${opt.sep}${inattr ? opt.at : ''}${el}`
                cursors.push({
                    xpath: `${xpath}${next}`,
                    see: x,
                });
            });
        }
        return true;
    }
}

function keybind(xml: unknown, opt:Opt ) {
    const a = ary(xml);
    return a.every(x=> aid(x, opt ));
}


export function aid(xml: any,opt:Opt): ID | undefined {
    const a = xml._attributes;
    if (!(a && opt.filterspec?.some(spec=>a[spec]))) {
        return;
    }

    const spec = opt.filterspec.find(spec=>a[spec])!;
    const id = a[spec];
    return {spec,id};

}

type ID = {
    id: string;
    spec: string;
}


function ary(x: unknown) {
    if (Array.isArray(x)) {
        return x;
    } else {
        return [x];
    }
}


