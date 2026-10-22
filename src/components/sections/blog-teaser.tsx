import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPosts} from '@/server/content';

// "Oct 2026": the canvas shows month and year only
const MONTH_YEAR = new Intl.DateTimeFormat('en', {month: 'short', year: 'numeric', timeZone: 'UTC'});

export async function BlogTeaser() {
  const posts = await getPosts({limit: 4});
  return (
    <Section id="blog" innerClassName="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-start gap-16 max-md:grid-cols-1 max-md:gap-8">
      <div data-reveal className="flex flex-col gap-[18px]">
        <Eyebrow>Dev notes &amp; tech news</Eyebrow>
        <SectionHeading>
          From the <Mark>blog.</Mark>
        </SectionHeading>
        <p className="m-0 max-w-[360px] text-base leading-[1.55] text-muted">
          Field notes on migrations, Next.js, WordPress and AI-assisted development.
        </p>
        {/* Posts arrive in Phase 6; until then these links stay on #blog, as in the canvas */}
        <Button href="#blog" size="sm" className="mt-2 self-start">
          All articles
        </Button>
      </div>
      <ul className="m-0 flex list-none flex-col border-b border-line p-0">
        {posts.map((post) => (
          <li key={post.slug} data-reveal>
            <a
              href="#blog"
              className="group grid grid-cols-[120px_minmax(0,1fr)_90px_44px] items-center gap-6 border-t border-line py-7 text-ink no-underline hover:text-ink max-md:grid-cols-[minmax(0,1fr)_44px] max-md:gap-3"
            >
              <span className="font-mono text-[13px] text-muted max-md:hidden">{MONTH_YEAR.format(new Date(post.date))}</span>
              <span className="flex flex-col gap-2.5">
                <span className="font-mono text-[11px] tracking-[0.06em] text-accent">{post.tag}</span>
                <span className="font-display text-[26px] leading-[1.15] font-[650] tracking-[-0.025em] transition-colors duration-200 group-hover:text-accent">
                  {post.title}
                </span>
              </span>
              <span className="font-mono text-[13px] text-muted max-md:hidden">{post.readMinutes} min</span>
              <span className="inline-grid size-11 place-items-center rounded-full border border-line transition-all duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
