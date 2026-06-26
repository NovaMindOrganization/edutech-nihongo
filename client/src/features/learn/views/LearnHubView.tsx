import { BookOpenCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { HubLinkCard, HubLinkCardTag } from '@/components/usable/hub-link-card';
import { PageShell } from '@/components/usable/page-shell';
import {
  CourseGridSkeleton,
  emptyStatePresets,
  ViewState,
} from '@/components/usable/states';
import { useAuthStore } from '@/features/auth';
import { getAccessToken } from '@/services/httpClient';
import { getDashboard } from '@/features/student/services/studentApi';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import { listPublicCourses, type PublicCourse } from '../services/learnApi';

const courseAccents = ['bg-tertiary', 'bg-secondary', 'bg-quaternary', 'bg-brand-soft'] as const;

type CourseProgress = {
  completed: number;
  total: number;
  percent: number;
};

function CourseSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm font-medium text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function CourseCard({
  course,
  index,
  enrolled,
  progress,
}: {
  course: PublicCourse;
  index: number;
  enrolled: boolean;
  progress?: CourseProgress;
}) {
  const description = enrolled && progress
    ? `${course.subtitle ?? course.jlptLevel} · ${progress.percent}% hoàn thành · ${course.lessons.length} bài`
    : `${course.subtitle ?? course.jlptLevel} · ${course.lessons.length} bài học`;

  return (
    <HubLinkCard
      to={paths.learn.course(course.id)}
      icon={enrolled ? BookOpenCheck : Sparkles}
      accent={courseAccents[index % courseAccents.length]}
      title={course.title}
      description={description}
      cta={enrolled ? 'Tiếp tục học' : 'Xem & ghi danh'}
      className={cn(enrolled && 'border-brand/35 ring-1 ring-brand/15')}
      tag={
        <HubLinkCardTag
          label={enrolled ? 'Đã ghi danh' : 'Chưa ghi danh'}
          variant={enrolled ? 'enrolled' : 'available'}
        />
      }
    />
  );
}

export function LearnHubView() {
  const user = useAuthStore((s) => s.user);
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const location = useLocation();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(() => new Set());
  const [progressByCourse, setProgressByCourse] = useState<Map<string, CourseProgress>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token && !sessionReady) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [courseList, dashboard] = await Promise.all([
          listPublicCourses(),
          user ? getDashboard().catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        setCourses(courseList);
        if (dashboard) {
          setEnrolledIds(new Set(dashboard.enrollments.map((e) => e.course.id)));
          setProgressByCourse(
            new Map(
              dashboard.progressChart.byCourse.map((c) => [
                c.courseId,
                { completed: c.completed, total: c.total, percent: c.percent },
              ]),
            ),
          );
        } else {
          setEnrolledIds(new Set());
          setProgressByCourse(new Map());
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Không tải được khóa học');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, location.key, sessionReady]);

  const { enrolledCourses, availableCourses, foundationCourses } = useMemo(() => {
    const enrolled: PublicCourse[] = [];
    const available: PublicCourse[] = [];
    const foundation: PublicCourse[] = [];
    for (const course of courses) {
      const isFoundation = course.jlptLevel === 'JPD1' || course.level === 'Beginner';
      if (isFoundation) foundation.push(course);
      if (enrolledIds.has(course.id)) enrolled.push(course);
      else available.push(course);
    }
    return {
      enrolledCourses: enrolled,
      availableCourses: available,
      foundationCourses: foundation,
    };
  }, [courses, enrolledIds]);

  const showEnrollmentSections = Boolean(user);

  return (
    <PageShell
      eyebrow="Học"
      title="Khóa học"
      description="Bắt đầu với JPD1 (nhập môn), sau đó tiếp tục N5, N4… Mỗi khóa có từ vựng, ngữ pháp, hội thoại và kanji."
      icon={Sparkles}
      iconClassName="bg-quaternary"
      tone="quaternary"
      chips={['JPD1', 'N5', 'N4', 'Flashcard · Quiz']}
      footer={
        user
          ? 'Khóa đã ghi danh hiển thị tiến độ — chọn khóa chưa ghi danh để xem lộ trình và đăng ký.'
          : 'Đăng nhập để ghi danh khóa học — bài bị khóa cho đến khi hoàn thành MiniTest bài trước.'
      }
    >
      <ViewState
        loading={loading}
        empty={!loading && courses.length === 0}
        loadingSkeleton={<CourseGridSkeleton count={6} />}
        loadingLabel="Đang tải khóa học…"
        {...emptyStatePresets.courses}
      >
        <div className="space-y-10">
          {foundationCourses.length > 0 ? (
            <CourseSection
              title="Nền tảng — JPD1"
              description="Khóa nhập môn cho sinh viên mới, đặt trước lộ trình JLPT N5."
            >
              {foundationCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  enrolled={enrolledIds.has(course.id)}
                  progress={progressByCourse.get(course.id)}
                />
              ))}
            </CourseSection>
          ) : null}

          {showEnrollmentSections ? (
            <>
              {enrolledCourses.length > 0 ? (
                <CourseSection
                  title="Khóa đã ghi danh"
                  description="Tiếp tục lộ trình học và theo dõi tiến độ từng bài."
                >
                  {enrolledCourses.map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={index}
                      enrolled
                      progress={progressByCourse.get(course.id)}
                    />
                  ))}
                </CourseSection>
              ) : (
                <CourseSection
                  title="Khóa đã ghi danh"
                  description="Bạn chưa ghi danh khóa nào — chọn một khóa bên dưới để bắt đầu."
                >
                  <p className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm font-medium text-muted-foreground">
                    Chưa có khóa học đang theo.
                  </p>
                </CourseSection>
              )}

              {availableCourses.length > 0 ? (
                <CourseSection
                  title="Khóa chưa ghi danh"
                  description="Xem lộ trình và ghi danh để mở bài học đầu tiên."
                >
                  {availableCourses.map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={index}
                      enrolled={false}
                    />
                  ))}
                </CourseSection>
              ) : null}
            </>
          ) : (
            <CourseSection title="Tất cả khóa học" description="Đăng nhập để ghi danh và lưu tiến độ.">
              {courses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} enrolled={false} />
              ))}
            </CourseSection>
          )}
        </div>
      </ViewState>
    </PageShell>
  );
}
