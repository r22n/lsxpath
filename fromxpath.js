"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.fromxpath = void 0;
var xml_js_1 = require("xml-js");
var _1 = require(".");
function fromxpath(xpath, opt) {
    opt = __assign(__assign({}, _1.defopt), opt);
    return (0, xml_js_1.json2xml)(JSON.stringify(xalloc(xpath, opt)), { compact: true });
}
exports.fromxpath = fromxpath;
function xalloc(xpath, opt) {
    var top = {};
    var memo = { '': top };
    // alloc containers into top recursive and memoize container
    Object.entries(allocs(xpath, opt))
        .filter(function (_a) {
        var xpath = _a[0], el = _a[1];
        return !term(el.last, opt);
    })
        .sort(function (_a, _b) {
        var a = _a[0];
        var b = _b[0];
        return a > b ? 1 : -1;
    })
        .forEach(function (_a) {
        var xpath = _a[0], el = _a[1];
        var parent = memo[el.parent];
        var base = basename(el.last, opt);
        var key = keybind(el.last, opt);
        var add = {};
        if (key) {
            if (parent[base]) {
                parent[base].push(add);
            }
            else {
                parent[base] = [add];
            }
        }
        else {
            parent[base] = add;
        }
        memo[xpath] = add;
    });
    // put values
    xpath.forEach(function (x) {
        var s = split(x.xpath, opt);
        var base = basename(x.xpath.substring(s[s.length - 2], s[s.length - 1]), opt);
        if (base.startsWith(opt.at)) {
            // /path/to/el/@at
            //         ^ /el was found by /path/to/el ( cut /@at )
            var current = memo[x.xpath.substring(0, s[s.length - 2])];
            attr(current, base.substring(opt.at.length), x.value);
        }
        else if (base === '_comment') {
            // /path/to/el/_comment
            //         ^ /el was found by /path/to/el ( cut /_comment )
            var current = memo[x.xpath.substring(0, s[s.length - 2])];
            current._comment = x.value;
        }
        else {
            // /path/to/el
            //         ^ /el was found by /path/to/el 
            var current = memo[x.xpath];
            current._text = x.value;
        }
    });
    return top;
}
function attr(e, attr, value) {
    if (!e._attributes) {
        e._attributes = {};
    }
    e._attributes[attr] = value;
}
function keybind(last, opt) {
    var brace = last.indexOf(opt.lbrace);
    if (brace === -1) {
        return;
    }
    var spec = brace + opt.lbrace.length + opt.at.length;
    var eq = last.indexOf(opt.eq, spec);
    var id = eq + opt.eq.length + opt.quot.length;
    var end = last.length - opt.rbrace.length - opt.quot.length;
    return {
        spec: last.substring(spec, eq),
        id: last.substring(id, end)
    };
}
function term(last, opt) {
    var b = basename(last, opt);
    return b === '_comment' || b.startsWith(opt.at);
}
function basename(last, opt) {
    var brace = last.indexOf(opt.lbrace);
    if (brace === -1) {
        return last.substring(opt.sep.length);
    }
    else {
        return last.substring(opt.sep.length, brace);
    }
}
function allocs(xpath, opt) {
    return Object.fromEntries(xpath.map(function (x) { return elms(x.xpath, opt); }).flat().map(function (x) { return [x.xpath, x]; }));
}
function elms(xpath, opt) {
    // enumerate elms in xpath
    // /path/to/container[@spec="id"]/_comment 
    // /path
    // /path/to
    // /path/to/container[@spec="id"]
    // /path/to/container[@spec="id"]/_comment
    // /path/to/container[@spec="id"]/@attr
    var result = [];
    var s = split(xpath, opt);
    for (var i = 0; i < s.length - 1; i++) {
        var x = xpath.substring(0, s[i + 1]);
        var e = xpath.substring(s[i], s[i + 1]);
        var p = xpath.substring(0, s[i]);
        result.push({ xpath: x, last: e, parent: p });
    }
    return result;
}
function split(xpath, opt) {
    // find sep positions
    // /path/to/container[@spec="id"]/@attr
    // /path/to/container[@spec="id"]/_comment 
    // /path/to/container[@spec="id"]
    // /path/to/container[@spec="""]
    // /path/to/container/@attr
    // /path/to/container/_comment
    // /path/to/container
    // 0    5  8         i           t        len ; are result of 'sep'
    var sep = [0];
    for (var i = 1, end = xpath.length, quot = false; i < end; i++) {
        var c = xpath.charAt(i);
        var n = xpath.substring(i, i + opt.quot.length + opt.rbrace.length);
        if (n === "".concat(opt.quot).concat(opt.rbrace)) {
            // /path/to/container[@spec="id"]/@attr
            //                             ^ '"]' shows quiting quot
            quot = false;
            i += opt.quot.length + opt.rbrace.length - 1;
        }
        else if (c === opt.quot) {
            // /path/to/container[@spec="id"]/@attr
            //                          ^ '"' shows starting quot
            quot = true;
            i += opt.quot.length - 1;
        }
        else if (!quot && c === opt.sep) {
            sep.push(i);
        }
    }
    sep.push(xpath.length);
    return sep;
}
