import { useEffect, useState, type FormEvent } from 'react';
import { MEDIA_ASSETS, WEDDING_DATA } from '../data/weddingData';
import {
  buildWhatsAppDeepLink,
  buildWhatsAppRsvpMessage,
  validateRsvpForm,
  type RsvpSubmission,
} from '../utils/weddingLogic';
import {
  MadhubaniAripanDivider,
  MadhubaniCornerFiligree,
  MuseumMatFrame,
  UiIcon,
} from './MadhubaniArt';

const RSVP_STORAGE_KEY = 'saurabh_ranju_vivah_rsvp_v1';

interface FamilyAndRsvpSectionProps {
  onRsvpConfirmed: () => void;
  onReplayInvitation: () => void;
}

/**
 * SECTION 7: Family & Hosts Folio, Free Automated WhatsApp RSVP (+91 94155 63327),
 * Untampered Closing Floral Wreath & Replay 3D Invitation
 */
export function FamilyAndRsvpSection({
  onRsvpConfirmed,
  onReplayInvitation,
}: FamilyAndRsvpSectionProps) {
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [attending, setAttending] = useState<'accept' | 'blessings'>('accept');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedCeremonies, setSelectedCeremonies] = useState<string[]>(['shubh-vivah']);
  const [blessingsNote, setBlessingsNote] = useState('');
  const [formErrors, setFormErrors] = useState<{
    guestName?: string;
    selectedCeremonies?: string;
    guestCount?: string;
  }>({});
  const [savedRsvp, setSavedRsvp] = useState<RsvpSubmission | null>(null);
  const [messageCopied, setMessageCopied] = useState(false);

  // Restore saved RSVP cleanly on reload
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RSVP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RsvpSubmission;
        if (parsed && typeof parsed.guestName === 'string' && parsed.guestName.trim().length >= 2) {
          setSavedRsvp(parsed);
          setGuestName(parsed.guestName);
          setGuestContact(parsed.guestContact || '');
          setAttending(parsed.attending === 'blessings' ? 'blessings' : 'accept');
          setGuestCount(parsed.guestCount || 2);
          setSelectedCeremonies(
            Array.isArray(parsed.selectedCeremonies) && parsed.selectedCeremonies.length > 0
              ? parsed.selectedCeremonies
              : ['shubh-vivah']
          );
          setBlessingsNote(parsed.blessingsNote || '');
        }
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
  }, []);

  const toggleCeremony = (id: string) => {
    setSelectedCeremonies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setFormErrors((prev) => ({ ...prev, selectedCeremonies: undefined }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: RsvpSubmission = {
      guestName: guestName.trim(),
      guestContact: guestContact.trim(),
      attending,
      guestCount: attending === 'accept' ? guestCount : 0,
      selectedCeremonies: attending === 'accept' ? selectedCeremonies : [],
      blessingsNote: blessingsNote.trim(),
      submittedAtIso: new Date().toISOString(),
    };

    const validation = validateRsvpForm(payload);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setSavedRsvp(payload);

    try {
      window.localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota/private mode errors
    }

    // Celebratory petal shower + brass temple chime
    onRsvpConfirmed();

    // Silently persist RSVP to private host-only server-side CSV guest list
    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});

    // Optional silent background free webhook (Google Apps Script / custom webhook)
    const { freeWebhookUrl, callMeBotApiKey, whatsappNumber } = WEDDING_DATA.rsvpAutomation;
    if (freeWebhookUrl) {
      fetch(freeWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    // Optional silent free CallMeBot WhatsApp alert ping
    if (callMeBotApiKey) {
      const summary = buildWhatsAppRsvpMessage(payload);
      fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${encodeURIComponent(
          summary
        )}&apikey=${encodeURIComponent(callMeBotApiKey)}`,
        { mode: 'no-cors' }
      ).catch(() => {});
    }

    // Trigger pre-filled WhatsApp deep link inside the user gesture via synthetic anchor click
    // (Avoids window.open while keeping native iOS/Android WhatsApp deep-link reliability)
    const waUrl = buildWhatsAppDeepLink(payload);
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyRsvpMessage = async () => {
    if (!savedRsvp) return;
    const text = buildWhatsAppRsvpMessage(savedRsvp);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // ignore clipboard errors
    }
    setMessageCopied(true);
    window.setTimeout(() => setMessageCopied(false), 2600);
  };

  const handleEditRsvp = () => {
    setSavedRsvp(null);
  };

  const savedWhatsAppUrl = savedRsvp ? buildWhatsAppDeepLink(savedRsvp) : '';

  return (
    <section
      id="family-and-rsvp"
      aria-label="Family Hosts, RSVP and Blessings Finale"
      className="relative px-5 pt-12 pb-20 space-y-16"
    >
      {/* Part A: Family & Hosts Folio (Verbatim from PDF Page 7) */}
      <div>
        <div className="text-center mb-7">
          <p className="font-micro-ui text-[10px] text-[#7A5960]">
            {WEDDING_DATA.hosts.sectionKicker}
          </p>
          <h2 className="font-hindi-calligraphy text-[28px] text-[#7A1026] mt-1">
            {WEDDING_DATA.hosts.sectionTitleHindi}
          </h2>
          <MadhubaniAripanDivider className="mt-3" tone="gold" />
        </div>

        <div className="relative papercraft-card rounded-[24px] px-8 sm:px-9 pt-12 pb-14 space-y-6">
          <MadhubaniCornerFiligree position="tl" tone="gold" />
          <MadhubaniCornerFiligree position="tr" tone="gold" />
          <MadhubaniCornerFiligree position="bl" tone="gold" />
          <MadhubaniCornerFiligree position="br" tone="gold" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 relative z-10">
            {/* दर्शनाभिलाषी */}
            <div className="text-center sm:border-r sm:border-[#C69B46]/30 sm:pr-5">
              <h3 className="font-hindi-serif text-[15px] font-bold text-[#7A1026] pb-2.5 border-b border-[#C69B46]/40">
                {WEDDING_DATA.hosts.darshanabhilashiTitle}
              </h3>
              <ul className="list-none p-0 m-0 mt-3.5 space-y-2 font-hindi-serif text-[14px] text-[#33181E]">
                {WEDDING_DATA.hosts.darshanabhilashiNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <p className="font-hindi-serif text-xs font-semibold text-[#966B22] mt-4">
                {WEDDING_DATA.hosts.darshanabhilashiFooter}
              </p>
            </div>

            {/* स्वागताकांक्षी & विनीत */}
            <div className="flex flex-col justify-between space-y-6 text-center">
              <div>
                <h3 className="font-hindi-serif text-[15px] font-bold text-[#7A1026] pb-2.5 border-b border-[#C69B46]/40">
                  {WEDDING_DATA.hosts.swagatankankshiTitle}
                </h3>
                <ul className="list-none p-0 m-0 mt-3.5 space-y-2 font-hindi-serif text-[14px] font-semibold text-[#33181E]">
                  {WEDDING_DATA.hosts.swagatankankshiNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 border-t border-[#C69B46]/35">
                <h3 className="font-hindi-serif text-[15px] font-bold text-[#7A1026]">
                  {WEDDING_DATA.hosts.vineetTitle}
                </h3>
                <p className="font-hindi-serif text-[15px] font-semibold text-[#33181E] mt-1.5">
                  {WEDDING_DATA.hosts.vineetName}
                </p>
                {WEDDING_DATA.hosts.vineetAddressLines.map((line) => (
                  <p key={line} className="font-hindi-serif text-xs text-[#5D3C43] mt-0.5">
                    {line}
                  </p>
                ))}
                <p className="font-hindi-serif text-xs text-[#7A1026] font-medium mt-2 px-3 leading-relaxed tabular-nums">
                  {WEDDING_DATA.hosts.vineetPhones}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part B: Interactive RSVP & Free WhatsApp Automation Card */}
      <div id="rsvp-section">
        <div className="text-center mb-7">
          <p className="font-micro-ui text-[10px] text-[#7A5960]">Kindly Respond</p>
          <h2 className="font-english-serif text-[32px] font-semibold text-[#7A1026] mt-0.5">
            Will You Join Us?
          </h2>
          <p className="font-hindi-serif text-sm text-[#7A5960] mt-0.5">
            सपरिवार पधारने की स्वीकृति एवं शुभाशीष
          </p>
          <MadhubaniAripanDivider className="mt-3" tone="gold" />
        </div>

        <div className="relative papercraft-card rounded-[24px] px-6 sm:px-7 pt-12 pb-12">
          <MadhubaniCornerFiligree position="tl" tone="gold" />
          <MadhubaniCornerFiligree position="tr" tone="gold" />
          <MadhubaniCornerFiligree position="bl" tone="gold" />
          <MadhubaniCornerFiligree position="br" tone="gold" />

          {savedRsvp ? (
            /* Confirmed Letterpress Thank-You State */
            <div data-testid="rsvp-confirmed-card" className="relative z-10 text-center py-2 space-y-5">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#5D7A5B] text-[#FBF6EE] flex items-center justify-center shadow-md">
                <UiIcon name="check" className="w-6 h-6" />
              </div>

              <div>
                <p className="font-micro-ui text-[9.5px] text-[#5D7A5B] font-semibold">
                  RSVP Recorded · धन्यवाद
                </p>
                <h3 className="font-english-serif text-[26px] font-semibold text-[#7A1026] mt-1">
                  Thank You, {savedRsvp.guestName}
                </h3>
                <p className="font-hindi-serif text-sm text-[#5D3C43] mt-1.5">
                  {savedRsvp.attending === 'accept'
                    ? `हम सपरिवार (${savedRsvp.guestCount} अतिथि) आपका हृदय से स्वागत करने हेतु उत्सुक हैं।`
                    : 'आपके स्नेहिल शुभाशीष के लिए पाण्डेय परिवार हृदय से आभारी है।'}
                </p>
              </div>

              <div className="rounded-[16px] bg-[#F5E7E4]/85 border border-[#C69B46]/45 p-4 text-left space-y-2 font-hindi-serif text-xs text-[#33181E]">
                <p>
                  <strong className="text-[#7A1026]">Response:</strong>{' '}
                  {savedRsvp.attending === 'accept'
                    ? `Joyfully Accepts (${savedRsvp.guestCount} guests)`
                    : 'Sends Warm Blessings'}
                </p>
                {savedRsvp.attending === 'accept' && savedRsvp.selectedCeremonies.length > 0 && (
                  <p>
                    <strong className="text-[#7A1026]">Ceremonies:</strong>{' '}
                    {savedRsvp.selectedCeremonies
                      .map((id) => WEDDING_DATA.ceremonies.find((c) => c.id === id)?.titleHindi || id)
                      .join(', ')}
                  </p>
                )}
                {savedRsvp.blessingsNote && (
                  <p>
                    <strong className="text-[#7A1026]">Blessings:</strong> {savedRsvp.blessingsNote}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <a
                  href={savedWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/80 font-micro-ui text-[10px] font-semibold hover:bg-[#5E0C1D] transition-colors"
                >
                  <UiIcon name="whatsapp" className="w-4 h-4 shrink-0" />
                  <span>
                    Open WhatsApp to Send · {WEDDING_DATA.rsvpAutomation.whatsappDisplay}
                  </span>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopyRsvpMessage}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#33181E] font-micro-ui text-[9px] font-semibold hover:bg-[#F5E7E4] cursor-pointer"
                  >
                    <UiIcon name={messageCopied ? 'check' : 'copy'} className="w-3.5 h-3.5" />
                    <span>{messageCopied ? 'Copied' : 'Copy RSVP'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEditRsvp}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-full bg-[#FBF6EE] border border-[#7A1026]/45 text-[#7A1026] font-micro-ui text-[9px] font-semibold hover:bg-[#F5E7E4] cursor-pointer"
                  >
                    <span>Edit RSVP</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Tactile Debossed Paper RSVP Form — Generous Royal Stationery Spacing */
            <form onSubmit={handleSubmit} noValidate className="relative z-10 space-y-6">
              {/* Guest Name */}
              <div>
                <label
                  htmlFor="rsvp-guest-name"
                  className="block font-micro-ui text-[9.5px] text-[#7A5960] mb-2.5"
                >
                  Your Full Name / आपका शुभ नाम *
                </label>
                <input
                  id="rsvp-guest-name"
                  name="guestName"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (formErrors.guestName) setFormErrors((p) => ({ ...p, guestName: undefined }));
                  }}
                  placeholder="e.g., श्री राजेश शर्मा / Rajesh Sharma"
                  className="w-full px-4 py-3.5 rounded-[14px] bg-[#FBF6EE] border border-[#C69B46]/60 text-[#33181E] placeholder:text-[#7A5960]/55 font-hindi-serif text-sm shadow-[inset_0_1px_3px_rgba(66,7,20,0.08)]"
                />
                {formErrors.guestName && (
                  <p role="alert" className="mt-2 font-hindi-serif text-xs text-[#9E162E] font-medium">
                    {formErrors.guestName}
                  </p>
                )}
              </div>

              {/* Optional Phone / City */}
              <div>
                <label
                  htmlFor="rsvp-guest-contact"
                  className="block font-micro-ui text-[9.5px] text-[#7A5960] mb-2.5"
                >
                  Phone or City (Optional) / नगर या मोबाइल
                </label>
                <input
                  id="rsvp-guest-contact"
                  name="guestContact"
                  type="text"
                  value={guestContact}
                  onChange={(e) => setGuestContact(e.target.value)}
                  placeholder="e.g., Pratapgarh / Prayagraj"
                  className="w-full px-4 py-3.5 rounded-[14px] bg-[#FBF6EE] border border-[#C69B46]/50 text-[#33181E] placeholder:text-[#7A5960]/55 font-hindi-serif text-sm shadow-[inset_0_1px_3px_rgba(66,7,20,0.06)]"
                />
              </div>

              {/* Attendance Toggle Pills */}
              <fieldset className="border-0 p-0 m-0 pt-1">
                <legend className="font-micro-ui text-[9.5px] text-[#7A5960] mb-3">
                  Your Response / आपकी स्वीकृति
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    aria-pressed={attending === 'accept'}
                    onClick={() => setAttending('accept')}
                    className={`px-4 py-3.5 rounded-[15px] border text-center transition-all cursor-pointer ${
                      attending === 'accept'
                        ? 'bg-[#7A1026] border-[#C69B46] text-[#FBF6EE] shadow-sm'
                        : 'bg-[#FBF6EE] border-[#C69B46]/45 text-[#33181E] hover:bg-[#F5E7E4]'
                    }`}
                  >
                    <span className="block font-hindi-serif text-[13.5px] font-semibold">
                      सपरिवार पधारेंगे
                    </span>
                    <span className="block font-micro-ui text-[8.5px] opacity-85 mt-1">
                      Joyfully Accepts
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={attending === 'blessings'}
                    onClick={() => setAttending('blessings')}
                    className={`px-4 py-3.5 rounded-[15px] border text-center transition-all cursor-pointer ${
                      attending === 'blessings'
                        ? 'bg-[#7A1026] border-[#C69B46] text-[#FBF6EE] shadow-sm'
                        : 'bg-[#FBF6EE] border-[#C69B46]/45 text-[#33181E] hover:bg-[#F5E7E4]'
                    }`}
                  >
                    <span className="block font-hindi-serif text-[13.5px] font-semibold">
                      शुभाशीष प्रेषित
                    </span>
                    <span className="block font-micro-ui text-[8.5px] opacity-85 mt-1">
                      Sends Blessings
                    </span>
                  </button>
                </div>
              </fieldset>

              {/* Guest Count Stepper & Attending Ceremonies (Hidden when Sends Blessings) */}
              {attending === 'accept' && (
                <div className="space-y-6 pt-1">
                  <div className="flex items-center justify-between px-4 py-3.5 rounded-[15px] bg-[#F5E7E4]/75 border border-[#C69B46]/45">
                    <div>
                      <p className="font-micro-ui text-[9px] text-[#7A5960]">Number of Guests</p>
                      <p className="font-hindi-serif text-xs text-[#33181E] mt-0.5">अतिथियों की संख्या</p>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <button
                        type="button"
                        aria-label="Decrease guest count"
                        onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                        className="w-9 h-9 rounded-full bg-[#FBF6EE] border border-[#C69B46]/70 text-[#7A1026] font-semibold text-lg leading-none flex items-center justify-center cursor-pointer hover:bg-[#EDD4D7]"
                      >
                        -
                      </button>
                      <span
                        data-testid="rsvp-guest-count"
                        className="w-6 text-center font-royal-caps text-lg font-semibold text-[#7A1026] tabular-nums"
                      >
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase guest count"
                        onClick={() => setGuestCount((c) => Math.min(10, c + 1))}
                        className="w-9 h-9 rounded-full bg-[#FBF6EE] border border-[#C69B46]/70 text-[#7A1026] font-semibold text-lg leading-none flex items-center justify-center cursor-pointer hover:bg-[#EDD4D7]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Attending Ceremonies */}
                  <fieldset className="border-0 p-0 m-0">
                    <legend className="font-micro-ui text-[9.5px] text-[#7A5960] mb-3">
                      Attending Ceremonies / कार्यक्रम चुनें
                    </legend>
                    <div className="grid grid-cols-1 gap-2.5">
                      {WEDDING_DATA.ceremonies.map((c) => {
                        const checked = selectedCeremonies.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={() => toggleCeremony(c.id)}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border text-left transition-colors cursor-pointer ${
                              checked
                                ? 'bg-[#F5E7E4] border-[#7A1026] text-[#33181E]'
                                : 'bg-[#FBF6EE] border-[#C69B46]/45 text-[#7A5960]'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block font-hindi-serif text-[13.5px] font-semibold text-[#33181E]">
                                {c.titleHindi}
                              </span>
                              <span className="block font-hindi-serif text-[11.5px] text-[#7A5960] mt-0.5">
                                {c.dateDisplay}
                              </span>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                checked
                                  ? 'bg-[#7A1026] border-[#7A1026] text-[#FBF6EE]'
                                  : 'border-[#C69B46]/70 bg-transparent'
                              }`}
                            >
                              {checked && <UiIcon name="check" className="w-3.5 h-3.5" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {formErrors.selectedCeremonies && (
                      <p role="alert" className="mt-2 font-hindi-serif text-xs text-[#9E162E]">
                        {formErrors.selectedCeremonies}
                      </p>
                    )}
                  </fieldset>
                </div>
              )}

              {/* Blessings Textarea */}
              <div className="pt-5 border-t border-[#C69B46]/30">
                <label
                  htmlFor="rsvp-blessings"
                  className="block font-micro-ui text-[9.5px] text-[#7A5960] mb-2.5"
                >
                  Blessings for Saurabh &amp; Ranju / शुभाशीष संदेश
                </label>
                <textarea
                  id="rsvp-blessings"
                  name="blessingsNote"
                  rows={3}
                  value={blessingsNote}
                  onChange={(e) => setBlessingsNote(e.target.value)}
                  placeholder="Write your heartfelt blessings for the newlyweds..."
                  className="w-full px-4 py-3.5 rounded-[14px] bg-[#FBF6EE] border border-[#C69B46]/50 text-[#33181E] placeholder:text-[#7A5960]/55 font-hindi-serif text-sm resize-y shadow-[inset_0_1px_3px_rgba(66,7,20,0.06)]"
                />
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/85 font-micro-ui text-[10.5px] font-semibold hover:bg-[#5E0C1D] active:scale-[0.99] transition-all cursor-pointer shadow-[0_10px_24px_-6px_rgba(122,16,38,0.45)]"
                >
                  <UiIcon name="whatsapp" className="w-4 h-4 shrink-0" />
                  <span>Confirm &amp; Send on WhatsApp</span>
                </button>

                <p className="text-center font-english-serif italic text-xs text-[#7A5960] px-4 leading-relaxed">
                  Sends directly to {WEDDING_DATA.rsvpAutomation.recipientName} (
                  {WEDDING_DATA.rsvpAutomation.whatsappDisplay})
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Part C: Untampered Closing Floral Wreath, Royal Shehnai & Sitar Ensemble & Verbatim PDF Page 8 Finale */}
      <footer className="pt-4 text-center space-y-7">
        <div>
          <p className="font-micro-ui text-[9.5px] text-[#7A5960]">
            With Blessings &amp; Gratitude
          </p>
          <p className="font-hindi-serif text-sm font-semibold text-[#7A1026] mt-1.5">
            {WEDDING_DATA.invocations.ganeshNamah}
          </p>
        </div>

        {/* Original Untampered Floral Ganesha Wreath Painting */}
        <div className="max-w-[288px] mx-auto">
          <MuseumMatFrame
            src={MEDIA_ASSETS.floralWreathImage}
            alt="Original floral wreath with Lord Ganesha and Saurabh Sang Ranju 09 December 2026"
            variant="wreath"
            fallbackMotif="wreath"
            fallbackTitle="सौरभ संग रंजू · 09 दिसम्बर 2026"
            className="aspect-square"
          />
        </div>

        <p className="font-hindi-serif text-[14px] font-semibold text-[#7A1026] max-w-[330px] mx-auto leading-relaxed">
          {WEDDING_DATA.invocations.deviClosingBlessing}
        </p>

        {/* Royal Shehnai & Sitar Classical Musicians Illustration (Matching Pastel Watercolor Art) */}
        <div className="pt-2 space-y-3.5 max-w-[366px] mx-auto">
          <div className="text-center">
            <p className="font-micro-ui text-[9px] text-[#966B22]">
              Mangal Vadya · Auspicious Melodies
            </p>
            <p className="font-hindi-calligraphy text-[21px] text-[#7A1026] mt-0.5">
              मंगल वादन · शहनाई एवं सितार
            </p>
          </div>

          <MuseumMatFrame
            src={MEDIA_ASSETS.endingMusiciansImage}
            alt="Traditional Indian classical musicians playing the Shehnai and Sitar beneath a floral Mughal archway"
            variant="rect"
            fit="cover"
            imagePosition="object-center"
            fallbackMotif="lotus"
            fallbackTitle="मंगल वादन · शहनाई एवं सितार"
            className="w-full aspect-[4/3]"
          />

          <p className="font-english-serif italic text-[13.5px] text-[#7A5960] px-2">
            May the timeless harmony of Shehnai &amp; Sitar bless this sacred union.
          </p>
        </div>

        <MadhubaniAripanDivider className="my-1" tone="gold" />

        {/* Verbatim प्रतिष्ठा में / प्रेषक Traditional Envelope Card */}
        <div className="relative papercraft-card rounded-[20px] px-7 pt-11 pb-10 max-w-[360px] mx-auto text-left">
          <MadhubaniCornerFiligree position="tl" tone="gold" />
          <MadhubaniCornerFiligree position="br" tone="gold" />

          <div className="relative z-10">
            <p className="font-hindi-serif text-[13px] font-bold text-[#7A1026]">
              {WEDDING_DATA.hosts.pratishthaHeading}
            </p>
            <p className="font-hindi-serif text-[13px] text-[#33181E] mt-1.5 pb-2.5 border-b border-dashed border-[#C69B46]/65">
              {WEDDING_DATA.hosts.pratishthaHonorific}
            </p>
            <div className="h-4 border-b border-dashed border-[#C69B46]/35" aria-hidden="true" />

            <div className="mt-5 pt-4 border-t border-[#C69B46]/35 text-center space-y-1">
              <p className="font-hindi-serif text-[13.5px] font-bold text-[#7A1026]">
                {WEDDING_DATA.hosts.preshakLine}
              </p>
              <p className="font-hindi-serif text-[12.5px] text-[#5D3C43]">
                {WEDDING_DATA.hosts.preshakAddress}
              </p>
              <p className="font-hindi-serif text-[12px] text-[#7A5960] tabular-nums pt-0.5">
                {WEDDING_DATA.hosts.preshakPhones}
              </p>
            </div>
          </div>
        </div>

        {/* Replay 3D Invitation Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onReplayInvitation}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FBF6EE] border border-[#C69B46]/70 text-[#7A1026] font-micro-ui text-[9.5px] font-semibold hover:bg-[#F5E7E4] transition-colors cursor-pointer"
          >
            <UiIcon name="replay" className="w-3.5 h-3.5" />
            <span>Replay 3D Invitation</span>
          </button>
        </div>
      </footer>
    </section>
  );
}
