import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {type DirectionSlug, directions} from '@/components/design-lab/hero-film/content';

// Design previews may wait for their direction; each one is still statically prerendered.
export const instant = false;

const renderers: Record<DirectionSlug, () => Promise<ReactNode>> = {
  'long-take': async () => {
    const {LongTake} = await import('@/components/design-lab/hero-film/long-take/long-take');
    return <LongTake />;
  },
  redline: async () => {
    const {Redline} = await import('@/components/design-lab/hero-film/redline/redline');
    return <Redline />;
  },
  'pull-request': async () => {
    const {PullRequest} = await import('@/components/design-lab/hero-film/pull-request/pull-request');
    return <PullRequest />;
  },
  departures: async () => {
    const {Departures} = await import('@/components/design-lab/hero-film/departures/departures');
    return <Departures />;
  },
  'in-register': async () => {
    const {InRegister} = await import('@/components/design-lab/hero-film/in-register/in-register');
    return <InRegister />;
  },
};

export function generateStaticParams() {
  return directions.map(({slug}) => ({direction: slug}));
}

export async function generateMetadata({params}: {params: Promise<{direction: string}>}): Promise<Metadata> {
  const {direction} = await params;
  const current = directions.find(({slug}) => slug === direction);
  if (!current) notFound();
  return {title: current.title, description: current.description, robots: {index: false, follow: false}};
}

export default async function HeroDirectionPage({params}: {params: Promise<{direction: string}>}) {
  const {direction} = await params;
  const current = directions.find(({slug}) => slug === direction);
  if (!current) notFound();
  return <div key={current.slug}>{await renderers[current.slug]()}</div>;
}
