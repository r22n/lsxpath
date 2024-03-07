import { lsxpath } from './lsxpath';
import { fromxpath } from './fromxpath';
import { Varcom } from 'varcom.js';


export {
    lsxpath,
    fromxpath,
};

export const defopt: Opt = {
    sep: '/',
    at: '@',
    lbrace: '[',
    rbrace: ']',
    eq: '=',
    quot: '"',
    filterspec: ['id', 'key', 'name']
};

export type XPath = {
    xpath: string;
    value: string;
}

export type Opt = {
    sep?: string;
    at?: string;
    lbrace?: string;
    rbrace?: string;
    eq?: string;
    quot?: string;
    filterspec?: string[];
    autofilter?: {
        spec: string;
        id: Varcom;
    };
}