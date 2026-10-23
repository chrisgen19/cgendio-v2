import {PostRow} from '@/components/blog/post-row';
import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy, getPosts} from '@/server/content';

export async function BlogTeaser() {
  const [posts, copy] = await Promise.all([getPosts({limit: 4}), getPageCopy()]);
  return (
    <Section id="blog" innerClassName="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-start gap-16 max-md:grid-cols-1 max-md:gap-8">
      <div data-reveal className="flex flex-col gap-[18px]">
        <Eyebrow>{copy['blog.eyebrow']}</Eyebrow>
        <SectionHeading>
          <MarkedText text={copy['blog.heading']} />
        </SectionHeading>
        <p className="m-0 max-w-[360px] text-base leading-[1.55] text-muted">{copy['blog.lede']}</p>
        <Button href="/blog" size="sm" className="mt-2 self-start">
          {copy['blog.allLabel']}
        </Button>
      </div>
      <ul className="m-0 flex list-none flex-col border-b border-line p-0">
        {posts.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </ul>
    </Section>
  );
}
