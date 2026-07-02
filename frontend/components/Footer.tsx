import Link from "next/link";
import { Compass } from "lucide-react";

interface Column {
  title: string;
  items: string[];
}

const COLUMNS: Column[] = [
  {
    title: "Сервис",
    items: [
      "Найти попутчиков",
      "Направления",
      "Как это работает",
      "Создать объявление",
    ],
  },
  {
    title: "Компания",
    items: ["О нас", "Отзывы", "Блог", "Контакты"],
  },
  {
    title: "Помощь",
    items: ["Безопасность", "Правила", "Поддержка", "FAQ"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink px-5 pb-9 pt-14 text-white sm:px-8 lg:px-20">
      <div className="mx-auto flex max-w-content flex-col gap-9">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="flex w-full flex-col gap-3 md:w-[360px]">
            <Link href="/" className="flex items-center gap-[9px]">
              <Compass className="h-[26px] w-[26px] text-accent" />
              <span className="font-display text-[24px] font-bold text-white">
                Попутно
              </span>
            </Link>
            <p className="text-[14px] leading-[1.5] text-white/70">
              Сервис для поиска попутчиков и компании в путешествиях.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex md:gap-16">
            {COLUMNS.map((col) => (
              <FooterColumn key={col.title} {...col} />
            ))}
          </div>
        </div>

        <hr className="border-t border-white/10" />

        <div className="flex flex-col gap-2 text-center text-[13px] text-white/50 md:flex-row md:items-center md:justify-between md:text-left">
          <span>© 2026 Попутно. Все права защищены.</span>
          <span>Политика конфиденциальности · Условия использования</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: Column) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-bold text-white">{title}</h3>
      {items.map((item) => (
        <a
          key={item}
          href="#"
          className="text-[14px] text-white/70 transition hover:text-white"
        >
          {item}
        </a>
      ))}
    </div>
  );
}