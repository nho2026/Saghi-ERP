import { useEffect } from "react";
import { toast, Toaster, useSonner, type ToasterProps } from "sonner";

export function SingleAlertToaster(props: ToasterProps) {
  const { toasts } = useSonner();

  useEffect(() => {
    // Sonner lists the newest alert first. Remove older alerts so they
    // cannot reappear when the latest alert closes or the user hovers.
    for (const older of toasts.slice(1)) {
      toast.dismiss(older.id);
    }
  }, [toasts]);

  return <Toaster {...props} visibleToasts={1} />;
}
