/**
 * WEDDING_DATA & MEDIA_ASSETS
 * -----------------------------------------------------------------------------
 * Verbatim heritage content extracted from SAURABHWEDDINGINVITATIONPREVIEW.pdf
 * plus clearly marked placeholder slots for optional personalizations.
 */

export interface CeremonyItem {
  id: string;
  titleHindi: string;
  titleEnglish: string;
  dateDisplay: string;
  dayHindi: string;
  timingHindi?: string;
  descriptionHindi: string;
  bannerTheme: 'tilak' | 'matripujan' | 'vivah' | 'aagman';
  iconType: 'kalash' | 'diya' | 'mandap' | 'lotus';
  dressCode: {
    label: string;
    swatchHex: string;
    swatchSecondaryHex: string;
    isPlaceholder: boolean;
  };
}

export interface StorySlide {
  id: string;
  url: string;
  caption: string;
  subcaption: string;
  fallbackMotif: 'couple' | 'mandap' | 'baraat' | 'wreath' | 'lotus' | 'diya';
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
  isPlaceholder: boolean;
}

export interface ContactEntry {
  name: string;
  role: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsapp?: string;
}

export const MEDIA_ASSETS = {
  /** Original untampered watercolor paintings extracted directly from the attached PDF */
  ganeshaLotusImage: '/assets/artwork/ganesha_lotus.png',
  heroCoupleImage: '/assets/artwork/couple_portrait.png',
  ceremonyMandapImage: '/assets/artwork/mandap_watercolor.png',
  baraatProcessionImage: '/assets/artwork/baraat_procession.png',
  floralWreathImage: '/assets/artwork/floral_wreath.png',

  /** Bespoke royal watercolor paintings crafted in the exact pastel ivory & gold card style */
  endingMusiciansImage: '/src/assets/images/royal_shehnai_sitar_musicians_1795449741376.jpg',
  tilakFacelessPortraitImage: '/src/assets/images/royal_faceless_couple_tilak_1795452351785.jpg',

  /**
   * Heritage Moments / Our Story gallery slides — all populated with matching royal watercolor art
   */
  storyPhotos: [
    {
      id: 'story-1',
      url: '/assets/artwork/couple_portrait.png',
      caption: 'Two hearts, one timeless blessing',
      subcaption: 'पावन परिणय · 09 दिसम्बर 2026',
      fallbackMotif: 'couple',
      imageFit: 'cover',
      imagePosition: 'object-top',
      isPlaceholder: false,
    },
    {
      id: 'story-2',
      url: '/assets/artwork/mandap_watercolor.png',
      caption: 'Beneath the sacred Vedic mandap',
      subcaption: 'अग्नि के सात वचन · पावन संस्कार',
      fallbackMotif: 'mandap',
      imageFit: 'contain',
      isPlaceholder: false,
    },
    {
      id: 'story-3',
      url: '/assets/artwork/baraat_procession.png',
      caption: 'A royal evening procession from Audhanpur',
      subcaption: 'बारात प्रस्थान · सायं 5 बजे',
      fallbackMotif: 'baraat',
      imageFit: 'contain',
      isPlaceholder: false,
    },
    {
      id: 'story-4',
      url: '/src/assets/images/royal_tilak_ceremony_1795449734598.jpg',
      caption: 'Where tradition meets quiet devotion',
      subcaption: 'सगाई एवं तिलक स्मृतियाँ',
      fallbackMotif: 'lotus',
      imageFit: 'cover',
      imagePosition: 'object-center',
      isPlaceholder: false,
    },
    {
      id: 'story-5',
      url: '/src/assets/images/royal_dusk_diyas_1795449735174.jpg',
      caption: 'Golden dusk before the auspicious vows',
      subcaption: 'मंगल बेला · प्रतापगढ़',
      fallbackMotif: 'diya',
      imageFit: 'cover',
      imagePosition: 'object-center',
      isPlaceholder: false,
    },
    {
      id: 'story-6',
      url: '/assets/artwork/floral_wreath.png',
      caption: 'Crowned by Maa Vindhyavasini’s grace',
      subcaption: 'सौरभ संग रंजू · शुभाशीष',
      fallbackMotif: 'wreath',
      imageFit: 'contain',
      isPlaceholder: false,
    },
  ] as StorySlide[],

  /**
   * Authentic festive North Indian Shubh Vivah Mangal Dhun (Shehnai, Sitar & Tabla)
   * uploaded by the host for seamless background looping throughout the invitation.
   */
  backgroundMusicUrl: '/assets/aistudio/Shubh_Vivah_Mangal_Dhun_77653351.mp3',
};

export const WEDDING_DATA = {
  invocations: {
    ganeshNamah: 'श्री गणेशाय नमः',
    ganeshShlokaLine1: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभः।',
    ganeshShlokaLine2: 'निर्विघ्नं कुरुमेदेव सर्व कार्येषु सर्वदा।।',
    itineraryVerseLine1: 'विघ्न हरण मंगल करण श्री गणपति महाराज।',
    itineraryVerseLine2: 'प्रथम निमंत्रण आपको, पूरण कीजै काज।।',
    salutation: 'स्नेही स्वजन,',
    deviBlessing: 'जगतजननी माँ विन्ध्यवासिनी की असीम अनुकम्पा से',
    deviClosingBlessing: 'जगतजननी माँ विन्ध्यवासिनी की असीम अनुकम्पा से — नवयुगल को शुभाशीष',
    parinayHeading: '।। पावन-परिणय ।।',
    parinayPlea:
      'की मंगलमयी मधुर बेला पर पधार कर नवयुगल को अपने आशीषामृत से अभिसिंचित कर हमें कृतार्थ करें।',
    itineraryFooterPlea: 'सपरिवार पधारकर मांगलिक अवसरों की शोभा बढ़ाएँ।',
  },

  couple: {
    groomShortHindi: 'सौरभ',
    brideShortHindi: 'रंजू',
    connectorHindi: 'संग',
    groomShortEnglish: 'Saurabh',
    brideShortEnglish: 'Ranju',
    groomFullHindi: 'चि. सौरभ पाण्डेय',
    brideFullHindi: 'आयु० रंजू दुबे',
    groomSideLabel: 'THE GROOM · वर पक्ष',
    brideSideLabel: 'THE BRIDE · वधू पक्ष',
    groomParents: 'सुपुत्र — श्रीमती वंदना पाण्डेय एवं स्व. विजय कुमार पाण्डेय',
    groomGrandparents: 'सुपौत्र — स्व. कमला देवी एवं श्री दूध नाथ पाण्डेय',
    brideParents: 'सुपुत्री — स्व. राधा दुबे एवं श्री कृष्णकान्त दुबे “जमीदार दुबे”',
    brideGrandparents: 'सुपौत्री — स्व. विश्वनाथ दुबे',
    brideHometown: 'ग्राम-चाँदपुर, पो०-हरिहरगंज, प्रतापगढ़ (उ०प्र०)',
  },

  dates: {
    tilakSummaryHindi: 'शुभ तिलक : 05 दिसम्बर 2026, शनिवार',
    vivahSummaryHindi: 'शुभ विवाह : 09 दिसम्बर 2026, बुधवार',
    weddingDayNumeral: '09',
    weddingMonthHindi: 'दिसम्बर',
    weddingMonthEnglish: 'December',
    weddingYear: '2026',
    weddingWeekdayHindi: 'बुधवार',
    weddingWeekdayEnglish: 'Wednesday',
    weddingFullHindi: '09 दिसम्बर 2026 · बुधवार',
    baraatTimeHindi: 'बारात प्रस्थान : सायं 5 बजे',
    /** Exact IST (+05:30) timestamp for live countdown & calendar export */
    weddingIsoIst: '2026-12-09T17:00:00+05:30',
    weddingEndIsoIst: '2026-12-09T23:59:00+05:30',
  },

  ceremonies: [
    {
      id: 'tilakotsav',
      titleHindi: 'शुभ तिलकोत्सव एवं प्रीतिभोज',
      titleEnglish: 'Shubh Tilakotsav & Pritibhoj',
      dateDisplay: '05 दिसम्बर 2026',
      dayHindi: 'शनिवार · Saturday',
      descriptionHindi: 'शुभ तिलक संस्कार एवं स्वजनों के संग स्नेहिल प्रीतिभोज।',
      bannerTheme: 'tilak',
      iconType: 'kalash',
      /* [PLACEHOLDER — REPLACE DRESS CODE WITH ACTUAL DATA] */
      dressCode: {
        label: 'Marigold Ochre & Ivory Silk Ethnic',
        swatchHex: '#D4962A',
        swatchSecondaryHex: '#F3DFB5',
        isPlaceholder: true,
      },
    },
    {
      id: 'matripujan',
      titleHindi: 'मातृपूजन / यज्ञोपवीत',
      titleEnglish: 'Matripujan & Yagyopaveet',
      dateDisplay: '07 दिसम्बर 2026',
      dayHindi: 'सोमवार · Monday',
      descriptionHindi: 'वैदिक रीति-रिवाजों के साथ पावन मातृपूजन एवं यज्ञोपवीत संस्कार।',
      bannerTheme: 'matripujan',
      iconType: 'diya',
      /* [PLACEHOLDER — REPLACE DRESS CODE WITH ACTUAL DATA] */
      dressCode: {
        label: 'Saffron, Haldi & Traditional Handloom',
        swatchHex: '#C56E2B',
        swatchSecondaryHex: '#F2D2B4',
        isPlaceholder: true,
      },
    },
    {
      id: 'shubh-vivah',
      titleHindi: 'शुभ विवाह (पावन-परिणय)',
      titleEnglish: 'Shubh Vivah · Pawan Parinay',
      dateDisplay: '09 दिसम्बर 2026',
      dayHindi: 'बुधवार · Wednesday',
      timingHindi: 'बारात प्रस्थान : सायं 5 बजे (निवास अवधानपुर, भोजेमऊ से)',
      descriptionHindi: 'सायं 5 बजे बारात प्रस्थान एवं वैदिक मंत्रोच्चार के मध्य शुभ परिणय।',
      bannerTheme: 'vivah',
      iconType: 'mandap',
      /* [PLACEHOLDER — REPLACE DRESS CODE WITH ACTUAL DATA] */
      dressCode: {
        label: 'Royal Maroon, Antique Gold & Banarasi',
        swatchHex: '#7A1026',
        swatchSecondaryHex: '#C69B46',
        isPlaceholder: true,
      },
    },
    {
      id: 'vadhu-aagman',
      titleHindi: 'वधू आगमन',
      titleEnglish: 'Vadhu Aagman',
      dateDisplay: '10 दिसम्बर 2026',
      dayHindi: 'गुरुवार · Thursday',
      descriptionHindi: 'नववधू का स्नेहमयी स्वागत एवं मंगलमयी गृह आगमन।',
      bannerTheme: 'aagman',
      iconType: 'lotus',
      /* [PLACEHOLDER — REPLACE DRESS CODE WITH ACTUAL DATA] */
      dressCode: {
        label: 'Lotus Blush, Cream & Pastel Chanderi',
        swatchHex: '#D98A99',
        swatchSecondaryHex: '#F5E7E4',
        isPlaceholder: true,
      },
    },
  ] as CeremonyItem[],

  balManuhar: {
    titleHindi: '!! बाल मनुहार !!',
    verseLine1: '“खुशियों की रात होगी, जश्न खूब डट के होगा,',
    verseLine2: 'मेरे भइया की शादी में अंदाज जरा हट के होगा।...”',
    childrenHindi: '— अक्षिता, गार्गी',
  },

  /**
   * [PLACEHOLDER — REPLACE WITH RECEPTION DETAILS OR SET enabled: false]
   */
  reception: {
    enabled: true,
    isPlaceholder: true,
    kicker: 'EVENING CELEBRATION',
    titleHindi: 'स्नेह भोज एवं स्वागत समारोह',
    titleEnglish: 'Grand Reception & Blessings',
    dateDisplay: '11 दिसम्बर 2026 · शुक्रवार · सायं 7 बजे से',
    venueDisplay: 'वर निवास प्रांगण, अवधानपुर, भोजेमऊ, प्रतापगढ़ (उ०प्र०)',
    dressCodeLabel: 'ROYAL ETHNIC & SAREES',
  },

  locations: {
    baraatNoticeTitle: 'विशेष सूचना — बारात प्रस्थान',
    baraatNoticeText:
      'नोट : बारात हमारे निवास अवधानपुर, भोजेमऊ, प्रतापगढ़ से सायं 5 बजे (09 दिसम्बर 2026, बुधवार) ग्राम-चाँदपुर, पो०-हरिहरगंज, प्रतापगढ़ के लिए प्रस्थान करेगी।',
    departure: {
      badge: 'DEPARTURE · वर निवास',
      hostName: 'दूधनाथ पाण्डेय',
      addressLines: ['ग्राम-अवधानपुर, पो०-भोजेमऊ', 'जनपद-प्रतापगढ़ (उ०प्र०)'],
      landmarkAndPin:
        'Near Shiv Mandir, Audhanpur (Avadhanpur), Post Bhojemau, Pratapgarh, Uttar Pradesh 230301 (Q4RP+85C)',
      departureTime: 'प्रस्थान : सायं 5 बजे',
      /** Mandatory pre-wired Google Maps link */
      mapsUrl: 'https://maps.app.goo.gl/VgCL69bbck5FAVY78?g_st=aw',
      copyText:
        'वर निवास — दूधनाथ पाण्डेय, ग्राम-अवधानपुर, पो०-भोजेमऊ, Near Shiv Mandir, Audhanpur, Pratapgarh, Uttar Pradesh 230301 (Q4RP+85C) | Google Maps: https://maps.app.goo.gl/VgCL69bbck5FAVY78?g_st=aw',
    },
    destination: {
      badge: 'DESTINATION · वधू निवास',
      hostName: 'श्री कृष्णकान्त दुबे',
      epithet: '“जमीदार दुबे”',
      addressLines: ['ग्राम-चाँदपुर, पो०-हरिहरगंज', 'प्रतापगढ़ (उ०प्र०)'],
      /* [PLACEHOLDER — REPLACE WITH EXACT BRIDE VENUE MAPS LINK IF AVAILABLE] */
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Chandpur+Hariharganj+Pratapgarh+Uttar+Pradesh',
      isPlaceholderMapsUrl: true,
    },
  },

  contacts: [
    {
      name: 'सौरभ पाण्डेय (वर · RSVP)',
      role: 'WhatsApp & Call',
      phoneDisplay: '+91 94155 63327',
      phoneTel: '+919415563327',
      whatsapp: '919415563327',
    },
    {
      name: 'पाण्डेय परिवार (सम्पर्क 1)',
      role: 'Family Desk',
      phoneDisplay: '8601802672',
      phoneTel: '+918601802672',
    },
    {
      name: 'पाण्डेय परिवार (सम्पर्क 2)',
      role: 'Family Desk',
      phoneDisplay: '7499388500',
      phoneTel: '+917499388500',
    },
    {
      name: 'पाण्डेय परिवार (सम्पर्क 3)',
      role: 'Family Desk',
      phoneDisplay: '8601802683',
      phoneTel: '+918601802683',
    },
  ] as ContactEntry[],

  hosts: {
    sectionKicker: 'FAMILY & HOSTS',
    sectionTitleHindi: 'स्नेहिल निमंत्रण एवं परिवार',
    darshanabhilashiTitle: 'दर्शनाभिलाषी :',
    darshanabhilashiNames: [
      'सतीश कुमार पाण्डेय',
      'उमेश कुमार पाण्डेय',
      'राजेश कुमार पाण्डेय',
      'प्रखर पाण्डेय',
      'कौस्तुभ पाण्डेय',
      'ओजस पाण्डेय',
    ],
    darshanabhilashiFooter: 'एवं समस्त पाण्डेय परिवार।',
    swagatankankshiTitle: 'स्वागताकांक्षी :',
    swagatankankshiNames: ['अनिल कुमार पाण्डेय', 'अजय कुमार पाण्डेय'],
    vineetTitle: 'विनीत :',
    vineetName: 'दूधनाथ पाण्डेय',
    vineetAddressLines: ['ग्राम-अवधानपुर, पो०-भोजेमऊ', 'जनपद-प्रतापगढ़ (उ०प्र०)'],
    vineetPhones: 'मो०- 8601802672, 7499388500, 8601802683',
    pratishthaHeading: 'प्रतिष्ठा में',
    pratishthaHonorific: 'श्रीयुत्',
    preshakLine: 'प्रेषक : दूधनाथ पाण्डेय',
    preshakAddress: 'ग्राम-अवधानपुर, पो०-भोजेमऊ, जनपद-प्रतापगढ़ (उ०प्र०)',
    preshakPhones: 'मो०- 8601802672, 7499388500, 8601802683',
  },

  rsvpAutomation: {
    recipientName: 'Saurabh Pandey (सौरभ पाण्डेय)',
    whatsappNumber: '919415563327',
    whatsappDisplay: '+91 94155 63327',
    autoReplyTriggerTag: '#SaurabhRanjuVivah',
    /* [OPTIONAL 100% FREE SILENT AUTOMATION: Paste a Google Apps Script Web App URL (logs RSVPs to Google Sheets) OR a CallMeBot WhatsApp API URL here for silent background notifications] */
    freeWebhookUrl: '',
    /* [OPTIONAL: If using free CallMeBot WhatsApp bot on 919415563327, paste your free API key here to auto-ping WhatsApp silently on every submission] */
    callMeBotApiKey: '',
  },
} as const;
