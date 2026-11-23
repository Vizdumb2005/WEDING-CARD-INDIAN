import { useEffect, useState } from 'react';
import { MEDIA_ASSETS, WEDDING_DATA } from '../data/weddingData';
import {
  MadhubaniAripanDivider,
  MadhubaniCornerFiligree,
  MuseumMatFrame,
  PapercraftToran,
  UiIcon,
} from './MadhubaniArt';

interface HeroArchSectionProps {
  isOpened: boolean;
}

/**
 * SECTION 1: Die-Cut Mughal Arch Hero & Choreographed Typewriter Reveal
 * -----------------------------------------------------------------------------
 * - Swaying layered papercraft torans at the top corners
 * - Top untampered Ganesha lotus artwork & Maa Vindhyavasini invocation
 * - Tall recessed die-cut scalloped arch displaying the original untampered couple watercolor
 * - Calligraphic typewriter reveal for सौरभ संग रंजू
 * - Layered die-cut Groom (वर पक्ष) & Bride (वधू पक्ष) lineage folios verbatim from PDF
 */
export function HeroArchSection({ isOpened }: HeroArchSectionProps) {
  const [groomTyped, setGroomTyped] = useState('');
  const [showConnector, setShowConnector] = useState(false);
  const [brideTyped, setBrideTyped] = useState('');
  const [revealDone, setRevealDone] = useState(false);

  const groomTarget = WEDDING_DATA.couple.groomShortHindi;
  const brideTarget = WEDDING_DATA.couple.brideShortHindi;

  useEffect(() => {
    if (!isOpened) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setGroomTyped(groomTarget);
      setShowConnector(true);
      setBrideTyped(brideTarget);
      setRevealDone(true);
      return;
    }

    const timers: number[] = [];
    // Split Devanagari grapheme clusters safely using Intl.Segmenter when available
    const segment = (str: string): string[] => {
      if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
        const seg = new Intl.Segmenter('hi', { granularity: 'grapheme' });
        return Array.from(seg.segment(str), (s) => s.segment);
      }
      return Array.from(str);
    };

    const gChars = segment(groomTarget);
    const bChars = segment(brideTarget);

    let cursorMs = 260;
    gChars.forEach((_, idx) => {
      timers.push(
        window.setTimeout(() => {
          setGroomTyped(gChars.slice(0, idx + 1).join(''));
        }, cursorMs)
      );
      cursorMs += 130;
    });

    cursorMs += 140;
    timers.push(window.setTimeout(() => setShowConnector(true), cursorMs));

    cursorMs += 200;
    bChars.forEach((_, idx) => {
      timers.push(
        window.setTimeout(() => {
          setBrideTyped(bChars.slice(0, idx + 1).join(''));
        }, cursorMs)
      );
      cursorMs += 145;
    });

    cursorMs += 220;
    timers.push(window.setTimeout(() => setRevealDone(true), cursorMs));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isOpened, groomTarget, brideTarget]);

  return (
    <section
      id="hero-invitation"
      aria-label="Wedding Invitation Hero"
      className="relative min-h-[100svh] px-5 pt-5 pb-12 overflow-hidden"
    >
      {/* Gently swaying papercraft mango-leaf & marigold torans */}
      <div className="absolute top-0 left-0 pointer-events-none z-10">
        <PapercraftToran side="left" />
      </div>
      <div className="absolute top-0 right-0 pointer-events-none z-10">
        <PapercraftToran side="right" />
      </div>

      {/* Top Sacred Invocation + Original Ganesha Painting */}
      <div className="relative z-20 flex flex-col items-center text-center pt-1">
        <div className="w-[62px] h-[74px] rounded-full p-1 bg-white border border-[#C69B46]/55 shadow-[0_6px_18px_rgba(68,10,24,0.12)] mb-2 flex items-center justify-center overflow-hidden">
          <img
            src={MEDIA_ASSETS.ganeshaLotusImage}
            alt="श्री गणेशाय नमः — Lord Ganesha seated on a blooming lotus"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
            style={{ filter: 'none' }}
          />
        </div>

        <p className="font-hindi-serif text-sm font-semibold text-[#7A1026] letterpress-deboss">
          {WEDDING_DATA.invocations.ganeshNamah}
        </p>

        <p className="font-hindi-serif text-xs text-[#7A5960] mt-1 leading-relaxed max-w-[320px]">
          {WEDDING_DATA.invocations.ganeshShlokaLine1}
          <br />
          {WEDDING_DATA.invocations.ganeshShlokaLine2}
        </p>

        <MadhubaniAripanDivider className="my-2" tone="gold" />

        <p className="font-hindi-serif text-[12.5px] text-[#7A5960]">
          {WEDDING_DATA.invocations.salutation}
        </p>
        <p className="font-hindi-serif text-[14px] font-semibold text-[#7A1026]">
          {WEDDING_DATA.invocations.deviBlessing}
        </p>
      </div>

      {/* Tall Multi-Layer Die-Cut Scalloped Mughal Arch framing Untampered Couple Painting */}
      <div className="relative z-20 mt-4 mx-auto max-w-[292px]">
        <p className="font-micro-ui text-[9px] text-[#7A5960] text-center mb-2">
          Pawan Parinay · Shubh Vivah
        </p>
        <MuseumMatFrame
          src={MEDIA_ASSETS.heroCoupleImage}
          alt="Original watercolor portrait of Saurabh Pandey and Ranju Dubey holding floral garlands"
          variant="arch"
          fit="cover"
          imagePosition="object-top"
          kenBurns
          fallbackMotif="couple"
          fallbackTitle="चि. सौरभ पाण्डेय संग आयु० रंजू दुबे"
          className="aspect-[3/3.65]"
        />
      </div>

      {/* Calligraphic Typewriter Reveal of Couple Names */}
      <div className="relative z-20 mt-5 text-center">
        <p className="font-micro-ui text-[10px] text-[#7A5960] mb-1.5">
          The Wedding Invitation
        </p>

        <div className="min-h-[124px] flex flex-col items-center justify-center">
          <h1 className="font-hindi-display text-[44px] sm:text-[48px] text-[#7A1026] letterpress-deboss leading-[1.35]">
            <span>{groomTyped || '\u00A0'}</span>
            {isOpened && !showConnector && (
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-9 bg-[#C69B46] align-middle ml-1 animate-pulse"
              />
            )}
          </h1>

          <div
            className={`my-1.5 inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#C69B46]/70 bg-[#FBF6EE] shadow-[0_4px_14px_rgba(122,16,38,0.12)] transition-all duration-500 ${
              showConnector ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <span className="font-hindi-serif text-sm font-semibold text-[#966B22]">
              {WEDDING_DATA.couple.connectorHindi}
            </span>
          </div>

          <p className="font-hindi-display text-[44px] sm:text-[48px] text-[#7A1026] letterpress-deboss leading-[1.35]">
            <span>{brideTyped || '\u00A0'}</span>
            {showConnector && !revealDone && (
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-9 bg-[#C69B46] align-middle ml-1 animate-pulse"
              />
            )}
          </p>
        </div>

        <p className="font-royal-caps text-xs tracking-[0.26em] text-[#7A5960] uppercase mt-1">
          {WEDDING_DATA.couple.groomShortEnglish} &amp; {WEDDING_DATA.couple.brideShortEnglish}
        </p>

        {/* Verbatim Quick Dates Bar */}
        <div className="mt-4 py-3 px-4 border-y border-[#C69B46]/45 max-w-[340px] mx-auto space-y-1">
          <p className="font-hindi-serif text-[13.5px] font-medium text-[#33181E]">
            {WEDDING_DATA.dates.tilakSummaryHindi}
          </p>
          <p className="font-hindi-serif text-[14px] font-semibold text-[#7A1026]">
            {WEDDING_DATA.dates.vivahSummaryHindi}
          </p>
        </div>
      </div>

      {/* Layered Die-Cut Lineage Folios (Groom Side & Bride Side Verbatim from PDF) */}
      <div
        className={`relative z-20 mt-8 space-y-4 transition-all duration-700 ${
          revealDone || isOpened ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Groom Lineage Folio */}
        <article className="relative papercraft-card rounded-[20px] px-6 pt-9 pb-7 text-center">
          <MadhubaniCornerFiligree position="tl" tone="gold" />
          <MadhubaniCornerFiligree position="tr" tone="gold" />
          <p className="font-micro-ui text-[9.5px] text-[#7A5960] mb-1.5">
            {WEDDING_DATA.couple.groomSideLabel}
          </p>
          <h2 className="font-hindi-calligraphy text-[26px] text-[#7A1026] mb-2">
            {WEDDING_DATA.couple.groomFullHindi}
          </h2>
          <p className="font-hindi-serif text-[13.5px] text-[#33181E]">
            {WEDDING_DATA.couple.groomParents}
          </p>
          <p className="font-hindi-serif text-[13px] text-[#7A5960] mt-1.5">
            {WEDDING_DATA.couple.groomGrandparents}
          </p>
        </article>

        {/* Delicate Sang Line */}
        <div className="flex items-center justify-center gap-3 py-1" aria-hidden="true">
          <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#C69B46]/70" />
          <span className="font-hindi-serif text-xs text-[#966B22] font-semibold">
            {WEDDING_DATA.couple.connectorHindi}
          </span>
          <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#C69B46]/70" />
        </div>

        {/* Bride Lineage Folio */}
        <article className="relative papercraft-card rounded-[20px] px-6 pt-7 pb-9 text-center bg-gradient-to-b from-[#FDF7F7] to-[#F6E8E8]">
          <MadhubaniCornerFiligree position="bl" tone="gold" />
          <MadhubaniCornerFiligree position="br" tone="gold" />
          <p className="font-micro-ui text-[9.5px] text-[#7A5960] mb-1.5">
            {WEDDING_DATA.couple.brideSideLabel}
          </p>
          <h2 className="font-hindi-calligraphy text-[26px] text-[#7A1026] mb-2">
            {WEDDING_DATA.couple.brideFullHindi}
          </h2>
          <p className="font-hindi-serif text-[13.5px] text-[#33181E]">
            {WEDDING_DATA.couple.brideParents}
          </p>
          <p className="font-hindi-serif text-[13px] text-[#7A5960] mt-1.5">
            {WEDDING_DATA.couple.brideGrandparents}
          </p>
          <p className="font-hindi-serif text-[12.5px] text-[#5D3C43] mt-3 pt-2.5 border-t border-[#C69B46]/30">
            {WEDDING_DATA.couple.brideHometown}
          </p>
        </article>
      </div>

      {/* Auspicious Plea & Scroll Prompt */}
      <div className="relative z-20 mt-8 text-center px-2">
        <p className="font-hindi-serif text-base font-semibold text-[#7A1026]">
          {WEDDING_DATA.invocations.parinayHeading}
        </p>
        <p className="font-hindi-serif text-[13.5px] text-[#33181E] mt-1.5 max-w-[340px] mx-auto">
          {WEDDING_DATA.invocations.parinayPlea}
        </p>

        <a
          href="#save-the-date"
          className="inline-flex flex-col items-center gap-1 mt-7 text-[#7A5960] hover:text-[#7A1026] transition-colors"
        >
          <span className="font-micro-ui text-[9.5px]">Scroll to Explore</span>
          <UiIcon name="down" className="w-4 h-4 text-[#C69B46]" />
        </a>
      </div>
    </section>
  );
}
