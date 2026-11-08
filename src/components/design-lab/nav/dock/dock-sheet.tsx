// No 'use client' directive: header.tsx is the client entry and this is only ever imported from it. Marking this an
// entry too would make `onClose` look like a prop crossing the server boundary, which it never does.
import {ArrowUpRight} from 'lucide-react';
import {type RefObject, useEffect, useRef} from 'react';
import {ThemeMenuItem} from '@/components/site/theme-toggle';
import {cn} from '@/lib/cn';
import {NAV_ITEMS, SECTION_IDS} from '../shared/nav-items';
import styles from './dock.module.css';

type DockSheetProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Focus goes back here when the sheet closes. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** The section crossing the reading line, so the sheet can say where the reader already is. */
  active: string | null;
  /** The nav's sections live on this page, so the links are same-page targets. */
  sectionsOnThisPage: boolean;
};

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * The dock's phone treatment: a full-screen ink sheet under the plate, so the plate stays visible on top of it and
 * the button that opened the sheet is the button that closes it.
 *
 * It is the same surface as the docked plate rather than a white dropdown, so the menu reads as the plate opening
 * out rather than as a second, unrelated object.
 */
export function DockSheet({id, open, onClose, triggerRef, active, sectionsOnThisPage}: DockSheetProps) {
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const column = columnRef.current;
    column?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const {overflow} = document.body.style;
    document.body.style.overflow = 'hidden';

    /*
     * A sheet this size has no "outside" in the usual sense, so a tap dismisses it unless it landed on something
     * that does a job: the trigger (which toggles) or a link inside the sheet (which navigates and closes anyway).
     */
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (triggerRef.current?.contains(target)) return;
      if (column?.contains(target) && target.closest?.('a[href], button')) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      // The trigger sits outside the sheet, so the ring is [trigger, ...sheet]
      const stops = [triggerRef.current, ...Array.from(column?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(Boolean) as HTMLElement[];
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, triggerRef]);

  useEffect(() => {
    if (open) return;
    // Only pull focus back if it is still inside the sheet that just closed
    if (columnRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
  }, [open, triggerRef]);

  return (
    <div
      id={id}
      hidden={!open}
      data-ink-stage=""
      className={cn(styles.sheet, 'fixed inset-0 flex-col bg-white px-5 pt-(--header-h) pb-12 md:hidden', open ? 'flex' : 'hidden')}
    >
      <div ref={columnRef} className="flex min-h-0 flex-1 flex-col">
        {/* Centred rather than stacked under the plate: a full-screen sheet with a list clinging to its top edge reads as a dropdown that overran */}
        <nav aria-label="Main" className="my-auto flex flex-col py-6">
          {NAV_ITEMS.map((item) => {
            const current = item.id !== undefined && item.id === active;
            return (
              <a
                key={item.href}
                href={sectionsOnThisPage && item.id ? `#${item.id}` : item.href}
                aria-current={current ? 'true' : undefined}
                onClick={onClose}
                className="flex min-h-16 items-center justify-between gap-4 border-b border-line font-display text-[32px] leading-none font-bold tracking-[-0.03em] text-ink no-underline hover:text-ink"
              >
                <span className="relative">
                  {/* The site's own highlighter, doing the job it already does under every section heading */}
                  {current ? <i aria-hidden="true" className="absolute inset-x-[-0.06em] bottom-[0.07em] block h-[0.36em] bg-highlight" /> : null}
                  <span className={cn('relative', current && 'text-highlight-ink')}>{item.label}</span>
                </span>
                {item.kind === 'route' ? (
                  // The one link that leaves this page, and so the one that can never report a position
                  <ArrowUpRight aria-hidden="true" size={18} className="text-muted" />
                ) : (
                  <span className="font-mono text-xs leading-none font-medium tracking-[0.08em] text-muted uppercase">
                    {String((SECTION_IDS as readonly string[]).indexOf(item.id ?? '') + 1).padStart(2, '0')}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* No "Let's talk" down here: the plate keeps its own, visible above this sheet, which is the whole point of it */}
        <div className="flex shrink-0 flex-col">
          <ThemeMenuItem />
          <p className="m-0 flex items-center gap-2 px-3.5 pt-4 font-mono text-xs leading-none font-medium text-muted">
            <i aria-hidden="true" className="block size-2 rounded-full bg-status shadow-[0_0_0_4px_rgba(22,163,74,0.15)]" />
            Open to projects
          </p>
        </div>
      </div>
    </div>
  );
}
