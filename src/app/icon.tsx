import {ImageResponse} from 'next/og';
import {DISPLAY_FONT} from './_og/fonts';

export const size = {width: 64, height: 64};
export const contentType = 'image/png';

/** The favicon: the header's cg logo square, lime on ink. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        backgroundColor: '#0D0E12',
        color: '#D7FF3D',
        fontFamily: 'Bricolage Grotesque',
        fontSize: 34,
        letterSpacing: '-1.4px',
      }}
    >
      cg
    </div>,
    {...size, fonts: [DISPLAY_FONT]},
  );
}
