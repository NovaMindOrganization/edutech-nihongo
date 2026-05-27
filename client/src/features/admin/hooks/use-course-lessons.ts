import { useEffect, useState } from 'react';

import { getCourse, type CourseDetail } from '../services/adminApi';

export function useCourseLessons(courseId: string) {
  const [lessons, setLessons] = useState<CourseDetail['lessons']>([]);

  useEffect(() => {
    if (!courseId) {
      setLessons([]);
      return;
    }
    getCourse(courseId)
      .then((c) => setLessons(c.lessons))
      .catch(() => setLessons([]));
  }, [courseId]);

  return lessons;
}
