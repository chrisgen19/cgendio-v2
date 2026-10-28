import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {directions} from '@/components/design-lab/fresh-fruit/content';

// Design previews may wait for their direction; each one is still statically prerendered.
export const instant = false;

const renderers = {
  editorial: async () => {
    const {Editorial} = await import('@/components/design-lab/fresh-fruit/editorial');
    return <Editorial />;
  },
  cinematic: async () => {
    const {Cinematic} = await import('@/components/design-lab/fresh-fruit/cinematic');
    return <Cinematic />;
  },
  swiss: async () => {
    const {Swiss} = await import('@/components/design-lab/fresh-fruit/swiss');
    return <Swiss />;
  },
  organic: async () => {
    const {Organic} = await import('@/components/design-lab/fresh-fruit/organic');
    return <Organic />;
  },
  blueprint: async () => {
    const {Blueprint} = await import('@/components/design-lab/fresh-fruit/blueprint');
    return <Blueprint />;
  },
  kinetic: async () => {
    const {Kinetic} = await import('@/components/design-lab/fresh-fruit/kinetic');
    return <Kinetic />;
  },
} as const;

export function generateStaticParams() {
  return directions.map(({slug}) => ({direction: slug}));
}

export async function generateMetadata({params}: {params: Promise<{direction: string}>}): Promise<Metadata> {
  const {direction} = await params;
  const current = directions.find(({slug}) => slug === direction);
  if (!current) notFound();
  return {title: current.title, description: current.description, robots: {index: false, follow: false}};
}

export default async function DirectionPage({params}: {params: Promise<{direction: string}>}) {
  const {direction} = await params;
  const current = directions.find(({slug}) => slug === direction);
  if (!current) notFound();
  return <div key={current.slug}>{await renderers[current.slug]()}</div>;
}
