import { useEffect, useState } from 'react';
import { ApplyTilakRitual } from './components/ApplyTilakRitual';
import { BookCoverIntro } from './components/BookCoverIntro';
import {
  CeremoniesCoverflowSection,
  HeritageMomentsCarousel,
} from './components/CoverflowCarousel';
import { DarkRoyalCenterpiece } from './components/DarkRoyalCenterpiece';
import { FamilyAndRsvpSection } from './components/FamilyAndRsvpSection';
import { HeroArchSection } from './components/HeroArchSection';
import { HostGuestLedger } from './components/HostGuestLedger';
import { IllustratedMapSection } from './components/IllustratedMapSection';
import { RoyalScrollReveal } from './components/RoyalScrollReveal';
import { ThreeFloralCanvas } from './components/ThreeFloralCanvas';
import { classicalAudio } from './utils/classicalAudioEngine';

type InvitationStage = 'cover' | 'tilak' | 'opened';

/**
 * Saurabh Sang Ranju — Royal 3D Interactive Indian Wedding Invitation
 * -----------------------------------------------------------------------------
 * Flow:
 *   Stage 0 ('cover')  -> 3D Velvet & Gold-Foil Book Cover
 *   Stage 1 ('tilak')  -> Subtle 'Apply Tilak' ritual on faceless symbolic couple portrait
 *   Stage 2 ('opened') -> Full Royal Scroll Invitation with Pushpa Varsha lotus rain
 *
 * Supports `?autostart=1` (jumps straight to Stage 2) and `?tilak=1` (opens Stage 1)
 * for deep links or automated inspection.
 */
export default function App() {
  const isPrivateHostLedger =
    typeof window !== 'undefined' &&
    window.location.pathname.replace(/\/+$/, '') === '/host-guest-ledger';

  if (isPrivateHostLedger) {
    return <HostGuestLedger />;
  }

  return <WeddingInvitationExperience />;
}

function resolveInitialStage(): InvitationStage {
  if (typeof window === 'undefined') return 'cover';
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') return 'opened';
  if (params.get('tilak') === '1') return 'tilak';
  return 'cover';
}

function WeddingInvitationExperience() {
  const [stage, setStage] = useState<InvitationStage>(resolveInitialStage);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const isScrollOpened = stage === 'opened';
  const isRainActive = stage !== 'cover';

  // Sync audio state subscription
  useEffect(() => {
    return classicalAudio.subscribe(setAudioPlaying);
  }, []);

  // Lock vertical scroll cleanly while Book Cover or Apply Tilak opening ritual is active
  useEffect(() => {
    document.body.style.overflow = isScrollOpened ? '' : 'hidden';
    document.body.dataset.invitationState = stage;
    return () => {
      document.body.style.overflow = '';
    };
  }, [isScrollOpened, stage]);

  // Track top antique gold reading progress hairline
  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [isScrollOpened]);

  const triggerPetalBurst = () => {
    window.dispatchEvent(new CustomEvent('wedding:petal-burst'));
  };

  const handleBookOpenStart = () => {
    classicalAudio.playTempleChime('ceremonial');
    classicalAudio.startAmbience();
    triggerPetalBurst();
  };

  const handleBookOpenComplete = () => {
    setStage('tilak');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleTilakApplied = () => {
    classicalAudio.playTempleChime('ceremonial');
    if (!classicalAudio.isPlaying()) {
      classicalAudio.startAmbience();
    }
    triggerPetalBurst();
  };

  const handleTilakComplete = () => {
    setStage('opened');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleScrollUnrolled = () => {
    classicalAudio.playTempleChime('soft');
    triggerPetalBurst();
  };

  const handleRsvpConfirmed = () => {
    classicalAudio.playTempleChime('ceremonial');
    triggerPetalBurst();
  };

  const handleReplayInvitation = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStage('cover');
  };

  const handleToggleAudio = () => {
    classicalAudio.toggleAmbience();
  };

  return (
    <div className="relative min-h-[100svh] w-full">
      {/* Top 2px Antique Gold Shimmer Reading Progress Hairline */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[90] pointer-events-none bg-transparent"
      >
        <div
          className="h-full gold-foil-gradient origin-left transition-transform duration-150"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
      </div>

      {/* Stage 0: Full-Screen 3D Papercraft & Madhubani Book Cover */}
      {stage === 'cover' && (
        <BookCoverIntro
          onOpenStart={handleBookOpenStart}
          onOpenComplete={handleBookOpenComplete}
        />
      )}

      {/* Stage 1: Subtle Ceremonial 'Apply Tilak' Interaction on Faceless Royal Couple Portrait */}
      {stage === 'tilak' && (
        <ApplyTilakRitual
          onTilakApplied={handleTilakApplied}
          onComplete={handleTilakComplete}
        />
      )}

      {/* Interactive 3D Three.js Pushpa Varsha Sacred Lotus Flower Rain & Rose Petals */}
      <ThreeFloralCanvas isOpened={isRainActive} />

      {/* Centered Elevated Handmade Cotton-Paper Folio Column (Edge-to-Edge Mobile, Luxury Studio Desk on Desktop) */}
      <div className="relative z-20 flex justify-center min-h-[100svh] sm:py-8 sm:px-4">
        <main
          aria-label="Saurabh Sang Ranju Wedding Invitation Folio"
          className="relative w-full max-w-[446px] folio-column-shell sm:rounded-[28px] overflow-hidden"
        >
          {/* Fast Repeating Handmade Cotton-Rag Paper Grain Tile (Zero CPU rasterization stall) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 opacity-[0.045]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              mixBlendMode: 'multiply',
            }}
          />

          {/* Subtle Outer Paper Border Frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 sm:inset-3 rounded-[20px] border border-[#C69B46]/30 z-30"
          />

          {/* SECTION 1: Die-Cut Mughal Arch Hero & Choreographed Reveal */}
          <HeroArchSection isOpened={isScrollOpened} />

          {/* SECTION 2: Tactile Pull-to-Reveal Royal Scroll & Live IST Countdown */}
          <RoyalScrollReveal onScrollUnrolled={handleScrollUnrolled} />

          {/* SECTION 3: Two-Zone 3D Coverflow — Wedding Festivities WITH Dress Code */}
          <CeremoniesCoverflowSection />

          {/* SECTION 4: Die-Cut Arch Heritage Moments / Our Story Carousel */}
          <HeritageMomentsCarousel />

          {/* SECTION 5: High-Contrast Dark Royal Centerpiece (Bal Manuhar & Reception) */}
          <DarkRoyalCenterpiece />

          {/* SECTION 6: Illustrated Blush-Parchment Vector Map & Baraat Route */}
          <IllustratedMapSection />

          {/* SECTION 7: Family Hosts Folio, Automated WhatsApp RSVP & Untampered Wreath Finale */}
          <FamilyAndRsvpSection
            onRsvpConfirmed={handleRsvpConfirmed}
            onReplayInvitation={handleReplayInvitation}
          />
        </main>
      </div>

      {/* Floating Audio Equalizer Pill (Fixed bottom-right, 46x46px, zero backdrop-filter) */}
      <button
        type="button"
        onClick={handleToggleAudio}
        aria-label={
          audioPlaying
            ? 'Mute traditional Sitar and Shehnai music'
            : 'Play traditional Sitar and Shehnai music'
        }
        aria-pressed={audioPlaying}
        title={audioPlaying ? 'Mute Sitar & Shehnai music' : 'Play Sitar & Shehnai music'}
        className="fixed bottom-5 right-5 z-[95] w-[46px] h-[46px] rounded-full bg-[#FBF6EE] border-2 border-[#C69B46] shadow-[0_10px_24px_rgba(24,2,8,0.42)] flex items-center justify-center gap-[3.5px] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      >
        <span
          className={`w-[3px] h-[16px] rounded-full bg-[#7A1026] origin-bottom transition-transform ${
            audioPlaying ? 'eq-bar-1' : 'scale-y-[0.38]'
          }`}
        />
        <span
          className={`w-[3px] h-[20px] rounded-full bg-[#7A1026] origin-bottom transition-transform ${
            audioPlaying ? 'eq-bar-2' : 'scale-y-[0.62]'
          }`}
        />
        <span
          className={`w-[3px] h-[14px] rounded-full bg-[#7A1026] origin-bottom transition-transform ${
            audioPlaying ? 'eq-bar-3' : 'scale-y-[0.42]'
          }`}
        />
      </button>
    </div>
  );
}
