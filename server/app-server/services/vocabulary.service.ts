import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export type VocabInput = {
  word: string;
  reading?: string;
  meaning: string;
  meaningEn?: string;
  jlptLevel: string;
  topic?: string;
  partOfSpeech?: string;
  courseId?: string;
  lessonId?: string;
};

async function resolveCourseLesson(data: { courseId?: string; lessonId?: string }) {
  if (!data.lessonId) {
    return { courseId: data.courseId ?? null, lessonId: null };
  }
  const lesson = await db.lesson.findUnique({
    where: { id: data.lessonId },
    select: { id: true, courseId: true },
  });
  if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
  if (data.courseId && data.courseId !== lesson.courseId) {
    throw new AppError('Lesson does not belong to course', 422, 'VALIDATION_ERROR');
  }
  return { courseId: lesson.courseId, lessonId: lesson.id };
}

export async function listVocabulary(params: {
  jlptLevel?: string;
  topic?: string;
  courseId?: string;
  lessonId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const search = params.search?.trim();
  const where = {
    ...(params.jlptLevel ? { jlptLevel: params.jlptLevel } : {}),
    ...(params.topic ? { topic: params.topic } : {}),
    ...(params.courseId ? { courseId: params.courseId } : {}),
    ...(params.lessonId ? { lessonId: params.lessonId } : {}),
    ...(search
      ? {
          OR: [
            { word: { contains: search, mode: 'insensitive' as const } },
            { reading: { contains: search, mode: 'insensitive' as const } },
            { meaning: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.vocabulary.findMany({
      where,
      orderBy: [{ lessonId: 'asc' }, { word: 'asc' }],
      skip,
      take: limit,
      include: {
        course: { select: { id: true, title: true, jlptLevel: true } },
        lesson: { select: { id: true, title: true, orderIndex: true } },
      },
    }),
    db.vocabulary.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getVocabulary(id: string) {
  const item = await db.vocabulary.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, jlptLevel: true } },
      lesson: { select: { id: true, title: true, orderIndex: true } },
    },
  });
  if (!item) throw new AppError('Vocabulary not found', 404, 'NOT_FOUND');
  return item;
}

export async function createVocabulary(data: VocabInput, createdById?: string) {
  const placement = await resolveCourseLesson(data);
  return db.vocabulary.create({
    data: {
      word: data.word,
      reading: data.reading,
      meaning: data.meaning,
      meaningEn: data.meaningEn,
      jlptLevel: data.jlptLevel,
      topic: data.topic,
      partOfSpeech: data.partOfSpeech,
      courseId: placement.courseId,
      lessonId: placement.lessonId,
      createdById,
    },
    include: {
      course: { select: { id: true, title: true, jlptLevel: true } },
      lesson: { select: { id: true, title: true, orderIndex: true } },
    },
  });
}

export async function updateVocabulary(id: string, data: Partial<VocabInput>) {
  await getVocabulary(id);
  const placement =
    data.lessonId !== undefined || data.courseId !== undefined
      ? await resolveCourseLesson({
          courseId: data.courseId,
          lessonId: data.lessonId ?? undefined,
        })
      : null;

  return db.vocabulary.update({
    where: { id },
    data: {
      ...(data.word != null ? { word: data.word } : {}),
      ...(data.reading !== undefined ? { reading: data.reading } : {}),
      ...(data.meaning != null ? { meaning: data.meaning } : {}),
      ...(data.meaningEn !== undefined ? { meaningEn: data.meaningEn } : {}),
      ...(data.jlptLevel != null ? { jlptLevel: data.jlptLevel } : {}),
      ...(data.topic !== undefined ? { topic: data.topic } : {}),
      ...(data.partOfSpeech !== undefined ? { partOfSpeech: data.partOfSpeech } : {}),
      ...(placement
        ? { courseId: placement.courseId, lessonId: placement.lessonId }
        : {}),
    },
    include: {
      course: { select: { id: true, title: true, jlptLevel: true } },
      lesson: { select: { id: true, title: true, orderIndex: true } },
    },
  });
}

export async function deleteVocabulary(id: string) {
  await getVocabulary(id);
  await db.lessonVocabulary.deleteMany({ where: { vocabularyId: id } });
  await db.vocabulary.delete({ where: { id } });
}
