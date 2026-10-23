import 'server-only';
import {randomUUID} from 'node:crypto';
import {AwsClient} from 'aws4fetch';
import {r2Env} from '@/lib/env';

/** What can be uploaded, and how big. Images are covers; the CV is a PDF. */
export const UPLOAD_KINDS = {
  image: {folder: 'images', maxBytes: 5 * 1024 * 1024, types: {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif'}},
  cv: {folder: 'cv', maxBytes: 10 * 1024 * 1024, types: {'application/pdf': 'pdf'}},
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

let client: AwsClient | undefined;
const r2Client = () => {
  client ??= new AwsClient({accessKeyId: r2Env().R2_ACCESS_KEY_ID, secretAccessKey: r2Env().R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto'});
  return client;
};

const UPLOAD_URL_SECONDS = 300;

/**
 * A presigned PUT URL for one file, valid for five minutes. Content type and exact size are part of the signature
 * (allHeaders), so R2 rejects anything else; the key is random, so uploads never overwrite each other.
 */
export const createPresignedUpload = async (kind: UploadKind, contentType: string, size: number) => {
  const rules = UPLOAD_KINDS[kind];
  const extension = (rules.types as Record<string, string>)[contentType];
  if (!extension) throw new Error(`Unsupported file type ${contentType}`);
  if (size <= 0 || size > rules.maxBytes) throw new Error('File too large');

  const {R2_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_URL} = r2Env();
  const key = `${rules.folder}/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
  const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`);
  url.searchParams.set('X-Amz-Expires', String(UPLOAD_URL_SECONDS));

  const signed = await r2Client().sign(url, {
    method: 'PUT',
    headers: {'content-type': contentType, 'content-length': String(size)},
    aws: {signQuery: true, allHeaders: true},
  });
  return {uploadUrl: signed.url, publicUrl: `${R2_PUBLIC_URL}/${key}`};
};
