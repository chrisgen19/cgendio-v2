'use client';

import {useEffect, useRef, useState} from 'react';

export type CopyStatus = 'idle' | 'copied' | 'failed';

const ANNOUNCE = {
  copied: 'Email address copied',
  failed: 'Copy failed. Select the address and copy it instead.',
} as const;

/** How long the copied or failed state shows before the pill and the band go back */
const SHOW_MS = {copied: 2000, failed: 6000} as const;

/**
 * Copies the address to the clipboard. `status` drives the visible state and reverts on its own; `message` is for a
 * polite live region, cleared first and written a beat later so a repeat copy is announced again. A rejected write
 * (an insecure page, a denied permission) reports `failed` and calls `onFail`.
 */
export const useCopyEmail = (address: string, onFail: () => void) => {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [message, setMessage] = useState('');
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
  };

  useEffect(() => {
    const pending = timers;
    return () => {
      for (const id of pending.current) window.clearTimeout(id);
    };
  }, []);

  const copy = async () => {
    clearTimers();
    setMessage('');
    let next: keyof typeof ANNOUNCE = 'copied';
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      next = 'failed';
      onFail();
    }
    setStatus(next);
    timers.current = [window.setTimeout(() => setMessage(ANNOUNCE[next]), 100), window.setTimeout(() => setStatus('idle'), SHOW_MS[next])];
  };

  return {status, message, copy};
};
