'use client';

import {type KeyboardEvent, useEffect, useId, useRef, useState} from 'react';
import {MOBILE_NAV_LINKS} from './nav-links';

/**
 * Menu button and disclosure panel for phones (under 860px). While open, focus moves to the first link,
 * Tab cycles between the button and the links, and Esc, an outside click or a link closes it.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector('a')?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 860px)');
    const onResize = () => desktop.matches && setOpen(false);

    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      toggleRef.current?.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const links = panelRef.current?.querySelectorAll('a');
    const last = links?.[links.length - 1];
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      toggleRef.current?.focus();
    } else if (event.shiftKey && document.activeElement === toggleRef.current) {
      event.preventDefault();
      last?.focus();
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: keydown only scopes Tab and Esc handling to the button and panel
    <div ref={rootRef} onKeyDown={onKeyDown} className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-pill border border-line bg-white/88 px-3.5 text-ink backdrop-blur-[8px] hover:border-ink"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className="absolute inset-x-4 top-[76px] z-30 flex flex-col rounded-card border border-line bg-white p-2.5 shadow-menu"
      >
        {MOBILE_NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center rounded-[14px] px-3.5 font-medium text-ink no-underline hover:bg-ground hover:text-ink"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
