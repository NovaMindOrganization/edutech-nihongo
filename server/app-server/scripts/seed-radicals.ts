import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSVRow(str: string) {
  const arr = [];
  let quote = false;
  let curr = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') {
      quote = !quote;
    } else if (char === ',' && !quote) {
      arr.push(curr);
      curr = '';
    } else {
      curr += char;
    }
  }
  arr.push(curr);
  return arr;
}

async function main() {
  const filePath = path.join(__dirname, '../data/214 Bộ Thủ Hán Tự Đầy Đủ.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  // Bỏ qua dòng đầu tiên (header)
  const dataLines = lines.slice(1);

  // Clear before seed
  await prisma.radical.deleteMany({});
  console.log('Cleared existing radicals');

  const radicals = [];
  for (const line of dataLines) {
    const cols = parseCSVRow(line.trim());
    if (cols.length < 5) continue;

    const radicalIdStr = cols[0];
    const character = cols[1];
    const sinoVietnamese = cols[2];
    const meaning = cols[3];
    const strokeCount = parseInt(cols[4], 10);

    const radicalIndexMatch = radicalIdStr.match(/\d+/);
    if (!radicalIndexMatch) continue;
    
    const radicalIndex = parseInt(radicalIndexMatch[0], 10);

    radicals.push({
      radicalIndex,
      character,
      sinoVietnamese,
      meaning,
      strokeCount
    });
  }

  await prisma.radical.createMany({
    data: radicals
  });

  console.log(`Seeded ${radicals.length} radicals successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
