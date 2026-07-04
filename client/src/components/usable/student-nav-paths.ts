import { paths } from '@/router/paths';

/** Precise active-state matching for student nav (avoids /learn prefix false positives). */
export function studentNavPathMatches(pathname: string, to: string): boolean {
  if (to === paths.learn.hub) {
    return (
      pathname === to ||
      pathname.startsWith('/learn/courses') ||
      pathname.startsWith('/learn/lessons')
    );
  }

  if (to === paths.learn.kanjiHub) {
    return pathname === to;
  }

  if (to === paths.placementTest) {
    return pathname === paths.placementTest;
  }

  if (to === paths.student.notebook) {
    return pathname === paths.student.notebook || pathname.startsWith('/notebook/');
  }

  if (to === paths.student.jlptSim) {
    return pathname === paths.student.jlptSim || pathname.startsWith('/practice/');
  }

  if (to === paths.student.jlptHistory) {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  if (to === paths.student.mistakes) {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  if (to === paths.student.feedback) {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  if (to === paths.student.studySets) {
    return pathname === to || pathname.startsWith('/community/study-sets');
  }

  if (to === paths.student.communityCall) {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}
