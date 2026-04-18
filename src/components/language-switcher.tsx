"use client";

import { useLanguage } from "@/contexts/language-context";
import { Lang } from "@/lib/translations";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LANGS: Lang[] = ["en", "hi", "gu", "mr"];

export function LanguageSwitcher() {
  const { lang, setLang, langLabels, langNames } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${langNames[lang]}`}
        className="flex items-center gap-1 md:gap-1.5 px-2 py-1.5 rounded-xl
          border border-saffron/25 bg-white/40 backdrop-blur-sm
          text-ink/75 hover:text-ink hover:border-saffron/50
          text-xs md:text-sm font-sans font-medium transition-all
          hover:bg-white/60 shadow-sm active:scale-95"
      >
        <span className="text-sm md:text-base leading-none" aria-hidden>🌐</span>
        <span className="tracking-wide">{langLabels[lang]}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            <motion.ul
              role="listbox"
              aria-label="Choose language"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-40 z-50
                bg-parchment/98 backdrop-blur-lg border border-saffron/20
                rounded-2xl shadow-2xl overflow-hidden"
            >
              {LANGS.map((l) => (
                <li key={l} role="option" aria-selected={lang === l}>
                  <button
                    onClick={() => { setLang(l); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3
                      text-left text-sm font-sans transition-colors
                      ${lang === l
                        ? "bg-saffron/10 text-saffron-dim font-semibold"
                        : "text-ink/70 hover:bg-saffron/5 hover:text-ink"
                      }`}
                  >
                    <span className="text-base w-5 text-center font-serif">
                      {l === "en" ? "A" : l === "hi" ? "अ" : l === "gu" ? "અ" : "अ"}
                    </span>
                    <span>{langNames[l]}</span>
                    {lang === l && (
                      <span className="ml-auto text-saffron text-xs">✓</span>
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
