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
 * One grammar throughout: everything settles into place with a translate and an opacity change on the same ease-out curve.
 * Without scroll timelines, or under reduced motion, it shows the final in-register state.
 */
export function InRegister({worksHref = '#work'}: {worksHref?: string}) {
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
            {/* The press sheet's margin (fades away when the proof is trimmed) and the trimmed page itself */}
            <span className={styles.margin} aria-hidden="true" />
            <span className={styles.paper} aria-hidden="true" />
            <ProofPlate ink="y" worksHref={worksHref} />
            <ProofPlate ink="m" worksHref={worksHref} />
            <ProofPlate ink="c" worksHref={worksHref} />
            <ProofPlate ink="k" worksHref={worksHref} />
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
