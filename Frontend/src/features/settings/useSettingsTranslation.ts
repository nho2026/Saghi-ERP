import { useTranslation } from "react-i18next";
export function useSettingsTranslation() {
  const { t, i18n } = useTranslation();
  return {
    i18n,
    tr: (text: string) => {
      const key =
        /^(Too small:|Too big:|Invalid input:|Invalid string:|Invalid option:|Invalid email|Unrecognized key)/.test(
          text,
        )
          ? "Invalid settings. Check the entered values."
          : text;
      return t(`systemSettings|${key}`, {
        keySeparator: "|",
        defaultValue: key,
      });
    },
  };
}
