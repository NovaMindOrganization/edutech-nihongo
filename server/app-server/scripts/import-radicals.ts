import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  loadEnvFile(join(__dirname, "../.env"));
} catch {
  // The deployment environment may provide DATABASE_URL directly.
}
const db = new PrismaClient();

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }

  result.push(current);
  return result;
}

function loadCsv(path: string): Record<string, string>[] {
  const raw = readFileSync(path, "utf-8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, (cols[index] ?? "").trim()]),
    );
  });
}

function parseRadicalIndex(row: Record<string, string>) {
  const fromId = row.RadicalID?.match(/\d+/)?.[0];
  const raw = fromId ?? row.RadicalIndex ?? row.radicalIndex ?? "";
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 1 || index > 214) {
    throw new Error(`Invalid RadicalID/radicalIndex: ${row.RadicalID ?? raw}`);
  }
  return index;
}

async function main() {
  const csvPath = join(__dirname, "../data/214 Bộ Thủ Hán Tự Đầy Đủ.csv");
  const rows = loadCsv(csvPath);

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const radicalIndex = parseRadicalIndex(row);
    const data = {
      radicalIndex,
      character: row.Character,
      sinoVietnamese: row.SinoVietnamese,
      meaning: row.Meaning,
      strokeCount: Number(row.StrokeCount),
    };

    if (!data.character || !data.sinoVietnamese || !data.meaning) {
      throw new Error(`Missing required data for radical ${radicalIndex}`);
    }
    if (!Number.isInteger(data.strokeCount) || data.strokeCount < 1) {
      throw new Error(`Invalid StrokeCount for radical ${radicalIndex}`);
    }

    const existing = await db.radical.findFirst({
      where: { radicalIndex },
      select: { id: true },
    });

    if (existing) {
      await db.radical.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await db.radical.create({ data });
      created++;
    }
  }

  const total = await db.radical.count();
  console.log(
    `[radicals] Imported ${rows.length} rows. Created: ${created}, updated: ${updated}, total in DB: ${total}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
