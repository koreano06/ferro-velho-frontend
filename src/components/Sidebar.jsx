import { Link, useRoute } from "wouter";

// Componente customizado para gerenciar o estado ativo dos links
function NavLink({ href, children }) {
  const [isActive] = useRoute(href);
  
  return (
    <Link 
      href={href} 
      className={`block rounded-md px-3 py-2 text-sm font-medium transition-all ${
        isActive 
          ? "bg-blue-600 text-white shadow-md" 
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <h1 className="mb-8 text-xl font-bold text-blue-600 tracking-tight">
        F_VelhoGomes
      </h1>

      <nav className="space-y-6">
        {/* Seção Geral */}
        <div>
          <p className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Geral
          </p>
          <div className="space-y-1">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/compras">Nova Compra</NavLink>
            <NavLink href="/vendas">Nova Venda</NavLink>
            <NavLink href="/materiais">Materiais</NavLink>
          </div>
        </div>

        {/* Seção de Relatórios */}
        <div>
          <p className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Relatórios
          </p>
          <div className="space-y-1">
            <NavLink href="/relatorios">Total por Material</NavLink>
          </div>
        </div>
      </nav>

      {/* Rodapé do Sidebar (opcional) */}
      <div className="mt-auto pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center">
        v1.0.0 - Sistema de Gestão
      </div>
    </aside>
  );
}