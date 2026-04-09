import { readFile } from "node:fs/promises";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

function reviveDates(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(reviveDates);
  if (typeof obj !== "object") return obj;

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (
      (k === "timestamp" || k === "exportTime" || k === "exportedAt") &&
      typeof v === "string"
    ) {
      out[k] = new Date(v);
      continue;
    }
    out[k] = reviveDates(v);
  }
  return out;
}

const filePath = process.argv[2];
if (!filePath) {
  console.error(
    "Usage: npm run import:dexie -- <path-to-dexie-export.json>\n" +
      "Example: npm run import:dexie -- ./dexie-export-2026-02-09.json"
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const raw = await readFile(filePath, "utf8");
const parsed = reviveDates(JSON.parse(raw));

if (!parsed?.erpSnapshots || !parsed?.countSessions) {
  console.error("Invalid export payload: expected { erpSnapshots, countSessions }");
  process.exit(1);
}

console.log(
  `Importing ${parsed.erpSnapshots.length} snapshots and ${parsed.countSessions.length} sessions from ${filePath}...`
);

await prisma.$transaction(async (tx) => {
  for (const s of parsed.erpSnapshots) {
    await tx.erpSnapshot.upsert({
      where: { id: s.id },
      update: {
        timestamp: s.timestamp,
        exportTime: s.exportTime,
        data: s.data,
      },
      create: {
        id: s.id,
        timestamp: s.timestamp,
        exportTime: s.exportTime,
        data: s.data,
      },
    });
  }

  for (const cs of parsed.countSessions) {
    await tx.physicalCountSession.upsert({
      where: { id: cs.id },
      update: {
        timestamp: cs.timestamp,
        sessionType: cs.sessionType,
        status: cs.status,
        zones: cs.physicalCounts ?? [], // Map and handle field renaming
        counterName: cs.counterName ?? null,
        notes: cs.notes ?? null,
      },
      create: {
        id: cs.id,
        timestamp: cs.timestamp,
        sessionType: cs.sessionType,
        status: cs.status,
        zones: cs.physicalCounts ?? [],
        counterName: cs.counterName ?? null,
        notes: cs.notes ?? null,
      },
    });
  }
});

await prisma.$disconnect();
console.log("Done.");

