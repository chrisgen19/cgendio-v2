import {cn} from '@/lib/cn';
import {StackLogo} from './stack-logo';

type StackPlateProps = {
  tools: string[];
  /** The foundation plate is ink, so the stack reads as standing on it. */
  ink?: boolean;
};

/**
 * One layer drawn as an isometric plate with its tools' logos printed on top (desktop only, decorative: the label
 * beside it carries the text). Three wrappers so the motions never fight: `stack-lift` answers hover, `stack-drop`
 * runs the scroll assembly, `stack-plate` holds the isometric transform. Styles live in globals.css.
 */
export function StackPlate({tools, ink = false}: StackPlateProps) {
  return (
    <div aria-hidden="true" className="relative self-stretch max-md:hidden">
      <div className="stack-lift absolute top-1/2 left-1/2 -mt-[75px] -ml-[140px] h-[150px] w-[280px]">
        <div className="stack-drop size-full">
          <div
            data-ink={ink || undefined}
            className={cn(
              'stack-plate flex size-full items-center justify-center gap-4 rounded-card border',
              ink ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink',
            )}
          >
            {tools.map((tool) => (
              <StackLogo key={tool} name={tool} className="stack-decal size-7" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
