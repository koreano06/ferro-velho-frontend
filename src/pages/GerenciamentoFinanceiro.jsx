import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Landmark, ReceiptText, WalletCards } from "lucide-react";
import Card from "../components/ui/Card";
import { formatCurrencyBRL } from "../utils/formatters";
import { getFinanceSummary } from "../services/managementService";

const defaultData = {
  cards: {
    contas_pagar: 0,
    contas_receber: 0,
    caixa_disponivel: 0,
    inadimplencia: 0,
  },
  vencimentos: [],
};

export default function GerenciamentoFinanceiro() {
  const [dados, setDados] = useState(defaultData);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function loadFinanceSummary() {
      try {
        const response = await getFinanceSummary();
        setDados({ ...defaultData, ...response });
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    loadFinanceSummary();
  }, []);

  const proximosVencimentos = useMemo(
    () => (Array.isArray(dados.vencimentos) ? dados.vencimentos.slice(0, 6) : []),
    [dados.vencimentos]
  );

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">Saude financeira</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50">Gestao financeira</h1>
          <p className="page-intro mt-3">Concentre caixa, contas e proximos vencimentos em uma leitura mais direta.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
          {carregando ? "Atualizando resumo financeiro..." : `${proximosVencimentos.length} vencimentos em foco`}
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
          {erro}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Contas a pagar" tone="negative" value={formatCurrencyBRL(dados.cards.contas_pagar)} />
        <Card title="Contas a receber" tone="positive" value={formatCurrencyBRL(dados.cards.contas_receber)} />
        <Card title="Caixa disponivel" tone="info" value={formatCurrencyBRL(dados.cards.caixa_disponivel)} />
        <Card
          title="Inadimplencia"
          tone={Number(dados.cards.inadimplencia) > 0 ? "negative" : "neutral"}
          value={formatCurrencyBRL(dados.cards.inadimplencia)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
        <div className="surface-panel-strong rounded-[28px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Resumo executivo</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50">Panorama rapido</h2>

          <div className="mt-8 space-y-4">
            <div className="surface-panel rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <WalletCards className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Caixa atual</p>
                  <p className="mt-1 text-sm text-slate-400">Valor imediatamente disponivel para operacao.</p>
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Landmark className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Recebimentos</p>
                  <p className="mt-1 text-sm text-slate-400">Acompanhe o que ainda entra no caixa.</p>
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <ReceiptText className="h-5 w-5 text-rose-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Compromissos</p>
                  <p className="mt-1 text-sm text-slate-400">Contas a pagar e risco de inadimplencia lado a lado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel-strong rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-blue-300" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Agenda financeira</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50">Proximos vencimentos</h2>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {carregando && <p className="text-sm text-slate-400">Carregando vencimentos...</p>}

            {!carregando && proximosVencimentos.length === 0 && (
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/20 px-5 py-8 text-center text-sm text-slate-400">
                Nenhum vencimento encontrado.
              </div>
            )}

            {!carregando && proximosVencimentos.length > 0 && (
              proximosVencimentos.map((item, index) => (
                <div
                  key={`${item.descricao}-${index}`}
                  className="surface-panel flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-100">{item.descricao}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.vencimento}</p>
                  </div>
                  <p className="text-lg font-bold text-slate-50">{formatCurrencyBRL(item.valor)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
