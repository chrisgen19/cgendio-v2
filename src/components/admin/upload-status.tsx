'use client';

import {createContext, type ReactNode, useContext, useState} from 'react';

type UploadStatus = {
  /** True while any UploadField inside the provider is still uploading */
  uploading: boolean;
  /** +1 when an upload starts, -1 when it finishes or fails */
  trackUpload: (delta: 1 | -1) => void;
};

/** Without a provider nothing is ever uploading, so SubmitButton works unchanged in forms without uploads. */
const UploadStatusContext = createContext<UploadStatus>({uploading: false, trackUpload: () => {}});

export const useUploadStatus = () => useContext(UploadStatusContext);

/**
 * Wrap a form that has UploadFields in this, so its SubmitButton stays disabled while a file is uploading. Saving
 * mid-upload would store the previous URL, and on create the redirect would leave the uploaded file orphaned in R2.
 */
export function UploadStatusProvider({children}: {children: ReactNode}) {
  const [active, setActive] = useState(0);
  const trackUpload = (delta: 1 | -1) => setActive((count) => Math.max(0, count + delta));
  return <UploadStatusContext value={{uploading: active > 0, trackUpload}}>{children}</UploadStatusContext>;
}
