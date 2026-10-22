import {Bricolage_Grotesque, Geist, Geist_Mono} from 'next/font/google';

export const display = Bricolage_Grotesque({subsets: ['latin'], variable: '--font-bricolage', axes: ['opsz'], display: 'swap'});
export const body = Geist({subsets: ['latin'], variable: '--font-geist', display: 'swap'});
export const mono = Geist_Mono({subsets: ['latin'], variable: '--font-geist-mono', weight: ['400', '500'], display: 'swap'});
