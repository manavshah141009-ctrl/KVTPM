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
    "home.badge": "शांति भीतर से शुरू होती है",
    "home.title": "KarVicharTohPamm",
    "home.desc":
      "पवित्र ध्वनि, विचारशील पठन और लाइव सत्संग के लिए एक शांत कोना — गर्म, निर्मल और दिल के करीब।",
    "home.inspiredBy": "श्रीमद राजचंद्र की शिक्षाओं से प्रेरित",
    "home.startListening": "▶ सुनना शुरू करें",
    "home.joinSatsang": "लाइव सत्संग में शामिल हों",
    "home.quote":
      '"आत्मदर्शन सर्वोच्च साधना है; बाकी सब तैयारी मात्र है।"',
    "home.quoteAuthor": "— श्रीमद राजचंद्र",
    "home.audio.title": "24/7 पवित्र ऑडियो",
    "home.audio.desc":
      "भजन और विचार धीरे-धीरे बहते रहते हैं। प्रसारण समकालिक है — हर श्रोता एक ही समय पर एक ही गीत सुनता है।",
    "home.audio.link": "श्रोता खोलें →",
    "home.books.title": "पुस्तकें और लेखन",
    "home.books.desc":
      "प्रकाशित कृतियों को ध्यान से ब्राउज़ करें — समृद्ध विवरण, सुंदर आवरण, और उपलब्ध होने पर पढ़ें या डाउनलोड करें।",
    "home.books.link": "पुस्तकालय देखें →",
    "home.live.title": "लाइव सत्संग",
    "home.live.desc":
      "जब हम लाइव हों, वीडियो और संगत चैट के लिए यहाँ आएं। उपस्थिति पर केंद्रित।",
    "home.live.link": "लाइव स्ट्रीम पर जाएं",
    "listen.title": "लाइव रेडियो",
    "listen.desc":
      "एक निरंतर 24/7 आध्यात्मिक प्रसारण। हर श्रोता एक ही समय पर एक ही गीत सुनता है — कोई स्ट्रीमिंग लागत नहीं।",
    "listen.nowPlaying": "अभी चल रहा है",
    "listen.upNext": "अगला",
    "listen.onAir": "प्रसारण पर",
    "listen.offAir": "बंद",
    "listen.tuneIn": "▶ ट्यून करें",
    "listen.pause": "⏸ रोकें",
    "listen.syncing": "⏳ समन्वयन…",
    "listen.playlist": "पूरी प्लेलिस्ट",
    "listen.tracks": "गीत",
    "listen.loop": "लूप",
    "listen.zeroCost": "शून्य स्ट्रीमिंग लागत",
    "listen.noTracks": "अभी कोई गीत उपलब्ध नहीं।",
    "listen.noTracksDesc":
      "व्यवस्थापक पैनल में जाएं, गीत जोड़ें और सुनिश्चित करें कि प्रत्येक गीत की अवधि (सेकंड) सेट हो।",
    "listen.loading": "प्रसारण से जुड़ रहे हैं…",
    "player.liveLabel": "KarVicharTohPamm · लाइव",
    "footer.tagline":
      "चिंतन के लिए एक सौम्य स्थान — पवित्र ध्वनि, कालातीत पुस्तकें और साझा सत्संग।",
    "footer.listen": "24/7 सुनें",
    "footer.books": "पुस्तकें",
    "footer.liveSatsang": "लाइव सत्संग",
    "footer.madeWith": "शांत इरादे से बनाया गया।",
    "tap.to.play": "प्रसारण सुनने के लिए कहीं भी टैप करें",
  },

  // ─────────────────────────────────── GUJARATI ────────────────────────────
  gu: {
    "nav.home": "હોમ",
    "nav.listen": "સાંભળો",
    "nav.books": "પુસ્તકો",
    "nav.live": "લાઇવ",
    "header.tagline": "જ્ઞાન · ભક્તિ · સત્સંગ",
    "home.badge": "શાંતિ અંદરથી શરૂ થાય છે",
    "home.title": "KarVicharTohPamm",
    "home.desc":
      "પવિત્ર ધ્વનિ, વિચારશીલ વાંચન અને લાઇવ સત્સંગ માટેનો એક શાંત ખૂણો — ઉષ્ણ, ધીર અને હૃદયની નજીક.",
    "home.inspiredBy": "શ્રીમદ્ રાજચંદ્રના ઉપદેશોથી પ્રેરિત",
    "home.startListening": "▶ સાંભળવાનું શરૂ કરો",
    "home.joinSatsang": "લાઇવ સત્સંગમાં જોડાઓ",
    "home.quote":
      '"આત્મ-દર્શન સर्वोच્ચ સાધના છે; બાકી બધું તૈયારી છે."',
    "home.quoteAuthor": "— શ્રીમદ્ રાજચંદ્ર",
    "home.audio.title": "24/7 પવિત્ર ઑડિઓ",
    "home.audio.desc":
      "ભજનો અને વિચારો ધીરેથી વહેતા રહે છે. પ્રસારણ સમકાલીક છે — દરેક શ્રોતા એ જ સમયે એ જ ગીત સાંભળે છે।",
    "home.audio.link": "શ્રોતા ખોલો →",
    "home.books.title": "પુસ્તકો અને લેખો",
    "home.books.desc":
      "પ્રકાશિત કૃતિઓ ધ્યાનથી બ્રાઉઝ કરો — સમૃદ્ધ વિવરણ, સુંદર કવર, ઉપલબ્ધ હોય ત્યારે વાંચો અથવા ડાઉનલોડ કરો.",
    "home.books.link": "ગ્રંથાલય જુઓ →",
    "home.live.title": "લાઇવ સત્સંગ",
    "home.live.desc":
      "જ્યારે આپण લাઇવ હોઇએ, વિડિઓ અને સંગત ચૅટ માટે અહીં ભેગા થાઓ. ઉpstilliti पर ध्यान.",
    "home.live.link": "લાઇવ સ્ટ્રીમ પર જાઓ",
    "listen.title": "લાઇવ રેડિઓ",
    "listen.desc":
      "એક સંત 24/7 આध्यात्मिक放送. दरेक श्रोता एकच वेळी एकच गाणे ऐकतो — कोणताही স्ট्रीমिंग खर्च नाहीं.",
    "listen.nowPlaying": "હમણાં ચાલી રહ્યું છે",
    "listen.upNext": "આગળ",
    "listen.onAir": "ઑન એર",
    "listen.offAir": "ઑફ",
    "listen.tuneIn": "▶ ટ્યૂન ઇન",
    "listen.pause": "⏸ રોકો",
    "listen.syncing": "⏳ સમન્વય…",
    "listen.playlist": "સંપૂર્ણ પ્લેલિસ્ટ",
    "listen.tracks": "ગીતો",
    "listen.loop": "loop",
    "listen.zeroCost": "શૂન્ય streaming ખર્ચ",
    "listen.noTracks": "હજી કોઈ ગીત ઉplabhed નથी.",
    "listen.noTracksDesc":
      "Admin panel ما جاઓ, ગીतো ઉmerate उत्पन करो अने खात्री करो ke दरेक ट्रैक की अवधि सेट हो।",
    "listen.loading": "પ્રสারण سाथ जोड़ा जा रहा है…",
    "player.liveLabel": "KarVicharTohPamm · લाइव",
    "footer.tagline":
      "ચintanना लिए एक सौम्य जगह — पवित्र ध्वनि, चिरंतन पुस्तकें और साझा सत्संग।",
    "footer.listen": "24/7 સাàभëðò",
    "footer.books": "પुस्तकें",
    "footer.liveSatsang": "ल利ve सत्संग",
    "footer.madeWith": "शांत आशय थी बनाव्युं.",
    "tap.to.play": "પ્રسارण सुनवा माटे ग्या पण टैप करो",
  },

  // ─────────────────────────────────── MARATHI ─────────────────────────────
  mr: {
    "nav.home": "मुखपृष्ठ",
    "nav.listen": "ऐका",
    "nav.books": "पुस्तके",
    "nav.live": "थेट",
    "header.tagline": "ज्ञान · भक्ती · सत्संग",
    "home.badge": "शांती आतूनच सुरू होते",
    "home.title": "KarVicharTohPamm",
    "home.desc":
      "पवित्र ध्वनी, विचारपूर्ण वाचन आणि थेट सत्संगासाठी एक शांत कोपरा — उबदार, निवांत आणि हृदयाच्या जवळ.",
    "home.inspiredBy": "श्रीमद राजचंद्रांच्या शिकवणीने प्रेरित",
    "home.startListening": "▶ ऐकण्यास सुरुवात करा",
    "home.joinSatsang": "थेट सत्संगात सामील व्हा",
    "home.quote":
      '"आत्मदर्शन ही सर्वोच्च साधना आहे; बाकी सर्व तयारी आहे."',
    "home.quoteAuthor": "— श्रीमद राजचंद्र",
    "home.audio.title": "24/7 पवित्र ऑडिओ",
    "home.audio.desc":
      "भजने आणि विचार मंद गतीने वाहत राहतात. प्रसारण समकालिक आहे — प्रत्येक श्रोता एकाच वेळी एकच गाणे ऐकतो.",
    "home.audio.link": "श्रोता उघडा →",
    "home.books.title": "पुस्तके आणि लेखन",
    "home.books.desc":
      "प्रकाशित कृती काळजीपूर्वक पाहा — समृद्ध वर्णन, सुंदर मुखपृष्ठ, उपलब्ध असताना वाचा किंवा डाउनलोड करा.",
    "home.books.link": "ग्रंथालय पाहा →",
    "home.live.title": "थेट सत्संग",
    "home.live.desc":
      "आम्ही थेट असताना, व्हिडिओ आणि संगत चॅटसाठी येथे जमा व्हा. उपस्थितीवर लक्ष केंद्रित.",
    "home.live.link": "थेट प्रवाहावर जा",
    "listen.title": "थेट रेडिओ",
    "listen.desc":
      "एक सतत 24/7 आध्यात्मिक प्रसारण. प्रत्येक श्रोता एकाच वेळी एकच गाणे ऐकतो — कोणताही स्ट्रीमिंग खर्च नाही.",
    "listen.nowPlaying": "आता चालू आहे",
    "listen.upNext": "पुढे",
    "listen.onAir": "प्रसारणावर",
    "listen.offAir": "बंद",
    "listen.tuneIn": "▶ ट्यून करा",
    "listen.pause": "⏸ थांबवा",
    "listen.syncing": "⏳ समक्रमण…",
    "listen.playlist": "संपूर्ण यादी",
    "listen.tracks": "गाणी",
    "listen.loop": "लूप",
    "listen.zeroCost": "शून्य स्ट्रीमिंग खर्च",
    "listen.noTracks": "अद्याप कोणतीही गाणी उपलब्ध नाहीत.",
    "listen.noTracksDesc":
      "प्रशासक पॅनेलमध्ये जा, गाणी जोडा आणि प्रत्येक गाण्याचा कालावधी (सेकंद) सेट केला असल्याची खात्री करा.",
    "listen.loading": "प्रसारणाशी जोडत आहे…",
    "player.liveLabel": "KarVicharTohPamm · थेट",
    "footer.tagline":
      "चिंतनासाठी एक सौम्य जागा — पवित्र ध्वनी, कालातीत पुस्तके आणि सामायिक सत्संग.",
    "footer.listen": "24/7 ऐका",
    "footer.books": "पुस्तके",
    "footer.liveSatsang": "थेट सत्संग",
    "footer.madeWith": "शांत हेतूने बनवले.",
    "tap.to.play": "प्रसारण ऐकण्यासाठी कुठेही टॅप करा",
  },
};
