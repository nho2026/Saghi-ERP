import { useTranslation } from "react-i18next";
import type { TOptions } from "i18next";

export function useBuildingTranslation() {
  const { t: translate, i18n } = useTranslation("building");
  const t = (key: string, options: TOptions = {}) =>
    translate(
      key.startsWith("buildingExpenses.")
        ? key.slice("buildingExpenses.".length)
        : key,
      {
        ...options,
        keySeparator: key.startsWith("buildingExpenses.") ? "." : false,
        nsSeparator: false,
      },
    );
  return { t, i18n };
}
