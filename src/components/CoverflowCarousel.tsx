import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { MEDIA_ASSETS, WEDDING_DATA, type CeremonyItem } from '../data/weddingData';
import {
  CeremonyIcon,
  MadhubaniAripanDivider,
  MuseumMatFrame,
  UiIcon,
} from './MadhubaniArt';

function getCeremonyBannerStyle(theme: CeremonyItem['bannerTheme']): string {
  switch (theme) {
    case 'tilak':
      return 'linear-gradient(160deg, #E8C57B 0%, #D4962A 55%, #8D5515 100%)';
    case 'matripujan':
      return 'linear-gradient(160deg, #E7A977 0%, #C56E2B 52%, #7D3315 100%)';
    case 'vivah':
      return 'linear-gradient(160deg, #981B35 0%, #7A1026 54%, #420714 100%)';
    case 'aagman':
      return 'linear-gradient(160deg, #EABAC2 0%, #C97687 55%, #7F2D41 100%)';
  }
}

/**
 * SECTION 3: Two-Zone 3D Perspective Coverflow — Wedding Festivities (मांगलिक कार्यक्रम)
 * WITH recessed untampered Mandap watercolor & tactile Dress Code fabric swatches.
 */
export function CeremoniesCoverflowSection() {
  const ceremonies = WEDDING_DATA.ceremonies;
  const [activeIdx, setActiveIdx] = useState(0);
  const swipeStartXRef = useRef<number | null>(null);

  const goPrev = () => setActiveIdx((i) => (i > 0 ? i - 1 : ceremonies.length - 1));
  const goNext = () => setActiveIdx((i) => (i < ceremonies.length - 1 ? i + 1 : 0));

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swipeStartXRef.current = e.clientX;
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeStartXRef.current === null) return;
    const dx = e.clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (dx <= -42) goNext();
    else if (dx >= 42) goPrev();
  };

  return (
    <section
      id="wedding-festivities"
      aria-label="Wedding Festivities and Itinerary"
      className="relative px-4 py-14 overflow-hidden"
    >
      {/* Header with Verbatim Ganesh Invocation */}
      <div className="text-center px-2">
        <p className="font-hindi-serif text-xs font-semibold text-[#7A1026]">
          {WEDDING_DATA.invocations.ganeshNamah}
        </p>
        <p className="font-hindi-serif text-[13px] text-[#7A5960] mt-1 leading-relaxed">
          {WEDDING_DATA.invocations.itineraryVerseLine1}
          <br />
          {WEDDING_DATA.invocations.itineraryVerseLine2}
        </p>

        <MadhubaniAripanDivider className="my-3.5" tone="gold" />

        <p className="font-micro-ui text-[10px] text-[#7A5960]">
          Wedding Itinerary · Sacred Ceremonies
        </p>
        <h2 className="font-hindi-calligraphy text-[30px] text-[#7A1026] mt-1">
          मांगलिक कार्यक्रम
        </h2>
      </div>

      {/* Untampered Recessed Showcase of Original Ivory Floral Mandap Painting */}
      <div className="mt-5 max-w-[360px] mx-auto">
        <MuseumMatFrame
          src={MEDIA_ASSETS.ceremonyMandapImage}
          alt="Original watercolor illustration of the sacred floral wedding mandap"
          variant="rect"
          fallbackMotif="mandap"
          fallbackTitle="पावन संस्कार एवं उत्सव"
        />
      </div>

      {/* 3D Perspective Swipe Coverflow Stage */}
      <div
        data-testid="ceremonies-coverflow"
        data-active-index={activeIdx}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative mt-8 h-[466px] w-full flex items-center justify-center select-none"
        style={{ perspective: '1100px' }}
      >
        {ceremonies.map((item, idx) => {
          const offset = idx - activeIdx;
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 1;

          const translateX = offset * 84;
          const scale = offset === 0 ? 1 : 0.86;
          const rotateY = offset === 0 ? 0 : offset < 0 ? 12 : -12;
          const opacity = offset === 0 ? 1 : absOffset === 1 ? 0.72 : 0;
          const blurPx = offset === 0 ? 0 : 1.6;

          return (
            <article
              key={item.id}
              aria-hidden={offset !== 0}
              className="absolute w-[304px] sm:w-[322px] rounded-[22px] overflow-hidden papercraft-card flex flex-col"
              style={{
                transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`,
                opacity,
                filter: blurPx ? `blur(${blurPx}px)` : 'none',
                zIndex: offset === 0 ? 30 : 20 - absOffset,
                pointerEvents: offset === 0 ? 'auto' : 'none',
                visibility: isVisible ? 'visible' : 'hidden',
                transition:
                  'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, filter 0.45s ease',
              }}
            >
              {/* Zone 1: Top Atmospheric Art Banner (~40% height) */}
              <div
                className="relative h-[146px] px-5 pt-4 pb-8 flex flex-col justify-between overflow-hidden"
                style={{ background: getCeremonyBannerStyle(item.bannerTheme) }}
              >
                {/* Delicate Mithila SVG lotus & temple arch linework strictly in banner */}
                <svg
                  viewBox="0 0 320 146"
                  fill="none"
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
                >
                  <path
                    d="M18 146 V54 C18 32, 92 22, 160 8 C228 22, 302 32, 302 54 V146"
                    stroke="#F9E6B3"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M32 146 V60 C32 42, 98 32, 160 20 C222 32, 288 42, 288 60 V146"
                    stroke="#F9E6B3"
                    strokeWidth="0.7"
                    strokeDasharray="3 4"
                  />
                  <circle cx="52" cy="36" r="14" stroke="#F9E6B3" strokeWidth="0.8" />
                  <circle cx="268" cy="36" r="14" stroke="#F9E6B3" strokeWidth="0.8" />
                </svg>

                <div className="relative z-10 flex items-center justify-between text-[#FDF7EC]">
                  <span className="font-micro-ui text-[9px] opacity-90">
                    Ritual 0{idx + 1} / 0{ceremonies.length}
                  </span>
                  <span className="font-hindi-serif text-xs font-medium opacity-95">
                    {item.dateDisplay}
                  </span>
                </div>

                <div className="relative z-10 text-center pb-2">
                  <p className="font-english-serif italic text-[17px] text-[#FDF7EC] drop-shadow-sm">
                    {item.titleEnglish}
                  </p>
                </div>
              </div>

              {/* Overlapping Circular Gold-Rimmed Paper Medallion (60x60px) */}
              <div className="relative -mt-8 mx-auto z-20 w-[60px] h-[60px] rounded-full bg-[#FBF6EE] border-2 border-[#C69B46] shadow-[0_6px_16px_rgba(66,7,20,0.2)] flex items-center justify-center">
                <CeremonyIcon type={item.iconType} className="w-8 h-8" />
              </div>

              {/* Zone 2: Ceremony Details + Tactile Dress Code Fabric Swatch */}
              <div className="px-5 pt-3.5 pb-6 flex-1 flex flex-col justify-between text-center">
                <div>
                  <p className="font-micro-ui text-[9px] text-[#7A5960]">
                    {item.dateDisplay} · {item.dayHindi}
                  </p>
                  <h3 className="font-hindi-calligraphy text-[22px] text-[#7A1026] mt-1.5">
                    {item.titleHindi}
                  </h3>
                  {item.timingHindi && (
                    <p className="font-hindi-serif text-[12px] font-semibold text-[#966B22] mt-1.5">
                      {item.timingHindi}
                    </p>
                  )}
                  <p className="font-hindi-serif text-[13px] text-[#33181E] mt-2 leading-relaxed">
                    {item.descriptionHindi}
                  </p>
                </div>

                {/* Tactile Dress Code Sub-Card */}
                <div className="mt-5 flex items-center gap-3.5 px-3.5 py-3 rounded-[14px] bg-[#F5E7E4]/85 border border-[#C69B46]/40 text-left">
                  <div
                    aria-hidden="true"
                    className="w-[36px] h-[36px] shrink-0 rounded-[9px] border border-[#C69B46]/70 shadow-inner"
                    style={{
                      background: `repeating-linear-gradient(135deg, ${item.dressCode.swatchHex} 0px, ${item.dressCode.swatchHex} 5px, ${item.dressCode.swatchSecondaryHex} 5px, ${item.dressCode.swatchSecondaryHex} 7px)`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-micro-ui text-[8.5px] text-[#7A5960]">Dress Code</p>
                    <p className="font-english-serif text-[13.5px] font-semibold text-[#33181E] leading-snug mt-0.5">
                      {item.dressCode.label}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Controls, Active Crimson Pill Dots & Swipe Cue */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous ceremony"
            className="w-10 h-10 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#7A1026] flex items-center justify-center hover:bg-[#F5E7E4] transition-colors cursor-pointer"
          >
            <UiIcon name="chevron-left" className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Select ceremony">
            {ceremonies.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIdx}
                aria-label={`View ${c.titleEnglish}`}
                onClick={() => setActiveIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                  idx === activeIdx ? 'w-7 bg-[#7A1026]' : 'w-2 bg-[#C69B46]/55'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next ceremony"
            className="w-10 h-10 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#7A1026] flex items-center justify-center hover:bg-[#F5E7E4] transition-colors cursor-pointer"
          >
            <UiIcon name="chevron-right" className="w-4 h-4" />
          </button>
        </div>

        <p className="font-micro-ui text-[9px] text-[#7A5960]">
          &lt; &gt; Swipe to See Every Function
        </p>
        <p className="font-hindi-serif text-xs text-[#5D3C43] text-center">
          {WEDDING_DATA.invocations.itineraryFooterPlea}
        </p>
      </div>
    </section>
  );
}

/**
 * SECTION 4: Die-Cut Arch "Our Story / Heritage Moments" 3D Swipe Carousel
 */
export function HeritageMomentsCarousel() {
  const slides = MEDIA_ASSETS.storyPhotos;
  const [activeIdx, setActiveIdx] = useState(0);
  const swipeStartXRef = useRef<number | null>(null);

  const goPrev = () => setActiveIdx((i) => (i > 0 ? i - 1 : slides.length - 1));
  const goNext = () => setActiveIdx((i) => (i < slides.length - 1 ? i + 1 : 0));

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swipeStartXRef.current = e.clientX;
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeStartXRef.current === null) return;
    const dx = e.clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (dx <= -42) goNext();
    else if (dx >= 42) goPrev();
  };

  return (
    <section
      id="our-story"
      aria-label="Heritage Moments and Our Story"
      className="relative px-4 py-14 overflow-hidden"
    >
      <div className="text-center mb-6">
        <p className="font-micro-ui text-[10px] text-[#7A5960]">Moments</p>
        <h2 className="font-english-serif text-[32px] font-semibold text-[#7A1026] mt-0.5">
          Our Story
        </h2>
        <p className="font-hindi-serif text-sm text-[#7A5960]">
          पावन स्मृतियाँ एवं शुभ झलकियाँ
        </p>
        <MadhubaniAripanDivider className="mt-3" tone="gold" />
      </div>

      {/* Arch Coverflow Stage */}
      <div
        data-testid="story-coverflow"
        data-active-index={activeIdx}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative h-[438px] w-full flex items-center justify-center select-none"
        style={{ perspective: '1100px' }}
      >
        {slides.map((slide, idx) => {
          const offset = idx - activeIdx;
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 1;

          return (
            <figure
              key={slide.id}
              aria-hidden={offset !== 0}
              className="absolute w-[278px] sm:w-[294px] m-0 flex flex-col items-center"
              style={{
                transform: `translateX(${offset * 86}%) scale(${offset === 0 ? 1 : 0.85}) rotateY(${
                  offset === 0 ? 0 : offset < 0 ? 12 : -12
                }deg)`,
                opacity: offset === 0 ? 1 : absOffset === 1 ? 0.7 : 0,
                filter: offset === 0 ? 'none' : 'blur(1.8px)',
                zIndex: offset === 0 ? 30 : 20 - absOffset,
                pointerEvents: offset === 0 ? 'auto' : 'none',
                visibility: isVisible ? 'visible' : 'hidden',
                transition:
                  'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, filter 0.45s ease',
              }}
            >
              {/* Die-Cut Cotton-Paper Arch Frame (aspect-ratio 3/3.85) */}
              <MuseumMatFrame
                src={slide.url}
                alt={slide.caption}
                variant="arch"
                fit={slide.imageFit ?? 'contain'}
                imagePosition={slide.imagePosition ?? 'object-center'}
                fallbackMotif={slide.fallbackMotif}
                fallbackTitle={slide.subcaption}
                className="w-full aspect-[3/3.85]"
              />

              {/* Overlapping Letterpress Ivory Caption Pill */}
              <figcaption className="relative z-20 -mt-7 px-5 py-2.5 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 shadow-[0_8px_20px_rgba(66,7,20,0.16)] text-center max-w-[92%]">
                <span className="block font-english-serif italic text-[14.5px] font-semibold text-[#33181E] leading-snug">
                  {slide.caption}
                </span>
                <span className="block font-hindi-serif text-[11px] text-[#7A5960] mt-0.5">
                  {slide.subcaption}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous story moment"
          className="w-10 h-10 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#7A1026] flex items-center justify-center hover:bg-[#F5E7E4] transition-colors cursor-pointer"
        >
          <UiIcon name="chevron-left" className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Select story moment">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIdx}
              aria-label={`View moment ${idx + 1}: ${s.caption}`}
              onClick={() => setActiveIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                idx === activeIdx ? 'w-6 bg-[#7A1026]' : 'w-2 bg-[#C69B46]/55'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next story moment"
          className="w-10 h-10 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#7A1026] flex items-center justify-center hover:bg-[#F5E7E4] transition-colors cursor-pointer"
        >
          <UiIcon name="chevron-right" className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
