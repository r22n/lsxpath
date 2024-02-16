"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aid = exports.lsxpath = void 0;
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
        if (keybind(see, opt)) {
            const id = aid(see, opt);
            Object.entries(see).forEach(([el, x]) => {
                // e.g. path[@id="hoge"], path[@id="hoge"]/el
                let next = `${opt.lbrace}${opt.at}${id.spec}${opt.eq}"${id.id}"${opt.rbrace}`;
                if (!(el === '_attributes' || el === '_text' || el === '_cdata')) {
                    next = `${next}${opt.sep}${el}`;
                }
                cursors.push({
                    xpath: `${xpath}${next}`,
                    see: x,
                    inattr: el === '_attributes',
                });
            });
        }
        else {
            Object.entries(see).forEach(([el, x]) => {
                // e.g. path/@id, path/id
                let next;
                if (inattr) {
                    next = `${opt.sep}${opt.at}${el}`;
                }
                else if (!(el === '_attributes' || el === '_text' || el === '_cdata')) {
                    next = `${opt.sep}${el}`;
                }
                else {
                    next = '';
                }
                cursors.push({
                    xpath: `${xpath}${next}`,
                    see: x,
                    inattr: el === '_attributes',
                });
            });
        }
        return true;
    }
}
function keybind(xml, opt) {
    const a = ary(xml);
    return a.every(x => aid(x, opt));
}
function aid(xml, opt) {
    const a = xml._attributes;
    if (!(a && opt.filterspec?.some(spec => a[spec]))) {
        return;
    }
    const spec = opt.filterspec.find(spec => a[spec]);
    const id = a[spec];
    return { spec, id };
}
exports.aid = aid;
function ary(x) {
    if (Array.isArray(x)) {
        return x;
    }
    else {
        return [x];
    }
}
