export default function Card({ title, value, tone = "neutral", subtitle }) {
  const toneClass = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-900",
    info: "text-blue-600",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass[tone] ?? toneClass.neutral}`}>{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
