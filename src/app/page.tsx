import {HomePage} from '@/components/sections/home-page';
import {JsonLd} from '@/components/site/json-ld';
import {pageMetadata, SITE_DESCRIPTION, SITE_NAME} from '@/lib/metadata';
import {homeJsonLd} from '@/lib/structured-data';
import {getPageCopy, getSiteSettings} from '@/server/content';

export const metadata = pageMetadata({
  title: {absolute: `${SITE_NAME} · Web design and development studio`},
  description: SITE_DESCRIPTION,
  path: '/',
});

export default async function Home() {
  const [copy, settings] = await Promise.all([getPageCopy(), getSiteSettings()]);
  return (
    <>
      <JsonLd data={homeJsonLd(copy, settings)} />
      <HomePage />
    </>
  );
}
