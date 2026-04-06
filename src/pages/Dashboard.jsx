import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, CircleDollarSign, ShieldCheck, Sparkles } from "lucide-react";
import Card from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";
import { getManagementOverview } from "../services/managementService";
import { getMateriais } from "../services/materialService";
import { getEstoque } from "../services/estoqueService";
import {
  getMaterialStatus,
  getMaterialStatusLabel,
  normalizeMaterial,
} from "../utils/materials";

const fallbackOverview = {
  compras_mes: 0,
  vendas_mes: 0,
  lucro_mes: 0,
  giro_estoque_dias: 0,
  materiais_parados: 0,
  alertas: [],
};

function StockPulse({ label, value, helper, tone = "neutral" }) {
  const toneClass = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    info: "text-blue-300",
    neutral: "text-slate-100",
  };

  return (
    <div className="surface-panel rounded-2xl p-4">
      <p className="muted-label">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${toneClass[tone] ?? toneClass.neutral}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(fallbackOverview);
  const [materiais, setMateriais] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const isOwner = user?.role === "owner";

  useEffect(() => {
    async function loadOverview() {
      try {
        const [overviewData, materiaisData, estoqueData] = await Promise.all([
          (isOwner ? getManagementOverview() : Promise.resolve(fallbackOverview)).catch(() => fallbackOverview),
          getMateriais().catch(() => []),
          getEstoque().catch(() => []),
        ]);

        const materiaisMap = new Map(
          (Array.isArray(materiaisData) ? materiaisData : []).map((item) => {
            const normalized = normalizeMaterial(item);
            return [String(normalized.id), normalized];
          })
        );

        const estoqueNormalizado = (Array.isArray(estoqueData) ? estoqueData : []).map((item) => {
          const base = materiaisMap.get(String(item.id_material)) ?? normalizeMaterial(item);
          return normalizeMaterial({
            ...base,
            ...item,
            id_material: item.id_material ?? base.id,
            nome: item.nome ?? base.nome,
          });
        });

        const materiaisCompletos = estoqueNormalizado.length > 0
          ? estoqueNormalizado
          : (Array.isArray(materiaisData) ? materiaisData : []).map(normalizeMaterial);

        setStats({ ...fallbackOverview, ...overviewData });
        setMateriais(materiaisCompletos);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadOverview();
  }, [isOwner]);

  const resumoEstoque = useMemo(() => {
    const valorCusto = materiais.reduce((acc, item) => acc + item.valorCustoEstoque, 0);
    const valorVenda = materiais.reduce((acc, item) => acc + item.valorVendaEstoque, 0);
    const lucroPotencial = materiais.reduce((acc, item) => acc + item.lucroPotencialEstoque, 0);
    const alertasCriticos = materiais.filter((item) => getMaterialStatus(item) !== "ok");
    const pesoTotal = materiais.reduce((acc, item) => acc + item.quantidadeKg, 0);

    return { valorCusto, valorVenda, lucroPotencial, alertasCriticos, pesoTotal };
  }, [materiais]);

  const materiaisOrdenados = useMemo(
    () => [...materiais].sort((a, b) => b.valorVendaEstoque - a.valorVendaEstoque),
    [materiais]
  );

  const alertasDashboard = useMemo(() => {
    const backendAlertas = Array.isArray(stats.alertas) ? stats.alertas : [];
    const estoqueAlertas = resumoEstoque.alertasCriticos.map((item) => {
      const status = getMaterialStatus(item);
      if (status === "zerado") {
        return `${item.nome}: estoque zerado.`;
      }

      return `${item.nome}: ${formatWeight(item.quantidadeKg)} em estoque para minimo de ${formatWeight(item.estoqueMinimoKg)}.`;
    });

    return [...estoqueAlertas, ...backendAlertas];
  }, [stats.alertas, resumoEstoque.alertasCriticos]);

  const materiaisSemEstoque = materiais.filter((item) => getMaterialStatus(item) === "zerado").length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow-text">{isOwner ? "Visao executiva" : "Painel operacional"}</p>
          <h1 className="section-title mt-3">Dashboard</h1>
          <p className="page-intro mt-3">
            {isOwner
              ? "Visao consolidada de compras, vendas, margem e estoque em tempo real por material."
              : "Visao operacional do patio com estoque em tempo real e alertas para atendimento rapido."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StockPulse
            label="Materiais ativos"
            value={String(materiais.length)}
            helper="Itens monitorados no sistema agora."
            tone="info"
          />
          <StockPulse
            label="Peso total"
            value={formatWeight(resumoEstoque.pesoTotal)}
            helper="Volume atual disponivel no patio."
          />
          <StockPulse
            label="Alertas"
            value={String(resumoEstoque.alertasCriticos.length)}
            helper="Pontos que merecem atencao imediata."
            tone={resumoEstoque.alertasCriticos.length > 0 ? "negative" : "positive"}
          />
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      {isOwner ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Card title="Compras do mes" value={formatCurrencyBRL(stats.compras_mes)} tone="negative" subtitle="Total investido em entrada de material." />
            <Card title="Vendas do mes" value={formatCurrencyBRL(stats.vendas_mes)} tone="positive" subtitle="Receita acumulada nas saidas." />
            <Card
              title="Lucro do mes"
              value={formatCurrencyBRL(stats.lucro_mes)}
              tone={Number(stats.lucro_mes) >= 0 ? "positive" : "negative"}
              subtitle="Margem total do periodo atual."
            />
            <Card
              title="Giro de estoque"
              value={`${Number(stats.giro_estoque_dias).toFixed(1)} dias`}
              tone="info"
              subtitle="Velocidade media da operacao."
            />
            <Card
              title="Alertas de estoque"
              value={String(resumoEstoque.alertasCriticos.length)}
              tone={resumoEstoque.alertasCriticos.length > 0 ? "negative" : "positive"}
              subtitle="Itens abaixo do ideal ou zerados."
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card title="Valor de custo no patio" value={formatCurrencyBRL(resumoEstoque.valorCusto)} tone="neutral" subtitle="Base atual investida no estoque." />
            <Card title="Valor de venda potencial" value={formatCurrencyBRL(resumoEstoque.valorVenda)} tone="info" subtitle="Quanto o patio pode gerar na saida." />
            <Card
              title="Lucro potencial em estoque"
              value={formatCurrencyBRL(resumoEstoque.lucroPotencial)}
              tone={resumoEstoque.lucroPotencial >= 0 ? "positive" : "negative"}
              subtitle="Margem estimada sobre o estoque atual."
            />
          </section>
        </>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Materiais monitorados" value={String(materiais.length)} tone="neutral" subtitle="Itens visiveis para operacao." />
          <Card title="Peso total no patio" value={formatWeight(resumoEstoque.pesoTotal)} tone="info" subtitle="Volume atual para atendimento." />
          <Card
            title="Alertas de estoque"
            value={String(resumoEstoque.alertasCriticos.length)}
            tone={resumoEstoque.alertasCriticos.length > 0 ? "negative" : "positive"}
            subtitle="Itens abaixo do minimo."
          />
          <Card
            title="Materiais sem estoque"
            value={String(materiaisSemEstoque)}
            tone="negative"
            subtitle="Sem disponibilidade no momento."
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <div className="surface-panel-strong overflow-hidden rounded-[28px]">
          <div className="flex flex-col gap-3 border-b border-slate-700/80 px-6 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="muted-label">Estoque em tempo real</p>
              <h2 className="panel-title mt-2">Estoque por material</h2>
              <p className="mt-2 text-sm text-slate-400">O que tem no patio agora, quanto vale e onde esta a margem.</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-400">
              {carregando ? "Sincronizando..." : `${materiaisOrdenados.length} materiais`}
            </div>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="table-header-row text-xs uppercase tracking-[0.18em]">
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Qtd.</th>
                  <th className="px-4 py-3">Custo</th>
                  <th className="px-4 py-3">Venda</th>
                  <th className="px-4 py-3">Lucro pot.</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {carregando && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                      Carregando estoque em tempo real...
                    </td>
                  </tr>
                )}
                {!carregando && materiaisOrdenados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                      Nenhum material encontrado para montar a visao do estoque.
                    </td>
                  </tr>
                )}
                {!carregando && materiaisOrdenados.map((item) => {
                  const status = getMaterialStatus(item);
                  return (
                    <tr key={item.id} className="table-row-hover">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-100">{item.nome}</p>
                        <p className="mt-1 text-xs text-slate-400">Minimo: {formatWeight(item.estoqueMinimoKg)}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-blue-300">{formatWeight(item.quantidadeKg)}</td>
                      <td className="px-4 py-4 text-slate-300">{formatCurrencyBRL(item.valorCustoEstoque)}</td>
                      <td className="px-4 py-4 text-blue-300">{formatCurrencyBRL(item.valorVendaEstoque)}</td>
                      <td className={`px-4 py-4 font-semibold ${item.lucroPotencialEstoque >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatCurrencyBRL(item.lucroPotencialEstoque)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          status === "ok"
                            ? "bg-emerald-500/12 text-emerald-300"
                            : status === "baixo"
                              ? "bg-blue-500/12 text-blue-200"
                              : "bg-rose-500/12 text-rose-200"
                        }`}>
                          {getMaterialStatusLabel(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel-strong rounded-[28px] p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="muted-label">Atencao operacional</p>
                <h2 className="panel-title mt-2">Alertas de operacao</h2>
                <p className="mt-2 text-sm text-slate-400">Baixo estoque e pontos de atencao para o Gomes e a equipe.</p>
              </div>
            </div>

            <div className="mt-6">
              {carregando && <p className="text-sm text-slate-400">Carregando indicadores...</p>}
              {!carregando && alertasDashboard.length === 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
                  Nenhum alerta critico no momento.
                </div>
              )}
              {!carregando && alertasDashboard.length > 0 && (
                <ul className="space-y-3">
                  {alertasDashboard.map((alerta, index) => (
                    <li key={`${alerta}-${index}`} className="rounded-2xl border border-blue-500/12 bg-blue-500/10 px-4 py-3 text-sm leading-6 text-blue-100">
                      {alerta}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="surface-panel rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Boxes className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="muted-label">Patio</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-100">{formatWeight(resumoEstoque.pesoTotal)}</p>
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-2xl p-5">
              <div className="flex items-center gap-3">
                {isOwner ? (
                  <CircleDollarSign className="h-5 w-5 text-emerald-400" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-blue-300" />
                )}
                <div>
                  <p className="muted-label">{isOwner ? "Lucro potencial" : "Operacao segura"}</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-100">
                    {isOwner ? formatCurrencyBRL(resumoEstoque.lucroPotencial) : `${materiaisSemEstoque} sem estoque`}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="muted-label">Leitura rapida</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {isOwner
                      ? "O painel destaca margem, valor potencial e materiais que exigem decisao imediata."
                      : "O painel destaca disponibilidade, peso no patio e itens que precisam de reposicao."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
