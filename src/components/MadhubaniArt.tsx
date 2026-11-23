import { useState } from 'react';

/**
 * Handcrafted Madhubani (Mithila) Kachni & Bharni inline SVG artwork system.
 * Strictly zero Unicode emojis anywhere in the rendered UI.
 */

export function MadhubaniAripanDivider({
  className = '',
  tone = 'gold',
}: {
  className?: string;
  tone?: 'gold' | 'crimson' | 'ivory';
}) {
  const stroke =
    tone === 'ivory' ? '#EED492' : tone === 'crimson' ? '#7A1026' : '#B98C39';
  const fillAccent =
    tone === 'ivory' ? '#D98A99' : tone === 'crimson' ? '#D4962A' : '#8C162E';
  const petalFill = tone === 'ivory' ? 'rgba(238,212,146,0.18)' : 'rgba(217,138,153,0.22)';

  return (
    <svg
      viewBox="0 0 320 30"
      fill="none"
      aria-hidden="true"
      className={`w-full max-w-[270px] h-7 mx-auto block ${className}`}
    >
      {/* Double Aripan lines with Kachni dots */}
      <line x1="8" y1="13" x2="112" y2="13" stroke={stroke} strokeWidth="0.95" strokeLinecap="round" />
      <line x1="20" y1="17" x2="108" y2="17" stroke={stroke} strokeWidth="0.65" strokeDasharray="2 3" />
      <line x1="208" y1="13" x2="312" y2="13" stroke={stroke} strokeWidth="0.95" strokeLinecap="round" />
      <line x1="212" y1="17" x2="300" y2="17" stroke={stroke} strokeWidth="0.65" strokeDasharray="2 3" />

      {/* Left & right Mithila leaves with fine hatching */}
      <path
        d="M116 15 C124 8, 134 8, 141 15 C134 22, 124 22, 116 15 Z"
        stroke={stroke}
        strokeWidth="1"
        fill={petalFill}
      />
      <line x1="123" y1="12" x2="128" y2="18" stroke={stroke} strokeWidth="0.6" />
      <line x1="129" y1="11" x2="134" y2="19" stroke={stroke} strokeWidth="0.6" />

      <path
        d="M204 15 C196 8, 186 8, 179 15 C186 22, 196 22, 204 15 Z"
        stroke={stroke}
        strokeWidth="1"
        fill={petalFill}
      />
      <line x1="197" y1="12" x2="192" y2="18" stroke={stroke} strokeWidth="0.6" />
      <line x1="191" y1="11" x2="186" y2="19" stroke={stroke} strokeWidth="0.6" />

      {/* Center Kohbar Lotus blossom */}
      <path
        d="M160 3 C166 9, 166 18, 160 25 C154 18, 154 9, 160 3 Z"
        stroke={stroke}
        strokeWidth="1.05"
        fill={petalFill}
      />
      <path
        d="M160 25 C150 22, 144 15, 146 8 C153 10, 157 16, 160 25 Z"
        stroke={stroke}
        strokeWidth="0.95"
        fill={petalFill}
      />
      <path
        d="M160 25 C170 22, 176 15, 174 8 C167 10, 163 16, 160 25 Z"
        stroke={stroke}
        strokeWidth="0.95"
        fill={petalFill}
      />
      <circle cx="160" cy="15" r="2.2" fill={fillAccent} />
      <circle cx="110" cy="15" r="1.4" fill={stroke} />
      <circle cx="210" cy="15" r="1.4" fill={stroke} />
    </svg>
  );
}

export function MadhubaniCornerFiligree({
  position,
  tone = 'gold',
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  tone?: 'gold' | 'ivory';
}) {
  const stroke = tone === 'ivory' ? '#EED492' : '#B98C39';
  const dot = tone === 'ivory' ? '#F5D5D8' : '#8C162E';
  const flip =
    position === 'tr'
      ? 'scaleX(-1)'
      : position === 'bl'
        ? 'scaleY(-1)'
        : position === 'br'
          ? 'scale(-1,-1)'
          : 'none';
  const posClass =
    position === 'tl'
      ? 'top-2.5 left-2.5'
      : position === 'tr'
        ? 'top-2.5 right-2.5'
        : position === 'bl'
          ? 'bottom-2.5 left-2.5'
          : 'bottom-2.5 right-2.5';

  return (
    <svg
      viewBox="0 0 46 46"
      fill="none"
      aria-hidden="true"
      style={{ transform: flip }}
      className={`absolute ${posClass} w-9 h-9 pointer-events-none opacity-85`}
    >
      {/* Double Mithila corner frame */}
      <path d="M2 38 V2 H38" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M6 31 V6 H31" stroke={stroke} strokeWidth="0.7" strokeLinecap="round" />
      {/* Stylized Kohbar Matsya / Lotus eye motif */}
      <path
        d="M9 9 C18 9, 25 14, 27 27 C14 25, 9 18, 9 9 Z"
        stroke={stroke}
        strokeWidth="0.95"
        fill="rgba(212,150,42,0.12)"
      />
      {/* Kachni fine parallel hatching */}
      <line x1="13" y1="14" x2="18" y2="12" stroke={stroke} strokeWidth="0.6" />
      <line x1="12" y1="18" x2="21" y2="15" stroke={stroke} strokeWidth="0.6" />
      <line x1="15" y1="21" x2="23" y2="19" stroke={stroke} strokeWidth="0.6" />
      <circle cx="17" cy="17" r="2" fill={dot} />
      <circle cx="34" cy="6" r="1.2" fill={stroke} />
      <circle cx="6" cy="34" r="1.2" fill={stroke} />
    </svg>
  );
}

/**
 * Minimalist single-line Lord Ganesha emblem inside a Mithila Surya gold medallion
 * for the embossed royal velvet book cover.
 */
export function MadhubaniGaneshaMedallion({ className = 'w-20 h-20' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="foilStroke" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A87D2F" />
          <stop offset="32%" stopColor="#F4DC9A" />
          <stop offset="56%" stopColor="#C69A45" />
          <stop offset="82%" stopColor="#FAE8B6" />
          <stop offset="100%" stopColor="#966B22" />
        </linearGradient>
      </defs>
      {/* Outer Mithila sun-ray beaded ring */}
      <circle cx="60" cy="60" r="54" stroke="url(#foilStroke)" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="48" stroke="url(#foilStroke)" strokeWidth="0.8" strokeDasharray="2 3.5" />
      <circle cx="60" cy="60" r="42" stroke="url(#foilStroke)" strokeWidth="1" fill="rgba(66,7,20,0.45)" />

      {/* Minimalist calligraphic single-line Ganesha silhouette */}
      {/* Mukut (Crown) */}
      <path
        d="M47 34 C51 28, 69 28, 73 34 M51 28 C55 21, 65 21, 69 28 M60 19 L60 23"
        stroke="url(#foilStroke)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tilak */}
      <path d="M56 39 Q60 41 64 39 M60 36 V42" stroke="url(#foilStroke)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Ears */}
      <path
        d="M45 42 C34 40, 31 53, 39 59 C43 61, 46 58, 47 54"
        stroke="url(#foilStroke)"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M75 42 C86 40, 89 53, 81 59 C77 61, 74 58, 73 54"
        stroke="url(#foilStroke)"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      {/* Forehead & Graceful Trunk curving auspiciously to the left (Vamamukhi) */}
      <path
        d="M47 45 C47 38, 73 38, 73 45 C73 55, 65 60, 62 67 C59 74, 51 76, 48 70 C46 66, 50 63, 53 65"
        stroke="url(#foilStroke)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lotus base */}
      <path
        d="M38 82 Q60 93 82 82 M45 86 Q60 95 75 86"
        stroke="url(#foilStroke)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="60" cy="95" r="1.8" fill="#F4DC9A" />
    </svg>
  );
}

/**
 * Layered papercraft mango-leaf, marigold & lotus-bud floral toran strings
 * gently swaying at the top corners of the Hero section.
 */
export function PapercraftToran({ side }: { side: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 110 155"
      fill="none"
      aria-hidden="true"
      style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }}
      className={`w-24 h-36 pointer-events-none select-none toran-sway ${
        side === 'right' ? 'toran-sway-delayed' : ''
      }`}
    >
      {/* Top scalloped arch drape */}
      <path
        d="M0 10 Q46 38 106 8"
        stroke="#C69B46"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      {/* Hanging gold threads */}
      <line x1="22" y1="18" x2="22" y2="128" stroke="#C69B46" strokeWidth="0.9" />
      <line x1="50" y1="24" x2="50" y2="96" stroke="#C69B46" strokeWidth="0.85" />
      <line x1="78" y1="19" x2="78" y2="66" stroke="#C69B46" strokeWidth="0.8" />

      {/* Sage mango leaves */}
      <path d="M22 24 C10 34, 12 48, 22 52 C32 48, 34 34, 22 24 Z" fill="#5D7A5B" stroke="#FBF6EE" strokeWidth="0.8" />
      <path d="M50 30 C40 39, 41 51, 50 55 C59 51, 60 39, 50 30 Z" fill="#6F8C6D" stroke="#FBF6EE" strokeWidth="0.8" />
      <path d="M78 24 C70 32, 71 42, 78 45 C85 42, 86 32, 78 24 Z" fill="#5D7A5B" stroke="#FBF6EE" strokeWidth="0.8" />

      {/* Marigold & lotus blossoms */}
      <circle cx="22" cy="70" r="8.5" fill="#D4962A" stroke="#FBF6EE" strokeWidth="1" />
      <circle cx="22" cy="70" r="4" fill="#F0D693" />
      <circle cx="22" cy="96" r="7" fill="#D98A99" stroke="#FBF6EE" strokeWidth="1" />
      <path d="M22 114 C16 122, 16 134, 22 142 C28 134, 28 122, 22 114 Z" fill="#8C162E" stroke="#EED492" strokeWidth="0.9" />

      <circle cx="50" cy="72" r="7" fill="#D98A99" stroke="#FBF6EE" strokeWidth="1" />
      <path d="M50 86 C45 93, 45 102, 50 108 C55 102, 55 93, 50 86 Z" fill="#C69B46" stroke="#FBF6EE" strokeWidth="0.8" />

      <circle cx="78" cy="58" r="6" fill="#D4962A" stroke="#FBF6EE" strokeWidth="0.9" />
    </svg>
  );
}

/**
 * Bespoke Mithila-style fine-line ceremony emblem icons.
 */
export function CeremonyIcon({
  type,
  className = 'w-7 h-7',
}: {
  type: 'kalash' | 'diya' | 'mandap' | 'lotus' | 'flutes';
  className?: string;
}) {
  switch (type) {
    case 'kalash':
      return (
        <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" className={className}>
          {/* Coconut & mango leaves */}
          <path d="M18 6 C14 9, 14 14, 18 15 C22 14, 22 9, 18 6 Z" stroke="#7A1026" strokeWidth="1.35" fill="rgba(212,150,42,0.22)" />
          <path d="M18 14 C12 11, 8 11, 7 15 C11 16, 14 16, 18 14 Z" stroke="#5D7A5B" strokeWidth="1.2" />
          <path d="M18 14 C24 11, 28 11, 29 15 C25 16, 22 16, 18 14 Z" stroke="#5D7A5B" strokeWidth="1.2" />
          {/* Sacred Kalash vessel */}
          <path d="M13 15 H23 L21.5 18 C25.5 20, 26.5 26, 22.5 30 H13.5 C9.5 26, 10.5 20, 14.5 18 L13 15 Z" stroke="#7A1026" strokeWidth="1.4" fill="rgba(198,155,70,0.16)" />
          <circle cx="18" cy="24" r="1.6" fill="#7A1026" />
        </svg>
      );
    case 'diya':
      return (
        <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" className={className}>
          {/* Flame */}
          <path d="M18 6 C21.5 11, 22 15.5, 18 18.5 C14 15.5, 14.5 11, 18 6 Z" stroke="#C56E2B" strokeWidth="1.4" fill="rgba(212,150,42,0.34)" />
          <path d="M18 10.5 C19.5 13, 19.5 15.5, 18 17 C16.5 15.5, 16.5 13, 18 10.5 Z" fill="#7A1026" />
          {/* Clay Diya bowl */}
          <path d="M7 22 Q18 19 29 22 C27.5 27.5, 23 30, 18 30 C13 30, 8.5 27.5, 7 22 Z" stroke="#7A1026" strokeWidth="1.45" fill="rgba(198,155,70,0.2)" />
          <path d="M12 25.5 H24" stroke="#B98C39" strokeWidth="0.9" strokeDasharray="2 2" />
        </svg>
      );
    case 'mandap':
      return (
        <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" className={className}>
          {/* Scalloped Mughal Mandap Arch */}
          <path d="M7 30 V14 C7 11, 12 9, 18 6 C24 9, 29 11, 29 14 V30" stroke="#7A1026" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M11 30 V17 C11 14.5, 14.5 13, 18 11 C21.5 13, 25 14.5, 25 17 V30" stroke="#B98C39" strokeWidth="1.1" />
          {/* Interlocking sacred rings / varmala */}
          <circle cx="15.5" cy="23" r="3.6" stroke="#7A1026" strokeWidth="1.3" />
          <circle cx="20.5" cy="23" r="3.6" stroke="#B98C39" strokeWidth="1.3" />
          <line x1="5" y1="30" x2="31" y2="30" stroke="#7A1026" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'lotus':
      return (
        <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" className={className}>
          <path d="M18 7 C22 13, 22 21, 18 26 C14 21, 14 13, 18 7 Z" stroke="#7A1026" strokeWidth="1.35" fill="rgba(217,138,153,0.28)" />
          <path d="M18 26 C11 24, 7 18, 9 11 C13 13, 16 18, 18 26 Z" stroke="#7A1026" strokeWidth="1.25" fill="rgba(217,138,153,0.18)" />
          <path d="M18 26 C25 24, 29 18, 27 11 C23 13, 20 18, 18 26 Z" stroke="#7A1026" strokeWidth="1.25" fill="rgba(217,138,153,0.18)" />
          <path d="M9 28 Q18 31 27 28" stroke="#5D7A5B" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'flutes':
      return (
        <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" className={className}>
          <path d="M10 10 L14 21 C14.5 22.5, 16 23, 17 22 C18 21, 18 19.5, 17 18 L13 9 Z" stroke="#F0D693" strokeWidth="1.3" />
          <path d="M26 10 L22 21 C21.5 22.5, 20 23, 19 22 C18 21, 18 19.5, 19 18 L23 9 Z" stroke="#F0D693" strokeWidth="1.3" />
          <line x1="15.5" y1="22.5" x2="13.5" y2="29" stroke="#F0D693" strokeWidth="1.25" strokeLinecap="round" />
          <line x1="20.5" y1="22.5" x2="22.5" y2="29" stroke="#F0D693" strokeWidth="1.25" strokeLinecap="round" />
          <line x1="10.5" y1="29.5" x2="16.5" y2="29.5" stroke="#F0D693" strokeWidth="1.25" strokeLinecap="round" />
          <line x1="19.5" y1="29.5" x2="25.5" y2="29.5" stroke="#F0D693" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M18 4 V7 M15 5.5 L16.2 7.5 M21 5.5 L19.8 7.5" stroke="#F0D693" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
  }
}

/**
 * Crisp custom inline SVG UI icons (Zero Unicode emojis).
 */
export function UiIcon({
  name,
  className = 'w-4 h-4',
}: {
  name:
    | 'calendar'
    | 'check'
    | 'chevron-left'
    | 'chevron-right'
    | 'compass'
    | 'copy'
    | 'phone'
    | 'whatsapp'
    | 'replay'
    | 'down'
    | 'pin';
  className?: string;
}) {
  switch (name) {
    case 'calendar':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <rect x="2.5" y="4" width="15" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
          <line x1="2.5" y1="8.2" x2="17.5" y2="8.2" stroke="currentColor" strokeWidth="1.2" />
          <line x1="6.5" y1="2.2" x2="6.5" y2="5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="13.5" y1="2.2" x2="13.5" y2="5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="10" cy="12.6" r="1.4" fill="currentColor" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path d="M4.2 10.4 L8.1 14.3 L15.8 6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path d="M12.5 4.5 L7 10 L12.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path d="M7.5 4.5 L13 10 L7.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path d="M3.5 9.6 L16.8 3.5 L11 16.8 L9.4 11.2 Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
        </svg>
      );
    case 'copy':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <rect x="6.5" y="6.5" width="10" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M13.5 6.5 V4.5 C13.5 3.6 12.8 3 12 3 H4.5 C3.6 3 3 3.6 3 4.5 V12 C3 12.8 3.6 13.5 4.5 13.5 H6.5" stroke="currentColor" strokeWidth="1.35" />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path
            d="M4.2 3.8 C4.2 3.3 4.6 3 5.1 3 H7.7 C8.1 3 8.5 3.3 8.6 3.7 L9.3 6.5 C9.4 6.9 9.2 7.3 8.9 7.5 L7.4 8.5 C8.3 10.3 9.7 11.7 11.5 12.6 L12.5 11.1 C12.7 10.8 13.1 10.6 13.5 10.7 L16.3 11.4 C16.7 11.5 17 11.9 17 12.3 V14.9 C17 15.4 16.7 15.8 16.2 15.8 C9.6 15.8 4.2 10.4 4.2 3.8 Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path
            d="M10 2.5 C5.86 2.5 2.5 5.86 2.5 10 C2.5 11.45 2.91 12.8 3.62 13.95 L2.6 17.4 L6.18 16.44 C7.3 17.1 8.6 17.5 10 17.5 C14.14 17.5 17.5 14.14 17.5 10 C17.5 5.86 14.14 2.5 10 2.5 Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path
            d="M7.6 7.3 C7.4 7.3 7 7.6 7 8.4 C7 9.2 7.6 10.4 8.7 11.4 C9.8 12.4 11 12.9 11.8 12.9 C12.5 12.9 12.9 12.4 12.9 12 C12.9 11.7 12.6 11.5 12.2 11.3 L11.4 11 C11.1 10.9 10.9 11 10.7 11.2 L10.4 11.6 C9.8 11.3 9 10.5 8.7 9.9 L9 9.5 C9.2 9.3 9.2 9.1 9.1 8.8 L8.7 7.9 C8.5 7.5 8.1 7.3 7.6 7.3 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'replay':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path d="M4.2 10 A5.8 5.8 0 1 0 6 5.8 L3.6 8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.6 4.4 V8 H7.2" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'down':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path d="M10 4 V15.5 M5.5 11.2 L10 15.8 L14.5 11.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
          <path
            d="M10 17.5 C10 17.5 15.5 12.2 15.5 8.2 C15.5 5.1 13 2.7 10 2.7 C7 2.7 4.5 5.1 4.5 8.2 C4.5 12.2 10 17.5 10 17.5 Z"
            stroke="currentColor"
            strokeWidth="1.45"
          />
          <circle cx="10" cy="8.2" r="2.1" stroke="currentColor" strokeWidth="1.35" />
        </svg>
      );
  }
}

/**
 * Handcrafted watercolor + Mithila SVG fallback for placeholder story photo slots
 * so zero empty or broken image frames ever appear.
 */
export function HeritageWatercolorFallback({
  motif,
  title,
}: {
  motif: 'couple' | 'mandap' | 'baraat' | 'wreath' | 'lotus' | 'diya';
  title: string;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#FBF6EE] via-[#F7EAE6] to-[#EFE0DB]">
      <svg viewBox="0 0 180 210" fill="none" aria-hidden="true" className="w-36 h-44 mb-2">
        {/* Scalloped Mughal arch frame */}
        <path
          d="M22 190 V68 C22 44, 54 34, 90 16 C126 34, 158 44, 158 68 V190"
          stroke="#C69B46"
          strokeWidth="1.4"
          fill="rgba(251,246,238,0.65)"
        />
        <path
          d="M30 184 V72 C30 52, 58 42, 90 26 C122 42, 150 52, 150 72 V184"
          stroke="#D98A99"
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
        {motif === 'diya' ? (
          <>
            <path d="M90 66 C102 84, 102 102, 90 112 C78 102, 78 84, 90 66 Z" fill="#F0D693" stroke="#C56E2B" strokeWidth="1.4" />
            <path d="M52 122 Q90 112 128 122 C122 144, 108 152, 90 152 C72 152, 58 144, 52 122 Z" fill="#E8B8A8" stroke="#7A1026" strokeWidth="1.5" />
            <circle cx="90" cy="136" r="5" fill="#7A1026" opacity="0.22" />
          </>
        ) : (
          <>
            {/* Kohbar Lotus with Kachni hatching */}
            <path d="M90 62 C104 82, 104 114, 90 132 C76 114, 76 82, 90 62 Z" fill="#F2CDD4" stroke="#7A1026" strokeWidth="1.35" />
            <path d="M90 132 C64 124, 50 102, 56 76 C72 84, 82 104, 90 132 Z" fill="#F7DFE3" stroke="#7A1026" strokeWidth="1.2" />
            <path d="M90 132 C116 124, 130 102, 124 76 C108 84, 98 104, 90 132 Z" fill="#F7DFE3" stroke="#7A1026" strokeWidth="1.2" />
            <path d="M56 144 Q90 158 124 144" stroke="#5D7A5B" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="90" cy="100" r="4" fill="#D4962A" />
          </>
        )}
      </svg>
      <p className="font-english-serif italic text-sm text-[#7A5960] max-w-[200px] leading-snug">
        {title}
      </p>
    </div>
  );
}

/**
 * MuseumMatFrame
 * -----------------------------------------------------------------------------
 * SACRED RULE: Renders original PDF watercolor paintings 100% untampered:
 * - ZERO CSS color filters, ZERO dark overlays, ZERO Madhubani strokes on top of the art.
 * - Madhubani Aripan framing lives strictly in the surrounding cotton-paper museum mat.
 */
export function MuseumMatFrame({
  src,
  alt,
  variant = 'rect',
  kenBurns = false,
  fit = 'contain',
  imagePosition = 'object-center',
  fallbackMotif = 'lotus',
  fallbackTitle = 'Saurabh Sang Ranju',
  className = '',
}: {
  src: string;
  alt: string;
  variant?: 'arch' | 'rect' | 'wreath';
  kenBurns?: boolean;
  fit?: 'contain' | 'cover';
  imagePosition?: string;
  fallbackMotif?: 'couple' | 'mandap' | 'baraat' | 'wreath' | 'lotus' | 'diya';
  fallbackTitle?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const outerRadius =
    variant === 'arch'
      ? 'rounded-t-[999px] rounded-b-[22px]'
      : variant === 'wreath'
        ? 'rounded-full'
        : 'rounded-[20px]';

  const innerRadius =
    variant === 'arch'
      ? 'rounded-t-[999px] rounded-b-[14px]'
      : variant === 'wreath'
        ? 'rounded-full'
        : 'rounded-[13px]';

  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div
      className={`relative p-2.5 sm:p-3 bg-[#FBF6EE] border border-[#C69B46]/55 papercraft-elevation ${outerRadius} ${className}`}
    >
      {/* Surrounding Madhubani double hairline strictly on the outer paper mat */}
      <div
        className={`relative w-full h-full p-1.5 border border-[#C69B46]/35 bg-[#F5E7E4]/55 ${outerRadius}`}
      >
        {/* Recessed window holding the 100% untampered royal watercolor painting */}
        <div
          className={`relative w-full h-full overflow-hidden bg-white shadow-[inset_0_2px_10px_rgba(66,7,20,0.12)] ${innerRadius}`}
        >
          {src && !failed ? (
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
              className={`w-full h-full ${fitClass} ${imagePosition} block select-none ${
                kenBurns ? 'hero-ken-burns' : ''
              }`}
              style={{ filter: 'none' }}
            />
          ) : (
            <HeritageWatercolorFallback motif={fallbackMotif} title={fallbackTitle} />
          )}
        </div>
      </div>
    </div>
  );
}
