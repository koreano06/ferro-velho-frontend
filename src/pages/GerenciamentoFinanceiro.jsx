import { useEffect, useMemo, useState } from "react";
import KpiCard from "../components/KpiCard";
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
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Gestao Financeira</h1>
        <p className="text-gray-500">Contas, caixa e controle de recebimentos em atraso.</p>
      </header>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Contas a Pagar"
          tone="negative"
          value={formatCurrencyBRL(dados.cards.contas_pagar)}
        />
        <KpiCard
          title="Contas a Receber"
          tone="positive"
          value={formatCurrencyBRL(dados.cards.contas_receber)}
        />
        <KpiCard
          title="Caixa Disponivel"
          tone="info"
          value={formatCurrencyBRL(dados.cards.caixa_disponivel)}
        />
        <KpiCard
          title="Inadimplencia"
          tone={Number(dados.cards.inadimplencia) > 0 ? "negative" : "neutral"}
          value={formatCurrencyBRL(dados.cards.inadimplencia)}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Proximos vencimentos</h2>
        </div>
        <div className="p-5">
          {carregando && <p className="text-sm text-gray-500">Carregando vencimentos...</p>}
          {!carregando && proximosVencimentos.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum vencimento encontrado.</p>
          )}
          {!carregando && proximosVencimentos.length > 0 && (
            <ul className="space-y-3">
              {proximosVencimentos.map((item, index) => (
                <li
                  key={`${item.descricao}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.descricao}</p>
                    <p className="text-sm text-gray-500">{item.vencimento}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrencyBRL(item.valor)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
