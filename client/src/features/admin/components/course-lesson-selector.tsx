import { useEffect, useState } from 'react';

import { listCoursesWithLessons, type CourseDetail } from '../services/adminApi';

type CourseWithLessons = Omit<CourseDetail, 'description' | 'isPublished' | '_count'>;

type Props = {
	value: string;
	onChange: (lessonId: string) => void;
	className?: string;
};

export function CourseLessonSelector({ value, onChange, className }: Props) {
	const [courses, setCourses] = useState<CourseWithLessons[]>([]);
	const [selectedCourseId, setSelectedCourseId] = useState('');
	const [mode, setMode] = useState<'course' | 'lesson'>('course');

	useEffect(() => {
		listCoursesWithLessons().then(setCourses).catch(() => {});
	}, []);

	useEffect(() => {
		if (!value) {
			setSelectedCourseId('');
			setMode('course');
			return;
		}
		const matched = courses.find((course) => course.lessons.some((lesson) => lesson.id === value));
		if (matched) {
			setSelectedCourseId(matched.id);
			setMode('lesson');
		}
	}, [courses, value]);

	const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;
	const lessons = selectedCourse?.lessons ?? [];

	function handleChange(nextValue: string) {
		if (nextValue === '') {
			onChange('');
			setMode('course');
			setSelectedCourseId('');
			return;
		}

		if (nextValue.startsWith('course:')) {
			const nextCourseId = nextValue.replace('course:', '');
			setSelectedCourseId(nextCourseId);
			setMode('lesson');
			onChange('');
			return;
		}

		if (nextValue === '__back__') {
			setMode('course');
			setSelectedCourseId('');
			onChange('');
			return;
		}

		onChange(nextValue);
	}

	return (
		<select value={mode === 'course' ? '' : value} onChange={(e) => handleChange(e.target.value)} className={className}>
			{mode === 'course' ? (
				<>
					<option value="">— Chọn khóa học —</option>
					{courses.map((course) => (
						<option key={course.id} value={`course:${course.id}`}>
							{course.title} ({course.jlptLevel})
						</option>
					))}
				</>
			) : (
				<>
					<option value="">— Chọn bài học —</option>
					<option value="__back__">← Chọn khóa học khác</option>
					{lessons.map((lesson) => (
						<option key={lesson.id} value={lesson.id}>
							#{lesson.orderIndex} {lesson.title}
						</option>
					))}
				</>
			)}
		</select>
	);
}
