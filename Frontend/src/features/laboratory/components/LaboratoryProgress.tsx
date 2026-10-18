import {
  CreditCard,
  FlaskConical,
  TestTube2,
  Microscope,
  ClipboardCheck,
  FileCheck2,
  PhoneCall,
  CheckCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { progressStages, stageStyles } from "../workflow";

const stageIcons = [
  CreditCard,
  FlaskConical,
  TestTube2,
  Microscope,
  ClipboardCheck,
  FileCheck2,
  PhoneCall,
  CheckCheck,
];

export function LaboratoryProgress({ status }: { status: string }) {
  const { t } = useTranslation();
  const current = progressStages.indexOf(status);
  return (
    <div
      className="grid min-w-[620px] grid-cols-8 px-2 py-3"
      aria-label={t("laboratory.progressOverview")}
    >
      {progressStages.map((stage, index) => {
        const Icon = stageIcons[index];
        return (
          <div
            key={stage}
            className="relative flex flex-col items-center"
            aria-current={index === current ? "step" : undefined}
          >
            {index < progressStages.length - 1 && (
              <span
                className="absolute inset-s-1/2 top-4 h-0.5 w-full bg-border"
                style={
                  index < current
                    ? { backgroundColor: stageStyles[stage].color }
                    : undefined
                }
              />
            )}
            <span
              className={`relative grid size-8 place-items-center rounded-full border-2 border-border bg-card ${index <= current ? "text-white" : "text-muted-foreground"}`}
              style={
                index <= current
                  ? {
                      borderColor: stageStyles[stage].color,
                      backgroundColor: stageStyles[stage].color,
                      boxShadow:
                        index === current
                          ? `0 0 0 5px ${stageStyles[stage].color}25`
                          : undefined,
                    }
                  : undefined
              }
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span
              className={`mt-3 max-w-20 px-1 text-center text-[10px] leading-snug ${index <= current ? "font-semibold" : "text-muted-foreground"}`}
              style={
                index <= current
                  ? { color: stageStyles[stage].color }
                  : undefined
              }
            >
              {t(`laboratory.${stage}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
