"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { Lang, TranslationKey, t, LANG_LABELS, LANG_NAMES } from "@/lib/translations";

const LS_KEY = "kvtp_lang";

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: TranslationKey) => string;
  langLabels: typeof LANG_LABELS;
  langNames: typeof LANG_NAMES;
}

const Ctx = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore persisted language on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Lang | null;
    if (stored && stored in t) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  };

  const value = useMemo<LanguageCtx>(
    () => ({
      lang,
      setLang,
      tr: (key: TranslationKey) => t[lang][key] ?? t.en[key] ?? key,
      langLabels: LANG_LABELS,
      langNames: LANG_NAMES,
    }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLanguage requires LanguageProvider");
  return c;
}
