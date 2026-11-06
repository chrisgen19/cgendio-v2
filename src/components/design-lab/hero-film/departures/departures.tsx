import {DirectionStage} from '../direction-stage';
import {DeparturesFilm} from './departures-film';
import {flapFont, plateFont} from './fonts';

/**
 * Off-brand palette: a concourse board. Daylight is a concrete hall with a slate housing and enamel flaps in navy;
 * night keeps the housing and turns the flaps to blue-grey with warm white type. Green marks LIVE, signal yellow is
 * the call to the gate.
 */
const PALETTE = [
  '[--dep-stage:#DADFE2]',
  '[--dep-housing:#232B3A]',
  '[--dep-housing-edge:#232B3A]',
  '[--dep-plate-ink:#A9B2C1]',
  '[--dep-face:#F6F6F1]',
  '[--dep-ink:#16203A]',
  '[--dep-shade:#0A0E16]',
  '[--dep-live:#1D7A50]',
  '[--dep-live-ink:#F6F6F1]',
  '[--dep-cta:#F2C230]',
  '[--dep-cta-ink:#16203A]',
  '[--dep-text:#16203A]',
  '[--dep-rule:#A7B0BA]',
  '[--dep-focus:#16203A]',
  '[--dep-focus-housing:#F2C230]',
  '[--dep-progress:#16203A]',
  '[:root[data-theme=dark]_&]:[--dep-stage:#141B28]',
  '[:root[data-theme=dark]_&]:[--dep-housing:#06090F]',
  '[:root[data-theme=dark]_&]:[--dep-housing-edge:#2F3B51]',
  '[:root[data-theme=dark]_&]:[--dep-plate-ink:#8E99AC]',
  '[:root[data-theme=dark]_&]:[--dep-face:#1F2735]',
  '[:root[data-theme=dark]_&]:[--dep-ink:#EEEBE2]',
  '[:root[data-theme=dark]_&]:[--dep-shade:#000000]',
  '[:root[data-theme=dark]_&]:[--dep-live:#21805A]',
  '[:root[data-theme=dark]_&]:[--dep-live-ink:#F4F2EA]',
  '[:root[data-theme=dark]_&]:[--dep-cta:#F2C230]',
  '[:root[data-theme=dark]_&]:[--dep-cta-ink:#10141D]',
  '[:root[data-theme=dark]_&]:[--dep-text:#D9DCE3]',
  '[:root[data-theme=dark]_&]:[--dep-rule:#323C4E]',
  '[:root[data-theme=dark]_&]:[--dep-focus:#F2C230]',
  '[:root[data-theme=dark]_&]:[--dep-focus-housing:#F2C230]',
  '[:root[data-theme=dark]_&]:[--dep-progress:#F2C230]',
].join(' ');

/** Direction 04: a split-flap departures board where each build flips from idea to live, then settles on my name. */
export function Departures() {
  return (
    <div className={`${PALETTE} ${flapFont.variable} ${plateFont.variable}`}>
      <DirectionStage stageClassName="bg-(--dep-stage)">
        <DeparturesFilm />
      </DirectionStage>
    </div>
  );
}
