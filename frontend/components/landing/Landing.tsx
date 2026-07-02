import Link from "next/link";
import {
  Compass,
  Lock,
  Play,
  Plane,
  Search,
  UserPlus,
  Users,
  UserRoundSearch,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PersonCard from "@/components/PersonCard";
import Reveal from "@/components/Reveal";
import type { Person } from "@/lib/types";

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

export default function Landing() {
  return (
    <div className="bg-bg">
      <GuestNav />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <PreviewSection />
        <DestinationsSection />
        <ReviewsSection />
        <CtaBand />
      </main>
      <LandingFooter />
    </div>
  );
}

/* ---------------------------------------------------------------- Nav */

function GuestNav() {
  return (
    <header className="sticky top-0 z-50 h-[78px] border-b border-border bg-white/[0.97] backdrop-blur">
      <div className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-5 sm:px-8 lg:px-20">
        <Link href="/" className="flex shrink-0 items-center gap-[9px]">
          <Compass className="h-7 w-7 text-accent" strokeWidth={2} />
          <span className="font-display text-[22px] font-bold text-ink sm:text-[25px]">
            Попутно
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex xl:gap-[38px]">
          {["Как это работает", "Направления", "Отзывы"].map((label) => (
            <a
              key={label}
              href="#"
              className="text-[16px] font-medium text-muted transition hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3.5">
          <Link
            href="/login"
            className="hidden rounded-btn px-3 py-2.5 text-[15px] font-semibold text-ink transition hover:bg-surface-2 sm:block sm:px-[18px]"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="rounded-btn bg-accent px-[22px] py-[11px] text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(192,86,60,0.2)] transition hover:bg-accent-ink"
          >
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- Hero */

const HERO_COL_A = [
  { id: "photo-1610731237344-a75ce23e4ab5", h: 290 },
  { id: "photo-1584984647264-7e6f4e6d6b91", h: 210 },
];
const HERO_COL_B = [
  { id: "photo-1608229321710-1caa06bc5269", h: 210 },
  { id: "photo-1758928478869-263cdbcd2dc3", h: 290 },
];
const TRUST_AVATARS = [
  "photo-1636393915605-359f65e81082",
  "photo-1600002554191-2dd6945302f9",
  "photo-1504275490777-45f30792f13f",
  "photo-1529218164294-0d21b06ea831",
];

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-[#F7EDE2] to-bg">
      <div className="mx-auto flex max-w-content flex-col gap-12 px-5 pb-16 pt-12 sm:px-8 lg:flex-row lg:items-center lg:gap-14 lg:px-20 lg:pb-[100px] lg:pt-[76px]">
        <Reveal className="flex w-full min-w-0 flex-col gap-6 lg:w-auto lg:flex-1">
          <span className="text-[14px] font-bold uppercase tracking-[2.5px] text-accent-ink">
            Сообщество путешественников
          </span>
          <h1 className="font-display text-[30px] sm:text-[40px] font-bold leading-[1.04] text-ink sm:text-[54px] lg:text-[66px]">
            Найди своего попутчика
          </h1>
          <p className="max-w-[560px] text-[17px] leading-[1.55] text-muted sm:text-[19px]">
            Тысячи людей ищут компанию для поездок прямо сейчас. Присоединяйся к
            сообществу и находи своих — по духу, направлению и датам.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/catalog"
              className="flex items-center gap-2.5 rounded-btn bg-accent px-[30px] py-[17px] text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink"
            >
              <Search className="h-5 w-5" strokeWidth={2.5} />
              Найти попутчиков
            </Link>
            <a
              href="#how"
              className="flex items-center gap-2.5 rounded-btn border border-border bg-white px-[26px] py-[17px] text-[16px] font-semibold text-ink transition hover:border-accent"
            >
              <Play className="h-[17px] w-[17px]" />
              Как это работает
            </a>
          </div>

          <div className="flex items-center gap-3.5 pt-2.5">
            <div className="flex items-center">
              {TRUST_AVATARS.map((id, i) => (
                <span
                  key={id}
                  className="h-9 w-9 rounded-pill border-2 border-bg bg-cover bg-center"
                  style={{
                    marginLeft: i === 0 ? 0 : -12,
                    backgroundImage: `url(${img(id, 100)})`,
                  }}
                />
              ))}
            </div>
            <span className="text-[15px] font-medium text-muted">
              5 000+ путешественников уже с нами
            </span>
          </div>
        </Reveal>

        <Reveal delay={120} className="grid w-full max-w-[482px] grid-cols-2 gap-[18px] lg:flex lg:w-auto">
          <HeroCollageColumn photos={HERO_COL_A} />
          <HeroCollageColumn photos={HERO_COL_B} offset />
        </Reveal>
      </div>
    </section>
  );
}

function HeroCollageColumn({
  photos,
  offset = false,
}: {
  photos: { id: string; h: number }[];
  offset?: boolean;
}) {
  return (
    <div
      className="flex min-w-0 flex-col gap-[18px]"
      style={{ paddingTop: offset ? 46 : 0 }}
    >
      {photos.map(({ id, h }) => (
        <div
          key={id}
          className="w-full rounded-card bg-cover bg-center lg:w-[232px]"
          style={{ height: h, backgroundImage: `url(${img(id)})` }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------- How it works */

interface Step {
  icon: LucideIcon;
  number: string;
  title: string;
  lines: [string, string];
}

const STEPS: Step[] = [
  {
    icon: UserPlus,
    number: "01",
    title: "Создайте профиль",
    lines: [
      "Расскажите о себе, своих маршрутах и привычках в дороге.",
      "Хороший профиль вызывает доверие у будущих попутчиков.",
    ],
  },
  {
    icon: Users,
    number: "02",
    title: "Найдите попутчика",
    lines: [
      "Ищите людей по направлению, датам и общим интересам.",
      "Фильтры помогут подобрать компанию именно под ваш маршрут.",
    ],
  },
  {
    icon: Plane,
    number: "03",
    title: "Отправляйтесь вместе",
    lines: [
      "Договоритесь о деталях в чате и планируйте поездку.",
      "Делите расходы, впечатления и открывайте мир вдвоём.",
    ],
  },
];

function HowItWorksSection() {
  return (
    <section id="how" className="bg-bg px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto flex max-w-content flex-col items-center gap-14">
        <Reveal className="flex w-[720px] max-w-full flex-col items-center gap-4 text-center">
          <h2 className="font-display text-[30px] sm:text-[40px] font-semibold text-ink">
            Как это работает
          </h2>
          <p className="text-[17px] text-muted">
            Три простых шага — и вы уже в дороге с новым попутчиком, который
            разделит и путь, и впечатления.
          </p>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 110} className="h-full">
              <StepCard step={step} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step: { icon: Icon, number, title, lines } }: { step: Step }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-border bg-white p-9">
      <div className="flex items-center justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-pill bg-accent-soft text-accent-ink">
          <Icon className="h-[26px] w-[26px]" />
        </span>
        <span className="font-display text-[34px] font-semibold text-accent">
          {number}
        </span>
      </div>
      <h3 className="font-display text-[22px] font-semibold text-ink">{title}</h3>
      <div className="flex flex-col gap-1.5">
        {lines.map((line) => (
          <p key={line} className="text-[15px] leading-[1.5] text-muted">
            {line}
          </p>
        ))}
      </div>
    </article>
  );
}

/* ------------------------------------------------------- Locked preview */

const PREVIEW: Person[] = [
  {
    id: "p1",
    name: "Мария, 28",
    companyType: "Ищу компанию",
    location: "Грузия · Тбилиси",
    dates: "12–20 июля",
    description:
      "Люблю горы и вино. Ищу лёгких на подъём попутчиков для хайкинга.",
    rating: 4.9,
    photoUrl: img("photo-1506863530036-1efeddceb993", 600),
  },
  {
    id: "p2",
    name: "Алексей, 34",
    companyType: "Гид по городу",
    location: "Турция · Стамбул",
    dates: "5–14 августа",
    description:
      "Фотограф в отпуске. Хочу гулять по городу и пробовать местную кухню.",
    rating: 4.8,
    photoUrl: img("photo-1637059880830-59a90102de77", 600),
  },
  {
    id: "p3",
    name: "Аня и Пётр, 30",
    companyType: "Пара · ищем компанию",
    location: "Армения · Ереван",
    dates: "1–10 сентября",
    description:
      "Путешествуем вдвоём, ищем пару для совместных поездок по стране.",
    rating: 5.0,
    photoUrl: img("photo-1653764635119-1e4d1e8d073d", 600),
  },
  {
    id: "p4",
    name: "Друзья, 25–29",
    companyType: "Компания друзей",
    location: "Грузия · Батуми",
    dates: "18–27 июля",
    description:
      "Компания из трёх человек. Море, вечеринки и road trip вдоль побережья.",
    rating: 4.7,
    photoUrl: img("photo-1642775073532-65020022b8d0", 600),
  },
];

function PreviewSection() {
  return (
    <section className="bg-bg px-5 py-16 sm:px-8 lg:px-40 lg:py-24">
      <div className="mx-auto flex max-w-content flex-col gap-7">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-[30px] sm:text-[40px] font-bold text-ink">
            Сотни попутчиков уже ищут компанию
          </h2>
          <p className="text-[18px] text-muted">
            Зарегистрируйтесь, чтобы увидеть все объявления целиком
          </p>
        </Reveal>

        <Reveal className="relative">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {PREVIEW.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-card bg-bg/75 text-center backdrop-blur-[5px]">
            <span className="grid h-16 w-16 place-items-center rounded-pill bg-accent-soft text-accent-ink">
              <Lock className="h-7 w-7" />
            </span>
            <h3 className="font-display text-[26px] font-bold text-ink">
              Зарегистрируйтесь, чтобы смотреть
            </h3>
            <p className="text-[15px] text-muted">
              Бесплатно · займёт меньше минуты
            </p>
            <div className="flex items-center gap-4 pt-1.5">
              <Link
                href="/register"
                className="rounded-btn bg-accent px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-accent-ink"
              >
                Регистрация
              </Link>
              <Link
                href="/login"
                className="px-3 py-3.5 text-[15px] font-semibold text-accent-ink transition hover:text-accent"
              >
                Войти
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Destinations */

const DESTINATIONS = [
  { name: "Грузия", id: "photo-1505294399615-2479253a4990" },
  { name: "Бали", id: "photo-1513415756790-2ac1db1297d0" },
  { name: "Турция", id: "photo-1647955950690-989aaa0475e0" },
  { name: "Португалия", id: "photo-1599069158346-684fee0e414a" },
  { name: "Армения", id: "photo-1772135893499-f3eb73a7c26f" },
  { name: "Исландия", id: "photo-1503673508983-5f2fbaf1df4d" },
];

function DestinationsSection() {
  return (
    <section className="bg-surface-2 px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto flex max-w-content flex-col items-center gap-14">
        <Reveal className="flex w-[720px] max-w-full flex-col items-center gap-4 text-center">
          <h2 className="font-display text-[30px] sm:text-[40px] font-semibold text-ink">
            Популярные направления
          </h2>
          <p className="text-[17px] text-muted">
            Места, куда чаще всего отправляются наши путешественники в поисках
            новых маршрутов и попутчиков.
          </p>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map(({ name, id }, i) => (
            <Reveal key={name} delay={(i % 3) * 100}>
              <div
                className="flex h-60 flex-col justify-end rounded-card bg-cover bg-center p-5"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.69) 100%), url(${img(id, 800)})`,
                }}
              >
                <span className="font-display text-[22px] font-semibold text-white">
                  {name}
                </span>
                <span className="text-[14px] text-white/80">
                  больше 100 попутчиков
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Reviews */

const REVIEWS = [
  {
    quote:
      "Нашла попутчицу за пару дней и вместе объездили половину Грузии. Дорога вдвоём совсем другая — спокойнее и веселее.",
    name: "Анна Соколова",
    line: "Москва · Ездила в Грузию",
    avatar: "photo-1636393915605-359f65e81082",
  },
  {
    quote:
      "Искал компанию в горы Алтая и познакомился с ребятами, с которыми теперь планируем новый маршрут. Сервис очень удобный.",
    name: "Дмитрий Орлов",
    line: "Екатеринбург · Поход на Алтай",
    avatar: "photo-1600002554191-2dd6945302f9",
  },
  {
    quote:
      "Разделили дорогу и расходы до Калининграда. Общение приятное, всё прозрачно и безопасно. Обязательно вернусь снова.",
    name: "Марина Ким",
    line: "Санкт-Петербург · Поездка в Калининград",
    avatar: "photo-1504275490777-45f30792f13f",
  },
];

function ReviewsSection() {
  return (
    <section className="bg-surface-2 px-5 pb-16 pt-0 sm:px-8 lg:px-20 lg:pb-24">
      <div className="mx-auto flex max-w-content flex-col items-center gap-14">
        <Reveal className="flex w-[760px] max-w-full flex-col items-center gap-4 text-center">
          <h2 className="font-display text-[30px] sm:text-[40px] font-semibold text-ink">
            Отзывы путешественников
          </h2>
          <p className="text-[17px] text-muted">
            Реальные истории тех, кто нашёл компанию для своих поездок через
            «Попутно».
          </p>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.name} delay={i * 110} className="h-full">
              <article className="flex h-full flex-col gap-4 rounded-card border border-border bg-white p-7">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-[15px] w-[15px] fill-gold text-gold" />
                ))}
              </div>
              <p className="text-[16px] leading-[1.6] text-ink">
                {review.quote}
              </p>
                <div className="flex items-center gap-3.5">
                  <span
                    className="h-12 w-12 rounded-pill bg-cover bg-center bg-surface-2"
                    style={{ backgroundImage: `url(${img(review.avatar, 120)})` }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-ink">
                      {review.name}
                    </span>
                    <span className="text-[13px] text-subtle">
                      {review.line}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- CTA band */

function CtaBand() {
  return (
    <section className="bg-gradient-to-br from-accent to-accent-ink px-5 py-16 sm:px-8 lg:px-20 lg:py-[90px]">
      <Reveal className="mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center">
        <h2 className="font-display text-[32px] font-bold text-white sm:text-[46px]">
          Готовы найти своего попутчика?
        </h2>
        <p className="text-[18px] leading-[1.5] text-white/80">
          Присоединяйтесь к сообществу путешественников и находите компанию для
          любых поездок за пару минут.
        </p>
        <div className="flex items-center gap-3.5">
          <Link
            href="/register"
            className="rounded-btn bg-white px-8 py-[15px] text-[16px] font-semibold text-accent-ink transition hover:bg-white/90"
          >
            Регистрация
          </Link>
          <Link
            href="/login"
            className="rounded-btn border-[1.5px] border-white px-8 py-[15px] text-[16px] font-semibold text-white transition hover:bg-white/10"
          >
            Войти
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------- Footer */

const FOOTER_COLUMNS = [
  {
    title: "Сервис",
    items: [
      "Поиск попутчиков",
      "Каталог поездок",
      "Как это работает",
      "Безопасность",
    ],
  },
  { title: "Компания", items: ["О нас", "Блог", "Вакансии"] },
  { title: "Помощь", items: ["Поддержка", "Вопросы и ответы", "Контакты"] },
];

function LandingFooter() {
  return (
    <footer className="bg-ink px-5 pb-9 pt-14 text-white sm:px-8 lg:px-20">
      <div className="mx-auto flex max-w-content flex-col gap-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="flex w-full flex-col gap-4 md:w-[360px]">
            <div className="flex items-center gap-2.5">
              <Compass className="h-[26px] w-[26px] text-accent" />
              <span className="font-display text-[24px] font-bold text-white">
                Попутно
              </span>
            </div>
            <p className="text-[14px] leading-[1.6] text-white/70">
              Сервис для поиска попутчиков и совместных путешествий по России и
              миру.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex md:gap-20">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3.5">
                <h3 className="text-[15px] font-semibold text-white">
                  {col.title}
                </h3>
                {col.items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-[14px] text-white/50 transition hover:text-white"
                  >
                    {item}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t border-white/10" />

        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <span className="text-[13px] text-white/50">© 2026 Попутно</span>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-[13px] text-white/50">
            <a href="#" className="transition hover:text-white">
              Политика конфиденциальности
            </a>
            <a href="#" className="transition hover:text-white">
              Условия использования
            </a>
            <a href="#" className="transition hover:text-white">
              Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}