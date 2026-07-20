"use client";

import Link from "next/link";
import PersonCard from "@/components/PersonCard";
import { Stars, plural } from "@/components/profile/ProfileSidebar";
import type { Person, User } from "@/lib/types";

export interface Review {
  id: string;
  author: string;
  avatar: string;
  route: string;
  rating: number;
  body: string;
}

interface Props {
  user: User;
  reviews: Review[];
  saved: Person[];
}

export default function ProfileReviews({ user, reviews, saved }: Props) {
  return (
    <div className="flex flex-col gap-7">
      <section id="reviews" className="flex flex-col gap-7 scroll-mt-24">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[26px] text-ink">Отзывы обо мне</h2>
          <div className="flex items-center gap-4">
            <span className="font-display text-[40px] leading-none text-ink">
              {user.rating.toFixed(1)}
            </span>
            <Stars value={user.rating} size={18} />
            <span className="text-[14px] text-muted">
              {plural(user.reviewsCount, "отзыв", "отзыва", "отзывов")}
            </span>
          </div>
        </header>

        {reviews.length === 0 ? (
          <p className="rounded-card border border-border bg-white p-[22px] text-[15px] text-muted">
            Отзывов пока нет — они появятся после первой совместной поездки.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col gap-3 rounded-card border border-border bg-white p-[22px]"
              >
                <Stars value={review.rating} size={16} />
                <p className="flex-1 text-[15px] leading-[1.6] text-ink">
                  «{review.body}»
                </p>
                <footer className="flex items-center gap-2.5">
                  <span
                    className="h-11 w-11 shrink-0 rounded-pill bg-surface-2 bg-cover bg-center"
                    style={{ backgroundImage: `url(${review.avatar})` }}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-bold text-ink">
                      {review.author}
                    </span>
                    <span className="text-[12px] text-subtle">
                      {review.route}
                    </span>
                  </span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="saved" className="flex flex-col gap-7 scroll-mt-24">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-[26px] text-ink">Сохранённые</h2>
            <span className="text-[20px] text-subtle">{saved.length}</span>
          </div>
          <Link
            href="/catalog"
            className="text-[14px] font-semibold text-accent-ink transition hover:text-accent"
          >
            Смотреть все →
          </Link>
        </header>

        {saved.length === 0 ? (
          <p className="rounded-card border border-border bg-white p-[22px] text-[15px] text-muted">
            Здесь появятся объявления, которые вы отметите сердечком в{" "}
            <Link
              href="/catalog"
              className="font-semibold text-accent-ink transition hover:text-accent"
            >
              каталоге
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {saved.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
