import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import { formatCurrencyBRL } from "../utils/formatters";
import { getManagementOverview } from "../services/managementService";

const fallbackOverview = {
  compras_mes: 0,
  vendas_mes: 0,
  lucro_mes: 0,
  giro_estoque_dias: 0,
  materiais_parados: 0,
  alertas: [],
};

export default function Dashboard() {
  const [stats, setStats] = useState(fallbackOverview);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await getManagementOverview();
        setStats({ ...fallbackOverview, ...data });
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadOverview();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Painel de Gerenciamento</h1>
        <p className="text-gray-500">Visao consolidada de compras, vendas, margem e saude do estoque.</p>
      </header>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Compras (Mes)" value={formatCurrencyBRL(stats.compras_mes)} tone="negative" />
        <KpiCard title="Vendas (Mes)" value={formatCurrencyBRL(stats.vendas_mes)} tone="positive" />
        <KpiCard
          title="Lucro (Mes)"
          value={formatCurrencyBRL(stats.lucro_mes)}
          tone={Number(stats.lucro_mes) >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          title="Giro de Estoque"
          value={`${Number(stats.giro_estoque_dias).toFixed(1)} dias`}
          tone="info"
        />
        <KpiCard title="Materiais Parados" value={String(stats.materiais_parados)} tone="neutral" />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Alertas de operacao</h2>
        </div>
        <div className="p-5">
          {carregando && <p className="text-sm text-gray-500">Carregando indicadores...</p>}
          {!carregando && (!Array.isArray(stats.alertas) || stats.alertas.length === 0) && (
            <p className="text-sm text-gray-500">Nenhum alerta critico no momento.</p>
          )}
          {!carregando && Array.isArray(stats.alertas) && stats.alertas.length > 0 && (
            <ul className="space-y-2">
              {stats.alertas.map((alerta, index) => (
                <li key={`${alerta}-${index}`} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {alerta}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
