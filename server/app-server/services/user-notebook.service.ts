import { MasteryItemType } from '@prisma/client';

import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';
import type { NotebookContentType } from './notebook-content.service.js';

const KANJI_SELECT = {
  id: true,
  character: true,
  hanVietPronunciation: true,
  meaning: true,
  readingsOn: true,
  readingsKun: true,
  jlptLevel: true,
} as const;

const DEFAULT_NOTEBOOK_TITLE = 'Sưu tập của tôi';

async function assertNotebookOwner(userId: string, notebookId: string) {
  const notebook = await db.userNotebook.findFirst({
    where: { id: notebookId, userId },
  });
  if (!notebook) {
    throw new AppError('Không tìm thấy sổ tay', 404, 'NOT_FOUND');
  }
  return notebook;
}

async function migrateLegacyFavorites(userId: string, notebookId: string) {
  const existing = await db.userNotebookItem.count({ where: { notebookId } });
  if (existing > 0) return;

  const mastery = await db.userMasteryItem.findMany({
    where: {
      userId,
      OR: [{ isFavorite: true }, { note: { not: null } }],
    },
  });

  if (mastery.length === 0) return;

  await db.userNotebookItem.createMany({
    data: mastery.map((m, index) => ({
      notebookId,
      itemId: m.itemId,
      itemType: m.itemType,
      note: m.note?.trim() || null,
      orderIndex: index,
    })),
    skipDuplicates: true,
  });
}

export async function ensureDefaultNotebook(userId: string) {
  let notebook = await db.userNotebook.findFirst({
    where: { userId, isDefault: true },
    orderBy: { sortOrder: 'asc' },
  });

  if (!notebook) {
    const count = await db.userNotebook.count({ where: { userId } });
    if (count === 0) {
      notebook = await db.userNotebook.create({
        data: {
          userId,
          title: DEFAULT_NOTEBOOK_TITLE,
          description: 'Ghi chú cách học, mẹo nhớ từng mục — thêm từ bài học hoặc OCR.',
          isDefault: true,
          sortOrder: 0,
        },
      });
      await migrateLegacyFavorites(userId, notebook.id);
      return notebook;
    }

    notebook = await db.userNotebook.findFirst({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (notebook) {
      await db.userNotebook.update({
        where: { id: notebook.id },
        data: { isDefault: true },
      });
    }
  }

  if (notebook) {
    await migrateLegacyFavorites(userId, notebook.id);
  }

  return notebook!;
}

export async function listNotebooks(userId: string) {
  await ensureDefaultNotebook(userId);

  const notebooks = await db.userNotebook.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      _count: { select: { items: true } },
    },
  });

  return {
    notebooks: notebooks.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      isDefault: n.isDefault,
      itemCount: n._count.items,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
  };
}

export async function createNotebook(
  userId: string,
  data: { title: string; description?: string },
) {
  const title = data.title.trim();
  if (!title) {
    throw new AppError('Tên sổ tay không được để trống', 422, 'VALIDATION_ERROR');
  }

  const maxOrder = await db.userNotebook.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });

  const notebook = await db.userNotebook.create({
    data: {
      userId,
      title,
      description: data.description?.trim() || null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return { notebook };
}

export async function updateNotebook(
  userId: string,
  notebookId: string,
  data: { title?: string; description?: string | null },
) {
  await assertNotebookOwner(userId, notebookId);

  const title = data.title?.trim();
  if (title !== undefined && !title) {
    throw new AppError('Tên sổ tay không được để trống', 422, 'VALIDATION_ERROR');
  }

  const notebook = await db.userNotebook.update({
    where: { id: notebookId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
    },
  });

  return { notebook };
}

export async function deleteNotebook(userId: string, notebookId: string) {
  const notebook = await assertNotebookOwner(userId, notebookId);

  const total = await db.userNotebook.count({ where: { userId } });
  if (total <= 1) {
    throw new AppError('Cần giữ ít nhất một sổ tay', 422, 'VALIDATION_ERROR');
  }

  await db.userNotebook.delete({ where: { id: notebookId } });

  if (notebook.isDefault) {
    const next = await db.userNotebook.findFirst({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (next) {
      await db.userNotebook.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return { deleted: true };
}

export async function listNotebookContent(
  userId: string,
  notebookId: string,
  type: NotebookContentType,
  params: { level?: string } = {},
) {
  await assertNotebookOwner(userId, notebookId);

  const entries = await db.userNotebookItem.findMany({
    where: { notebookId, itemType: type as MasteryItemType },
    orderBy: [{ orderIndex: 'asc' }, { addedAt: 'asc' }],
  });

  if (entries.length === 0) {
    return { items: [] as unknown[], levels: [] as string[] };
  }

  const itemIds = entries.map((e) => e.itemId);
  const entryMap = new Map(entries.map((e) => [e.itemId, e]));

  if (type === 'kanji') {
    const kanji = await db.kanji.findMany({
      where: {
        id: { in: itemIds },
        ...(params.level ? { jlptLevel: params.level } : {}),
      },
      select: KANJI_SELECT,
    });
    const mastery = await db.userMasteryItem.findMany({
      where: { userId, itemType: MasteryItemType.kanji, itemId: { in: itemIds } },
    });
    const learnedSet = new Set(
      mastery.filter((m) => m.isLearned).map((m) => m.itemId),
    );

    const items = kanji
      .map((k) => {
        const entry = entryMap.get(k.id)!;
        return {
          entryId: entry.id,
          id: k.id,
          kanji: k,
          note: entry.note,
          lessonId: entry.lessonId,
          addedAt: entry.addedAt,
          isLearned: learnedSet.has(k.id),
        };
      })
      .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());

    const levels = [...new Set(kanji.map((k) => k.jlptLevel))].sort();
    return { items, levels };
  }

  if (type === 'vocabulary') {
    const vocab = await db.vocabulary.findMany({
      where: {
        id: { in: itemIds },
        ...(params.level ? { jlptLevel: params.level } : {}),
      },
    });
    const mastery = await db.userMasteryItem.findMany({
      where: { userId, itemType: MasteryItemType.vocabulary, itemId: { in: itemIds } },
    });
    const learnedSet = new Set(
      mastery.filter((m) => m.isLearned).map((m) => m.itemId),
    );

    const items = vocab
      .map((v) => {
        const entry = entryMap.get(v.id)!;
        return {
          entryId: entry.id,
          id: v.id,
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          jlptLevel: v.jlptLevel,
          note: entry.note,
          lessonId: entry.lessonId,
          addedAt: entry.addedAt,
          isLearned: learnedSet.has(v.id),
        };
      })
      .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());

    const levels = [...new Set(vocab.map((v) => v.jlptLevel))].sort();
    return { items, levels };
  }

  const grammar = await db.grammar.findMany({
    where: {
      id: { in: itemIds },
      ...(params.level ? { jlpt: params.level } : {}),
    },
  });
  const mastery = await db.userMasteryItem.findMany({
    where: { userId, itemType: MasteryItemType.grammar, itemId: { in: itemIds } },
  });
  const learnedSet = new Set(mastery.filter((m) => m.isLearned).map((m) => m.itemId));

  const items = grammar
    .map((g) => {
      const entry = entryMap.get(g.id)!;
      return {
        entryId: entry.id,
        id: g.id,
        pattern: g.pattern,
        meaningVi: g.meaningVi,
        title: g.title,
        jlpt: g.jlpt,
        note: entry.note,
        lessonId: entry.lessonId,
        addedAt: entry.addedAt,
        isLearned: learnedSet.has(g.id),
      };
    })
    .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());

  const levels = [...new Set(grammar.map((g) => g.jlpt).filter(Boolean))].sort();
  return { items, levels };
}

export async function addNotebookItem(
  userId: string,
  notebookId: string,
  data: {
    itemId: string;
    itemType: NotebookContentType;
    note?: string;
    lessonId?: string;
  },
) {
  await assertNotebookOwner(userId, notebookId);

  const itemType = data.itemType as MasteryItemType;
  const exists = await db.userNotebookItem.findUnique({
    where: {
      notebookId_itemId_itemType: {
        notebookId,
        itemId: data.itemId,
        itemType,
      },
    },
  });

  if (exists) {
    const updated = await db.userNotebookItem.update({
      where: { id: exists.id },
      data: {
        ...(data.note !== undefined ? { note: data.note.trim() || null } : {}),
        ...(data.lessonId ? { lessonId: data.lessonId } : {}),
      },
    });
    return { item: updated, created: false };
  }

  const maxOrder = await db.userNotebookItem.aggregate({
    where: { notebookId, itemType },
    _max: { orderIndex: true },
  });

  const item = await db.userNotebookItem.create({
    data: {
      notebookId,
      itemId: data.itemId,
      itemType,
      note: data.note?.trim() || null,
      lessonId: data.lessonId ?? null,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
    },
  });

  return { item, created: true };
}

export async function updateNotebookItemNote(
  userId: string,
  notebookId: string,
  entryId: string,
  note: string | null,
) {
  await assertNotebookOwner(userId, notebookId);

  const entry = await db.userNotebookItem.findFirst({
    where: { id: entryId, notebookId },
  });
  if (!entry) {
    throw new AppError('Không tìm thấy mục trong sổ tay', 404, 'NOT_FOUND');
  }

  const updated = await db.userNotebookItem.update({
    where: { id: entryId },
    data: { note: note?.trim() || null },
  });

  return { item: updated };
}

export async function removeNotebookItem(
  userId: string,
  notebookId: string,
  data: { itemId: string; itemType: NotebookContentType },
) {
  await assertNotebookOwner(userId, notebookId);

  await db.userNotebookItem.deleteMany({
    where: {
      notebookId,
      itemId: data.itemId,
      itemType: data.itemType as MasteryItemType,
    },
  });

  return { removed: true };
}

export async function getItemNotebookIds(
  userId: string,
  data: { itemId: string; itemType: NotebookContentType },
) {
  const rows = await db.userNotebookItem.findMany({
    where: {
      itemId: data.itemId,
      itemType: data.itemType as MasteryItemType,
      notebook: { userId },
    },
    select: { notebookId: true },
  });

  return { notebookIds: rows.map((r) => r.notebookId) };
}

export async function flashcardFromNotebook(
  userId: string,
  notebookId: string,
  type: NotebookContentType,
  count: number,
  itemIds?: string[],
) {
  const { items } = await listNotebookContent(userId, notebookId, type);
  let pool = items as Array<{ id: string }>;
  if (itemIds?.length) {
    const pick = new Set(itemIds);
    pool = pool.filter((i) => pick.has(i.id));
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

  if (type === 'kanji') {
    const kanji = await db.kanji.findMany({
      where: { id: { in: shuffled.map((i) => i.id) } },
    });
    const map = new Map(kanji.map((k) => [k.id, k]));
    return shuffled
      .map((i) => map.get(i.id))
      .filter(Boolean)
      .map((k) => ({
        id: k!.id,
        itemType: 'kanji' as const,
        front: k!.character,
        back: k!.meaning,
        reading: k!.readingsKun[0] ?? k!.readingsOn[0],
      }));
  }

  if (type === 'vocabulary') {
    const vocab = await db.vocabulary.findMany({
      where: { id: { in: shuffled.map((i) => i.id) } },
    });
    const map = new Map(vocab.map((v) => [v.id, v]));
    return shuffled
      .map((i) => map.get(i.id))
      .filter(Boolean)
      .map((v) => ({
        id: v!.id,
        itemType: 'vocabulary' as const,
        front: v!.word,
        back: v!.meaning,
        reading: v!.reading ?? undefined,
      }));
  }

  const grammar = await db.grammar.findMany({
    where: { id: { in: shuffled.map((i) => i.id) } },
  });
  const map = new Map(grammar.map((g) => [g.id, g]));
  return shuffled
    .map((i) => map.get(i.id))
    .filter(Boolean)
    .map((g) => ({
      id: g!.id,
      itemType: 'grammar' as const,
      front: g!.pattern,
      back: g!.meaningVi,
    }));
}
