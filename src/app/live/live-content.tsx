"use client";

import { useLanguage } from "@/contexts/language-context";
import { LiveView } from "./live-view";

interface Props {
  initial: any;
}

export function LiveContent({ initial }: Props) {
  const { tr } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">{tr("live.pageTitle")}</h1>
        <p className="text-ink/70 font-sans leading-relaxed">
          {tr("live.pageDesc")}
        </p>
      </header>

      <LiveView initial={initial} />
    </div>
  );
}
