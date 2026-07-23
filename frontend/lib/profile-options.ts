import {
  Bike,
  Clapperboard,
  GraduationCap,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Choices offered on the "Заполнение профиля" screen.
 *
 * The stored value is the label itself, so these lists mirror the tuples in
 * backend/schemas.py — the server rejects anything outside them. Keep both
 * sides in step when adding an option.
 */

export interface InterestCategory {
  key: string;
  name: string;
  icon: LucideIcon;
  /** Tailwind classes for the round icon tile in the card header. */
  tile: string;
  items: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    key: "active",
    name: "Активный отдых",
    icon: Bike,
    tile: "bg-teal-soft text-teal",
    items: [
      "Велосипед",
      "Спортзал",
      "Бассейн",
      "Бег",
      "Самокат",
      "Коньки",
      "Лыжи",
      "Йога",
      "Теннис",
      "Ролики",
      "Бадминтон",
      "Тюбинг",
      "Автотрип",
      "Пляж",
      "Поход",
      "Верховая езда",
    ],
  },
  {
    key: "meetups",
    name: "Встречи, игры",
    icon: Users,
    tile: "bg-accent-soft text-accent-ink",
    items: [
      "Ланч",
      "За покупками",
      "Выгул собак",
      "Боулинг",
      "Настольные игры",
      "Бильярд",
      "Иностранные языки",
      "Настольный теннис",
      "Уличные игры",
      "Прогулка с детьми",
    ],
  },
  {
    key: "cinema",
    name: "Кино",
    icon: Clapperboard,
    tile: "bg-[#FBEFD8] text-gold",
    items: ["Комедия", "Фантастика", "Исторический", "Научный", "Ужасы", "Мульт"],
  },
  {
    key: "culture",
    name: "Культура, музыка, отдых",
    icon: Landmark,
    tile: "bg-teal-soft text-teal",
    items: [
      "Театр",
      "Выставка",
      "Прогулка в парке",
      "Экскурсия",
      "Фото-прогулка",
      "Концерт",
      "Дискотека",
      "Караоке",
      "Латина",
      "Бальные танцы",
      "Хастл",
    ],
  },
  {
    key: "workshops",
    name: "Мастер-классы",
    icon: GraduationCap,
    tile: "bg-teal-soft text-teal",
    items: ["Кулинария", "Личностный рост", "Живопись", "Бизнес"],
  },
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
  "中文",
  "日本語",
];

export const SMOKING_OPTIONS = ["Не курю", "Курю"];

export const MARITAL_OPTIONS = [
  "Не женат / не замужем",
  "В отношениях",
  "Женат / замужем",
  "В разводе",
  "Вдовец / вдова",
];

export const CHILDREN_OPTIONS = [
  "Нет детей",
  "Есть, живут со мной",
  "Есть, живут отдельно",
  "Есть, уже взрослые",
];

export const PETS_OPTIONS = [
  "Нет питомцев",
  "Собака",
  "Кошка",
  "Собака и кошка",
  "Другой питомец",
];

export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 250;

/** Total number of activity chips, for the "выбрано N из M" counter. */
export const INTERESTS_TOTAL = INTEREST_CATEGORIES.reduce(
  (sum, category) => sum + category.items.length,
  0,
);
