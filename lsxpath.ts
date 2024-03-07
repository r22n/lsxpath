import { ElementCompact, xml2json } from "xml-js";
import { defopt, Opt, XPath } from ".";
import { run } from 'varcom.js';

export function lsxpath(xml: string, opt?: Opt) {
    if (!xml.trim()) {
        return [];
    }

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


type Cursor = {
    xpath: string;
    see: ElementCompact | ElementCompact[] | string | number | boolean;
    inattr?: boolean;
}


function container(cursor: Cursor, cursors: Cursor[], opt: Opt) {
    if (arychild(cursor, cursors, opt)) {
        return true;
    } else if (ochild(cursor, cursors, opt)) {
        return true;
    }
}

function arychild(cursor: Cursor, cursors: Cursor[], opt: Opt) {
    const { see, xpath, } = cursor;
    if (!Array.isArray(see)) {
        return false;
    }

    filterifneed(see, opt);

    see.forEach(x => {
        cursors.push({
            xpath,
            see: x,
        })
    });
    return true;
}

function ochild(cursor: Cursor, cursors: Cursor[], opt: Opt) {
    const { see, xpath, inattr } = cursor;
    if (typeof see !== 'object') {
        return false;
    }

    // /path/to/el
    let cwp = xpath;

    // /path/to/el[@spec="id"]
    const filter = keybind(see, opt);
    if (filter) {
        cwp = `${cwp}${opt.lbrace}${opt.at}${filter.spec}${opt.eq}${opt.quot}${filter.id}${opt.quot}${opt.rbrace}`;
    }

    const children = Object.entries(see!);
    if (children.length) {
        children.forEach(([el, x]) => {
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
    } else {
        // dump empty xpath for such as '<a/>' '<a></a>'
        cursors.push({
            see: '',
            xpath: cwp
        });
    }

    return true;
}

function filterifneed(children: ElementCompact[], opt: Opt) {
    if (!(opt.autofilter && children.some(x => !x._attributes))) {
        return;
    }
    const { spec, id } = opt.autofilter;

    children.forEach((x, i) => {
        if (!x._attributes) {
            x._attributes = {};
        }

        const index = `${i}`;
        x._attributes[spec] = run(id, { index });
    });
}

function keybind(xml: ElementCompact, opt: Opt): ID | undefined {
    const a = xml._attributes;
    if (!a) {
        return;
    }

    const spec = opt.filterspec?.find(spec => a[spec] != null);
    if (!spec) {
        return;
    }

    const id = a[spec]!;
    return { spec, id: `${id}` };
}

type ID = {
    id: string;
    spec: string;
}

