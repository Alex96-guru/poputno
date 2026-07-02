interface Props {
  destinations: string[];
}

export default function PopularPills({ destinations }: Props) {
  return (
    <section className="px-5 pt-9 sm:px-8 lg:px-20">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-3">
        <span className="text-[15px] font-semibold text-muted">Популярное:</span>
        {destinations.map((name, i) => (
          <Pill key={name} label={name} active={i === 0} />
        ))}
      </div>
    </section>
  );
}

function Pill({ label, active }: { label: string; active: boolean }) {
  const base =
    "rounded-pill px-5 py-2.5 text-[15px] font-semibold transition cursor-pointer";
  return active ? (
    <button className={`${base} bg-accent text-white hover:bg-accent-ink`}>
      {label}
    </button>
  ) : (
    <button
      className={`${base} border border-border bg-white text-ink hover:border-accent hover:text-accent-ink`}
    >
      {label}
    </button>
  );
}