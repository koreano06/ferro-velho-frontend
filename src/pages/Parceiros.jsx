import { useEffect, useMemo, useState } from "react";
import { getPartnerSummary } from "../services/managementService";
import { formatCurrencyBRL, formatWeight } from "../utils/formatters";

const defaultData = {
  fornecedores: [],
  clientes: [],
};

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

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Fornecedores e Clientes</h1>
        <p className="text-gray-500">Ranking por volume negociado e receita gerada.</p>
      </header>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando && <p className="text-sm text-gray-500">Carregando parceiros...</p>}

      {!carregando && (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Top fornecedores</h2>
            </div>
            <div className="p-5">
              {topFornecedores.length === 0 && (
                <p className="text-sm text-gray-500">Sem dados de fornecedores.</p>
              )}
              {topFornecedores.length > 0 && (
                <ul className="space-y-3">
                  {topFornecedores.map((item, index) => (
                    <li
                      key={`${item.nome}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.nome}</p>
                        <p className="text-sm text-gray-500">
                          {formatWeight(item.peso_total_kg)} fornecidos
                        </p>
                      </div>
                      <p className="font-semibold text-blue-700">
                        {formatCurrencyBRL(item.valor_total)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Top clientes</h2>
            </div>
            <div className="p-5">
              {topClientes.length === 0 && <p className="text-sm text-gray-500">Sem dados de clientes.</p>}
              {topClientes.length > 0 && (
                <ul className="space-y-3">
                  {topClientes.map((item, index) => (
                    <li
                      key={`${item.nome}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.nome}</p>
                        <p className="text-sm text-gray-500">{formatWeight(item.peso_total_kg)} comprados</p>
                      </div>
                      <p className="font-semibold text-green-700">{formatCurrencyBRL(item.valor_total)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
