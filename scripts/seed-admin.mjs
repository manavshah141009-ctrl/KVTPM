/**
 * Seed first admin: node scripts/seed-admin.mjs admin@example.com YourSecurePassword
 * Requires MONGODB_URI and loads .env from cwd if present (manual export otherwise).
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function loadEnvFile(path) {
  if (!existsSync(path)) return false;
  // Strip UTF-8 BOM if present (common on Windows).
  const raw = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.replace(/\r$/, "");
    if (!line || /^\s*#/.test(line)) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    // Handle hidden zero-width/BOM chars that sometimes sneak into keys.
    const key = line
      .slice(0, eq)
      .trim()
      .replace(/^[\u200B-\u200D\uFEFF]+/, "");

    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith("\"") && val.endsWith("\"")) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    // Only fill missing/blank values; avoid overriding an intentionally set env var.
    if (!process.env[key] || process.env[key].trim() === "") process.env[key] = val;
  }
  return true;
}

// Try cwd first, then project root based on this script's location.
const scriptDir = join(fileURLToPath(new URL(".", import.meta.url)));
const envCandidates = [
  join(process.cwd(), ".env"),
  join(scriptDir, "..", ".env"),
];

let loaded = false;
for (const p of envCandidates) {
  if (loadEnvFile(p)) {
    loaded = true;
    break;
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI");
  console.error("Tried .env locations:");
  for (const p of envCandidates) console.error(" -", p);
  console.error("Detected env keys containing 'MONGO':");
  for (const k of Object.keys(process.env).filter((k) => k.toUpperCase().includes("MONGO"))) {
    console.error(" -", k);
  }
  console.error("Tip: ensure your .env contains a line like:");
  console.error("MONGODB_URI=mongodb://USER:PASS@host1,host2,host3/yourDb?authSource=admin");
  process.exit(1);
}

const email = process.argv[2] || "admin@kv.local";
const password = process.argv[3] || "changeme123";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

await mongoose.connect(uri);
const hash = await bcrypt.hash(password, 12);
await Admin.findOneAndUpdate(
  { email: email.toLowerCase() },
  { email: email.toLowerCase(), passwordHash: hash },
  { upsert: true, new: true }
);
console.log("Admin upserted:", email);
await mongoose.disconnect();
