import {Logo} from '@/components/ui-site/logo';
import {SocialIcon} from '@/components/ui-site/social-icon';
import {SITE_NAME} from '@/lib/metadata';
import {getSiteSettings} from '@/server/content';

/** Profiles from admin Settings (socials); each link is hidden until its URL is set. */
const PROFILES = [
  {key: 'github', label: 'GitHub'},
  {key: 'linkedin', label: 'LinkedIn'},
] as const;

const PAGES = [
  {href: '/#work', label: 'Work'},
  {href: '/writing', label: 'Blog'},
];

const LINK = 'inline-flex min-h-11 items-center text-sm text-ink no-underline hover:text-ink';

export async function SiteFooter() {
  const {socials} = await getSiteSettings();
  const profiles = PROFILES.flatMap(({key, label}) => (socials[key] ? [{key, label, href: socials[key]}] : []));
  return (
    /*
     * The last thing on the page, so it carries the bottom inset: `viewport-fit: cover` (#112) puts the home
     * indicator over the final 34px, which would otherwise sit on top of the footer links. The side padding matches
     * Container's, insets included, since the footer sets its own rather than using one.
     */
    <footer className="pt-10 pb-[calc(3rem+var(--safe-bottom))] pl-(--pad-l) pr-(--pad-r)">
      <div className="mx-auto flex max-w-site flex-col gap-5">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav aria-label="Footer">
            <ul className="-mx-3 my-0 flex list-none flex-wrap items-center gap-1 p-0">
              {PAGES.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={`${LINK} px-3`}>
                    {link.label}
                  </a>
                </li>
              ))}
              {/* Icon only, so each is a 44px square around the mark; the label stays as its accessible name */}
              {profiles.map((profile) => (
                <li key={profile.key}>
                  <a href={profile.href} rel="me noopener" title={profile.label} className={`${LINK} min-w-11 justify-center`}>
                    <SocialIcon name={profile.key} className="size-[18px]" />
                    <span className="sr-only">{profile.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="m-0 flex flex-col gap-x-1 gap-y-1 font-mono text-xs text-muted md:flex-row">
          <span>© 2026 {SITE_NAME}</span>
          <span className="text-balance">
            <span className="max-md:hidden"> · </span>Built with Next.js · Deployed on Coolify
          </span>
        </p>
      </div>
    </footer>
  );
}
