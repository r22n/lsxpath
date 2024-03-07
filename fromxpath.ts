
import { ElementCompact, json2xml } from 'xml-js';
import { defopt, Opt, XPath } from '.';

const escape = require('xml-escape');

export function fromxpath(xpath: XPath[], opt?: Opt) {
    opt = { ...defopt, ...opt };

    return json2xml(JSON.stringify(xalloc(xpath, opt)), { compact: true });
}

function xalloc(xpath: XPath[], opt: Opt) {
    const top: ElementCompact = {};
    const memo: { [xpath in string]: ElementCompact } = { '': top };


    // alloc containers into top recursive and memoize container
    Object.entries(allocs(xpath, opt))
        .filter(([xpath, el]) => !term(el.last, opt))
        .sort(([a], [b]) => a > b ? 1 : -1)
        .forEach(([xpath, el]) => {
            const parent = memo[el.parent];
            const base = basename(el.last, opt);
            const key = keybind(el.last, opt);

            const add: ElementCompact = {};


            if (key) {
                if (parent[base]) {
                    parent[base].push(add);
                } else {
                    parent[base] = [add];
                }
            } else {
                parent[base] = add;
            }

            memo[xpath] = add;
        });

    // put values
    xpath.forEach(x => {
        const s = split(x.xpath, opt);
        const base = basename(x.xpath.substring(s[s.length - 2], s[s.length - 1]), opt);

        if (base.startsWith(opt.at!)) {
            // /path/to/el/@at
            //         ^ /el was found by /path/to/el ( cut /@at )
            const current = memo[x.xpath.substring(0, s[s.length - 2])];
            attr(current, base.substring(opt.at!.length), escape(x.value));
        } else if (base === '_comment') {
            // /path/to/el/_comment
            //         ^ /el was found by /path/to/el ( cut /_comment )
            const current = memo[x.xpath.substring(0, s[s.length - 2])];
            current._comment = x.value;
        } else {
            // /path/to/el
            //         ^ /el was found by /path/to/el 
            const current = memo[x.xpath];
            current._text = x.value;
        }
    });

    return top;
}

function attr(e: ElementCompact, attr: string, value: string) {
    if (!e._attributes) {
        e._attributes = {};
    }
    e._attributes[attr] = value;
}


function keybind(last: string, opt: Opt) {
    const brace = last.indexOf(opt.lbrace!);
    if (brace === -1) {
        return;
    }
    const spec = brace + opt.lbrace!.length + opt.at!.length;
    const eq = last.indexOf(opt.eq!, spec);
    const id = eq + opt.eq!.length + opt.quot!.length;
    const end = last.length - opt.rbrace!.length - opt.quot!.length;

    return {
        spec: last.substring(spec, eq),
        id: last.substring(id, end),
    };
}

function term(last: string, opt: Opt) {
    const b = basename(last, opt);
    return b === '_comment' || b.startsWith(opt.at!);
}

function basename(last: string, opt: Opt) {
    const brace = last.indexOf(opt.lbrace!);
    if (brace === -1) {
        return last.substring(opt.sep!.length);
    } else {
        return last.substring(opt.sep!.length, brace);
    }
}

function allocs(xpath: XPath[], opt: Opt) {
    return Object.fromEntries(
        xpath.map(x => elms(x.xpath, opt)).flat().map(x => [x.xpath, x])
    );
}

function elms(xpath: string, opt: Opt) {

    // enumerate elms in xpath
    // /path/to/container[@spec="id"]/_comment 
    // /path
    // /path/to
    // /path/to/container[@spec="id"]
    // /path/to/container[@spec="id"]/_comment
    // /path/to/container[@spec="id"]/@attr

    const result: El[] = [];
    const s = split(xpath, opt);
    for (let i = 0; i < s.length - 1; i++) {
        const x = xpath.substring(0, s[i + 1]);
        const e = xpath.substring(s[i], s[i + 1]);
        const p = xpath.substring(0, s[i]);
        result.push({ xpath: x, last: e, parent: p });
    }

    return result;
}

type El = {
    xpath: string;
    last: string;
    parent: string;
}

function split(xpath: string, opt: Opt) {

    // find sep positions
    // /path/to/container[@spec="id"]/@attr
    // /path/to/container[@spec="id"]/_comment 
    // /path/to/container[@spec="id"]
    // /path/to/container[@spec="""]
    // /path/to/container/@attr
    // /path/to/container/_comment
    // /path/to/container
    // 0    5  8         i           t        len ; are result of 'sep'

    const sep = [0];
    for (let i = 1, end = xpath.length, quot = false; i < end; i++) {
        const c = xpath.charAt(i);
        const n = xpath.substring(i, i + opt.quot!.length + opt.rbrace!.length);

        if (n === `${opt.quot}${opt.rbrace}`) {
            // /path/to/container[@spec="id"]/@attr
            //                             ^ '"]' shows quiting quot
            quot = false;
            i += opt.quot!.length + opt.rbrace!.length - 1;
        } else if (c === opt.quot) {
            // /path/to/container[@spec="id"]/@attr
            //                          ^ '"' shows starting quot
            quot = true;
            i += opt.quot!.length - 1;
        } else if (!quot && c === opt.sep) {
            sep.push(i);
        }
    }
    sep.push(xpath.length);

    return sep;
}