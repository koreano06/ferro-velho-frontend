import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="h-14 border-b bg-white px-6 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Sistema de Gestão
          </h2>
        </header>

        {/* Página */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
