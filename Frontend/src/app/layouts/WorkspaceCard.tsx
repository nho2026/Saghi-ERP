import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const colors = [
  "bg-teal-500/10 text-teal-600 dark:text-teal-300",
  "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
];

export function WorkspaceCard({
  icon: Icon,
  title,
  description,
  meta,
  colorIndex,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  meta: string;
  colorIndex: number;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="group h-auto min-h-44 min-w-0 w-full sm:min-h-48 whitespace-normal rounded-2xl border-border/60 bg-card p-4 sm:p-5 text-start shadow-none transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
    >
      <span className="flex h-full min-w-0 w-full flex-col items-start gap-3">
        <span className="flex w-full items-center justify-between">
          <span
            className={`rounded-xl p-3 ${colors[Math.max(0, colorIndex) % colors.length]}`}
          >
            <Icon className="size-5" />
          </span>
          <ArrowRight className="size-4 text-muted-foreground/50 rtl:rotate-180" />
        </span>
        <span className="w-full break-words text-base font-semibold leading-7">
          {title}
        </span>
        <span className="w-full break-words text-sm font-normal leading-6 text-muted-foreground">
          {description}
        </span>
        <span className="mt-auto rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
          {meta}
        </span>
      </span>
    </Button>
  );
}
