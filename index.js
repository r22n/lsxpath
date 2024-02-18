"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lsxpath = void 0;
const xml_js_1 = require("xml-js");
function lsxpath(xml, opt) {
    opt = { ...defopt, ...opt };
    const cursors = [{ xpath: '', see: JSON.parse((0, xml_js_1.xml2json)(xml, { compact: true })) }];
    const r = [];
    while (cursors.length) {
        const cursor = cursors.pop();
        if (!container(cursor, cursors, opt)) {
            r.push({
                xpath: cursor.xpath,
                value: `${cursor.see}`,
            });
        }
    }
    return r;
}
exports.lsxpath = lsxpath;
const defopt = {
    sep: '/',
    at: '@',
    lbrace: '[',
    rbrace: ']',
    eq: '=',
    quot: '"',
    filterspec: ['id', 'key', 'name']
};
function container(cursor, cursors, opt) {
    const { see, xpath, inattr } = cursor;
    if (Array.isArray(see)) {
        see.forEach(x => {
            cursors.push({
                xpath,
                see: x,
            });
        });
        return true;
    }
    else if (typeof see === 'object') {
        // /path/to/el
        let cwp = xpath;
        // /path/to/el[@spec="id"]
        const filter = keybind(see, opt);
        if (filter) {
            cwp = `${cwp}${opt.lbrace}${opt.at}${filter.spec}${opt.eq}${opt.quot}${filter.id}${opt.quot}${opt.rbrace}`;
        }
        Object.entries(see).forEach(([el, x]) => {
            let next = cwp;
            if (inattr) {
                // /path/to/el/@attr
                next = `${next}${opt.sep}${opt.at}${el}`;
            }
            else if (!(el === '_attributes' || el === '_text' || el === '_cdata')) {
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
function keybind(xml, opt) {
    const a = xml._attributes;
    if (!(a && opt.filterspec?.some(spec => a[spec]))) {
        return;
    }
    const spec = opt.filterspec.find(spec => a[spec]);
    const id = a[spec];
    return { spec, id };
}
