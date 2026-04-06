import { Link, useRoute } from "wouter";
import { X } from "lucide-react";
import { NAV_SECTIONS } from "../../config/navigation";
import { ROLE_LABELS } from "../../config/authUsers";
import { useAuth } from "../../hooks/useAuth";

function NavLink({ href, children, onNavigate }) {
  const [isActive] = useRoute(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        isActive 
          ? "bg-blue-500 text-white shadow-[0_8px_18px_-14px_rgba(59,130,246,0.72)]"
          : "text-slate-300 hover:bg-white/8 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    links: section.links.filter((link) => link.roles.includes(user.role)),
  })).filter((section) => section.links.length > 0);

  return (
    <>
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-900 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_52%,_#0b1120_100%)] p-4 shadow-xl transition-transform md:w-64 md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between gap-3">
          <Link href="/" onClick={onClose} className="block min-w-0 flex-1">
            <div className="rounded-3xl border border-white/8 bg-white/4 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <div className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                  <span className="brand-mark__label">FV</span>
                </div>
                <div className="min-w-0">
                  <p className="brand-kicker">Ferro Velho</p>
                  <h1 className="brand-title">Gomes</h1>
                </div>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/8 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="muted-label mb-3 text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => (
                  <NavLink key={link.href} href={link.href} onNavigate={onClose}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-xs text-slate-300">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="mt-1 uppercase tracking-[0.18em] text-slate-400">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
          >
            Sair do sistema
          </button>
        </div>
      </aside>
    </>
  );
}
