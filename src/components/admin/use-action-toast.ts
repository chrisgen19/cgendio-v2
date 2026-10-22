'use client';

import {useEffect} from 'react';
import {toast} from 'sonner';
import type {ActionResult} from '@/server/admin/action-helpers';

/** Shows a toast for each new server action result (success or a form-level error). */
export const useActionToast = (result: ActionResult | null) => {
  useEffect(() => {
    if (!result) return;
    if (result.ok) toast.success(result.message);
    else toast.error(result.error);
  }, [result]);
};
