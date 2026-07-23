import {
  Baby,
  Coffee,
  Compass,
  House,
  Plane,
  HandCoins,
  Handshake,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Choices offered by the "Моё путешествие" form.
 *
 * Values are the labels themselves and mirror the tuples in backend/schemas.py,
 * which rejects anything outside them. Keep both sides in step.
 */

export interface Choice {
  value: string;
  icon: LucideIcon;
}

/** The three shelves a listing can belong to. */
export const LISTING_CATEGORIES: Choice[] = [
  { value: "Путешествия", icon: Plane },
  { value: "Встречи", icon: Coffee },
  { value: "В гости", icon: House },
];

export const DEFAULT_CATEGORY = "Путешествия";

export const AUTHOR_KINDS: Choice[] = [
  { value: "мужчина", icon: UserRound },
  { value: "женщина", icon: UserRound },
  { value: "компания", icon: Users },
  { value: "пара или семья", icon: UsersRound },
  { value: "родитель с ребёнком", icon: Baby },
];

export const SEEKING_OPTIONS: Choice[] = [
  { value: "мужчину", icon: UserRound },
  { value: "женщину", icon: UserRound },
  { value: "компанию", icon: Users },
  { value: "семью", icon: UsersRound },
  { value: "родителя с ребёнком", icon: Baby },
  { value: "кого-нибудь", icon: Compass },
];

export const FINANCE_OPTIONS: Choice[] = [
  { value: "Каждый платит за себя", icon: Wallet },
  { value: "Предпочитаю спонсорство", icon: HandCoins },
  { value: "Финансы по договорённости", icon: Handshake },
];

export const TRIP_TYPES = [
  "Любое путешествие",
  "Пляж",
  "Экскурсии",
  "Автотрип",
  "Тур на выходные",
  "Зимний спорт",
  "Здоровье, фитнес",
  "Зимовка",
  "Поход",
  "Водный туризм",
  "Работа и учёба",
  "Дайвинг",
  "Сёрфинг",
  "Духовные практики",
];

/** Shown first in the destination picker, in the order the design lists them. */
export const POPULAR_COUNTRIES = [
  "Таиланд",
  "Россия",
  "ОАЭ",
  "Турция",
  "Египет",
  "Вьетнам",
];

export const ALL_COUNTRIES = [
  "Абхазия",
  "Австрия",
  "Азербайджан",
  "Албания",
  "Аргентина",
  "Армения",
  "Беларусь",
  "Бразилия",
  "Великобритания",
  "Венгрия",
  "Вьетнам",
  "Германия",
  "Греция",
  "Грузия",
  "Египет",
  "Израиль",
  "Индия",
  "Индонезия",
  "Иордания",
  "Испания",
  "Италия",
  "Казахстан",
  "Камбоджа",
  "Кипр",
  "Китай",
  "Куба",
  "Малайзия",
  "Мальдивы",
  "Марокко",
  "Мексика",
  "Непал",
  "ОАЭ",
  "Оман",
  "Перу",
  "Польша",
  "Португалия",
  "Россия",
  "Сербия",
  "Таиланд",
  "Тунис",
  "Турция",
  "Узбекистан",
  "Филиппины",
  "Финляндия",
  "Франция",
  "Хорватия",
  "Черногория",
  "Чехия",
  "Шри-Ланка",
  "Япония",
];

export const LANGUAGE_OPTIONS = [
  "Русский",
  "English",
  "Deutsch",
  "Italiano",
  "Español",
  "Français",
  "Português",
  "Polski",
  "Türkçe",
  "Қазақша",
  "Українська",
  "Беларуская",
  "עברית",
  "中文",
  "日本語",
];

export const SMOKING_OPTIONS = ["Курю", "Не курю"];

export const HOSTING_ROLES = ["Принимаю гостей", "Ищу приём"];

export const MAX_DESTINATIONS = 10;
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 250;
