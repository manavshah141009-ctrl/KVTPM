/**
 * Site-wide translations for English, Hindi, Gujarati, and Marathi.
 * All user-facing strings are keyed here.
 */
export type Lang = "en" | "hi" | "gu" | "mr";

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  hi: "हिं",
  gu: "ગુ",
  mr: "म",
};

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  hi: "हिंदी",
  gu: "ગુજરાતી",
  mr: "मराठी",
};

export type TranslationKey =
  // Header nav
  | "nav.home" | "nav.listen" | "nav.books" | "nav.live"
  // Header tagline
  | "header.tagline"
  // Homepage hero
  | "home.badge" | "home.title" | "home.desc" | "home.inspiredBy"
  | "home.startListening" | "home.joinSatsang"
  // Homepage quote
  | "home.quote" | "home.quoteAuthor"
  // Homepage cards
  | "home.audio.title" | "home.audio.desc" | "home.audio.link"
  | "home.books.title" | "home.books.desc" | "home.books.link"
  | "home.live.title" | "home.live.desc" | "home.live.link"
  // Listen page
  | "listen.title" | "listen.desc"
  | "listen.nowPlaying" | "listen.upNext" | "listen.onAir" | "listen.offAir"
  | "listen.tuneIn" | "listen.pause" | "listen.syncing"
  | "listen.playlist" | "listen.tracks" | "listen.loop" | "listen.zeroCost"
  | "listen.noTracks" | "listen.noTracksDesc"
  | "listen.loading"
  // Player bar
  | "player.liveLabel"
  // Footer
  | "footer.tagline" | "footer.listen" | "footer.books"
  | "footer.liveSatsang" | "footer.madeWith"
  // Tap to play
  | "tap.to.play";

type Translations = Record<Lang, Record<TranslationKey, string>>;

export const t: Translations = {
  // ─────────────────────────────────── ENGLISH ─────────────────────────────
  en: {
    "nav.home": "Home",
    "nav.listen": "Listen",
    "nav.books": "Books",
    "nav.live": "Live",
    "header.tagline": "Wisdom · Bhakti · Satsang",
    "home.badge": "Peace begins within",
    "home.title": "KarVicharTohPamm",
    "home.desc":
      "A quiet corner of the web for sacred sound, thoughtful reading, and live satsang — designed to feel warm, unhurried, and close to the heart.",
    "home.inspiredBy": "Inspired by the teachings of Shrimad Rajchandra",
    "home.startListening": "Start listening",
    "home.joinSatsang": "Join live satsang",
    "home.quote":
      '"Atma darshan is the highest sadhana; everything else is preparatory."',
    "home.quoteAuthor": "— Shrimad Rajchandra",
    "home.audio.title": "24/7 sacred audio",
    "home.audio.desc":
      "Bhajans and reflections stream gently in the background. The broadcast is synchronized — every listener hears the same track at the same moment.",
    "home.audio.link": "Open the listener →",
    "home.books.title": "Books & writings",
    "home.books.desc":
      "Browse published works with care: rich descriptions, beautiful covers, and reading or download when available.",
    "home.books.link": "Explore the library →",
    "home.live.title": "Live satsang",
    "home.live.desc":
      "When we are live, gather here for video and an optional sangat chat. Focused on presence, not distraction.",
    "home.live.link": "Go to live stream",
    "listen.title": "Live Radio",
    "listen.desc":
      "A continuous 24/7 spiritual broadcast. Every listener hears the same track at the same moment — no streaming cost, no server required.",
    "listen.nowPlaying": "Now Playing",
    "listen.upNext": "Up Next",
    "listen.onAir": "On Air",
    "listen.offAir": "Off Air",
    "listen.tuneIn": "▶ Tune In",
    "listen.pause": "⏸ Pause",
    "listen.syncing": "⏳ Syncing…",
    "listen.playlist": "Full playlist",
    "listen.tracks": "tracks",
    "listen.loop": "loop",
    "listen.zeroCost": "Zero streaming cost",
    "listen.noTracks": "No tracks available yet.",
    "listen.noTracksDesc":
      "Go to the admin panel, add tracks, and make sure each track has a Duration (seconds) set.",
    "listen.loading": "Tuning in to the broadcast…",
    "player.liveLabel": "KarVicharTohPamm · Live",
    "footer.tagline":
      "A gentle space for reflection — sacred sound, timeless books, and shared satsang.",
    "footer.listen": "24/7 Listen",
    "footer.books": "Books",
    "footer.liveSatsang": "Live Satsang",
    "footer.madeWith": "Made with calm intent.",
    "tap.to.play": "Tap anywhere to tune in to the broadcast",
  },

  // ─────────────────────────────────── HINDI ───────────────────────────────
  hi: {
    "nav.home": "होम",
    "nav.listen": "सुनें",
    "nav.books": "पुस्तकें",
    "nav.live": "लाइव",
    "header.tagline": "ज्ञान · भक्ति · सत्संग",
    "home.badge": "शांति हृदय से शुरू होती है",
    "home.title": "KarVicharTohPamm",
    "home.desc":
      "पवित्र ध्वनि, चिंतनशील पठन और लाइव सत्संग के लिए एक शांत स्थान — जो हृदय के समीप और आध्यात्मिक शांति से भरपूर है।",
    "home.inspiredBy": "श्रीमद राजचंद्र की शिक्षाओं से प्रेरित",
    "home.startListening": "▶ सुनना शुरू करें",
    "home.joinSatsang": "लाइव सत्संग में शामिल हों",
    "home.quote":
      '"आत्मदर्शन ही सर्वोच्च साधना है; बाकी सब केवल तैयारी मात्र है। कर विचार तो पाम। "',
    "home.quoteAuthor": "— श्रीमद राजचंद्र",
    "home.audio.title": "24/7 पवित्र ऑडियो",
    "home.audio.desc":
      "भजन और आध्यात्मिक विचार धीरे-धीरे बहते रहते हैं। यह प्रसारण समकालिक है — सभी श्रोता एक ही समय पर एक ही ट्रैक सुनते हैं।",
    "home.audio.link": "श्रोता खोलें →",
    "home.books.title": "पुस्तकें और लेखन",
    "home.books.desc":
      "प्रकाशित कृतियों को विस्तार से देखें — समृद्ध विवरण, सुंदर आवरण, और उपलब्ध होने पर पढ़ने या डाउनलोड करने की सुविधा।",
    "home.books.link": "पुस्तकालय देखें →",
    "home.live.title": "लाइव सत्संग",
    "home.live.desc":
      "जब हम लाइव हों, तो वीडियो और सत्संग चर्चा के लिए यहाँ आएँ। यह स्थान शांति और उपस्थिति पर केंद्रित है।",
    "home.live.link": "लाइव स्ट्रीम पर जाएँ",
    "listen.title": "लाइव रेडियो",
    "listen.desc":
      "एक निरंतर 24/7 आध्यात्मिक प्रसारण। हर श्रोता एक ही समय पर एक ही गीत सुनता है — बिना किसी अतिरिक्त शुल्क के।",
    "listen.nowPlaying": "अभी चल रहा है",
    "listen.upNext": "अगला ट्रैक",
    "listen.onAir": "प्रसारण जारी",
    "listen.offAir": "प्रसारण बंद",
    "listen.tuneIn": "▶ ट्यून करें",
    "listen.pause": "⏸ रोकें",
    "listen.syncing": "⏳ समन्वय किया जा रहा है…",
    "listen.playlist": "पूरी प्लेलिस्ट",
    "listen.tracks": "गीत",
    "listen.loop": "लूप",
    "listen.zeroCost": "निशुल्क स्ट्रीमिंग",
    "listen.noTracks": "अभी कोई गीत उपलब्ध नहीं है।",
    "listen.noTracksDesc":
      "एडमिन पैनल में जाएँ, गीत जोड़ें और सुनिश्चित करें कि प्रत्येक गीत की अवधि (सेकंड) निर्धारित हो।",
    "listen.loading": "प्रसारण से जुड़ रहे हैं…",
    "player.liveLabel": "KarVicharTohPamm · लाइव",
    "footer.tagline":
      "चिंतन के लिए एक सौम्य स्थान — पवित्र ध्वनि, कालातीत पुस्तकें और साझा सत्संग।",
    "footer.listen": "24/7 सुनें",
    "footer.books": "पुस्तकें",
    "footer.liveSatsang": "लाइव सत्संग",
    "footer.madeWith": "आध्यात्मिक सेवा भाव से निर्मित।",
    "tap.to.play": "प्रसारण सुनने के लिए कहीं भी क्लिक करें",
  },

  // ─────────────────────────────────── GUJARATI ────────────────────────────
  gu: {
    "nav.home": "હોમ",
    "nav.listen": "શ્રવણ",
    "nav.books": "પુસ્તકો",
    "nav.live": "લાઇવ",
    "header.tagline": "જ્ઞાન · ભક્તિ · સત્સંગ",
    "home.badge": "શાંતિ અંતરથી શરૂ થાય છે",
    "home.title": "KarVicharTohPamm",
    "home.desc":
      "પવિત્ર ધ્વનિ, ચિંતનશીલ વાચન અને જીવંત સત્સંગ માટેનો એક પ્રશાંત ખૂણો — જે હૃદયની નિકટ અને આધ્યાત્મિક શાંતિથી સભર છે.",
    "home.inspiredBy": "શ્રીમદ્ રાજચંદ્રના ઉપદેશોથી પ્રેરિત",
    "home.startListening": "▶ શ્રવણ શરૂ કરો",
    "home.joinSatsang": "લાઇવ સત્સંગમાં જોડાઓ",
    "home.quote":
      '"આત્મ-દર્શન એ જ સર્વોચ્ચ સાધના છે; બાકીનું બધું માત્ર તૈયારી છે. કર વિચાર તો પામ। "',
    "home.quoteAuthor": "— શ્રીમદ્ રાજચંદ્ર",
    "home.audio.title": "24/7 પવિત્ર ઓડિયો",
    "home.audio.desc":
      "ભજનો અને સુવિચારો ધીરેથી વહેતા રહે છે. પ્રસારણ સમકાલીક છે — દરેક શ્રોતા એક જ સમયે એક જ ગીત સાંભળે છે.",
    "home.audio.link": "શ્રવણ શરૂ કરો →",
    "home.books.title": "પુસ્તકો અને લેખો",
    "home.books.desc":
      "પ્રકાશિત કૃતિઓ નિહાળો — વિગતવાર વર્ણન, સુંદર કવર અને વાંચવા અથવા ડાઉનલોડ કરવાની સુવિધા.",
    "home.books.link": "પુસ્તકાલય જુઓ →",
    "home.live.title": "લાઇવ સત્સંગ",
    "home.live.desc":
      "જ્યારે અમે લાઇવ હોઈએ, ત્યારે વીડિયો અને સત્સંગ માટે અહીં જોડાઓ. ધ્યાન અને શાંતિ પર કેન્દ્રિત.",
    "home.live.link": "લાઇવ સ્ટ્રીમ પર જાઓ",
    "listen.title": "લાઇવ રેડિયો",
    "listen.desc":
      "નિરંતર 24/7 આધ્યાત્મિક પ્રસારણ. દરેક શ્રોતા એક જ સમયે એક જ ગીત સાંભળે છે — કોઈ પણ વધારાના ખર્ચ વગર.",
    "listen.nowPlaying": "હમણાં ચાલી રહ્યું છે",
    "listen.upNext": "આગળનું ગીત",
    "listen.onAir": "પ્રસારણ ચાલુ છે",
    "listen.offAir": "પ્રસારણ બંધ છે",
    "listen.tuneIn": "▶ જોડાઓ",
    "listen.pause": "⏸ થોભો",
    "listen.syncing": "⏳ સમન્વય થઈ રહ્યો છે…",
    "listen.playlist": "સંપૂર્ણ પ્લેલિસ્ટ",
    "listen.tracks": "ગીતો",
    "listen.loop": "લૂપ",
    "listen.zeroCost": "શૂન્ય ખર્ચ",
    "listen.noTracks": "હજી સુધી કોઈ ગીતો ઉપલબ્ધ નથી.",
    "listen.noTracksDesc":
      "એડમિન પેનલ પર જાઓ, ગીતો ઉમેરો અને દરેક ગીતની લંબાઈ સેટ કરો.",
    "listen.loading": "પ્રસારણ સાથે જોડાઈ રહ્યા છીએ…",
    "player.liveLabel": "KarVicharTohPamm · લાઇવ",
    "footer.tagline":
      "ચિંતન માટેનું એક પવિત્ર સ્થાન — શ્રવણ, પુસ્તકો અને સત્સંગ.",
    "footer.listen": "24/7 શ્રવણ",
    "footer.books": "પુસ્તકો",
    "footer.liveSatsang": "લાઇવ સત્સંગ",
    "footer.madeWith": "શાંતિ અને સેવાભાવથી બનાવેલ.",
    "tap.to.play": "પ્રસારણ સાંભળવા માટે ક્યાંય પણ ટેપ કરો",
  },

  // ─────────────────────────────────── MARATHI ─────────────────────────────
  mr: {
    "nav.home": "मुखपृष्ठ",
    "nav.listen": "ऐका",
    "nav.books": "पुस्तके",
    "nav.live": "थेट",
    "header.tagline": "ज्ञान · भक्ती · सत्संग",
    "home.badge": "शांती अंतरातून सुरू होते",
    "home.title": "KarVicharTohPamm",
    "home.desc":
      "पवित्र ध्वनी, विचारपूर्ण वाचन आणि थेट सत्संगासाठी एक शांत कोपरा — जो हृदयाच्या जवळ आणि आध्यात्मिक शांतीने समृद्ध आहे.",
    "home.inspiredBy": "श्रीमद राजचंद्रांच्या शिकवणीतून प्रेरित",
    "home.startListening": "▶ ऐकण्यास सुरुवात करा",
    "home.joinSatsang": "थेट सत्संगात सामील व्हा",
    "home.quote":
      '"आत्मदर्शन हीच सर्वोच्च साधना आहे; बाकी सर्व फक्त तयारी आहे. कर विचार तो पााम। "',
    "home.quoteAuthor": "— श्रीमद राजचंद्र",
    "home.audio.title": "24/7 पवित्र ऑडिओ",
    "home.audio.desc":
      "भजने आणि विचार संथ गतीने प्रवाहित होतात. प्रसारण समकालिक आहे — प्रत्येक श्रोता एकाच वेळी एकच गाणे ऐकतो.",
    "home.audio.link": "श्रोता उघडा →",
    "home.books.title": "पुस्तके आणि लेखन",
    "home.books.desc":
      "प्रकाशित कृती काळजीपूर्वक पहा — समृद्ध वर्णन, सुंदर मुखपृष्ठ आणि वाचण्याची किंवा डाऊनलोड करण्याची सुविधा.",
    "home.books.link": "ग्रंथालय पहा →",
    "home.live.title": "थेट सत्संग",
    "home.live.desc":
      "आम्ही थेट असताना, व्हिडिओ आणि सत्संग चर्चेसाठी येथे जमा व्हा. उपस्थिती आणि शांततेवर लक्ष केंद्रित.",
    "home.live.link": "थेट प्रवाहावर जा",
    "listen.title": "थेट रेडिओ",
    "listen.desc":
      "एक अखंड 24/7 आध्यात्मिक प्रसारण. प्रत्येक श्रोता एकाच वेळी एकच गाणे ऐकतो — कोणताही अतिरिक्त खर्च नाही.",
    "listen.nowPlaying": "आता चालू आहे",
    "listen.upNext": "पुढील गाणे",
    "listen.onAir": "प्रसारण सुरू",
    "listen.offAir": "प्रसारण बंद",
    "listen.tuneIn": "▶ ट्यून करा",
    "listen.pause": "⏸ थांबवा",
    "listen.syncing": "⏳ समन्वय होत आहे…",
    "listen.playlist": "संपूर्ण यादी",
    "listen.tracks": "गाणी",
    "listen.loop": "लूप",
    "listen.zeroCost": "विनामूल्य स्ट्रीमिंग",
    "listen.noTracks": "अद्याप कोणतीही गाणी उपलब्ध नाहीत.",
    "listen.noTracksDesc":
      "प्रशासक पॅनेलमध्ये जा, गाणी जोडा आणि प्रत्येक गाण्याचा कालावधी (सेकंद) सेट असल्याची खात्री करा.",
    "listen.loading": "प्रसारणाशी जोडले जात आहे…",
    "player.liveLabel": "KarVicharTohPamm · थेट",
    "footer.tagline":
      "चिंतनासाठी एक सौम्य जागा — पवित्र ध्वनी, कालातीत पुस्तके और सामायिक सत्संग.",
    "footer.listen": "24/7 ऐका",
    "footer.books": "पुस्तके",
    "footer.liveSatsang": "थेट सत्संग",
    "footer.madeWith": "शांत हेतूने आणि सेवाभावाने बनवलेले.",
    "tap.to.play": "प्रसारण ऐकण्यासाठी कुठेही टॅप करा",
  },
};
