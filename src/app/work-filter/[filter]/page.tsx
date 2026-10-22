import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {HomePage} from '@/components/sections/home-page';
import type {WorkFilter} from '@/lib/work-filter';

/**
 * The home page with a Work filter applied, prerendered once per filter. Visitors never see this path:
 * next.config.ts rewrites `/?filter=client` here, so the filter works without JavaScript and `/` stays static.
 */
const FILTERS = ['client', 'personal'] as const satisfies readonly WorkFilter[];
type VariantFilter = (typeof FILTERS)[number];

const isVariantFilter = (value: string): value is VariantFilter => (FILTERS as readonly string[]).includes(value);

export const generateStaticParams = () => FILTERS.map((filter) => ({filter}));

export const metadata: Metadata = {
  robots: {index: false},
  alternates: {canonical: '/'},
};

export default async function FilteredHome({params}: PageProps<'/work-filter/[filter]'>) {
  // dynamicParams = false isn't allowed with Cache Components, so anything outside the prerendered set is a 404 here
  const {filter} = await params;
  if (!isVariantFilter(filter)) notFound();
  return <HomePage filter={filter} />;
}
