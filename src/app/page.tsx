import {HomePage} from '@/components/sections/home-page';
import {JsonLd} from '@/components/site/json-ld';
import {HOME_TITLE, pageMetadata, SITE_DESCRIPTION} from '@/lib/metadata';
import {homeJsonLd} from '@/lib/structured-data';
import {getPageCopy, getSiteSettings, getStack} from '@/server/content';

export const metadata = pageMetadata({
  title: {absolute: HOME_TITLE},
  description: SITE_DESCRIPTION,
  path: '/',
});

export default async function Home() {
  // The stack strip doubles as the Person's knowsAbout, so the structured data never names a tool the site doesn't show
  const [copy, settings, stack] = await Promise.all([getPageCopy(), getSiteSettings(), getStack()]);
  return (
    <>
      <JsonLd data={homeJsonLd(copy, settings, stack, HOME_TITLE)} />
      <HomePage />
    </>
  );
}
