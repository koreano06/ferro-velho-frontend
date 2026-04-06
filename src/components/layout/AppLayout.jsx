import { Menu } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import { NAV_SECTIONS } from "../../config/navigation";

export default function AppLayout({ children }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  let currentPage = { section: "Sistema", title: "Pagina" };

  for (const section of NAV_SECTIONS) {
    const found = section.links.find((link) => link.href === location);
    if (found) {
      currentPage = { section: section.title, title: found.label };
      break;
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4f8_100%)] md:flex">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur md:px-6">
          <div className="flex min-h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900 md:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {currentPage.section}
                </p>
                <h2 className="text-lg font-semibold text-slate-900">{currentPage.title}</h2>
              </div>
            </div>

            <div className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:block">
              Sistema de Gestao
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
