import {DirectionStage} from '../direction-stage';
import {archivo} from './fonts';
import styles from './in-register.module.css';
import {MotionGate} from './motion-gate';
import {ProofPlate} from './proof-plate';

const STATUS = [
  {key: 'out', label: 'Out of register'},
  {key: 'in', label: 'In register'},
  {key: 'approved', label: 'Approved'},
  {key: 'live', label: 'Live'},
] as const;

/**
 * Direction 05, "In register": the hero as a press proof. Four ink separations start out of register and slide into
 * place as the visitor scrolls (CSS scroll-driven animations only), the proof is stamped, trimmed, and goes live.
 * Without scroll timelines, or under reduced motion, it shows the final in-register state.
 */
export function InRegister() {
  return (
    <DirectionStage heightClassName="" stageClassName="">
      <MotionGate className={`${archivo.variable} ${styles.track}`}>
        <div className={styles.stage}>
          <div className={styles.bar} aria-hidden="true">
            <span className={styles.domain}>cgdiomampo.dev</span>
            <span className={styles.status}>
              {STATUS.map((status) => (
                <span key={status.key} className={styles.statusItem} data-status={status.key}>
                  <span className={styles.dot} />
                  {status.label}
                </span>
              ))}
            </span>
          </div>

          <div className={styles.sheet}>
            <ProofPlate ink="y" />
            <ProofPlate ink="m" />
            <ProofPlate ink="c" />
            <ProofPlate ink="k" />
            <span className={styles.stamp} aria-hidden="true">
              <span className={styles.stampWord}>Approved</span>
              <span className={styles.stampBy}>C. Diomampo</span>
            </span>
          </div>

          <p className={styles.hint} aria-hidden="true">
            Scroll to bring the plates into register
          </p>
        </div>
      </MotionGate>
    </DirectionStage>
  );
}
