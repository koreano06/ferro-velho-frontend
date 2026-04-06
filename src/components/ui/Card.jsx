export default function Card({ title, value, tone = "neutral", subtitle }) {
  const toneClass = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    neutral: "text-slate-100",
    info: "text-blue-300",
  };

  const progressClass = {
    positive: "bg-emerald-500",
    negative: "bg-rose-500",
    neutral: "bg-blue-500",
    info: "bg-blue-400",
  };

  return (
    <div className="surface-panel rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass[tone] ?? toneClass.neutral}`}>{value}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700/80">
        <div className={`h-full rounded-full ${progressClass[tone] ?? progressClass.neutral}`} style={{ width: "72%" }} />
      </div>
    </div>
  );
}
