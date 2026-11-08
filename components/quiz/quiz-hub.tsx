"use client";

import * as React from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  History,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SelectField, SegmentedControl } from "@/components/ui/form-controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import {
  DIFFICULTIES,
  QUIZ_BANK,
  QUIZ_CATEGORIES,
  QUIZ_STATS,
  shuffleQuestions,
  type DailyChallenge,
} from "@/lib/quizzes";
import type { QuizQuestion } from "@/lib/lessons";
import { useProgressStore } from "@/store/progress";
import { formatDate } from "@/lib/utils";

type DifficultyFilter = QuizQuestion["difficulty"] | "All";

export function QuizHub({
  daily,
  dateKey,
  dateLabel,
}: {
  daily: DailyChallenge;
  dateKey: string;
  dateLabel: string;
}) {
  const [difficulty, setDifficulty] = React.useState<DifficultyFilter>("All");
  const [category, setCategory] = React.useState("All");
  const [count, setCount] = React.useState(10);
  const [activeQuestions, setActiveQuestions] = React.useState<QuizQuestion[] | null>(null);
  const [activeKey, setActiveKey] = React.useState("practice-all-all-10");
  const [setNumber, setSetNumber] = React.useState(0);

  const quizAttempts = useProgressStore((state) => state.quizAttempts);
  const bestScores = useProgressStore((state) => state.bestScores);
  const dailyCompleted = useProgressStore((state) => state.dailyCompleted);
  const markDaily = useProgressStore((state) => state.markDaily);

  const available = React.useMemo(
    () =>
      QUIZ_BANK.filter(
        (question) =>
          (difficulty === "All" || question.difficulty === difficulty) &&
          (category === "All" || question.category === category),
      ),
    [difficulty, category],
  );

  const dailyDone = dailyCompleted.includes(dateKey);

  const historyStats = React.useMemo(() => {
    const attempts = quizAttempts.slice(0, 30);
    const percentages = attempts.map((attempt) =>
      attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0,
    );
    return {
      attempts: quizAttempts.length,
      average: percentages.length
        ? percentages.reduce((total, value) => total + value, 0) / percentages.length
        : 0,
      best: percentages.length ? Math.max(...percentages) : 0,
    };
  }, [quizAttempts]);

  function startPractice() {
    const pool = QUIZ_BANK.filter(
      (question) =>
        (difficulty === "All" || question.difficulty === difficulty) &&
        (category === "All" || question.category === category),
    );
    if (!pool.length) {
      setActiveQuestions([]);
      return;
    }
    const nextSeed = Date.now() + setNumber * 7919;
    const selectedCount = count === 0 ? pool.length : Math.min(count, pool.length);
    const questions = shuffleQuestions(pool, nextSeed).slice(0, selectedCount);
    setActiveQuestions(questions);
    setActiveKey(`practice-${difficulty}-${category}-${count}`);
    setSetNumber((value) => value + 1);
  }

  function clearPractice() {
    setActiveQuestions(null);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Pool questions", value: QUIZ_STATS.totalQuestions, icon: Layers },
          { label: "Lesson questions", value: QUIZ_STATS.lessonQuestions, icon: CheckCircle2 },
          { label: "Scenario questions", value: QUIZ_STATS.scenarioQuestions, icon: Target },
          { label: "Daily challenges", value: QUIZ_STATS.dailyChallenges, icon: CalendarDays },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="size-3.5 text-primary" aria-hidden="true" />
                {stat.label}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="practice" className="mt-7">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            <TabsTrigger value="practice">
              <Play aria-hidden="true" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="daily">
              <Sparkles aria-hidden="true" />
              Daily challenge
              {dailyDone ? <CheckCircle2 className="size-3 text-bull" aria-hidden="true" /> : null}
            </TabsTrigger>
            <TabsTrigger value="history">
              <History aria-hidden="true" />
              Your history
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="practice">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
            <div className="grid content-start gap-4">
              {activeQuestions ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/60 p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {activeQuestions.length} questions · {difficulty === "All" ? "all levels" : difficulty} ·{" "}
                        {category === "All" ? "all categories" : category}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Shuffled from {available.length} available questions in this filter.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={startPractice}>
                        <RotateCcw aria-hidden="true" />
                        New set
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearPractice}>
                        Change filters
                      </Button>
                    </div>
                  </div>
                  {activeQuestions.length ? (
                    <QuizRunner
                      key={`${activeKey}-${setNumber}`}
                      questions={activeQuestions}
                      quizKey={activeKey}
                      title="Practice quiz"
                      description="Answer every question, then check your result. Explanations appear after submission."
                    />
                  ) : (
                    <Card className="p-6 text-center">
                      <p className="text-sm font-medium">No questions match those filters</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reset one of the filters and start a new set.
                      </p>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Build your quiz
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold">Choose a level and topic</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Every answer comes with an explanation. The quiz records your best score per filter so you
                    can see progress over time.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <SelectField
                      label="Category"
                      value={category}
                      onChange={setCategory}
                      options={[
                        { value: "All", label: `All categories (${QUIZ_CATEGORIES.length})` },
                        ...QUIZ_CATEGORIES.map((item) => ({ value: item, label: item })),
                      ]}
                    />
                    <SelectField
                      label="Questions"
                      value={String(count)}
                      onChange={(value) => setCount(Number(value))}
                      options={[
                        { value: "5", label: "5 questions" },
                        { value: "10", label: "10 questions" },
                        { value: "15", label: "15 questions" },
                        { value: "0", label: `All matching (${available.length})` },
                      ]}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="mb-1.5 text-xs font-medium">Difficulty</p>
                    <SegmentedControl
                      label="Quiz difficulty"
                      value={difficulty}
                      onChange={setDifficulty}
                      size="sm"
                      options={[
                        { value: "All", label: "All" },
                        ...DIFFICULTIES.map((item) => ({ value: item, label: item })),
                      ]}
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button onClick={startPractice} disabled={available.length === 0}>
                      <Play aria-hidden="true" />
                      Start {count === 0 ? available.length : Math.min(count, available.length)} questions
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {available.length} question{available.length === 1 ? "" : "s"} match your filters
                    </span>
                  </div>
                </Card>
              )}
            </div>

            <div className="grid content-start gap-4">
              <CalloutPanel
                title="How scoring works"
                text="One point per correct answer. A score is recorded locally after you submit. You can retry as often as you like; nothing is sent to a server."
              />
              <CalloutPanel
                title="Use errors, not streaks"
                text="The explanation matters more than the score. For every miss, identify the concept, re-read the lesson, then try a related question."
              />
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Trophy className="size-3.5 text-warning" aria-hidden="true" />
                  Best scores
                </p>
                {Object.keys(bestScores).length ? (
                  <div className="mt-2 grid gap-2">
                    {Object.entries(bestScores)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([key, score]) => (
                        <div key={key} className="flex items-center justify-between gap-2 text-xs">
                          <span className="truncate text-muted-foreground">
                            {key.replace("practice-", "").replaceAll("-", " · ")}
                          </span>
                          <span className="font-mono font-semibold">{score}%</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    No quiz attempts yet. Your best score for each filter will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="daily">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
            <div className="grid content-start gap-4">
              <Card className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/25 px-5 py-4">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {dateLabel}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{daily.title}</h3>
                  </div>
                  {dailyDone ? (
                    <Badge variant="bull">
                      <CheckCircle2 aria-hidden="true" />
                      Completed today
                    </Badge>
                  ) : (
                    <Badge variant="outline">One scenario</Badge>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{daily.scenario}</p>
                </div>
              </Card>

              <QuizRunner
                questions={[daily.question]}
                quizKey={`daily-${dateKey}`}
                title={daily.question.question}
                description="Choose one answer. The explanation appears after you check."
                compact
                onComplete={() => markDaily(dateKey)}
              />
            </div>

            <div className="grid content-start gap-4">
              <CalloutPanel
                title="One decision at a time"
                text="A daily scenario is not a signal. It is a small decision to practise: identify the risk first, then the payoff, then the probability."
              />
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Daily streak
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold">
                  {dailyCompleted.length}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">days recorded</span>
                </p>
                <Progress
                  className="mt-2"
                  value={Math.min(100, (dailyCompleted.length / 7) * 100)}
                  showValue
                />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Dates are stored locally. A missed day is not a failure; returning is the point.
                </p>
              </div>
              <CalloutPanel
                title="The order of questions"
                text="Read the scenario twice. Write down the maximum loss before choosing an answer. If the question is about probability, remember that a high win rate can still hide a large tail loss."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
            <div className="grid content-start gap-4">
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Attempts</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{historyStats.attempts}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Average</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{historyStats.average.toFixed(0)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Best</p>
                  <p className="mt-1 font-mono text-xl font-semibold text-bull">{historyStats.best.toFixed(0)}%</p>
                </Card>
              </div>

              {quizAttempts.length ? (
                <Card className="overflow-hidden">
                  <div className="border-b border-border bg-muted/25 px-5 py-4">
                    <h3 className="font-display text-base font-semibold">Recent attempts</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      The most recent 30 attempts stored in this browser.
                    </p>
                  </div>
                  <div className="table-scroll">
                    <table className="w-full min-w-[520px] text-left text-xs">
                      <caption className="sr-only">Your recent quiz attempts</caption>
                      <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-4 py-2.5 font-semibold">Date</th>
                          <th scope="col" className="px-4 py-2.5 font-semibold">Category</th>
                          <th scope="col" className="px-4 py-2.5 font-semibold">Level</th>
                          <th scope="col" className="px-4 py-2.5 font-semibold">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/70">
                        {quizAttempts.slice(0, 30).map((attempt) => {
                          const percentage =
                            attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0;
                          return (
                            <tr key={attempt.id}>
                              <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                                {formatDate(attempt.date, { day: "2-digit", month: "short" })}
                              </td>
                              <td className="px-4 py-2.5">{attempt.category}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{attempt.difficulty}</td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`font-mono font-semibold ${
                                    percentage >= 80
                                      ? "text-bull"
                                      : percentage >= 50
                                        ? "text-warning"
                                        : "text-bear"
                                  }`}
                                >
                                  {attempt.score}/{attempt.total} · {percentage.toFixed(0)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="p-10 text-center">
                  <History className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg font-semibold">No attempts yet</h3>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    Start with five questions on a topic you have just read. A short, focused quiz is more useful
                    than a long one taken from memory alone.
                  </p>
                </Card>
              )}
            </div>

            <div className="grid content-start gap-4">
              <CalloutPanel
                title="Scores are local"
                text="This history is stored in your browser using local storage. Clearing site data removes it. There is no account and no sync."
              />
              <CalloutPanel
                title="A score is a map"
                text="A low score tells you where to look, not that you cannot learn the material. Re-read the relevant lesson and return to the same category."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CalloutPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
        <ArrowRight className="size-3" aria-hidden="true" />
        {title}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
