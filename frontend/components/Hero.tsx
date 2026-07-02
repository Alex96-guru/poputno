import Reveal from "./Reveal";
import SearchBar from "./SearchBar";

const COLLAGE_A = [
  { url: "photo-1519699047748-de8e457a634e", height: 214 },
  { url: "photo-1643227791873-9e3e509d6e1f", height: 150 },
];

const COLLAGE_B = [
  { url: "photo-1723189038239-88966a3375d1", height: 150 },
  { url: "photo-1704398861049-b25d5c98a078", height: 214 },
];

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600`;

export default function Hero() {
  return (
    <section className="bg-surface-2 px-5 py-12 sm:px-8 lg:px-20 lg:py-16">
      <div className="mx-auto flex max-w-content flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <Reveal className="flex w-full min-w-0 flex-col gap-[22px] lg:w-auto lg:flex-1">
          <span className="text-[14px] font-bold uppercase tracking-[2.5px] text-accent-ink">
            Сообщество путешественников
          </span>

          <h1 className="font-display text-[40px] font-bold leading-[1.06] text-ink sm:text-[52px] lg:text-[62px]">
            Найди своего попутчика
          </h1>

          <p className="max-w-[560px] text-[18px] leading-[1.5] text-muted">
            Тысячи людей ищут компанию для поездок прямо сейчас. Найди своих — по
            направлению, датам и духу приключений.
          </p>

          <SearchBar />
        </Reveal>

        <Reveal delay={120}>
          <Collage />
        </Reveal>
      </div>
    </section>
  );
}

function Collage() {
  return (
    <div className="flex gap-3.5">
      <CollageColumn photos={COLLAGE_A} />
      <CollageColumn photos={COLLAGE_B} offset />
    </div>
  );
}

function CollageColumn({
  photos,
  offset = false,
}: {
  photos: { url: string; height: number }[];
  offset?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-3.5"
      style={{ paddingTop: offset ? 34 : 0 }}
    >
      {photos.map(({ url, height }) => (
        <div
          key={url}
          className="w-[172px] rounded-card bg-cover bg-center"
          style={{ height, backgroundImage: `url(${unsplash(url)})` }}
        />
      ))}
    </div>
  );
}