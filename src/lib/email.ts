import {z} from 'zod';

/** True for a real address, false for the `[YOUR EMAIL]` placeholder or anything else that isn't one. */
export const isEmail = (value: string) => z.email().safeParse(value).success;
