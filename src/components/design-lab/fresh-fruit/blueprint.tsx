/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: Static tab panels need a tab stop for the WAI-ARIA tabs keyboard pattern. */
'use client';

import {ArrowDown, ArrowRight, ArrowUpRight, Check, CornerDownRight, Plus} from 'lucide-react';
import Image from 'next/image';
import {type KeyboardEvent, useRef, useState, useSyncExternalStore} from 'react';
import styles from './blueprint.module.css';
import {freshFruit} from './content';
import {Reveal} from './reveal';

const stages = [
  {
    number: '01',
    title: 'Choose a box',
    label: 'Storefront',
    detail: 'Fruit and veg boxes for homes and offices.',
    body: 'The product catalogue brings home and office delivery boxes into WooCommerce, with discount rules for boxes and offers.',
    note: 'Catalogue synced to Facebook',
    tool: 'WooCommerce',
  },
  {
    number: '02',
    title: 'Set the rhythm',
    label: 'Subscriptions',
    detail: 'Weekly boxes. Monthly subscriptions.',
    body: 'The first payment is collected up front. WooCommerce Subscriptions then charges on the first of each month.',
    note: 'Recurring billing on the first',
    tool: 'WooCommerce Subscriptions',
  },
  {
    number: '03',
    title: 'Pick a delivery',
    label: 'Checkout',
    detail: 'A delivery slot, chosen at checkout.',
    body: 'Customers choose a delivery slot as part of checkout for their home or office order in Glasgow.',
    note: 'Delivery choice at checkout',
    tool: 'WooCommerce checkout',
  },
] as const;

const VERTICAL_TABS_QUERY = '(min-width: 761px)';

function subscribeTabOrientation(onChange: () => void) {
  const media = window.matchMedia(VERTICAL_TABS_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const readTabOrientation = () => window.matchMedia(VERTICAL_TABS_QUERY).matches;
const serverTabOrientation = () => false;

export function Blueprint() {
  const [active, setActive] = useState(0);
  const verticalTabs = useSyncExternalStore(subscribeTabOrientation, readTabOrientation, serverTabOrientation);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === (verticalTabs ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % stages.length;
    else if (event.key === (verticalTabs ? 'ArrowUp' : 'ArrowLeft')) next = (index - 1 + stages.length) % stages.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = stages.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.wordmark} aria-label="Cgdiomampo home">
          cg<span>diomampo.dev</span>
        </a>
        <span className={styles.headerNote}>Independent developer / Selected work</span>
        <a href="/contact" className={styles.headerContact}>
          Let’s build <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </header>
      <main id="main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="blueprint-title">
          <div className={styles.heroTop}>
            <a href="/#work">
              <ArrowRight size={14} aria-hidden="true" /> All work
            </a>
            <span>Commerce / Subscriptions</span>
            <span className={styles.status}>
              <span /> Client project
            </span>
          </div>
          <div className={styles.titleRow}>
            <h1 id="blueprint-title">
              Fresh Fruit
              <br />
              <span>&amp; Veg Shop.</span>
            </h1>
            <div className={styles.heroAside}>
              <p>
                A fresh storefront.
                <br />A considered system.
              </p>
              <span>WooCommerce subscriptions for weekly produce deliveries in Glasgow.</span>
              <a href={freshFruit.liveUrl} rel="noreferrer">
                Open live website <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className={styles.screenFigure}>
            <div className={styles.screenBar}>
              <span>
                <span /> freshfruitandvegshop.com
              </span>
              <span>
                STOREFRONT <ArrowUpRight size={12} aria-hidden="true" />
              </span>
            </div>
            <a href={freshFruit.liveUrl} className={styles.screenshotLink} aria-label="Visit the Fresh Fruit and Veg Shop website" rel="noreferrer">
              <Image
                src={freshFruit.coverImage}
                alt="Fresh Fruit and Veg Shop website showing the produce subscription storefront"
                width={1600}
                height={900}
                sizes="(max-width: 760px) 92vw, 92vw"
                fetchPriority="high"
                loading="eager"
              />
            </a>
            <Plus className={styles.cornerStart} size={14} aria-hidden="true" />
            <Plus className={styles.cornerEnd} size={14} aria-hidden="true" />
            <figcaption>
              <span>FIG. 01 / THE LIVE WEBSITE</span>
              <a href="#blueprint-system">
                Explore the system <ArrowDown size={13} aria-hidden="true" />
              </a>
            </figcaption>
          </figure>
        </section>
        <section className={styles.facts} aria-label="Project details">
          <dl>
            <div>
              <dt>Client</dt>
              <dd>{freshFruit.client}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{freshFruit.role}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{freshFruit.location}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>WordPress + WooCommerce</dd>
            </div>
          </dl>
        </section>
        <section className={styles.system} id="blueprint-system" aria-labelledby="blueprint-system-title">
          <Reveal>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>
                <Plus size={12} aria-hidden="true" /> 01 / System overview
              </p>
              <h2 id="blueprint-system-title">
                The flow behind
                <br />
                <span>the fresh delivery.</span>
              </h2>
              <p className={styles.sectionIntro}>
                A shop, a subscription, and a delivery slot.
                <br />
                Three connected parts of the customer journey.
              </p>
            </div>
          </Reveal>
          <div className={styles.workflow}>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Customer journey stages"
              aria-orientation={verticalTabs ? 'vertical' : 'horizontal'}
            >
              {stages.map((stage, index) => (
                <button
                  key={stage.number}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  type="button"
                  id={`blueprint-tab-${index}`}
                  role="tab"
                  tabIndex={active === index ? 0 : -1}
                  aria-selected={active === index}
                  aria-controls={`blueprint-panel-${index}`}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  <span className={styles.tabNumber}>{stage.number}</span>
                  <span>
                    <small>{stage.label}</small>
                    <strong>{stage.title}</strong>
                  </span>
                  <ArrowRight className={styles.tabArrow} size={20} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className={styles.panels}>
              {stages.map((stage, index) => (
                <div
                  key={stage.number}
                  id={`blueprint-panel-${index}`}
                  role="tabpanel"
                  tabIndex={0}
                  aria-labelledby={`blueprint-tab-${index}`}
                  hidden={active !== index}
                  className={styles.panel}
                >
                  <span className={styles.panelTool}>
                    <CornerDownRight size={16} aria-hidden="true" /> {stage.tool}
                  </span>
                  <h3>{stage.detail}</h3>
                  <p>{stage.body}</p>
                  <div className={styles.panelNote}>
                    <Check size={16} aria-hidden="true" /> {stage.note}
                  </div>
                  <span className={styles.panelIndex} aria-hidden="true">
                    {stage.number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className={styles.build} aria-labelledby="blueprint-build-title">
          <Reveal>
            <div className={styles.buildHeading}>
              <p className={styles.eyebrow}>
                <Plus size={12} aria-hidden="true" /> 02 / Implementation
              </p>
              <h2 id="blueprint-build-title">
                Built for
                <br />
                <span>the whole routine.</span>
              </h2>
              <p>WordPress and WooCommerce form the foundation. Custom Elementor widgets sit on an Astra child theme.</p>
            </div>
          </Reveal>
          <div className={styles.buildList}>
            {freshFruit.features.map((feature, index) => (
              <Reveal key={feature} delay={index * 30}>
                <div className={styles.buildItem}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{feature}</p>
                  <Check size={17} aria-hidden="true" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        <section className={styles.stack} aria-label="Technology stack">
          <span>THE STACK</span>
          <div>
            {freshFruit.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <p className={styles.eyebrow}>
              <span /> Open to projects &amp; roles
            </p>
            <span>Have a system in mind?</span>
          </div>
          <a className={styles.footerCta} href="/contact">
            Let’s build it.
            <ArrowUpRight aria-hidden="true" />
          </a>
          <div className={styles.footerBottom}>
            <a href="/#work">Back to selected work</a>
            <a href="/work/access-hire">
              Next project / Access Hire Australia <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
