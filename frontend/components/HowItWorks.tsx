import { MessagesSquare, Plane, UserRoundSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "./Reveal";

interface Step {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: UserRoundSearch,
    number: "01",
    title: "Создай профиль",
    description:
      "Расскажи о себе, куда и когда хочешь поехать, и в каком формате.",
  },
  {
    icon: MessagesSquare,
    number: "02",
    title: "Найди своих",
    description:
      "Смотри анкеты попутчиков, фильтруй по направлению и списывайся.",
  },
  {
    icon: Plane,
    number: "03",
    title: "Отправляйтесь",
    description:
      "Согласуйте детали, соберите рюкзаки и в путь за впечатлениями.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface-2 px-5 py-16 sm:px-8 lg:px-20 lg:py-20">
      <div className="mx-auto flex max-w-content flex-col items-center gap-11">
        <Reveal className="flex flex-col items-center gap-2.5">
          <h2 className="font-display text-[38px] font-bold text-ink">
            Как это работает
          </h2>
          <p className="text-[17px] text-muted">
            Три простых шага до нового приключения
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

function StepCard({ step: { icon: Icon, number, title, description } }: { step: Step }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-border bg-white p-8">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-btn bg-accent-soft text-accent-ink">
          <Icon className="h-[26px] w-[26px]" />
        </span>
        <span className="font-display text-[34px] font-bold text-subtle">
          {number}
        </span>
      </div>

      <h3 className="font-display text-[23px] font-bold text-ink">{title}</h3>

      <p className="text-[15px] leading-[1.5] text-muted">{description}</p>
    </article>
  );
}