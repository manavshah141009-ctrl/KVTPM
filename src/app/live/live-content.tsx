"use client";

import { useLanguage } from "@/contexts/language-context";
import { motion } from "framer-motion";
import { LiveView } from "./live-view";

interface Props {
  initial: any;
}

export function LiveContent({ initial }: Props) {
  const { tr } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
      <header className="mb-12 text-center max-w-3xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-1px bg-saffron mx-auto mb-6"
        />
        <h1 className="font-serif text-4xl md:text-5xl text-ink tracking-tight">
          {tr("live.pageTitle")}
        </h1>
        <p className="text-ink/60 font-sans leading-relaxed text-sm md:text-base max-w-xl mx-auto italic">
          {tr("live.pageDesc")}
        </p>
      </header>

      <LiveView initial={initial} />
    </div>
  );
}
