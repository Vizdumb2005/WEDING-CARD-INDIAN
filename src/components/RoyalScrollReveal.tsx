import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { WEDDING_DATA } from '../data/weddingData';
import {
  buildWeddingIcsContent,
  computeCountdown,
  computeScrollDragProgress,
  padTwo,
} from '../utils/weddingLogic';
import { MadhubaniAripanDivider, MadhubaniCornerFiligree, UiIcon } from './MadhubaniArt';

interface RoyalScrollRevealProps {
  onScrollUnrolled: () => void;
}

/**
 * SECTION 2: Tactile "Pull to Reveal" Royal Scroll, Live IST Countdown & .ics Export
 * -----------------------------------------------------------------------------
 * - Physical cylindrical metallic-gold & teak-wood scroll rods with carved finials
 * - Crimson & antique-gold SVG silk tassel supporting smooth pointer drag AND single-tap fallback
 * - Snaps open smoothly past 45% pull, chiming temple bell + firing 3D petal burst
 */
export function RoyalScrollReveal({ onScrollUnrolled }: RoyalScrollRevealProps) {
  const [unrolled, setUnrolled] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    computeCountdown(WEDDING_DATA.dates.weddingIsoIst)
  );

  const dragStartYRef = useRef<number | null>(null);
  const hasFiredCallbackRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(computeCountdown(WEDDING_DATA.dates.weddingIsoIst));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const triggerUnroll = () => {
    setUnrolled(true);
    setDragProgress(1);
    setIsDragging(false);
    if (!hasFiredCallbackRef.current) {
      hasFiredCallbackRef.current = true;
      onScrollUnrolled();
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (unrolled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartYRef.current = e.clientY;
    setIsDragging(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging || unrolled || dragStartYRef.current === null) return;
    const deltaY = e.clientY - dragStartYRef.current;
    const { progress } = computeScrollDragProgress(deltaY, 155);
    setDragProgress(progress);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging || unrolled) return;
    const startY = dragStartYRef.current ?? e.clientY;
    const deltaY = e.clientY - startY;
    dragStartYRef.current = null;
    setIsDragging(false);

    // Single tap (< 12px movement) OR pull past 45% cleanly unrolls the royal scroll
    const { shouldSnapOpen } = computeScrollDragProgress(deltaY, 155);
    if (Math.abs(deltaY) < 12 || shouldSnapOpen) {
      triggerUnroll();
    } else {
      setDragProgress(0);
    }
  };

  const handleAddToCalendar = () => {
    const ics = buildWeddingIcsContent();
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Saurabh-Sang-Ranju-Shubh-Vivah-2026.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setCalendarSaved(true);
  };

  const visualProgress = unrolled ? 1 : dragProgress;
  const parchmentHeightPx = 38 + Math.round(visualProgress * 262);

  return (
    <section
      id="save-the-date"
      aria-label="Save the Date Royal Scroll"
      className="relative px-5 py-14 overflow-hidden"
    >
      {/* Header framed by Madhubani Aripan lotus divider */}
      <div className="relative z-10 text-center mb-8">
        <p className="font-micro-ui text-[10px] text-[#7A5960]">Save the Date</p>
        <h2 className="font-english-serif text-[32px] font-semibold text-[#7A1026] leading-tight mt-1">
          {unrolled ? 'Shubh Vivah Muhurat' : 'Pull to Reveal'}
        </h2>
        <p className="font-hindi-serif text-sm text-[#7A5960] mt-0.5">
          शुभ विवाह तिथि · पावन बेला
        </p>
        <MadhubaniAripanDivider className="mt-3" tone="gold" />
      </div>

      {/* Physical 3D Royal Scroll Assembly */}
      <div className="relative z-10 mx-auto max-w-[356px] flex flex-col items-center">
        {/* Top Turned Metallic-Gold & Teak Scroll Rod */}
        <div
          aria-hidden="true"
          className="relative w-full h-7 flex items-center justify-between z-20"
        >
          {/* Left Finial Knob */}
          <div className="w-6 h-7 rounded-l-full gold-foil-gradient border border-[#7A5316]/60 shadow-md flex items-center justify-center">
            <span className="w-1.5 h-3.5 rounded-full bg-[#5C0D1E]" />
          </div>
          {/* Cylindrical Teak & Gold Shaft */}
          <div
            className="flex-1 h-5 mx-[-2px] border-y border-[#EED492]/60 shadow-[0_6px_14px_rgba(44,6,15,0.34)]"
            style={{
              background:
                'linear-gradient(180deg, #8B5C28 0%, #592C14 35%, #3C1A0B 72%, #8F642B 100%)',
            }}
          />
          {/* Right Finial Knob */}
          <div className="w-6 h-7 rounded-r-full gold-foil-gradient border border-[#7A5316]/60 shadow-md flex items-center justify-center">
            <span className="w-1.5 h-3.5 rounded-full bg-[#5C0D1E]" />
          </div>
        </div>

        {/* Unrolling Handmade Cotton Parchment Body */}
        <div
          data-testid="royal-scroll-parchment"
          data-unrolled={unrolled ? 'true' : 'false'}
          className="relative w-[90%] overflow-hidden bg-[#FBF6EE] border-x border-[#C69B46]/65"
          style={{
            height: `${parchmentHeightPx}px`,
            transition: isDragging
              ? 'none'
              : 'height 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow:
              'inset 0 14px 20px -12px rgba(66,7,20,0.28), inset 0 -14px 20px -12px rgba(66,7,20,0.22), 0 18px 34px -10px rgba(66,7,20,0.2)',
          }}
        >
          <div
            className="relative h-[300px] px-5 py-6 flex flex-col items-center justify-center text-center"
            style={{
              opacity: Math.max(0.12, visualProgress),
              transition: isDragging ? 'none' : 'opacity 0.6s ease',
            }}
          >
            <MadhubaniCornerFiligree position="tl" tone="gold" />
            <MadhubaniCornerFiligree position="tr" tone="gold" />
            <MadhubaniCornerFiligree position="bl" tone="gold" />
            <MadhubaniCornerFiligree position="br" tone="gold" />

            <p className="font-micro-ui text-[9.5px] text-[#7A5960]">
              {WEDDING_DATA.dates.weddingWeekdayEnglish} · {WEDDING_DATA.dates.weddingWeekdayHindi}
            </p>
            <p className="font-royal-caps text-[62px] leading-none font-semibold text-[#7A1026] letterpress-deboss my-1 tabular-nums">
              {WEDDING_DATA.dates.weddingDayNumeral}
            </p>
            <p className="font-hindi-calligraphy text-[24px] text-[#33181E]">
              {WEDDING_DATA.dates.weddingMonthHindi} {WEDDING_DATA.dates.weddingYear}
            </p>
            <p className="font-english-serif italic text-base text-[#7A5960] -mt-0.5">
              {WEDDING_DATA.dates.weddingMonthEnglish} {WEDDING_DATA.dates.weddingYear}
            </p>

            <div className="w-28 h-[1px] bg-gradient-to-r from-transparent via-[#C69B46] to-transparent my-3" />

            <p className="font-hindi-serif text-[13.5px] font-semibold text-[#7A1026]">
              {WEDDING_DATA.dates.baraatTimeHindi}
            </p>
            <p className="font-hindi-serif text-xs text-[#7A5960] mt-0.5">
              निवास अवधानपुर, भोजेमऊ, प्रतापगढ़ से
            </p>
          </div>
        </div>

        {/* Bottom Turned Scroll Rod */}
        <div
          aria-hidden="true"
          className="relative w-full h-7 flex items-center justify-between z-20"
        >
          <div className="w-6 h-7 rounded-l-full gold-foil-gradient border border-[#7A5316]/60 shadow-md flex items-center justify-center">
            <span className="w-1.5 h-3.5 rounded-full bg-[#5C0D1E]" />
          </div>
          <div
            className="flex-1 h-5 mx-[-2px] border-y border-[#EED492]/60 shadow-[0_8px_16px_rgba(44,6,15,0.34)]"
            style={{
              background:
                'linear-gradient(180deg, #8B5C28 0%, #592C14 35%, #3C1A0B 72%, #8F642B 100%)',
            }}
          />
          <div className="w-6 h-7 rounded-r-full gold-foil-gradient border border-[#7A5316]/60 shadow-md flex items-center justify-center">
            <span className="w-1.5 h-3.5 rounded-full bg-[#5C0D1E]" />
          </div>
        </div>

        {/* Crimson & Gold Silk Tassel Handle (Drag down OR Tap to reveal) */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!unrolled) triggerUnroll();
          }}
          disabled={unrolled}
          aria-label={
            unrolled
              ? 'Wedding date scroll revealed: 09 December 2026'
              : 'Pull or tap silk tassel to reveal the wedding date'
          }
          style={{ touchAction: 'none' }}
          className={`relative z-20 -mt-1 flex flex-col items-center bg-transparent border-0 p-1 ${
            unrolled ? 'cursor-default opacity-80' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <svg
            viewBox="0 0 60 76"
            fill="none"
            aria-hidden="true"
            className={`w-12 h-16 ${unrolled ? '' : 'tassel-sway'}`}
          >
            {/* Gold braided cord */}
            <line x1="30" y1="0" x2="30" y2="20" stroke="#C69B46" strokeWidth="2.4" />
            {/* Gold bead cap */}
            <circle cx="30" cy="23" r="6" fill="#C69B46" stroke="#7A5316" strokeWidth="1" />
            <circle cx="30" cy="23" r="2.2" fill="#F9E6B3" />
            {/* Crimson silk tassel skirt */}
            <path
              d="M23 28 H37 L42 66 C38 70, 22 70, 18 66 L23 28 Z"
              fill="#7A1026"
              stroke="#C69B46"
              strokeWidth="1"
            />
            <line x1="27" y1="30" x2="25" y2="66" stroke="#EED492" strokeWidth="0.7" opacity="0.6" />
            <line x1="30" y1="30" x2="30" y2="68" stroke="#EED492" strokeWidth="0.8" opacity="0.7" />
            <line x1="33" y1="30" x2="35" y2="66" stroke="#EED492" strokeWidth="0.7" opacity="0.6" />
          </svg>

          {!unrolled && (
            <span className="mt-1 px-4 py-1.5 rounded-full bg-[#FBF6EE] border border-[#C69B46]/70 shadow-sm font-micro-ui text-[9.5px] text-[#7A1026] font-medium whitespace-nowrap">
              Drag the Tassel Down · Tap to Reveal
            </span>
          )}
        </button>
      </div>

      {/* Post-Reveal Interactive Trio: Date Confirmation, Live IST Countdown, Add to Calendar */}
      <div
        className={`relative z-10 mt-7 max-w-[356px] mx-auto space-y-5 transition-all duration-700 ${
          unrolled
            ? 'opacity-100 translate-y-0'
            : 'opacity-45 translate-y-2'
        }`}
      >
        {/* Confirmed Date Ribbon */}
        <div className="text-center py-2.5 px-4 rounded-full bg-[#F5E7E4] border border-[#C69B46]/50">
          <p className="font-hindi-serif text-sm font-semibold text-[#7A1026]">
            {WEDDING_DATA.dates.weddingFullHindi} · 09 Dec 2026
          </p>
        </div>

        {/* Live Ticking IST Countdown */}
        <div
          data-testid="wedding-countdown"
          aria-live="off"
          className="papercraft-card rounded-[18px] px-3 py-4 grid grid-cols-4 gap-1.5 text-center"
        >
          {[
            { value: String(countdown.days), label: 'Days' },
            { value: padTwo(countdown.hours), label: 'Hrs' },
            { value: padTwo(countdown.minutes), label: 'Min' },
            { value: padTwo(countdown.seconds), label: 'Sec' },
          ].map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <span className="font-royal-caps text-[26px] font-semibold text-[#7A1026] leading-tight tabular-nums">
                {unit.value}
              </span>
              <span className="font-micro-ui text-[8.5px] text-[#7A5960] mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Add to Calendar Letterpress Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAddToCalendar}
            className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap font-micro-ui text-[10.5px] font-semibold ${
              calendarSaved
                ? 'bg-[#5D7A5B] border-[#5D7A5B] text-[#FBF6EE]'
                : 'bg-[#7A1026] border-[#C69B46]/80 text-[#FBF6EE] hover:bg-[#5E0C1D] active:scale-[0.98]'
            }`}
          >
            <UiIcon name={calendarSaved ? 'check' : 'calendar'} className="w-4 h-4" />
            <span>{calendarSaved ? 'Saved to Calendar' : 'Add to Calendar'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
