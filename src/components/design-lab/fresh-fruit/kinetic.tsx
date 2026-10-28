import {ArrowDown, ArrowRight, ArrowUpRight, Asterisk} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {freshFruit} from './content';
import styles from './kinetic.module.css';
import {Reveal} from './reveal';

/** A graphic portfolio poster: acid-green scale, real project evidence, and tactile transitions. */
export function Kinetic() {
  return (
    <main id="main" className={styles.page}>
      <a className={styles.skip} href="#kinetic-project">
        Skip to project details
      </a>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          CG<span>DIOMAMPO</span>
          <span className={styles.logoDot}>.</span>
        </Link>
        <nav aria-label="Portfolio navigation">
          <Link href="/#work">Selected work</Link>
          <Link href="/contact">
            Let&apos;s talk <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </nav>
      </header>
      <section className={styles.hero} aria-labelledby="kinetic-title">
        <div className={styles.heroMeta}>
          <span>Client project — Glasgow, Scotland</span>
          <span>E-commerce / Subscriptions</span>
        </div>
        <h1 id="kinetic-title" className={styles.title}>
          <span>FRESH FRUIT</span>
          <span>
            &amp; VEG SHOP<span className={styles.titleDot}>.</span>
          </span>
        </h1>
        <div className={styles.heroVisual}>
          <div className={styles.heroAside}>
            <Asterisk size={42} strokeWidth={1.2} aria-hidden="true" />
            <p>
              Weekly boxes.
              <br />
              Monthly subscriptions.
              <br />
              Built for real life.
            </p>
            <a className={styles.heroCta} href={freshFruit.liveUrl} target="_blank" rel="noreferrer">
              See it live <ArrowUpRight size={22} aria-hidden="true" />
            </a>
            <a className={styles.readLink} href="#kinetic-project">
              The project <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
          <a
            className={styles.heroScreenshot}
            href={freshFruit.liveUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Visit the Fresh Fruit and Veg Shop website"
          >
            <Image
              src={freshFruit.coverImage}
              alt="The Fresh Fruit and Veg Shop website, featuring its fruit and vegetable delivery service"
              width={1600}
              height={900}
              sizes="(max-width: 760px) 100vw, 74vw"
              loading="eager"
              fetchPriority="high"
            />
            <span className={styles.imageVisit}>
              Open website <ArrowUpRight size={20} aria-hidden="true" />
            </span>
          </a>
        </div>
        <div className={styles.heroBottom}>
          <span>Freelance development</span>
          <span>WordPress + WooCommerce</span>
          <ArrowDown size={18} aria-hidden="true" />
        </div>
      </section>

      <section id="kinetic-project" className={styles.project} aria-labelledby="kinetic-project-title">
        <div className={styles.sectionLabel}>
          <span>01 / The project</span>
          <Asterisk size={24} aria-hidden="true" />
        </div>
        <Reveal>
          <h2 id="kinetic-project-title">
            A FRESH TAKE
            <br />
            ON THE WEEKLY SHOP.
          </h2>
        </Reveal>
        <div className={styles.projectBottom}>
          <Reveal className={styles.projectDescription}>
            <p>A WooCommerce shop for homes and offices in Glasgow. Fruit and veg boxes delivered weekly, paid for through monthly subscriptions.</p>
          </Reveal>
          <Reveal delay={120}>
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
                <dt>The build</dt>
                <dd>
                  WordPress, WooCommerce,
                  <br />
                  Subscriptions, Elementor
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className={styles.features} aria-labelledby="kinetic-features-title">
        <div className={styles.sectionLabel}>
          <span>02 / What went into it</span>
          <h2 id="kinetic-features-title">THE GOOD STUFF.</h2>
        </div>
        <Reveal>
          <div className={styles.featureRow}>
            <span>01</span>
            <h3>ON REPEAT.</h3>
            <p>
              Monthly subscriptions.
              <br />
              Weekly home and office boxes.
            </p>
            <ArrowUpRight size={30} aria-hidden="true" />
          </div>
        </Reveal>
        <Reveal>
          <div className={styles.featureRow}>
            <span>02</span>
            <h3>RIGHT ON TIME.</h3>
            <p>
              An initial payment up front.
              <br />
              Then billing on the first of each month.
            </p>
            <ArrowUpRight size={30} aria-hidden="true" />
          </div>
        </Reveal>
        <Reveal>
          <div className={styles.featureRow}>
            <span>03</span>
            <h3>YOUR DOORSTEP.</h3>
            <p>
              Delivery slots selected at checkout.
              <br />
              Discount rules for boxes and offers.
            </p>
            <ArrowUpRight size={30} aria-hidden="true" />
          </div>
        </Reveal>
        <Reveal>
          <div className={styles.featureRow}>
            <span>04</span>
            <h3>ALL CONNECTED.</h3>
            <p>
              Custom Elementor widgets.
              <br />
              Product catalogue synced to Facebook.
            </p>
            <ArrowUpRight size={30} aria-hidden="true" />
          </div>
        </Reveal>
      </section>

      <section className={styles.build} aria-labelledby="kinetic-build-title">
        <div className={styles.buildImage}>
          <Image src={freshFruit.produceImage} alt="A selection of fresh produce" fill sizes="(max-width: 760px) 100vw, 50vw" />
        </div>
        <div className={styles.buildCopy}>
          <Reveal>
            <p className={styles.buildOverline}>03 / Under the surface</p>
            <h2 id="kinetic-build-title">
              FRESH OUTSIDE.
              <br />
              CONSIDERED
              <br />
              INSIDE.
            </h2>
            <p>Custom Elementor widgets on an Astra child theme, with WooCommerce handling products, subscriptions, and checkout.</p>
            <a href={freshFruit.liveUrl} target="_blank" rel="noreferrer" className={styles.buildLink}>
              Explore the live project <ArrowUpRight size={24} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.sectionLabel}>
          <span>Got a project in mind?</span>
          <span>Let&apos;s build something.</span>
        </div>
        <Link href="/contact" className={styles.footerCta}>
          LET&apos;S TALK
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <div className={styles.footerBottom}>
          <Link href="/#work">
            Back to all work <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/work/access-hire">
            Next: Access Hire Australia <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
