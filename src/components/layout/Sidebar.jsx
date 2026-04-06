import { Link, useRoute } from "wouter";
import { X } from "lucide-react";
import { NAV_SECTIONS } from "../../config/navigation";

function NavLink({ href, children, onNavigate }) {
  const [isActive] = useRoute(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        isActive 
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
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
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white/95 p-4 shadow-xl transition-transform md:static md:min-h-screen md:w-64 md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between gap-3">
          <Link href="/" onClick={onClose} className="block min-w-0 flex-1">
            <div className="brand-shell rounded-3xl border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                  <span className="brand-mark__label">FV</span>
                </div>
                <div className="min-w-0">
                  <p className="brand-kicker">Ferro Velho</p>
                  <h1 className="brand-title">VelhoGomes</h1>
                </div>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
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

        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Sistema de Gestao</p>
          <p className="mt-1">Base pronta para compras, vendas, estoque e financeiro.</p>
        </div>
      </aside>
    </>
  );
}
