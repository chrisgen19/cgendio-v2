import {Archivo} from 'next/font/google';

/** One family for the whole direction: the width axis sets the role (wide headline, normal text, condensed slug lines). */
export const archivo = Archivo({subsets: ['latin'], variable: '--font-in-register', axes: ['wdth'], display: 'swap'});
