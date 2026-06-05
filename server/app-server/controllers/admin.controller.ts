import type { Request, Response } from 'express';

import * as conversationService from '../services/conversation.service.js';
import * as courseService from '../services/course.service.js';
import * as studySetService from '../services/study-set.service.js';
import * as grammarService from '../services/grammar.service.js';
import * as kanjiService from '../services/kanji.service.js';
import * as kanjiMediaService from '../services/kanji-media.service.js';
import * as radicalService from '../services/radical.service.js';
import * as lessonService from '../services/lesson.service.js';
import * as questionService from '../services/question.service.js';
import * as mockExamService from '../services/mock-exam.service.js';
import * as vocabService from '../services/vocabulary.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type { Request, Response } from "express";

import * as conversationService from "../services/conversation.service.js";
import * as courseService from "../services/course.service.js";
import * as studySetService from "../services/study-set.service.js";
import * as grammarService from "../services/grammar.service.js";
import * as kanjiService from "../services/kanji.service.js";
import * as kanjiMediaService from "../services/kanji-media.service.js";
import * as radicalService from "../services/radical.service.js";
import * as lessonService from "../services/lesson.service.js";
import * as questionService from "../services/question.service.js";
import * as vocabService from "../services/vocabulary.service.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";

// Vocabulary
export const listVocabulary = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await vocabService.listVocabulary(
      (req.validatedQuery ?? req.query) as never,
    );
    res.json({ success: true, data });
  },
);

export const getVocabulary = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await vocabService.getVocabulary(id);
    res.json({ success: true, data });
  },
);

export const createVocabulary = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await vocabService.createVocabulary(
      (req.validatedBody ?? req.body) as never,
      req.user?.id,
    );
    res.status(201).json({ success: true, data });
  },
);

export const updateVocabulary = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await vocabService.updateVocabulary(
      id,
      (req.validatedBody ?? req.body) as never,
    );
    res.json({ success: true, data });
  },
);

export const deleteVocabulary = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await vocabService.deleteVocabulary(id);
    res.json({ success: true, data: null });
  },
);

// Grammar
export const listGrammar = asyncHandler(async (req: Request, res: Response) => {
  const data = await grammarService.listGrammar(
    (req.validatedQuery ?? req.query) as never,
  );
  res.json({ success: true, data });
});

export const getGrammar = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await grammarService.getGrammar(id);
  res.json({ success: true, data });
});

export const createGrammar = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await grammarService.createGrammar(req.body, req.user?.id);
    res.status(201).json({ success: true, data });
  },
);

export const updateGrammar = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await grammarService.updateGrammar(id, req.body);
    res.json({ success: true, data });
  },
);

export const deleteGrammar = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await grammarService.deleteGrammar(id);
    res.json({ success: true, data: null });
  },
);

// Courses
export const listCourses = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await courseService.listAllCourses();
    res.json({ success: true, data });
  },
);

export const listCoursesWithLessons = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await courseService.listAllCoursesWithLessons();
    res.json({ success: true, data });
  },
);

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await courseService.getCourse(id);
  res.json({ success: true, data });
});

export const createCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await courseService.createCourse({
      ...req.body,
      createdById: req.user?.id,
    });
    res.status(201).json({ success: true, data });
  },
);

export const updateCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await courseService.updateCourse(id, req.body);
    res.json({ success: true, data });
  },
);

export const deleteCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await courseService.deleteCourse(id);
    res.json({ success: true, data: null });
  },
);

// Lessons
export const createLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await lessonService.createLesson(req.body);
    res.status(201).json({ success: true, data });
  },
);

export const updateLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await lessonService.updateLesson(id, req.body);
    res.json({ success: true, data });
  },
);

export const deleteLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await lessonService.deleteLesson(id);
    res.json({ success: true, data: null });
  },
);

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await lessonService.getLessonForAdmin(id);
  res.json({ success: true, data });
});

export const assignLessonVocabulary = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await lessonService.assignVocabularyToLesson(id, req.body.ids);
    res.json({ success: true, data });
  },
);

export const assignLessonGrammar = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await lessonService.assignGrammarToLesson(id, req.body.ids);
    res.json({ success: true, data });
  },
);

export const assignLessonKanji = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await lessonService.assignKanjiToLesson(id, req.body.ids);
    res.json({ success: true, data });
  },
);

export const assignLessonQuestions = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await lessonService.assignQuestionsToLesson(id, req.body.ids);
    res.json({ success: true, data });
  },
);

export const assignLessonConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await conversationService.assignConversationsToLesson(
      id,
      req.body.ids,
    );
    res.json({ success: true, data });
  },
);

// Conversations
export const listConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await conversationService.listConversations(
      (req.validatedQuery ?? req.query) as never,
    );
    res.json({ success: true, data });
  },
);

export const getConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await conversationService.getConversation(id);
    res.json({ success: true, data });
  },
);

export const createConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await conversationService.createConversation(
      req.body,
      req.user?.id,
    );
    res.status(201).json({ success: true, data });
  },
);

export const updateConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await conversationService.updateConversation(id, req.body);
    res.json({ success: true, data });
  },
);

export const deleteConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await conversationService.deleteConversation(id);
    res.json({ success: true, data: null });
  },
);

export const listPendingStudySets = asyncHandler(
  async (req: Request, res: Response) => {
    const q = (req.validatedQuery ?? req.query) as {
      status?: "pending" | "approved" | "rejected" | "all";
      search?: string;
    };
    const data = await studySetService.listAdminStudySets(q);
    res.json({ success: true, data });
  },
);

export const getStudySetAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await studySetService.getStudySetForAdmin(
      String(req.params.id),
    );
    res.json({ success: true, data });
  },
);

export const moderateStudySet = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.validatedBody as {
      status: "approved" | "rejected";
      moderationNote?: string;
      quizQuestionCount?: number;
    };
    const data = await studySetService.moderateStudySet(
      String(req.params.id),
      body.status,
      {
        moderationNote: body.moderationNote,
        quizQuestionCount: body.quizQuestionCount,
      },
    );
    res.json({
      success: true,
      data,
      message:
        body.status === "approved"
          ? "Đã duyệt. Quiz AI đã được tạo (hoặc đang xử lý)."
          : undefined,
    });
  },
);

// Questions
export const listQuestions = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await questionService.listQuestions(
      (req.validatedQuery ?? req.query) as never,
    );
    res.json({ success: true, data });
  },
);

export const getQuestion = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await questionService.getQuestion(id);
  res.json({ success: true, data });
});

export const createQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await questionService.createQuestion(req.body, req.user?.id);
    res.status(201).json({ success: true, data });
  },
);

export const updateQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await questionService.updateQuestion(id, req.body);
    res.json({ success: true, data });
  },
);

export const deleteQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await questionService.deleteQuestion(id);
    res.json({ success: true, data: null });
  },
);

// Mock exams
export const listMockExams = asyncHandler(async (req: Request, res: Response) => {
  const data = await mockExamService.listMockExams((req.validatedQuery ?? req.query) as never);
  res.json({ success: true, data });
});

export const getMockExam = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await mockExamService.getMockExam(id);
  res.json({ success: true, data });
});

export const createMockExam = asyncHandler(async (req: Request, res: Response) => {
  const data = await mockExamService.createMockExam(req.body, req.user?.id);
  res.status(201).json({ success: true, data });
});

export const updateMockExam = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await mockExamService.updateMockExam(id, req.body);
  res.json({ success: true, data });
});

export const deleteMockExam = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await mockExamService.deleteMockExam(id);
  res.json({ success: true, data: null });
});

export const importMockExamQuestions = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await mockExamService.addQuestionsToExam(
    id,
    req.body.questions,
    req.user?.id,
  );
  res.status(201).json({ success: true, data });
});

export const removeMockExamQuestion = asyncHandler(async (req: Request, res: Response) => {
  const mockExamId = String(req.params.id);
  const questionId = String(req.params.questionId);
  await mockExamService.removeQuestionFromExam(mockExamId, questionId);
  res.json({ success: true, data: null });
});

// Kanji
export const listKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await kanjiService.listKanji(
    (req.validatedQuery ?? req.query) as never,
  );
  res.json({ success: true, data });
});

export const getKanji = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await kanjiService.getKanji(id);
  res.json({ success: true, data });
});

export const createKanji = asyncHandler(async (req: Request, res: Response) => {
  const data = await kanjiService.createKanji(req.body, req.user?.id);
  res.status(201).json({ success: true, data });
});

export const updateKanji = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await kanjiService.updateKanji(id, req.body);
  res.json({ success: true, data });
});

export const deleteKanji = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await kanjiService.deleteKanji(id);
  res.json({ success: true, data: null });
});

export const uploadKanjiMemoryImage = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw new AppError("Image file is required", 422, "VALIDATION_ERROR");
    }
    const data = await kanjiMediaService.uploadKanjiMemoryImage({
      kanjiId: String(req.params.id),
      contentType: file.mimetype,
      body: file.buffer,
    });
    res.json({ success: true, data });
  },
);

// Radicals
export const listRadicals = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await radicalService.listRadicals(
      (req.validatedQuery ?? req.query) as never,
    );
    res.json({ success: true, data });
  },
);

export const getRadical = asyncHandler(async (req: Request, res: Response) => {
  const data = await radicalService.getRadical(String(req.params.id));
  res.json({ success: true, data });
});

export const createRadical = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await radicalService.createRadical(req.body);
    res.status(201).json({ success: true, data });
  },
);

export const updateRadical = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await radicalService.updateRadical(
      String(req.params.id),
      req.body,
    );
    res.json({ success: true, data });
  },
);

export const deleteRadical = asyncHandler(
  async (req: Request, res: Response) => {
    await radicalService.deleteRadical(String(req.params.id));
    res.json({ success: true, data: null });
  },
);
