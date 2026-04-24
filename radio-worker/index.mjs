#!/usr/bin/env node
/**
 * KVTP Radio Worker — Background IceCast Source Client
 * =====================================================
 * Reads published tracks from MongoDB (Google Drive links),
 * downloads each one via the Drive proxy, and pushes a continuous
 * MP3 stream to the IceCast/Shoutcast server using the ICY source protocol.
 *
 * Requirements:
 *   - Node.js 18+
 *   - ffmpeg in PATH  (winget install ffmpeg  /  apt install ffmpeg)
 *   - .env with MONGO_URI, CASTER_HOST, CASTER_PORT, CASTER_MOUNT, CASTER_PASSWORD
 *
 * Usage:
 *   node radio-worker/index.mjs          # local dev (in a separate terminal)
 *   npm run radio                         # via npm script
 *
 * Azure Deployment:
 *   Option A — Azure Container Apps: docker build -f radio-worker/Dockerfile .
 *   Option B — Azure App Service WebJob: add as continuous WebJob
 */

import { createConnection } from "net";
import { spawn } from "child_process";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// ── Load .env manually (no dotenv dependency) ─────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    // Don't overwrite values already set in the environment (production)
    if (!process.env[key]) process.env[key] = trimmed.slice(eqIdx + 1).trim();
  }
} catch {
  // .env not found — rely on actual env vars (Azure App Settings)
}

// ── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const HOST      = process.env.CASTER_HOST     || "sapircast.caster.fm";
const PORT      = parseInt(process.env.CASTER_PORT || "12347", 10);
const MOUNT     = process.env.CASTER_MOUNT    || "/R5a6l";
const PASSWORD  = process.env.CASTER_PASSWORD || "";
const STATION   = "KarVicharTohPamm";

if (!MONGO_URI) { console.error("❌ MONGO_URI not set"); process.exit(1); }
if (!PASSWORD)  { console.error("❌ CASTER_PASSWORD not set"); process.exit(1); }

console.log(`📻 KVTP Radio Worker starting`);
console.log(`   IceCast: ${HOST}:${PORT}${MOUNT}`);

// Auto-detect the running Next.js server URL (tries common dev ports)
let APP_URL = null;
async function detectAppUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:3002",
  ].filter(Boolean);
  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/api/radio`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) { APP_URL = url.replace(/\/$/, ""); return; }
    } catch { /* try next */ }
  }
  console.warn("⚠️  Next.js server not detected — GDrive files will be fetched directly");
}

// ── Mongoose Track model (minimal, matches src/models/Track.ts) ───────────────
const TrackSchema = new mongoose.Schema({
  title:      String,
  artist:     String,
  audioUrl:   { type: String, required: true },
  durationSec: Number,
  order:      { type: Number, default: 0 },
  published:  { type: Boolean, default: true },
  scheduleType: { type: String, default: "rotation" },
  fixedTime:    String,
  isRepeating:  { type: Boolean, default: true },
  lastPlayedDate: String,
}, { timestamps: true });

const Track = mongoose.models?.Track || mongoose.model("Track", TrackSchema);

async function connectDb() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  console.log("✅ MongoDB connected");
}

async function fetchRotationTracks() {
  return Track.find({ 
    published: true, 
    $or: [
      { scheduleType: "rotation" },
      { scheduleType: { $exists: false } }
    ]
  }).sort({ order: 1, createdAt: 1 }).lean();
}

// ── Google Drive helpers ──────────────────────────────────────────────────────
// ... (existing extractGDriveId and resolveUrl)

// ── Global state for interruptions ──
let currentFF = null;
let pendingFixedTrack = null;

// ... (existing connectIceCast)

// ── Stream one track ──────────────────────────────────────────────────────────
function streamTrack(sock, url, title) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶  Now playing: ${title}`);

    const ff = spawn("ffmpeg", [
      "-re",                   // real-time read (1x speed)
      "-i", url,               // input
      "-vn",                   // skip video
      "-acodec", "libmp3lame", // MP3 encoder
      "-ab", "128k",           // bitrate
      "-ar", "44100",          // sample rate
      "-ac", "2",              // stereo
      "-f", "mp3",             // output format
      "-loglevel", "error",    // suppress ffmpeg verbose logs
      "pipe:1",                // write to stdout
    ]);

    currentFF = ff;

    // Pipe ffmpeg's MP3 output directly into the IceCast socket
    ff.stdout.pipe(sock, { end: false });

    ff.stderr.on("data", (d) => {
      const msg = d.toString().trim();
      if (msg) console.log(`  [ffmpeg] ${msg}`);
    });

    ff.on("close", (code) => {
      currentFF = null;
      console.log(`  ✓ Finished (exit ${code}): ${title}`);
      resolve(code);
    });

    ff.on("error", (err) => {
      currentFF = null;
      if (err.code === "ENOENT") {
        reject(new Error("❌ ffmpeg not found!"));
      } else {
        reject(err);
      }
    });

    // If IceCast disconnects mid-track, kill ffmpeg and propagate error
    const onSockClose = () => { ff.kill("SIGTERM"); reject(new Error("IceCast socket closed")); };
    sock.once("close", onSockClose);
    sock.once("error", onSockClose);
    ff.on("close", () => {
      sock.removeListener("close", onSockClose);
      sock.removeListener("error", onSockClose);
    });
  });
}

// ── Background Scheduler ──
async function schedulerLoop() {
  while (true) {
    try {
      const now = new Date();
      // Format current time as HH:mm (e.g. "07:00")
      const HHmm = now.getHours().toString().padStart(2, "0") + ":" + 
                   now.getMinutes().toString().padStart(2, "0");
      const today = now.toISOString().split("T")[0];

      const due = await Track.findOne({
        published: true,
        scheduleType: "fixed",
        fixedTime: HHmm,
        lastPlayedDate: { $ne: today }
      });

      if (due && !pendingFixedTrack) {
        console.log(`\n⏰ FIXED TRACK DUE: ${due.title} at ${HHmm}`);
        pendingFixedTrack = due;
        
        // Interrupt current playback immediately
        if (currentFF) {
          console.log(`   Cutting current rotation track to start scheduled song...`);
          currentFF.kill("SIGTERM");
        }
      }
    } catch (err) {
      console.error("❌ Scheduler error:", err.stack);
    }
    await sleep(10000); // Check every 10s
  }
}

// ── Main loop ─────────────────────────────────────────────────────────────────
async function run() {
  await connectDb();
  await detectAppUrl();
  if (APP_URL) console.log(`   Proxy:   ${APP_URL}/api/proxy/audio`);

  // Start background scheduler
  schedulerLoop();

  while (true) {
    // ── Try to connect to IceCast ──
    let sock;
    try {
      sock = await connectIceCast();
    } catch (err) {
      console.error(`❌ IceCast connect failed: ${err.message}`);
      await sleep(30_000);
      continue;
    }

    // ── Fetch rotation tracks ──
    let tracks;
    try {
      tracks = await fetchRotationTracks();
    } catch (err) {
      console.error(`❌ DB error: ${err.message}`);
      sock.destroy();
      await sleep(10_000);
      continue;
    }

    if (!tracks.length && !pendingFixedTrack) {
      console.warn("⚠️  No tracks in DB. Waiting 60s…");
      sock.destroy();
      await sleep(60_000);
      continue;
    }

    console.log(`\n📋 Rotation: ${tracks.length} track(s)`);

    // ── Stream each track ──
    let sockDied = false;
    const onDied = () => { sockDied = true; };
    sock.once("close", onDied);
    sock.once("error", onDied);

    while (!sockDied) {
      // 1. Check if we have a pending fixed track (interruption)
      if (pendingFixedTrack) {
        const track = pendingFixedTrack;
        pendingFixedTrack = null; // Clear first to avoid re-triggering
        
        // Mark as played today immediately
        const today = new Date().toISOString().split("T")[0];
        await Track.updateOne(
          { _id: track._id }, 
          { 
            $set: { 
              lastPlayedDate: today,
              ...(track.isRepeating ? {} : { published: false })
            }
          }
        );

        const url = resolveUrl(track.audioUrl);
        try {
          await streamTrack(sock, url, `[SCHEDULED] ${track.title}`);
        } catch (err) {
          console.error(`  ❌ Scheduled track error: ${err.message}`);
        }
        continue; // Check for more fixed tracks before resuming rotation
      }

      // 2. Play next rotation track
      for (const track of tracks) {
        if (sockDied || pendingFixedTrack) break;
        
        const url = resolveUrl(track.audioUrl);
        try {
          await streamTrack(sock, url, track.title || "Untitled");
        } catch (err) {
          console.error(`  ❌ Track error: ${err.message}`);
          if (sockDied) break;
          await sleep(2_000);
        }
        // After each song, check if a fixed track became pending
        if (pendingFixedTrack) break; 
      }
      
      // Re-fetch tracks for the next loop to pick up any changes
      try {
        tracks = await fetchRotationTracks();
      } catch { break; }
    }

    sock.destroy();
    console.log("\n🔄 Connection lost or playlist reset — reconnecting…");
    await sleep(2_000);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

run().catch((err) => {
  console.error("💥 Fatal:", err);
  process.exit(1);
});
