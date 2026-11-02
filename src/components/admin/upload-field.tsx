'use client';

import {FileUp, X} from 'lucide-react';
import {useId, useRef, useState} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {MAX_IMAGE_BYTES} from '@/lib/upload-limits';
import {getUploadTarget} from '@/server/actions/uploads';
import {useUploadStatus} from './upload-status';

export type UploadedImage = {url: string; width: number; height: number};

const imageSize = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const size = {width: bitmap.width, height: bitmap.height};
  bitmap.close();
  return size;
};

type UploadFieldProps = {
  /** Form field that receives the public URL */
  name: string;
  label: string;
  kind: 'image' | 'cv';
  defaultValue?: string | null;
  hint?: string;
  /** Told about each new image with its size in pixels, and null on Remove. Nothing else changes when it is left out. */
  onUploaded?: (image: UploadedImage | null) => void;
};

/**
 * Uploads straight from the browser to R2 with a server-signed URL, then puts the file's public URL in a hidden
 * input. Nothing is saved until the form itself is saved.
 */
export function UploadField({name, label, kind, defaultValue, hint, onUploaded}: UploadFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? '');
  const [busy, setBusy] = useState(false);
  const {trackUpload} = useUploadStatus();

  const upload = async (file: File) => {
    setBusy(true);
    trackUpload(1);
    try {
      // Checked before decoding, so an oversized image never takes up browser memory only to be refused
      if (kind === 'image' && file.size > MAX_IMAGE_BYTES) {
        toast.error(`That file is over the ${MAX_IMAGE_BYTES / 1024 / 1024} MB limit.`);
        return;
      }
      // Read first: a caller that needs the size gets nothing at all from a file the browser can't decode
      const size = onUploaded ? await imageSize(file).catch(() => null) : null;
      if (onUploaded && !size) {
        toast.error("That image couldn't be read. Try another JPEG, PNG, WebP or AVIF file.");
        return;
      }
      const target = await getUploadTarget({kind, contentType: file.type, size: file.size});
      if (!target.ok) {
        toast.error(target.error);
        return;
      }
      const response = await fetch(target.uploadUrl, {method: 'PUT', body: file, headers: {'content-type': file.type}});
      if (!response.ok) {
        toast.error(`Upload failed (${response.status}). Check the bucket's CORS rule.`);
        return;
      }
      setUrl(target.publicUrl);
      if (size) onUploaded?.({url: target.publicUrl, ...size});
      toast.success('Uploaded. Save the form to keep it.');
    } catch {
      toast.error('Upload failed. Check your connection and the bucket settings.');
    } finally {
      setBusy(false);
      trackUpload(-1);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <input
        id={id}
        ref={input}
        type="file"
        accept={kind === 'cv' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/avif'}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        {url && kind === 'image' ? (
          // biome-ignore lint/performance/noImgElement: a 64px admin thumbnail of an R2 upload; next/image would need the R2 host configured for no gain here
          <img src={url} alt="" className="size-16 rounded-md border object-cover" />
        ) : null}
        {url && kind === 'cv' ? (
          <a href={url} target="_blank" rel="noreferrer" className="text-sm underline">
            Current CV (PDF)
          </a>
        ) : null}
        <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          <FileUp />
          {busy ? 'Uploading…' : url ? 'Replace' : 'Upload'}
        </Button>
        {url ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setUrl('');
              onUploaded?.(null);
            }}
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X />
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{hint ?? (kind === 'cv' ? 'PDF, up to 10 MB.' : 'JPEG, PNG, WebP or AVIF, up to 5 MB.')}</p>
    </div>
  );
}
