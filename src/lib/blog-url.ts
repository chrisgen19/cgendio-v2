/** A /blog index URL for a tag filter and page; page 1 and "all tags" are left out of the query. */
export const blogHref = ({tag, page = 1}: {tag?: string | null; page?: number}) => {
  const query = new URLSearchParams();
  if (tag) query.set('tag', tag);
  if (page > 1) query.set('page', String(page));
  const search = query.toString();
  return search ? `/blog?${search}` : '/blog';
};
