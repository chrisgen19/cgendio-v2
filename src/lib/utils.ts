import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

/** shadcn/ui's class helper, used by the admin components in src/components/ui. The public site uses src/lib/cn.ts. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
