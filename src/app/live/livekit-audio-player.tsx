"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, useTracks, AudioTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useAudio } from "@/contexts/audio-context";

export function LiveKitAudioPlayer({ token }: { token: string | null }) {
  const { forceStop } = useAudio();

  if (!token) return <div className="text-center p-8 animate-pulse text-ink/40">Connecting to stream...</div>;

  return (
    <div className="absolute inset-0 bg-ink flex flex-col items-center justify-center p-6">
      <LiveKitRoom
        audio={false} // Devotee should not publish audio
        video={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        className="w-full h-full flex flex-col items-center justify-center"
      >
        <AudioStreamUI stopBg={forceStop} />
      </LiveKitRoom>
    </div>
  );
}

function AudioStreamUI({ stopBg }: { stopBg: () => void }) {
  const [started, setStarted] = useState(false);
  const tracks = useTracks([Track.Source.Microphone]);
  const audioTrack = tracks.find(t => t.source === Track.Source.Microphone);

  if (!started) {
    return (
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-saffron/20 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-br from-saffron to-saffron-dim rounded-full shadow-glow-sm flex items-center justify-center text-5xl">
            📡
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-white font-serif text-2xl tracking-tight">Divine Satsang is Live</h3>
          <p className="text-white/50 text-sm font-sans px-8 leading-relaxed">
            Connect your heart and ears to the live transmission from the temple.
          </p>
        </div>

        <button 
          onClick={() => {
            stopBg();
            setStarted(true);
          }}
          className="group relative bg-white text-ink px-10 py-4 rounded-full font-bold shadow-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-saffron/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">
            <span className="text-xl">🔈</span> Enter Satsang
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
        {/* Decorative Rings */}
        <div className="absolute inset-0 border border-white/10 rounded-full scale-110 animate-pulse-soft" />
        <div className="absolute inset-0 border border-saffron/20 rounded-full scale-125" />
        
        <div className="relative w-32 h-32 rounded-full bg-ink/40 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-saffron/20 to-transparent" />
          {audioTrack ? (
             <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-saffron rounded-full animate-ping mb-2" />
                <span className="text-xs font-bold text-saffron uppercase tracking-[0.2em] animate-pulse">On Air</span>
             </div>
          ) : (
             <div className="flex flex-col items-center opacity-40">
                <div className="w-2 h-2 bg-white/40 rounded-full mb-2" />
                <span className="text-[10px] uppercase tracking-widest">Buffering</span>
             </div>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-saffron-dim font-serif text-2xl italic">"Shabd Nirantar"</p>
        <p className="text-white/40 text-[10px] font-sans tracking-[0.3em] uppercase">Live Audio Feed</p>
      </div>

      <div className="flex flex-col items-center">
        {audioTrack ? (
          <>
            <AudioTrack trackRef={audioTrack} />
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
               <div className="flex gap-1">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-1 bg-saffron/60 rounded-full animate-bounce" style={{ height: `${Math.random()*12+4}px`, animationDelay: `${i*0.1}s` }} />
                 ))}
               </div>
               <span className="text-[10px] text-white/60 font-medium tracking-wider">Connected & Listening</span>
            </div>
          </>
        ) : (
          <div className="bg-white/5 px-4 py-2 rounded-full animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-white/20 rounded-full" />
            <span className="text-[10px] text-white/30 tracking-widest uppercase">Waiting for signal</span>
          </div>
        )}
      </div>
    </div>
  );
}
