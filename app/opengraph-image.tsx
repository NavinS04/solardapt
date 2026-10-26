import { ImageResponse } from 'next/og';

// Social share card for every page (WhatsApp, LinkedIn, iMessage previews).
export const alt = 'Solardapt: booked solar surveys for UK installers. Not more leads.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'radial-gradient(70% 90% at 50% 120%, rgba(248,152,24,0.35), #0b0e12 70%)',
          color: '#eef1f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 40, fontWeight: 700 }}>
          <svg width="70" height="55" viewBox="0 0 56 44" fill="none">
            <g stroke="#f89818" strokeWidth="3.6" strokeLinecap="round">
              <line x1="28" y1="20" x2="28" y2="13" />
              <line x1="37.7" y1="22.8" x2="41.2" y2="17.4" />
              <line x1="18.3" y1="22.8" x2="14.8" y2="17.4" />
              <line x1="44.3" y1="30.4" x2="50" y2="27.7" />
              <line x1="11.7" y1="30.4" x2="6" y2="27.7" />
            </g>
            <path d="M14 38a14 14 0 0 1 28 0z" fill="#f89818" />
            <line x1="7" y1="38" x2="49" y2="38" stroke="#eef1f5" strokeWidth="3.6" strokeLinecap="round" />
          </svg>
          solardapt
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>Booked solar surveys.</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, color: '#fbb04a' }}>
            Not more leads.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#9aa4b2' }}>
          <span>For established UK solar installers</span>
          <span>solardapt.com</span>
        </div>
      </div>
    ),
    size,
  );
}
