import {Logo} from '@/components/ui-site/logo';

// LinkedIn stays on #contact (as in the canvas) until the profile URL is provided
const FOOTER_LINKS = [
  {href: '#work', label: 'Work'},
  {href: '#blog', label: 'Blog'},
  {href: 'https://github.com/chrisgen19', label: 'GitHub'},
  {href: '#contact', label: 'LinkedIn'},
] as const;

export function SiteFooter() {
  return (
    <footer className="px-14 pt-10 pb-12 max-md:px-5">
      <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-5 border-t border-line pt-8">
        <Logo />
        <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
          {FOOTER_LINKS.map((link) => (
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
