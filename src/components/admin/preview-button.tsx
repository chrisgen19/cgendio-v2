'use client';

import {Eye} from 'lucide-react';
import {useTransition} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {getPreviewLink} from '@/server/actions/preview';

type PreviewButtonProps = {type: 'post' | 'project'; id: string};

/** Opens a signed, one-hour preview of the saved version (drafts included) in a new tab. */
export function PreviewButton({type, id}: PreviewButtonProps) {
  const [pending, startTransition] = useTransition();

  const open = () => {
    // Open the tab synchronously (inside the click) so pop-up blockers allow it, then point it at the signed link
    const tab = window.open('about:blank', '_blank');
    startTransition(async () => {
      const result = await getPreviewLink(type, id);
      if (result.ok && tab) tab.location.href = result.path;
      else {
        tab?.close();
        toast.error(result.ok ? 'Allow pop-ups for this site to open the preview.' : result.error);
      }
    });
  };

  return (
    <Button type="button" variant="outline" onClick={open} disabled={pending}>
      <Eye />
      {pending ? 'Opening…' : 'Preview'}
    </Button>
  );
}
