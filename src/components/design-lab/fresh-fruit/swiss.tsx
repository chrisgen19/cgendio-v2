import {ArrowDown, ArrowRight, ArrowUpRight} from 'lucide-react';
import Image from 'next/image';
import {freshFruit} from './content';
import {Reveal} from './reveal';
import styles from './swiss.module.css';

const entries = [
  {id: 'swiss-overview', number: '01', title: 'Overview'},
  {id: 'swiss-commerce', number: '02', title: 'Commerce'},
  {id: 'swiss-build', number: '03', title: 'The build'},
] as const;

export function Swiss() {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.wordmark}>
          cgdiomampo<span>.dev</span>
        </a>
        <span className={styles.discipline}>INDEPENDENT DEVELOPER</span>
        <a href="/#work" className={styles.back}>
          All work <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </header>

      <section className={styles.hero} aria-labelledby="swiss-title">
        <div className={styles.heroLabels}>
          <span>PROJECT INDEX — 06</span>
          <span>E-COMMERCE / SUBSCRIPTIONS</span>
          <span>GLASGOW, UK</span>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroType}>
            <h1 id="swiss-title">
              <span>Fresh Fruit</span>
              <span>
                and <em>Veg</em>
              </span>
              <span>Shop.</span>
            </h1>
            <div className={styles.heroSummary}>
              <span className={styles.smallDot} aria-hidden="true" />
              <p>
                Weekly deliveries.
                <br /> Commerce that keeps up.
              </p>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <a
              href={freshFruit.liveUrl}
              className={styles.preview}
              target="_blank"
              rel="noreferrer"
              aria-label="Visit the Fresh Fruit and Veg Shop website"
            >
              <Image
                src={freshFruit.coverImage}
                alt="The Fresh Fruit and Veg Shop storefront website, showing its produce delivery service"
                width={1600}
                height={900}
                sizes="(max-width: 760px) 100vw, 54vw"
                preload
              />
              <span className={styles.previewAction}>
                <ArrowUpRight size={26} aria-hidden="true" />
              </span>
            </a>
            <div className={styles.figureCaption}>
              <span>FIG. 01 — THE STOREFRONT</span>
              <a href={freshFruit.liveUrl} target="_blank" rel="noreferrer">
                Open live site <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.heroContext}>
              <p>A WordPress and WooCommerce build for fruit and veg boxes delivered to homes and offices.</p>
              <a href="#swiss-overview" aria-label="Read the project overview">
                <ArrowDown size={25} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <dl className={styles.factStrip}>
          <div>
            <dt>CLIENT</dt>
            <dd>{freshFruit.client}</dd>
          </div>
          <div>
            <dt>ROLE</dt>
            <dd>{freshFruit.role}</dd>
          </div>
          <div>
            <dt>PLATFORM</dt>
            <dd>WordPress / WooCommerce</dd>
          </div>
          <div>
            <dt>DELIVERY</dt>
            <dd>Homes & offices</dd>
          </div>
        </dl>
      </section>

      <div className={styles.bodyGrid}>
        <aside className={styles.sidebar}>
          <nav aria-label="Case study sections">
            <span className={styles.indexLabel}>ON THIS PAGE</span>
            {entries.map((entry) => (
              <a key={entry.id} href={`#${entry.id}`}>
                <span>{entry.number}</span>
                {entry.title}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <span className={styles.sidebarNote}>
            SELECTED CLIENT WORK
            <br />
            WORDPRESS DEVELOPMENT
          </span>
        </aside>

        <div className={styles.sections}>
          <section id="swiss-overview" className={styles.section} aria-labelledby="swiss-overview-title">
            <Reveal>
              <div className={styles.sectionTopline}>
                <span>01 / OVERVIEW</span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </div>
              <h2 id="swiss-overview-title">
                The shop is local.
                <br />
                The system works weekly.
              </h2>
              <p className={styles.lede}>
                Fresh Fruit and Veg Shop delivers produce boxes across Glasgow. I built the WooCommerce shop that connects those weekly deliveries
                with monthly subscription billing.
              </p>
              <p className={styles.bodyCopy}>
                Customers choose a box, select a delivery slot at checkout, and pay upfront. WooCommerce Subscriptions then charges on the first of
                each month.
              </p>
            </Reveal>
          </section>

          <section id="swiss-commerce" className={styles.section} aria-labelledby="swiss-commerce-title">
            <Reveal>
              <div className={styles.sectionTopline}>
                <span>02 / COMMERCE</span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </div>
              <h2 id="swiss-commerce-title">
                Three steps.
                <br />
                One recurring delivery.
              </h2>
              <ol className={styles.workflow}>
                <li>
                  <span>01</span>
                  <div>
                    <h3>Choose the box</h3>
                    <p>Fruit and veg for home or office, with discount rules for boxes and offers.</p>
                  </div>
                  <ArrowDown size={20} aria-hidden="true" />
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <h3>Choose the delivery</h3>
                    <p>Delivery slots are selected at checkout alongside the initial payment.</p>
                  </div>
                  <ArrowDown size={20} aria-hidden="true" />
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <h3>Continue monthly</h3>
                    <p>WooCommerce Subscriptions takes recurring payments on the first of each month.</p>
                  </div>
                  <ArrowRight size={20} aria-hidden="true" />
                </li>
              </ol>
            </Reveal>
          </section>

          <section id="swiss-build" className={styles.section} aria-labelledby="swiss-build-title">
            <Reveal>
              <div className={styles.sectionTopline}>
                <span>03 / THE BUILD</span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </div>
              <h2 id="swiss-build-title">
                An established platform.
                <br />A shop-specific build.
              </h2>
              <dl className={styles.buildList}>
                <div>
                  <dt>WordPress + Astra</dt>
                  <dd>An Astra child theme provides the foundation for the storefront.</dd>
                </div>
                <div>
                  <dt>Elementor</dt>
                  <dd>Custom widgets support the shop’s content and presentation.</dd>
                </div>
                <div>
                  <dt>WooCommerce</dt>
                  <dd>Products, discount rules, delivery selection, and recurring billing.</dd>
                </div>
                <div>
                  <dt>Facebook</dt>
                  <dd>The product catalogue is synced to Facebook.</dd>
                </div>
              </dl>
              <a className={styles.primaryLink} href={freshFruit.liveUrl} target="_blank" rel="noreferrer">
                Visit Fresh Fruit and Veg Shop <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </Reveal>
          </section>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLabel}>
          <span>HAVE A PROJECT IN MIND?</span>
          <span>LET’S TALK.</span>
        </div>
        <a className={styles.contact} href="/contact">
          Make the next
          <br />
          one happen.
          <ArrowUpRight aria-hidden="true" />
        </a>
        <div className={styles.footerNav}>
          <a href="/#work">All selected work</a>
          <a href="/work/access-hire">
            Next / Access Hire Australia <ArrowRight size={20} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </main>
  );
}
