import { WEDDING_DATA } from '../data/weddingData';
import {
  CeremonyIcon,
  MadhubaniAripanDivider,
  MadhubaniCornerFiligree,
} from './MadhubaniArt';

function GoldFourPointStar({ className = '', delay = '0s' }: { className?: string; delay?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animationDelay: delay }}
      className={`royal-star-twinkle pointer-events-none ${className}`}
    >
      <path
        d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z"
        fill="#F0D693"
      />
    </svg>
  );
}

/**
 * SECTION 5: High-Contrast Dark Royal Centerpiece Card
 * -----------------------------------------------------------------------------
 * Dramatic editorial contrast pause in deep royal velvet wine (#7B1028 -> #3D0512):
 * 1. Primary Spotlight: Verbatim बाल मनुहार couplet by अक्षिता, गार्गी from the PDF
 * 2. Optional Reception Highlight (configurable via WEDDING_DATA.reception.enabled)
 */
export function DarkRoyalCenterpiece() {
  return (
    <section
      id="royal-spotlight"
      aria-label="Bal Manuhar and Evening Celebration"
      className="relative px-5 py-12 space-y-6"
    >
      {/* Card 1: Verbatim Bal Manuhar Spotlight */}
      <article className="relative royal-velvet-card rounded-[24px] px-7 py-11 text-center overflow-hidden border border-[#C69B46]/55">
        {/* Inset double antique gold frame */}
        <div
          aria-hidden="true"
          className="absolute inset-3 rounded-[17px] border border-[#EED492]/35 pointer-events-none"
        >
          <div className="absolute inset-1.5 rounded-[13px] border border-[#C69B46]/22" />
        </div>

        <MadhubaniCornerFiligree position="tl" tone="ivory" />
        <MadhubaniCornerFiligree position="tr" tone="ivory" />
        <MadhubaniCornerFiligree position="bl" tone="ivory" />
        <MadhubaniCornerFiligree position="br" tone="ivory" />

        {/* Softly twinkling 4-point gold stars */}
        <GoldFourPointStar className="absolute top-8 left-12 w-3.5 h-3.5" delay="0s" />
        <GoldFourPointStar className="absolute top-12 right-12 w-2.5 h-2.5" delay="1.4s" />
        <GoldFourPointStar className="absolute bottom-10 left-16 w-2.5 h-2.5" delay="2.2s" />
        <GoldFourPointStar className="absolute bottom-9 right-14 w-3.5 h-3.5" delay="0.8s" />

        <div className="relative z-10 max-w-[330px] mx-auto">
          <p className="font-micro-ui text-[9.5px] text-[#F0D693]/85">
            From the Little Hearts
          </p>
          <h2 className="font-hindi-calligraphy text-[28px] text-[#F9E6B3] mt-1.5 tracking-wide">
            {WEDDING_DATA.balManuhar.titleHindi}
          </h2>

          <MadhubaniAripanDivider className="my-3.5 max-w-[210px]" tone="ivory" />

          <blockquote className="m-0 font-hindi-serif text-[16px] text-[#FDF6EC] leading-[1.85] tracking-[0.01em]">
            <p>{WEDDING_DATA.balManuhar.verseLine1}</p>
            <p className="mt-1">{WEDDING_DATA.balManuhar.verseLine2}</p>
          </blockquote>

          <p className="font-hindi-serif text-[15px] font-semibold text-[#F0D693] mt-5 tracking-wide">
            {WEDDING_DATA.balManuhar.childrenHindi}
          </p>
        </div>
      </article>

      {/* Card 2: Optional Reception Highlight (Video Parity) */}
      {WEDDING_DATA.reception.enabled && (
        <article className="relative royal-velvet-card rounded-[24px] px-7 py-10 text-center overflow-hidden border border-[#C69B46]/55">
          <div
            aria-hidden="true"
            className="absolute inset-3 rounded-[17px] border border-[#EED492]/30 pointer-events-none"
          />
          <MadhubaniCornerFiligree position="tl" tone="ivory" />
          <MadhubaniCornerFiligree position="br" tone="ivory" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-[#F0D693]/55 bg-[#4B0816] flex items-center justify-center mb-3">
              <CeremonyIcon type="flutes" className="w-7 h-7" />
            </div>

            <p className="font-micro-ui text-[9.5px] text-[#F0D693]/85">
              {WEDDING_DATA.reception.kicker}
            </p>
            <h3 className="font-english-serif text-[27px] font-semibold text-[#FDF6EC] leading-snug mt-1">
              {WEDDING_DATA.reception.titleEnglish}
            </h3>
            <p className="font-hindi-serif text-sm text-[#F4DC9A] mt-0.5">
              {WEDDING_DATA.reception.titleHindi}
            </p>

            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#F0D693]/60 to-transparent my-4" />

            <p className="font-hindi-serif text-[13.5px] text-[#FDF6EC]/95">
              {WEDDING_DATA.reception.dateDisplay}
            </p>
            <p className="font-hindi-serif text-[12.5px] text-[#F5E7E4]/80 mt-1 max-w-[300px]">
              {WEDDING_DATA.reception.venueDisplay}
            </p>

            <div className="mt-5 px-4 py-1.5 rounded-full border border-[#F0D693]/60 bg-[#4A0817]/90">
              <span className="font-micro-ui text-[9.5px] text-[#F9E6B3]">
                Dress Code: {WEDDING_DATA.reception.dressCodeLabel}
              </span>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
