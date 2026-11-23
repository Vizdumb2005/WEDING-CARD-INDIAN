import { useState } from 'react';
import { MEDIA_ASSETS, WEDDING_DATA } from '../data/weddingData';
import {
  MadhubaniAripanDivider,
  MadhubaniCornerFiligree,
  MuseumMatFrame,
  UiIcon,
} from './MadhubaniArt';

/**
 * SECTION 6: "How to Reach" — Untampered Baraat Painting, Illustrated Blush-Parchment
 * SVG Map, Pre-Wired Google Maps Directions, Copy Address & Contact Chips
 */
export function IllustratedMapSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    const text = WEDDING_DATA.locations.departure.copyText;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    }
  };

  return (
    <section
      id="how-to-reach"
      aria-label="Baraat Departure and Venue Directions"
      className="relative px-5 py-14"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <p className="font-micro-ui text-[10px] text-[#7A5960]">Location &amp; Baraat</p>
        <h2 className="font-english-serif text-[32px] font-semibold text-[#7A1026] mt-0.5">
          How to Reach
        </h2>
        <p className="font-hindi-serif text-sm text-[#7A5960]">
          बारात प्रस्थान एवं स्थल विवरण
        </p>
        <MadhubaniAripanDivider className="mt-3" tone="gold" />
      </div>

      {/* Untampered Original Baraat Courtyard Procession Painting */}
      <div className="max-w-[370px] mx-auto">
        <MuseumMatFrame
          src={MEDIA_ASSETS.baraatProcessionImage}
          alt="Original watercolor illustration of the royal Baraat courtyard procession"
          variant="rect"
          fallbackMotif="baraat"
          fallbackTitle="बारात प्रस्थान · सायं 5 बजे"
        />
      </div>

      {/* Highlighted Verbatim Baraat Departure Notice */}
      <div className="mt-6 papercraft-card rounded-[18px] px-5 py-4 text-center relative">
        <p className="font-hindi-serif text-sm font-semibold text-[#7A1026]">
          {WEDDING_DATA.locations.baraatNoticeTitle}
        </p>
        <p className="font-hindi-serif text-[13.5px] text-[#33181E] mt-1.5 leading-relaxed">
          {WEDDING_DATA.locations.baraatNoticeText}
        </p>
      </div>

      {/* Custom Illustrated Blush-Parchment SVG Map Card -> Opens Mandatory Google Maps Link */}
      <a
        href={WEDDING_DATA.locations.departure.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Var Niwas Audhanpur Pratapgarh in Google Maps"
        className="group block mt-6 rounded-[22px] overflow-hidden border border-[#C69B46]/65 papercraft-elevation bg-[#F4E6E2] relative transition-transform duration-300 hover:-translate-y-0.5"
      >
        <svg
          viewBox="0 0 380 236"
          fill="none"
          aria-hidden="true"
          className="w-full h-auto block"
        >
          {/* Warm handmade blush-parchment terrain */}
          <rect width="380" height="236" fill="#F4E6E2" />

          {/* Subtle dusty-blue Sai river / pond contour */}
          <path
            d="M-10 175 C55 150, 95 198, 168 186 C238 174, 285 135, 392 152 L392 204 C295 186, 232 220, 155 218 C82 216, 48 185, -10 206 Z"
            fill="#CBD7DE"
            opacity="0.62"
          />
          <path
            d="M-10 183 C55 159, 98 205, 170 194 C240 182, 288 144, 392 160"
            stroke="#8CA4B5"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Soft pastoral field contours */}
          <path d="M12 34 Q82 20 144 48" stroke="#E2C8C1" strokeWidth="1" />
          <path d="M224 24 Q298 14 366 42" stroke="#E2C8C1" strokeWidth="1" />

          {/* Warm ivory arterial roads */}
          <path
            d="M-8 118 C65 112, 128 96, 192 98 C258 100, 316 82, 390 74"
            stroke="#FBF6EE"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M-8 118 C65 112, 128 96, 192 98 C258 100, 316 82, 390 74"
            stroke="#D9BFA8"
            strokeWidth="1"
          />
          <path
            d="M116 -6 C122 52, 114 96, 102 150 C94 185, 114 214, 128 242"
            stroke="#FBF6EE"
            strokeWidth="7"
          />
          <path
            d="M274 -6 C268 48, 280 96, 294 148 C302 178, 290 212, 282 242"
            stroke="#FBF6EE"
            strokeWidth="6.5"
          />

          {/* Subtle Mithila compass rose in top-right */}
          <g transform="translate(338 36)" opacity="0.72">
            <circle cx="0" cy="0" r="14" stroke="#B98C39" strokeWidth="0.9" fill="#FBF6EE" />
            <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill="#7A1026" opacity="0.7" />
            <text x="0" y="-16" textAnchor="middle" fill="#7A5960" fontSize="7" fontFamily="Montserrat, sans-serif" letterSpacing="1.5">
              N
            </text>
          </g>

          {/* Engraved map typography */}
          <text x="26" y="42" fill="#7A5960" fontSize="8" fontFamily="Montserrat, sans-serif" letterSpacing="2.2">
            PRATAPGARH
          </text>
          <text x="150" y="132" fill="#7A5960" fontSize="7.5" fontFamily="Montserrat, sans-serif" letterSpacing="2">
            BHOJEMAU
          </text>
          <text x="64" y="160" fill="#5D3C43" fontSize="7.5" fontFamily="Montserrat, sans-serif" letterSpacing="1.6">
            SHIV MANDIR LANDMARK
          </text>
          <text x="242" y="128" fill="#5D3C43" fontSize="7.5" fontFamily="Montserrat, sans-serif" letterSpacing="1.8">
            HARIHARGANJ
          </text>

          {/* Animated Dashed Crimson Baraat Route Curve */}
          <path
            d="M104 106 C158 58, 224 62, 286 92"
            stroke="#7A1026"
            strokeWidth="2.4"
            strokeDasharray="6 5"
            strokeLinecap="round"
            className="baraat-route-dash"
          />

          {/* Departure Pin: Audhanpur (Var Niwas) */}
          <g transform="translate(104 106)">
            <circle cx="0" cy="0" r="14" fill="#7A1026" opacity="0.16" />
            <circle cx="0" cy="0" r="8" fill="#7A1026" stroke="#FBF6EE" strokeWidth="2.2" />
            <circle cx="0" cy="0" r="2.6" fill="#F0D693" />
            <rect x="-46" y="-33" width="92" height="20" rx="10" fill="#FBF6EE" stroke="#C69B46" strokeWidth="1" />
            <text x="0" y="-20" textAnchor="middle" fill="#7A1026" fontSize="8" fontFamily="Montserrat, sans-serif" fontWeight="600" letterSpacing="1.2">
              AUDHANPUR
            </text>
          </g>

          {/* Destination Pin: Chandpur (Vadhu Niwas) */}
          <g transform="translate(286 92)">
            <circle cx="0" cy="0" r="12" fill="#D4962A" opacity="0.22" />
            <circle cx="0" cy="0" r="7" fill="#C69B46" stroke="#FBF6EE" strokeWidth="2" />
            <circle cx="0" cy="0" r="2.3" fill="#420714" />
            <rect x="-44" y="-31" width="88" height="20" rx="10" fill="#FBF6EE" stroke="#C69B46" strokeWidth="1" />
            <text x="0" y="-18" textAnchor="middle" fill="#33181E" fontSize="8" fontFamily="Montserrat, sans-serif" fontWeight="600" letterSpacing="1.2">
              CHANDPUR
            </text>
          </g>
        </svg>

        {/* Bottom-left Floating Ivory Paper Tooltip */}
        <div className="absolute left-3 bottom-3 right-3 sm:right-auto max-w-[300px] px-3.5 py-2.5 rounded-[14px] bg-[#FBF6EE]/95 border border-[#C69B46]/65 shadow-[0_8px_20px_rgba(66,7,20,0.18)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#7A1026] text-[#FBF6EE] shrink-0 flex items-center justify-center">
            <UiIcon name="pin" className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-hindi-serif text-[12.5px] font-semibold text-[#33181E] leading-snug truncate">
              वर निवास · Near Shiv Mandir, Audhanpur
            </p>
            <p className="font-micro-ui text-[8.5px] text-[#7A1026] mt-0.5">
              Tap to Open in Google Maps
            </p>
          </div>
        </div>
      </a>

      {/* Dual-Card Verbatim Departure & Destination Addresses */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <article className="relative papercraft-card rounded-[18px] px-5 pt-10 pb-5 text-center flex flex-col justify-between">
          <MadhubaniCornerFiligree position="tl" tone="gold" />
          <div className="relative z-10">
            <p className="font-micro-ui text-[8.5px] text-[#7A5960]">
              {WEDDING_DATA.locations.departure.badge}
            </p>
            <h3 className="font-hindi-serif text-[17px] font-semibold text-[#7A1026] mt-1.5">
              {WEDDING_DATA.locations.departure.hostName}
            </h3>
            {WEDDING_DATA.locations.departure.addressLines.map((line) => (
              <p key={line} className="font-hindi-serif text-[13px] text-[#33181E] mt-0.5">
                {line}
              </p>
            ))}
            <p className="font-english-serif text-[12.5px] text-[#7A5960] mt-2 leading-snug">
              {WEDDING_DATA.locations.departure.landmarkAndPin}
            </p>
          </div>
          <p className="relative z-10 font-hindi-serif text-xs font-semibold text-[#7A1026] mt-4 pt-2.5 border-t border-[#C69B46]/35">
            {WEDDING_DATA.locations.departure.departureTime}
          </p>
        </article>

        <article className="relative papercraft-card rounded-[18px] px-5 pt-10 pb-5 text-center flex flex-col justify-between">
          <MadhubaniCornerFiligree position="tr" tone="gold" />
          <div className="relative z-10">
            <p className="font-micro-ui text-[8.5px] text-[#7A5960]">
              {WEDDING_DATA.locations.destination.badge}
            </p>
            <h3 className="font-hindi-serif text-[17px] font-semibold text-[#7A1026] mt-1.5">
              {WEDDING_DATA.locations.destination.hostName}
            </h3>
            <p className="font-hindi-serif text-xs text-[#966B22] font-medium mt-0.5">
              {WEDDING_DATA.locations.destination.epithet}
            </p>
            {WEDDING_DATA.locations.destination.addressLines.map((line) => (
              <p key={line} className="font-hindi-serif text-[13px] text-[#33181E] mt-0.5">
                {line}
              </p>
            ))}
          </div>
          <a
            href={WEDDING_DATA.locations.destination.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center justify-center gap-1.5 font-micro-ui text-[8.5px] text-[#7A1026] hover:underline mt-4 pt-2.5 border-t border-[#C69B46]/35"
          >
            <UiIcon name="compass" className="w-3.5 h-3.5" />
            <span>View Chandpur Area</span>
          </a>
        </article>
      </div>

      {/* Side-by-Side Primary Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3.5">
        <a
          href={WEDDING_DATA.locations.departure.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/80 font-micro-ui text-[10px] font-semibold hover:bg-[#5E0C1D] transition-colors whitespace-nowrap"
        >
          <UiIcon name="compass" className="w-4 h-4 shrink-0" />
          <span>Get Directions</span>
        </a>

        <button
          type="button"
          onClick={handleCopyAddress}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full border font-micro-ui text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            copied
              ? 'bg-[#5D7A5B] border-[#5D7A5B] text-[#FBF6EE]'
              : 'bg-[#FBF6EE] border-[#7A1026]/55 text-[#7A1026] hover:bg-[#F5E7E4]'
          }`}
        >
          <UiIcon name={copied ? 'check' : 'copy'} className="w-4 h-4 shrink-0" />
          <span>{copied ? 'Copied' : 'Copy Address'}</span>
        </button>
      </div>

      {/* Direct Family & Groom Contact Chips */}
      <div className="mt-8 pt-6 border-t border-[#C69B46]/40">
        <p className="font-hindi-serif text-xs font-semibold text-[#7A5960] text-center mb-4">
          सम्पर्क सूत्र (मो०) · Family Assistance &amp; WhatsApp
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WEDDING_DATA.contacts.map((contact, idx) => {
            const isPrimary = Boolean(contact.whatsapp);
            const isLastOdd = !isPrimary && idx === WEDDING_DATA.contacts.length - 1;
            return (
              <div
                key={contact.phoneTel}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[15px] border transition-colors ${
                  isPrimary
                    ? 'sm:col-span-2 bg-[#F5E7E4]/75 border-[#C69B46]/70 shadow-[0_6px_16px_-8px_rgba(122,16,38,0.2)]'
                    : isLastOdd
                      ? 'sm:col-span-2 bg-[#FBF6EE] border-[#C69B46]/45'
                      : 'bg-[#FBF6EE] border-[#C69B46]/45'
                }`}
              >
                <div className="min-w-0">
                  <p className="font-hindi-serif text-[13px] font-semibold text-[#33181E] leading-snug">
                    {contact.name}
                  </p>
                  <p className="font-english-serif text-[14px] font-semibold text-[#7A1026] tabular-nums whitespace-nowrap mt-0.5">
                    {contact.phoneDisplay}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {contact.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${contact.name}`}
                      className="w-9 h-9 rounded-full bg-[#5D7A5B] text-[#FBF6EE] flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <UiIcon name="whatsapp" className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href={`tel:${contact.phoneTel}`}
                    aria-label={`Call ${contact.name} at ${contact.phoneDisplay}`}
                    className="w-9 h-9 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#7A1026] flex items-center justify-center hover:bg-[#EDD4D7] transition-colors"
                  >
                    <UiIcon name="phone" className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
