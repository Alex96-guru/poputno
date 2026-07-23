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
    <section className="bg-surface-2 px-4 py-8 sm:px-8 sm:py-16 lg:px-20 lg:py-20">
      <div className="mx-auto flex max-w-content flex-col items-center gap-6 sm:gap-11">
        <Reveal className="flex flex-col items-center gap-2 text-center sm:gap-2.5">
          <h2 className="font-display text-[22px] font-bold text-ink sm:text-[38px]">
            Как это работает
          </h2>
          <p className="hidden text-[17px] text-muted sm:block">
            Три простых шага до нового приключения
          </p>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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

function StepCard({
  step: { icon: Icon, number, title, description },
}: {
  step: Step;
}) {
  return (
    <article className="flex h-full flex-row items-center gap-3.5 rounded-card border border-border bg-white p-4 sm:flex-col sm:items-start sm:gap-4 sm:p-8">
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-btn bg-accent-soft text-accent-ink sm:h-14 sm:w-14">
          <Icon className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]" />
        </span>
        <span className="hidden font-display text-[34px] font-bold text-subtle sm:inline">
          {number}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:gap-4">
        <h3 className="font-display text-[16px] font-bold text-ink sm:text-[23px]">
          {title}
        </h3>
        <p className="text-[13px] leading-[1.4] text-muted sm:text-[15px] sm:leading-[1.5]">
          {description}
        </p>
      </div>
    </article>
  );
}
