import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { BuyProductForm } from "../components/BuyProductForm";
import BuyHistoryPage from "./BuyHistoryPage";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export default function BuyProductPage() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [saved, setSaved] = useState(false);
  const canBuy = hasPermission(storedUser(), "inventory.purchases.create");
  return (
    <div className="space-y-4">
      {saved && (
        <p role="status" className="rounded-lg bg-primary/10 p-3 text-primary">
          {t("buyProductForm.saved")}
        </p>
      )}
      <BuyHistoryPage
        key={revision}
        title="warehouseModule.buyProduct"
        headerAction={
          canBuy && (
            <Button
              permission="create"
              className="ms-auto"
              onClick={() => {
                setSaved(false);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("buyProductForm.newPurchase")}
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
          className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1200px)]"
        >
          <DialogHeader className="shrink-0 px-6 py-5">
            <DialogTitle>{t("buyProductForm.newPurchase")}</DialogTitle>
          </DialogHeader>
          <BuyProductForm
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
