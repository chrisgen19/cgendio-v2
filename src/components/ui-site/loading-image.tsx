'use client';

import Image, {type ImageProps} from 'next/image';
import {useState} from 'react';

type LoadState = {src: ImageProps['src']; value: 'loaded' | 'failed'};

/**
 * next/image that marks itself `data-image="loaded"` or `"failed"`, so a `CaptureSkeleton` in the same host knows when to
 * go (see `.skeleton-host` in globals.css). next/image also reports images that finished before hydration, so a cached
 * capture never keeps its skeleton.
 */
export function LoadingImage({alt, src, onLoad, onError, ...props}: ImageProps) {
  const [state, setState] = useState<LoadState | null>(null);
  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      data-image={state?.src === src ? state.value : undefined}
      onLoad={(event) => {
        setState({src, value: 'loaded'});
        onLoad?.(event);
      }}
      onError={(event) => {
        setState({src, value: 'failed'});
        onError?.(event);
      }}
    />
  );
}
