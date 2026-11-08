"use client";

import * as React from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/store/progress";
import type { QuizQuestion } from "@/lib/lessons";

export function QuizRunner({
  questions,
  quizKey,
  title = "Check your understanding",
  description,
  compact = false,
  onComplete,
}: {
  questions: QuizQuestion[];
  quizKey: string;
  title?: string;
  description?: string;
  compact?: boolean;
  onComplete?: (score: number, total: number) => void;
}) {
  const recordQuiz = useProgressStore((state) => state.recordQuiz);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce(
    (total, question) => total + (answers[question.id] === question.correct ? 1 : 0),
    0,
  );
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  function submit() {
    if (submitted || answeredCount < questions.length) return;
    setSubmitted(true);
    recordQuiz({
      key: quizKey,
      score,
      total: questions.length,
      difficulty: questions[0]?.difficulty ?? "Beginner",
      category: questions[0]?.category ?? "General",
    });
    onComplete?.(score, questions.length);
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <Card className={cn("overflow-hidden", compact && "shadow-none")}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/25 px-5 py-4">
        <div>
          <h3 className="font-display text-base font-semibold">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <Badge variant="outline">
          {answeredCount}/{questions.length} answered
        </Badge>
      </div>

      {submitted ? (
        <div className="border-b border-border bg-muted/20 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                Score: {score}/{questions.length} · {percentage}%
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {percentage >= 80
                  ? "Strong understanding. Review the explanations to lock it in."
                  : percentage >= 50
                    ? "Passing, but review the missed ideas before moving on."
                    : "Re-read the lesson and try again. Errors are useful information."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          </div>
          <Progress className="mt-3" value={percentage} showValue />
        </div>
      ) : null}

      <ol className="divide-y divide-border">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          return (
            <li key={question.id} className="p-5">
              <fieldset>
                <legend className="text-sm font-medium leading-relaxed">
                  <span className="mr-1.5 font-mono text-xs text-muted-foreground">{index + 1}.</span>
                  {question.question}
                </legend>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selected === optionIndex;
                    const isCorrect = question.correct === optionIndex;
                    const showCorrect = submitted && isCorrect;
                    const showWrong = submitted && isSelected && !isCorrect;
                    return (
                      <label
                        key={option}
                        className={cn(
                          "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                          !submitted && isSelected && "border-primary/50 bg-primary/5",
                          !submitted && !isSelected && "border-border bg-background/40 hover:bg-muted/40",
                          showCorrect && "border-bull/50 bg-bull-soft/60",
                          showWrong && "border-bear/50 bg-bear-soft/60",
                          submitted && !showCorrect && !showWrong && "border-border opacity-70",
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optionIndex}
                          checked={isSelected}
                          disabled={submitted}
                          onChange={() =>
                            setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))
                          }
                          className="mt-0.5 size-4 accent-[var(--primary)]"
                        />
                        <span className="flex-1 leading-relaxed">{option}</span>
                        {showCorrect ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-bull" aria-label="Correct answer" /> : null}
                        {showWrong ? <XCircle className="mt-0.5 size-4 shrink-0 text-bear" aria-label="Incorrect answer" /> : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {submitted ? (
                <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Why:</strong> {question.explanation}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!submitted ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4">
          <p className="text-xs text-muted-foreground">
            {answeredCount < questions.length
              ? `Answer all ${questions.length} questions to check your result.`
              : "Ready to check. You can retry as many times as you like."}
          </p>
          <Button onClick={submit} disabled={answeredCount < questions.length}>
            Check answers
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
