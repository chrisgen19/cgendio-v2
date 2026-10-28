import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {PreviewToolbar} from '@/components/design-lab/fresh-fruit/preview-toolbar';
import styles from './lab.module.css';

export const metadata: Metadata = {
  title: {default: 'Fresh Fruit — Design explorations', template: '%s · Fresh Fruit design lab'},
  description: 'Six visual directions for the Fresh Fruit and Veg Shop portfolio case study.',
  robots: {index: false, follow: false},
};

export default function DesignLabLayout({children}: {children: ReactNode}) {
  return (
    <div className={styles.lab}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <PreviewToolbar />
      {children}
    </div>
  );
}
