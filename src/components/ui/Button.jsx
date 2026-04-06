export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary: "border border-blue-500/80 bg-blue-500 text-white shadow-[0_8px_18px_-14px_rgba(59,130,246,0.75)] hover:bg-blue-600",
    secondary: "border border-slate-600 bg-slate-800 text-slate-100 hover:border-slate-500 hover:bg-slate-700",
    danger: "border border-rose-600/80 bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
        variants[variant] ?? variants.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
