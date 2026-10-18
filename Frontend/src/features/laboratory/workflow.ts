export const progressStages = [
  "awaiting_payment",
  "waiting",
  "collecting",
  "processing",
  "completed",
  "received",
  "called",
  "delivered",
];
export const nextStage: Record<string, string> = {
  waiting: "collecting",
  collecting: "processing",
  processing: "completed",
  completed: "received",
  received: "called",
  called: "delivered",
};

export const stageStyles: Record<string, { color: string; badge: string }> = {
  awaiting_payment: {
    color: "#d97706",
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  waiting: {
    color: "#0284c7",
    badge:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  },
  collecting: {
    color: "#0891b2",
    badge:
      "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
  processing: {
    color: "#7c3aed",
    badge:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
  completed: {
    color: "#059669",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  received: {
    color: "#4f46e5",
    badge:
      "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  },
  called: {
    color: "#db2777",
    badge:
      "border-pink-200 bg-pink-50 text-pink-800 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300",
  },
  delivered: {
    color: "#1C9B49",
    badge:
      "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
};
