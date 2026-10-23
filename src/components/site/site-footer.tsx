import {Logo} from '@/components/ui-site/logo';
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
    {href: '/blog', label: 'Blog'},
    ...PROFILES.flatMap(({key, label}) => (socials[key] ? [{href: socials[key], label}] : [])),
  ];
  return (
    <footer className="px-14 pt-10 pb-12 max-md:px-5">
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
        <span className="font-mono text-xs text-muted">© 2026 Cgdiomampo.dev · Built with Next.js · Deployed on Coolify</span>
      </div>
    </footer>
  );
}
