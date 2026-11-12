/** Escapes regex metacharacters, so seeded copy can go into a `RegExp` and still match literally. */
export const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
