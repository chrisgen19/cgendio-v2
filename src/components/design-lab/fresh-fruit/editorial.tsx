import {ArrowDown, ArrowRight, ArrowUpRight} from 'lucide-react';
import Image from 'next/image';
import {freshFruit} from './content';
import styles from './editorial.module.css';
import {Reveal} from './reveal';

export function Editorial() {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="/" aria-label="Cgdiomampo home">
          cg<span>diomampo.</span>
        </a>
        <nav aria-label="Portfolio navigation" className={styles.navigation}>
          <a href="/#work">Selected work</a>
          <a href="/contact">
            Let’s talk <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="editorial-title">
        <div className={styles.heroTopline}>
          <span>SELECTED WORK / 06</span>
          <span>COMMERCE & SUBSCRIPTIONS</span>
        </div>
        <div className={styles.heroCopy}>
          <h1 id="editorial-title" className={styles.title}>
            <span>Fresh Fruit</span>
            <span>
              & Veg Shop<span className={styles.period}>.</span>
            </span>
          </h1>
          <div className={styles.heroAside}>
            <p>
              Weekly deliveries.
              <br />
              Thoughtful commerce.
            </p>
            <a className={styles.textLink} href={freshFruit.liveUrl} target="_blank" rel="noreferrer">
              Visit the live site <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <div className={styles.mediaMeta}>
            <span>FRESHFRUITANDVEGSHOP.COM</span>
            <span>WORDPRESS / WOOCOMMERCE</span>
          </div>
          <a href={freshFruit.liveUrl} target="_blank" rel="noreferrer" className={styles.sitePreview} aria-label="Visit Fresh Fruit and Veg Shop">
            <Image
              src={freshFruit.coverImage}
              alt="Fresh Fruit and Veg Shop website with its green storefront and fruit and vegetable delivery boxes"
              width={1600}
              height={900}
              sizes="(max-width: 700px) 100vw, 86vw"
              preload
              className={styles.siteImage}
            />
          </a>
          <div className={styles.mediaCaption}>
            <span>A weekly delivery. A recurring relationship.</span>
            <a href="#editorial-overview">
              The story <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.overview} id="editorial-overview" aria-labelledby="editorial-overview-title">
        <Reveal>
          <div className={styles.sectionLabel}>
            <span>01 / THE PROJECT</span>
            <span>GLASGOW, SCOTLAND</span>
          </div>
          <div className={styles.overviewGrid}>
            <h2 id="editorial-overview-title">
              Good produce.
              <br />
              Thoughtful commerce.
            </h2>
            <div className={styles.overviewCopy}>
              <p>I built a WooCommerce shop for weekly fruit and veg deliveries to homes and offices in Glasgow.</p>
              <p>
                Behind the storefront: monthly subscriptions, delivery slots at checkout, and an upfront payment followed by billing on the first of
                each month.
              </p>
            </div>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>CLIENT</dt>
              <dd>{freshFruit.client}</dd>
            </div>
            <div>
              <dt>MY ROLE</dt>
              <dd>{freshFruit.role}</dd>
            </div>
            <div>
              <dt>PLATFORM</dt>
              <dd>WordPress + WooCommerce</dd>
            </div>
            <div>
              <dt>FOCUS</dt>
              <dd>Recurring deliveries</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      <section className={styles.story} aria-labelledby="editorial-story-title">
        <div className={styles.storyPhoto}>
          <Image
            src={freshFruit.produceImage}
            alt="A colourful selection of fresh fruit and vegetables"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            className={styles.photo}
          />
          <span className={styles.photoCaption}>FRESH PRODUCE. EVERY WEEK.</span>
        </div>
        <div className={styles.storyBody}>
          <Reveal>
            <span className={styles.eyebrow}>02 / HOW IT WORKS</span>
            <h2 id="editorial-story-title">
              A weekly ritual.
              <br />A monthly rhythm.
            </h2>
            <div className={styles.storyRows}>
              <div>
                <span>01</span>
                <div>
                  <h3>Choose a box.</h3>
                  <p>Fruit and veg boxes for home or office, with discount rules for boxes and offers.</p>
                </div>
              </div>
              <div>
                <span>02</span>
                <div>
                  <h3>Pick a delivery.</h3>
                  <p>Delivery slots are chosen at checkout, alongside the first subscription payment.</p>
                </div>
              </div>
              <div>
                <span>03</span>
                <div>
                  <h3>Keep it coming.</h3>
                  <p>WooCommerce Subscriptions handles recurring payments on the first of each month.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.details} aria-labelledby="editorial-details-title">
        <Reveal>
          <div className={styles.sectionLabel}>
            <span>03 / BEHIND THE STOREFRONT</span>
            <span>THE BUILD</span>
          </div>
          <div className={styles.detailsGrid}>
            <h2 id="editorial-details-title">
              Built around the
              <br />
              way the shop works.
            </h2>
            <div className={styles.detailList}>
              <p>
                <span>01</span>Monthly subscription billing <ArrowUpRight size={18} aria-hidden="true" />
              </p>
              <p>
                <span>02</span>Custom Elementor widgets <ArrowUpRight size={18} aria-hidden="true" />
              </p>
              <p>
                <span>03</span>Astra child theme <ArrowUpRight size={18} aria-hidden="true" />
              </p>
              <p>
                <span>04</span>Facebook catalogue sync <ArrowUpRight size={18} aria-hidden="true" />
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <span>HAVE SOMETHING IN MIND?</span>
          <span>LET’S MAKE IT HAPPEN.</span>
        </div>
        <a className={styles.contactLink} href="/contact">
          Let’s build
          <br />
          something good.
          <ArrowUpRight aria-hidden="true" />
        </a>
        <div className={styles.footerBottom}>
          <a href="/#work">Back to all work</a>
          <a href="/work/access-hire">
            Next: Access Hire Australia <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </main>
  );
}
