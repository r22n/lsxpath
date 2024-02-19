import { lsxpath } from './lsxpath';
import { fromxpath } from './fromxpath';

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
}