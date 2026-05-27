import { db } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

export type KanjiInput = {
  character: string;
  hanVietPronunciation?: string;
  meaning: string;
  memoryTip?: string;
  memoryImageUrl?: string;
  jlptLevel: string;
  readingsOn?: string[];
  readingsKun?: string[];
  strokeCount?: number;
  radical?: string;
  examples?: Array<{ word: string; reading?: string; meaning: string }>;
};

const KANJI_BUCKET = "kanji";

function normalizeMemoryImageReference(value?: string) {
  if (!value) return value;

  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf(KANJI_BUCKET);
    if (bucketIndex >= 0 && segments[bucketIndex + 1]) {
      return [KANJI_BUCKET, ...segments.slice(bucketIndex + 1).map(decodeURIComponent)].join("/");
    }
  } catch {
    // Already a storage path such as kanji/memory/<id>.png.
  }

  return value;
}

function normalizeKanjiInput<T extends Partial<KanjiInput>>(data: T): T {
  if (data.memoryImageUrl === undefined) return data;
  return {
    ...data,
    memoryImageUrl: normalizeMemoryImageReference(data.memoryImageUrl),
  };
}

export async function ensureKanjiExists(id: string) {
  const row = await db.kanji.findUnique({ where: { id }, select: { id: true } });
  if (!row) throw new AppError("Kanji not found", 404, "NOT_FOUND");
  return row;
}

function kanjiInclude() {
  return {
    examples: {
      orderBy: { orderIndex: "asc" as const },
    },
  };
}

export async function listKanji(params: {
  jlptLevel?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const where = {
    ...(params.jlptLevel ? { jlptLevel: params.jlptLevel } : {}),
    ...(params.search
      ? {
          OR: [
            {
              character: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              meaning: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              hanVietPronunciation: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              memoryTip: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              examples: {
                some: {
                  word: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              examples: {
                some: {
                  meaning: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.kanji.findMany({
      where,
      include: kanjiInclude(),
      orderBy: { character: "asc" },
      skip,
      take: limit,
    }),
    db.kanji.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getKanji(id: string) {
  const item = await db.kanji.findUnique({
    where: { id },
    include: kanjiInclude(),
  });
  if (!item) throw new AppError("Kanji not found", 404, "NOT_FOUND");
  return item;
}

export async function createKanji(data: KanjiInput, createdById?: string) {
  const { examples, ...rest } = normalizeKanjiInput(data);
  return db.$transaction(async (tx) => {
    const item = await tx.kanji.create({
      data: {
        ...rest,
        ...(createdById ? { createdBy: { connect: { id: createdById } } } : {}),
      },
    });
    if (examples?.length) {
      await tx.kanjiExample.createMany({
        data: examples.map((example, index) => ({
          kanjiId: item.id,
          orderIndex: index,
          word: example.word,
          reading: example.reading || null,
          meaning: example.meaning,
        })),
      });
    }
    return tx.kanji.findUniqueOrThrow({
      where: { id: item.id },
      include: kanjiInclude(),
    });
  });
}

export async function updateKanji(id: string, data: Partial<KanjiInput>) {
  const { examples, ...rest } = normalizeKanjiInput(data);
  return db.$transaction(async (tx) => {
    await tx.kanji.findUniqueOrThrow({ where: { id } });
    await tx.kanji.update({ where: { id }, data: rest });
    if (examples !== undefined) {
      await tx.kanjiExample.deleteMany({ where: { kanjiId: id } });
      if (examples.length > 0) {
        await tx.kanjiExample.createMany({
          data: examples.map((example, index) => ({
            kanjiId: id,
            orderIndex: index,
            word: example.word,
            reading: example.reading || null,
            meaning: example.meaning,
          })),
        });
      }
    }
    return tx.kanji.findUniqueOrThrow({
      where: { id },
      include: kanjiInclude(),
    });
  });
}

export async function deleteKanji(id: string) {
  await getKanji(id);
  await db.kanji.delete({ where: { id } });
}
