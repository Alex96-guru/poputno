import Link from "next/link";
import {
  Backpack,
  Calendar,
  ExternalLink,
  MapPin,
  Paperclip,
  Pencil,
  Phone,
  Search,
  SendHorizontal,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";

const img = (id: string, w = 200) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

interface Chat {
  name: string;
  time: string;
  message: string;
  avatar: string;
  online?: boolean;
  unread?: number;
  active?: boolean;
}

const CHATS: Chat[] = [
  {
    name: "Аня Соколова",
    time: "12:40",
    message: "Отлично! Тогда договорились на 14-е",
    avatar: "photo-1506863530036-1efeddceb993",
    online: true,
    unread: 2,
    active: true,
  },
  {
    name: "Максим Реутов",
    time: "11:05",
    message: "Скинул маршрут по Грузии 🏔",
    avatar: "photo-1654155427842-a4a249bf693e",
  },
  {
    name: "Лена и Кирилл",
    time: "вчера",
    message: "Мы вылетаем из Москвы 20-го",
    avatar: "photo-1770582071362-cd81aa9bd895",
  },
  {
    name: "Даша Ветрова",
    time: "вчера",
    message: "А какой бюджет закладываешь?",
    avatar: "photo-1744880034087-b570c77c762e",
    online: true,
    unread: 1,
  },
  {
    name: "Чат · Бали февраль",
    time: "пн",
    message: "Игорь: кто ещё берёт байк?",
    avatar: "photo-1706350338997-d57d49a9c83e",
  },
  {
    name: "Артём Смирнов",
    time: "28 июн",
    message: "Спасибо за отзыв, было круто!",
    avatar: "photo-1672685667592-0392f458f46f",
  },
];

interface Bubble {
  side: "in" | "out";
  text: string;
  time: string;
}

const MESSAGES: Bubble[] = [
  {
    side: "in",
    text: "Привет! Увидела твоё объявление про Грузию 🏔 Ещё ищешь компанию?",
    time: "12:18",
  },
  {
    side: "out",
    text: "Привет! Да, ищем 🙌 Планируем 12–20 июля: хайкинг и немного вина 🍷",
    time: "12:24",
  },
  { side: "in", text: "Идеально 😍 А сколько вас едет?", time: "12:26" },
  {
    side: "out",
    text: "Пока трое. Как раз ищем ещё 1–2 попутчиков 🚗",
    time: "12:28",
  },
  {
    side: "in",
    text: "Мы с подругой как раз хотели туда! Куда лететь и какой бюджет?",
    time: "12:31",
  },
  {
    side: "out",
    text: "Скину маршрут и детали по деньгам вечером, ок? 🙂",
    time: "12:33",
  },
];

const CHIPS = ["Все", "Непрочитанные", "Группы"];
const PARTICIPANTS = [
  "photo-1450133064473-71024230f91b",
  "photo-1616002411355-49593fd89721",
  "photo-1727341557531-343cd4364501",
];

export default function Messenger() {
  return (
    <div className="flex h-[calc(100vh-78px)] overflow-hidden bg-bg">
      <ChatList />
      <Conversation />
      <TripRail />
    </div>
  );
}

/* ---------------------------------------------------------- Chat list */

function ChatList() {
  return (
    <aside className="hidden w-[360px] shrink-0 flex-col border-r border-border bg-white md:flex">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[26px] font-bold text-ink">
            Сообщения
          </h1>
          <span className="grid h-10 w-10 place-items-center rounded-pill bg-surface-2 text-muted">
            <Pencil className="h-[18px] w-[18px]" />
          </span>
        </div>

        <div className="flex items-center gap-2.5 rounded-pill bg-surface-2 px-4 py-3">
          <Search className="h-[18px] w-[18px] text-subtle" />
          <span className="text-[15px] text-subtle">Поиск по чатам</span>
        </div>

        <div className="flex gap-2">
          {CHIPS.map((chip, i) => (
            <span
              key={chip}
              className={`rounded-pill px-3.5 py-[7px] text-[13px] font-semibold ${
                i === 0
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-muted"
              }`}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        {CHATS.map((chat) => (
          <ChatRow key={chat.name} chat={chat} />
        ))}
      </div>
    </aside>
  );
}

function ChatRow({ chat }: { chat: Chat }) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-btn p-3 transition ${
        chat.active ? "bg-accent-soft" : "hover:bg-surface-2"
      }`}
    >
      <div className="relative shrink-0">
        <span
          className="block h-[52px] w-[52px] rounded-pill bg-cover bg-center bg-surface-2"
          style={{ backgroundImage: `url(${img(chat.avatar, 120)})` }}
        />
        {chat.online && (
          <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-pill border-2 border-white bg-[#3BB273]" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[15px] font-bold text-ink">
            {chat.name}
          </span>
          <span
            className={`shrink-0 text-[12px] ${chat.unread ? "text-accent-ink" : "text-subtle"}`}
          >
            {chat.time}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-[13px] ${chat.unread ? "text-ink" : "text-muted"}`}
          >
            {chat.message}
          </span>
          {chat.unread && (
            <span className="grid h-5 min-w-[20px] shrink-0 place-items-center rounded-pill bg-accent px-1 text-[11px] font-bold text-white">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Conversation */

function Conversation() {
  return (
    <section className="flex flex-1 flex-col bg-bg">
      <header className="flex items-center gap-3.5 border-b border-border bg-white px-5 py-3.5 lg:px-7">
        <div className="relative shrink-0">
          <span
            className="block h-12 w-12 rounded-pill bg-cover bg-center bg-surface-2"
            style={{ backgroundImage: `url(${img("photo-1650100662719-1d73b6faa50a", 120)})` }}
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-pill border-2 border-white bg-[#3BB273]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[17px] font-bold text-ink">Аня Соколова</span>
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <span className="text-[#3BB273]">в сети</span>
            <span className="text-subtle">·</span>
            <span className="truncate">Грузия · 12–20 июля</span>
          </span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {[Search, Phone, MoreVertical].map((Icon, i) => (
            <span
              key={i}
              className="grid h-[42px] w-[42px] place-items-center rounded-pill bg-surface-2 text-muted"
            >
              <Icon className="h-[19px] w-[19px]" />
            </span>
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 sm:p-6 lg:px-11">
        <div className="flex justify-center">
          <span className="rounded-pill bg-surface-2 px-4 py-1.5 text-[12px] font-semibold text-subtle">
            Сегодня
          </span>
        </div>

        <MessageBubble bubble={MESSAGES[0]} />
        <MessageBubble bubble={MESSAGES[1]} />
        <MessageBubble bubble={MESSAGES[2]} />

        <div className="flex justify-end">
          <TripCard />
        </div>

        <MessageBubble bubble={MESSAGES[3]} />
        <MessageBubble bubble={MESSAGES[4]} />
        <MessageBubble bubble={MESSAGES[5]} />
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-white px-4 py-4 sm:px-7">
        <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-pill bg-surface-2 text-muted">
          <Paperclip className="h-5 w-5" />
        </span>
        <input
          placeholder="Напишите сообщение…"
          className="h-[46px] flex-1 rounded-pill bg-surface-2 px-[18px] text-[15px] text-ink outline-none placeholder:text-subtle"
        />
        <button className="flex shrink-0 items-center gap-2 rounded-pill bg-accent px-[18px] py-3 text-[15px] font-semibold text-white transition hover:bg-accent-ink sm:px-[22px]">
          <SendHorizontal className="h-[19px] w-[19px]" />
          <span className="hidden sm:inline">Отправить</span>
        </button>
      </div>
    </section>
  );
}

function MessageBubble({ bubble }: { bubble: Bubble }) {
  const out = bubble.side === "out";
  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[78%] flex-col gap-1 px-4 py-3 sm:max-w-[440px] ${
          out
            ? "rounded-[20px] rounded-br-[6px] bg-accent text-white"
            : "rounded-[20px] rounded-bl-[6px] border border-border bg-white text-ink shadow-[0_2px_8px_rgba(42,37,33,0.05)]"
        }`}
      >
        <span className="text-[15px] leading-[1.4]">{bubble.text}</span>
        <span
          className={`text-right text-[11px] ${out ? "text-white/70" : "text-subtle"}`}
        >
          {bubble.time}
        </span>
      </div>
    </div>
  );
}

function TripCard() {
  return (
    <Link
      href="/listing/1"
      className="flex w-[320px] max-w-full items-center gap-3 rounded-[16px] border border-border bg-white p-2.5 shadow-[0_2px_8px_rgba(42,37,33,0.05)] transition hover:border-accent"
    >
      <span
        className="h-[66px] w-[66px] shrink-0 rounded-[12px] bg-cover bg-center bg-surface-2"
        style={{ backgroundImage: `url(${img("photo-1536970133011-278d129e072e", 200)})` }}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-[16px] font-bold text-ink">
          Аня · Грузия
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <Calendar className="h-[13px] w-[13px] text-subtle" />
          12–20 июля · Тбилиси
        </span>
        <span className="text-[12px] font-semibold text-accent-ink">
          Смотреть объявление →
        </span>
      </div>
    </Link>
  );
}

/* ---------------------------------------------------------- Trip rail */

const RAIL_META = [
  { icon: MapPin, text: "Тбилиси · Казбеги · Кахетия" },
  { icon: Calendar, text: "12–20 июля 2026" },
  { icon: Backpack, text: "Горы, хайкинг и вино" },
];

function TripRail() {
  return (
    <aside className="hidden w-[344px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-border bg-white p-6 xl:flex">
      <span className="text-[13px] font-bold tracking-[0.4px] text-subtle">
        ПОПУТЧИК
      </span>

      <div
        className="flex h-[236px] items-start rounded-card bg-cover bg-center p-3"
        style={{ backgroundImage: `url(${img("photo-1603048675767-6e79ff5b8fc1", 600)})` }}
      >
        <span className="rounded-pill bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-ink">
          Ищет компанию
        </span>
      </div>

      <h2 className="font-display text-[21px] font-bold text-ink">
        Аня Соколова, 27
      </h2>

      <div className="flex flex-col gap-2.5">
        {RAIL_META.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-[14px] text-muted">
            <Icon className="h-[17px] w-[17px] shrink-0 text-accent" />
            {text}
          </div>
        ))}
      </div>

      <hr className="border-t border-border" />

      <span className="text-[14px] font-bold text-ink">Попутчики · 3 из 5</span>
      <div className="flex items-center">
        {PARTICIPANTS.map((id, i) => (
          <span
            key={id}
            className="h-10 w-10 rounded-pill border-2 border-white bg-cover bg-center bg-surface-2"
            style={{ marginLeft: i === 0 ? 0 : -10, backgroundImage: `url(${img(id, 100)})` }}
          />
        ))}
        <span className="-ml-2.5 grid h-10 w-10 place-items-center rounded-pill border-2 border-white bg-accent-soft text-[13px] font-bold text-accent-ink">
          +2
        </span>
      </div>

      <Link
        href="/listing/1"
        className="flex items-center justify-center gap-2 rounded-btn bg-accent py-3.5 text-[15px] font-semibold text-white transition hover:bg-accent-ink"
      >
        <ExternalLink className="h-[18px] w-[18px]" />
        Открыть объявление
      </Link>

      <div className="flex gap-2.5 rounded-btn bg-teal-soft p-3.5">
        <ShieldCheck className="h-5 w-5 shrink-0 text-teal" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold text-teal">
            Безопасное общение
          </span>
          <span className="text-[12px] leading-[1.4] text-teal">
            Не переводите предоплату до встречи. Общайтесь внутри сервиса.
          </span>
        </div>
      </div>
    </aside>
  );
}
