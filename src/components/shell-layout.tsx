"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { AudioPlayerBar } from "./audio-player-bar";
import { InstallPrompt } from "./install-prompt";
import { PwaRegister } from "./pwa-register";
import { StreamBootstrap } from "./stream-bootstrap";
import { useAudio } from "@/contexts/audio-context";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { tracks, current } = useAudio();
  const showPlayer = tracks.length > 0 || Boolean(current);

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
      <div className={showPlayer ? "pb-player" : undefined}>
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
      </div>
      {showPlayer && <AudioPlayerBar />}
      <InstallPrompt />
    </>
  );
}
