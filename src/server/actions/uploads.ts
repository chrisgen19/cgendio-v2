'use server';

import {z} from 'zod';
import {requireAdmin} from '../admin-session';
import {createPresignedUpload, UPLOAD_KINDS} from '../r2';

const uploadInput = z.object({
  kind: z.enum(['image', 'cv']),
  contentType: z.string().min(1),
  size: z.int().positive(),
});

export type UploadTarget = {ok: true; uploadUrl: string; publicUrl: string} | {ok: false; error: string};

const megabytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

/** Checks the file's type and size, then returns where the browser should PUT it and the URL to save afterwards. */
export async function getUploadTarget(input: {kind: 'image' | 'cv'; contentType: string; size: number}): Promise<UploadTarget> {
  await requireAdmin();
  const parsed = uploadInput.safeParse(input);
  if (!parsed.success) return {ok: false, error: 'Invalid upload request.'};

  const {kind, contentType, size} = parsed.data;
  const rules = UPLOAD_KINDS[kind];
  if (!Object.hasOwn(rules.types, contentType)) {
    return {ok: false, error: kind === 'cv' ? 'The CV has to be a PDF.' : 'Use a JPEG, PNG, WebP or AVIF image.'};
  }
  if (size > rules.maxBytes) return {ok: false, error: `That file is over the ${megabytes(rules.maxBytes)} limit.`};

  return {ok: true, ...(await createPresignedUpload(kind, contentType, size))};
}
