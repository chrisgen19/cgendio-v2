/**
 * Admin copy marks the words that get the lime highlighter with `[[...]]` (see MarkedText). Anywhere the copy has to
 * be plain text, such as a share card or a meta description, the markers come off and the words stay.
 */
export const stripMarkers = (text: string) => text.replaceAll(/\[\[(.+?)\]\]/g, '$1');
