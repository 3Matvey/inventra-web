import { computed, ref } from "vue";

export type Locale = "en" | "ru";

const storageKey = "inventra.locale";
const currentLocale = ref<Locale>((localStorage.getItem(storageKey) as Locale | null) ?? "en");

const messages = {
  en: {
    "app.brand": "Inventra",
    "app.search": "Search inventories",
    "app.signIn": "Sign in",
    "app.account": "Account",
    "app.profile": "Profile",
    "app.signOut": "Sign out",
    "app.adminUsers": "Admin users",
    "home.eyebrow": "Inventory management",
    "home.title": "Inventories",
    "home.create": "Create inventory",
    "home.latest": "Latest inventories",
    "home.top": "Top inventories",
    "home.topHint": "By item count",
    "home.tags": "Tag cloud",
    "home.noTags": "No tags yet.",
    "search.eyebrow": "Search",
    "search.results": "Inventory results",
    "search.all": "All inventories",
    "search.found": "inventories found",
    "profile.eyebrow": "Profile",
    "profile.title": "My profile",
    "profile.guest": "Sign in to view your inventories.",
    "profile.myInventories": "My inventories",
    "profile.hint": "Owned and writable inventory tables",
    "profile.owned": "Owned",
    "profile.writable": "Writable",
    "inventory.tabs.items": "Items",
    "inventory.tabs.discussion": "Discussion",
    "inventory.tabs.settings": "Settings",
    "inventory.tabs.idFormat": "Custom ID",
    "inventory.tabs.access": "Access",
    "inventory.tabs.fields": "Fields",
    "inventory.tabs.statistics": "Statistics",
    "admin.eyebrow": "Admin",
    "admin.title": "User management",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel"
  },
  ru: {
    "app.brand": "Inventra",
    "app.search": "Поиск инвентарей",
    "app.signIn": "Войти",
    "app.account": "Аккаунт",
    "app.profile": "Профиль",
    "app.signOut": "Выйти",
    "app.adminUsers": "Пользователи",
    "home.eyebrow": "Управление инвентарями",
    "home.title": "Инвентари",
    "home.create": "Создать инвентарь",
    "home.latest": "Последние инвентари",
    "home.top": "Популярные инвентари",
    "home.topHint": "По количеству предметов",
    "home.tags": "Облако тегов",
    "home.noTags": "Тегов пока нет.",
    "search.eyebrow": "Поиск",
    "search.results": "Результаты поиска",
    "search.all": "Все инвентари",
    "search.found": "инвентарей найдено",
    "profile.eyebrow": "Профиль",
    "profile.title": "Мой профиль",
    "profile.guest": "Войдите, чтобы увидеть свои инвентари.",
    "profile.myInventories": "Мои инвентари",
    "profile.hint": "Таблицы собственных и доступных инвентарей",
    "profile.owned": "Собственные",
    "profile.writable": "Доступные для записи",
    "inventory.tabs.items": "Предметы",
    "inventory.tabs.discussion": "Обсуждение",
    "inventory.tabs.settings": "Настройки",
    "inventory.tabs.idFormat": "Пользовательский ID",
    "inventory.tabs.access": "Доступ",
    "inventory.tabs.fields": "Поля",
    "inventory.tabs.statistics": "Статистика",
    "admin.eyebrow": "Админ",
    "admin.title": "Управление пользователями",
    "common.loading": "Загрузка...",
    "common.save": "Сохранить",
    "common.cancel": "Отмена"
  }
} satisfies Record<Locale, Record<string, string>>;

export function useI18n() {
  const locale = computed(() => currentLocale.value);

  function setLocale(locale: Locale) {
    currentLocale.value = locale;
    localStorage.setItem(storageKey, locale);
  }

  function toggleLocale() {
    setLocale(currentLocale.value === "en" ? "ru" : "en");
  }

  function t(key: keyof typeof messages.en) {
    return messages[currentLocale.value][key] ?? messages.en[key] ?? key;
  }

  return {
    locale,
    setLocale,
    toggleLocale,
    t
  };
}
