import { useState, type PointerEvent as ReactPointerEvent } from 'react';
import { WEDDING_DATA } from '../data/weddingData';
import {
  MadhubaniAripanDivider,
  MadhubaniCornerFiligree,
  MadhubaniGaneshaMedallion,
} from './MadhubaniArt';

interface BookCoverIntroProps {
  onOpenStart: () => void;
  onOpenComplete: () => void;
}

/**
 * STAGE 0: Cinematic 3D Papercraft & Madhubani Book Cover
 * -----------------------------------------------------------------------------
 * Rigid crimson velvet folio with vertical spine crease, gilded cream page edges,
 * diagonal hot-foil sweep, subtle ±5deg hand-tilt parallax, and smooth 3D hinge swing
 * revealing the sacred Ganesh Vandana inside before dissolving into Section 1.
 */
export function BookCoverIntro({ onOpenStart, onOpenComplete }: BookCoverIntroProps) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'fading'>('closed');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'closed') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    setTilt({
      rx: Math.max(-5, Math.min(5, -ny * 10)),
      ry: Math.max(-5, Math.min(5, nx * 10)),
    });
  };

  const handlePointerLeave = () => {
    if (phase !== 'closed') return;
    setTilt({ rx: 0, ry: 0 });
  };

  const handleOpenBook = () => {
    if (phase !== 'closed') return;
    setTilt({ rx: 0, ry: 0 });
    setPhase('opening');
    onOpenStart();

    window.setTimeout(() => {
      setPhase('fading');
    }, 1250);

    window.setTimeout(() => {
      onOpenComplete();
    }, 1820);
  };

  return (
    <div
      data-testid="book-cover-stage"
      data-phase={phase}
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center px-5 py-8 transition-all duration-700 ${
        phase === 'fading'
          ? 'opacity-0 scale-110 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 38%, #5E0C20 0%, #2C0610 62%, #180409 100%)',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Top quiet heritage invocation above the book */}
      <p
        className={`relative z-20 font-micro-ui text-[10px] text-[#F0D693]/85 mb-5 text-center transition-opacity duration-500 ${
          phase !== 'closed' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Royal Wedding Folio · Pratapgarh
      </p>

      {/* 3D Perspective Stage */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative z-20 flex items-center justify-center"
        style={{ perspective: '1600px' }}
      >
        <button
          type="button"
          onClick={handleOpenBook}
          aria-label="Open the 3D Wedding Invitation Book for Saurabh Sang Ranju"
          className="group relative text-left bg-transparent border-0 p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F0D693]"
          style={{
            width: 'min(78vw, 315px)',
            aspectRatio: '3 / 4.15',
            transformStyle: 'preserve-3d',
            transform:
              phase === 'closed'
                ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
                : 'rotateX(0deg) rotateY(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Ambient warm studio floor shadow beneath the rigid folio */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-5 -bottom-7 h-10 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(10,1,4,0.72) 0%, transparent 72%)',
              transform: 'translateZ(-24px)',
            }}
          />

          {/* Layered cream & gilded gold page stack peeking along the right edge */}
          <div
            aria-hidden="true"
            className="absolute top-[7px] bottom-[7px] -right-[10px] w-[12px] rounded-r-[4px] border-y border-r border-[#C69B46]/70"
            style={{
              background:
                'repeating-linear-gradient(90deg, #FBF6EE 0px, #FBF6EE 2px, #D7B46A 2px, #D7B46A 3px)',
              boxShadow: '4px 6px 14px rgba(0,0,0,0.42)',
              transform: 'translateZ(-6px)',
            }}
          />

          {/* INNER WELCOME PAGE (Revealed as the velvet front cover swings open) */}
          <div
            className="absolute inset-0 rounded-r-[14px] rounded-l-[4px] bg-[#FBF6EE] border border-[#C69B46]/60 overflow-hidden flex flex-col items-center justify-center px-6 py-7 text-center"
            style={{
              boxShadow:
                'inset 14px 0 26px -10px rgba(66,7,20,0.28), 0 18px 40px rgba(15,2,6,0.45)',
              transform: 'translateZ(-2px)',
            }}
          >
            <MadhubaniCornerFiligree position="tl" tone="gold" />
            <MadhubaniCornerFiligree position="tr" tone="gold" />
            <MadhubaniCornerFiligree position="bl" tone="gold" />
            <MadhubaniCornerFiligree position="br" tone="gold" />

            <p className="font-hindi-serif text-sm font-semibold text-[#7A1026] mb-2">
              {WEDDING_DATA.invocations.ganeshNamah}
            </p>
            <MadhubaniAripanDivider className="my-2 max-w-[190px]" tone="gold" />
            <p className="font-hindi-serif text-[13.5px] font-medium text-[#33181E] mt-2 leading-relaxed">
              {WEDDING_DATA.invocations.ganeshShlokaLine1}
            </p>
            <p className="font-hindi-serif text-[13.5px] font-medium text-[#33181E] leading-relaxed">
              {WEDDING_DATA.invocations.ganeshShlokaLine2}
            </p>
            <p className="font-hindi-serif text-xs text-[#7A5960] mt-4">
              {WEDDING_DATA.invocations.deviBlessing}
            </p>
          </div>

          {/* FRONT RIGID VELVET COVER (Swings open smoothly along left hinge) */}
          <div
            className="absolute inset-0 rounded-r-[14px] rounded-l-[4px]"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              transform: phase === 'closed' ? 'rotateY(0deg)' : 'rotateY(-168deg)',
              transition: 'transform 1.25s cubic-bezier(0.65, 0, 0.35, 1)',
            }}
          >
            {/* Front Face of Velvet Board */}
            <div
              className="absolute inset-0 rounded-r-[14px] rounded-l-[4px] velvet-cover-surface foil-sweep-overlay overflow-hidden border border-[#C69B46]/65 flex flex-col items-center justify-between px-6 py-7 text-center"
              style={{
                backfaceVisibility: 'hidden',
                boxShadow:
                  'inset 0 1px 0 rgba(250,230,179,0.4), inset 16px 0 24px -12px rgba(24,2,8,0.65), 0 22px 48px rgba(10,1,4,0.62)',
              }}
            >
              {/* Physical vertical left book-spine crease */}
              <div
                aria-hidden="true"
                className="absolute left-[13px] top-0 bottom-0 w-[2px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(20,2,7,0.75) 0%, rgba(240,214,147,0.32) 100%)',
                }}
              />

              {/* Double-line embossed antique gold border & Madhubani corner motifs */}
              <div
                aria-hidden="true"
                className="absolute inset-[10px] left-[20px] rounded-[8px] border border-[#EED492]/55 pointer-events-none"
              >
                <div className="absolute inset-[4px] rounded-[5px] border border-[#C69B46]/40" />
              </div>
              <div className="pl-2 w-full h-full relative flex flex-col items-center justify-between">
                <MadhubaniCornerFiligree position="tl" tone="ivory" />
                <MadhubaniCornerFiligree position="tr" tone="ivory" />
                <MadhubaniCornerFiligree position="bl" tone="ivory" />
                <MadhubaniCornerFiligree position="br" tone="ivory" />

                {/* Top Invocation */}
                <div className="pt-2.5 px-4">
                  <p className="font-hindi-serif text-xs tracking-wide text-[#F4DC9A]">
                    {WEDDING_DATA.invocations.ganeshNamah}
                  </p>
                  <p className="font-micro-ui text-[8px] tracking-[0.18em] text-[#EED492]/80 mt-1">
                    The Wedding Invitation
                  </p>
                </div>

                {/* Centered Embossed Ganesha Medallion */}
                <div className="my-1 flex flex-col items-center">
                  <MadhubaniGaneshaMedallion className="w-[82px] h-[82px] drop-shadow-[0_4px_12px_rgba(20,2,8,0.5)]" />
                </div>

                {/* Bilingual Couple Title */}
                <div className="space-y-0.5">
                  <h1 className="font-hindi-display text-[30px] sm:text-[34px] text-[#FDF6E7] tracking-wide drop-shadow-[0_2px_6px_rgba(24,2,8,0.55)]">
                    {WEDDING_DATA.couple.groomShortHindi}
                    <span className="font-hindi-serif text-[16px] text-[#F0D693] mx-2">
                      {WEDDING_DATA.couple.connectorHindi}
                    </span>
                    {WEDDING_DATA.couple.brideShortHindi}
                  </h1>
                  <p className="font-royal-caps text-[11px] tracking-[0.26em] text-[#F0D693]/90 uppercase">
                    {WEDDING_DATA.couple.groomShortEnglish} &amp; {WEDDING_DATA.couple.brideShortEnglish}
                  </p>
                </div>

                {/* Primary Wedding Date */}
                <div className="pb-3.5 px-6 w-full">
                  <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-[#EED492]/75 to-transparent mb-2" />
                  <p className="font-hindi-serif text-xs text-[#F9E6B3]">
                    {WEDDING_DATA.dates.weddingFullHindi}
                  </p>
                  <p className="font-micro-ui text-[7.5px] tracking-[0.14em] text-[#F0D693]/80 mt-1">
                    Pratapgarh · U.P.
                  </p>
                </div>
              </div>
            </div>

            {/* Inner Backside of Front Cover (Patterned gold brocade lining when swung open) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-l-[14px] rounded-r-[4px] border border-[#C69B46]/55"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                background:
                  'repeating-linear-gradient(45deg, #5A0B1D 0px, #5A0B1D 10px, #680E22 10px, #680E22 20px)',
                boxShadow: 'inset -12px 0 24px rgba(15,2,6,0.55)',
              }}
            />
          </div>
        </button>
      </div>

      {/* Concentric Gold Ripple Tap Prompt Below Book */}
      <div
        className={`mt-9 flex flex-col items-center text-center transition-opacity duration-500 ${
          phase !== 'closed' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="relative flex items-center justify-center w-10 h-10 mb-3" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-[#F0D693]/60 book-tap-ripple" />
          <span
            className="absolute inset-1.5 rounded-full border border-[#C69B46]/80"
            style={{ background: 'rgba(122, 16, 38, 0.7)' }}
          />
          <span className="w-2 h-2 rounded-full bg-[#F0D693]" />
        </div>
        <button
          type="button"
          onClick={handleOpenBook}
          className="cursor-pointer bg-transparent border-0 p-1 focus-visible:outline-2 focus-visible:outline-[#F0D693]"
        >
          <span className="block font-micro-ui text-[10.5px] text-[#F4DC9A] font-medium">
            Tap the Book to Open
          </span>
          <span className="block font-hindi-serif text-xs text-[#F5E7E4]/85 mt-1">
            निमंत्रण खोलने के लिए स्पर्श करें
          </span>
        </button>
      </div>
    </div>
  );
}
