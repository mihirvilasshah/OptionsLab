"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  total: number;
  difficulty: string;
  category: string;
}

interface ProgressState {
  completedLessons: string[];
  quizAttempts: QuizAttempt[];
  bestScores: Record<string, number>;
  dailyCompleted: string[];
  lastVisited: string | null;
  markLesson: (lessonId: string, complete?: boolean) => void;
  recordQuiz: (attempt: Omit<QuizAttempt, "id" | "date"> & { key: string }) => void;
  markDaily: (date: string) => void;
  setLastVisited: (lessonId: string) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedLessons: [],
      quizAttempts: [],
      bestScores: {},
      dailyCompleted: [],
      lastVisited: null,
      markLesson: (lessonId, complete = true) =>
        set((state) => ({
          completedLessons: complete
            ? state.completedLessons.includes(lessonId)
              ? state.completedLessons
              : [...state.completedLessons, lessonId]
            : state.completedLessons.filter((id) => id !== lessonId),
          lastVisited: complete ? lessonId : state.lastVisited,
        })),
      recordQuiz: (attempt) =>
        set((state) => {
          const { key, ...rest } = attempt;
          const percentage = Math.round((rest.score / Math.max(1, rest.total)) * 100);
          const previous = state.bestScores[key] ?? 0;
          return {
            quizAttempts: [
              {
                ...rest,
                id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                date: new Date().toISOString(),
              },
              ...state.quizAttempts,
            ].slice(0, 40),
            bestScores: {
              ...state.bestScores,
              [key]: Math.max(previous, percentage),
            },
          };
        }),
      markDaily: (date) =>
        set((state) => ({
          dailyCompleted: state.dailyCompleted.includes(date)
            ? state.dailyCompleted
            : [...state.dailyCompleted, date],
        })),
      setLastVisited: (lessonId) => set({ lastVisited: lessonId }),
      reset: () =>
        set({
          completedLessons: [],
          quizAttempts: [],
          bestScores: {},
          dailyCompleted: [],
          lastVisited: null,
        }),
    }),
    {
      name: "options-lab-progress-v1",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        quizAttempts: state.quizAttempts,
        bestScores: state.bestScores,
        dailyCompleted: state.dailyCompleted,
        lastVisited: state.lastVisited,
      }),
    },
  ),
);
