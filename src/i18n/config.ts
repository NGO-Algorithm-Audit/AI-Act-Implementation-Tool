import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./en/translation.json";
import nlTranslation from "./nl/translation.json";

i18next
  // currently not using the language detector, since we are using url params.
  //.use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en", // Default language if detection fails
    // debug: true,
    resources: {
      en: {
        translation: enTranslation,
      },
      nl: {
        translation: nlTranslation,
      },
    },
    detection: {
      // Prioritize localStorage over browser language
      order: [
        "localStorage",
        "querystring",
        "htmlTag",
        "navigator",
        "path",
        "subdomain",
      ],
      caches: ["localStorage"],
    },
    returnNull: false,
  });
