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
exports.lsxpath = void 0;
var xml_js_1 = require("xml-js");
var _1 = require(".");
var varcom_js_1 = require("varcom.js");
function lsxpath(xml, opt) {
    if (!xml.trim()) {
        return [];
    }
    opt = __assign(__assign({}, _1.defopt), opt);
    var cursors = [{ xpath: '', see: JSON.parse((0, xml_js_1.xml2json)(xml, { compact: true })) }];
    var r = [];
    while (cursors.length) {
        var cursor = cursors.pop();
        if (!container(cursor, cursors, opt)) {
            r.push({
                xpath: cursor.xpath,
                value: "".concat(cursor.see)
            });
        }
    }
    return r;
}
exports.lsxpath = lsxpath;
function container(cursor, cursors, opt) {
    if (arychild(cursor, cursors, opt)) {
        return true;
    }
    else if (ochild(cursor, cursors, opt)) {
        return true;
    }
}
function arychild(cursor, cursors, opt) {
    var see = cursor.see, xpath = cursor.xpath;
    if (!Array.isArray(see)) {
        return false;
    }
    filterifneed(see, opt);
    see.forEach(function (x) {
        cursors.push({
            xpath: xpath,
            see: x
        });
    });
    return true;
}
function ochild(cursor, cursors, opt) {
    var see = cursor.see, xpath = cursor.xpath, inattr = cursor.inattr;
    if (typeof see !== 'object') {
        return false;
    }
    // /path/to/el
    var cwp = xpath;
    // /path/to/el[@spec="id"]
    var filter = keybind(see, opt);
    if (filter) {
        cwp = "".concat(cwp).concat(opt.lbrace).concat(opt.at).concat(filter.spec).concat(opt.eq).concat(opt.quot).concat(filter.id).concat(opt.quot).concat(opt.rbrace);
    }
    var children = Object.entries(see);
    if (children.length) {
        children.forEach(function (_a) {
            var el = _a[0], x = _a[1];
            var next = cwp;
            if (inattr) {
                // /path/to/el/@attr
                next = "".concat(next).concat(opt.sep).concat(opt.at).concat(el);
            }
            else if (!(el === '_attributes' || el === '_text' || el === '_cdata')) {
                // dump 'el' into xpath if 'el' was container
                // /path/to/el/child
                next = "".concat(next).concat(opt.sep).concat(el);
            }
            cursors.push({
                see: x,
                xpath: next,
                inattr: el === '_attributes'
            });
        });
    }
    else {
        // dump empty xpath for such as '<a/>' '<a></a>'
        cursors.push({
            see: '',
            xpath: cwp
        });
    }
    return true;
}
function filterifneed(children, opt) {
    if (!(opt.autofilter && children.some(function (x) { return !x._attributes; }))) {
        return;
    }
    var _a = opt.autofilter, spec = _a.spec, id = _a.id;
    children.forEach(function (x, i) {
        if (!x._attributes) {
            x._attributes = {};
        }
        var index = "".concat(i);
        x._attributes[spec] = (0, varcom_js_1.run)(id, { index: index });
    });
}
function keybind(xml, opt) {
    var _a;
    var a = xml._attributes;
    if (!a) {
        return;
    }
    var spec = (_a = opt.filterspec) === null || _a === void 0 ? void 0 : _a.find(function (spec) { return a[spec] != null; });
    if (!spec) {
        return;
    }
    var id = a[spec];
    return { spec: spec, id: "".concat(id) };
}
