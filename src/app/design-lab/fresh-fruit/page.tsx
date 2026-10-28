import {ArrowLeft, ArrowUpRight} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import {directions} from '@/components/design-lab/fresh-fruit/content';
import blueprintPreview from '../../../../public/design-lab/fresh-fruit/previews/blueprint.jpg';
import cinematicPreview from '../../../../public/design-lab/fresh-fruit/previews/cinematic.jpg';
import editorialPreview from '../../../../public/design-lab/fresh-fruit/previews/editorial.jpg';
import kineticPreview from '../../../../public/design-lab/fresh-fruit/previews/kinetic.jpg';
import organicPreview from '../../../../public/design-lab/fresh-fruit/previews/organic.jpg';
import swissPreview from '../../../../public/design-lab/fresh-fruit/previews/swiss.jpg';
import styles from './lab.module.css';

const previewImages = {
  editorial: editorialPreview,
  cinematic: cinematicPreview,
  swiss: swissPreview,
  organic: organicPreview,
  blueprint: blueprintPreview,
  kinetic: kineticPreview,
};

export default function FreshFruitDesignLab() {
  return (
    <div className={styles.gallery}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          cgdiomampo.dev
        </Link>
        <Link href="/work/fresh-fruit-and-veg">
          <ArrowLeft size={16} aria-hidden="true" /> Current case study
        </Link>
      </header>
      <main id="main">
        <section className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Fresh Fruit and Veg Shop / Design explorations</p>
            <h1>
              One project.
              <br />
              <span>Six perspectives.</span>
            </h1>
          </div>
          <div className={styles.introCopy}>
            <p>Six ways to tell the story of a Glasgow subscription shop. Different compositions, different rhythms. The same real work.</p>
            <Link href="/design-lab/fresh-fruit/editorial">
              Start with the recommended direction <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <div className={styles.sectionLabel}>
          <span>Choose a direction</span>
          <span>01 — 06</span>
        </div>
        <section aria-label="Six case-study design directions" className={styles.grid}>
          {directions.map((direction) => (
            <article className={styles.direction} key={direction.slug}>
              <Link
                href={`/design-lab/fresh-fruit/${direction.slug}`}
                className={styles.preview}
                style={{'--preview-bg': direction.background, '--preview-color': direction.color} as CSSProperties}
                aria-label={`Explore ${direction.title}`}
              >
                <Image
                  src={previewImages[direction.slug]}
                  alt={`${direction.title} case-study design preview`}
                  width={1440}
                  height={960}
                  sizes="(max-width: 760px) calc(100vw - 40px), 46vw"
                  loading={direction.recommended ? 'eager' : 'lazy'}
                />
                <span className={styles.open}>
                  <ArrowUpRight size={22} aria-hidden="true" />
                </span>
              </Link>
              <div className={styles.directionTitle}>
                <span className={styles.number}>{direction.number}</span>
                <h2>
                  <Link href={`/design-lab/fresh-fruit/${direction.slug}`}>{direction.title}</Link>
                </h2>
                {direction.recommended ? <span className={styles.recommended}>Recommended</span> : null}
              </div>
              <p className={styles.description}>{direction.description}</p>
              <p className={styles.motion}>Motion: {direction.motion}</p>
            </article>
          ))}
        </section>
        <section className={styles.recommendation}>
          <div>
            <p className={styles.eyebrow}>The recommendation</p>
            <h2>Let the work do the talking.</h2>
          </div>
          <div>
            <p>
              The editorial direction balances a memorable first impression with a clear account of your contribution. Show the site early, make the
              role explicit, then explain the subscription and delivery system.
            </p>
            <p>
              That structure follows{' '}
              <a href="https://www.nngroup.com/articles/ux-design-portfolios/" rel="noreferrer">
                NN/g’s portfolio research
              </a>
              . Motion uses{' '}
              <a href="https://web.dev/articles/animations-guide" rel="noreferrer">
                transform and opacity
              </a>
              , with a static experience for reduced-motion preferences.
            </p>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>Fresh Fruit and Veg Shop · Portfolio case-study explorations</span>
        <span>Built to compare. Choose what feels like you.</span>
      </footer>
    </div>
  );
}
