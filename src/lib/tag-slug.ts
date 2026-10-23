import {slugify} from './slugify';

/**
 * The /blog?tag= value for a post tag. slugify keeps only a-z and 0-9, so a tag with neither ("日本語", an emoji) falls
 * back to its lowercased label instead of an empty slug. Different labels can share a slug ("C#" and "C++" are both
 * "c"); getPostTags groups them into one filter.
 */
export const tagSlug = (label: string) => slugify(label) || label.trim().toLowerCase();
