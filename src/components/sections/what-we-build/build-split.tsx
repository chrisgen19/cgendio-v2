'use client';

import {type PointerEvent, useState} from 'react';
import {type BuildPhoto, BuildPortrait} from './build-portrait';
import {BuildSide} from './build-side';
import type {BuildSideCopy, BuildSideId} from './copy';

type BuildSplitProps = {
  photo: BuildPhoto | null;
  /** WordPress first, then Next.js. */
  sides: BuildSideCopy[];
};

// Hover previews only where the split runs left/right and motion is welcome; a press works everywhere
const HOVER_PREVIEW = '(hover: hover) and (pointer: fine) and (width >= 860px) and (prefers-reduced-motion: no-preference)';
const FOCUS_PREVIEW = '(prefers-reduced-motion: no-preference)';

const allows = (query: string) => window.matchMedia(query).matches;

/**
 * The interactive part of the What we build stage. The side under the pointer, then a keyboard-focused side, then a
 * pressed side takes over the portrait; with none, it rests at 50/50 (as it renders without JavaScript). All of the
 * text is always in the page: the split only shifts emphasis.
 */
export function BuildSplit({photo, sides}: BuildSplitProps) {
  const [pressed, setPressed] = useState<BuildSideId | null>(null);
  const [hovered, setHovered] = useState<BuildSideId | null>(null);
  const [focused, setFocused] = useState<BuildSideId | null>(null);
  const active = hovered ?? focused ?? pressed;
  const [wp, next] = sides;
  if (!wp || !next) return null;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || !allows(HOVER_PREVIEW)) return;
    const box = event.currentTarget.getBoundingClientRect();
    setHovered(event.clientX < box.left + box.width / 2 ? 'wp' : 'next');
  };

  const sideProps = (id: BuildSideId) => ({
    pressed: pressed === id,
    onToggle: () => setPressed((current) => (current === id ? null : id)),
    onFocusChange: (isFocused: boolean) => {
      if (isFocused && allows(FOCUS_PREVIEW)) setFocused(id);
      else setFocused((current) => (current === id ? null : current));
    },
  });

  return (
    <div
      data-active={active ?? 'none'}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setHovered(null)}
      className="build-split group/split grid grid-cols-[minmax(0,1fr)_clamp(300px,29vw,420px)_minmax(0,1fr)] items-center gap-x-12 gap-y-8 max-md:grid-cols-1 max-md:gap-y-8"
    >
      <BuildSide side={wp} {...sideProps('wp')} className="md:col-start-1 md:row-start-1" />
      <BuildPortrait photo={photo} className="md:col-start-2 md:row-start-1" />
      <BuildSide side={next} {...sideProps('next')} className="md:col-start-3 md:row-start-1" />
    </div>
  );
}
