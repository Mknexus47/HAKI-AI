"use client";

import * as React from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";

interface Question {
  question: string;
  options: string[];
  answer: number;
  topic: string;
}

const questions: Question[] = [
  {
    topic: "Tenant & Landlord Rights",
    question:
      "What should a tenant do FIRST if a landlord refuses to return a deposit?",
    options: [
      "Send a written demand referring to the tenancy agreement",
      "Change the locks immediately",
      "Post about it on social media",
      "Ignore it — deposits are never returned",
    ],
    answer: 0,
  },
  {
    topic: "Employment Basics",
    question:
      "Under Kenyan law, what is required before an employer dismisses an employee?",
    options: [
      "No process is required",
      "A fair reason and a fair procedure",
      "Only a verbal warning",
      "A court order in every case",
    ],
    answer: 1,
  },
  {
    topic: "Consumer Rights",
    question: "You bought a faulty appliance. What is NOT a valid remedy?",
    options: [
      "Repair",
      "Replacement",
      "Refund",
      "None — faulty goods must be kept",
    ],
    answer: 3,
  },
  {
    topic: "Debt Recovery",
    question: "What does a demand letter normally set?",
    options: [
      "A court judgment",
      "A clear amount and a deadline for payment",
      "A criminal charge",
      "A salary increment",
    ],
    answer: 1,
  },
  {
    topic: "Access to Justice",
    question:
      "Which body provides legal aid services for eligible Kenyans?",
    options: [
      "National Legal Aid Service",
      "Central Bank of Kenya",
      "Kenya Revenue Authority",
      "Communications Authority",
    ],
    answer: 0,
  },
];

export default function LegalQuizPage() {
  const [current, setCurrent] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  const question = questions[current];

  const handleNext = () => {
    if (selected === null) return;
    const nextScore = score + (selected === question.answer ? 1 : 0);
    setScore(nextScore);
    setSelected(null);
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const resultMessage = () => {
    if (score === questions.length)
      return "Excellent — you know your basic legal rights.";
    if (score >= 3)
      return "Good effort — review the topics you missed for stronger knowledge.";
    return "Keep learning — explore the legal topics section and try again.";
  };

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Legal Quiz
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        Test your knowledge of everyday Kenyan legal rights. This quiz is for
        education only — it does not provide legal advice.
      </p>

      {!finished ? (
        <div className="card-gradient mt-8 max-w-3xl rounded-xl border p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Question {current + 1} of {questions.length} · {question.topic}
          </p>
          <fieldset className="mt-4">
            <legend className="text-lg font-semibold text-slate-900">
              {question.question}
            </legend>
            <div className="mt-5 space-y-3">
              {question.options.map((option, index) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm text-slate-700 transition-colors ${
                    selected === index
                      ? "border-slate-900 bg-white"
                      : "border-slate-200 bg-white/60 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${current}`}
                    value={index}
                    checked={selected === index}
                    onChange={() => setSelected(index)}
                    className="h-4 w-4 accent-[#e5342b]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-8">
            <Button
              onClick={handleNext}
              disabled={selected === null}
              className="btn-gradient-primary h-[48px] rounded-full px-8 text-[15px] font-semibold"
            >
              {current + 1 === questions.length ? "See results" : "Next question"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="card-gradient mt-8 max-w-3xl rounded-xl border p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Your results</h2>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {score} / {questions.length}
          </p>
          <p className="mt-4 flex items-center justify-center gap-2 text-slate-600">
            {score >= 3 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            ) : (
              <XCircle className="h-5 w-5 text-slate-500" aria-hidden="true" />
            )}
            {resultMessage()}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleRestart}
              variant="outline"
              className="h-[48px] rounded-full border-slate-300 px-8 text-[15px] font-semibold text-slate-700 hover:bg-white"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
