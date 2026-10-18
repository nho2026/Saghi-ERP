import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locale/en.json";
import ar from "../locale/ar.json";
import ku from "../locale/ku.json";

export const supportedLanguages = ["en", "ar", "ku"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const savedLanguage = localStorage.getItem("nho-language");
const browserLanguage = navigator.language.split("-")[0];
const initialLanguage = supportedLanguages.includes(
  savedLanguage as SupportedLanguage,
)
  ? (savedLanguage as SupportedLanguage)
  : supportedLanguages.includes(browserLanguage as SupportedLanguage)
    ? (browserLanguage as SupportedLanguage)
    : "en";

function updateDocumentLanguage(language: string) {
  const normalized = language.split("-")[0] as SupportedLanguage;
  const direction = normalized === "en" ? "ltr" : "rtl";
  document.documentElement.lang = normalized;
  document.documentElement.dir = direction;
  document.body.dir = direction;
  document.getElementById("root")?.setAttribute("dir", direction);
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, building: en.buildingExpenses },
    ar: { translation: ar, building: ar.buildingExpenses },
    ku: { translation: ku, building: ku.buildingExpenses },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Our ku translations use Sorani (Arabic script), while i18next's generic
// Kurdish language code defaults to Latin-script direction.
const defaultDirection = i18n.dir.bind(i18n);
i18n.dir = (language?: string) => {
  const locale =
    language ?? i18n.resolvedLanguage ?? i18n.language ?? initialLanguage;
  return locale.split("-")[0] === "ku" ? "rtl" : defaultDirection(locale);
};

updateDocumentLanguage(initialLanguage);
i18n.on("languageChanged", (language) => {
  localStorage.setItem("nho-language", language);
  updateDocumentLanguage(language);
});

export default i18n;
