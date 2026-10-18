import { useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/shared/api/client";

export function useFullReportPrint<T>(load: () => Promise<T>) {
  const [printData, setPrintData] = useState<T | null>(null);
  const [printing, setPrinting] = useState(false);
  const print = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const data = await load();
      flushSync(() => setPrintData(data));
      document.body.classList.add("printing-document");
      // Allow layout and fonts to settle before opening the print dialog.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      window.print();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      document.body.classList.remove("printing-document");
      setPrintData(null);
      setPrinting(false);
    }
  };
  return { printData, printing, print };
}
