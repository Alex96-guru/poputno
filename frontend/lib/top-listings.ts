import type { TopGroup } from "./types";

/**
 * Curated content for the home page's "Топ-объявления" shelves.
 *
 * Held on the client for now: these are editorial picks with a richer shape
 * than /api/persons serves, and the listings backend does not exist yet. When
 * it lands, this moves behind an endpoint the same way persons did.
 */

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`;

export const TOP_GROUPS: TopGroup[] = [
  {
    key: "trips",
    title: "Путешествия",
    caption: "Попутчики в поездки прямо сейчас",
    listings: [
      {
        id: "trip-1",
        name: "Мария",
        age: 28,
        rating: 4.9,
        photoUrl: unsplash("photo-1684361436119-5707854d29e4"),
        location: "Россия, Сочи",
        description: "Санаторий и море на 9 дней. Ищу спокойную компанию…",
        meta: "26 июл",
        online: true,
        featured: true,
      },
      {
        id: "trip-2",
        name: "Оля",
        age: 31,
        rating: 5.0,
        photoUrl: unsplash("photo-1711645169736-53327e726205"),
        location: "ОАЭ · Мальдивы",
        description: "Тёплый океан и новые знакомства. Даты гибкие…",
        meta: "авг",
      },
      {
        id: "trip-3",
        name: "Аня",
        age: 26,
        rating: 4.8,
        photoUrl: unsplash("photo-1525786210598-d527194d3e9a"),
        location: "Куда угодно",
        description: "Япония, Черногория, Марокко — открыта к идеям…",
        meta: "гибко",
        online: true,
      },
      {
        id: "trip-4",
        name: "Тимур",
        age: 33,
        rating: 4.7,
        photoUrl: unsplash("photo-1587837073080-448bc6a2329b"),
        location: "Турция",
        description: "Море, прогулки и вкусная еда. Ищу лёгкую компанию…",
        meta: "31 авг",
        featured: true,
      },
    ],
  },
  {
    key: "meetups",
    title: "Встречи",
    caption: "Кто хочет встретиться и провести время",
    listings: [
      {
        id: "meet-1",
        name: "Лена",
        age: 27,
        rating: 4.9,
        photoUrl: unsplash("photo-1535295972055-1c762f4483e5"),
        location: "Москва",
        description: "Кофе и прогулки по центру на выходных…",
        meta: "2 дня",
        online: true,
        featured: true,
      },
      {
        id: "meet-2",
        name: "Кирилл",
        age: 30,
        rating: 4.8,
        photoUrl: unsplash("photo-1661859425965-0dc4dd6fb907"),
        location: "Санкт-Петербург",
        description: "Выставки и концерты, ищу приятную компанию…",
        meta: "сегодня",
      },
      {
        id: "meet-3",
        name: "Даша",
        age: 24,
        rating: 5.0,
        photoUrl: unsplash("photo-1581182830442-e8bc7babbf15"),
        location: "Казань",
        description: "Настолки и бары по пятницам, ищу своих…",
        meta: "пт",
        online: true,
      },
      {
        id: "meet-4",
        name: "Артём",
        age: 29,
        rating: 4.7,
        photoUrl: unsplash("photo-1677504047237-e1eff274275f"),
        location: "Сочи",
        description: "Утренние пробежки и сёрф, ищу активных…",
        meta: "утро",
      },
    ],
  },
  {
    key: "hosting",
    title: "В гости",
    caption: "Местные принимают гостей и показывают традиции",
    listings: [
      {
        id: "host-1",
        name: "Магомед",
        age: 34,
        rating: 5.0,
        photoUrl: unsplash("photo-1649111601711-ebcb28b4b6d1"),
        location: "Дагестан, Махачкала",
        description: "Приму гостей, покажу горы и традиции, накормлю домашним…",
        meta: "готов принять",
        status: "Принимаю",
        online: true,
        featured: true,
      },
      {
        id: "host-2",
        name: "Настя",
        age: 26,
        rating: 4.8,
        photoUrl: unsplash("photo-1519744434498-a0de604df9db"),
        location: "Еду в Грузию",
        description: "Ищу, кто примет на пару дней и покажет настоящую жизнь…",
        meta: "12–16 авг",
        status: "Ищу приём",
      },
      {
        id: "host-3",
        name: "Алия",
        age: 29,
        rating: 4.9,
        photoUrl: unsplash("photo-1554202413-28a60c0c2c3d"),
        location: "Казань, Татарстан",
        description: "Открою двери, экскурсия по старому городу и чак-чак…",
        meta: "на выходные",
        status: "Принимаю",
        online: true,
      },
      {
        id: "host-4",
        name: "Иван",
        age: 38,
        rating: 4.7,
        photoUrl: unsplash("photo-1634149588277-fa4a2b690fd0"),
        location: "Республика Алтай",
        description: "Живу в горах, приму путников — баня, звёзды и тишина…",
        meta: "круглый год",
        status: "Принимаю",
        featured: true,
      },
    ],
  },
  {
    key: "friends",
    title: "Друзья по интересам",
    caption: "Люди с похожими увлечениями",
    listings: [
      {
        id: "friend-1",
        name: "Настя",
        age: 25,
        rating: 4.9,
        photoUrl: unsplash("photo-1586246698829-4258572d1e76"),
        interests: ["Автотрип", "Пляж", "Поход", "Выставка"],
        commonInterests: 4,
        online: true,
      },
      {
        id: "friend-2",
        name: "Марк",
        age: 32,
        rating: 4.8,
        photoUrl: unsplash("photo-1644966486873-39171635ab43"),
        interests: ["Ланч", "Комедия", "Исторический"],
        commonInterests: 3,
      },
      {
        id: "friend-3",
        name: "Оля",
        age: 27,
        rating: 5.0,
        photoUrl: unsplash("photo-1644945570917-1585f682efaa"),
        interests: ["Театр", "Латина", "Караоке"],
        commonInterests: 5,
        online: true,
      },
      {
        id: "friend-4",
        name: "Дима",
        age: 29,
        rating: 4.7,
        photoUrl: unsplash("photo-1656339504243-2df4c5ebf1c0"),
        interests: ["Велосипед", "Бадминтон", "Спортзал"],
        commonInterests: 3,
      },
    ],
  },
];

/** Interest chips shown above the "Друзья по интересам" shelf. */
export const FRIEND_CHIPS: { label: string; dot: string }[] = [
  { label: "Комедия", dot: "bg-accent" },
  { label: "Театр", dot: "bg-teal" },
  { label: "Ланч", dot: "bg-gold" },
  { label: "Выставка", dot: "bg-teal" },
  { label: "Велосипед", dot: "bg-[#3BB273]" },
  { label: "Прогулка в парке", dot: "bg-teal" },
  { label: "Спортзал", dot: "bg-[#3BB273]" },
  { label: "Экскурсия", dot: "bg-accent" },
];

/** Interests the user picked that do not fit in the chip row above. */
export const FRIEND_CHIPS_MORE = 42;
