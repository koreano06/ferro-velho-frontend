import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../services/managementService";

const defaultLogs = [];

export default function Auditoria() {
  const [logs, setLogs] = useState(defaultLogs);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const response = await getAuditLogs();
        setLogs(Array.isArray(response) ? response : []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadAuditLogs();
  }, []);

  const eventosRecentes = useMemo(() => logs.slice(0, 20), [logs]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Auditoria Operacional</h1>
        <p className="text-gray-500">Historico de alteracoes de preco, estoque e movimentos financeiros.</p>
      </header>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Ultimos eventos</h2>
        </div>
        <div className="p-5">
          {carregando && <p className="text-sm text-gray-500">Carregando historico...</p>}
          {!carregando && eventosRecentes.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum evento de auditoria disponivel.</p>
          )}
          {!carregando && eventosRecentes.length > 0 && (
            <ul className="space-y-3">
              {eventosRecentes.map((item, index) => (
                <li
                  key={`${item.data_hora}-${index}`}
                  className="rounded-lg border border-gray-100 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-gray-800">{item.acao}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {item.usuario || "sistema"}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.descricao}</p>
                  <p className="mt-2 text-xs text-gray-400">{item.data_hora}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
