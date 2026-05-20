import { computed, ref } from "vue";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

const locales = {
  en,
  ru
} as const;

export type Locale = keyof typeof locales;
export type MessageKey = keyof typeof en;

const storageKey = "inventra.locale";
const defaultLocale: Locale = "en";
const savedLocale = localStorage.getItem(storageKey) as Locale | null;
const currentLocale = ref<Locale>(savedLocale && savedLocale in locales ? savedLocale : defaultLocale);

export function useI18n() {
  const locale = computed(() => currentLocale.value);
  const availableLocales = Object.keys(locales) as Locale[];

  function setLocale(locale: Locale) {
    currentLocale.value = locale;
    localStorage.setItem(storageKey, locale);
  }

  function toggleLocale() {
    const index = availableLocales.indexOf(currentLocale.value);
    setLocale(availableLocales[(index + 1) % availableLocales.length] ?? defaultLocale);
  }

  function t(key: MessageKey, params: Record<string, string | number> = {}) {
    const template = locales[currentLocale.value][key] ?? locales[defaultLocale][key] ?? key;
    return Object.entries(params).reduce(
      (value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)),
      template
    );
  }

  return {
    availableLocales,
    locale,
    setLocale,
    toggleLocale,
    t
  };
}
