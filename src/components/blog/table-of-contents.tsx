import type {TocItem} from '@/lib/markdown-plugins';

/** "On this page": the post's h2s, shown only for posts with three or more. */
export function TableOfContents({items}: {items: TocItem[]}) {
  if (items.length < 3) return null;
  return (
    <nav aria-labelledby="toc-heading" className="flex flex-col gap-3">
      <p id="toc-heading" className="m-0 font-mono text-[13px] leading-none font-medium tracking-[0.08em] text-muted uppercase">
        On this page
      </p>
      <ol className="m-0 flex list-none flex-col border-l border-line p-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-ml-px flex min-h-11 items-center border-l border-transparent pl-4 text-[15px] leading-snug text-ink no-underline hover:border-accent hover:text-accent"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
