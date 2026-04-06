import { useEffect, useMemo, useState } from "react";
import { Building2, Handshake, TrendingUp, Truck } from "lucide-react";
import { getPartnerSummary } from "../services/managementService";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";

const defaultData = {
  fornecedores: [],
  clientes: [],
};

function PartnerMetric({ label, value, tone = "neutral" }) {
  const toneClass = {
    positive: "text-emerald-400",
    info: "text-blue-300",
    neutral: "text-slate-100",
  };

  return (
    <div className="surface-panel rounded-2xl p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${toneClass[tone] ?? toneClass.neutral}`}>{value}</p>
    </div>
  );
}

export default function Parceiros() {
  const [dados, setDados] = useState(defaultData);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function loadPartnerSummary() {
      try {
        const response = await getPartnerSummary();
        setDados({ ...defaultData, ...response });
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadPartnerSummary();
  }, []);

  const topFornecedores = useMemo(
    () => (Array.isArray(dados.fornecedores) ? dados.fornecedores.slice(0, 5) : []),
    [dados.fornecedores]
  );

  const topClientes = useMemo(
    () => (Array.isArray(dados.clientes) ? dados.clientes.slice(0, 5) : []),
    [dados.clientes]
  );

  const totalFornecedores = dados.fornecedores.length;
  const totalClientes = dados.clientes.length;

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Rede comercial</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Parceiros</h1>
          <p className="page-intro mt-3">Veja quem mais entrega material e quem mais compra, com leitura pronta para decisao.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PartnerMetric label="Fornecedores" value={String(totalFornecedores)} />
          <PartnerMetric label="Clientes" value={String(totalClientes)} />
          <PartnerMetric label="Top compra" value={topFornecedores[0]?.nome ?? "--"} tone="info" />
          <PartnerMetric label="Top venda" value={topClientes[0]?.nome ?? "--"} tone="positive" />
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      {carregando && <p className="text-sm text-slate-400">Carregando parceiros...</p>}

      {!carregando && (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="surface-panel-strong rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-300" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Entrada</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50">Top fornecedores</h2>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {topFornecedores.length === 0 && (
                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/20 px-5 py-8 text-center text-sm text-slate-400">
                  Sem dados de fornecedores.
                </div>
              )}

              {topFornecedores.map((item, index) => (
                <div
                  key={`${item.nome}-${index}`}
                  className="surface-panel flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{item.nome}</p>
                      <p className="mt-1 text-sm text-slate-400">{formatWeight(item.peso_total_kg)} fornecidos</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-blue-300">{formatCurrencyBRL(item.valor_total)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel-strong rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <Handshake className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Saida</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50">Top clientes</h2>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {topClientes.length === 0 && (
                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/20 px-5 py-8 text-center text-sm text-slate-400">
                  Sem dados de clientes.
                </div>
              )}

              {topClientes.map((item, index) => (
                <div
                  key={`${item.nome}-${index}`}
                  className="surface-panel flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{item.nome}</p>
                      <p className="mt-1 text-sm text-slate-400">{formatWeight(item.peso_total_kg)} comprados</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrencyBRL(item.valor_total)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
