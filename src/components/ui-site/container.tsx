import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/*
 * 1320px max width including 56px side padding (20px under 860px), as the design's nav and film HUD.
 *
 * The viewport is `viewport-fit: cover` (#112), so a notched phone held sideways puts the cutout and the rounded
 * corner over the side padding. max() keeps the design's 56px and 20px everywhere there is no inset, which is every
 * desktop browser and every phone held upright, and widens only to clear a real one.
 */
const PAD = 'pl-[max(3.5rem,env(safe-area-inset-left,0px))] pr-[max(3.5rem,env(safe-area-inset-right,0px))]';
const PAD_SM = 'max-md:pl-[max(1.25rem,env(safe-area-inset-left,0px))] max-md:pr-[max(1.25rem,env(safe-area-inset-right,0px))]';

export function Container({children, className}: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-site', PAD, PAD_SM, className)}>{children}</div>;
}
