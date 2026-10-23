import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

/*
 * next/og needs TTF/OTF (next/font only ships woff2), so static instances of the site fonts live in ./fonts, with
 * their SIL OFL licences. Read once per process.
 */
const fontDir = join(process.cwd(), 'src/app/_og/fonts');
const [display, body, mono] = await Promise.all(
  ['bricolage-grotesque-700.ttf', 'geist-600.ttf', 'geist-mono-500.ttf'].map((file) => readFile(join(fontDir, file))),
);

export const DISPLAY_FONT = {name: 'Bricolage Grotesque', data: display, weight: 700, style: 'normal'} as const;

export const OG_FONTS = [
  DISPLAY_FONT,
  {name: 'Geist', data: body, weight: 600, style: 'normal'},
  {name: 'Geist Mono', data: mono, weight: 500, style: 'normal'},
] as const;
