'use client';

import {ArrowRight, Menu, X} from 'lucide-react';
import {Dialog} from 'radix-ui';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui-site/button';
import styles from './mobile-menu.module.css';
import {NAV_ITEMS, resolveHref, SECTION_LABELS} from './nav-links';

type MobileMenuProps = {
  sectionsOnThisPage: boolean;
  marked: string | null;
};

export function MobileMenu({sectionsOnThisPage, marked}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 860px)');
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  const trigger = (
    <button type="button" className={styles.trigger} aria-label="Menu">
      <span>Menu</span>
      <Menu aria-hidden="true" size={18} />
    </button>
  );

  const links = (
    <nav aria-label="Main">
      <ul className={styles.links}>
        {NAV_ITEMS.map((item, index) => {
          const current = item.id !== undefined && item.id === marked;
          return (
            <li key={item.href}>
              <a
                href={resolveHref(item, sectionsOnThisPage)}
                aria-current={current ? 'true' : undefined}
                onClick={() => setOpen(false)}
                className={styles.link}
              >
                <span aria-hidden="true" className={styles.index}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.label}>{item.label}</span>
                <ArrowRight aria-hidden="true" size={18} className={styles.arrow} />
              </a>
            </li>
          );
        })}
      </ul>
      <div className={styles.footer}>
        <Button href="/contact" onClick={() => setOpen(false)} className={styles.cta}>
          Let&apos;s talk <ArrowRight aria-hidden="true" size={18} />
        </Button>
      </div>
    </nav>
  );

  const readout = (
    <span className={styles.readout}>
      <span aria-hidden="true" className={styles.dash} />
      {marked ? `Viewing ${SECTION_LABELS[marked]}` : 'Explore the site'}
    </span>
  );

  return (
    <div className="md:hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.backdrop} />
          <Dialog.Content aria-describedby={undefined} className={styles.panel}>
            <div className={styles.panelHeader}>
              <Dialog.Title className={styles.title}>Navigation</Dialog.Title>
              <Dialog.Close className={styles.close} aria-label="Close menu">
                <X aria-hidden="true" size={20} />
              </Dialog.Close>
            </div>
            <div className={styles.context}>{readout}</div>
            {links}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
