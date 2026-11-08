import {Logo} from '@/components/ui-site/logo';
import {SITE_NAME} from '@/lib/metadata';
import {getSiteSettings} from '@/server/content';

/** Profiles from admin Settings (socials); each link is hidden until its URL is set. */
const PROFILES = [
  {key: 'github', label: 'GitHub'},
  {key: 'linkedin', label: 'LinkedIn'},
] as const;

export async function SiteFooter() {
  const {socials} = await getSiteSettings();
  const links = [
    {href: '/#work', label: 'Work'},
    {href: '/writing', label: 'Blog'},
    ...PROFILES.flatMap(({key, label}) => (socials[key] ? [{href: socials[key], label}] : [])),
  ];
  return (
    /*
     * The last thing on the page, so it carries the bottom inset: `viewport-fit: cover` (#112) puts the home
     * indicator over the final 34px, which would otherwise sit on top of the footer links. The side padding matches
     * Container's, insets included, since the footer sets its own rather than using one.
     */
    <footer className="pt-10 pb-[calc(3rem+var(--safe-bottom))] pl-(--pad-l) pr-(--pad-r)">
      <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-5 border-t border-line pt-8">
        <Logo />
        <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="inline-flex min-h-11 items-center px-3 text-sm text-ink no-underline hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="font-mono text-xs text-muted">© 2026 {SITE_NAME} · Built with Next.js · Deployed on Coolify</span>
      </div>
    </footer>
  );
}
