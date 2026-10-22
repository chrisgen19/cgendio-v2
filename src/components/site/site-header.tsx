import {Button} from '@/components/ui-site/button';
import {Container} from '@/components/ui-site/container';
import {Logo} from '@/components/ui-site/logo';
import {cn} from '@/lib/cn';
import {getSiteSettings} from '@/server/content';
import {MobileMenu} from './mobile-menu';
import {NAV_LINKS} from './nav-links';

type SiteHeaderProps = {
  /** Sit transparently on top of the hero instead of taking space in the flow. */
  overlay?: boolean;
};

export async function SiteHeader({overlay = false}: SiteHeaderProps) {
  const settings = await getSiteSettings();
  return (
    <header className={cn('inset-x-0 top-0 z-30', overlay ? 'absolute' : 'relative')}>
      <Container>
        <nav aria-label="Main" className="flex items-center justify-between gap-4 py-[22px] max-md:py-4">
          <Logo />
          <ul className="m-0 flex list-none gap-0.5 rounded-pill border border-line bg-white/82 p-1 backdrop-blur-[10px] max-md:hidden">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative inline-flex min-h-10 items-center rounded-pill px-[15px] text-sm font-medium text-ink no-underline after:absolute after:-inset-y-0.5 after:inset-x-0 after:content-[''] hover:bg-ground hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            {/* Switched off in the admin's settings: hidden rather than inventing a "closed" message */}
            {settings.openToProjects ? (
              <span className="inline-flex items-center gap-2 font-mono text-xs leading-none font-medium text-muted max-md:hidden">
                <i className="block size-2 rounded-full bg-status shadow-[0_0_0_4px_rgba(22,163,74,0.15)]" />
                Open to projects
              </span>
            ) : null}
            <Button href="#contact" size="sm">
              Let&apos;s talk
            </Button>
            <MobileMenu />
          </div>
        </nav>
      </Container>
    </header>
  );
}
