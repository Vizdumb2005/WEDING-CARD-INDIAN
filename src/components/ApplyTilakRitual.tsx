import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { MEDIA_ASSETS, WEDDING_DATA } from '../data/weddingData';
import { evaluateTilakGesture } from '../utils/weddingLogic';
import { MadhubaniAripanDivider, MadhubaniCornerFiligree } from './MadhubaniArt';

interface ApplyTilakRitualProps {
  onTilakApplied: () => void;
  onComplete: () => void;
}

/**
 * Handcrafted SVG Sacred Vermilion Kumkum Tilak + Golden Akshat (Rice Grains)
 * painted progressively upward across the forehead as the guest taps or swipes.
 */
function SacredTilakMark({
  progress,
  variant,
  glow,
}: {
  progress: number;
  variant: 'groom' | 'bride';
  glow: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped <= 0.02) return null;

  return (
    <svg
      viewBox="0 0 28 42"
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-visible transition-opacity duration-300 ${
        variant === 'groom' ? 'w-[18px] h-[28px]' : 'w-[16px] h-[25px]'
      }`}
      style={{
        filter: glow
          ? 'drop-shadow(0 0 6px rgba(217, 175, 88, 0.9)) drop-shadow(0 0 3px rgba(185, 28, 28, 0.55))'
          : 'drop-shadow(0 1px 2px rgba(122, 16, 38, 0.35))',
      }}
    >
      <defs>
        <linearGradient id={`kumkum-grad-${variant}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="55%" stopColor="#C81E2B" />
          <stop offset="100%" stopColor="#E63946" />
        </linearGradient>
      </defs>

      {variant === 'groom' ? (
        /* Traditional vertical Chandan-Kumkum Tilak with sacred upward taper */
        <g
          style={{
            transformOrigin: '14px 34px',
            transform: `scaleY(${clamped})`,
            transition: 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Subtle saffron chandan outer glow */}
          <path
            d="M14 5 C17.5 13 18.8 25 14 34 C9.2 25 10.5 13 14 5 Z"
            fill="#F59E0B"
            opacity="0.32"
            transform="scale(1.22) translate(-2.5, -3.5)"
          />
          {/* Rich vermilion kumkum stroke */}
          <path
            d="M14 6 C17 14 18 25 14 33 C10 25 11 14 14 6 Z"
            fill={`url(#kumkum-grad-${variant})`}
          />
          {/* Golden Akshat (auspicious unbroken rice grains) appearing upon completion */}
          {clamped >= 0.85 && (
            <g fill="#FBF1D4" stroke="#C69B46" strokeWidth="0.6">
              <ellipse cx="13.2" cy="18" rx="1.25" ry="2.4" transform="rotate(-14 13.2 18)" />
              <ellipse cx="15.3" cy="22.5" rx="1.15" ry="2.2" transform="rotate(18 15.3 22.5)" />
              <ellipse cx="13.9" cy="12.5" rx="1.05" ry="1.9" transform="rotate(8 13.9 12.5)" />
            </g>
          )}
        </g>
      ) : (
        /* Graceful bridal vermilion Kumkum Tilak teardrop with fine golden Akshat */
        <g
          style={{
            transformOrigin: '14px 31px',
            transform: `scaleY(${clamped})`,
            transition: 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <path
            d="M14 11 C17.2 17 17.8 25.5 14 31 C10.2 25.5 10.8 17 14 11 Z"
            fill="#F59E0B"
            opacity="0.28"
            transform="scale(1.2) translate(-2.3, -3.6)"
          />
          <path
            d="M14 12 C16.6 17.8 17.2 25.5 14 30.5 C10.8 25.5 11.4 17.8 14 12 Z"
            fill={`url(#kumkum-grad-${variant})`}
          />
          <circle cx="14" cy="27.5" r="2.7" fill="#B91C1C" />
          {clamped >= 0.85 && (
            <g fill="#FBF1D4" stroke="#C69B46" strokeWidth="0.55">
              <ellipse cx="14" cy="18.2" rx="1.1" ry="2.1" transform="rotate(10 14 18.2)" />
              <ellipse cx="12.8" cy="22.6" rx="1.0" ry="1.8" transform="rotate(-16 12.8 22.6)" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

/**
 * STAGE 1: Subtle Ceremonial 'Apply Tilak' Opening Ritual
 * -----------------------------------------------------------------------------
 * Presents the bespoke faceless symbolic royal watercolor couple portrait.
 * Guests gently tap or swipe upward across the couple's forehead to apply the
 * sacred vermilion Kumkum & Akshat Tilak, marking the beginning of the
 * auspicious wedding journey before unveiling the full scroll invitation.
 */
export function ApplyTilakRitual({ onTilakApplied, onComplete }: ApplyTilakRitualProps) {
  const [tilakProgress, setTilakProgress] = useState(0);
  const [applied, setApplied] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [swipeSpark, setSwipeSpark] = useState<{ x: number; y: number } | null>(null);

  const dragStartRef = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const triggerCompletion = () => {
    if (applied) return;
    setApplied(true);
    setTilakProgress(1);
    setSwipeSpark(null);
    onTilakApplied();

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      setExiting(true);
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        onComplete();
      }, 620);
    }, 2200);
  };

  const handleEnterNow = () => {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }
    setExiting(true);
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      onComplete();
    }, 450);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (applied) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    dragStartRef.current = { x: e.clientX, y: e.clientY, active: true };
    setSwipeSpark({ x: relX, y: relY });
    setTilakProgress((prev) => Math.max(prev, 0.24));
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic pointer events
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (applied || !dragStartRef.current?.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setSwipeSpark({
      x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
    });

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const res = evaluateTilakGesture(dx, dy, false, 22);
    setTilakProgress(Math.max(0.24, res.progress));

    if (res.completed) {
      dragStartRef.current = null;
      triggerCompletion();
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (applied || !dragStartRef.current?.active) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = null;
    setSwipeSpark(null);

    const res = evaluateTilakGesture(dx, dy, true, 22);
    if (res.completed) {
      triggerCompletion();
    } else {
      setTilakProgress(0);
    }
  };

  const handlePointerCancel = () => {
    dragStartRef.current = null;
    setSwipeSpark(null);
    if (!applied) setTilakProgress(0);
  };

  return (
    <div
      data-testid="apply-tilak-stage"
      data-applied={applied ? 'true' : 'false'}
      className={`fixed inset-0 z-40 flex items-center justify-center px-4 py-6 overflow-y-auto transition-all duration-600 ${
        exiting ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 35%, rgba(94, 12, 32, 0.88) 0%, rgba(44, 6, 16, 0.94) 68%, rgba(24, 4, 9, 0.97) 100%)',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="relative w-full max-w-[426px] papercraft-card rounded-[26px] px-6 sm:px-7 pt-9 pb-8 text-center shadow-[0_28px_70px_rgba(12,2,5,0.65)]">
        <MadhubaniCornerFiligree position="tl" tone="gold" />
        <MadhubaniCornerFiligree position="tr" tone="gold" />
        <MadhubaniCornerFiligree position="bl" tone="gold" />
        <MadhubaniCornerFiligree position="br" tone="gold" />

        <div className="relative z-10 space-y-4">
          {/* Quiet Auspicious Header */}
          <div>
            <p className="font-micro-ui text-[9.5px] tracking-[0.2em] text-[#966B22]">
              Auspicious Beginning · शुभ आरम्भ
            </p>
            <h2 className="font-hindi-calligraphy text-[26px] sm:text-[28px] text-[#7A1026] mt-0.5 leading-snug">
              शुभ तिलक अर्पण
            </h2>
            <p className="font-english-serif italic text-[14px] text-[#5D3C43] mt-0.5">
              {WEDDING_DATA.couple.groomShortHindi} {WEDDING_DATA.couple.connectorHindi}{' '}
              {WEDDING_DATA.couple.brideShortHindi}
            </p>
            <MadhubaniAripanDivider className="mt-2.5 max-w-[200px] mx-auto" tone="gold" />
          </div>

          {/* Interactive Faceless Royal Couple Portrait Frame */}
          <div className="relative mx-auto w-full max-w-[306px]">
            <div
              data-testid="tilak-portrait-surface"
              role="button"
              tabIndex={0}
              aria-label="Tap or swipe across the couple's forehead to apply Tilak and begin the invitation"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerCompletion();
                }
              }}
              className={`relative aspect-[3/4] w-full rounded-t-[148px] rounded-b-[18px] overflow-hidden border-[1.5px] border-[#C69B46]/80 bg-[#FBF6EE] shadow-[0_14px_34px_-10px_rgba(66,7,20,0.34)] select-none touch-none ${
                applied ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              {/* Inner hairline gold frame */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[5px] rounded-t-[142px] rounded-b-[14px] border border-[#C69B46]/45 z-20"
              />

              {/* Faceless Symbolic Royal Watercolor Couple Illustration */}
              <img
                src={MEDIA_ASSETS.tilakFacelessPortraitImage}
                alt="Symbolic faceless royal watercolor illustration of Saurabh and Ranju in bridal attire"
                draggable={false}
                className="w-full h-full object-cover object-center pointer-events-none select-none"
              />

              {/* Subtle Golden Aura Bloom when Tilak is Applied */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ${
                  applied ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background:
                    'radial-gradient(circle at 53% 29%, rgba(245, 206, 118, 0.36) 0%, rgba(230, 57, 70, 0.08) 28%, transparent 62%)',
                }}
              />

              {/* Interactive Groom Forehead Anchor (x: 62.2%, y: 26.2%) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: '62.2%', top: '26.2%' }}
              >
                {!applied && tilakProgress === 0 && (
                  <span className="relative flex items-center justify-center w-8 h-8">
                    <span className="absolute inset-0 rounded-full border border-[#C69B46]/70 book-tap-ripple" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C69B46]/65 shadow-[0_0_8px_rgba(217,175,88,0.8)]" />
                  </span>
                )}
                <SacredTilakMark progress={tilakProgress} variant="groom" glow={applied} />
              </div>

              {/* Interactive Bride Forehead Anchor (x: 43.8%, y: 30.8%) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: '43.8%', top: '30.8%' }}
              >
                {!applied && tilakProgress === 0 && (
                  <span className="relative flex items-center justify-center w-7 h-7">
                    <span
                      className="absolute inset-0 rounded-full border border-[#C69B46]/60 book-tap-ripple"
                      style={{ animationDelay: '0.55s' }}
                    />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C69B46]/55 shadow-[0_0_7px_rgba(217,175,88,0.75)]" />
                  </span>
                )}
                <SacredTilakMark progress={tilakProgress} variant="bride" glow={applied} />
              </div>

              {/* Live Tactile Kumkum Ember Trail While Swiping */}
              {swipeSpark && !applied && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
                  style={{
                    left: swipeSpark.x,
                    top: swipeSpark.y,
                    background:
                      'radial-gradient(circle, rgba(200,30,43,0.75) 0%, rgba(230,176,72,0.35) 55%, transparent 100%)',
                  }}
                />
              )}
            </div>
          </div>

          {/* Subtle Gesture Prompt OR Sacred Completion Blessing */}
          {applied ? (
            <div data-testid="tilak-applied-blessing" className="space-y-3 pt-1">
              <p className="font-hindi-serif text-[14.5px] font-semibold text-[#7A1026]">
                शुभ तिलक अर्पित · मंगल यात्रा का शुभारम्भ
              </p>
              <p className="font-english-serif italic text-[13.5px] text-[#5D3C43]">
                Tilak applied — marking the beginning of their auspicious union.
              </p>
              <button
                type="button"
                onClick={handleEnterNow}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/85 font-micro-ui text-[9.5px] font-semibold hover:bg-[#5E0C1D] transition-colors cursor-pointer"
              >
                Enter Wedding Invitation
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <p className="font-hindi-serif text-[13px] font-medium text-[#7A1026]">
                मस्तक पर स्पर्श या ऊपर स्वाइप कर शुभ तिलक अर्पित करें
              </p>
              <p className="font-english-serif italic text-[13px] text-[#5D3C43]">
                Tap or swipe gently across the forehead to apply Tilak
              </p>

              <div className="pt-1 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={triggerCompletion}
                  className="px-5 py-2.5 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/80 font-micro-ui text-[9.5px] font-semibold hover:bg-[#5E0C1D] transition-colors cursor-pointer"
                >
                  Apply Tilak
                </button>
                <button
                  type="button"
                  onClick={handleEnterNow}
                  className="bg-transparent border-0 px-2 py-2 font-micro-ui text-[9px] text-[#7A5960] underline underline-offset-4 hover:text-[#7A1026] transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
