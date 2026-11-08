import { describe, expect, it } from "vitest";
import { ALL_LESSONS } from "@/lib/lessons";
import {
  DAILY_CHALLENGES,
  DIFFICULTIES,
  EXTRA_QUESTIONS,
  LESSON_QUESTIONS,
  QUIZ_BANK,
  QUIZ_CATEGORIES,
  QUIZ_STATS,
  getDailyChallenge,
  getQuizPool,
  shuffleQuestions,
} from "@/lib/quizzes";

describe("quiz bank integrity", () => {
  it("has a question from every lesson", () => {
    expect(LESSON_QUESTIONS.length).toBeGreaterThanOrEqual(ALL_LESSONS.length);
    for (const lesson of ALL_LESSONS) {
      expect(
        LESSON_QUESTIONS.some((question) => question.source === lesson.title),
        lesson.title,
      ).toBe(true);
    }
  });

  it("has well-formed questions", () => {
    for (const question of QUIZ_BANK) {
      expect(question.id, question.question).toBeTruthy();
      expect(question.question.trim().length).toBeGreaterThan(10);
      expect(question.options.length).toBe(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.correct).toBeGreaterThanOrEqual(0);
      expect(question.correct).toBeLessThan(question.options.length);
      expect(question.explanation.trim().length).toBeGreaterThan(20);
      expect(DIFFICULTIES).toContain(question.difficulty);
      expect(question.category.trim().length).toBeGreaterThan(0);
    }
  });

  it("has unique question ids", () => {
    const ids = QUIZ_BANK.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reports matching stats", () => {
    expect(QUIZ_STATS.totalQuestions).toBe(QUIZ_BANK.length);
    expect(QUIZ_STATS.lessonQuestions).toBe(LESSON_QUESTIONS.length);
    expect(QUIZ_STATS.scenarioQuestions).toBe(EXTRA_QUESTIONS.length);
    expect(QUIZ_STATS.dailyChallenges).toBe(DAILY_CHALLENGES.length);
  });
});

describe("daily challenges", () => {
  it("has well-formed scenarios", () => {
    for (const challenge of DAILY_CHALLENGES) {
      expect(challenge.id).toBeTruthy();
      expect(challenge.scenario.trim().length).toBeGreaterThan(20);
      expect(challenge.question.correct).toBeGreaterThanOrEqual(0);
      expect(challenge.question.correct).toBeLessThan(challenge.question.options.length);
    }
  });

  it("is deterministic for the same calendar day", () => {
    const first = getDailyChallenge(new Date(2026, 0, 15));
    const second = getDailyChallenge(new Date(2026, 0, 15, 23, 59));
    expect(first.id).toBe(second.id);
  });

  it("rotates across the year", () => {
    const ids = new Set(
      Array.from({ length: 40 }, (_, index) => getDailyChallenge(new Date(2026, 0, index + 1)).id),
    );
    expect(ids.size).toBeGreaterThan(1);
  });

  it("keeps the sizing challenge's answer at 312 units", () => {
    const sizing = DAILY_CHALLENGES.find((challenge) => challenge.id === "daily-5");
    expect(sizing).toBeDefined();
    expect(sizing!.question.options[sizing!.question.correct]).toBe("312 units");
  });
});

describe("quiz pool", () => {
  it("filters by difficulty and category", () => {
    const beginner = getQuizPool({ difficulty: "Beginner" });
    expect(beginner.length).toBeGreaterThan(0);
    expect(beginner.every((question) => question.difficulty === "Beginner")).toBe(true);

    const category = QUIZ_CATEGORIES[0];
    const filtered = getQuizPool({ category });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((question) => question.category === category)).toBe(true);
  });

  it("returns the full bank for no filters", () => {
    expect(getQuizPool().length).toBe(QUIZ_BANK.length);
  });

  it("shuffles deterministically without losing items", () => {
    const original = QUIZ_BANK.slice(0, 20);
    const first = shuffleQuestions(original, 42);
    const second = shuffleQuestions(original, 42);

    expect(first.map((question) => question.id)).toEqual(second.map((question) => question.id));
    expect(first.map((question) => question.id).sort()).toEqual(
      original.map((question) => question.id).sort(),
    );
    expect(first.map((question) => question.id)).not.toEqual(original.map((question) => question.id));
  });
});
