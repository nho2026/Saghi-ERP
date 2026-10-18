import { useEffect, useRef } from "react";
import { renderBarcode } from "./logic/render-barcode";

export function ProductBarcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const fallback = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (ref.current) {
      const valid = renderBarcode(ref.current, value, {
        width: 2,
        height: 58,
        fontSize: 15,
        margin: 8,
      });
      ref.current.style.display = valid ? "" : "none";
      if (fallback.current) fallback.current.hidden = valid;
    }
  }, [value]);
  return (
    <div className="flex w-full flex-col items-center">
      <svg
        ref={ref}
        className="block h-auto max-h-28 max-w-full"
        aria-label={value}
      />
      <p
        ref={fallback}
        hidden
        className="max-w-full break-all text-center text-sm text-destructive"
        role="status"
      >
        Unsupported barcode. Check the stored value.
        <span className="block" dir="ltr">
          {value || "No barcode value"}
        </span>
      </p>
    </div>
  );
}
