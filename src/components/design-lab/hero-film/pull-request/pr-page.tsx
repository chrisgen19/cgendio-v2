import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {theme} from '@/components/hero-film/theme';
import {useCut} from './cut-context';
import {ChecksBox, card, Description, Diff, Enter, Labels, LabelTags, PreviewHead, PreviewUrl, PrHeader, ThumbSlot} from './pr-parts';
import {DESK, PHONE, scrollAt} from './timeline';

const dotGrid: React.CSSProperties = {
  backgroundColor: theme.stage,
  backgroundImage: `radial-gradient(circle, ${theme.dot} 1px, transparent 1.3px)`,
  backgroundSize: '26px 26px',
};

/** The design box: authored in design px, scaled by `k` to the composition. */
const DesignBox: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {g} = useCut();
  return (
    <div
      style={{
        position: 'absolute',
        left: g.ox,
        top: g.oy,
        width: g.boxW,
        height: g.boxH,
        scale: g.k,
        transformOrigin: '0 0',
      }}
    >
      {children}
    </div>
  );
};

const DesktopPage: React.FC = () => {
  const {g} = useCut();
  const {thumb} = g;
  return (
    <DesignBox>
      <div style={{position: 'absolute', left: DESK.padX, right: DESK.padX, top: 28}}>
        <PrHeader />
      </div>
      <Enter
        at={4}
        distance={0}
        style={{position: 'absolute', left: DESK.padX, right: DESK.padX, top: DESK.colTop - 16, height: 1, background: theme.line}}
      >
        {null}
      </Enter>
      <div style={{position: 'absolute', left: DESK.padX, top: DESK.colTop, width: DESK.leftW, display: 'flex', flexDirection: 'column', gap: 12}}>
        <Description />
        <Diff />
        <ChecksBox />
      </div>
      <div style={{position: 'absolute', left: DESK.rightX, top: DESK.colTop, width: DESK.rightW, display: 'flex', flexDirection: 'column', gap: 24}}>
        <PreviewCardDesktop thumbH={thumb.h} />
        <Labels />
      </div>
    </DesignBox>
  );
};

const PreviewCardDesktop: React.FC<{thumbH: number}> = ({thumbH}) => {
  const {t, g} = useCut();
  return (
    <Enter at={t.preview} style={{...card, width: DESK.rightW, height: DESK.cardHead + thumbH + 64, position: 'relative'}}>
      <div
        style={{position: 'absolute', left: DESK.cardPad, right: DESK.cardPad, top: 0, height: DESK.cardHead, display: 'flex', alignItems: 'center'}}
      >
        <div style={{flex: 1}}>
          <PreviewHead />
        </div>
      </div>
      <div style={{position: 'absolute', left: DESK.cardPad, top: DESK.cardHead}}>
        <ThumbSlot w={g.thumb.w} h={thumbH} radius={g.radius} />
      </div>
      <div style={{position: 'absolute', left: DESK.cardPad, right: DESK.cardPad, bottom: 12}}>
        <PreviewUrl />
      </div>
    </Enter>
  );
};

/** Phone camera: the PR page scrolls up once, from the diff to the preview and checks. */
const PhoneScroll: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {t, g} = useCut();
  return <div style={{position: 'absolute', inset: 0, translate: `0 ${-scrollAt(t, g, frame)}px`}}>{children}</div>;
};

const PhonePage: React.FC = () => {
  const {t, g} = useCut();
  const thumbH = g.thumb.h;
  const cardH = thumbH + PHONE.cardPad * 2;
  return (
    <DesignBox>
      <PhoneScroll>
        <div style={{position: 'absolute', left: PHONE.padX, right: PHONE.padX, top: 26}}>
          <PrHeader />
        </div>
        <div style={{position: 'absolute', left: PHONE.padX, right: PHONE.padX, top: 180, display: 'flex', flexDirection: 'column', gap: 12}}>
          <Description />
          <Diff />
        </div>
        <Enter
          at={t.preview}
          style={{...card, position: 'absolute', left: PHONE.padX, right: PHONE.padX, top: PHONE.previewTop, height: cardH, borderRadius: 16}}
        >
          <div style={{position: 'absolute', left: PHONE.cardPad, top: PHONE.cardPad}}>
            <ThumbSlot w={PHONE.thumbW} h={thumbH} radius={g.radius} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: PHONE.cardPad * 2 + PHONE.thumbW,
              right: PHONE.cardPad,
              top: PHONE.cardPad + 4,
              bottom: PHONE.cardPad + 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <PreviewHead />
            <LabelTags size={10.5} gap={6} />
            <PreviewUrl />
          </div>
        </Enter>
        <div style={{position: 'absolute', left: PHONE.padX, right: PHONE.padX, top: PHONE.previewTop + cardH + 12}}>
          <ChecksBox />
        </div>
      </PhoneScroll>
    </DesignBox>
  );
};

export const PrPage: React.FC = () => {
  const {g} = useCut();
  return <div style={{position: 'absolute', inset: 0, ...dotGrid}}>{g.portrait ? <PhonePage /> : <DesktopPage />}</div>;
};

export {dotGrid};
