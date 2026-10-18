import { useActionPermission } from "@/features/auth/permission-context";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

type DeleteConfirmationDialogProps = {
  children: ReactElement;
  permission?: string;
  description: string;
  onConfirm: () => void | Promise<void>;
};

export function DeleteConfirmationDialog({
  children,
  permission = "delete",
  description,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();
  const allowed = useActionPermission(permission);
  if (!allowed) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("common.deletePermanently")}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            permission={permission}
            onClick={() => void onConfirm()}
          >
            {t("common.deletePermanently")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
