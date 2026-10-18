import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { OrderForm } from "../components/OrderForm";
import OrderHistoryPage from "./OrderHistoryPage";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export default function OrderPage() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [saved, setSaved] = useState(false);
  const canSubmit = hasPermission(storedUser(), "inventory.orders.create");
  return (
    <div className="space-y-4">
      {saved && (
        <p role="status" className="rounded-lg bg-primary/10 p-3 text-primary">
          {t("orderForm.saved")}
        </p>
      )}
      <OrderHistoryPage
        key={revision}
        title="warehouseModule.order"
        headerAction={
          canSubmit && (
            <Button
              permission="create"
              className="ms-auto"
              onClick={() => {
                setSaved(false);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("orderForm.another")}
            </Button>
          )
        }
      />
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="flex h-[80dvh] max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1200px)]"
        >
          <DialogHeader className="shrink-0 px-6 py-5">
            <DialogTitle>{t("orderForm.another")}</DialogTitle>
          </DialogHeader>
          <OrderForm
            onBusy={setBusy}
            onSaved={() => {
              setOpen(false);
              setSaved(true);
              setRevision((value) => value + 1);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
