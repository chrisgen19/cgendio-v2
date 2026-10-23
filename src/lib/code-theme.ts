import {createCssVariablesTheme} from 'shiki';

/**
 * Shiki theme for code blocks in posts and case studies. It writes CSS variables (--shiki-*) instead of colours, and
 * src/app/globals.css maps them to the code tokens from the canvas's editor windows, so no hex values live here.
 */
export const CODE_THEME = createCssVariablesTheme({name: 'cgdiomampo-code', variablePrefix: '--shiki-', fontStyle: true});
