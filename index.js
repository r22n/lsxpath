"use strict";
exports.__esModule = true;
exports.defopt = exports.fromxpath = exports.lsxpath = void 0;
var lsxpath_1 = require("./lsxpath");
exports.lsxpath = lsxpath_1.lsxpath;
var fromxpath_1 = require("./fromxpath");
exports.fromxpath = fromxpath_1.fromxpath;
exports.defopt = {
    sep: '/',
    at: '@',
    lbrace: '[',
    rbrace: ']',
    eq: '=',
    quot: '"',
    filterspec: ['id', 'key', 'name']
};
