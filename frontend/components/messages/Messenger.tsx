"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ExternalLink,
  MessageCircle,
  Paperclip,
  SendHorizontal,
  ShieldCheck,
} from "lucide-react";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  formatChatStamp,
  formatClock,
  formatDayLabel,
  sameDay,
} from "@/lib/dates";
import { fileToChatImage } from "@/lib/image";
import type { Conversation, Message, MessageUser } from "@/lib/types";
import Avatar from "@/components/profile/Avatar";

const POLL_MS = 3000;

export default function Messenger() {
  const { token, ready: authReady } = useAuth();
  const params = useSearchParams();
  const toParam = params.get("to");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [peer, setPeer] = useState<MessageUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);

  const lastPing = useRef(0);

  const loadConversations = useCallback(async () => {
    if (!token) return [] as Conversation[];
    try {
      const c = await api.fetchConversations(token);
      setConversations(c);
      return c;
    } catch {
      return [] as Conversation[];
    }
  }, [token]);

  // First load: fetch conversations and pick a thread (the ?to= peer, else top).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const c = await loadConversations();
      if (cancelled) return;
      setSelectedId(toParam ?? (c.length ? c[0].user.id : null));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, toParam, loadConversations]);

  // Resolve the header peer and load the thread when the selection changes.
  useEffect(() => {
    setPeerTyping(false);
    if (!token || !selectedId) {
      setMessages([]);
      setPeer(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const known = conversations.find((c) => c.user.id === selectedId)?.user;
      if (known) {
        setPeer(known);
      } else {
        const pu = await api.fetchPublicUser(selectedId);
        if (pu && !cancelled) {
          setPeer({
            id: pu.id,
            name: pu.name,
            username: pu.username,
            avatarUrl: pu.avatarUrl,
          });
        }
      }
      try {
        const thread = await api.fetchThread(token, selectedId);
        if (!cancelled) setMessages(thread);
      } catch {
        if (!cancelled) setMessages([]);
      }
      loadConversations();
    })();
    return () => {
      cancelled = true;
    };
    // conversations intentionally omitted: reselecting on every list refresh loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedId]);

  // Light polling keeps the open thread, its typing state and the list current.
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      loadConversations();
      if (selectedId) {
        api
          .fetchThread(token, selectedId)
          .then(setMessages)
          .catch(() => undefined);
        api
          .fetchTyping(token, selectedId)
          .then(setPeerTyping)
          .catch(() => undefined);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [token, selectedId, loadConversations]);

  // Tell the peer we're typing, at most once every couple of seconds.
  const notifyTyping = () => {
    if (!token || !selectedId) return;
    const now = Date.now();
    if (now - lastPing.current > 2000) {
      lastPing.current = now;
      api.pingTyping(token, selectedId).catch(() => undefined);
    }
  };

  const send = async () => {
    const body = input.trim();
    if (!body || !token || !selectedId || sending) return;
    setSending(true);
    setInput("");
    try {
      const created = await api.sendMessage(token, selectedId, { body });
      setMessages((prev) => [...prev, created]);
      loadConversations();
    } catch {
      setInput(body); // put it back so nothing is lost
    } finally {
      setSending(false);
    }
  };

  const sendImage = async (file: File) => {
    if (!token || !selectedId) return;
    setAttachError(null);
    setSending(true);
    try {
      const imageUrl = await fileToChatImage(file);
      const created = await api.sendMessage(token, selectedId, { imageUrl });
      setMessages((prev) => [...prev, created]);
      loadConversations();
    } catch (err) {
      setAttachError(
        err instanceof Error ? err.message : "Не удалось отправить фото",
      );
    } finally {
      setSending(false);
    }
  };

  if (authReady && !token) {
    return (
      <div className="flex h-[calc(100vh-78px)] flex-col items-center justify-center gap-4 bg-bg p-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-pill bg-surface-2 text-subtle">
          <MessageCircle className="h-8 w-8" />
        </span>
        <p className="text-[16px] text-muted">
          Войдите, чтобы читать и писать сообщения.
        </p>
        <Link
          href="/login"
          className="rounded-btn bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-ink"
        >
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-78px)] overflow-hidden bg-bg">
      <ChatList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        ready={ready}
        hiddenOnMobile={selectedId !== null}
      />

      {selectedId && peer ? (
        <Conversation
          peer={peer}
          messages={messages}
          input={input}
          onInput={(v) => {
            setInput(v);
            notifyTyping();
          }}
          onSend={send}
          onSendImage={sendImage}
          sending={sending}
          peerTyping={peerTyping}
          attachError={attachError}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <EmptyConversation ready={ready} />
      )}

      {peer && <PeerRail peer={peer} />}
    </div>
  );
}

/* ---------------------------------------------------------- Chat list */

function ChatList({
  conversations,
  selectedId,
  onSelect,
  ready,
  hiddenOnMobile,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ready: boolean;
  hiddenOnMobile: boolean;
}) {
  return (
    <aside
      className={`w-full shrink-0 flex-col border-r border-border bg-white md:flex md:w-[360px] ${
        hiddenOnMobile ? "hidden" : "flex"
      }`}
    >
      <div className="border-b border-border px-5 py-5">
        <h1 className="font-display text-[26px] font-bold text-ink">Сообщения</h1>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        {!ready ? (
          <p className="p-4 text-[14px] text-muted">Загрузка…</p>
        ) : conversations.length === 0 ? (
          <p className="p-4 text-[14px] leading-[1.5] text-muted">
            Пока нет диалогов. Напишите кому-нибудь из объявления — переписка
            появится здесь.
          </p>
        ) : (
          conversations.map((c) => (
            <ChatRow
              key={c.user.id}
              conversation={c}
              active={c.user.id === selectedId}
              onClick={() => onSelect(c.user.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function ChatRow({
  conversation: c,
  active,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-btn p-3 text-left transition ${
        active ? "bg-accent-soft" : "hover:bg-surface-2"
      }`}
    >
      <Avatar
        src={c.user.avatarUrl}
        name={c.user.name}
        className="h-[52px] w-[52px] shrink-0"
        textClassName="text-[18px]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[15px] font-bold text-ink">
            {c.user.name}
          </span>
          <span
            className={`shrink-0 text-[12px] ${
              c.unread ? "text-accent-ink" : "text-subtle"
            }`}
          >
            {formatChatStamp(c.lastAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-[13px] ${
              c.unread ? "text-ink" : "text-muted"
            }`}
          >
            {c.lastMine && "Вы: "}
            {c.lastBody}
          </span>
          {c.unread > 0 && (
            <span className="grid h-5 min-w-[20px] shrink-0 place-items-center rounded-pill bg-accent px-1 text-[11px] font-bold text-white">
              {c.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------- Conversation */

function Conversation({
  peer,
  messages,
  input,
  onInput,
  onSend,
  onSendImage,
  sending,
  peerTyping,
  attachError,
  onBack,
}: {
  peer: MessageUser;
  messages: Message[];
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onSendImage: (file: File) => void;
  sending: boolean;
  peerTyping: boolean;
  attachError: string | null;
  onBack: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, peerTyping]);

  // Where to draw a read receipt: the last message the peer has read.
  const lastReadIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].mine && messages[i].read) return i;
    }
    return -1;
  })();

  return (
    <section className="flex flex-1 flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3.5 lg:px-7">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-pill text-muted transition hover:bg-surface-2 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar
          src={peer.avatarUrl}
          name={peer.name}
          className="h-11 w-11 shrink-0"
          textClassName="text-[16px]"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[17px] font-bold text-ink">
            {peer.name}
          </span>
          <span className="truncate text-[13px]">
            {peerTyping ? (
              <span className="font-medium text-accent-ink">печатает…</span>
            ) : (
              <span className="text-muted">@{peer.username}</span>
            )}
          </span>
        </div>
        <Link
          href={`/profile/${peer.id}`}
          className="hidden shrink-0 items-center gap-1.5 rounded-pill bg-surface-2 px-4 py-2 text-[13px] font-semibold text-ink transition hover:text-accent-ink sm:flex"
        >
          Профиль
        </Link>
      </header>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6 lg:px-11"
      >
        {messages.length === 0 ? (
          <div className="m-auto max-w-[320px] text-center text-[14px] leading-[1.5] text-muted">
            Начните разговор с {peer.name.split(" ")[0]} — напишите первое
            сообщение.
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const showDay =
              !prev || !sameDay(prev.createdAt, m.createdAt);
            return (
              <div key={m.id} className="flex flex-col gap-3">
                {showDay && <DaySeparator iso={m.createdAt} />}
                <Bubble message={m} showReceipt={i === lastReadIndex} />
              </div>
            );
          })
        )}
        {peerTyping && <TypingBubble />}
      </div>

      {attachError && (
        <p className="border-t border-border bg-[#FCEEEB] px-5 py-2 text-[13px] text-[#C0392B]">
          {attachError}
        </p>
      )}

      <div className="flex items-center gap-2.5 border-t border-border bg-white px-4 py-4 sm:px-7">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSendImage(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={sending}
          aria-label="Прикрепить фото"
          className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-pill bg-surface-2 text-muted transition hover:text-ink disabled:opacity-50"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Напишите сообщение…"
          className="h-[46px] flex-1 rounded-pill bg-surface-2 px-[18px] text-[15px] text-ink outline-none placeholder:text-subtle"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sending || input.trim() === ""}
          className="flex shrink-0 items-center gap-2 rounded-pill bg-accent px-[18px] py-3 text-[15px] font-semibold text-white transition hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-50 sm:px-[22px]"
        >
          <SendHorizontal className="h-[19px] w-[19px]" />
          <span className="hidden sm:inline">Отправить</span>
        </button>
      </div>
    </section>
  );
}

function DaySeparator({ iso }: { iso: string }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-pill bg-surface-2 px-4 py-1.5 text-[12px] font-semibold text-subtle">
        {formatDayLabel(iso)}
      </span>
    </div>
  );
}

function Bubble({
  message,
  showReceipt,
}: {
  message: Message;
  showReceipt: boolean;
}) {
  const out = message.mine;
  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[78%] flex-col gap-1.5 sm:max-w-[440px] ${
          message.imageUrl ? "p-1.5" : "px-4 py-3"
        } ${
          out
            ? "rounded-[20px] rounded-br-[6px] bg-accent text-white"
            : "rounded-[20px] rounded-bl-[6px] border border-border bg-white text-ink shadow-[0_2px_8px_rgba(42,37,33,0.05)]"
        }`}
      >
        {message.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageUrl}
            alt="Вложение"
            className="max-h-[320px] w-full rounded-[14px] object-cover"
          />
        )}
        {message.body && (
          <span
            className={`whitespace-pre-wrap break-words text-[15px] leading-[1.4] ${
              message.imageUrl ? "px-2" : ""
            }`}
          >
            {message.body}
          </span>
        )}
        <span
          className={`flex items-center justify-end gap-1 text-[11px] ${
            message.imageUrl ? "px-2 pb-1" : ""
          } ${out ? "text-white/70" : "text-subtle"}`}
        >
          {formatClock(message.createdAt)}
          {out &&
            (message.read ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </span>
        {showReceipt && (
          <span className="px-1 text-right text-[10px] text-white/70">
            прочитано
          </span>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-[20px] rounded-bl-[6px] border border-border bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(42,37,33,0.05)]">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-pill bg-subtle"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyConversation({ ready }: { ready: boolean }) {
  return (
    <section className="hidden flex-1 flex-col items-center justify-center gap-3 bg-bg p-8 text-center md:flex">
      <span className="grid h-16 w-16 place-items-center rounded-pill bg-surface-2 text-subtle">
        <MessageCircle className="h-8 w-8" />
      </span>
      <p className="max-w-[320px] text-[15px] leading-[1.5] text-muted">
        {ready
          ? "Выберите диалог слева или напишите кому-нибудь из объявления."
          : "Загрузка…"}
      </p>
    </section>
  );
}

/* ---------------------------------------------------------- Peer rail */

function PeerRail({ peer }: { peer: MessageUser }) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-border bg-white p-6 xl:flex">
      <span className="text-[13px] font-bold tracking-[0.4px] text-subtle">
        СОБЕСЕДНИК
      </span>

      <Avatar
        src={peer.avatarUrl}
        name={peer.name}
        className="h-24 w-24"
        textClassName="text-[30px]"
      />

      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[21px] font-bold text-ink">
          {peer.name}
        </h2>
        <span className="text-[14px] text-muted">@{peer.username}</span>
      </div>

      <Link
        href={`/profile/${peer.id}`}
        className="flex items-center justify-center gap-2 rounded-btn bg-accent py-3.5 text-[15px] font-semibold text-white transition hover:bg-accent-ink"
      >
        <ExternalLink className="h-[18px] w-[18px]" />
        Открыть профиль
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
