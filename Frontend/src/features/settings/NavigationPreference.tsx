import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
export function NavigationPreference() {
  const { t } = useTranslation();
  const [mode, setMode] = useState(() =>
    localStorage.getItem("nho-navigation-mode") === "panel"
      ? "panel"
      : "sidebar",
  );
  return (
    <Card className="space-y-3 p-5">
      <Label htmlFor="navigation-mode">{t("controlPanel.preference")}</Label>
      <p className="text-sm text-muted-foreground">
        {t("controlPanel.preferenceHelp")}
      </p>
      <Select
        value={mode}
        onValueChange={(value) => {
          setMode(value);
          localStorage.setItem("nho-navigation-mode", value);
          window.dispatchEvent(new Event("nho-navigation-mode-changed"));
        }}
      >
        <SelectTrigger id="navigation-mode" className="max-w-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sidebar">{t("controlPanel.sidebar")}</SelectItem>
          <SelectItem value="panel">{t("controlPanel.title")}</SelectItem>
        </SelectContent>
      </Select>
    </Card>
  );
}
