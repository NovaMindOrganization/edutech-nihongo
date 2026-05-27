import { db } from '../config/db.js';
import { AppError } from '../utils/app-error.js';

export async function listPublishedCourses() {
  return db.course.findMany({
    where: { isPublished: true },
    orderBy: { jlptLevel: 'asc' },
    include: {
      lessons: { orderBy: { orderIndex: 'asc' }, select: { id: true, title: true, orderIndex: true, isBonus: true } },
    },
  });
}

export async function listAllCourses() {
  return db.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  });
}

export async function listAllCoursesWithLessons() {
  return db.course.findMany({
    orderBy: { jlptLevel: 'asc' },
    include: {
      lessons: { orderBy: { orderIndex: 'asc' }, select: { id: true, title: true, orderIndex: true, isBonus: true } },
    },
  });
}

export async function getCourse(id: string) {
  const course = await db.course.findUnique({
    where: { id },
    include: { lessons: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
  return course;
}

export async function createCourse(data: {
  title: string;
  jlptLevel: string;
  description?: string;
  isPublished?: boolean;
  createdById?: string;
}) {
  return db.course.create({ data });
}

export async function updateCourse(
  id: string,
  data: Partial<{ title: string; jlptLevel: string; description: string; isPublished: boolean }>,
) {
  await getCourse(id);
  return db.course.update({ where: { id }, data });
}

export async function deleteCourse(id: string) {
  await getCourse(id);
  await db.course.delete({ where: { id } });
}
