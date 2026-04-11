"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (dismissed || !evt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="fixed bottom-24 left-4 right-4 z-[60] md:left-auto md:right-6 md:w-80"
      >
        <div className="glass-panel p-4 flex flex-col gap-2 shadow-glow">
          <p className="font-serif text-ink text-lg">Install KarVicharTohPamm</p>
          <p className="text-sm text-ink/70 font-sans">
            Add to your home screen for quick access and a calmer fullscreen experience.
          </p>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={async () => {
                await evt.prompt();
                await evt.userChoice;
                setEvt(null);
              }}
              className="flex-1 rounded-xl bg-saffron text-white py-2 text-sm font-sans font-medium shadow-glow-sm hover:bg-saffron-dim transition-colors"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="px-4 rounded-xl border border-ink/15 text-ink/70 text-sm hover:bg-white/40"
            >
              Later
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
