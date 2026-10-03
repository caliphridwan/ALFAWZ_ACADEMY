"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acknowledgeExamResult } from "@/app/dashboard/exam-result-actions";

type ResultItem = {
  enrollmentId: string;
  courseTitle: string;
  result: "PASSED" | "FAILED";
};

export function ExamResultModal({ results }: { results: ResultItem[] }) {
  const [queue, setQueue] = useState(results);
  const [pending, startTransition] = useTransition();

  const current = queue[0];
  if (!current) return null;

  const passed = current.result === "PASSED";

  function dismiss() {
    startTransition(async () => {
      try {
        await acknowledgeExamResult(current.enrollmentId);
      } catch {
        // If this fails, the result just reappears on next visit — not
        // worth blocking the UI over.
      }
      setQueue((q) => q.slice(1));
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`w-full max-w-md rounded-2xl p-8 text-center shadow-2xl ${
            passed ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <div className="flex justify-center mb-4">
            {passed ? <PartyPopper size={40} /> : <RotateCcw size={40} />}
          </div>

          {passed ? (
            <>
              <h2 className="text-xl font-bold mb-3">Congratulations!</h2>
              <p className="text-white/90">
                You have passed your exams at AlFawz Academy for{" "}
                <strong>{current.courseTitle}</strong>, and can now apply for
                the next cohort.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-3">Exam Result</h2>
              <p className="text-white/90">
                You did not pass your exams for <strong>{current.courseTitle}</strong> at
                AlFawz Academy this time. You&apos;ll be repeating the class
                — reach out to your teacher if you have any questions, we&apos;re
                here to help you succeed.
              </p>
            </>
          )}

          <Button
            onClick={dismiss}
            disabled={pending}
            variant="outline"
            className="mt-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            {pending ? "..." : "Got it"}
          </Button>

          {queue.length > 1 && (
            <p className="text-xs text-white/70 mt-3">
              {queue.length - 1} more result{queue.length - 1 > 1 ? "s" : ""} to review
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
