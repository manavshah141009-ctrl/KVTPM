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
}, { timestamps: true });

const Track = mongoose.models?.Track || mongoose.model("Track", TrackSchema);

async function connectDb() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  console.log("✅ MongoDB connected");
}

async function fetchTracks() {
  return Track.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
}

// ── Google Drive helpers ──────────────────────────────────────────────────────
function extractGDriveId(url) {
  if (!url) return null;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2) return m2[1];
  return null;
}

/**
 * Convert a GDrive URL to a streamable URL for ffmpeg.
 * If our Next.js proxy is running, use it (handles large-file confirmations).
 * Otherwise fall back to a direct Drive download URL — ffmpeg can usually
 * handle the redirect chain itself.
 */
function resolveUrl(audioUrl) {
  const id = extractGDriveId(audioUrl);
  if (!id) return audioUrl;
  if (APP_URL) return `${APP_URL}/api/proxy/audio?id=${id}`;
  // Fallback: direct Drive URL with confirm token
  return `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;
}

// ── IceCast source connection (ICY/Shoutcast protocol) ────────────────────────
function connectIceCast() {
  return new Promise((resolve, reject) => {
    const sock = createConnection({ host: HOST, port: PORT }, () => {
      // ICY source protocol: send a PUT-like handshake
      const creds = Buffer.from(`source:${PASSWORD}`).toString("base64");
      const handshake = [
        `SOURCE ${MOUNT} ICY/1.0`,
        `Authorization: Basic ${creds}`,
        `Content-Type: audio/mpeg`,
        `ice-name: ${STATION}`,
        `ice-description: 24/7 Spiritual Radio`,
        `ice-genre: Spiritual`,
        `ice-public: 0`,
        `icy-br: 128`,
        ``,
        ``,
      ].join("\r\n");
      sock.write(handshake);
    });

    let responded = false;

    sock.once("data", (buf) => {
      responded = true;
      const msg = buf.toString();
      if (msg.includes("200") || msg.toLowerCase().includes("ok")) {
        console.log(`✅ IceCast handshake accepted`);
        resolve(sock);
      } else {
        sock.destroy();
        reject(new Error(`IceCast rejected connection:\n${msg.trim()}`));
      }
    });

    sock.once("error", (err) => { if (!responded) reject(err); });
    setTimeout(() => {
      if (!responded) {
        sock.destroy();
        reject(new Error("IceCast handshake timeout"));
      }
    }, 10_000);
  });
}

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

    // Pipe ffmpeg's MP3 output directly into the IceCast socket
    ff.stdout.pipe(sock, { end: false });

    ff.stderr.on("data", (d) => {
      const msg = d.toString().trim();
      if (msg) console.log(`  [ffmpeg] ${msg}`);
    });

    ff.on("close", (code) => {
      console.log(`  ✓ Finished (exit ${code}): ${title}`);
      resolve(code);
    });

    ff.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(new Error(
          "❌ ffmpeg not found! Install it first:\n" +
          "   Windows: winget install ffmpeg\n" +
          "   Linux:   apt install ffmpeg"
        ));
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

// ── Main loop ─────────────────────────────────────────────────────────────────
async function run() {
  await connectDb();
  await detectAppUrl();
  if (APP_URL) console.log(`   Proxy:   ${APP_URL}/api/proxy/audio`);

  while (true) {
    // ── Try to connect to IceCast ──
    let sock;
    try {
      sock = await connectIceCast();
    } catch (err) {
      console.error(`❌ IceCast connect failed: ${err.message}`);
      console.log("   Retrying in 30s…");
      await sleep(30_000);
      continue;
    }

    // ── Fetch current playlist ──
    let tracks;
    try {
      tracks = await fetchTracks();
    } catch (err) {
      console.error(`❌ DB error: ${err.message}`);
      sock.destroy();
      await sleep(10_000);
      continue;
    }

    if (!tracks.length) {
      console.warn("⚠️  No published tracks in DB. Waiting 60s…");
      sock.destroy();
      await sleep(60_000);
      continue;
    }

    console.log(`\n📋 Playlist: ${tracks.length} track(s)`);

    // ── Stream each track ──
    let sockDied = false;
    const onDied = () => { sockDied = true; };
    sock.once("close", onDied);
    sock.once("error", onDied);

    for (const track of tracks) {
      if (sockDied) break;
      const url = resolveUrl(track.audioUrl);
      try {
        await streamTrack(sock, url, track.title || "Untitled");
      } catch (err) {
        console.error(`  ❌ Track error: ${err.message}`);
        if (sockDied) break;
        await sleep(2_000); // skip to next track
      }
    }

    sock.destroy();
    console.log("\n🔄 Playlist complete — reloading from DB and reconnecting…");
    await sleep(2_000);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

run().catch((err) => {
  console.error("💥 Fatal:", err);
  process.exit(1);
});
