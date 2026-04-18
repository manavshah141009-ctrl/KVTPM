"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { AudioPlayerBar } from "./audio-player-bar";
import { InstallPrompt } from "./install-prompt";
import { PwaRegister } from "./pwa-register";
import { StreamBootstrap } from "./stream-bootstrap";
import { useAudio } from "@/contexts/audio-context";
import { useLanguage } from "@/contexts/language-context";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { tracks, current, radioTracks, needsGesture, toggleRadio, isSyncedRadio } = useAudio();
  const { tr } = useLanguage();
  const showPlayer = tracks.length > 0 || Boolean(current) || radioTracks.length > 0;

  useEffect(() => {
    document.body.toggleAttribute("data-player", showPlayer);
  }, [showPlayer]);

  if (isAdmin) {
    return (
      <>
        <PwaRegister />
        {children}
      </>
    );
  }

  return (
    <>
      <StreamBootstrap />
      <PwaRegister />
      {/* No outer pb-player: each page adds it directly */}
      <SiteHeader />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="min-h-[60vh]"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <SiteFooter />

      {showPlayer && <AudioPlayerBar />}
      <InstallPrompt />

      {/* ── Tap-to-Play prompt ── */}
      <AnimatePresence>
        {needsGesture && !isSyncedRadio && (
          <motion.button
            key="tap-to-play"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={toggleRadio}
            className="fixed z-[60] left-1/2 -translate-x-1/2
              bottom-[5rem] md:bottom-[5.5rem]
              flex items-center gap-2.5 px-5 py-3.5 rounded-full
              bg-ink/90 backdrop-blur-md text-white shadow-2xl
              font-sans text-sm font-medium
              hover:bg-saffron transition-colors cursor-pointer
              whitespace-nowrap active:scale-95"
            aria-label="Tap to start the broadcast"
          >
            <span className="text-lg">🎵</span>
            <span>{tr("tap.to.play")}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

