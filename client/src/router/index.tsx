import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import {
  AdminDashboardView,
  ConfigAdminView,
  ConversationsAdminView,
  CourseLessonsAdminView,
  CoursesAdminView,
  KanjiAdminView,
  LessonDetailAdminView,
  GrammarAdminView,
  QuestionsAdminView,
  StudySetAdminDetailView,
  StudySetsAdminView,
  UsersAdminView,
  VocabularyAdminView,
  RadicalsAdminView,
} from "@/features/admin";
import { RedirectIfAuthenticated } from "@/features/auth/components/redirect-if-authenticated";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { LoginView, RegisterView } from "@/features/auth";
import {
  CourseDetailView,
  KanjiCourseView,
  KanjiHandbookView,
  KanjiHubView,
  LearnHubView,
  LessonDialogueView,
  LessonGrammarView,
  LessonKanjiView,
  LessonVocabularyView,
  LessonShellView,
  LessonSpeakingView,
} from "@/features/learn";
import { PlacementTestView } from "@/features/placement";
import {
  AiSpeakingView,
  CommunityCallView,
  CommunityHubView,
  DashboardView,
  JlptSimView,
  MiniTestView,
  OcrView,
  PracticeHubView,
  ReviewByTypeView,
  ReviewHubView,
  StudySetCreateView,
  StudySetDetailView,
  StudySetsView,
} from "@/features/student";
import { AdminLayout } from "@/layouts/admin-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { LearnLayout } from "@/layouts/learn-layout";
import { HomePage } from "@/pages/HomePage";

import { paths } from "./paths";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />

        <Route element={<AuthLayout />}>
          <Route element={<RedirectIfAuthenticated />}>
            <Route path={paths.login} element={<LoginView />} />
            <Route path={paths.register} element={<RegisterView />} />
          </Route>
        </Route>

        <Route element={<LearnLayout />}>
          <Route path={paths.learn.hub} element={<LearnHubView />} />

          <Route element={<RequireAuth />}>
            <Route path={paths.placementTest} element={<PlacementTestView />} />

            <Route path={paths.student.dashboard} element={<DashboardView />} />
            <Route path={paths.student.review} element={<ReviewHubView />} />
            <Route
              path={paths.student.reviewKanji}
              element={<ReviewByTypeView type="kanji" />}
            />
            <Route
              path={paths.student.reviewVocabulary}
              element={<ReviewByTypeView type="vocabulary" />}
            />
            <Route
              path={paths.student.reviewGrammar}
              element={<ReviewByTypeView type="grammar" />}
            />
            <Route
              path={paths.student.aiSpeaking}
              element={<AiSpeakingView />}
            />
            <Route
              path={paths.student.practice}
              element={<PracticeHubView />}
            />
            <Route path={paths.student.jlptSim} element={<JlptSimView />} />
            <Route path={paths.student.ocr} element={<OcrView />} />
            <Route
              path={paths.student.community}
              element={<CommunityHubView />}
            />
            <Route path={paths.student.studySets} element={<StudySetsView />} />
            <Route
              path={paths.student.studySetCreate}
              element={<StudySetCreateView />}
            />
            <Route
              path="/community/study-sets/:id/edit"
              element={<StudySetCreateView />}
            />
            <Route
              path="/community/study-sets/:id"
              element={<StudySetDetailView />}
            />
            <Route
              path={paths.student.communityCall}
              element={<CommunityCallView />}
            />
            <Route
              path={paths.student.notebook}
              element={<Navigate to={paths.learn.kanjiHandbook} replace />}
            />

            <Route path={paths.learn.kanjiHub} element={<KanjiHubView />} />
            <Route
              path="/learn/kanji/course/:courseId"
              element={<KanjiCourseView />}
            />
            <Route
              path={paths.learn.kanjiHandbook}
              element={<KanjiHandbookView />}
            />
            <Route
              path="/learn/courses/:courseId"
              element={<CourseDetailView />}
            />
            <Route
              path="/learn/lessons/:lessonId"
              element={<LessonShellView />}
            >
              <Route index element={<Navigate to="grammar" replace />} />
              <Route path="speaking" element={<LessonSpeakingView />} />
              <Route path="vocabulary" element={<LessonVocabularyView />} />
              <Route path="grammar" element={<LessonGrammarView />} />
              <Route path="dialogue" element={<LessonDialogueView />} />
              <Route path="kanji" element={<LessonKanjiView />} />
            </Route>
            <Route
              path="/learn/lessons/:lessonId/mini-test"
              element={<MiniTestView />}
            />
          </Route>
        </Route>

        <Route path={paths.admin.dashboard} element={<AdminLayout />}>
          <Route index element={<AdminDashboardView />} />
          <Route path="kanji" element={<KanjiAdminView />} />
          <Route path="radicals" element={<RadicalsAdminView />} />
          <Route path="vocabulary" element={<VocabularyAdminView />} />
          <Route path="grammar" element={<GrammarAdminView />} />
          <Route path="courses" element={<CoursesAdminView />} />
          <Route
            path="courses/:courseId"
            element={<CourseLessonsAdminView />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId"
            element={<LessonDetailAdminView />}
          />
          <Route path="conversations" element={<ConversationsAdminView />} />
          <Route path="questions" element={<QuestionsAdminView />} />
          <Route path="study-sets" element={<StudySetsAdminView />} />
          <Route path="study-sets/:id" element={<StudySetAdminDetailView />} />
          <Route path="users" element={<UsersAdminView />} />
          <Route path="config" element={<ConfigAdminView />} />
        </Route>

        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
