import styles from './in-register.module.css';

/** The four process inks. Key (black) is the registration reference: it never moves, the other three slide onto it. */
export type Ink = 'c' | 'm' | 'y' | 'k';

/** The three work cards: each block is an overprint of two inks, so misregistration shows as colour fringes. */
const CARDS = [
  {label: 'WordPress', inks: 'cm', art: 'article'},
  {label: 'WooCommerce', inks: 'my', art: 'store'},
  {label: 'Next.js and React', inks: 'cy', art: 'app'},
] as const;

/** Colour bar patches, as the inks each one prints on. */
const PATCHES = ['c', 'm', 'y', 'k', 'cm', 'my', 'cy', 'cmy'];

const TARGETS = ['top', 'bottom', 'left', 'right'] as const;
const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

function Target({side}: {side: (typeof TARGETS)[number]}) {
  return (
    <svg className={styles.target} data-side={side} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Printer's marks: on every plate, in that plate's ink (registration colour), so they split apart when out of register. */
function Marks({ink}: {ink: Ink}) {
  return (
    <>
      {CORNERS.map((corner) => (
        <span key={corner} className={styles.crop} data-corner={corner} />
      ))}
      {TARGETS.map((side) => (
        <Target key={side} side={side} />
      ))}
      <span className={styles.colourBar}>
        {PATCHES.map((patch) => (
          <span key={patch} className={patch.includes(ink) ? styles.fill : undefined} />
        ))}
      </span>
    </>
  );
}

function CardArt({kind, on}: {kind: (typeof CARDS)[number]['art']; on: boolean}) {
  const line = on ? styles.rule : styles.blankRule;
  if (kind === 'store')
    return (
      <span className={styles.artStore}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={line} />
        ))}
      </span>
    );
  if (kind === 'app')
    return (
      <span className={styles.artApp}>
        <span className={line} />
        <span className={line} />
      </span>
    );
  return (
    <span className={styles.artArticle}>
      <span className={line} />
      <span className={line} />
      <span className={line} />
    </span>
  );
}

/**
 * One separation of the proof. Every plate renders the same layout, so all four line up exactly when in register;
 * each element only takes ink on the plates listed for it. The key plate holds the real, readable DOM text and link;
 * the others are hidden from assistive tech and inert.
 */
export function ProofPlate({ink, worksHref}: {ink: Ink; worksHref: string}) {
  const isKey = ink === 'k';
  const on = (inks: string) => inks.includes(ink);
  const text = (inks: string) => (on(inks) ? styles.ink : styles.blank);

  return (
    <div className={styles.plate} data-ink={ink} aria-hidden={isKey ? undefined : true} inert={isKey ? undefined : true}>
      <span className={styles.marks}>
        <Marks ink={ink} />
        <span className={`${styles.slug} ${text('k')}`}>
          <span>Christian Diomampo</span>
          <span>Home page, hero</span>
          <span>Press proof</span>
        </span>
      </span>

      <div className={styles.trim}>
        {/* A printed job label, not a navigation: the real site header sits above the hero */}
        <p className={`${styles.label} ${text('k')}`}>Christian Diomampo</p>

        {/* Rich black: printed on all four plates, so a misregistered plate shows as a coloured fringe */}
        <p className={`${styles.headline} ${text('cmyk')}`}>I design, build &amp; ship websites that work.</p>

        <div className={styles.row}>
          <p className={`${styles.lede} ${text('k')}`}>
            One developer from first question to live URL. WordPress, WooCommerce, Next.js and React, built for the people who&apos;ll actually use
            them.
          </p>
          {isKey ? (
            <a href={worksHref} className={styles.cta}>
              See my work
            </a>
          ) : (
            <span className={`${styles.cta} ${styles.ctaBlank}`}>See my work</span>
          )}
        </div>

        <div className={styles.cards} aria-hidden="true">
          {CARDS.map((card) => (
            <span key={card.label} className={styles.card}>
              <span className={`${styles.block} ${on(card.inks) ? styles.tint : ''}`}>
                <CardArt kind={card.art} on={isKey} />
              </span>
              <span className={`${styles.cardLabel} ${text('k')}`}>{card.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
