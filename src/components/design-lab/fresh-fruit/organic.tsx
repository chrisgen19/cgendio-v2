import {ArrowDown, ArrowRight, ArrowUpRight, Leaf} from 'lucide-react';
import Image from 'next/image';
import {freshFruit} from './content';
import styles from './organic.module.css';
import {Reveal} from './reveal';

export function Organic() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="/" aria-label="Cgdiomampo home">
          cg<span>diomampo.</span>
        </a>
        <nav aria-label="Portfolio navigation">
          <a href="/#work">Selected work</a>
          <a href="/contact">
            Get in touch <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="organic-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span /> A little closer to the source
            </p>
            <h1 id="organic-title">
              Fresh Fruit
              <br />
              <i>&amp; Veg Shop.</i>
            </h1>
            <p className={styles.intro}>
              A neighbourhood shop.
              <br />A fresh way to keep it coming.
            </p>
            <p className={styles.heroDescription}>
              A WooCommerce subscription shop for weekly fruit and veg deliveries to homes and offices in Glasgow.
            </p>
            <a className={styles.primaryLink} href={freshFruit.liveUrl} rel="noreferrer">
              Visit the live project <ArrowUpRight size={20} aria-hidden="true" />
            </a>
            <a className={styles.scrollLink} href="#organic-story">
              <ArrowDown size={15} aria-hidden="true" /> The story, from the ground up
            </a>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.photoArch}>
              <Image
                src={freshFruit.marketImage}
                alt="Fresh vegetables and seasonal produce at a market"
                fill
                sizes="(max-width: 760px) 90vw, 44vw"
                fetchPriority="high"
                loading="eager"
                className={styles.heroPhoto}
              />
            </div>
            <div className={styles.seal} aria-hidden="true">
              <Leaf size={26} strokeWidth={1.2} />
              <span>
                Fresh thinking.
                <br />
                Rooted in the everyday.
              </span>
            </div>
            <figcaption>
              <span>Field notes / Glasgow</span>
              <span>Commerce, with a human touch.</span>
            </figcaption>
          </figure>
        </section>
        <section className={styles.facts} aria-label="Project details">
          <dl>
            <div>
              <dt>The client</dt>
              <dd>{freshFruit.client}</dd>
            </div>
            <div>
              <dt>My part</dt>
              <dd>{freshFruit.role}</dd>
            </div>
            <div>
              <dt>The foundations</dt>
              <dd>
                WordPress · WooCommerce
                <br />
                Subscriptions · Elementor
              </dd>
            </div>
          </dl>
        </section>
        <section className={styles.story} id="organic-story" aria-labelledby="organic-story-title">
          <div className={styles.storyLabel}>
            <p className={styles.eyebrow}>01 / The idea</p>
            <h2 id="organic-story-title">
              Good food.
              <br />
              <i>On repeat.</i>
            </h2>
          </div>
          <div className={styles.storyBody}>
            <Reveal>
              <p className={styles.largeCopy}>Make the weekly fruit and veg box part of the routine.</p>
              <p>
                Fresh Fruit and Veg Shop delivers to homes and offices in Glasgow. The shop brings delivery boxes, monthly subscriptions, and a choice
                of delivery slots into one checkout.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <div className={styles.storyRule} />
              <p className={styles.eyebrow}>A familiar rhythm</p>
              <p>{freshFruit.billing} Customers choose their delivery slot at checkout.</p>
            </Reveal>
          </div>
        </section>
        <section className={styles.website} aria-labelledby="organic-website-title">
          <Reveal>
            <div className={styles.sectionTop}>
              <p className={styles.eyebrow}>02 / The finished shop</p>
              <h2 id="organic-website-title">
                A proper shop.
                <br />
                <i>Just a little more connected.</i>
              </h2>
            </div>
            <a className={styles.websiteImage} href={freshFruit.liveUrl} rel="noreferrer" aria-label="Visit the Fresh Fruit and Veg Shop website">
              <Image
                src={freshFruit.coverImage}
                alt="The Fresh Fruit and Veg Shop website, showing its produce delivery boxes and shop navigation"
                width={1600}
                height={900}
                sizes="(max-width: 760px) 90vw, 88vw"
              />
            </a>
            <div className={styles.websiteCaption}>
              <span>The live website · WordPress &amp; WooCommerce</span>
              <a href={freshFruit.liveUrl} rel="noreferrer">
                Take a look <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </section>
        <section className={styles.details} aria-labelledby="organic-details-title">
          <div>
            <p className={styles.eyebrow}>03 / Under the leaves</p>
            <h2 id="organic-details-title">
              Small details.
              <br />
              <i>Everyday usefulness.</i>
            </h2>
          </div>
          <div className={styles.featureList}>
            {freshFruit.features.map((feature, index) => (
              <Reveal key={feature} delay={index * 30}>
                <div className={styles.feature}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{feature}</p>
                  <Leaf size={17} strokeWidth={1.3} aria-hidden="true" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        <footer className={styles.footer}>
          <Leaf className={styles.footerLeaf} size={42} strokeWidth={1} aria-hidden="true" />
          <p className={styles.eyebrow}>Something good starts with a conversation</p>
          <h2>
            What are you
            <br />
            <i>growing next?</i>
          </h2>
          <a className={styles.footerCta} href="/contact">
            Let’s talk about your project <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <div className={styles.footerBottom}>
            <a href="/#work">Back to selected work</a>
            <a href="/work/access-hire">
              Next / Access Hire Australia <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
