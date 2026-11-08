import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {directions, findDirection} from '@/components/design-lab/nav/content';
import {PreviewArticle} from '@/components/design-lab/nav/shared/preview-article';
import {PreviewHome} from '@/components/design-lab/nav/shared/preview-home';

// The home preview waits on the same content the real home page does
export const instant = false;

const headers = {
  ruler: async () => {
    const {RulerHeader} = await import('@/components/design-lab/nav/ruler/header');
    return RulerHeader;
  },
  dock: async () => {
    const {DockHeader} = await import('@/components/design-lab/nav/dock/header');
    return DockHeader;
  },
  transport: async () => {
    const {TransportHeader} = await import('@/components/design-lab/nav/transport/header');
    return TransportHeader;
  },
} as const;

export function generateStaticParams() {
  return directions.map(({slug}) => ({direction: slug}));
}

export async function generateMetadata({params}: {params: Promise<{direction: string}>}): Promise<Metadata> {
  const {direction} = await params;
  const current = findDirection(direction);
  if (!current) notFound();
  return {title: current.title, description: current.description, robots: {index: false, follow: false}};
}

export default async function NavDirectionPage({
  params,
  searchParams,
}: {
  params: Promise<{direction: string}>;
  searchParams: Promise<{view?: string}>;
}) {
  const [{direction}, {view}] = await Promise.all([params, searchParams]);
  const current = findDirection(direction);
  if (!current) notFound();
  const Header = await headers[current.slug]();
  const article = view === 'article';

  return (
    <div key={`${current.slug}-${article ? 'article' : 'home'}`}>
      <Header overlay={!article} />
      {article ? <PreviewArticle direction={current} /> : <PreviewHome />}
    </div>
  );
}
