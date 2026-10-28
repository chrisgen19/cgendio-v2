import {ArrowDown, ArrowRight, ArrowUpRight} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './cinematic.module.css';
import {freshFruit} from './content';
import {Reveal} from './reveal';

/** A full-bleed, chaptered project story with a deliberately quiet cinematic rhythm. */
export function Cinematic() {
  return (
    <main id="main" className={styles.page}>
      <a className={styles.skip} href="#cinematic-story">
        Skip to project story
      </a>
      <section className={styles.hero} aria-labelledby="cinematic-title">
        <div className={styles.heroMedia}>
          <Image
            src={freshFruit.marketImage}
            alt="Fresh vegetables arranged at a produce market"
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className={styles.heroImage}
          />
        </div>
        <div className={styles.shade} />
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark}>
            cgdiomampo<span>.</span>
          </Link>
          <nav aria-label="Portfolio navigation" className={styles.nav}>
            <Link href="/#work">Selected work</Link>
            <Link href="/contact" className={styles.contactLink}>
              Let&apos;s talk <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </nav>
        </header>
        <div className={styles.heroContent}>
          <div className={styles.overline}>
            <span>Selected work / 06</span>
            <span>Commerce, made recurring.</span>
          </div>
          <h1 id="cinematic-title" className={styles.title}>
            <span>Fresh Fruit</span>
            <span>
              &amp; Veg Shop<span className={styles.period}>.</span>
            </span>
          </h1>
          <div className={styles.heroBottom}>
            <p>
              From a local market
              <br />
              to a weekly ritual.
            </p>
            <a className={styles.liveLink} href={freshFruit.liveUrl} target="_blank" rel="noreferrer">
              Visit the live site <ArrowUpRight size={20} aria-hidden="true" />
            </a>
            <a className={styles.scrollLink} href="#cinematic-story" aria-label="Explore the project story">
              <ArrowDown size={22} aria-hidden="true" />
            </a>
          </div>
        </div>
        <span className={styles.heroCaption}>Glasgow, Scotland · Home &amp; office deliveries</span>
      </section>

      <section id="cinematic-story" className={styles.intro} aria-labelledby="cinematic-intro-title">
        <Reveal>
          <p className={styles.chapter}>01 / The brief</p>
        </Reveal>
        <div className={styles.introGrid}>
          <Reveal>
            <h2 id="cinematic-intro-title">
              Good food.
              <br />A simpler routine.
            </h2>
          </Reveal>
          <Reveal delay={100} className={styles.introCopy}>
            <p>
              A WooCommerce shop bringing weekly fruit and veg boxes to homes and offices in Glasgow. Built around monthly subscriptions and a
              delivery slot that fits.
            </p>
            <dl className={styles.facts}>
              <div>
                <dt>Client</dt>
                <dd>{freshFruit.client}</dd>
              </div>
              <div>
                <dt>My role</dt>
                <dd>{freshFruit.role}</dd>
              </div>
              <div>
                <dt>Built with</dt>
                <dd>
                  WordPress · WooCommerce
                  <br />
                  Subscriptions · Elementor
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className={styles.showcase} aria-labelledby="cinematic-showcase-title">
        <div className={styles.showcaseTop}>
          <p className={styles.chapter}>02 / The experience</p>
          <h2 id="cinematic-showcase-title">
            A shop that keeps
            <br />
            the week moving.
          </h2>
        </div>
        <Reveal className={styles.screenReveal}>
          <a
            href={freshFruit.liveUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.screenLink}
            aria-label="View the Fresh Fruit and Veg Shop website"
          >
            <div className={styles.browserBar}>
              <span className={styles.browserDots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>freshfruitandvegshop.com</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </div>
            <Image
              src={freshFruit.coverImage}
              alt="The Fresh Fruit and Veg Shop website showing its fresh produce and delivery service"
              width={1600}
              height={900}
              sizes="(max-width: 760px) 92vw, 88vw"
              className={styles.websiteImage}
            />
          </a>
        </Reveal>
        <p className={styles.imageCaption}>The live website · Custom Elementor widgets on an Astra child theme</p>
      </section>

      <section className={styles.details} aria-labelledby="cinematic-details-title">
        <div className={styles.detailsHeading}>
          <Reveal>
            <p className={styles.chapter}>03 / Behind the experience</p>
            <h2 id="cinematic-details-title">
              Fresh every week.
              <br />
              Considered at every step.
            </h2>
          </Reveal>
        </div>
        <div className={styles.detailRows}>
          <Reveal>
            <div className={styles.detailRow}>
              <span className={styles.rowNumber}>01</span>
              <h3>A box. A routine.</h3>
              <p>Home and office boxes, sold as monthly WooCommerce subscriptions.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.detailRow}>
              <span className={styles.rowNumber}>02</span>
              <h3>Billing, on schedule.</h3>
              <p>{freshFruit.billing}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.detailRow}>
              <span className={styles.rowNumber}>03</span>
              <h3>A delivery that fits.</h3>
              <p>Delivery slots chosen at checkout, with discount rules for boxes and offers.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.detailRow}>
              <span className={styles.rowNumber}>04</span>
              <h3>Beyond the storefront.</h3>
              <p>A product catalogue synced to Facebook, alongside custom Elementor widgets.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className={styles.footer}>
        <Reveal>
          <p className={styles.chapter}>Have something in mind?</p>
          <Link className={styles.footerCta} href="/contact">
            Let&apos;s make it
            <br />
            happen. <ArrowUpRight aria-hidden="true" />
          </Link>
        </Reveal>
        <div className={styles.footerBottom}>
          <Link href="/#work">
            All selected work <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/work/access-hire">
            Next: Access Hire Australia <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
