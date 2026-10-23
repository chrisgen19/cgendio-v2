import {Button} from '@/components/ui-site/button';
import {blogHref} from '@/lib/blog-url';

type PaginationProps = {
  page: number;
  pageCount: number;
  /** The active tag slug, kept on the page links */
  tag: string | null;
};

/** "Newer posts" / "Older posts" for /blog. Hidden when everything fits on one page. */
export function Pagination({page, pageCount, tag}: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-4 pt-10">
      {page > 1 ? (
        <Button href={blogHref({tag, page: page - 1})} variant="secondary" size="sm">
          Newer posts
        </Button>
      ) : (
        <span />
      )}
      <span className="font-mono text-[13px] text-muted">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Button href={blogHref({tag, page: page + 1})} variant="secondary" size="sm">
          Older posts
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}
