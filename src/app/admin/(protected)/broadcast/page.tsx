"use client";

import { useState, useEffect, useRef, MutableRefObject } from "react";
import { LiveKitRoom, AudioConference, useRoomContext } from "@livekit/components-react";
import { useLanguage } from "@/contexts/language-context";
import { useAudio } from "@/contexts/audio-context";

export default function AdminBroadcastPage() {
  const { forceStop, resumeAudio } = useAudio();
  const [token, setToken] = useState<string | null>(null);
  const [roomName] = useState("satsang-room");
  const [isLive, setIsLive] = useState(false);
  const [msg, setMsg] = useState("");
  const { tr } = useLanguage();

  // We store the audio chunks in a ref so they survive component unmount
  const chunksRef = useRef<Blob[]>([]);

  async function startBroadcast() {
    try {
      forceStop();
      chunksRef.current = [];
      setMsg("Connecting to database...");

      const resStatus = await fetch("/api/live/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: true, provider: "livekit", streamKeyOrUrl: roomName }),
      });
      if (!resStatus.ok) throw new Error("Status update failed");

      setMsg("Generating token...");
      const resToken = await fetch(`/api/live/token?room=${roomName}&username=Admin`);
      const data = await resToken.json();
      if (!data.token) throw new Error("No token received");

      setToken(data.token);
      setIsLive(true);
      setMsg("📡 Live transmission started");
    } catch (err) {
      console.error(err);
      setMsg("❌ Failed to start broadcast");
    }
  }

  async function stopBroadcast() {
    try {
      setMsg("📡 Archiving satsang to Google Drive...");
      setIsLive(false);
      setToken(null);

      // 1. Update DB immediately
      await fetch("/api/live/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: false }),
      });

      // 2. Upload to GDrive
      if (chunksRef.current.length > 0) {
        await archiveToDrive(chunksRef.current);
      } else {
        console.warn("No audio chunks to archive");
      }

      setMsg("✓ Live ended. Archive saved to Drive.");
      resumeAudio();
    } catch (err) {
      console.error(err);
      setMsg("⚠ Live ended, but archiving failed");
    }
  }

  async function archiveToDrive(chunks: Blob[]) {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, "satsang.webm");

    const res = await fetch("/api/admin/gdrive/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="glass-panel p-8 rounded-[2rem] space-y-10 border-white/40 shadow-2xl">
        <header className="text-center space-y-3">
          <h1 className="font-serif text-4xl text-ink italic tracking-tight">Divine Broadcaster</h1>
          <p className="text-ink/40 font-sans text-xs uppercase tracking-widest">Global Sangat Feed</p>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-ink/5 rounded-[2rem] bg-ink/[0.02]">
          {!isLive ? (
            <div className="text-center space-y-8 animate-in fade-in duration-1000">
              <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl grayscale opacity-50">🎙️</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-ink/80 font-serif text-2xl">Ready to transmit?</h2>
                <p className="text-ink/40 text-sm max-w-xs mx-auto">
                  Ensure your microphone is connected. Your message will reach the entire global community.
                </p>
              </div>
              <button
                onClick={startBroadcast}
                className="bg-saffron text-white px-12 py-4 rounded-full font-bold shadow-lg hover:shadow-saffron/40 hover:scale-105 active:scale-95 transition-all"
              >
                Go Live Now
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md p-6 space-y-8 animate-in zoom-in-95 duration-500">
              <LiveKitRoom
                video={false}
                audio={true}
                token={token!}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                onDisconnected={() => setIsLive(false)}
                className="flex flex-col items-center gap-6"
              >
                <BroadcasterInner chunksRef={chunksRef} />
              </LiveKitRoom>

              <button
                onClick={stopBroadcast}
                className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-bold border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 group"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full group-hover:animate-ping" />
                End Satsang & Save
              </button>
            </div>
          )}
        </div>

        {msg && (
          <p className={`text-center text-sm font-medium ${msg.startsWith("✓") ? "text-emerald-600" : msg.startsWith("⚠") || msg.startsWith("❌") ? "text-red-500" : "text-amber-600"}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

function BroadcasterInner({ chunksRef }: { chunksRef: MutableRefObject<Blob[]> }) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // If React Strict Mode already cleaned us up, release and bail
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        console.log("[broadcast] Got mic stream, tracks:", stream.getAudioTracks().length);

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
            console.log("[broadcast] Chunk recorded, total:", chunksRef.current.length);
          }
        };

        recorder.start(1000);
        console.log("[broadcast] MediaRecorder started (1s timeslice)");
      } catch (err) {
        console.error("[broadcast] Failed to start recording:", err);
      }
    };

    startRecording();

    return () => {
      cancelled = true;
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
        console.log("[broadcast] MediaRecorder stopped, chunks:", chunksRef.current.length);
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      recorderRef.current = null;
      streamRef.current = null;
    };
  }, []); // Empty deps — start once on mount, survive Strict Mode

  return (
    <div className="w-full space-y-6">
      <AudioConference />
      <div className="flex flex-col items-center gap-2">
         <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
         <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Microphone Active</p>
      </div>
    </div>
  );
}
