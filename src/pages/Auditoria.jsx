import { useEffect, useMemo, useState } from "react";
import { History, Shield, UserRound } from "lucide-react";
import { getAuditLogs } from "../services/managementService";

const defaultLogs = [];

function AuditMetric({ label, value }) {
  return (
    <div className="surface-panel rounded-2xl p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}

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
    <section className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Rastreabilidade</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Auditoria</h1>
          <p className="page-intro mt-3">Consulte o historico de alteracoes e movimentos importantes do sistema em uma linha do tempo mais limpa.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AuditMetric label="Eventos carregados" value={String(logs.length)} />
          <AuditMetric label="Eventos recentes" value={String(eventosRecentes.length)} />
          <AuditMetric label="Origem" value="Sistema" />
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      <div className="surface-panel-strong rounded-[28px] p-6">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-blue-300" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Linha do tempo</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Ultimos eventos</h2>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {carregando && <p className="text-sm text-slate-400">Carregando historico...</p>}

          {!carregando && eventosRecentes.length === 0 && (
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/20 px-5 py-8 text-center text-sm text-slate-400">
              Nenhum evento de auditoria disponivel.
            </div>
          )}

          {!carregando && eventosRecentes.length > 0 && (
            eventosRecentes.map((item, index) => (
              <div
                key={`${item.data_hora}-${index}`}
                className="surface-panel rounded-2xl px-5 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{item.acao}</p>
                      <p className="mt-2 text-sm text-slate-400">{item.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    <UserRound size={14} />
                    {item.usuario || "sistema"}
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">{item.data_hora}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
