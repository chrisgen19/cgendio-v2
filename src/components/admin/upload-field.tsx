'use client';

import {FileUp, X} from 'lucide-react';
import {useId, useRef, useState} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {getUploadTarget} from '@/server/actions/uploads';
import {useUploadStatus} from './upload-status';

type UploadFieldProps = {
  /** Form field that receives the public URL */
  name: string;
  label: string;
  kind: 'image' | 'cv';
  defaultValue?: string | null;
  hint?: string;
};

/**
 * Uploads straight from the browser to R2 with a server-signed URL, then puts the file's public URL in a hidden
 * input. Nothing is saved until the form itself is saved.
 */
export function UploadField({name, label, kind, defaultValue, hint}: UploadFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? '');
  const [busy, setBusy] = useState(false);
  const {trackUpload} = useUploadStatus();

  const upload = async (file: File) => {
    setBusy(true);
    trackUpload(1);
    try {
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
          <Button type="button" variant="ghost" onClick={() => setUrl('')} aria-label={`Remove ${label.toLowerCase()}`}>
            <X />
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{hint ?? (kind === 'cv' ? 'PDF, up to 10 MB.' : 'JPEG, PNG, WebP or AVIF, up to 5 MB.')}</p>
    </div>
  );
}
