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
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.58))] px-4 backdrop-blur-xl md:px-6">
          <div className="flex min-h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="surface-panel rounded-xl p-2.5 text-slate-200 hover:text-white md:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="muted-label">
                  {currentPage.section}
                </p>
                <h2 className="text-[1.12rem] font-semibold tracking-[-0.03em] text-slate-100">{currentPage.title}</h2>
              </div>
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
