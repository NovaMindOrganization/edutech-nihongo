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
  MockExamsAdminView,
  MockExamDetailAdminView,
  StudySetAdminDetailView,
  StudySetsAdminView,
  UsersAdminView,
  VocabularyAdminView,
  RadicalsAdminView,
  PricingAdminView,
  ReportsAdminView,
  AnalyticsAdminView,
} from "@/features/admin";
import { RedirectIfAuthenticated } from "@/features/auth/components/redirect-if-authenticated";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { ForgotPasswordView, LoginView, RegisterView, ResetPasswordView } from "@/features/auth";
import {
  CourseDetailView,
  KanjiCourseView,
  KanjiHubView,
  LearnHubView,
  LessonDialogueView,
  LessonGrammarView,
  LessonOverviewView,
  LessonKanjiView,
  LessonPreviewView,
  LessonVocabularyView,
  VocabularyFlashcardView,
  LessonShellView,
  LessonSpeakingView,
} from "@/features/learn";
import { DictionaryView } from "@/features/dictionary";
import { PlacementTestView } from "@/features/placement";
import {
  AiSpeakingView,
  CommunityCallView,
  DashboardView,
  JlptSimView,
  JlptExamView,
  MiniTestView,
  OcrView,
  PracticeHubView,
  StudySetCreateView,
  StudySetDetailView,
  StudySetsView,
  KanaQuizView,
  JlptHistoryView,
  MistakesReviewView,
} from "@/features/student";
import { AdminLayout } from "@/layouts/admin-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { ExamLayout } from "@/layouts/exam-layout";
import { LearnLayout } from "@/layouts/learn-layout";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { HomePage } from "@/pages/HomePage";
import { PricingPage } from "@/pages/PricingPage";

import { NotebookHubView, NotebookPoolRedirectView, NotebookShellView } from "@/features/student/notebook";

import { paths } from "./paths";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.pricing} element={<PricingPage />} />
        <Route path={paths.dictionary} element={<DictionaryView />} />

        <Route element={<AuthLayout />}>
          <Route element={<RedirectIfAuthenticated />}>
            <Route path={paths.login} element={<LoginView />} />
            <Route path={paths.register} element={<RegisterView />} />
            <Route path={paths.forgotPassword} element={<ForgotPasswordView />} />
            <Route path={paths.resetPassword} element={<ResetPasswordView />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<ExamLayout />}>
            <Route path="/practice/jlpt/:examId" element={<JlptExamView />} />
          </Route>
        </Route>

        <Route element={<LearnLayout />}>
          <Route path={paths.learn.hub} element={<LearnHubView />} />
          <Route path={paths.placementTest} element={<PlacementTestView />} />
          <Route path="/learn/courses/:courseId" element={<CourseDetailView />} />
          <Route
            path="/learn/lessons/:lessonId/preview"
            element={<LessonPreviewView />}
          />

          <Route element={<RequireAuth />}>
            <Route path="/checkout/:orderId" element={<CheckoutPage />} />

            <Route path={paths.student.dashboard} element={<DashboardView />} />
            <Route
              path={paths.student.review}
              element={<Navigate to={paths.student.notebook} replace />}
            />
            <Route
              path={paths.student.reviewKanji}
              element={<Navigate to={paths.student.notebookLearned("kanji")} replace />}
            />
            <Route
              path={paths.student.reviewVocabulary}
              element={<Navigate to={paths.student.notebookLearned("vocabulary")} replace />}
            />
            <Route
              path={paths.student.reviewGrammar}
              element={<Navigate to={paths.student.notebookLearned("grammar")} replace />}
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
            <Route path={paths.student.jlptHistory} element={<JlptHistoryView />} />
            <Route path={paths.student.mistakes} element={<MistakesReviewView />} />
            <Route
              path={paths.student.community}
              element={<Navigate to={paths.student.studySets} replace />}
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
            <Route path={paths.student.notebook} element={<NotebookHubView />} />
            <Route path="/notebook/:pool/:type" element={<NotebookShellView />} />
            <Route path="/notebook/:pool" element={<NotebookPoolRedirectView />} />

            <Route path={paths.learn.kanjiHub} element={<KanjiHubView />} />
            <Route
              path="/learn/kanji/course/:courseId"
              element={<KanjiCourseView />}
            />
            <Route
              path={paths.learn.kanjiHandbook}
              element={
                <Navigate to={paths.student.notebookCollected("kanji")} replace />
              }
            />
            <Route path={paths.learn.kanaQuiz} element={<KanaQuizView />} />
            <Route
              path="/learn/lessons/:lessonId"
              element={<LessonShellView />}
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<LessonOverviewView />} />
              <Route path="speaking" element={<LessonSpeakingView />} />
              <Route path="vocabulary" element={<LessonVocabularyView />} />
              <Route
                path="vocabulary/flashcards"
                element={<VocabularyFlashcardView />}
              />
              <Route path="grammar" element={<LessonGrammarView />} />
              <Route path="dialogue" element={<LessonDialogueView />} />
              <Route path="kanji" element={<LessonKanjiView />} />
              <Route path="mini-test" element={<MiniTestView />} />
            </Route>
          </Route>
        </Route>

        <Route path={`${paths.admin.dashboard}/*`} element={<AdminLayout />}>
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
          <Route path="mock-exams" element={<MockExamsAdminView />} />
          <Route path="mock-exams/:examId" element={<MockExamDetailAdminView />} />
          <Route path="questions" element={<QuestionsAdminView />} />
          <Route path="study-sets" element={<StudySetsAdminView />} />
          <Route path="study-sets/:id" element={<StudySetAdminDetailView />} />
          <Route path="users" element={<UsersAdminView />} />
          <Route path="config" element={<ConfigAdminView />} />
          <Route path="pricing" element={<PricingAdminView />} />
          <Route path="reports" element={<ReportsAdminView />} />
          <Route path="analytics" element={<AnalyticsAdminView />} />
        </Route>

        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
